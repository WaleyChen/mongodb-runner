"use strict";

var smongo = require('../smongo'),
  mongolog = require('mongolog');

module.exports = function(app){
  app.get('/api/v1/log', get);
  app.get('/api/v1/log/:name', get);

  var io = app.get('io'),
    log = smongo.createLogStream(app.get('db').admin());

  io.sockets.on('connection', function(socket){
    socket.on('/log', function(){
      log.on('data', function(lines){
        socket.emit('log', lines);
      });
    });
  });
};

var get = module.exports.get = function(req, res, next){
  req.mongo.admin().command({getLog: req.param('name', 'global')}, function(err, data){
    if(err) return next(err);
    res.send(mongolog.parse(data.documents[0].log));
  });
};
