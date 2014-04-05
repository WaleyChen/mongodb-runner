'use strict';

var connect = require('mongodb').MongoClient;

module.exports = function discover(seed, fn){
  var deployment = new Deployment(seed);

  connect(seed, function(err, db){
    if(err) return fn(err);
    if(!db) return fn(new Error('could not connect'));

    db.command({ismaster: true}, function(err, res){
      if(err) return fn(err);

      db.close();

      getSeedType(res, function(err, type){
        if(err) return fn(err);

        deployment.add(seed, type);

        if(type === 'standalone') return fn(null, deployment);

        // current primary member of the replica set
        deployment.add(res.primary, 'primary');

        // members that are neither hidden, passive, nor arbiters
        deployment.add(res.hosts, 'secondary');

        // members which have a priority of 0.
        deployment.add(res.passive, 'secondary');

        deployment.add(res.arbiters, 'arbiter');

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

module.exports.ping = function(uri, app){
  module.exports(uri, function(err, deployment){
    var existing = app.get('deployments');
    existing.map(function(deploy, i){
      if(deploy.seed === deployment.seed){
        existing[i] = deployment;
      }
    });
    app.set('deployments', existing);
  });
};

function Deployment(seed){
  this.seed = seed;
  this.hosts = {};
}
Deployment.prototype.hosts = {};
Deployment.prototype.add = function(uri, type){
  if(Array.isArray(uri)){
    return uri.map(function(_uri){
      return this.add(_uri, type);
    }.bind(this));
  }

  if(this.hosts[uri]) return false;

  var instance = new Instance(uri, type);
  this.hosts[uri] = instance;
  return true;
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
