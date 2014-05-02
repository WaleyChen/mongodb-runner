var mongolog = require('mongolog'),
  Poller = require('./strategy/poller'),
  util = require('util'),
  debug = require('debug')('mongoscope:log');

module.exports = Log;

function Log(db){
  if(!(this instanceof Log)) return new Log(db);
  this.prev = null;
  var max = 100;

  function truncate(data){
    if(data.log.length > max){
      return data.log.slice(data.log.length-max, data.log.length);
    }
    return data.log;
  }

  this.on('first sample', function(data){
    var lines = truncate(data),
      logs = mongolog.parse(lines);

    this.prev = (lines[lines.length - 1]);
    this.emit('data', logs);
  }.bind(this));

  this.on('sample', function(data){
    var newLines = [],
      lines = truncate(data),
      index = lines.indexOf(this.prev);
    newLines = lines.slice(index + 1);

    if(newLines.length > 0){
      debug('emitting');
      this.emit('data', mongolog.parse(newLines));
      this.prev = newLines[newLines.length - 1];
    }
  }.bind(this));

  return Poller.call(this, db, {getLog: 'global'});
}
util.inherits(Log, Poller);
