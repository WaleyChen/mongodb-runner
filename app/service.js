var $ = require('jquery'),
  _ = require('underscore'),
  regret = require('regret'),
  debug = require('debug')('mongoscope:service');

// If the value is a struct just for the purposes of including
// type info, recursively collapse down to an instance of the
// native JS type.
//
// only used by:
//
// - {Service.prototype.serverStatus}
//
// @param {Object} data deserialized JSON from the server.
// @api private
//
// @todo Move to own module.
function collapseBsonTypes(data){
  Object.keys(data).map(function(key){
    var $type = Object.keys(data[key])[0],
      deserializer = _bson_type_deserializers[$type];

    if(!deserializer){
      collapseBsonTypes(data[key]);
    }
    else{
      data[key] = deserializer(data[key]);
    }
  });
  return data;
}
var _bson_type_deserializers = {
  $date: function(v){
    return new Date(v);
  },
  $numberLong: function(v){
    return v + '';
  }
};

// Register regexes with regret.
regret.add('isoDate',
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+-[0-5]\d/,
  '2014-02-13T18:00:04.709-0500');

regret.add('mongodbLogLine',
  /({{isoDate}}+) \[(\w+)\] (.*)/,
  '2014-02-13T18:00:04.709-0500 [initandlisten] db version v2.5.6-pre-',
  ['date', 'name', 'message']);

// Wrap the MongoDB REST API in a pretty interface.
//
// @note: You must start mongod with `--rest` and use
// `mongodb-api-proxy <http://github.com/imlucas/mongodb-api-proxy>` for now.
//
// @todo Backbone friendly adapter?
//
// @param {String, default:localhost} Hostname of the instance
// @param {Number, default:3001} Port mongodb-api-proxy is listening on.
// @api public
function Service(hostname, port){
  this.hostname = hostname || 'localhost';
  this.port = port || 3001;
  this.origin = 'http://' + this.hostname + ':' + this.port;
}

// Get parsed JSON from `pathname` and call `fn(err, data)` when complete.
//
// @param {String} pathname
// @param {Object} [params] optional query params
// @param {Function} fn
// @api private
Service.prototype.read = function(pathname, params, fn){
  if(typeof params === 'function'){
    fn = params;
    params = {};
  }

  debug('get', this.origin + pathname, params);

  $.get(this.origin + pathname, params, function(data){
    if(typeof data === 'string'){
      data = JSON.parse(data);
    }

    debug('res', data);
    fn(null, data);
  });
};

// An easier to use top.
//
// @param {Function} fn `(err, {Top})`
// @api public
Service.prototype.top = function(fn){
  this.read('/top', function(err, data){
    if(err) return fn(err);
    fn(null, new Top(data.totals));
  });
};

// Host level metadata.
//
// @param {Function} fn `(err, {HostInfo})`
// @api public
Service.prototype.hostInfo = function(fn){
  this.read('/hostInfo', function(err, data){
    if(err) return fn(err);
    fn(null, new HostInfo(data));
  });
};

// Build params.
//
// @param {Function} fn `(err, {BuildInfo})`
// @api public
Service.prototype.buildInfo = function(fn){
  this.read('/buildInfo', function(err, data){
    if(err) return fn(err);
    fn(null, new BuildInfo(data));
  });
};

// Run an admin command.
//
// @param {String} name Command name
// @param {Number|String, default:1} [value] pass as arg to the command
// @param {String, default:''} [path] dot string to the key in the response we want
// @param {Function} fn
// @api private
Service.prototype.cmd = function(name, value, path, fn){
  if(typeof value === 'function'){
    fn = value;
    path = '';
    value = 1;

  }
  if(typeof path === 'function'){
    fn = path;
    path = value;
    value = 1;
  }

  params = {limit: 1};
  params['filter_' + name] = value;
  this.read('/admin/$cmd/', params, function(err, data){
    if(err) return fn(err);
    var res = data,
      parts = path.split('.'),
      key = '';

    if(path !== ''){
      while(parts.length > 0){
        key = parts.shift();

        if(!isNaN(parseInt(key, 10))){
          key = parseInt(key, 10);
        }

        if(res && res[key]){
          res = res[key];
          continue;
        }
        res = undefined;
        break;
      }
    }
    fn(null, res);
  });
};

// Get a list of log `line` strings.
//
// @param {String, default:global} optional log name to restrict to (default: global).
// @param {Function} fn `(err, [line])`
// @api public
Service.prototype.log = function(name, fn){
  if(typeof name === 'function'){
    fn = name;
    name = 'global';
  }
  this.cmd('getLog', name, 'rows.0.log', function(err, lines){
    if(err) return fn(err);

    var res = _.map(lines, function(line){
      return regret('mongodbLogLine', line);
    });

    fn(null, _.filter(res, function(item){
      return item.message.length > 1;
    }));
  });
};

// Get a list of `db` objects like:
//
//     {
//       name: 'local',
//       sizeOnDisk: 83886080,
//       empty: false
//     },
//     {
//       name: 'admin',
//       sizeOnDisk: 1,
//       empty: true
//     }
//
// @param {Function} fn `fn(err, [db])`
// @api public
//
// @todo Subsequent reads can be done here so controllers stay simple.
Service.prototype.databases = function(fn){
  this.cmd('listDatabases', 'rows.0.databases', function(err, dbs){
    if(err) return fn(err);
    dbs = dbs.filter(function(db){
      return !db.empty && db.name !== 'local';
    }).map(function(db){
      return {name: db.name};
    });
    fn(null, dbs);
  });
};

module.exports = Service;

