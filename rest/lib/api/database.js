'use strict';

var mw = require('../db-middleware'),
  token = mw.token,
  errors = require('./errors'),
  NotAuthorized = errors.NotAuthorized,
  debug = require('debug')('mg:mongorest:database');

module.exports = function(app){
  app.get('/api/v1/:host/:database_name', token.required, mw.database(), stats, collections, function(req, res){
    res.send({
      name: req.param('database_name'),
      collection_names: req.database.collection_names,
      stats: req.database.stats
    });
  });

  app.get('/api/v1/:host/:database_name/currentOp', token.required, mw.database(), currentOp);
  app.get('/api/v1/:host/:database_name/oplog', token.required, mw.database(), oplog);
};


function currentOp(req, res, next){
  req.database.collection('$cmd.sys.inprog', {strict: true}, function(err, col){
    if(err) return next(err);

    col.find({}).stream({transform: function(doc){
      return doc.inprog;
    }}).pipe(res);
  });
}

// @todo: https://github.com/cloudup/mydb-tail/blob/master/index.js
// @todo: tailable + socketio stream
function oplog(req, res, next){
  req.database.collection('local.oplog.$main', {strict: true}, function(err, collection){
    collection.find({}).toArray(function(err, docs){
      if(err) return next(err);
      res.send(docs);
    });
  });
  // @see https://github.com/mongodb/node-mongodb-native/blob/e5c3ea13a018e5603df3963ac2dae4839bccfb24/examples/oplog.js
  // collection.find({'ts': {'$gt': time}}, {'tailable': 1, 'sort': [['$natural', 1]]}).each(function(err, item) {
  //   if (cursor.state == Cursor.CLOSED) { //broken cursor
  //     self.running && self._runSlave(collection, time);
  //     return;
  //   }
  //   time = item['ts'];

  //   switch(item['op']) {
  //     case 'i': //inserted
  //       self._emitObj(item['o']);
  //       break;
  //     case 'u': //updated
  //       self.db.collection(item['ns']).findOne(item['o2']['_id'], {}, function(err, item) {
  //         item && self._emitObj(item);
  //       });
  //       break;
  //     case 'd': //deleted
  //       //nothing to do
  //       break;
  //   }
  // });
}

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
