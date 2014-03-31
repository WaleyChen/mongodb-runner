"use strict";

var mw = require('../db-middleware'),
  debug = require('debug')('mg:mongorest:security');

// @note: Currently maintaining the full matrix as a google spreadsheet:
// https://docs.google.com/a/10gen.com/spreadsheet/ccc?key=0AiffIeCadTOydHhOcVo0RC11enVIUnN0MUp5MUZZNUE#gid=0
//
// QA Test Code worth mining more to find environmental behaviors:
// - https://github.com/10gen/QA/tree/master/QA-341
// - https://github.com/10gen/QA/tree/master/QA-338

module.exports = function(app){
  app.get('/api/v1/security', users, roles, function(req, res, next){
    res.send({
      users: req.mongo.users,
      roles: req.mongo.roles
    });
  });

  app.get('/api/v1/security/users', users, function(req, res, next){
    res.send(req.mongo.users);
  });

  app.get('/api/v1/security/users/:database_name/:username',  function(req, res, next){
    req.mongo.admin().command({usersInfo: req.param('username'), showPrivileges: 1}, {}, function(err, data){
      if(err) return next(err);

      res.send(data.documents[0].users);
    });
  });

  app.get('/api/v1/security/roles/:database_name/:role', function(req, res, next){
    req.mongo.admin().command({rolesInfo: req.param('role'), showPrivileges: 1, showBuiltinRoles: 1}, {}, function(err, data){
      if(err) return next(err);

      res.send(data.documents[0].roles);
    });
  });

  app.get('/api/v1/security/roles', roles, function(req, res, next){
    res.send(req.mongo.roles);
  });
};

var users = function(req, res, next){
  debug('fetching users');
  req.mongo.admin().command({usersInfo: 1}, {}, function(err, data){
    if(err) return next(err);
    req.mongo.users = data.documents[0].users;
    debug('users found', req.mongo.users);
    next();
  });
};


var roles = function(req, res, next){
  debug('fetching roles');
  req.mongo.admin().command({rolesInfo: 1, showPrivileges: 1, showBuiltinRoles: 1}, {}, function(err, data){
    if(err) return next(err);
    req.mongo.roles = data.documents[0].roles;
    debug('roles found', req.mongo.roles);
    next();
  });
};
