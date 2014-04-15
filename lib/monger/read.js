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

  if(opts.tailable === 1){
    this.cursor.each(this.each.bind(this));
  }
  return this;
};
