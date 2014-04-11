var splint = require('../lib/splint'),
  debug = require('debug')('mongoscope:router'),
  $ = require('jquery'),
  Backbone = require('backbone'),
  auth, security;

var start = function(){
  debug('creating router and views');
  if(!auth){
    auth = new (require('./auth'))();
  }

  security = new (require('./security'))();

  var collection = new (require('./collection'))(),
    database = require('./database');

  var router =  splint(
    ['authenticate', 'authenticate', auth],
    ['pulse', 'pulse', new (require('./pulse'))(), {index: true}],
    ['log', 'log', new (require('./log'))()],
    ['top', 'top', new (require('./top'))()],
    ['replication', 'replication', new (require('./replication'))()],
    ['security', 'security', security],
    ['security/users/:database/:username', 'security_user', security.userDetail],
    ['security/roles/:database/:role', 'security_role', security.roleDetail],
    ['collection/:database_name/:collection_name',  'collection', collection],
    ['collection/:database_name/:collection_name/explore/:skip',
      'explore_collection', function(){collection.activateExplorer.apply(collection, arguments);}],
    ['database/:database_name',  'database', database()],
    ['databases/:database_name/collection',  'create collection', database.createCollection()]
  );

  return router;
};

require('../models')({
  error: function(deployments, err){
    debug('models', deployments, err);
    if(err.status === 401){
      debug('got 401.  triggering auth modal');

      var redirect = window.location.hash.replace('#', '');

      Backbone.history.start();
      Backbone.history.navigate('authenticate', {trigger: true});

      $('body').removeClass('loading')
        .addClass('authenticate');

      auth = new (require('./auth'))();
      auth.redirect = redirect;
      auth.activate();
      start();
      return;
    }

    debug('unexpected initialization error...');
    throw err;
  },
  success: function(){
    Backbone.history.start();
    start();
    debug('ready');
  }
});

new (require('./toolbar'))();



module.exports = function(){};

