#!/usr/bin/env node

var nconf = require('nconf'),
  path = require('path'),
  debug = require('debug')('mongoscope:bin'),
  src = path.resolve(__dirname + '/../');

// @todo: lone needs to understand positional args, then we can use keepup
// here to run the server in a different proc and restart and log when
// it crashes.
debug('hello');
debug('running from', src);

require(src);

var deployment = require(__dirname + '/../lib/deployment');

// @todo: positional args for seeds.
deployment.discover(nconf.get('seed'), function(){

});
