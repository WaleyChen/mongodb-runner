var async = require('async'),
  types = {
    url: require('./url')
  },
  debug = require('debug')('monger:sharding');

function Sharding(db){
  this.db = db.db('config');
  this.data = {};
}

Sharding.prototype.prepare = function(fn){
  async.parallel([
    this.version.bind(this),
    this.shards.bind(this),
    this.databases.bind(this)
  ], function(err){
    fn(err, this.data);
  }.bind(this));
};

Sharding.prototype.version = function(fn){
  this.db.collection('version').find({}).toArray(function(err, data){
    debug('version result', err, data);
    if(err) return fn(err);
    this.data.version = data && data[0];
    fn(err);
  }.bind(this));
};

Sharding.prototype.shards = function(fn){
  this.db.collection('shards').find({}).sort({_id : 1}).toArray(function(err, data){
    debug('shards result', err, data);
    if(err) return fn(err);
    this.data.shards = data;
    this.data.instances = [];

    data.map(function(shard){
      var rs = shard.host.split('/')[0],
        hosts = shard.host.replace(rs + '/', '').split(',');

      hosts.map(function(h){
        var instance = types.url(h).toJSON();
        instance.rs = rs;
        instance.shard = shard._id;

        delete instance.auth;

        this.data.instances.push(instance);

      }.bind(this));
    }.bind(this));

    fn(err);
  }.bind(this));
};

Sharding.prototype.databases = function(fn){
  var self = this;

  self.db.collection('databases').find({}).sort({name : 1}).toArray(function(err, data){
    debug('databases result', err, data);

    if(err) return fn(err);
    self.data.databases = data;
    async.parallel(data.map(function(database){
      return function(cb){
        self.collections(database._id, cb);
      };
    }), fn);
  });
};

Sharding.prototype.collections = function(databaseId, fn){
  var self = this;

  this.db.collection('collections').find({
    _id : new RegExp('^' + databaseId + '\\.')
  }).sort({_id : 1}).toArray(function(err, collections){
    self.data.collections = {};

    var tasks = collections.map(function(coll){
      return function(cb){
        debug('collection', coll._id);
        var res = {
          _id: coll._id,
          shard_key: coll.key,
          chunks: [],
          chunks_total: 0,
          chunk_shards: [],
          tags: []
        };

        async.parallel([
          function(done){
            var query = [
              {"$match": { ns: coll._id }},
              {"$group": { _id: "$shard", nChunks: { "$sum": 1 }}}
            ];
            self.db.collection('chunks').aggregate(query, function(err, data){
              data.map(function(chunk){
                res.chunks_total += chunk.nChunks;
                res.chunks.push({_id: chunk._id, count: chunk.nChunks});
              });
              done();
            });
          },
          function(done){
          self.db.collection('chunks').find( { "ns" : coll._id } ).sort( { min : 1 } ).toArray(function(err, data){
            data.map(function(chunk){

              res.chunk_shards.push({
                _id: chunk._id,
                shard: chunk.shard,
                min: chunk.min,
                max: chunk.max,
                jumbo: chunk.jumbo
              });
            });
            done();
          });
        },
        function(done){
          self.db.collection('tags').find( { ns : coll._id } ).sort( { min : 1 } ).toArray(function(err, data){
            data.map(function(tag){
              res.tags.push(tag);
            });
            done();
          });
        }], function(err){
           debug('collection result', err, res);
           self.data.collections[coll._id] = res;
          cb(err);
        });
      };
    });
    async.parallel(tasks, fn);
  });
};

module.exports = function(db, fn){
  return new Sharding(db).prepare(fn);
};

module.exports.instances = function(db, fn){
  var s = new Sharding(db);
  s.shards(function(err, shards){
    if(err) return fn(err);

    // @todo: use types.url and return results of URL.toJSON().
    fn(null, shards);
  });
};

