'use strict';

var mw = require('../db-middleware'),
  prefix = '/api/v1/:host/:database_name/:collection_name';

module.exports = function(app){
  app.get(prefix, mw.database(), mw.collection(), stats, indexes, get);

  ['find', 'count'].map(function(method){
    app.get(prefix + '/' + method, mw.database(), mw.collection(), read(method));
  });

  app.get(prefix + '/aggregate', mw.database(), mw.collection(), aggregate);
};

function aggregate(req, res, next){
  req.collection.aggregate(JSON.parse(req.param('pipeline')), function(err, result){
    if(err) return next(err);
    res.send(result);
  });
}

function read(method){
  return function(req, res, next){
    var limit = Math.min(10, req.param('limit', 10)),
      skip = Math.max(0, req.param('skip', 0)),
      explain = req.param('explain', 0),
      where = JSON.parse(req.param('where', '{}')),
      cursor = req.collection[method](where).skip(skip).limit(limit);

    if(explain){
      return cursor.explain(function(err, data){
        if(err) return next(err);
        res.send(data);
      });
    }

    cursor.toArray(function(err, data){
      if(err) return next(err);
      res.send(data);
    });
  };
}

function get(req, res){
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
}

function stats(req, res, next){
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
}

function indexes(req, res, next){
  var ns = req.param('database_name') + '.' + req.param('collection_name');
  req.mongo.find(req.database, 'system.indexes', {ns: ns}, function(err, data){
    if(err) return next(err);
    req.collection.indexes = data;
    next();
  });
}
