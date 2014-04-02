"use strict";

var smongo = require('../smongo'),
  mongolog = require('mongolog');

module.exports = function(app){
  app.get('/api/v1/log', get);
  app.get('/api/v1/log/:name', get);

  smongo.createLogStream(app.get('db').admin())
    .socketio('/log', app.get('io'));
};

var get = module.exports.get = function(req, res, next){
  req.mongo.admin().command({getLog: req.param('name', 'global')}, function(err, data){
    if(err) return next(err);

    res.send(mongolog.parse(data.documents[0].log));
  });
};
