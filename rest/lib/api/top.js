"use strict";

var smongo = require('../smongo'),
  debug = require('debug')('mg:mongorest:top');

module.exports = function(app){
  var io = app.get('io'),
    top = smongo.createTopStream(app.get('db').admin());

  app.get('/api/v1/top', function(req, res, next){
    top.once('data', function(d){
      res.send(d);
    });
    top.read();
  });

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
