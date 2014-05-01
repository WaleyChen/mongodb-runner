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
  topHolder,
  context;


function getContext(){
  if(!context){
    instance = new Instance();
    instance.container = true;

    deployment = new Deployment();
    deployment.container = true;

    deployments = new DeploymentList();
    deployments.container = true;

    context = new Context();
  }
  return context;
}

module.exports = function(opts){
  module.exports.settings = settings = new Settings({
    scope: window.location.hostname,
    port: window.location.port
  });

  service = require('./service')(settings.get('scope'), settings.get('port'));
  getContext();
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
      fn(null, {instance: instance, deployment: deployment});
      debug('setting context', deployment, instance);
      context.set({instance_id: instance.id, deployment_id: deployment.id, instance: instance, deployment: deployment});
    }
  });
}

module.exports.connect = function(deploymentId, instanceId, fn){
  var dep, ins, url = deploymentId;

  debug('connect to', deploymentId, instanceId, fn);

  if(typeof instanceId === 'function'){
    fn = instanceId;
    instanceId = null;
  }
  else {

  }

  if(deploymentId.indexOf('/') > -1){
    return fn(new Error('Bad deployment id `'+deploymentId+'`'));
  }

  dep = deployments.length > 0 && deployments.get(deploymentId);

  if(!dep){
      // This is our initial connection
    debug('initial connection to', deploymentId);
    return service.setCredentials(url, function(err, res){
      if(err) return fn(err);

      // The server will handle all of the dns disambiguation and cleanup for
      // us so now we can overload to give the views back cannonical values.
      deploymentId = res.deployment_id;
      instanceId = res.instance_id;

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
        instance.set(_.clone(deployment.getSeedInstance().attributes));

        loadInstance(fn);
      }});
    });
  }

  // @todo: needs to be find the deployment by searching instances
  // by url.
  if(dep.instances.length === 0 && dep.get('instances').length > 0){
    dep.instances.reset(dep.get('instances'), {silent: true});
    delete dep.attributes.instances;
  }
  ins = dep && (instanceId ? dep.getInstance(instanceId) : dep.getSeedInstance());
  deployment.set(_.clone(dep.attributes));
  instance.set(_.clone(ins.attributes));
  service.setCredentials(instance.get('id'), function(){
    debug('set creds to', instance.get('id'), arguments);
    loadInstance(fn);
  });
};

Object.defineProperty(module.exports, 'context', {get: function(){
  return getContext();
}});

Object.defineProperty(module.exports, 'instance', {get: function(){
  if(!instance){
    getContext();
  }
  return instance;
}});

Object.defineProperty(module.exports, 'deployment', {get: function(){
  if(!deployment){
    getContext();
  }
  return deployment;
}});

Object.defineProperty(module.exports, 'deployments', {get: function(){
  if(!deployments){
    getContext();
  }
  return deployments;
}});

Object.defineProperty(module.exports, 'top', {get: function(){
  if(!topHolder){
    getContext();
    topHolder = new Top({});
  }
  return topHolder;
}});

var Settings = Backbone.Model.extend({
    defaults: {}
  }),
  Context = Model.extend({
    defaults: {},
    toJSON: function(){
      var attrs = this.__data__();
      attrs.instance = this.attributes.instance.toJSON();
      attrs.deployment = this.attributes.deployment.toJSON();
      return attrs;
    }
  }),
  Instance = Model.extend({
    defaults: {
      database_names: [],
    },
    idAttribute: '_id',
    service: function(){
      return {name: 'instance', args: this.id};
    },
    synced: function(){
      return Array.isArray(this.get('database_names'));
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
      // if(this.instances.length === 0 && this.get('instances').length > 0){
      //   this.instances.reset(this.get('instances'), {silent: true});
      //   delete this.attributes.instances;
      // }
      return this.instances.get(id);
    },
    getSeedInstance: function(){
      return this.getInstance(this.get('seed').replace('mongodb://', ''));
    },
    getType: function(){
      if(this.get('sharding')){
        return 'cluster';
      }

      if(this.instances.filter(function(i){return i.rs;}).length > 0){
        return 'replicaset';
      }

      return 'standalone';
    },
    toJSON: function(){
      console.log('deployment.toJSON', this);
      var attrs = this.__data__();
      attrs.instances = this.instances.toJSON();
      attrs.type = this.getType();
      if(attrs.sharding){
        attrs.routers = attrs.instances.filter(function(i){
          return i.type === 'router';
        });
        attrs.shards = {};

        var prev;
        attrs.instances.map(function(i){
          if(i.type) return;
          if(prev !== i.shard){
            attrs.shards[i.shard] = {name: i.shard, instances: []};
            prev = i.shard;
          }
          attrs.shards[i.shard].instances.push(i);
        });
      }
      return attrs;
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
  }
});

module.exports.Collection = Model.extend({
  service: function(){
    return {name: 'collection', args: [instance.id,
      this.get('database'), this.get('name')]};
  }
});

module.exports.Sample = List.extend({
  model: Backbone.Model.extend({}),
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
      // this.subscribe();
    }
    this.subscribers++;
    return this;
  },
  exit: function(){
    this.subscribers--;
    if(this.subscribers === 0){
      debug('deactivating producer', this.uri);
      this.active = false;
      // this.unsubscribe();
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
  model: Backbone.Model.extend({}),
  service: function(){
    return {name: 'log', args: [instance.id]};
  },
  uri: '/log'
});

var ACTIONS = require('./views/tpl/security/privilege-actions.json');

var Role = Backbone.Model.extend({
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
