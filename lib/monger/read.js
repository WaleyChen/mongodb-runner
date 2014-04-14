var CursorStrategy = require('./strategy/cursor'),
  util = require('util');

module.exports = Read;

function Read(db, collectionName){
  if(!(this instanceof Read)) return new Read(db, collectionName);
  CursorStrategy.call(this, db);

  this.collectionName = collectionName;
}
util.inherits(Read, CursorStrategy);

Read.prototype.each = function(err, data){
  if(err) return this.emit('error', err);
  this.emit('data', data);
};

Read.prototype.find = function(which, opts){
  opts = opts || {};

  this.cursor = this.db
    .collection(this.collectionName)
    .find(this.selector, opts);

  this.cursor.each(this.each.bind(this));
  return this;
};

Read.prototype.where = function(where){
  this.selector = where;
  return this;
};

Read.prototype.sort = function(sort){
  this.cursor.sort(sort);
  return this;
};


Read.prototype.explain = function(fn){
  this.cursor.count(fn);
  this.cursor.close();
  return this;
};

Read.prototype.skip = function(n){
  this.cursor.skip(n);
  return this;
};

Read.prototype.limit = function(n){
  this.cursor.limit(n);
  return this;
};

Read.prototype.count = function(fn){
  this.cursor.count(fn);
  this.cursor.close();
  return this;
};
