var debug = require('debug')('mongoscope:collection'),
  errors = require('../errors'),
  importer = require('../importer'),
  eventSource = require('event-source-emitter'),
  createReader = require('../monger/read'),
  bodyParser = require('body-parser');

module.exports = function(app){
  app.get('/api/v1/:host/:database_name/:collection_name', stats, indexes, get);
  app.get('/api/v1/:host/:database_name/:collection_name/count', read('count'));
  app.get('/api/v1/:host/:database_name/:collection_name/find', read('find'));

  app.get('/api/v1/:host/:database_name/:collection_name/aggregate', aggregate);

  app.post('/api/v1/:host/:database_name/:collection_name/import', bodyParser(), importer);
};

function aggregate(req, res, next){
  req.col.aggregate(JSON.parse(req.param('pipeline')), function(err, result){
    if(err) return next(err);
    res.send(result);
  });
}

function read(method){
  return function(req, res, next){
    var reader = createReader(req.db, req.param('collection_name'))
      .where(JSON.parse(req.param('where', '{}')))
      .find()
      .skip(Math.max(0, req.param('skip', 0)))
      .limit(Math.min(10, req.param('limit', 10)));

    if(parseInt(req.param('explain', 0), 10) === 1){
      debug('running explain');
      return reader.explain(function(err, data){

        if(err) return next(err);
        res.send(data);
      });
    }

    if(method === 'count'){
      return reader.count(function(err, data){
        if(err) return next(err);
        res.send({count: data});
      });
    }

    if(req.headers.accept === 'text/event-stream'){
      var client = eventSource(req, res, {keepAlive: true});
      reader.on('data', function(data){
        client.emit('data', data);
      });

      req.on('close', function() {
        reader.close();
      });
      return reader.find();
    }

    reader.end(function(err, docs){
      if(err) return next(err);
      res.send(docs);
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
  debug('get stats');
  req.db.command({collStats: req.param('collection_name')}, {}, function(err, data){
    if(err){
      if(err.message.indexOf('not found') > -1){
        return next(new errors.NotFound('Collection does not exist'));
      }
      return next(err);
    }

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
  req.db.collection('system.indexes', function(err, col){
    col.find({ns: ns}).toArray(function(err, data){
      if(err) return next(err);
      req.col.indexes = data;
      next();
    });
  });
}
