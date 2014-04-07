'use strict';

var MongoClient = require('mongodb').MongoClient,
  nconf = require('nconf'),
  debug = require('debug')('mg:rest:deployment'),
  store = {};

module.exports = function discover(seed, fn){
  var deployment = store[seed] || new Deployment(seed);
  debug('descovering ' + seed);

  MongoClient.connect(seed, function(err, db){
    if(err) return fn(err);
    if(!db) return fn(new Error('could not connect'));

    db.command({ismaster: true}, function(err, res){
      if(err) return fn(err);

      db.close();

      getSeedType(res, function(err, type){
        if(err) return fn(err);

        deployment.instances = {};

        deployment.add(seed, type);

        if(type === 'standalone') return fn(null, deployment);

        // current primary member of the replica set
        deployment.add(res.primary, 'primary');

        // members that are neither hidden, passive, nor arbiters
        deployment.add(res.hosts, 'secondary');

        // members which have a priority of 0.
        deployment.add(res.passive, 'secondary');

        deployment.add(res.arbiters, 'arbiter');

        store[seed] = deployment;

        return fn(null, deployment);
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
  return Object.keys(store).map(function(seed){
    return store[seed];
  });
};

// Find a deployment with just a host:port `uri`
module.exports.get = function(uri){
  if(store[uri]) return store[uri];

  var res = null;
  Object.keys(store).map(function(seed){
    if(store[seed].instances[uri]) res = store[seed];
  });
  return res;
};

function Deployment(seed){
  this.seed = seed;
  this.instances = {};
  this.id = '';
  this.name = '';

  // token -> active connection
  this.connections = {};
}

Deployment.prototype.ping = function(){
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

  if(this.instances[uri]) return this;

  var instance = new Instance(uri, type);
  this.instances[uri] = instance;
  return this;
};

Deployment.prototype.connection = function(token, db){
  if(arguments.length === 1) return this.connections[token];

  this.connections[token] = db;
  // Set a timeout to reap the connection a little after the token
  // is supposed to expire.
  if(this.reapers[token]) clearTimeout(this.reapers[token]);

  var self = this;

  this.reapers[token] = setTimeout(function(){
    if(self.connections[token]){
      delete self.connections[token];
      debug('reaped connection for token', token);
    }
  }, nconf.get('token:lifetime') * 60 * 1000 + 1000);
  return this;
};


function Instance(uri, type){
  this.uri = uri;
  this.type = type;
}
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
