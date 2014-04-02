"use strict";

var smongo = require('../smongo'),
  debug = require('debug')('mg:mongorest:top');

module.exports = function(app){
  var io = app.get('io'),
    top = smongo.createTopStream(app.get('db').admin());

  // @todo: allow subsection of keys to return.
  app.get('/api/v1/top', function(req, res, next){
    top.once('data', function(d){
      res.send(d);
    });
    top.read(1);
  });

  var subscribers = {},
    paused = false;

  top.on('data', function(deltas){
    var ids = Object.keys(subscribers);
    debug('pushing deltas to ' + ids.length + ' subscribers');

    ids.map(function(id){
      subscribers[id].emit('/top', deltas);
    });

  });

  io.sockets.on('connection', function(socket){
    socket.on('/top', function(){
        subscribers[socket.id] = socket;
      })
      .on('/top/unsubscribe', function(){
        debug('unsubscribing');
        delete subscribers[socket.id];
      }).on('disconnect', function(){
        debug('disconnect');
        delete subscribers[socket.id];
      });


  });
};
