'use strict';

var express = require('express'),
  app = module.exports = express(),
  nconf = require('nconf');

app.use(function(req, res, next){
  req.io = app.get('io');

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.start = function(){
  var up = require('up'),
    http = require('http');

  require(__dirname + '/config.js');

  var file = __dirname + '/server.js',
    // numWorkers = require('os').cpus().length,
    numWorkers = 1,
    workerTimeout = null,
    keepAlive = true;

  console.log(nconf.get('port'));

  var httpServer = http.Server().listen(nconf.get('port'));
  app.srv = up(httpServer, file, {
    numWorkers: numWorkers,
    workerTimeout: workerTimeout,
    keepAlive: keepAlive
  });
};

app.reload = function(){
  app.srv.reload();
};
