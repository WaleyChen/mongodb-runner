"use strict";

var mw = require('../db-middleware'),
  debug = require('debug')('mg:mongorest:security');

module.exports = function(app){
  app.get('/api/v1/security', function(req, res, next){
    req.mongo.admin().command({usersInfo: 1}, {}, function(err, data){
      if(err) return next(err);
      res.send({users: data.documents[0].users});
    });
  });
  app.get('/api/v1/security/users', users);
  app.get('/api/v1/security/users/:username',  mw.notImplemented);
  app.get('/api/v1/security/roles', mw.notImplemented);
};

var users = function(req, res, next){
  req.mongo.admin().command({usersInfo: 1}, {}, function(err, data){
    if(err) return next(err);
    res.send(data.documents[0].users);
  });
};

var getUser = function(req, res, next){
  // b.runCommand(   {     usersInfo:"scopey",     showPrivileges:true   } )
};

var getRole = function(req, res, next){
  // db.getRole( "siteRole01", { showPrivileges: true } )
};
