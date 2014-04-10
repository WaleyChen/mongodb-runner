var splint = require('../lib/splint'),
  debug = require('debug')('mongoscope:router'),
  $ = require('jquery'),
  Backbone = require('backbone'),
  auth, security;

var start = function(){
  debug('creating router and views');
  $('#modal').modal({backdrop: 'static', keyboard: false});
  if(!auth){
    auth = new (require('./auth'))();
  }

  security = new (require('./security'))();

  var router =  splint(
    ['authenticate', 'authenticate', auth],
    ['pulse', 'pulse', new (require('./pulse'))(), {index: true}],
    ['log', 'log', new (require('./log'))()],
    ['top', 'top', new (require('./top'))()],
    ['replication', 'replication', new (require('./replication'))()],
    ['security', 'security', security],
    ['security/users/:database/:username', 'security_user', security.userDetail],
    ['security/roles/:database/:role', 'security_role', security.roleDetail],
    ['collection/:database_name/:collection_name',  'collection', new (require('./collection'))()],
    ['database/:database_name',  'database', new (require('./database'))()]
  );

  return router;
};

require('../models')({
  error: function(deployments, err){
    debug('models', deployments, err);
    $('body').removeClass('loading');
    if(err.status === 401){
      debug('got 401.  triggering auth modal');
      auth = new (require('./auth'))();
      auth.redirect = window.location.hash.replace('#', '');
      start();
      Backbone.history.start();
      Backbone.history.navigate('authenticate', {trigger: true});
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

