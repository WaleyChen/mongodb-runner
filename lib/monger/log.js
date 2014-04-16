var mongolog = require('mongolog'),
  Poller = require('./strategy/poller'),
  util = require('util'),
  debug = require('debug')('mongoscope:log');

module.exports = Log;

function Log(db){
  if(!(this instanceof Log)) return new Log(db);
  this.prev = null;

  this.on('first sample', function(data){
    var logs = mongolog.parse(data.log);
    this.prev = (data.log[data.log.length - 1]);
    this.emit('data', logs);
  }.bind(this));

  this.on('sample', function(data){
    var newLines = [],
      index = data.log.indexOf(this.prev);
    newLines = data.log.slice(index + 1);

    if(newLines.length > 0){
      debug('emitting');
      this.emit('data', mongolog.parse(newLines));
      this.prev = newLines[newLines.length - 1];
    }
  }.bind(this));

  return Poller.call(this, db, {getLog: 'global'});
}
util.inherits(Log, Poller);
