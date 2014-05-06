var util = require('util'),
  events = require('events'),
  debug = require('debug')('monger:strategy:cursor');

module.exports = CursorStrategy;

function CursorStrategy(db){
  this.db = db;
  this.fltrs = [];
  this.cursor = null;
  this.selector = null;
}
util.inherits(CursorStrategy, events.EventEmitter);

CursorStrategy.prototype.end = function(fn){
  debug('end called');
  if(!this.cursor) this.find();
  this.cursor.toArray(fn);
  this.close();
};

CursorStrategy.prototype.first = function(fn){
  this.end(function(err, docs){
    if(err) return fn(err);

    fn(err, docs[0]);
  });
};

CursorStrategy.prototype.close = function(){
  if(this.cursor){
    debug('closing cursor');
    this.cursor.close();
  }
  return this;
};

CursorStrategy.prototype.listen = function(opts){
  this.find(opts, {tailable: 1});
  return this;
};

CursorStrategy.prototype.filter = function(key, val){
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

CursorStrategy.prototype.skipOp = function(data){
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

CursorStrategy.prototype.where = function(where){
  this.selector = where;
  return this;
};

CursorStrategy.prototype.sort = function(sort){
  this.cursor.sort(sort);
  return this;
};


CursorStrategy.prototype.explain = function(fn){
  this.cursor.explain(fn);
  this.cursor.close();
  return this;
};

CursorStrategy.prototype.skip = function(n){
  this.cursor.skip(n);
  return this;
};

CursorStrategy.prototype.limit = function(n){
  this.cursor.limit(n);
  return this;
};

CursorStrategy.prototype.count = function(fn){
  if(!this.cursor) this.find();
  this.cursor.count(fn);
  this.cursor.close();
  return this;
};

