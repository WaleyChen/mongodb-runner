// For handling REST requests:
//
// ```
// var ts = parseInt(req.param('ts', Date.now() - 1000) / 1000, 10);
// oplog(req.mongo)
//   .since(ts)
//   .find()
//   .end(function(err, docs){
//     res.send(docs);
//   });
// ```
//
// Get the oldest entry:
//
// ```
// oplog(req.mongo)
//   .find('head')
//   .since(0)
//   .limit(1)
//   .first(function(err, op){
//     console.log('Oldest op is', op);
//   });
// ```
//
// Get the most recent entry:
//
// ```
// oplog(req.mongo)
//   .find('tail')
//   .since(0)
//   .limit(1)
//   .first(function(err, op){
//     console.log('Most recent op is', op);
//   });
// ```
//
//Listen for new oplog entries:
//
// ```
// oplog(req.mongo)
//   .listen('tail')
//   .on('op', function(op){
//     console.log('Raw op: ', op);
//   })
//   .on('insert', function(newDoc){
//     console.log('Everyone please welcome', newDoc);
//   })
//   .on('update', function(doc){
//     console.log('Freshly updated', doc);
//   })
//   .on('remove', function(oldDoc){
//     console.log('Say goodbye to', oldDoc);
//   });
// ```
//
// Notify when anyone with a mongodb email signs up:
//
// ```
// oplog(req.mongo)
//   .filter('collection', 'users')
//   .filter('_id', /mongodb.com$/)
//   .listen()
//   .on('insert', function(user){
//     console.log('New user from mongodb:', user);
//   });
// ```
//
// [mydb][mydb] with no redis using server sent events:
//
// ```
// var db = require('mongodb').MongoClient
//   .connect('mongodb://localhost:27017/mydb');
//
// oplog(db)
//   .filter('collection', 'streams')
//   .filter('notify', /bob/)
//   .listen();
// ```
//
// [mydb]: https://github.com/cloudup/mydb

var Timestamp = require('bson').Timestamp,
  CursorStrategy = require('./strategy/cursor'),
  util = require('util'),
  ops = {
    i: 'insert',
    u: 'update',
    d: 'remove'
  },
  directions = {
    head: 1,
    tail: -1
  };

module.exports = Oplog;

function Oplog(db){
  if(!(this instanceof Oplog)) return new Oplog(db);
  CursorStrategy.call(this, db);
}
util.inherits(Oplog, CursorStrategy);

Oplog.prototype.since = function(ts){
  this.selector = {};
  this.selector.ts = {
    $gte: new Timestamp(0, ts)
  };
  return this;
};

// Process each operation as they're yielded
// from the cursor.  If the op should not be skipped
// based on `fltrs`, emit an `op` event with the
// raw oplog document and on of `remove|insert|update`
// with a best guess of data that that come a long with it.
Oplog.prototype.each = function(err, data){
  // @todo: handle broken cursors.
  if(err) return this.emit('error', err);

  if(this.skipOp(data)) return;

  data.name = ops[data.op];
  this.emit('op', data);

  var name = ops[data.op];

  if(name === 'remove'){
    return this.emit('remove', data.o);
  }

  if(name === 'insert'){
    return this.emit(name, data.o);
  }

  var coll = this.db.collection(data.ns);
  coll.findOne(data.o2._id, {}, function(err, doc){
    this.emit('update', doc);
  }.bind(this));
};

Oplog.prototype.find = function(which, opts){
  opts = opts || {};
  opts.sort = [['$natural', directions[which] || directions.tail]];

  if(!this.selector){
    this.since(Date.now() / 1000);
  }

  this.cursor = this.db
    .collection('oplog.rs')
    .find(this.selector, opts);

  if(opts.tailable === 1){
    this.cursor = this.cursor.each(this.each.bind(this));
  }
  return this;
};
