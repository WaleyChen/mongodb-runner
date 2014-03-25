"use strict";

var mw = require('../db-middleware'),
  debug = require('debug')('mg:mongorest:security');

module.exports = function(app){
  app.get('/api/v1/security', users, function(req, res, next){
    res.send({
      users: req.mongo.users
    });
  });
  app.get('/api/v1/security/users', users, function(req, res, next){
    res.send(req.mongo.users);
  });
  app.get('/api/v1/security/users/:username',  function(req, res, next){
    req.mongo.admin().command({usersInfo: req.param('username'), showPrivileges: true}, {}, function(err, data){
      if(err) return next(err);

      res.send(data.documents[0].users);
    });
  });
  app.get('/api/v1/security/roles', mw.notImplemented);
};

var users = function(req, res, next){
  req.mongo.admin().command({usersInfo: 1}, {}, function(err, data){
    if(err) return next(err);
    req.mongo.users = data.documents[0].users;
    next();
  });
};

var getRole = function(req, res, next){
  // db.getRole( "siteRole01", { showPrivileges: true } )
};
