'use strict';

var token = require('../token'),
  prefix = '/api/v1/:host/:database_name/:collection_name';

module.exports = function(app){
  app.get(prefix, token.required, stats, indexes, get);

  ['find', 'count'].map(function(method){
    app.get(prefix + '/' + method, token.required, read(method));
  });

  app.get(prefix + '/aggregate', token.required, aggregate);
};

// @todo: socketio + tailable
function aggregate(req, res, next){
  req.col.aggregate(JSON.parse(req.param('pipeline')), function(err, result){
    if(err) return next(err);
    res.send(result);
  });
}

// @todo: socketio + tailable
function read(method){
  return function(req, res, next){
    var limit = Math.min(10, req.param('limit', 10)),
      skip = Math.max(0, req.param('skip', 0)),
      explain = req.param('explain', 0),
      where = JSON.parse(req.param('where', '{}')),
      cursor = req.col[method](where).skip(skip).limit(limit);

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
  req.col.indexes.map(function(index, i){
    req.col.indexes[i].size = req.col.stats.index_sizes[index.name];
  });

  delete req.col.stats.index_sizes;

  res.send({
    name: req.col.name,
    database: req.db.name,
    indexes: req.col.indexes,
    stats: req.col.stats
  });
}

function stats(req, res, next){
  req.db.command({collStats: req.param('collection_name')}, {}, function(err, data){
    if(err) return next(err);

    req.col.stats = {
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
  req.mongo.find(req.db, 'system.indexes', {ns: ns}, function(err, data){
    if(err) return next(err);
    req.col.indexes = data;
    next();
  });
}
