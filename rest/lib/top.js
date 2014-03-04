"use strict";

var stream = require('stream'),
  util = require('util'),
  smongo = require('./smongo'),
  debug = require('debug')('mongorest:top');

module.exports.routes = function(app){
  var io = app.get('io'),
    top = smongo.createTopStream(app.get('db').admin());

  io.sockets.on('connection', function(socket){
    socket.on('/top', function(){
      top.on('data', function(topDeltas){
        socket.emit('top', topDeltas);
      }).on('error', function(err){
        socket.emit('top error', err);
      });
    });

    socket.on('disconnect', function(){
      debug('@todo: best way to pause?');
    });
  });
};
