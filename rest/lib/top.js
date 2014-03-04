"use strict";

var debug = require('debug')('mongorest:top');

module.exports.routes = function(app){
  var topInterval;

  app.get('/api/v1/top', function(req, res, next){
    top(req.mongo.admin(), function(err, data){
      if(err) return next(err);
      res.send(data);
    });
  });

  function top(admin, fn){
    admin.command({serverStatus: 1}, {}, function(err, data){
      if(err) return fn(err);
      fn(data.documents[0]);
    });
  }

  // @todo: Finish the marshalling to straight
  // key => delta and use a singleton observer
  // to emit only the changes to all connection.
  // topInterval = setInterval(function(){
  //   debug('polling');
  //   top(app.get('db').admin(), function(err, data){
  //     // if(err){
  //     //   app.get('io').emit('error', err);
  //     //   return clearInterval(topInterval);
  //     // }
  //     app.get('io').emit('top', data);
  //   });
  // }, 500);
};
