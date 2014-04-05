'use strict';

var errors = require('./api/errors'),
  debug = require('debug')('mg:scope:db-middleware');

module.exports = function(app){
  app.use(function(req, res, next){
    req.mongo.find = function find(db, name, opts, fn){
      db.collection(name, function(err, coll){
        if(err) return fn(err);

        coll.find({}, [], opts || {}, function(err, data){
          if(err) return fn(err);
          data.toArray(function(err, data){
            if(data === null) return fn(new Error('Not authorized?'));
            fn(null, data);
          });
        });
      });
    };
    next();
  });
};

module.exports.admin = function(){
  return function(req, res, next){
    req.database = req.mongo.admin();
    next();
  };
};

module.exports.notImplemented = function(req, res, next){
  next(new errors.NotImplemented());
};

module.exports.database = function(){
  return function(req, res, next){
    var name = req.param('database_name');
    req.database = req.mongo.db(name);
    req.database.name = name;
    next();
  };
};

module.exports.collection = function(){
  return function(req, res, next){
    var name = req.param('collection_name');
    req.database.collection(name, function(err, collection){
      if(err) return next(err);

      req.collection = collection;
      next();
    });
  };
};
