'use strict';

var MongoClient = require('mongodb').MongoClient,
  nconf = require('nconf'),
  debug = require('debug')('mg:rest:deployment'),
  store = {};

store._keys = [];

store.keys = function(){
  return store._keys;
};
store.set = function(key, val, fn){
  store[key] = val;
  store._keys.push(key);
  fn();
  return store;
};

module.exports.discover = function discover(seed, fn){
  var deployment = new Deployment(seed);
  debug('discovering ' + seed);

  connect(seed, function(err, db){
    debug('connection error?', err);

    if(err) return fn(err);
    if(!db) return fn(new Error('could not connect'));

    debug('checking isMaster');
    db.command({ismaster: true}, function(err, res){
      debug('command error?', err);
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

        debug('putting in store', deployment._id);
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

module.exports.all = function(){
  debug('all keys', store.keys());
  return store.keys().map(function(_id){
    return store[_id];
  });
};

// Find a deployment with just a host:port `uri`
module.exports.get = function(uri){
  var _id = getId(uri);
  debug('get', _id);
  if(store[_id]) return store[_id];

  var res = null;
  Object.keys(store).map(function(seed){
    if(!store[seed].instances){
      throw new Error('Bad deployment in store!');
    }
    if(store[seed].instances[_id]) res = store[seed];
  });
  return res;
};

var connect = module.exports.connect = function(uri, fn){
  debug('connect', uri);
  MongoClient.connect(uri, {}, fn);
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
