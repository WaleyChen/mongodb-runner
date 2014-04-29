var mongodb = require('mongodb'),
  MongoClient = mongodb.MongoClient,
  types = {url:  require('./monger/url')},
  store = require('./store'),
  sharding = require('./monger/sharding'),
  namer = require('./namer'),
  assert = require('assert'),
  debug = require('debug')('mongoscope:deployment'),
  os = require('os'),
  hostname = os.hostname().toLowerCase();

function generateId(seed, fn){
  fn(null, types.url(seed)._id);
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


  this._id = data._id;
  this.name = data.name;

  if(data.rs) this.rs = data.rs;
  if(data.shard) this.shard = data.shard;
  if(data.state) this.state = data.state;
  if(data.type) this.type = data.type;
}

Instance.prototype.toString = function(){
  return this._id;
};

Instance.TYPE = {
  ROUTER: 'router',
  ARBITER: 'arbiter',
  CONFIG: 'config'
};

Instance.prototype.getReplicationRole = function(){
  return this.state;
};

Instance.prototype.addConnection = function(id, conn){
  if(!this.connections) this.connections = {};

  this.connections[id] = conn;
  return this;
};

Instance.prototype.getConnection = function(id){
  if(!this.connections) return undefined;

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
  this.instances = data.instances;
  this.sharding = data.sharding;

  // @todo: perhaps another heuristic -> try and connect to
  // mongos0.<deployment domain>27017
  if(!data.sharding && data.instances.length > 1 && data.instances.filter(function(i){
      return i && /\d$/.test(i.rs);
    }).length > 0){
    this.maybe_sharded = true;
  }
  if(data.instances.length > 1){
    var shortened = namer(data.instances.map(function(i){
      return i._id;
    }));

    this.name = (this.sharding ? 'cluster' : 'replicaset') + ' on ' + shortened.sequence;
    shortened.names.map(function(s, i){
      this.instances[i].name = s;
    }.bind(this));
  }
}
Deployment.prototype.getSeedConnection = function(fn){
  var url = this.seed;
  if(url.indexOf('mongodb://') === -1){
    url = 'mongodb://' + url;
  }
  connect(url, fn);
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
  if(typeof seed === 'number'){
    seed = 'localhost:' + seed;
  }
  assert(typeof seed === 'string');

  seed = seed.replace('localhost', hostname);

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
      debug('generated id', id);
      data._id = id;

      discover(conn, function(err, res){
        if(err) return fn(err);

        data.auth = auth;
        data.instances = res.instances.map(Instance);
        data.sharding = res.sharding;

        var deployment = new Deployment(data);
        conn.close();
        debug('saving', deployment);
        assert(deployment._id);
        store.set(deployment._id, deployment, function(){
          debug('saved to store');
          return fn(null, deployment);
        });
      });
    });
  });
};

Deployment.prototype.createSession = function(session_id, url, fn){
  var instance = this.getInstance(Deployment.getId(url));
  if(!instance) return fn(new Error('No instance with url `'+url+'`'));
  connect(url, function(err, conn){
    if(err) return fn(err);

    instance.addConnection(session_id, conn);
    fn();
  });
};

Deployment.getId = function(id){
  id = id.replace('localhost', hostname).replace('mongodb://', '');
  return id;
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
  var instances = [],
    conn = db.serverConfig;

  function add(){
    var args = Array.prototype.slice.call(arguments, 0);
    if(Array.isArray(args[0])){
      args = args[0];
    }
    instances.push.apply(instances, args);
  }

  if(conn.isMongos()){
    return sharding(db, function(err, info){
      if(err) return fn(err);
      fn(null, {instances: info.instances, sharding: info.databases});
    });
  }
  // We're in a replset
  else if(conn._state.secondaries){
    var rs = conn._state.replset.options.rs_name,
      state = conn._state;

    debug('its a replicaset', rs);

    add(Object.keys(state.secondaries).map(function(hp){
      return types.url(hp).rs(rs).state('secondary').toJSON();
    }));

    add(Object.keys(state.arbiters).map(function(hp){
      return types.url(hp).rs(rs).type('arbiter').toJSON();
    }));

    add(Object.keys(state.passives).map(function(hp){
      return types.url(hp).rs(rs).type('passive');
    }));

    add(types.url(state.master.name).rs(rs).state('primary').toJSON());
  }
  else {
    var p = conn.socketOptions;
    add(types.url(p.host + ':' + p.port).toJSON());
  }
  debug('discovered instances', instances.map(function(i){
    return i._id;
  }));
  fn(null, {instances: instances});
}

module.exports = Deployment;

module.exports.all = function(fn){
  store.find({}, function(err, docs){
    debug('store find all got', err, docs);
    fn(err, docs);
  });
};
