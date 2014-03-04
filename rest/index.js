"use strict";

var express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  nconf = require('nconf'),
  connect = require('mongodb').MongoClient.connect,
  debug = require('debug')('mongorest:app');

nconf.env().argv().defaults({
  'url': 'mongodb://localhost',
  'use': ['log', 'top', 'api'],
  'port': 3000,
  'host': '127.0.0.1',
  'mongod': '/srv/mongo/bin/mongod',
  'mongod_dbpath': '/srv/mongo/data/'
});

module.exports = app;
module.exports.start = function(){
  app.set('io', io);
  debug('connecting', nconf.get('url'));
  connect(nconf.get('url'), {}, function(err, db){
    app.set('db', db);

    app.use(function(req, res, next){
      req.mongo = db;
      next();
    });

    debug('connected to mongod');

    nconf.get('use').map(function(name){
      require('./lib/' + name).routes(app);
    });

    app.server.listen(nconf.get('port'), function(){
      debug('listening', 'http://' + nconf.get('host') + ':' + nconf.get('port'));
    });
  });
};
module.exports.server = server;
module.exports.io = io;
