var async = require('async'),
  types = {
    url: require('./url'),
    ns: require('mongodb-ns')
  },
  debug = require('debug')('monger:sharding');

// Use case: Shard Distribution
//  def: document count and size by chunk and by shard
//
// mongos> db.users.getShardDistribution()
// Shard clusterco-rs0 at clusterco-rs0/Lucass-MacBook-Air.local:31100,Lucass-MacBook-Air.local:31101,Lucass-MacBook-Air.local:31102
//  data : 48B docs : 1 chunks : 1
//  estimated data per chunk : 48B
//  estimated docs per chunk : 1
// Totals
//  data : 48B docs : 1 chunks : 1
//  Shard clusterco-rs0 contains 100% data, 100% docs in cluster, avg obj size on shard : 48B
//
// stats = collection.stats()
// shardStats = stats.shards[shard._id]
// chunks = config.chunks.find({ _id : sh._collRE( this ), shard : shard }).toArray()
// estChunkData = shardStats.size / chunks.length
// estChunkCount = Math.floor( shardStats.count / chunks.length )
//
//
// estDataPercent = Math.floor( shardStats.size / stats.size * 10000 ) / 100
// estDocPercent = Math.floor( shardStats.count / stats.count * 10000 ) / 100
//
// Shard: shard._id
// data_size : " + sh._dataFormat( shardStats.size
// documents_total : " + shardStats.count
// chunks_total : " +  chunks.length
// Estimates per chunk:
// data_percent: Math.floor( shardStats.size / stats.size * 10000 ) / 100
// documents_percent: Math.floor( shardStats.count / stats.count * 10000 ) / 100
// document_size_average: stats.shards[ shard ].avgObjSize
//
// Collection Summary:
// data : " + stats.size
// docs : " + stats.count
// chunks : " +  numChunks

function Sharding(db){
  this.db = db.db('config');
  this.data = {
    settings: {},
    instances: [],
    collections: []
  };
}

Sharding.prototype.prepare = function(fn){
  var self = this;
  async.parallel([
    this.version.bind(this),
    this.settings.bind(this),
    this.databases.bind(this)
  ], function(err){
    if(err) return fn(err);

    self.db.collection('mongos').find({}).toArray(function(err, docs){
      if(err) return fn(err);

      docs.map(function(doc){
        self.data.instances.push(types.url(doc._id).type('router').toJSON());
      });

      fn(null, self.data);
    });
  });
};

Sharding.prototype.version = function(fn){
  this.db.collection('version').find({}).toArray(function(err, data){
    if(err) return fn(err);
    this.data.version = data && data[0];
    fn(err);
  }.bind(this));
};

Sharding.prototype.settings = function(fn){
  var self = this;

  self.db.collection('settings').find({}).toArray(function(err, docs){
    if(err) return fn(err);

    self.data.settings = {};
    docs.map(function(doc){
      self.data.settings[doc._id] = doc.value;
    });
    fn();
  });
};

Sharding.prototype.changelog = function(fn){
  this.db.collection('changelog').find({}).toArray(fn);
};

Sharding.prototype.locks = function(fn){
  this.db.collection('locks').find({}).toArray(fn);
};

Sharding.prototype.lockpings = function(fn){
  this.db.collection('lockpings').find({}).toArray(fn);
};

Sharding.prototype.databases = function(fn){
  var self = this;

  self.db.collection('databases').find({}).sort({name : 1}).toArray(function(err, data){
    if(err) return fn(err);
    self.data.databases = data;
    async.parallel(data.map(function(database){
      return function(done){
        var q = {_id : new RegExp('^' + database._id + '\\.')};
        self.db.collection('collections').find(q).sort({_id : 1}).toArray(function(err, collections){
          async.parallel(collections.map(function(coll){
            return function(cb){
              self.getCollectionDetails(coll, cb);
            };
          }), done);
        });
      };
    }), fn);
  });
};

