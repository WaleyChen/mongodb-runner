var Poller = require('./strategy/poller'),
  util = require('util'),
  debug = require('debug')('mongoscope:currentop');

module.exports = CurrentOp;

function CurrentOp(db, opts){
  opts = opts || {};
  this.all = opts.all || false;
  if(!(this instanceof CurrentOp)) return new CurrentOp(db, opts);
  return Poller.call(this, db, {});
}
util.inherits(CurrentOp, Poller);

// @todo: normalize like everything else
//
// [
//   {
//     "active": true,
//     "client": "127.0.0.1:55330",
//     "connectionId": 1489,
//     "desc": "conn1489",
//     "lockStats": {
//       "timeAcquiringMicros": {
//         "r": 11,
//         "w": 0
//       },
//       "timeLockedMicros": {
//         "r": 113,
//         "w": 0
//       }
//     },
//     "ns": "local.oplog.rs",
//     "numYields": 0,
//     "op": "getmore",
//     "opid": 47577,
//     "query": {},
//     "secs_running": 2,
//     "threadId": "0x11471f000",
//     "waitingForLock": false
//   },
//   {
//     "active": true,
//     "client": "127.0.0.1:55328",
//     "connectionId": 1487,
//     "desc": "conn1487",
//     "lockStats": {
//       "timeAcquiringMicros": {
//         "r": 14,
//         "w": 0
//       },
//       "timeLockedMicros": {
//         "r": 100,
//         "w": 0
//       }
//     },
//     "ns": "local.oplog.rs",
//     "numYields": 0,
//     "op": "getmore",
//     "opid": 47576,
//     "query": {},
//     "secs_running": 2,
//     "threadId": "0x114e2d000",
//     "waitingForLock": false
//   }
// ]
CurrentOp.prototype.find = function(){
  var spec = {};
  if(this.all) spec.$all = 1;

  this.cursor = this.db.collection('$cmd.sys.inprog').findOne(spec, function(err, doc){
    if(err) return this.emit('error', err);
    doc.inprog.sort(function(a, b){
      return (a.secs_running || -1) > (b.secs_running || -1) ? -1 : 1;
    });
    this.emit('data', doc.inprog);
  }.bind(this));
  return this;
};
