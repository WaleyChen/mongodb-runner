"use strict";

var stream = require('stream'),
  util = require('util'),
  mongolog = require('mongolog'),
  debug = require('debug')('mg:smongo');

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
  this.interval = opts.interval || 1000;
  this.intervalId = null;
  this.readable = false;
  this.writable = false;

  stream.Readable.call(this, {objectMode: true});
}
util.inherits(CommandStream, stream.Readable);

CommandStream.prototype._pause = function(){
  clearTimeout(this.intervalId);
};

CommandStream.prototype._resume = function(size){
  var self = this;
  function go(){
    self.sample(function(err, data){
      if(err) return self.emit('error', err);
      self.emit('sample', data);
    });
  }

  this.intervalId = setInterval(function(){
    go();
  }, this.interval);
};

CommandStream.prototype._read = function(size){
  var self = this;
  this.sample(function(err, data){
    if(err) return self.emit('error', err);
    self.emit('first sample', data);
    self.readble = true;
    self._resume(size);
  });
};

CommandStream.prototype.sample = function(fn){
  var self = this;
  self.db.command(self.cmd, {}, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

CommandStream.prototype.socketio = function(uri, io){
  this.subscribers = null;
  this.paused = false;
  this.uri = uri;

  var self = this;
  io.sockets.on('connection', function(socket){
    socket.on(uri, function(){
        if(self.subscribers === null){
          self.on('data', function(data){
            var ids = Object.keys(self.subscribers);
            debug('pushing to ' + ids.length + ' subscribers');

            ids.map(function(id){
              self.subscribers[id].emit(uri, data);
            });
          });
          self.subscribers = {};
          debug('got initial connection');
        }
        self.subscribers[socket.id] = socket;
      })
      .on(uri + '/unsubscribe', function(){
        if(self.subscribers[socket.id]){
          debug('unsubscribing');
          delete self.subscribers[socket.id];
        }
      }).on('disconnect', function(){
        debug('disconnect');
        if(self.subscribers !== null && self.subscribers[socket.id]){
          delete self.subscribers[socket.id];
        }
      });
  });
  return this;
};

function TopStream(db, opts){
  opts = opts || {};
  this.prev = null;
  this.sampleCount = 0;

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
  this.exclude = opts.exclude || /(^(local|admin)|(system\.indexes|system\.namespaces))/;

  this.on('first sample', function(data){
    var res = self.prev = self.normalize(data.documents[0].totals);
    debug('#sample', -1);
    debug('mongodmon.namespaces.count', res.namespaces.length);
    debug('mongodmon.metrics.count', res.metric_count);
  });


  // @todo: if new metrics were added in this sample, pull them out
  // to their own key?
  this.on('sample', function(data, force){
    var res = self.normalize(data.documents[0].totals);

    if(res.metrics.length === 0) return debug('empty instance');

    self.emit('data', {
      namespaces: res.namespaces,
      deltas: self.calculateDeltas(res.metrics)
    }, force);
    // debug('#sample', self.sampleCount);
    // debug('mongodmon.namespaces.count', res.namespaces.length);
    // debug('mongodmon.metrics.count', res.metric_count);
    self.sampleCount++;

    self.prev = res;
  });

  CommandStream.call(this, db, {top: 1}, opts);

  this.debug = require('debug')('mg:smongo:top');
}
util.inherits(TopStream, CommandStream);

TopStream.prototype.calculateDeltas = function(metrics){
  var deltas = {}, self = this;
  Object.keys(metrics).map(function(key){
    deltas[key] = metrics[key] - self.prev.metrics[key];
  });
  return deltas;
};

TopStream.prototype.compute = function(ns, res){
  var self = this,
    summer = function(a, b){
      return a + b;
    };

  Object.keys(this.computedProperties).map(function(name){
    var propCount = self.computedProperties[name].length,
      counts = [], times = [];

    self.computedProperties[name].map(function(k){
      counts.push(res.metrics[ns + '.' + k + '.count']);
      times.push(res.metrics[ns + '.' + k + '.time']);
    });

    res.metrics[ns + '.' + name + '.count'] = counts.reduce(summer);
    res.metrics[ns + '.' + name + '.time'] =  times.reduce(summer) / propCount;
  });
};

TopStream.prototype.normalize = function(data){
  var totals = data[':'];
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
    res = {
      time: new Date(),
      namespaces: [],
      metrics: {},
      metric_count: 0
    };

  Object.keys(data).map(function(ns){
    if(self.exclude.test(ns)) return;

    var src = ns, dest = ns;
    if(ns === ''){
      dest = 'total';
    }

    res.namespaces.push(dest);

    keys.map(function(k){
      var metric = dest + '.' + k.toLowerCase();
      res.metrics[metric + '.count'] = data[src][k].count;
      res.metrics[metric + '.time'] = data[src][k].time;
      res.metric_count++;
    });

    if(dest !== 'total'){
      self.compute(ns, res);
    }
  });

  res.changed = self.prev && (
    this.prev.metrics['total.count'] !== res.metrics['total.count'] ||
    this.prev.metrics['total.time'] !== res.metrics['total.time']);

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

