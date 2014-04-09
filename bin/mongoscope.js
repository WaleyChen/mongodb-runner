#!/usr/bin/env node

var nconf = require('nconf'),
  src = __dirname + '/../lib',
  app = require(src),
  deployment = require(src + '/deployment');

// @todo: positional args for seeds.
deployment.discover(nconf.get('seed'), function(){

});

app.start();
