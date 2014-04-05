"use strict";

var smongo = require('../smongo'),
  debug = require('debug')('mg:mongorest:top');

module.exports = function(app){
  var top = smongo.createTopStream(req.mongo.admin());
  top.socketio('/top', app.get('io'));
};
