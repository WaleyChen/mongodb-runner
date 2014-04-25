var mongodb = require('mongodb'),
  MongoClient = mongodb.MongoClient,
  types = {url:  require('./monger/url')},
  store = require('./store'),
  sharding = require('./monger/sharding'),
  namer = require('./namer'),
  debug = require('debug')('mongoscope:deployment');

function generateId(seed, fn){
  fn(null, types.url(seed).id);
}

function connect(uri, fn){
  debug('connecting to', uri);
  MongoClient.connect(uri, function(err, db){
    if(err){
      debug('error connecting to ' + uri, err);
      return fn(err);
    }
    debug('got connection');
    return fn(null, db);
  });
}

function Instance(data){
  if(!(this instanceof Instance)) return new Instance(data);
  this._url = types.url(data.url);
  this._id = this._url.id;
  this.name = this._url.name;
  this.url = this._url.toString();
  this.rs = data.rs;
  this.shard = data.shard;
  this.state = data.state;

  this.type = data.type;
  this.connections = {};
}

Instance.TYPE = {
  ROUTER: 'router',
  ARBITER: 'arbiter',
  CONFIG: 'config'
};

Instance.prototype.getReplicationRole = function(){
  return this.state;
};

Instance.prototype.addConnection = function(id, conn){
  this.connections[id] = conn;
  return this;
};

Instance.prototype.getConnection = function(id){
  return this.connections[id];
};

// If it doesn't have a type, it's a vanilla mongod.
// This way we don't have to get into a bunch of semantics
// for all of the different deployment configurations.
Instance.prototype.isSpecial = function(){
  return Boolean(this.type);
};

Instance.prototype.isRouter = function(){
  return this.type === Instance.TYPE.ROUTER;
};


// The wrapper around mongoscopes core resource.
//
// The schema of `data` looks something like:
//
// ```
// _id: Number, // autoinc, guid, or seed?
// seed: Url,
// name: String,
// instances: [Instance],
// sharding: {
//   ns_collection: [shard_key_specs],
// }
// ```
function Deployment(data){
  if(!(this instanceof Deployment)) return new Deployment(data);
  this._id = data._id;
  this.seed = data.seed;
  this.name = data.name;
  this.instances = data.instances ? data.instances.map(Instance) : [];
  this.sharding = data.sharding;

  // @todo: perhaps another heuristic -> try and connect to
  // mongos0.<deployment domain>27017
  if(!data.sharding && data.instances.length > 1 && data.instances.filter(function(i){
      return i && /\d$/.test(i.rs);
    }).length > 0){
    this.maybe_sharded = true;
  }
  if(data.instances.length > 0){
    var names = data.instances.map(function(i){
      return i.name;
    });

    var shortened = namer(names);
    this.displayName = shortened.sequence;
    shortened.names.map(function(s, i){
      this.instances[i].displayName = s;
    }.bind(this));
  }
}
Deployment.prototype.getSeedConnection = function(fn){
  connect(this.seed, fn);
};
Deployment.prototype.getInstance = function(spec){
  if(typeof spec !== 'object'){
    spec = {_id: spec};
  }

  var k = Object.keys(spec), res;
  this.instances.map(function(i){
    if(i[k] === spec[k]){
      res = i;
    }
  });
  return res;
};

// @todo: implement connection reapers.
//
// Deployment.prototype.connection = function(token, db){
//   if(arguments.length === 1) return connections[this._id][token];

//   connections[this._id][token] = db;
//   // Set a timeout to reap the connection a little after the token
//   // is supposed to expire.
//   if(reapers[this._id][token]) clearTimeout(reapers[this._id][token]);

//   var self = this;

//   reapers[this._id][token] = setTimeout(function(){
//     if(connections[self._id][token]){
//       delete connections[self._id][token];
//       debug('reaped connection for token', token);
//     }
//   }, nconf.get('token:lifetime') * 60 * 1000 + 1000);
//   return this;
// };

