'use strict';

var express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  discover = require('./lib/deployment'),
  debug = require('debug')('mg:rest'),
  _ = require('lodash'),
  urllib = require('url');

app.set = function(setting, val){
  if (1 === arguments.length){
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
  if(!/^https?:\/\//.test(listen)) listen = 'http://' + listen;
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
