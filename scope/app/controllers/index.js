"use strict";

var splint = require('../splint'),
  debug = require('debug')('mg:scope:router');

new (require('./toolbar'))();

var security = new (require('./security'))();

module.exports = function(opts){
  return splint(
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
