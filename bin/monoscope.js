#!/usr/bin/env node

var nconf = require('nconf'),
  app = require(__dirname + '/../lib'),
  deployment = require('/../lib/deployment');

// @todo: positional args for seeds.
deployment.discover(nconf.get('seed'), function(){

});

app.start();
