'use strict';

var stream = require('stream'),
  util = require('util'),
  mongolog = require('mongolog'),
  debug = require('debug')('mg:smongo');

function middleware(klass, app){
  var io = app.get('io'),
    uri = '/' + klass.prototype.name;

  // @todo: token challenge.
  io.sockets.on('connection', function(socket){
    socket.on(uri, function(host){
      Poller.getInstance(klass, app._connections[host].admin())
        .socketio(uri, socket);
    });
  });

  return function(req, res){
    Poller.getInstance(klass, app._connections[req.param('host')].admin())
      .once('data', function(data){
        res.send(data);
      }).read(1);
  };
}

module.exports.log = function(app){
  return middleware(LogStream, app);
};

module.exports.top = function(app){
  return middleware(TopStream, app);
};

function Poller(db, cmd, opts){
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
util.inherits(Poller, stream.Readable);

Poller.instances = {};

Poller.getInstance = function(klass, db){
  var name = klass.prototype.name;

  if(!Poller.instances[name]) Poller.instances[name] = {};

  if(!Poller.instances[name][db.id]){
    Poller.instances[name][db.id] = new TopStream(db);
  }
  return Poller.instances[name][db.id];
};

Object.defineProperty(Poller.prototype, 'uri', {get: function(){
  return '/' + this.name;
}});

Poller.prototype._pause = function(){
  clearTimeout(this.intervalId);
};

Poller.prototype._resume = function(){
  this.intervalId = setInterval(this.sample.bind(this), this.interval);
};

Poller.prototype._read = function(size){
  var self = this;
  this.sample(function(err, data){
    if(err) return self.emit('error', err);
    self.emit('first sample', data);
    self.readble = true;
    self._resume(size);
  });
};

Poller.prototype.sample = function(fn){
  var self = this;
  self.db.command(self.cmd, {}, function(err, data){
    if(fn){
      if(err) return fn(err);
      return fn(null, data);
    }

    if(err) return self.emit('error', err);
    self.emit('sample', data);
  });
};

Poller.prototype.socketio = function(socket){
  var self = this;

  if(!stream.subscribers){
    stream.subscribers = {};

    stream.on('data', function(data){
      var ids = Object.keys(stream.subscribers);
      self.debug('pushing to ' + ids.length + ' subscribers');

      ids.map(function(id){
        stream.subscribers[id].emit(this.uri, data);
      });
    });
    self.debug('got initial connection');
  }
  stream.subscribers[socket.id] = socket;

  function unsub(){
    if(stream.subscribers[socket.id]){
      self.debug('unsubscribing');
      delete stream.subscribers[socket.id];
    }
  }

  socket.on(this.uri + '/unsubscribe', unsub)
    .on('disconnect', unsub);
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

    self.sampleCount++;

    self.prev = res;
  });

  Poller.call(this, {top: 1}, opts);

  this.debug = require('debug')('mg:smongo:top');
}
util.inherits(TopStream, Poller);

TopStream.prototype.name = 'top';

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

    // Skip the special total key because it will have stats in there
    // for internal only calls and it won t make any sense to the user.
    if(ns === '') return false;

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
  this.name = 'log';
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

  Poller.call(this, db, {getLog: opts.name || 'global'}, opts);

  this.debug = require('debug')('mg:smongo:log');
}
util.inherits(LogStream, Poller);

LogStream.prototype.name = 'log';
