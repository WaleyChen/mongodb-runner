var debug = require('debug')('monger:top'),
  Poller = require('./strategy/poller'),
  util = require('util');

module.exports = Top;

function Top(db, opts){
  if(!(this instanceof Top)) return new Top(db, opts);

  opts = opts || {};
  this.prev = null;
  this.sampleCount = 0;

  this.computedProperties = {
    'read': ['queries', 'getmore'],
    'write': ['insert', 'update', 'remove'],
    'lock': ['readlock', 'writelock']
  };

  // Additional/override computed properties
  if(opts.computedProperties){
    Object.keys(opts.computedProperties).map(function(name){
      this.computedProperties[name] = opts.computedProperties[name];
    }.bind(this));
  }

  // regex of namespaces to exclude
  this.exclude = opts.exclude || /(^(local|admin)|(system\.indexes|system\.namespaces))/;

  this.on('first sample', function(data){
    var res = this.prev = this.normalize(data.documents[0].totals);
    this.emit('data', res);
  }.bind(this));


  // @todo: if new metrics were added in this sample, pull them out
  // to their own key?
  this.on('sample', function(data, force){
    var res = this.normalize(data.documents[0].totals);

    if(res.metrics.length === 0) return debug('empty instance');

    this.emit('data', {
      namespaces: res.namespaces,
      deltas: this.calculateDeltas(res.metrics)
    }, force);

    this.sampleCount++;

    this.prev = res;
  }.bind(this));

  Poller.call(this, db, {top: 1}, opts);
}
util.inherits(Top, Poller);


Top.prototype.calculateDeltas = function(metrics){
  var deltas = {}, self = this;
  Object.keys(metrics).map(function(key){
    deltas[key] = metrics[key] - self.prev.metrics[key];
  });
  return deltas;
};

Top.prototype.compute = function(ns, res){
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

Top.prototype.normalize = function(data){
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
