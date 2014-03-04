#!/usr/bin/env node
"use strict";

process.env.NODE_ENV = 'development';

var nconf = require('nconf'),
  connect = require('mongodb').MongoClient.connect,
  app = require('../'),
  debug = require('debug')('mongorest');

nconf.env().argv().defaults({
  'url': 'mongodb://localhost',
  'use': ['log', 'top', 'api'],
  'port': 3000,
  'host': '127.0.0.1'
});

app.configure(function(){
  app.set('io', app.io);
  debug('trying to connect to', nconf.get('url'));
  connect(nconf.get('url'), {}, function(err, db){
    if(!db && !db.connected) throw new Error('cannot connect to mongod ' + nconf.get('url'));
    app.set('db', db);

    app.use(function(req, res, next){
      req.mongo = db;
      next();
    });

    debug('connected to mongod');

    nconf.get('use').map(function(name){
      require('../' + name).routes(app);
    });
  });
});

app.server.listen(nconf.get('port'), function(){
  debug('listening', 'http://' + nconf.get('host') + ':' + nconf.get('port'));
});
