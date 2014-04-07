'use strict';

var app = require('./lib'),
  server = require('http').createServer(app);

module.exports = server;
