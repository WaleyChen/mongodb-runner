#!/usr/bin/env node
"use strict";

var yargs = require('yargs')
    .usage('The MongoDB Launcher\nUsage: mg')
    .example('mg', 'deploy all unicorns')
    .example('mg mongod', 'only start mongod')
    .example('mg mongorest', 'only start the rest server'),
  argv = yargs.argv,
  debug = require('debug')('mg'),
  apps = {
    'mongod': require('../rest/lib/mongod'),
    'mongorest': require('../rest')
  },
  all = Object.keys(apps),
  unknown = argv._.filter(function(name){
    return all.indexOf(name) === -1;
  });

if(argv.h){
  return yargs.showHelp();
}

function start(names){
  debug('starting ' + names.length + ' apps....');
  var prev = apps[names.shift()].start();

  names.map(function(name){
    if(prev){
      debug('waiting until previous app says it is ready...');
      prev.on('ready', function(){
        debug('starting ' + name);
        prev = apps[name].start();
      });
    }
  });
}

if(unknown.length > 0){
  console.error('cant start what we dont know: ' + unknown);
  return process.exit(1);
}
else if(argv._.length === 0){
  return start(all);
}
else {
  start(argv._);
}
