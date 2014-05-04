var Backbone = require('backbone'),
  _ = require('underscore'),
  Model = require('./service').Model,
  List = require('./service').List,
  debug = require('debug')('mongoscope:models');

// containers
var service, settings, deployments, deployment, instance, topHolder, context;

function getContext(){
  if(context) return context;
  // create the various container models that views will attach to.
  // under the hood, we can then copy into these containers from the
  // main `deployments` store.
  instance = new Instance();
  deployment = new Deployment();
  deployments = new DeploymentList();
  topHolder = new Top({});

  context = new Context();
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

module.exports.connect = function(deploymentId, instanceId, fn){
  var deployment, instance;

  debug('connect to', deploymentId, instanceId, fn);

  if(typeof instanceId === 'function'){
    fn = instanceId;
    instanceId = null;
  }

  if(deploymentId.indexOf('/') > -1) return fn(new Error('Bad deployment id `'+deploymentId+'`'));

  deployment = deployments.length > 0 && deployments.get(deploymentId);

  if(!deployment){
      // This is our initial connection
    debug('initial connection to', deploymentId);
    return service.setCredentials(deploymentId, function(err, res){
      if(err) return fn(err);
      deployments.fetch({success: function(){
        loadInstance(res.deployment_id, res.instance_id, fn);
      }});
    });
  }

  // @todo: deployment id might be an instance id, so search all instances
  // in all deployments for the one we probably want.
  instance = deployment.getSeedInstance(instanceId);

  // @todo: check we're requesting an actual context change
  service.setCredentials(instance.id, function(err, res){
    if(err) return fn(err);
    loadInstance(res.deployment_id, res.instance_id, fn);
  });
};

function loadInstance(deploymentId, instanceId, fn){
  var i = deployments.getInstance(instanceId);
  if(!i) return fn(new Error('Could not find instance `'+instanceId+'`'));
  i.fetch({error: fn, success: function(){
    debug('got instance sync!', arguments);
    context.switch(deploymentId, instanceId);
    fn(null, {instance: instance, deployment: deployment});
  }});
}

var Settings = Backbone.Model.extend({
    defaults: {}
  }),
  Context = Model.extend({
    defaults: {},
    deployment: null,
    instance: null,
    switch: function(deploymentId, instanceId){
      var sets = {};

      if(deploymentId !== this.get('deployment_id')){
        sets.deployment_id = deploymentId;
        var src = deployments.get(deploymentId),
          clone = _.clone(src.attributes);

        clone.instances = src.instances.toJSON();

        // @todo: need a cleanup that does this for everything.  unset: true
        // when calling `set` just seems to break everything...
        if(!src.attributes.sharding){
          src.attributes.sharding = null;
        }

        debug('cloning deployment from', clone);

        deployment.set(clone);
        this.deployment = deployment;
      }

      if(instanceId !== this.get('instance_id')){
        sets.instance_id = instanceId;
        instance.set(_.clone(deployment.getSeedInstance(instanceId).attributes));
        this.instance = instance;
      }
      this.set(sets);
      return this;
    },
    toJSON: function(){
      var attrs = this.__data__();
      attrs.instance = this.instance.toJSON();
      attrs.deployment = this.deployment.toJSON();
      return attrs;
    }
  }),
  Shard = Model.extend({
    setters: {
      instances: function(items){
        if(!this.instances){
          this.instances = new InstanceList([]);
        }
        this.instances.reset(items);
      }
    },
    toJSON: function(){
      var attrs = this.__data__();
      attrs.instances = this.instances.toJSON();
      return attrs;
    }
  }),
  ShardList = List.extend({
    model: Shard
  }),
  Instance = Model.extend({
    service: function(){
      return {name: 'instance', args: this.id};
    }
  }),
  InstanceList = List.extend({
    initialize: function(models, opts){
      opts = opts || {};
      this.models = models;
      this.deployment_id = opts.deployment_id;
    },
    model: Instance,
    service: function(){
      return {name: 'deployment', args: this.deployment_id};
    }
  }),
  Deployment = Model.extend({
    setters: {
      instances: function(items){
        if(!this.instances){
          this.instances = new InstanceList([], {deployment_id: this.id})
            .on('reset', this.instancesChanged, this);
        }
        this.instances.reset(items);
      }
    },
    instancesChanged: function(){
      debug('instances reset', arguments);
      this.set({'replicaset': this.instances.chain().pluck('rs').first().value()});
      debug('replicaset now at', this.get('replicaset'));
    },
    service: function(){
      return {name: 'deployment', args: this.id};
    },
    getInstance: function(id){
      return this.instances.get(id);
    },
    getSeedInstance: function(id){
      return this.getInstance(id) || this.getInstance(this.get('seed'));
    },
    getType: function(){
      if(this.has('sharding')) return 'cluster';
      if(this.has('replicaset')) return 'replicaset';
      return 'standalone';
    },

    // @todo: possible to move this out and getType out to a polymorphic?
    getReplicaSet: function(){
      var rs = this.instances.filter(function(i){return i.rs;});
      if(rs.length === 0){
        return undefined;
      }
      return rs[0];
    },
    // @todo: get details from service.
    getReplicationDetails: function(){
      return {};
    },
    // @returns {Instance}
    getPrimary: function(){
      return this.instances.findWhere({state: 'primary'});
    },
    // @returns {InstanceList}
    getArbiters: function(){
      return new InstanceList(this.instances.where({state: 'arbiter'}));
    },
    // @returns {InstanceList}
    getSecondaries: function(){
      return new InstanceList(this.instances.where({state: 'secondary'}));
    },

    // @todo: get details from service.
    getShardingDetails: function(){
      return {};
    },
    // @returns {ShardList}
    getShards: function(){
      return new ShardList(this.instances.chain()
        .filter(function(i){
          return i.has('shard');
        })
        .groupBy(function(i){
          return i.get('shard');
        })
        .map(function(instances, name){
          return new Shard({name: name, instances: instances});
        })
        .value());
    },
    // @returns {InstanceList}
    getRouters: function(){
      return new InstanceList(this.instances.where({type: 'router'}));
    },
    // @returns {InstanceList}
    getConfigs: function(){
      return new InstanceList(this.instances.where({type: 'config'}));
    },
    // @returns {Object}
    toJSON: function(){
      var attrs = this.__data__();
      attrs.instances = this.instances.toJSON();
      attrs.type = this.getType();
      if(attrs.type === 'cluster'){
        attrs.routers = this.getRouters().toJSON();
        attrs.shards = this.getShards().toJSON();
        attrs.configs = this.getConfigs().toJSON();
      }
      else if(attrs.type === 'replicaset'){
        attrs.arbiters = this.getArbiters().toJSON();
        attrs.primary = this.getPrimary().toJSON();
        attrs.secondaries = this.getSecondaries().toJSON();
        attrs.replication = this.getReplication().toJSON();
      }
      debug('deployment toJSON', attrs);
      return attrs;
    }
  }),
  DeploymentList = List.extend({
    // @todo: persist last used
    default: function(){return this.at(0);},
    model: Deployment,
    service: 'deployments',
    getInstance: function(id){
      debug('searching for instance', id);
      var res = null;
      this.models.map(function(d){
        if(!res){
          debug('searching', d.instances);
          res = d.instances.findWhere({_id: id});
          debug('result', d.id, res);
        }
      });
      debug('returning', res);
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


// Initialization triggers. Allows views to be totally oblivious of any explicit
// initialization.
// @todo: these should just be limited to `context`.
Object.defineProperty(module.exports, 'context', {get: function(){
  return getContext();
}});

Object.defineProperty(module.exports, 'instance', {get: function(){
  return getContext().instance;
}});

Object.defineProperty(module.exports, 'deployment', {get: function(){
  return getContext().deployment;
}});

Object.defineProperty(module.exports, 'deployments', {get: function(){
  if(!deployments) getContext();
  return deployments;
}});

Object.defineProperty(module.exports, 'top', {get: function(){
  if(!topHolder) getContext();
  return topHolder;
}});
