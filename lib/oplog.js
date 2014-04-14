var Timestamp = require('bson').Timestamp,
    ops = {
      i: 'insert',
      u: 'update',
      d: 'remove'
    },
    directions = {
      head: 1,
      tail: -1
    };
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

module.exports = function(db){
  return new Oplog(db);
};

function Oplog(db, filters){
  this.db = db;
  this.filters = filters || [];
  this.cursor = null;
  this.selector = null;
}

Oplog.prototype.filter = function(key, val){
  if(!key && !val) return this;
  if(key && Array.isArray(key)){
    key.map(function(f){
      this.filter(f[0], f[1]);
    }.bind(this));
    return this;
  }
  this.fltrs.push({key: key, val: val.pattern || val});
  return this;
};

Oplog.prototype.since = function(ts){
  this.selector = {};
  this.selector.ts = {
    $gte: new Timestamp(0, ts)
  };
  return this;
};

Oplog.prototype.skipOp = function(data){
  if(this.fltrs.length === 0) return false;

  return this.fltrs.filter(function(f){
    var expr,
      val;

    if(f.name === 'database' || f.name === 'db'){
      expr = f.val + '.*';
      val = data.ns;
    }
    else if(f.name === 'collection'){
      expr = '*.' + f.val;
      val = data.ns;
    }
    else {
      // it's a document key
      expr = f.val;
      val = data.o[f.name];
    }
    return !(new RegExp(expr).test(val));
  }).length > 0;
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
  this.since(data.ts).emit('op', data);

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

  var cursor = this.db
    .collection('oplog.rs')
    .find(this.selector, opts);

  if(opts.tailable === 1){
    cursor = cursor.each(this.each.bind(this));
  }

  cursor.end = cursor.toArray;
  cursor.first = function(fn){
    cursor.end(function(err, docs){
      fn(err, docs[0]);
    });
  };
  this.cursor = cursor;

  return cursor;
};

Oplog.prototype.close = function(){
  this.cursor.close();
};

Oplog.prototype.listen = function(which){
  this.cursor = this.find(which, {tailable: 1});
  return this;
};
