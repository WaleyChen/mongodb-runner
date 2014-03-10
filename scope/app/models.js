"use strict";

var Backbone = require('backbone'),
  Model = require('./service').Model,
  List = require('./service').List,
  debug = require('debug')('mg:scope:models');

// singletons.
var service, settings, instance;

module.exports = function(opts){
  module.exports.settings = settings = new Settings(opts);

  service = require('./service')(settings.get('host'), settings.get('port'));
  module.exports.instance = instance = new Instance();
  instance.fetch();

  return service;
};

var Settings = Backbone.Model.extend({
    defaults: {
      host: window.document.hostname,
      port: 3000
    }
  }),
  Instance = Backbone.Model.extend({
    defaults: {
      database_names: ['mongomin'],
      host: {
        system_time: '2014-03-06T21:49:00.576Z',
        hostname: 'Lucass-MacBook-Air.local',
        os: 'Mac OS X',
        os_family: 'darwin',
        kernel_version: '13.0.0',
        kernel_version_string: 'Darwin Kernel Version 13.0.0: Thu Sep 19 22:22:27 PDT 2013; root:xnu-2422.1.72~6/RELEASE_X86_64',
        memory_bits: 4294967296,
        memory_page_size: 4096,
        arch: 'x86_64',
        cpu_cores: 4,
        cpu_cores_physical: 2,
        cpu_scheduler: 'traditional_with_pset_runqueue',
        cpu_frequency: 1700000000,
        cpu_string: 'Intel(R) Core(TM) i5-2557M CPU @ 1.70GHz',
        cpu_bits: 64,
        machine_model: 'MacBookAir4,2',
        feature_numa: false,
        feature_always_full_sync: 0,
        feature_nfs_async: 0
      },
      build: {
        version: '2.6.0-rc1-pre-',
        commit: '0f42425dd36ef1c872241d7d8264cedbc2ab83b8',
        commit_url: 'https://github.com/mongodb/mongo/commit/0f42425dd36ef1c872241d7d8264cedbc2ab83b8',
        openssl_version: null,
        boost_version: '1.49',
        flags_loader: '-fPIC -pthread',
        allocator: 'tcmalloc',
        javascript_engine: 'V8',
        debug: false,
        for_bits: 64,
        max_bson_object_size: 16777216
      }
    },
    service: 'instance'
  });

module.exports.Database = Model.extend({
  service: function(){
    return {name: 'database', args: this.get('name')};
  },
  defaults: {
    name: 'mongomin',
    collection_names: ['fixture', 'system.indexes'],
    stats: {
      object_count: 5,
      object_size: 304,
      storage_size: 24576,
      index_count: 1,
      index_size: 8176,
      extent_count: 3,
      extent_freelist_count: 0,
      extent_freelist_size: 0,
      file_size: 67108864,
      ns_size: 16777216
    }
  }
});

module.exports.Collection = Model.extend({
  defaults: {
    name: 'fixture',
    database: 'mongomin',
    ns: 'fixture.mongomin',
    indexes: [
      {
        v: 1,
        key: {
          _id: 1
        },
        name: '_id_',
        ns: 'mongomin.fixture',
        size: 8176
      }
    ],
    stats: {
      object_count: 1,
      object_size: 48,
      storage_size: 8192,
      index_count: 1,
      index_size: 8176,
      padding_factor: 1,
      extent_count: 1,
      extent_last_size: 8192,
      flags_user: 1,
      flags_system: 1
    }
  },
  service: function(){
    return {name: 'collection', args: [this.get('database'), this.get('name')]};
  },
  uri: function(){
    return this.get('database') + '/' + this.get('name');
  }
});

module.exports.Sample = List.extend({
  model: Backbone.Model.extend({
    defaults: {
      _id: 1,
      name: 'I could be any shape of document'
    }
  }),
  initialize: function(opts){
    this.database = opts.database;
    this.name = opts.name;
  },
  service: function(){
    return {name: 'sample', args: [this.database, this.name]};
  },
  uri: function(){
    return this.database + '/' + this.name + '/sample';
  }
});

module.exports.Top = Model.extend({
  service: 'top',
  uri: '/top'
});

module.exports.Log = List.extend({
  model: Backbone.Model.extend({
    defaults: {
      name: 'websrv',
      message: 'listening for connections',
      date: new Date()
    }
  }),
  service: 'log',
  uri: '/log'
});
