var Backbone = require('backbone'),
  Service = require('./service'),
  debug = require('debug')('mongoscope:models');


var Instance = Backbone.Model.extend({
  defaults: {
    host: window.document.hostname,
    port: 3001
  },
  initialize: function(){
    this.backend = new Service(this.get('host'), this.get('port'));
  }
});

var instance = module.exports = new Instance();

var Base = Backbone.Model.extend({
  service: '',
  sync: function(method, model, options){
    instance.backend[this.service](function(err, data){
      if(err) return options.error(err);
      options.success(data);
    });
  }
});

module.exports.BuildInfo = Base.extend({
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

module.exports.HostInfo = Base.extend({
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

module.exports.Top = Base.extend({
  service: 'top'
});

var BaseCollection = Backbone.Collection.extend({
  service: '',
  // @todo Support declaring args to pass to service,
  // eg pass database name to list collections.
  sync: function(method, model, options){
    instance.backend[this.service](function(err, data){
      if(err) return options.error(err);
      options.success(data);
    });
  }
});

module.exports.Log = BaseCollection.extend({
  model: Backbone.Model.extend({
    defaults: {
      name: 'websrv',
      message: 'listening for connections',
      date: new Date()
    }
  }),
  service: 'log'
});

module.exports.Databases = BaseCollection.extend({
  model: Backbone.Model.extend({
    defaults: {
      name: 'mongoscope'
    }
  }),
  service: 'databases'
});

module.exports.Collections = BaseCollection.extend({
  model: Backbone.Model.extend({
    defaults: {
      _id: 'analytics',
      database: 'mongoscope'
    }
  })
});

module.exports.Indexes = BaseCollection.extend({
  model: Backbone.Model.extend({
    defaults: {
      _id: '_id',
      database: 'analytics',
      collection: 'mongoscope'
    }
  })
});
