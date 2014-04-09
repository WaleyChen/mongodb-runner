'use strict';

var debug = require('debug')('mongoscope:database'),
  NotAuthorized = require('../errors').NotAuthorized;

module.exports = function(app){
  app.get('/api/v1/:host/:database_name', stats, collections, function(req, res){
    res.send({
      name: req.db.name,
      collection_names: req.db.collection_names,
      stats: req.db.stats
    });
  });
};

function stats(req, res, next){
  req.db.command({dbStats: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view stats for this database'));

    req.db.stats = {
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
  req.db.collection('system.namespaces', function(err, col){
    col.find({}).toArray(function(err, data){
      if(err) return next(err);

      if(!data) return next(new NotAuthorized('not authorized to view collections for this database'));

      req.db.collection_names = data.filter(function(col){
        return !(col.name.indexOf('$') >= 0 && col.name.indexOf('.oplog.$') < 0);
      }).map(function(col){
        return col.name.replace(req.db.databaseName + '.', '');
      });
      next();
    });
  });
}
