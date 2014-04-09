#!/usr/bin/env node

var nconf = require('nconf'),
  path = require('path'),
  debug = require('debug')('mongoscope:bin'),
  src = path.resolve(__dirname + '/../lib');

debug('hello');
debug('running from', src);

var app = require(src),
  deployment = require(src + '/deployment');

// @todo: positional args for seeds.
deployment.discover(nconf.get('seed'), function(){

});

app.listen();
