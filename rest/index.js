"use strict";

var express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  nconf = require('nconf'),
  MongoClient = require('mongodb').MongoClient,
  debug = require('debug')('mg:mongorest'),
  _ = require('underscore'),
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
    mongo: {
      default: 'mongodb://localhost',
      desc: 'connection url for a mongo instance'
    },
    url: {
      default: 'http://127.0.0.1:3000',
      desc: 'host:port for rest to listen on'
    }
  }
});

// Validate, correct and set any
function validate(){
  var url = app.get('url');
  if(!/^https?:\/\//.test(url)) url = 'http://' + url;
  var parsed = urllib.parse(url);
  ['href', 'port', 'hostname', 'protocol'].map(function(k){
    app.set(k, parsed[k]);
  });
  app.set('url', url);
}

function connect(){
  app.set('io', require('socket.io').listen(server));
  debug('connecting to mongod', app.get('mongo'));
  MongoClient.connect(app.get('mongo'), function(err, db){
    if(err) return console.log(err);
    app.set('db', db);
    middleware();
  });
}

function middleware(){
  app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.use(require('./lib/db-middleware')(app));
  require('./lib/api')(app);

  app.use(function(err, req, res, next){
    // handle http errors bubbled up from middlewares.
    if(!err.http) return next(err);
    res.send(err.code, err.message);
  });
  listen();
}

function listen(){
  app.get('server').listen(app.get('port'), function(){
    debug('listening', 'http://' + app.get('hostname') + ':' + app.get('port'));
    app.emit('ready', {host: app.get('hostname'), port: app.get('port')});
  });
}

module.exports = function(config){
  app.set(config);
  validate();
  connect();
};

module.exports.get = app.get;
module.exports.set = app.set;

