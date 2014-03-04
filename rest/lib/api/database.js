"use strict";

var mw = require('../middleware');

module.exports = function(app){
  app.get('/api/v1/:database_name', mw.database(), stats, collection_names, function(req, res, next){
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
  req.database.command({dbStats: 1}, {}, function(err, data){
    if(err) return next(err);

    req.database.stats = {
      object_count: data.objects,
      object_size: data.dataSize,
      storage_size: data.storageSize,
      index_count: data.indexes,
      index_size: data.indexSize,
      extent_count: data.numExtents,
      extent_freelist_count: data.extentFreeList.num,
      extent_freelist_size: data.extentFreeList.totalSize,
      file_size: data.fileSize,
      ns_size: data.nsSizeMB * 1024 * 1024
    };
    next();
  });
};

var collection_names = module.exports.collection_names = function(req, res, next){
  req.mongo.find(req.database, 'system.namespaces', {}, function(err, data){
    if(err) return next(err);

    req.database.collection_names = data.filter(function(col){
      return !(col.name.indexOf('$') >= 0 && col.name.indexOf('.oplog.$') < 0);
    }).map(function(col){
      return col.name.replace(req.database.databaseName + '.', '');
    });
  });
};

function create(req, res, next){
  next(new Error('not implemented'));
}

function clone(req, res, next){
  next(new Error('not implemented'));
}

function drop(req, res, next){
  next(new Error('not implemented'));
}

function repair(req, res, next){
  next(new Error('not implemented'));
}

function fsync(req, res, next){
  next(new Error('not implemented'));
}
