var Backbone = require('backbone'),
  Service = require('./service'),
  debug = require('debug')('mongoscope:models');


var Instance = Backbone.Model.extend({
  defaults: {
    host: window.document.hostname,
    port: 28017
  },
  initialize: function(){
    this.backend = new Service(this.get('host'), this.get('port'));
  }
});

var instance = module.exports = new Instance();

var Model = Backbone.Model.extend({
  service: '',
  sync: function(method, model, options){
    instance.backend[this.service](function(err, data){
      if(err) return options.error(err);
      options.success(data);
    });
  }
});

module.exports.BuildInfo = Model.extend({
  defaults: {
    version: '2.5.6-pre-',
    commit: '518cbb85a00e4e9ac7dc419569aacc3216db45d2',
    commit_url: 'https://github.com/mongodb/mongo/commit/518cbb85a00e4e9ac7dc419569aacc3216db45d2',
    openssl_version: '',
    boost_version: /BOOST_LIB_VERSION=([\d_]+)/.exec('BOOST_LIB_VERSION=1_49')[1].replace('_', '.'),
    loader_flags: '-fPIC -pthread -Wl,-bind_at_load -mmacosx-version-min=10.6',
    compiler_flags: '-Wnon-virtual-dtor -Woverloaded-virtual -fPIC -fno-strict-aliasing -ggdb -pthread -Wall -Wsign-compare -Wno-unknown-pragmas -Winvalid-pch -Werror -pipe -O3 -Wno-unused-function -Wno-unused-private-field -Wno-deprecated-declarations -Wno-tautological-constant-out-of-range-compare -mmacosx-version-min=10.6',
    allocator: 'tcmalloc',
    javascript_engine: 'V8',
    debug: false,
    for_bits: 64,
    max_bson_object_size: 16777216
  },
  service: 'buildInfo'
});

module.exports.HostInfo = Model.extend({
  service: 'hostInfo',
  defaults: {
    system_time: new Date("2014-02-16T00:40:22.929Z"),
    hostname: "Lucass-MacBook-Air.local",
    os: "Mac OS X",
    os_family: "Darwin",
    kernel_version: "13.0.0",
    kernel_version_string: "Darwin Kernel Version 13.0.0: Thu Sep 19 22:22:27 PDT 2013; root:xnu-2422.1.72~6/RELEASE_X86_64",
    memory_bits: 0.00390625,
    memory_page_size: 4096,
    arch: "x86_64",
    cpu_cores: 4,
    cpu_cores_physical: 2,
    cpu_scheduler: "traditional_with_pset_runqueue",
    cpu_frequency: 1700000000,
    cpu_string: "Intel(R) Core(TM) i5-2557M CPU @ 1.70GHz",
    cpu_features: [],
    cpu_bits: 64,
    machine_model: "MacBookAir4,2",
    features: {
      numa: false,
      always_full_sync: 0,
      nfs_async: 0
    }
  }
});

module.exports.Top = Model.extend({
  service: 'top'
});

var DatabaseStat = module.exports.DatabaseStat = Model.extend({
  service: function(){
    return ['databaseStat', this.get('name')];
  },
  defaults: {
    name: 'mongomin',
    collections: 3,
    objects: 5,
    avgObjSize: 60.8,
    dataSize: 304,
    storageSize: 24576,
    numExtents: 3,
    indexes: 1,
    indexSize: 8176,
    fileSize: 67108864,
    nsSizeMB: 16,
    dataFileVersion: {major: 4, minor: 5},
    extentFreeList: {num: 0, totalSize: 0}
  }
});

var List = Backbone.Collection.extend({
  service: '',
  sync: function(method, model, options){
    var serviceName = this.service,
      args = [];

    if(typeof serviceName === 'function'){
      args = serviceName();
      serviceName = args.shift();
    }

    args.push(function(err, data){
      if(err) return options.error(err);
      options.success(data);
    });
    instance.backend[this.service].apply(instance.backend, args);
  }
});

module.exports.Log = List.extend({
  model: Backbone.Model.extend({
    defaults: {
      name: 'websrv',
      message: 'listening for connections',
      date: new Date()
    }
  }),
  service: 'log'
});

function parseNamespace(ns, key){
  var db = ns.split('.').shift(),
    res = {db: db};
  res[key] = ns.replace(db + '.', '');
  return res;
}

var Index = Model.extend({
  initialize: function(opts){
    this.set(parseNamespace(this.get('ns'), 'collection'));
  },
  defaults: {
    v: 1,
    key: {_id: 1},
    name: '_id_',
    ns: 'mongomin.fixture',
    db: 'mongomin',
    collection: 'fixture'
  }
});

var Collection = Model.extend({
initialize: function(opts){
    this.set(parseNamespace(this.get('ns'), 'name'));
  },
  defaults: {
    ns: 'mongomin.fixtures',
    name: 'fixtures',
    db: 'mongomin'
  },
  service: function(){
    return ['collections', this.get('db')];
  }
});

var IndexList = List.extend({
  initialize: function(opts){
    this.database = opts.database;
  },
  model: Index,
  service: function(){
    return ['indexes', this.database.get('name')];
  }
});

var CollectionList = List.extend({
  initialize: function(opts){
    this.database = opts.database;
  },
  model: Collection,
  service: function(){
    return ['collections', this.database.get('name')];
  }
});

// var databases = new models.Databases();
// databases.on('sync', this.render, this);
// databases.fetch();

var Database = Model.extend({
  defaults: {
    name: 'mongoscope',
    indexes: IndexList,
    collections: CollectionList
  },
  initialize: function(opts){
    this.set({
      'indexes': new IndexList({db: this.get('name')}),
      'collections': new CollectionList({db: this.get('name')}),
    });
  },
  service: function(){
    return ['databaseStat', this.get('name')];
  }
});

// @todo: Should this just be a singleton on the app level that's updated on
//        an interval?
module.exports.Databases = List.extend({
  model: Database,
  service: 'databases'
});

// Collections of things under a database.
var DatabaseAttributeCollection = List.extend({
  initialize: function(opts){
    this.set('db', opts.db);
  }
});

// @todo: rather than refetching,
module.exports.Collections = List.extend({
  model: Collection
});

module.exports.Indexes = List.extend({
  model: Index
});
