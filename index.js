"use strict";
var nconf = require('nconf'),
  yargs = require('yargs'),
  debug = require('debug')('mg'),
  apps = {
    'mg': module.exports,
    'mongod': require('mongodmon'),
    'mongorest': require('./rest')
  },
  argv,
  opts = {
    mongorest: {
      url: {
        default: 'mongodb://localhost',
        desc: 'connection url for a mongo instance'
      },
      listen: {
        default: '127.0.0.1:3000',
        desc: 'host:port for rest to listen on'
      }
    },
    mongod: {
      bin: {
        default: '/srv/mongo/bin/mongod',
        desc: 'path to the mongod binary to monitor'
      },
      dbpath: {
        default: '/srv/mongo/data/',
        desc: 'data path'
      }
    }
  },
  defaults = {};

// convert for yargs to nconf schema
Object.keys(opts).map(function(app){
  defaults[app] = {};

  Object.keys(app).map(function(k){
    defaults[app][k] = opts[app][k].default;
  });
});

nconf.env().argv().defaults(opts);

module.exports.mg = function(){
  argv = yargs
    .usage('The MongoDB Launcher\nUsage: mg')
    .example('mg', 'deploy all unicorns')
    .example('mg mongod', 'only start mongod')
    .example('mg mongorest', 'only start the rest server').argv;

  if(argv.h) return yargs.showHelp();

  var names = ['mongod', 'mongorest'], prev;

  debug('starting ' + names.length + ' apps....');
  prev = apps[names.shift()].start();

  names.map(function(name){
    if(prev){
      debug('waiting until previous app says it is ready...');
      prev.on('ready', function(){
        debug('starting ' + name);
        prev = apps[name].start();
      });
    }
  });
};

module.exports.mongorest = function(){
  argv = yargs
    .usage('Start mongod in the foreground\nUsage: mg mongorest [options]')
    .example('mg mongod --listen=localhost:8080',
      'set any options to passthrough')
    .options(opts.mongorest).argv;

  if(argv.h) return yargs.showHelp();

  nconf.overrides({mongorest: argv});
  apps.mongorest.start();
};

module.exports.mongod = function(){
  argv = yargs
    .usage('Start mongod in the foreground\nUsage: mg mongod [options]')
    .example('mg mongod --dbpath=' + process.env.HOME + '/mongodb',
      'set any options to passthrough')
    .options(opts.mongod).argv;

  if(argv.h) return yargs.showHelp();

  nconf.overrides({mongod: argv});
  apps.mongod.start();
};

module.exports = function(name){
  if(Object.keys(apps).indexOf('name') > -1){
    return module.exports[name]();
  }
  else {
    console.error('unknown app `' + name + '`');
  }
};
