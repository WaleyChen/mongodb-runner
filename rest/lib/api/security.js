'use strict';

var NotAuthorized = require('../errors').NotAuthorized;

module.exports = function(app){
  app.get('/api/v1/:host/security', users, roles, function(req, res){
    res.send({
      users: req.mongo.users,
      roles: req.mongo.roles
    });
  });

  app.get('/api/v1/:host/security/users', users, function(req, res){
    res.send(req.mongo.users);
  });

  app.get('/api/v1/:host/security/users/:database_name/:username',  function(req, res, next){
    req.mongo.admin().command({usersInfo: req.param('username'), showPrivileges: 1}, {}, function(err, data){
      if(err) return next(err);
      if(!data) return new NotAuthorized('not authorized to view user details');

      res.send(data.documents[0].users[0]);
    });
  });

  app.get('/api/v1/:host/security/roles/:database_name/:role', function(req, res, next){
    req.mongo.admin().command({rolesInfo: req.param('role'), showPrivileges: 1, showBuiltinRoles: 1}, {}, function(err, data){
      if(err) return next(err);
      if(!data) return new NotAuthorized('not authorized to view role details');

      res.send(data.documents[0].roles[0]);
    });
  });

  app.get('/api/v1/:host/security/roles', roles, function(req, res){
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