Deployment.create = function(seed, fn){
  var data = {
    seed: seed,
    name: '',
    _id: -1,
    instances: []
  },
  auth = types.url(seed).auth;

  connect(types.url(seed).url, function(err, conn){
    if(err) return fn(err);
    if(!conn) return fn(new Error('could not connect'));

    data.name = types.url(seed).name;

    generateId(seed, function(err, id){
      if(err) return fn(err);

      data._id = id;

      discover(conn, function(err, res){
        if(err) return fn(err);

        data.auth = auth;
        data.instances = res.instances.map(Instance);
        data.sharding = res.sharding;

        var deployment = new Deployment(data);
        conn.close();
        store.set(deployment._id, deployment, function(){
          debug('saved to store', deployment);
          return fn(null, deployment);
        });
      });
    });
  });
};

Deployment.prototype.createSession = function(id, url, fn){
  // var instance = this.getInstance({url: url});
  var instance = this.instances[0];

  connect(url, function(err, conn){
    if(err) return fn(err);

    instance.addConnection(id, conn);
    fn();
  });
};

Deployment.get = function(id, fn){
  var deployment;
  store.get(id, function(err, dep){
    deployment = dep;

    if(err || deployment) return fn(err, deployment);

    module.exports.all(function(err, docs){
      if(err) return fn(err);

      docs.map(function(doc){
        doc.instances.map(function(instance){
          if(instance._id === id && !deployment){
            deployment = doc;
          }
        });
      });
    });
    fn(null, deployment);
  });
};

Deployment.prototype.getType = function(){
  if(Boolean(this.sharding)){
    return Deployment.TYPE.CLUSTER;
  }
  if(this.instances.filter(function(i){return Boolean(i.rs);}).length > 0){
    return Deployment.TYPE.REPLICASET;
  }
  return Deployment.TYPE.STANDALONE;
};

Deployment.prototype.getConnection = function(id, fn){
  var found = false;
  this.instances.map(function(i){
    i.getConnection(id, function(err, conn){
      if(conn && !found){
        found = true;
        return fn(null, conn);
      }
    });
  });
};

Deployment.prototype.isStandalone = function(){
  return this.getType() === Deployment.TYPE.STANDALONE;
};

Deployment.prototype.hasSharding = function(){
  return this.getType() === Deployment.TYPE.CLUSTER;
};

Deployment.prototype.hasReplication = function(){
  return [
    Deployment.TYPE.CLUSTER,
    Deployment.TYPE.REPLICASET
  ].indexOf(this.getType()) > -1;
};

Deployment.TYPE = {
  STANDALONE: 'standalone',
  REPLICASET: 'replicaset',
  CLUSTER: 'cluster'
};

// Weave our way through to find all of the instances in a deployment.
// @todo: handle dynamic updates...
function discover(db, fn){
  var members = [];

  var conn = db.serverConfig;

  if(conn.isMongos()){
    var router = types.url(conn.socketOptions.host + ':' + conn.socketOptions.port).toJSON();
    router.type = 'router';

    return sharding(db, function(err, info){
      if(err) return fn(err);
      debug('sharding info', info);

      members.push(router);
      members.push.apply(members, info.instances);

      fn(null, {instances: members, sharding: info.databases});
    });
  }
  // We're in a replset
  else if(conn._state.secondaries){
    var rs = conn._state.replset.options.rs_name;
    debug('its a replicaset', rs);

    members.push.apply(members, Object.keys(conn._state.secondaries).map(function(name){
      return {
        rs: rs,
        name: name,
        state: 'secondary',
        url: 'mongodb://' + name
      };
    }));

    members.push.apply(members, Object.keys(conn._state.arbiters).map(function(name){
      return {
        rs: rs,
        name: name,
        type: 'arbiter',
        url: 'mongodb://' + name
      };
    }));

    members.push.apply(members, Object.keys(conn._state.passives).map(function(name){
      return {
        rs: rs,
        name: name,
        type: 'passive',
        url: 'mongodb://' + name
      };
    }));

    members.push({
        rs: rs,
        name: conn._state.master.name,
        state: 'primary',
        url: 'mongodb://' + conn._state.master.name
      });
  }
  else {
    members.push({name: conn.socketOptions.host + ':' + conn.socketOptions.port,
      url: 'mongodb://' + conn.socketOptions.host + ':' + conn.socketOptions.port});
  }
  debug('discovered instances', members);
  fn(null, {instances: members});
}

module.exports = Deployment;

module.exports.all = function(fn){
  store.find({}, function(err, docs){
    debug('store find all got', err, docs);
    fn(err, docs);
  });
};
