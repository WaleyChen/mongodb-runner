"use strict";

var mw = require('../db-middleware'),
  errors = require('./errors'),
  NotAuthorized = errors.NotAuthorized,
  debug = require('debug')('mg:mongorest:database');

module.exports = function(app){
  app.get('/api/v1/:host/:database_name', mw.database(), stats, collections, function(req, res, next){
    res.send({
      name: req.param('database_name'),
      collection_names: req.database.collection_names,
      stats: req.database.stats
    });
  });
};

function stats(req, res, next){
  req.database.command({dbStats: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view stats for this database'));

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
}

function collections(req, res, next){
  req.mongo.find(req.database, 'system.namespaces', {}, function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view collections for this database'));

    debug('collection data', err, data, req.database.name);
    req.database.collection_names = data.filter(function(col){
      return !(col.name.indexOf('$') >= 0 && col.name.indexOf('.oplog.$') < 0);
    }).map(function(col){
      return col.name.replace(req.database.databaseName + '.', '');
    });
    next();
  });
}
