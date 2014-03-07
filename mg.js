"use strict";
var _ = require('underscore'),
  debug = require('debug')('mg');

function mg(argv){
  var options = {},
    prev = null;

  _.each(_.keys(argv), function(key){
    var alias = mg.get(key);

    if(alias){
      argv[alias.real] = argv[key];
      if(!options[alias.app]) options[alias.app] = {};
      options[alias.app][alias.key] = argv[key];
    }
    delete argv[key];
  });

  _.each(_.keys(options), function(name){
    debug(name+ ' options:');
    _.each(_.keys(options[name]), function(k){
      debug('  - ' + k, options[name][k]);
    });
  });

  delete mg.settings.apps.mg;

  debug('starting apps', Object.keys(mg.settings.apps));

  Object.keys(mg.settings.apps).map(function(name){
    if(prev === null){
      debug('starting', name);
      prev = mg.settings.apps[name](options[name]);
    }
    else{
      debug('waiting', name);
      prev.on('ready', function(){
        debug('starting', name);
        prev = mg.settings.apps[name](options[name]);
      });
    }
  });
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
