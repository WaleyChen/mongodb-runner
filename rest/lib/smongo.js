"use strict";

var stream = require('stream'),
  util = require('util'),
  mongolog = require('mongolog');

module.exports.createTopStream = function(db, opts){
  return new TopStream(db, opts);
};

module.exports.createLogStream = function(db, opts){
  return new LogStream(db, opts);
};

function CommandStream(db, cmd, opts){
  opts = opts || {};
  this.db = db;
  this.cmd = cmd;
  this.debug = require('debug')('mg:smongo:command');

  // How often to sample mongod
  this.interval = opts.interval || 500;
  this.intervalId = null;
  this.readable = false;
  this.writable = false;

  stream.Readable.call(this, {objectMode: true});
}
util.inherits(CommandStream, stream.Readable);

CommandStream.prototype._pause = function(){
  clearTimeout(this.intervalId);
};

CommandStream.prototype._resume = function(){
  var self = this;
  this.intervalId = setInterval(function(){
    self.sample(function(err, data){
      if(err) return self.emit('error', err);
      self.emit('sample', data);
    });
  }, this.interval);
};

CommandStream.prototype._read = function(){
  var self = this;
  this.sample(function(err, data){
    if(err) return self.emit('error', err);
    self.emit('first sample', data);
    self.readble = true;
    self._resume();
  });
};

CommandStream.prototype.sample = function(fn){
  var self = this;
  self.db.command(self.cmd, {}, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

function TopStream(db, opts){
  opts = opts || {};
  this.prev = null;
  this.computedProperties = {
    'read': ['queries', 'getmore'],
    'write': ['insert', 'update', 'remove'],
    'lock': ['readlock', 'writelock']
  };

  var self = this;

  // Additional/override computed properties
  if(opts.computedProperties){
    Object.keys(opts.computedProperties).map(function(name){
      self.computedProperties[name] = opts.computedProperties[name];
    });
  }

  // regex of namespaces to exclude
  this.exclude = opts.exclude || /^(local|admin)/;

  this.on('first sample', function(data){
    self.prev = self.normalize(data.documents[0].totals);
  });

  this.on('sample', function(data){
    self.emit('data', self.calculateDeltas(
      self.normalize(data.documents[0].totals)));
  });
  CommandStream.call(this, db, {top: 1}, opts);

  this.debug = require('debug')('mg:smongo:top');
}
util.inherits(TopStream, CommandStream);

TopStream.prototype.calculateDeltas = function(data){
  var deltas = {}, self = this;
  Object.keys(data).map(function(key){
    deltas[key] = data[key] - self.prev[key];
  });
  return deltas;
};

TopStream.prototype.compute = function(ns, data){
  var self = this,
    summer = function(a, b){
      return a + b;
    };
  this.debug('calculating computed properties', ns);

  Object.keys(this.computedProperties).map(function(name){
    var propCount = self.computedProperties[name].length,
      counts = [], times = [];

    self.computedProperties[name].map(function(k){
      counts.push(data[ns + '.' + k + '.count']);
      times.push(data[ns + '.' + k + '.time']);
    });

    data[ns + '.computed_' + name + '.count'] = counts.reduce(summer);
    data[ns + '.computed_' + name + '.time'] =  times.reduce(summer) / propCount;
  });
};

TopStream.prototype.normalize = function(data){
  this.debug('normalizing server response');
  // this.total = data[':'];
  delete data[':'];
  delete data.note;

  var keys = [
      'total',
      'readLock',
      'writeLock',
      'queries',
      'getmore',
      'insert',
      'update',
      'remove',
      'commands'
    ],
    self = this,
    res = {};

  Object.keys(data).map(function(ns){
    if(ns === ''){
      // Exclude total
      return;
    }
    if(self.exclude.test(ns)){
      self.debug('excluding', ns);
      return;
    }

    keys.map(function(k){
      var destKey = ns + '.' + k.toLowerCase();
      res[destKey + '.count'] = data[ns][k].count;
      res[destKey + '.time'] = data[ns][k].time;
    });
    self.compute(ns, res);
  });
  return res;
};

function LogStream(db, opts){
  opts = opts || {};
  this.prev = null;

  var self = this;
  this.on('first sample', function(data){
    var lines = mongolog.parse(data.documents[0].log);
    self.prev = lines[lines.length - 1];
    self.emit('data', lines);
  });

  this.on('sample', function(data){
    var newLines = [],
      converged = false,
      lines = data.documents[0].log;

    while(!converged){
      var line = mongolog.parse(lines.pop());
      if(line.message === self.prev.message){
        converged = true;
        return;
      }
      newLines.push(line);
    }

    if(newLines.length > 0){
      self.emit(newLines);
    }
  });

  CommandStream.call(this, db, {getLog: opts.name || 'global'}, opts);

  this.debug = require('debug')('mg:smongo:log');
}
util.inherits(LogStream, CommandStream);

