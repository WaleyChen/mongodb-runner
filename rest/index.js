"use strict";

var express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  nconf = require('nconf'),
  connect = require('mongodb').MongoClient.connect,
  debug = require('debug')('mg:app:app');

nconf.env().argv().defaults({
  'url': 'mongodb://localhost',
  'use': ['api'],
  'port': 3000,
  'host': '127.0.0.1',
  'mongod': '/srv/mongo/bin/mongod',
  'mongod_dbpath': '/srv/mongo/data/'
});

module.exports = app;
module.exports.start = function(){
  app.set('io', io);
  debug('waiting for connection', nconf.get('url'));
  connect(nconf.get('url'), {}, function(err, db){
    app.set('db', db);

    app.use(require('./lib/middleware')(db));

    debug('connected to mongod');

    nconf.get('use').map(function(name){
      require('./lib/' + name)(app);
    });

    app.use(function(err, req, res, next){
      // Handle http errors bubbled up from middlewares.
      if(!err.http) return next(err);
      res.send(err.code, err.message);
    });

    app.server.listen(nconf.get('port'), function(){
      debug('listening', 'http://' + nconf.get('host') + ':' + nconf.get('port'));
      app.emit('ready', {port: nconf.get('port')});
    });
  });
};
module.exports.server = server;
module.exports.io = io;
