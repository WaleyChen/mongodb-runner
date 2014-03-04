"use strict";

module.exports = function(db){
  return function(req, res, next){
    req.mongo = db;
    req.mongo.find = function find(db, name, spec, fn){
      db.collection(name, function(err, coll){
        coll.find({}, function(err, data){
          if(err) return fn(err);
          data.toArray(function(err, data){
            fn(null, data);
          });
        });
      });
    };
    next();
  };
};

module.exports.admin = function(){
  return function(req, res, next){
    req.database = req.mongo.admin();
    next();
  };
};

module.exports.database = function(name){
  return function(req, res, next){
    req.database = req.mongo.db(name || req.param('database_name'));
    next();
  };
};

module.exports.collection = function(name){
  return function(req, res, next){
    req.database.collection(name || req.param('collection_name'), function(err, collection){
      if(err) return next(err);

      req.collection = collection;
      next();
    });
  };
};
