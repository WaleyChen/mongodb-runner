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
    connect: {
      default: 'mongodb://scopey:scopey@localhost',
      desc: 'connection uri for a mongo instance'
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

function connect(){
  app.set('io', require('socket.io').listen(server));
  app.set('connect', 'mongodb://scopey:scopey@localhost');

  debug('connecting to mongod', app.get('connect'));
  MongoClient.connect(app.get('connect'), function(err, db){
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
  require('./lib/ui')(app);

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
