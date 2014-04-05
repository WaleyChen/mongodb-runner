"use strict";

var express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  MongoClient = require('mongodb').MongoClient,
  debug = require('debug')('mg:rest'),
  _ = require('lodash'),
  urllib = require('url');

app.set = function(setting, val){
  if (1 == arguments.length){
    if(typeof setting === 'object'){
      _.each(arguments, function(setting){
        app.settings = _.extend(app.settings, setting);
      });
      return app;
    }
    return app.settings[setting];
  }
  app.settings[setting] = val;
  return app;
};

app.set({
  server: server,
  options: {
    seed: {
      default: 'mongodb://localhost:27017',
      desc: 'uri of a mongo instance to discover a deployment'
    },
    listen: {
      default: 'http://127.0.0.1:29017',
      desc: 'uri for rest server to listen on'
    }
  }
});

// Validate, correct and set any
function validate(){
  var listen = app.get('listen');
  if(!/^https?:\/\//.test(listen)) listen = 'http://' + url;
  var parsed = urllib.parse(listen);
  ['href', 'port', 'hostname', 'protocol'].map(function(k){
    app.set(k, parsed[k]);
  });
  app.set('listen', listen);
}

module.exports = function(config){
  app.set(config);
  validate();
  discover(app.get('seed'), function(err, deployment){
    app.set('deployments', [deployment]);
    app.set('io', require('socket.io').listen(server));

    app.use(function(req, res, next){
      req.deployments = app.get('deployments');
      req.io = app.get('io');


      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    });

    app.use(express.static(__dirname + '/../ui'));

    require('./lib/auth')(app);
    require('./lib/db-middleware')(app);
    require('./lib/api')(app);

    app.use(function(err, req, res, next){
      // handle http errors bubbled up from middlewares.
      if(!err.http) return next(err);
      res.send(err.code, err.message);
    });

    app.get('server').listen(app.get('port'), function(){
      debug('listening', 'http://' + app.get('hostname') + ':' + app.get('port'));
      app.emit('ready', {host: app.get('hostname'), port: app.get('port')});
    });
  });
};

module.exports.get = app.get;
module.exports.set = app.set;

// http://docs.mongodb.org/master/reference/command/isMaster/#output
// call `isMaster`
function discover(seed, fn){
  var deployment = new Deployment(seed);

  MongoClient.connect(seed, function(err, db){
    if(err) return fn(err);
    if(!db) return fn(new Error('could not connect'));

    db.command({ismaster: true}, function(err, res){
      if(err) return fn(err);

      db.close();

      getSeedType(res, function(err, type){
        if(err) return fn(err);

        deployment.add(seed, type);

        if(type === 'standalone') return fn(null, deployment);

        // isMaster.primary
        // A string in the format of "[hostname]:[port]" listing the current
        // primary member of the replica set.
        deployment.add(res.primary, 'primary');

        // isMaster.hosts
        // An array of strings in the format of "[hostname]:[port]" that lists
        // all members of the replica set that are neither hidden, passive, nor
        // arbiters.
        deployment.add(res.hosts, 'secondary');

        // isMaster.passives
        // An array of strings in the format of "[hostname]:[port]" listing
        // all members of the replica set which have a priority of 0.
        deployment.add(res.hosts, 'secondary');

        // isMaster.arbiters
        // An array of strings in the format of "[hostname]:[port]" listing
        // all members of the replica set that are arbiters.
        deployment.add(res.hosts, 'arbiter');

        return fn(null, deployment);
      });
    });
  });
}

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
