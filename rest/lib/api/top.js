"use strict";

var smongo = require('../smongo'),
  debug = require('debug')('mg:mongorest:top');

module.exports = function(app){
  var top = smongo.createTopStream(app.get('db').admin());

  app.get('/api/v1/top', function(req, res, next){
    top.once('data', function(d){
      res.send(d);
    });
    top.read(1);
  });
  top.socketio('/top', app.get('io'));
};
