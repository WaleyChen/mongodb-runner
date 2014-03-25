"use strict";

var mw = require('../db-middleware'),
  errors = require('./errors'),
  debug = require('debug')('mg:mongorest:database');

module.exports = function(app){
  app.get('/api/v1/:database_name', mw.database(), stats, collection_names, function(req, res, next){
    debug('building response');
    res.send({
      name: req.param('database_name'),
      collection_names: req.database.collection_names,
      stats: req.database.stats
    });
  });

  app.put('/api/v1/:database_name', create);
  app.post('/api/v1/:database_name/clone', clone);
  app.post('/api/v1/:database_name/drop', drop);
  app.post('/api/v1/:database_name/repair', repair);
  app.post('/api/v1/:database_name/fsync', fsync);
};

var stats = module.exports.stats = function(req, res, next){
  debug('fetching stats');
  req.database.command({dbStats: 1}, {}, function(err, data){
    if(err) return next(err);

    req.database.stats = {
      document_count: data.objects,
      document_size: data.dataSize,
      storage_size: data.storageSize,
      index_count: data.indexes,
      index_size: data.indexSize,
      extent_count: data.numExtents,
      file_size: data.fileSize,
      ns_size: data.nsSizeMB * 1024 * 1024
    };
    next();
  });
};

var collection_names = module.exports.collection_names = function(req, res, next){
  debug('fetching collection names');
  req.mongo.find(req.database, 'system.namespaces', {}, function(err, data){
    if(err) return next(err);

    debug('collection data', err, data, req.database.name);

    req.database.collection_names = data.filter(function(col){
      return !(col.name.indexOf('$') >= 0 && col.name.indexOf('.oplog.$') < 0);
    }).map(function(col){
      return col.name.replace(req.database.databaseName + '.', '');
    });
    next();
  });
};

// @todo: dont allow creating databases with stupid names like 'databases'.
// it will just be confusing.
function create(req, res, next){
  next(new errors.NotImplemented());
}

function clone(req, res, next){
  next(new errors.NotImplemented());
}

function drop(req, res, next){
  next(new errors.NotImplemented());
}

function repair(req, res, next){
  next(new errors.NotImplemented());
}

function fsync(req, res, next){
  next(new errors.NotImplemented());
}
