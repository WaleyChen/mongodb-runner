"use strict";
var _ = require('underscore'),
  child_process = require('child_process'),
  debug = require('debug')('mg');

function mg(argv){
  var options = {},
    prev = null,
    positional = argv._;

  _.each(_.keys(argv), function(key){
    var alias = mg.get(key);

    if(alias){
      argv[alias.real] = argv[key];
      if(!options[alias.app]) options[alias.app] = {};
      options[alias.app][alias.key] = argv[key];
    }
    delete argv[key];
  });

  delete mg.settings.apps.mg;

  var apps;
  if(positional.length > 0 && mg.settings.apps[positional[0]]){
    apps = {};
    apps[positional[0]] = mg.settings.apps[positional[0]];
  }
  else {
    apps = mg.settings.apps;
  }

  var fromEnv = {},
    envMapping = {
      'url': 'MG_URL',
      'mongo': 'MG_MONGO',
      'bin': 'MG_BIN',
      'dbpath': 'MG_DBPATH'
    };

  Object.keys(envMapping).map(function(k){
    fromEnv[k] = process.env[envMapping[k]];
  });

  debug('starting apps', Object.keys(apps));

  Object.keys(apps).map(function(name){
    if(prev === null){
      debug('starting', name);
      options[name].bin = fromEnv.bin || options[name].bin;
      options[name].dbpath = fromEnv.dbpath || options[name].dbpath;

      prev = mg.settings.apps[name](options[name]).on('error', function(){
        debug('assuming ready somewhere else');
        prev.emit('ready', {});
      });
    }
    else{
      debug('waiting', name);
      prev.on('ready', function(){
        debug('starting', name);

        options[name].mongo = fromEnv.mongo || options[name].mongo;
        options[name].url = fromEnv.url || options[name].url;

        prev = mg.settings.apps[name](options[name]);
      });
    }
  });

  if(apps.mongorest){
    child_process.exec('open ' + options.mongorest.url);
  }
}

mg.settings = {
  examples: [
    ['mg', 'deploy all unicorns'],
    ['mg mongod', 'only start mongod'],
    ['mg mongorest', 'only start the rest server']
  ],
  options: {},
  aliases: {},
  apps: []
};

mg.prepare = function(apps){
  mg.settings.apps = apps;

  _.each(_.pairs(apps), function(a){
    var name = a[0], app = a[1];

    _.each(_.pairs(app.get('options')), function(opt){
      var key = opt[0],
        option = opt[1],
        alias = name.replace('mongo', '') + '_' + key;

      mg.settings.options[alias] = option;
      mg.settings[alias] = {app: name, key: key, real: name + '_' + key};
    });
  });
  apps.mg = mg;
  return mg;
};

mg.get = function(setting){
  return mg.settings[setting];
};

mg.set = function(setting, val){
  if(typeof setting === 'object'){
    _.each(arguments, function(setting){
      _.extend(mg.settings, setting);
    });
    return mg;
  }
  mg.settings[setting] = val;
};

module.exports = mg;
