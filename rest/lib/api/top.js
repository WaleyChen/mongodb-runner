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

  function pipe(uri, io, readable){
    io.sockets.on('connection', function(socket){
      debug('subscribing', uri);
      function relay(){
        // data listener triggers start or resume automatically.
        readable.on('data', function(deltas){
          socket.emit(uri, deltas);
        });
      }

      socket.on(uri, relay)
        .on(uri + '/unsubscribe', function(){
          socket.off(uri, relay);
          debug('unsubscribed', uri);
          // @todo: if last subscriber, pause stream.
        });
    });
  }

  // @todo: make a real Socketio duplex stream so this will all
  // just be:
  //
  // ```
  // top.pipe(io.createStream('/top'));
  // ```
  pipe('/top', io, top);
};
