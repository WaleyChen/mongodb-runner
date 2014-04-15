var util = require('util'),
  events = require('events');

function Poller(db, cmd, opts){
  opts = opts || {};
  this.db = db;
  this.cmd = cmd;
  this.first = true;

  // How often to sample mongod
  this.interval = opts.interval || 1000;
  this.intervalId = null;
}
util.inherits(Poller, events.EventEmitter);

Poller.prototype.find = function(){
  this.cursor = this.db.command(this.cmd, {}, function(err, data){
    if(err) return this.emit('error', err);

    if(this.first){
      this.first = false;
      return this.emit('first sample', data);
    }
    this.emit('sample', data);
  }.bind(this));
  return this;
};

// FakeCursor interface methods.
Poller.prototype.toArray = Poller.prototype.end = function(fn){
  this.on('error', fn);
  this.on('data', function(data){
    fn(null, data);
    this.close();
  }.bind(this));
  return this;
};

Poller.prototype.listen = function(){
  this.intervalId = setInterval(this.find.bind(this), this.interval);
  return this;
};

Poller.prototype.close = function(){
  clearTimeout(this.intervalId);
  if(this.cursor){
    this.cursor.close();
  }
  return this;
};

module.exports = Poller;
