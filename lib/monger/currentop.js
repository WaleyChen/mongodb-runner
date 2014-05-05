var Poller = require('./strategy/poller'),
  util = require('util'),
  debug = require('debug')('mongoscope:currentop');

module.exports = CurrentOp;

function CurrentOp(db){
  if(!(this instanceof CurrentOp)) return new CurrentOp(db);
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
  this.cursor = this.db.collection('$cmd.sys.inprog').findOne(function(err, doc){
    if(err) return this.emit('error', err);
    this.emit('data', doc.inprog);
  }.bind(this));
  return this;
};
