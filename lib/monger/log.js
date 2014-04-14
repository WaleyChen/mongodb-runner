var mongolog = require('mongolog'),
  Poller = require('./strategy/poller'),
  util = require('util');

module.exports = Log;

function Log(db){
  if(!(this instanceof Log)) return new Log(db);
  this.prev = null;

  this.on('first sample', function(data){
    var logs = mongolog.parse(data.log);
    this.prev = (logs[logs.length - 1]);
    this.emit('data', logs);
  }.bind(this));

  this.on('sample', function(data){
    var newLines = [],
      converged = false,
      lines = data.log;

    while(!converged){
      var line = mongolog.parse(lines.pop());
      if(line.message === this.prev.message){
        converged = true;
        return;
      }
      newLines.push(line);
    }

    if(newLines.length > 0){
      this.emit('data', newLines);
      this.prev = newLines[newLines.length - 1];
    }
  }.bind(this));

  return Poller.call(this, db, {getLog: 'global'});
}
util.inherits(Log, Poller);
