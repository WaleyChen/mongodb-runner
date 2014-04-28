// # Collection
//
// `/api/v1/:host/:database_name/:collection_name`
var debug = require('debug')('mongoscope:collection'),
  errors = require('../errors'),
  importer = require('../importer'),
  eventSource = require('event-source-emitter'),
  createReader = require('../monger/read'),
  bodyParser = require('body-parser'),
  nconf = require('nconf');

module.exports = function(app){
  app.get('/api/v1/:host/:database_name/:collection_name', stats, indexes, get);
  app.get('/api/v1/:host/:database_name/:collection_name/count', read('count'));
  app.get('/api/v1/:host/:database_name/:collection_name/find', read('find'));

  // ### `/aggregate` Run an aggregation pipeline
  //
  // @param  {Array} pipeline
  // @option {Boolean} explain
  // @option {Boolean} allowDiskUse
  // @option {Object} cursor
  // @api public
  app.get('/api/v1/:host/:database_name/:collection_name/aggregate', function(req, res, next){
    var pipeline = JSON.parse(req.param('pipeline')),
      opts = {
        explain: (parseInt(req.param('explain', 0), 10) === 1),
        allowDiskUse: (parseInt(req.param('allowDiskUse', 0), 10) === 1)
      };

    // @todo: move to monger.
    // @todo: if you request aggregation as a stream, automatically default the
    //    batchSize to 10.
    if(req.param('cursor')) opts.cursor = JSON.parse(req.param('cursor'));

    req.col.aggregate(pipeline, opts, function(err, docs){
      if(err) return next(err);
      res.send(docs);
    });
  });

  app.get('/api/v1/:host/:database_name/:collection_name/distinct/:key',  distinct);
  app.get('/api/v1/:host/:database_name/:collection_name/plans',  plans);

  if(!nconf.get('readonly')){
    app.post('/api/v1/:host/:database_name/:collection_name/import', bodyParser(), importer);
  }
};

function distinct(req, res, next){
  var where = JSON.parse(req.param('where', '{}'));
  req.col.distinct(req.param('key'), where, function(err, docs){
    if(err) return next(err);
    res.send(docs);
  });
}

// ### `/plans` Planner inspection
//
// By default, [listQueryShapes][0] from the plan cache.
// Include `:where`, `:sort`, and `:projection` as json strings to run
// [getPlansByQuery][1].
//
// [0]: http://docs.mongodb.org/manual/reference/method/PlanCache.listQueryShapes
// [1]: http://docs.mongodb.org/manual/reference/method/PlanCache.getPlansByQuery
//
// @option {Object} where
// @option {Object} sort
// @option {Object} projection
function plans(req, res, next){
  var where = req.param('where'),
    sort = req.param('sort'),
    projection = req.param('projection'),
    spec = {};

  if(!where && !sort && !projection){
    spec = {planCacheListQueryShapes: req.param('collection_name')};

    return req.db.command(spec, function(err, data){
      if(err) return next(err);
      res.send(data.shapes);
    });
  }

  spec = {
    planCacheListPlans: req.param('collection_name'),
    query: JSON.parse(where || ''),
    projection: JSON.parse(projection || '{}'),
    sort: JSON.parse(sort || '{}')
  };

  req.db.command(spec, function(err, data){
    if(err) return next(err);
    res.send(data.shapes);
  });
}

function read(method){
  return function(req, res, next){
    var reader = createReader(req.db, req.param('collection_name'))
      .where(JSON.parse(req.param('where', '{}')))
      .find()
      .skip(Math.max(0, req.param('skip', 0)))
      .limit(Math.min(10, req.param('limit', 10)));

    if(req.param('sort')) reader.sort(JSON.parse(req.param('sort')));

    // @todo: this could be shared by more actions.
    if(parseInt(req.param('explain', 0), 10) === 1){
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

    // @todo: monger now does this automatically, but we aren't wired up to
    // it right just yet.
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
  req.db.command({collStats: req.param('collection_name'), verbose: 1}, {}, function(err, data){
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
