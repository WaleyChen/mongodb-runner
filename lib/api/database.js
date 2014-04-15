var debug = require('debug')('mongoscope:database'),
  NotAuthorized = require('../errors').NotAuthorized,
  eventSource = require('event-source-emitter'),
  read = require('../monger/read');

module.exports = function(app){
  app.get('/api/v1/:host/:database_name', stats, names, function(req, res){
    res.send({
      name: req.db.name,
      collection_names: req.db.collection_names,
      stats: req.db.stats
    });
  });

  app.get('/api/v1/:host/:database_name/profiling', function(req, res, next){
    req.mongo.admin().profilingLevel(function(err, data){
      if(err) return next(err);
      if(!data) return next(new NotAuthorized('not authorized to view profiling'));

      res.send({profiling: data});
    });
  });

  app.get('/api/v1/:host/:database_name/profiling/entries', function(req, res, next){
    var reader = read(req.db, 'system.profile');

    if(req.headers.accept === 'text/event-source'){
      var es = eventSource(req, res, {keepAlive: true});

      reader.on('data', function(doc){
        es.emit('data', doc);
      });

      req.on('close', function() {
        reader.close();
      });
      return reader.listen();
    }

    reader.find().end(function(err, entries){
      if(err) return next(err);
      res.send(entries);
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

function names(req, res, next){
  read(req.db, 'system.namespaces').find().end(function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view collections for this database'));

    req.db.collection_names = data.filter(function(col){
      return !(col.name.indexOf('$') >= 0 && col.name.indexOf('.oplog.$') < 0);
    }).map(function(col){
      return col.name.replace(req.db.databaseName + '.', '');
    });
    next();
  });
}
