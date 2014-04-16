var MongoClient = require('mongodb').MongoClient,
  nconf = require('nconf'),
  debug = require('debug')('mongoscope:deployment');

var store_data = {},
  store_keys = [];

var store = module.exports.store = {
  keys: function(fn){
    fn(null, store_keys);
  },
  get: function(key, fn){
    fn(null, store_data[key]);
  },
  remove: function(key, fn){
    delete store_data[key];
    store_keys.splice(store_keys.indexOf(key), 1);
    return fn();
  },
  find: function(query, fn){
    var keys = Object.keys(query);
    if(keys.length === 0){
      return fn(null, store_keys.map(function(k){
        return store_data[k];
      }));
    }

    var docs = [];
    store_keys.map(function(k){
      var item = store_data[k];

      keys.every(function(_k){
        if(item[_k]){
          docs.push(item);
        }
      });
    });
    fn(null, docs);
  },
  clear: function(fn){
    debug('clearing deployment store');
    store.find({}, function(err, docs){
      if(err) return fn(err);
      if(docs.length === 0) return fn();

      var pending = docs.length;
      docs.map(function(doc){
        store.remove(doc._id, function(){
          pending--;
          if(pending === 0) return fn();
        });
      });
    });
  },
  set: function(key, val, fn){
    debug('store set', key);
    store_data[key] = val;
    store_keys.push(key);
    fn();
  }
};

module.exports.discover = function discover(seed, fn){
  var deployment = new Deployment(seed);
  debug('discovering ', seed);

  connect(seed, function(err, db){
    if(err) return fn(err);
    if(!db) return fn(new Error('could not connect'));

    debug('classifying nodes');
    db.command({ismaster: true}, function(err, res){
      if(err) return fn(err);

      getSeedType(res, function(err, type){
        if(err) return fn(err);

        debug('seed has type', type);

        deployment.instances = {};

        deployment.add(seed, type);

        if(type !== 'standalone'){
          // current primary member of the replica set
          deployment.add(res.primary, 'primary');

          // members that are neither hidden, passive, nor arbiters
          deployment.add(res.hosts, 'secondary');

          // members which have a priority of 0.
          deployment.add(res.passive, 'secondary');

          deployment.add(res.arbiters, 'arbiter');
        }
        deployment.db = db;

        store.set(deployment._id, deployment, function(){
          return fn(null, deployment);
        });
      });
    });
  });
};

function getSeedType(res, fn){
  // isMaster.ismaster
  // A boolean value that reports when this node is writable. If true,
  // then this instance is a primary in a replica set, or a master in a
  // master-slave configuration, or a mongos instance, or a standalone
  // mongod.  This field will be false if the instance is a secondary
  // member of a replica set or if the member is an arbiter of a replica
  // set.
  if(res.ismaster === true){
    // isMaster.msg
    // Contains the value isdbgrid when isMaster returns from a mongos instance.
    if(res.msg === 'isdbgrid'){
      return fn(null, 'router');
    }

    if(res.setName){
      return fn(null, 'primary');
    }

    return fn(null, 'standalone');
  }


  // isMaster.arbiterOnly
  // A boolean value that , when true, indicates that the current instance
  // is an arbiter. The arbiterOnly field is only present, if the instance
  // is an arbiter.
  if(res.arbiterOnly){
    return fn(null, 'arbiter');
  }

  // isMaster.passive
  // A boolean value that, when true, indicates that the current instance
  // is hidden. The passive field is only present for hidden members.
  //
  // isMaster.hidden
  // A boolean value that, when true, indicates that the current instance
  // is hidden. The hidden field is only present for hidden members.
  //
  // isMaster.secondary
  // A boolean value that, when true, indicates if
  // the mongod is a secondary member of a replica set.
  if(res.passive || res.hidden || res.secondary){
    return fn(null, 'secondary');
  }
}

module.exports.all = function(fn){
  store.find({}, fn);
};

// Find a deployment with just a host:port `uri`
module.exports.get = function(uri, fn){
  var _id = getId(uri);

  store.get(_id, function(err, res){
    if(err) return fn(err);
    if(res) return fn(null, res);

    store.find({instances: _id}, function(err, docs){
      if(err) return fn(err);
      fn(null, docs[0]);
    });
  });
};

var connect = module.exports.connect = function(uri, fn){
  debug('connecting to', uri);
  MongoClient.connect(uri, {authSource: 'admin'}, fn);
};

function getId(uri){
  return uri;
}

var connections = {},
  reapers = {};

function Deployment(seed){
  seed = seed.replace('mongodb://', '');

  this.seed = seed;
  this.instances = {};
  this._id = getId(seed);
  this.name = '';

  reapers[this._id] = {};
  connections[this._id] = {};
}

Deployment.prototype.ping = function(){
  debug('ping', this._id);
  module.exports(this.seed, function(){});
  return this;
};

Deployment.prototype.add = function(uri, type){
  if(Array.isArray(uri)){
    uri.map(function(_uri){
      return this.add(_uri, type);
    }.bind(this));
    return this;
  }

  var _id = Instance.getId(uri.replace('mongodb://', ''));

  if(this.instances[_id]){
    debug('already have instance', _id);
    return this;
  }

  debug('add instance', uri, type);

  var instance = new Instance(uri, type);
  this.instances[_id] = instance;
  return this;
};

Deployment.prototype.connection = function(token, db){
  if(arguments.length === 1) return connections[this._id][token];

  connections[this._id][token] = db;
  // Set a timeout to reap the connection a little after the token
  // is supposed to expire.
  if(reapers[this._id][token]) clearTimeout(reapers[this._id][token]);

  var self = this;

  reapers[this._id][token] = setTimeout(function(){
    if(connections[self._id][token]){
      delete connections[self._id][token];
      debug('reaped connection for token', token);
    }
  }, nconf.get('token:lifetime') * 60 * 1000 + 1000);
  return this;
};


function Instance(uri, type){
  this.uri = uri.replace('mongodb://', '');
  this.type = type;
}

Instance.getId = function(v){
  return v;
};
Instance.prototype.uri = 'localhost:27017';

Instance.prototype.type = 'standalone';
Instance.prototype.type = 'secondary';
Instance.prototype.type = 'primary';
Instance.prototype.type = 'arbiter';
Instance.prototype.type = 'router';

// @note: other types that are maybe on a higher level?
// Instance.prototype.type = 'shard';
// Instance.prototype.type = 'config';
// Instance.prototype.type = 'shardprimary';

// A document that lists any tags assigned to this member. This field is
// only present if there are tags assigned to the member. See Configure
// Replica Set Tag Sets for more information.
// Instance.prototype.tags = [];
