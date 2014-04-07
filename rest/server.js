'use strict';

var http = require('http'),
  nconf = require('nconf'),
  discover = require('./lib/deployment'),
  app = require('./index'),
  express = require('express'),
  server = http.createServer(app);

require(__dirname + '/config.js');

discover(nconf.get('seed'), function(){});

app.set('io', require('socket.io').listen(server));

require('./lib/token')(app);
require('./lib/db-middleware')(app);
require('./lib/api')(app);

app.use(express.static(__dirname + '/ui'));

app.use(function(err, req, res, next){
  if(!err.http) return next(err);
  res.send(err.code, err.message);
});

module.exports = server;
