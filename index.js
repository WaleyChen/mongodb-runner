"use strict";

var apps = {
  mongod: require('mongodmon'),
  mongorest: require('./rest')
};

require('./mg').prepare(apps);

module.exports = function(name){
  if(Object.keys(apps).indexOf(name) === -1) return new Error('unknown app `' + name + '`');

  var app = apps[name],
    yargs = require('yargs')
      .usage(app.get('usage'))
      .options(app.get('options')),
    argv;

  if(app.get('examples')){
    app.get('examples').map(function(ex){yargs.example.apply(yargs, ex);});
  }
  argv = yargs.argv;

  if(argv.h) return yargs.showHelp();

  var allowed = Object.keys(app.get('options'));
  Object.keys(argv).map(function(k){
    if(allowed.indexOf(k) === -1){
      delete argv[k];
    }
  });
  app(argv);
};

