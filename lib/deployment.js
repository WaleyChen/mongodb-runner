var _ = require('lodash'),
  mongodb = require('mongodb'),
  MongoClient = mongodb.MongoClient,
  types = {url:  require('./monger/url')},
  store = require('./store'),
  sharding = require('./monger/sharding'),
  namer = require('./namer'),
  toTitleCase = require('titlecase'),
  assert = require('assert'),
  async = require('async'),
  debug = require('debug')('mongoscope:deployment'),
  os = require('os'),
  hostname = os.hostname().toLowerCase();

function generateId(seed, fn){
  fn(null, types.url(seed)._id);
}

function connect(url, fn){
  if(url.indexOf('mongodb://') === -1) url = 'mongodb://' + url;

  debug('connecting to', url);
  MongoClient.connect(url, function(err, db){
    if(err){
      debug('error connecting to ' + url, err);
      return fn(err);
    }
    debug('got connection');
    return fn(null, db);
  });
}

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
      return types.url(hp.replace('localhost', hostname)).rs(rs).state('secondary').toJSON();
    }));

    add(Object.keys(state.arbiters).map(function(hp){
      return types.url(hp.replace('localhost', hostname)).rs(rs).type('arbiter').toJSON();
    }));

    add(Object.keys(state.passives).map(function(hp){
      return types.url(hp.replace('localhost', hostname)).rs(rs).type('passive');
    }));

    add(types.url(state.master.name.replace('localhost', hostname)).rs(rs).state('primary').toJSON());
  }
  else {
    var p = conn.socketOptions;
    add(types.url(p.host.replace('localhost', hostname) + ':' + p.port).toJSON());
  }
  debug('discovered instances', instances.map(function(i){
    return i._id;
  }));
  fn(null, {instances: instances});
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

Instance.defaults = {
  // If undefined, mongod.
  // @todo: need to figure out what to call a mongod in the taxonomy.
  //
  // - router
  // - arbiter
  // - config
  type: undefined
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
  return this.type === 'router';
};

Instance.prototype.isConfig = function(){
  return this.type === 'config';
};


Instance.prototype.toJSON = function(){
  return {
    _id: this._id,
    name: this.name,
    url: this.url,
    type: this.type,
    state: this.state,
    rs: this.rs,
    shard: this.shard
  };
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

  this.maybe_sharded = this.isMaybeShard();
  this.generateNames();
}

Deployment.prototype.generateNames = function(){
  if(this.hasReplication()){
    var shortened = namer(this.getInstanceIds());

    this.name = (this.sharding ? 'cluster' : 'replicaset') + ' on ' + niceSubdomain(shortened.sequence);

    var seenByType = {};

    shortened.names.map(function(s, i){
      var instance = this.instances[i],
        type = instance.type || instance.shard || instance.state;

      if(!seenByType[type]) seenByType[type] = 0;
      seenByType[type]++;

      this.instances[i].name = type +'.'+ seenByType[type].toString();
    }.bind(this));
  }
  else {
    this.name = niceSubdomain(this._id);
    this.instances[0].name = this.name;
  }
};

Deployment.prototype.isMaybeShard = function(){
  if(this.sharding) return true;
  return (/\d$/.test((this.getRs() || '')));
};

// @returns {Array<String>}
Deployment.prototype.getInstanceIds = function(){
  return _.pluck(this.instances, '_id');
};

// One of:
//
// - cluster
// - replicaset
// - standalone
//
// @returns {String}
Deployment.prototype.getType = function(){
  if(Boolean(this.sharding)) return 'cluster';
  if(this.getRs()) return 'replicaset';
  return 'standalone';
};

Deployment.prototype.getRs = function(){
  return _.chain(this.instances).pluck('rs').compact().first().value();
};

// @callback {mongodb.Db} connection for the session
Deployment.prototype.getConnection = function(session_id, fn){
  var found = false;
  this.instances.map(function(i){
    i.getConnection(session_id, function(err, conn){
      if(conn && !found){
        found = true;
        return fn(null, conn);
      }
    });
  });
};

function niceSubdomain(s){
  return toTitleCase(s.split(':')[0].split('.')[0].replace(/-/g, ' '));
}

