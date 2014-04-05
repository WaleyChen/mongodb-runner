"use strict";

var mw = require('../db-middleware'),
  NotAuthorized = require('./errors').NotAuthorized,
  debug = require('debug')('mg:mongorest:security');

// @note: Currently maintaining the full matrix as a google spreadsheet:
// https://docs.google.com/a/10gen.com/spreadsheet/ccc?key=0AiffIeCadTOydHhOcVo0RC11enVIUnN0MUp5MUZZNUE#gid=0
//
// QA Test Code worth mining more to find environmental behaviors:
// - https://github.com/10gen/QA/tree/master/QA-341
// - https://github.com/10gen/QA/tree/master/QA-338
module.exports = function(app){
  var prefix = '/api/v1/:host/security';

  app.get(prefix, users, roles, function(req, res, next){
    res.send({
      users: req.mongo.users,
      roles: req.mongo.roles
    });
  });

  app.get(prefix + '/users', users, function(req, res, next){
    res.send(req.mongo.users);
  });

  app.get(prefix + '/users/:database_name/:username',  function(req, res, next){
    req.mongo.admin().command({usersInfo: req.param('username'), showPrivileges: 1}, {}, function(err, data){
      if(err) return next(err);
      if(!data) return new NotAuthorized('not authorized to view user details');

      res.send(data.documents[0].users[0]);
    });
  });

  app.get(prefix + '/roles/:database_name/:role', function(req, res, next){
    req.mongo.admin().command({rolesInfo: req.param('role'), showPrivileges: 1, showBuiltinRoles: 1}, {}, function(err, data){
      if(err) return next(err);
      if(!data) return new NotAuthorized('not authorized to view role details');

      res.send(data.documents[0].roles[0]);
    });
  });

  app.get(prefix, '/roles', roles, function(req, res, next){
    res.send(req.mongo.roles);
  });
};

function users(req, res, next){
  req.mongo.admin().command({usersInfo: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data) return new NotAuthorized('not authorized to view users');

    req.mongo.users = data.documents[0].users;
    next();
  });
}


function roles(req, res, next){
  req.mongo.admin().command({rolesInfo: 1, showPrivileges: 1, showBuiltinRoles: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data) return new NotAuthorized('not authorized to view roles');

    req.mongo.roles = data.documents[0].roles;
    next();
  });
}