// Typed and doc'd object wrapper for results from `Service.prototype.top`.
// @todo Move all of this to own module.
function Top(apiData){
  var self = this;

  // Cleanup
  self.total = apiData[':'];
  delete apiData[':'];
  delete apiData.note;

  // Put each namespace stat in it's own nice {TopNamespace} wrapper.
  self.namespaces = Object.keys(apiData).map(function(name){
    if(name.length > 0){
      return new TopNamespace(name, apiData[name]);
    }
    return null;
  }).filter(function(ns){
    return ns !== null;
  });
}

function TopNamespace(name, apiData){
  var self = this;
  self.name = name;
  self.keys().map(function(key){
    self[key] = new TopStat(key, apiData[key]);
  });
  self.read = new TopStat('read', {}).add(self.queries, self.getmore);
  self.write = new TopStat('write', {}).add(self.insert, self.update, self.remove);
  self.lock = new TopStat('lock', {}).add(self.readLock, self.writeLock);
}

// {String}
TopNamespace.prototype.name = '';

// {TopStat}
TopNamespace.prototype.total = {};

// {TopStat} computed client-side
TopNamespace.prototype.read = {};

// {TopStat} computed client-side
TopNamespace.prototype.write = {};

// {TopStat} computed client-side
TopNamespace.prototype.lock = {};

// {TopStat}
TopNamespace.prototype.readLock = {};

// {TopStat}
TopNamespace.prototype.writeLock = {};

// {TopStat}
TopNamespace.prototype.queries = {};

// {TopStat}
TopNamespace.prototype.getmore = {};

// {TopStat}
TopNamespace.prototype.insert = {};

// {TopStat}
TopNamespace.prototype.update = {};

// {TopStat}
TopNamespace.prototype.remove = {};

// {TopStat}
TopNamespace.prototype.commands = {};


TopNamespace.prototype.keys = function(){
  return [
    'total',
    'readLock',
    'writeLock',
    'queries',
    'getmore',
    'insert',
    'update',
    'remove',
    'commands'
  ];
};

TopNamespace.prototype.values = function(){
  var self = this;
  return self.keys().map(function(key){return self[key];});
};

function TopStat(name, apiData){
  this.name = name;
  this.count = apiData.count || 0;
  this.time = apiData.time || 0;
}

TopStat.prototype.add = function(){
  var self = this;

  Array.prototype.slice.call(arguments, 0).map(function(other){
    self.count += other.count;
    self.total += other.total;
  });
  return self;
};

// {Number} of ocurrances.
// @api public
TopStat.prototype.count = 0;

// Time in microseconds.
// @api public
TopStat.prototype.time = 0;


function HostInfo(data){
  this.system_time = new Date(data.system.currentTime.$date);
  this.hostname = data.system.hostname;

  this.os = data.os.name;
  this.os_family = data.os.type;

  this.kernel_version = data.os.version;
  this.kernel_version_string = data.extra.versionString;

  // convert megabytes to bytes
  this.memory_bits = data.system.memSizeMB * 1024 * 1024;
  this.memory_page_size = data.extra.pageSize;

  this.arch = data.system.cpuArch;

  this.cpu_cores = data.system.numCores;
  this.cpu_cores_physical = data.extra.physicalCores;
  this.cpu_scheduler = data.extra.scheduler;

  // MHz to Hz
  this.cpu_frequency = data.extra.cpuFrequencyMHz * 1000000;
  this.cpu_string = data.extra.cpuString;
  this.cpu_features = data.extra.cpuFeatures.split(' ');
  this.cpu_bits = data.system.cpuAddrSize;

  this.machine_model = data.extra.model;

  this.features = {
    numa: data.system.numaEnabled,
    always_full_sync: data.extra.alwaysFullSync,
    nfs_async: data.extra.nfsAsync
  };
}

function BuildInfo(data){
  this.version = data.version;
  this.commit = data.gitVersion;
  this.commit_url = 'https://github.com/mongodb/mongo/commit/' + this.commit;
  this.openssl_version = data.OpenSSLVersion;
  this.boost_version = /BOOST_LIB_VERSION=([\d_]+)/.exec(data.sysInfo)[1].replace('_', '.');
  this.loader_flags = data.loaderFlags;
  this.compiler_flags = data.compilerFlags;
  this.allocator = data.allocator;
  this.javascript_engine = data.javascriptEngine;
  this.debug = data.debug;
  this.for_bits = data.bits;
  this.max_bson_object_size = data.maxBsonObjectSize;
}

// Don't include redundant properties:
//
// - host
// - version
// - localTime
//
// Deprecated properties:
//
// - cursors

function ServerStatus(data){
  delete data.host;
  delete data.version;
  delete data.localTime;
  delete data.cursours;

  data = collapseBsonTypes(data);

  this.process_name = data.process;
  this.process_id = data.pid;

  this.uptime = data.uptimeMillis.$numberLong;

  this.extra_info = data.extra_info;
  this.write_backs_queued = data.writeBacksQueued;

  this.stats = {
    assert: data.asserts,
    background_flush: data.backgroundFlushing,
    connection: data.connections,
    durability: data.dur,
    index: data.indexCounters,
    network: {
      bytes_in: data.network.bytesIn,
      bytes_out: data.network.bytesOut,
      requests: data.network.numRequests
    },
    memory: {
      resident: data.mem.resident,
      virtual: data.mem.virtual,
      mapped: data.mem.mapped,
      mapped_with_journal: data.mem.mappedWithJournal
    },
    operation: data.opcounters,

    // @note: keys are camelcase
    records: data.recordStats,
    replication_operation: data.opcountersRepl
  };

  this.metrics = data.metrics;

  data.lock.total = data.locks[':'];
  delete data.locks[':'];

  data.lock.global = data.globalLock;
  data.lock.by_collection = data.locks;
}
