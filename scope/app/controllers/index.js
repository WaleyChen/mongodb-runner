"use strict";

var splint = require('../splint'),
  Security = require('./security'),
  debug = require('debug')('mg:scope:router');

new (require('./sidebar'))();

module.exports = function(opts){
  return splint(
    ['pulse', 'pulse', new (require('./pulse'))(), {index: true}],
    ['log', 'log', new (require('./log'))()],
    ['top', 'top', new (require('./top'))()],
    ['replication', 'replication', new (require('./replication'))()],
    ['security', 'security', new Security()],
    ['security/users/:_id', 'security_user', new Security.User()],
    ['collection/:database_name/:collection_name',  'collection', new (require('./collection'))()],
    ['database/:database_name',  'database', new (require('./database'))()]
  );
};