Deployment.prototype.createSession = function(session_id, url, fn){
  var instance = this.getInstance(Deployment.getId(url));
  if(!instance) return fn(new Error('No instance with url `'+url+'`'));
  connect(url, function(err, conn){
    if(err) return fn(err);

    instance.addConnection(session_id, conn);
    fn();
  });
};

Deployment.prototype.toJSON = function(){
  return {
    _id: this._id,
    name: this.name,
    seed: this.seed,
    sharding: this.sharding,
    maybe_sharded: this.maybe_sharded,
    instances: this.instances.map(function(i){return i.toJSON();})
  };
};

Deployment.prototype.isStandalone = function(){
  return this.getType() === 'standalone';
};

Deployment.prototype.hasSharding = function(){
  return this.getType() === 'cluster';
};

Deployment.prototype.hasReplication = function(){
  return ['cluster', 'replicaset'].indexOf(this.getType()) > -1;
};

Deployment.prototype.getSeedConnection = function(fn){
  var url = this.seed;
  if(url.indexOf('mongodb://') === -1) url = 'mongodb://' + url;
  connect(url, fn);
};

// Find an instance in this deployment
Deployment.prototype.getInstance = function(spec){
  if(typeof spec !== 'object'){
    spec = {_id: spec};
  }

  debug('getInstance', spec, this.instances);
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
  if(typeof seed === 'number') seed = 'localhost:' + seed;

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

        // @todo: chechek after discovering instances if there are
        // existing deployments to merge into the new one.
        // @todo: emit a create event to the client.
        var deployment = new Deployment(data);
        conn.close();

        debug('saving', deployment);
        assert(deployment._id);
        store.set(deployment._id, deployment, function(){
          debug('saved to store');
          debug('checking if any deployments need squashin');
          Deployment.squash(deployment, function(){
            return fn(null, deployment);
          });
        });
      });
    });
  });
};

Deployment.getId = function(id){
  assert(typeof id === 'string', id + ' should be a string.  sure you are passing the right doc key?');
  return id.toLowerCase().replace('localhost', hostname).replace('mongodb://', '');
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

Deployment.all = function(fn){
  store.find({}, function(err, docs){
    fn(err, docs);
  });
};

// Get a deployment where `seed` may be an existing
// or new instance or deployment id.
Deployment.resolve = function(seed, fn){
  seed = Deployment.getId(seed);
  Deployment.get(seed, function(err, deployment){
    if(err || deployment) return fn(err, deployment);

    // Perhaps an instance id?
    Deployment.all(function(err, res){
      if(err) return fn(err);

      // No deployments registered yet
      if(res.length === 0){
        debug('deployment store is empty');
        return fn();
      }

      var found = false;

      // Search through all instances
      res.map(function(deployment){
        if(!found && deployment.getInstance(seed)){
          found = true;
          debug('resolved ' + seed + ' as a member of ' + deployment.id);
          fn(null, deployment);
        }
      });

      if(!found){
        debug('could not resolve ' + seed + ' to an existing deployment or instance');
        fn();
      }
    });
  });
};

Deployment.squash = function(deployment, fn){
  debug('squashing old deployments that may share instances with', deployment._id);
  var ids = deployment.getInstanceIds(),
    squish = [];
  Deployment.all(function(err, docs){
    if(err) return fn(err);

    docs.map(function(doc){
      if(doc._id === deployment._id){
        return debug('skip primary deployment', deployment._id);
      }
      var res = doc.getInstanceIds().filter(function(id){
        return ids.indexOf(id);
      });

      if(res.length === 0){
        return debug('deployment ' + deployment._id + ' allowed to continue existence');
      }
      squish.push(doc);
    });

    if(squish.length === 0){
      debug('nothing to squish!');
      return fn();
    }

    debug('squishing', squish);
    async.parallel(squish.map(function(d){
      return function(cb){
        store.remove(d._id, function(err){
          debug('removed ' + d._id, arguments);
          cb(err);
        });
      };
    }), function(err){
      fn(err, squish);
    });
  });
};


module.exports = Deployment;
