var Backbone = require('backbone'),
  Model = require('./service').Model,
  List = require('./service').List,
  debug = require('debug')('mg:scope:models');

// singletons.
var service,
  settings,
  deployments,
  instance,
  topHolder;

module.exports = function(opts){
  module.exports.settings = settings = new Settings({
    host: window.location.hostname,
    port: 29017
  });

  service = require('./service')(settings.get('host'), settings.get('port'));

  module.exports.deployments = deployments = new DeploymentList();
  deployments.fetch({error: opts.error, success: function(){
    debug('got deployments', deployments);
    opts.success.apply(this, arguments);

    // @todo: handle startup run like binding top.
  }});
};

Object.defineProperty(module.exports, 'instance', {get: function(){
  if(!instance){
    instance = new Instance({});
  }
  return instance;
}});

Object.defineProperty(module.exports, 'top', {get: function(){
  if(!topHolder){
    topHolder = new Top({});
  }
  return topHolder;
}});

var Settings = Backbone.Model.extend({
    defaults: {}
  }),
  Instance = Model.extend({
    defaults: {
      uri: 'localhost:27017',
      type: 'standalone',
      deployment_id: 'localhost:27017'
    },
    service: function(){
      return {name: 'instance', args: this.get('uri')};
    }
  }),
  InstanceList = List.extend({
    initialize: function(models, opts){
      this.models = models;
      this.deployment_id = opts.deployment_id;
    },
    model: Instance,
    service: function(){
      return {name: 'deployment', args: this.deployment_id};
    }
  }),
  Deployment = Model.extend({
    defaults: {
      _id: 'localhost:27017',
      instances: new InstanceList([], {deployment_id: 'localhost:27017'})
    },
    service: function(){
      return {name: 'deployment', args: this.get('_id')};
    }
  }),
  DeploymentList = List.extend({
    model: Deployment,
    service: 'deployments',
    parse: function(data){
      debug('parsing deployments');
      var res = [];
      Object.keys(data).map(function(_id){
        var deployment,
          instances = new InstanceList([], {deployment_id: _id});

        Object.keys(data[_id]).map(function(instance_id){
          var skel = data[_id][instance_id];
          skel.deployment_id = _id;
          instances.add(new Instance(skel));
        });

        deployment = new Deployment({_id: _id, instances: instances});
        res.push(deployment);
      });
      return res;
    }
  });

module.exports.Database = Model.extend({
  service: function(){
    return {name: 'database', args: [instance.get('uri'), this.get('name')]};
  },
  parse: function(data){
    debug('parse database', data);
    if(data.collection_names.length > 0){
      var i = data.collection_names.indexOf('system.indexes');
      if(i > -1 ){
        data.collection_names.splice(i, 1);
      }
    }
    data.stats.collection_count = data.collection_names.length;
    return data;
  },
  defaults: {
    // name: 'mongomin',
    // collection_names: ['fixture', 'system.indexes'],
    // stats: {
    //   object_count: 5,
    //   object_size: 304,
    //   storage_size: 24576,
    //   index_count: 1,
    //   index_size: 8176,
    //   extent_count: 3,
    //   extent_freelist_count: 0,
    //   extent_freelist_size: 0,
    //   file_size: 67108864,
    //   ns_size: 16777216
    // }
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
      document_count: 1,
      document_size: 48,
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
    return {name: 'collection', args: [instance.get('uri'),
      this.get('database'), this.get('name')]};
  },
  uri: function(){
    return this.get('database') + '/' + this.get('name') + '/' + instance.get('uri');
  }
});

module.exports.Sample = List.extend({
  model: Backbone.Model.extend({
    defaults: {
      _id: 1
    }
  }),
  initialize: function(opts){
    this.database = null;
    this.name = null;
    this.skip = 0;
    this.limit = 10;
    this.schema = {};

    this.hasMore = false;
    this.hasPrev = false;

    this.collection = opts.collection.on('change', this.collectionChange, this);
  },
  next: function(){
    this.skip += this.limit;
    debug('skip now at', this.skip);
    this.fetch({reset: true});
  },
  prev: function(){
    this.skip -= this.limit;
    debug('skip now at', this.skip);
    this.fetch({reset: true});
  },
  collectionChange: function(){
    this.database = this.collection.get('database');
    this.name = this.collection.get('name');
    this.fetch({reset: true});
  },
  service: function(){
    return {name: 'find', args: [instance.get('uri'), this.database, this.name,
      {skip: this.skip, limit: this.limit}]};
  },
  uri: function(){
    return this.database + '/' + this.name + '/sample/' + instance.get('uri');
  },
  parse: function(res){
    // @todo: just temporary
    this.schema = {
      keys: []
    };
    for(var k in res[0]){
      this.schema.keys.push(k);
    }
    debug('guess schema', this.schema, this.skip);
    this.hasMore = (res.length >= this.limit);
    this.hasPrev = (this.skip > 0);
    return res;
  }
});