Sharding.prototype.getCollectionDetails = function(coll, fn){
  var ns = types.ns(coll._id),
    self = this,
    shards = {},
    res = {
      _id: coll._id,
      sharded: false,
      shard_key: coll.key,
      stats: {},
      tags: [],
      shards: {}
    };

  function getStats(done){
    self.db.db(ns.database).command({collStats: ns.collection}, function(err, data){
      if(err) return done(err);
      res.sharded = data.sharded;
      shards = data.shards;

      res.stats = {
        index_sizes: data.indexSizes,
        document_count: data.count,
        document_size: data.size,
        storage_size: data.storageSize,
        index_count: data.nindexes,
        index_size: data.totalIndexSize,
        extent_count: data.numExtents,
        chunks_count: data.nchunks
      };

      done();
    });
  }

  function getChunks(done){
    self.db.collection('chunks').find({"ns" : coll._id}).sort( { min : 1 } ).toArray(function(err, data){
      if(err) return fn(err);

      data.map(function(doc){
        var chunk = {
          _id: doc._id,
          last_modified_on: new Date(doc.lastmodEpoch.getTimestamp().getTime() + (doc.lastmod.high_ * 1000)),
          keyspace: [doc.min, doc.max]
        };

        res.shards[doc.shard].chunks.push(chunk);
      });
      done();
    });
  }

  function getTags(done){
    self.db.collection('tags').find( { ns : coll._id } ).sort( { min : 1 } ).toArray(function(err, data){
      res.tags = data;
      done();
    });
  }

  function getShardDetail(shard_id, done){
    res.shards[shard_id] = {
      chunks: [],
      stats: {}
    };

    if(shards[shard_id]){
      res.shards[shard_id].stats = {
        index_sizes: shards[shard_id].indexSizes,
        document_count: shards[shard_id].count,
        document_size: shards[shard_id].size,
        storage_size: shards[shard_id].storageSize,
        index_count: shards[shard_id].nindexes,
        index_size: shards[shard_id].totalIndexSize,
        extent_count: shards[shard_id].numExtents,
        extent_last_size: shards[shard_id].lastExtentSize,
        padding_factor: shards[shard_id].paddingFactor
      };
    }
    else {
      res.shards[shard_id].stats = {
        index_sizes: {},
        document_count: 0,
        document_size: 0,
        storage_size: 0,
        index_count: 0,
        index_size: 0,
        extent_count: 0,
        extent_last_size: 0,
        padding_factor: 0
      };
    }

    self.db.collection('shards').find({_id: shard_id}).toArray(function(err, data){
      if(err) return done(err);

      res.shards[shard_id].instances = [];

      data.map(function(doc){
        var rs = doc.host.split('/')[0];
        doc.host.replace(rs + '/', '').split(',').map(function(h){
          var instance = types.url(h).shard(shard_id).toJSON();
          res.shards[shard_id].instances.push(instance);
          self.data.instances.push(instance);
        });
      });
      done();
    });
  }

  async.series([getStats, getTags], function(err){
    if(err) return fn(err);

    if(!res.sharded){
      self.data.collections[coll._id] = res;
      return fn();
    }


    self.db.collection('shards').find({}).toArray(function(err, docs){
      async.parallel(docs.map(function(doc){
        return function(cb){
          getShardDetail(doc._id, cb);
        };
      }), function(err){
        if(err) return fn(err);
        getChunks(function(err){
          if(err) return fn(err);

          delete res.sharded;

          res.shards = Object.keys(res.shards).map(function(k){
            res.shards[k]._id = k;
            return res.shards[k];
          });

          self.data.collections.push(res);
          fn();
        });
      });
    });
  });
};

module.exports = function(db, fn){
  return new Sharding(db).prepare(fn);
};

module.exports.instances = function(db, fn){
  new Sharding(db).prepare(function(err, info){
    return (err) ? fn(err) : fn(null, info.instances);
  });
};
