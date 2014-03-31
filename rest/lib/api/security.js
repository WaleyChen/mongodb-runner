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
  debug('fetching users');
  req.mongo.admin().command({usersInfo: 1, showPrivileges: true}, {}, function(err, data){
    if(err) return next(err);
    req.mongo.users = data.documents[0].users;
    debug('users found', req.mongo.users);
    next();
  });
};

var getRole = function(req, res, next){
  // db.getRole( "siteRole01", { showPrivileges: true } )
};