var Top = module.exports.Top = Model.extend({
  service: function(){
    return {name: 'top', args: instance.get('uri')};
  },
  uri: function(){
    return '/top/' + instance.get('uri');
  },
  initialize: function(){
    this.subscribers = 0;
  },
  activate: function(){
    if(this.subscribers === 0){
      debug('activating top stream');
      this.active = true;
      this.fetch();
      this.subscribe();
    }
    this.subscribers++;
    return this;
  },
  deactivate: function(){
    this.subscribers--;
    if(this.subscribers === 0){
      debug('deactivating top stream');
      this.active = false;
      this.unsubscribe();
    }
    return this;
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
  service: function(){
    return {name: 'log', args: [instance.get('uri')]};
  },
  uri: function(){
    return '/log/' + instance.get('uri');
  }
});


// Action Model-ish, cuz all are not created equal.
//
// level:
// - 0: hidden
// - 1: highlight
// - 2: info
// - 3: warn
var ACTIONS = require('./templates/security/privilege-actions.json');

var Role = Backbone.Model.extend({
  defaults: {
    role : 'readAnyDatabase',
    db : 'admin',
    isBuiltin : true,
    roles : [ ],
    inheritedRoles : [ ],
    privileges : [
      {
        resource: {db : '', collection : ''},
        actions: ['collStats','dbHash','dbStats','find','killCursors','planCacheRead']
      },
      {
        resource: {cluster : true},
        actions: ['listDatabases']
      },
      {
        resource: { db : '',  collection : 'system.indexes'},
        actions: ['collStats', 'dbHash', 'dbStats', 'find', 'killCursors', 'planCacheRead']
      },
      {
        resource: {db : '',  collection : 'system.js'},
        actions: ['collStats','dbHash','dbStats','find','killCursors','planCacheRead']
      },
      {
        resource: {db : '',collection : 'system.namespaces'},
        actions: ['collStats','dbHash','dbStats','find','killCursors','planCacheRead']
      }
    ],
    inheritedPrivileges : [
      {
        resource: {db : '',collection : ''},
        actions: ['collStats', 'dbHash', 'dbStats', 'find', 'killCursors', 'planCacheRead']
      },
      {
        resource: {cluster : true},
        actions: ['listDatabases']
      },
      {
        resource: {db : '', collection : 'system.indexes'},
        actions: ['collStats','dbHash','dbStats','find','killCursors','planCacheRead']
      },
      {
        resource: {db : '',collection : 'system.js'},
        actions: [ 'collStats', 'dbHash', 'dbStats', 'find', 'killCursors', 'planCacheRead']
      },
      {
        resource: {db : '', collection : 'system.namespaces'},
        actions: ['collStats','dbHash','dbStats','find','killCursors','planCacheRead']
      }
    ]
  },
  service: function(){
    return {name: 'securityRoles', args: [instance.get('uri'), this.get('db'), this.get('role')]};
  },
  parse: function(data){
    var privs = [];
    privs.push.apply(privs, data.privileges, data.inheritedPrivileges);
    debug('privs', privs);
    privs.sort(function(a, b){
      return a.actions.length - b.actions.length;
    });

    data.grants = [];
    privs.map(function(grant){
      // skips
      // if(['local', 'config'].indexOf(grant.resource.db) > -1){
      //   debug('skip special db grant', grant.resource);
      //   return false;
      // }

      // if(['system.profile', 'system.indexes', 'system.js', 'system.namespaces'].indexOf(grant.resource.collection) > -1){
      //   debug('skip special collection grant', grant.resource);
      //   return false;
      // }

      var g = {
        resource: grant.resource,
        actions: {}
      };

      grant.actions.map(function(name){
        ACTIONS[name]._id = name;
        g.actions[name] = ACTIONS[name];
      });
      data.grants.push(g);
    });
    return data;
  }
});

var User = Backbone.Model.extend({
  defaults: {
    username: 'scopey',
    database: 'admin'
  },
  service: function(){
    return {name: 'securityUsers', args: [instance.get('uri'), this.get('database'), this.get('username')]};
  },
  parse: function(data){
    data.inheritedPrivileges.sort(function(a, b){
      return a.actions.length - b.actions.length;
    });

    // Make these things friendlier...
    // http://docs.mongodb.org/master/reference/privilege-actions/
    data.grants = [];
    data.inheritedPrivileges.map(function(grant){
      // skips
      if(['local', 'config'].indexOf(grant.resource.db) > -1){
        debug('skip special db grant', grant.resource);
        return false;
      }

      if(['system.profile', 'system.indexes', 'system.js', 'system.namespaces'].indexOf(grant.resource.collection) > -1){
        debug('skip special collection grant', grant.resource);
        return false;
      }
      var g = {
        resource: grant.resource,
        actions: {}
      };

      debug('adding actions for', grant.resource);
      grant.actions.map(function(name){
        ACTIONS[name]._id = name;
        g.actions[name] = ACTIONS[name];
      });
      data.grants.push(g);
    });
    return data;
  }
});

module.exports.Security = Backbone.Model.extend({
  defaults: {
    users: List.extend({
      model: User,
      service: 'securityUsers'
    }),
    roles: List.extend({
      model: Role,
      service: 'securityRoles'
    })
  },
  service: function(){
    return {name: 'security', args: [instance.get('service')]};
  },
  parse: function(data){
    data.roles = data.roles.filter(function(role){
      return role.role !== '__system';
    });
    return data;
  }
});

module.exports.Security.User = User;
module.exports.Security.Role = Role;
