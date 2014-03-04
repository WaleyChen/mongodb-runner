"use strict";

var async = require('async'),
  debug = require('debug')('mongorest:api');

function firstDoc(cb){
  return function(err, data){
    if(err) return cb(err);
    cb(null, data.documents[0] || data.documents);
  };
}

function admin(){
  return function(req, res, next){
    req.database = req.mongo.admin();
    next();
  };
}

function database(name){
  return function(req, res, next){
    req.database = req.mongo.db(name || req.param('database'));
    next();
  };
}

function collection(name){
  return function(req, res, next){
    req.database.collection(name || req.param('collection'), function(err, collection){
      if(err) return next(err);

      req.collection = collection;
      next();
    });
  };
}

function find(db, name, spec, fn){
  db.collection(name, function(err, coll){
    coll.find({}, function(err, data){
      if(err) return fn(err);
      data.toArray(function(err, data){
        fn(null, data);
      });
    });
  });
}

module.exports.routes = function(app){
  app.get('/api/v1', admin(), function(req, res, next){
    var cmds = {
        build: req.database.buildInfo.bind(req.database),
        databases:
        function(cb){
          req.database.listDatabases(function(err, data){
            if(err) return cb(err);
            cb(null, data.databases);
          });
        },
        host: function(cb){
          req.database.command({hostInfo: 1}, {}, firstDoc(cb));
        }
      };

    async.parallel(cmds, function(err, results){
      if(err) return next(err);

      res.send({
        host: results.host,
        build: results.build,
        databases: results.databases
      });
    });
  });

  app.get('/api/v1/:database', database(), function(req, res, next){
    var cmds = {
      stats: function(cb){
        req.database.command({dbStats: 1}, {}, function(err, data){
          if(err) return cb(err);
          cb(null, data);
        });
      },
      collections: function(cb){
        find(req.database, 'system.namespaces', {}, function(err, data){
          if(err) return cb(err);
          cb(null, data);
        });
      }
    };

    async.parallel(cmds, function(err, results){
      if(err) return next(err);
      if(results.stats.collections === 0){
        return next(new Error('Unknown db: `' + req.param('database') + '`'));
      }
      res.send({
        name: req.param('database'),
        collections: results.collections,
        stats: results.stats
      });
    });
  });

  app.get('/api/v1/:database/:collection', database(), collection(), function(req, res, next){
    var cmds = {
      stats: function(cb){
        req.database.command({collStats: req.param('collection')}, {}, function(err, data){
          if(err) return next(err);
          cb(null, data);
        });
      },
      indexes: function(cb){
        find(req.database, 'system.indexes', {}, function(err, data){
          if(err) return cb(err);
          cb(null, data);
        });
      }
    };

    async.parallel(cmds, function(err, results){
      if(err) return next(err);

      res.send({
        name: req.param('collection'),
        database: req.param('database'),
        indexes: results.indexes,
        stats: results.stats
      });
    });
  });
};
