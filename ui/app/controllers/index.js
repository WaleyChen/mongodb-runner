var splint = require('../lib/splint'),
  debug = require('debug')('mg:scope:router'),
  $ = require('jquery');

require('../models')({
  error: function(deployments, err){
    $('#mongoscope').removeClass('loading');
    if(err.status === 401){
      return window.location.hash = 'authenticate';
    }

    debug('unexpected initialization error...');
    throw err;
  },
  success: function(){
    debug('ready');
  }
});

new (require('./toolbar'))();

var security = new (require('./security'))();

module.exports = function(){
  return splint(
    ['authenticate', 'authenticate', new (require('./auth'))()],
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
};
