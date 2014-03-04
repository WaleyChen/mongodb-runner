"use strict";

var stream = require('stream'),
  util = require('util'),
  debug = require('debug')('mongorest:top');

function MongoStream(db, cmd, opts){
  opts = opts || {};
  this.db = db;
  this.cmd = cmd;

  // How often to sample mongod
  this.interval = opts.interval || 500;
  this.intervalId = null;
  this.readable = false;
  this.writable = false;

  stream.Readable.call(this, {objectMode: true});
}
util.inherits(MongoStream, stream.Readable);

MongoStream.prototype._pause = function(){
  clearTimeout(this.intervalId);
};

MongoStream.prototype._resume = function(){
  var self = this;
  this.intervalId = setInterval(function(){
    self.sample(function(err, data){
      if(err) return self.emit('error', err);
      self.emit('sample', data);
    });
  }, this.interval);
};

MongoStream.prototype._read = function(){
  var self = this;
  this.sample(function(err, data){
    if(err) return self.emit('error', err);
    self.emit('first sample', data);
    self.readble = true;
    self._resume();
  });
};

MongoStream.prototype.sample = function(fn){
  var self = this;
  self.db.command(self.cmd, {}, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

function TopStream(db, opts){
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
  MongoStream.call(this, db, {top: 1}, opts);
}
util.inherits(TopStream, MongoStream);

TopStream.prototype.calculateDeltas = function(data){
  var deltas = {}, self = this;
  Object.keys(data).map(function(key){
    deltas[key] = data[key] - self.prev[key];
  });
  return deltas;
};

TopStream.prototype.compute = function(ns, data){
  var self = this;
  debug('calculating computed properties', ns);

  Object.keys(this.computedProperties).map(function(name){
    data[ns + '/computed_' + name + '/count'] = self.computedProperties[name].map(function(k){
      return data[ns + '/' + k + '/count'];
    }).reduce(function(a, b){ return a + b; });

    data[ns + '/computed_' + name + '/time'] =  self.computedProperties[name].map(function(k){
      return data[ns + '/' + k + '/time'];
    }).reduce(function(a, b){ return a + b; }) / self.computedProperties[name].length;
  });
};

TopStream.prototype.normalize = function(data){
  debug('normalizing server response');
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
      debug('excluding', ns);
      return;
    }

    keys.map(function(k){
      var destKey = ns + '/' + k.toLowerCase();
      res[destKey + '/count'] = data[ns][k].count;
      res[destKey + '/time'] = data[ns][k].time;
    });
    self.compute(ns, res);
  });
  return res;
};

module.exports = TopStream;

module.exports.routes = function(app){
  var io = app.get('io'),
    top = new TopStream(app.get('db').admin());

  io.sockets.on('connection', function(socket){
    top.on('data', function(topDeltas){
      socket.emit('top', topDeltas);
    }).on('error', function(err){
      socket.emit('top error', err);
    });
  });
};
