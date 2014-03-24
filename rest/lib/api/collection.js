"use strict";

var mw = require('../db-middleware'),
  errors = mw.errors;

module.exports = function(app){
  app.get('/api/v1/:database_name/:collection_name', mw.database(),
    mw.collection(), stats, indexes, get);
  app.get('/api/v1/:database_name/:collection_name/find', mw.database(),
    mw.collection(), find);

  app.post('/api/v1/:database_name/:collection_name/rename', rename);
  app.post('/api/v1/:database_name/:collection_name/clone', clone);
  app.post('/api/v1/:database_name/:collection_name/remove', remove);
  app.post('/api/v1/:database_name/:collection_name/drop-indexes' , dropIndexes);
  app.post('/api/v1/:database_name/:collection_name/compact', compact);
  app.post('/api/v1/:database_name/:collection_name/reindex', reindex);
  app.post('/api/v1/:database_name/:collection_name/touch', touch);
  app.post('/api/v1/:database_name/:collection_name/validate', validate);
};

var get = module.exports.get = function(req, res, next){
  req.collection.indexes.map(function(index, i){
    req.collection.indexes[i].size = req.collection.stats.index_sizes[index.name];
  });

  delete req.collection.stats.index_sizes;

  res.send({
    name: req.param('collection_name'),
    database: req.param('database_name'),
    ns: req.param('collection_name') + '.' + req.param('database_name'),
    indexes: req.collection.indexes,
    stats: req.collection.stats
  });
};

var stats = module.exports.stats = function(req, res, next){
  req.database.command({collStats: req.param('collection_name')}, {}, function(err, data){
    if(err) return next(err);

    req.collection.stats = {
      index_sizes: data.indexSizes,
      document_count: data.count,
      document_size: data.size,
      storage_size: data.storageSize,
      index_count: data.nindexes,
      index_size: data.totalIndexSize,
      padding_factor: data.paddingFactor,
      extent_count: data.numExtents,
      extent_last_size: data.lastExtentSize,
      flags_user: data.userFlags,
      flags_system: data.systemFlags
    };
    next();
  });
};

var indexes = module.exports.indexes = function(req, res, next){
  var ns = req.param('database_name') + '.' + req.param('collection_name');
  req.mongo.find(req.database, 'system.indexes', {ns: ns}, function(err, data){
    if(err) return next(err);
    req.collection.indexes = data;
    next();
  });
};

var find = function(req, res, next){
  var limit = Math.min(10, req.param('limit', 10)),
    skip = Math.max(0, req.param('skip', 0));

  req.mongo.find(req.database, req.collection.collectionName, {limit: limit, skip: skip}, function(err, docs){
    if(err) return next(err);
    res.send(docs);
  });
};

function clone(req, res, next){
  next(new errors.NotImplemented());
}
function rename(req, res, next){
  next(new errors.NotImplemented());
}
function remove(req, res, next){
  next(new errors.NotImplemented());
}
function dropIndexes(req, res, next){
  next(new errors.NotImplemented());
}
function compact(req, res, next){
  next(new errors.NotImplemented());
}
function reindex(req, res, next){
  next(new errors.NotImplemented());
}
function touch(req, res, next){
  next(new errors.NotImplemented());
}
function validate(req, res, next){
  next(new errors.NotImplemented());
}

