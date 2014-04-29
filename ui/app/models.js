var Backbone = require('backbone'),
  _ = require('underscore'),
  Model = require('./service').Model,
  List = require('./service').List,
  debug = require('debug')('mongoscope:models');

// singletons.
var service,
  settings,
  deployments,
  deployment,
  instance,
  topHolder;


module.exports = function(opts){
  module.exports.settings = settings = new Settings({
    scope: window.location.hostname,
    port: window.location.port
  });

  service = require('./service')(settings.get('scope'), settings.get('port'));

  module.exports.deployments = deployments = new DeploymentList();
  deployment = new Deployment();
  deployment.container = true;

  deployments.fetch({error: opts.error, success: function(){
    debug('got deployments', deployments);
    opts.success.apply(this, arguments);
  }});
};

function loadInstance(fn){
  instance.fetch({
    error: function(err){
      debug('got instance error!!', arguments);
      fn(err);
    },
    success: function(){
      debug('got instance sync!', arguments);
      fn();
    }
  });
}

module.exports.switchTo = function(deploymentId, instanceId, fn){
  var dep, ins, url = deploymentId;

  if(typeof instanceId === 'function'){
    fn = instanceId;
    instanceId = null;
  }

  dep = deployments.length > 0 && deployments.get(deploymentId);

  if(!dep){
      // This is our initial connection
    debug('initial connection to', deploymentId);
    return service.setCredentials(url, function(){
      debug('switched token to', url);

      debug('refreshing deployments list');
      deployments.fetch({success: function(){
        debug('got deployments', deployments);
        if(!deployments.get(deploymentId)){
          return fn(new Error('Unknown deployment `'+deploymentId+'`'));
        }

        if(deployment) deployment.clear();
        if(instance) instance.clear();

        deployment.set(_.clone(deployments.get(deploymentId).attributes));
        deployment.instances.reset(deployment.get('instances'), {silent: true});

        debug('switched to deployment', deployment);

        instance.set(_.clone(deployment.getSeedInstance().attributes));
        debug('switched to instance', instance);

        loadInstance(fn);
      }});
    });
  }

  // @todo: needs to be find the deployment by searching instances
  // by url.
  ins = dep && (instanceId ? dep.getInstance(instanceId) : dep.getSeedInstance());

  if(deployment) deployment.clear();
  if(instance) instance.clear();
  deployment.set(_.clone(dep.attributes));
  instance.set(_.clone(ins.attributes));

  debug('switched to deployment', deployment);
  debug('switched to instance', instance);


  debug('setting creds for other dep');
  service.setCredentials(instance.get('url'), function(){
    debug('set creds to', instance.get('url'), arguments);
    loadInstance(fn);
  });
};

Object.defineProperty(module.exports, 'instance', {get: function(){
  if(!instance){
    instance = new Instance({});
    instance.container = true;
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
      database_names: [],
    },
    idAttribute: '_id',
    service: function(){
      return {name: 'instance', args: this.id};
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
      instances: []
    },
    idAttribute: '_id',
    initialize: function(){
      this.instances = new InstanceList([], {});

      var self = this;
      this.on('change:_id', function(model, newId){
        debug('updating instances deployment id', newId);
        self.instances.deployment_id = newId;
      });
      this.on('change:instances', function(model, fresh){
        if(fresh === undefined) return;

        debug('resetting instances', fresh);
        self.instances.reset(fresh);

      });
    },
    service: function(){
      return {name: 'deployment', args: this.get('_id')};
    },
    getInstance: function(id){
      if(this.instances.length === 0 && this.get('instances').length > 0){
        this.instances.reset(this.get('instances'), {silent: true});
        delete this.attributes.instances;
      }
      return this.instances.get(id);
    },
    getSeedInstance: function(){
      // return this.getInstance(this.get('seed').replace('mongodb://', ''));
      return this.instances.at(0);
    }

  }),
  DeploymentList = List.extend({
    default: function(){
      // @todo: persist last used.
      return this.at(0);
    },
    model: Deployment,
    service: 'deployments',
    parse: function(data){
      var res = [];
      data.map(function(dep){
        var instances = new InstanceList([], {deployment_id: dep._id});
        dep.instances.map(function(inst){
          inst.deployment_id = dep._id;
          instances.add(new Instance(inst));
        });

        dep.instances = instances.toJSON();
        res.push(dep);
      });
      return res;
    }
  });

module.exports.Database = Model.extend({
  service: function(){
    return {name: 'database', args: [instance.id, this.get('name')]};
  },
  parse: function(data){
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
    return {name: 'collection', args: [instance.id,
      this.get('database'), this.get('name')]};
  },
  uri: function(){
    return this.get('database') + '/' + this.get('name') + '/' + instance.id;
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
    return {name: 'find', args: [instance.id, this.database, this.name,
      {skip: this.skip, limit: this.limit}]};
  },
  uri: function(){
    return this.database + '/' + this.name + '/sample/' + instance.id;
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


var ProducerMixin = {
  initialize: function(){
    this.subscribers = 0;
  },
  enter: function(){
    if(this.subscribers === 0){
      debug('activating producer', this.uri);
      this.active = true;
      this.subscribe();
    }
    this.subscribers++;
    return this;
  },
  exit: function(){
    this.subscribers--;
    if(this.subscribers === 0){
      debug('deactivating producer', this.uri);
      this.active = false;
      this.unsubscribe();
    }
    return this;
  }
},
ProducerList = List.extend(ProducerMixin),
ProducerModel = Model.extend(ProducerMixin);


var Top = module.exports.Top = ProducerModel.extend({
  service: function(){
    return {name: 'top', args: instance.id};
  },
  uri: '/top'
});

module.exports.Log = ProducerList.extend({
  model: Backbone.Model.extend({
    defaults: {
      name: 'websrv',
      message: 'listening for connections',
      date: new Date()
    }
  }),
  service: function(){
    return {name: 'log', args: [instance.id]};
  },
  uri: '/log'
});


// Action Model-ish, cuz all are not created equal.
//
// level:
// - 0: hidden
// - 1: highlight
// - 2: info
// - 3: warn
var ACTIONS = require('./views/tpl/security/privilege-actions.json');

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
    return {name: 'securityRoles', args: [instance.id, this.get('db'), this.get('role')]};
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
    return {name: 'securityUsers', args: [instance.id, this.get('database'), this.get('username')]};
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
    return {name: 'security', args: [instance.id]};
  },
  parse: function(data){
    data.roles = data.roles.filter(function(role){
      return role.role !== '__system';
    });
    return data;
  }
});

var Sharding = Model.extend({
  service: function(){
    return {name: 'sharding', args: [instance.id]};
  }
});

var Replication = Model.extend({
  service: function(){
    return {name: 'replication', args: [instance.id]};
  }
});

var Oplog = Model.extend({
  service: function(){
    return {name: 'oplog', args: [instance.id]};
  }
});

module.exports.sharding = function(){
  return new Sharding();
};

module.exports.replication = function(){
  return new Replication();
};

module.exports.oplog = function(){
  return new Oplog();
};

module.exports.Security.User = User;
module.exports.Security.Role = Role;
