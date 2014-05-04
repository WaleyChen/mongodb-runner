var $ = require('jquery'),
  _ = require('underscore'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  debug = require('debug')('mongoscope:service'),
  socketio = require('socket.io-client'),
  srv;

module.exports = function(scope, port){
  if(!srv){
    debug('init', scope, port);
    srv = new Service(scope, port).connect();
  }
  return srv;
};

function Service(scope, port){
  this.scope = scope;
  this.port = port;
  this.connected = false;
  this.token = null;
}
util.inherits(Service, EventEmitter);

Service.prototype.connect = function(){
  if(this.connected) return this;

  this.origin = 'http://' + this.scope;
  if(this.port){
    this.origin = this.origin + ':' + this.port;
  }

  this.io = socketio;
  this.connected = true;
  return this;
};

Service.prototype.read = function(pathname, params, fn){
  if(typeof params === 'function'){
    fn = params;
    params = {};
  }

  var headers = {
    'Accept': 'application/json'
  };

  if(this.token){
    headers.Authorization = 'Bearer ' + this.token;
  }
  else {
    var err = new Error('Token required');
    err.status = 401;
    return fn(err);
  }

  $.ajax({
    url: this.origin + '/api/v1' + pathname,
    data: params,
    headers: headers,
    type: 'get',
    dataType: 'json',
    success: function(data){
      if(typeof data === 'string'){
        data = JSON.parse(data);
      }
      fn(null, data);
    }
  }).fail(this.fail(fn));
};

Service.prototype.fail = function(fn){
  return function(xhr){
    console.error('xhr fail', arguments);
    var msg = xhr.responseText ? xhr.responseText.replace('Error: ', '') : 'unknown error',
      err = new Error(msg);

    err.status = xhr.status;
    err.statusText = xhr.statusText;
    fn(err);

    this.emit('error', err);
  }.bind(this);
};

Service.prototype.post = function(pathname, params, fn){
  if(typeof params === 'function'){
    fn = params;
    params = {};
  }

  params = params || {};
  var headers = {
    'Accept': 'application/json'
  };

  if(pathname !== 'token'){
    headers.Authorization = 'Bearer ' + this.token;
  }

  $.ajax({
      url: this.origin + '/api/v1' + pathname,
      data: params,
      headers: headers,
      type: 'post',
      dataType: 'json',
      success: function(data){
        fn(null, data);
      }
    }).fail(this.fail(fn));
};

Service.prototype.get = function(instance_id, pathname, params, fn){
  if(!instance_id || instance_id.indexOf(':') === -1) return fn(new Error('Must specify instance_id'));
  return this.read('/' + instance_id + pathname, params, fn);
};

Service.prototype.importer = function(instance_id, dbName, collName, pipechain, fn){
  return this.post('/' + instance_id + '/' + dbName + '/' +
      collName + '/import', {pipechain: JSON.stringify(pipechain)}, fn);
};

Service.prototype.top = function(instance_id, fn){
  this.get(instance_id, '/top', {}, fn);
};

Service.prototype.instance = function(instance_id, fn){
  this.get(instance_id, '', {}, fn);
};

Service.prototype.deployments = function(fn){
  this.read('/', fn);
};

Service.prototype.security = function(instance_id, fn){
  this.get(instance_id, '/security', {}, fn);
};

Service.prototype.securityUsers = function(instance_id, db, username, fn){
  if(typeof db === 'function'){
    fn = username;
    username = null;
    db = 'admin';
  }

  if(typeof username === 'function'){
    fn = username;
    username = null;
  }
  var pathname = (db ? '/' + db + (username ? '/' + username : '') : '');

  this.get(instance_id, '/security/users' + pathname, {}, fn);
};

Service.prototype.securityRoles = function(instance_id, db, role, fn){
  if(typeof db === 'function'){
    fn = db;
    role = null;
    db = 'admin';
  }

  if(typeof role === 'function'){
    fn = role;
    role = null;
  }

  var pathname = (db ? '/' + db + (role ? '/' + role : '') : '');
  this.get(instance_id, '/security/roles' + pathname, {}, fn);
};

Service.prototype.log = function(instance_id, name, fn){
  var pathname;
  if(typeof name === 'function'){
    fn = name;
    pathname = '/log';
  }
  else {
    pathname = '/log/' + name;
  }
  this.get(instance_id, pathname, {}, fn);
};

Service.prototype.database = function(instance_id, name, fn){
  this.get(instance_id, '/' + name, {}, fn);
};

Service.prototype.find = function(instance_id, db, name, spec, fn){
  this.get(instance_id, '/' + db + '/' + name + '/find', spec, fn);
};

Service.prototype.collection = function(instance_id, db, name, fn){
  this.get(instance_id, '/' + db + '/' + name, {}, fn);
};

Service.prototype.sharding = function(instance_id, fn){
  this.get(instance_id, '/sharding', {}, fn);
};

Service.prototype.replication = function(instance_id, fn){
  this.get(instance_id, '/replication', {}, fn);
};

Service.prototype.oplog = function(instance_id, fn){
  this.get(instance_id, '/replication/oplog', {}, fn);
};

Service.prototype.metrics = function(instance_id, fn){
  this.get(instance_id, '/metrics', {}, fn);
};

Service.prototype.setCredentials = function(seed, fn){
  var self = this, expirationRedLine = 15 * 1000;

  function _bakeToken(done){
    var data = {seed: seed};
    debug('getting token for', seed);
    self.post('/token', data, function(err, data){
      if(err) return done(err);

      if(!data.expires_at || !data.created_at){
        return new Error('Malformed response.  Missing expires_at or created_at');
      }

      if(new Date(data.expires_at) - Date.now() < (1 * 60 * 1000)){
        return new Error('Got an expires that is less than a minute from now.');
      }
      return done(null, data);
    });
  }

  function _refreshToken(){
    _bakeToken(function(err, res){
      if(err) self.emit('error', err);
      self.token = res.token;

      debug('token refreshed successfully');
      return _scheduleRefresh(res);
    });
  }

  function _scheduleRefresh(res){
    var ms = (new Date(res.expires_at) - Date.now()) - expirationRedLine;
    debug('token redline in ' + ms + 'ms', (ms/1000/60) + 'minutes');
    setTimeout(_refreshToken, ms);
  }

  // Bake the initial token.
  _bakeToken(function(err, res){
    if(err) return fn(err);

    debug('baked fresh token');
    self.token = res.token;

    debug('starting refresh loop');
    _scheduleRefresh(res);

    // Connect to socketio and be ready to respond to challenges
    // with our tasty new token.
    if(!self.ioConnecting){
      self.ioConnecting = true;
      self.io = socketio.connect(this.origin)
        .on('connected', function(){
          debug('socketio connected', arguments);
        })
        .on('challenge', function(socket){
          socket.emit('authorization', 'Bearer ' + self.token);
        });

      ['disconnect', 'error', 'reconnect'].map(function(n){
        self.io.on(n, function(){
          var args = Array.prototype.slice.call(arguments, 0);
          args.unshift(n);
          srv.emit.apply(srv, args);
        });
      });
    }

    fn(null, res);
  });
};

var Backbone = require('backbone'),
  _ = require('underscore');

Backbone.sync = function(method, model, options){
  var service = _.result(this, 'service'), args;
  if(_.isString(service)) service = {name: service, args: []};

  args = service.args || [];
  if(!_.isArray(args)) args = [args];

  args.push(function(err, data){
    if(err) return options.error(err);
    options.success(data);
  });

  srv[service.name].apply(srv, args);
};

var mixins = {
  subscription: null,
  iohandler: function(data){
    if (!this.set(data)) return false;
    this.trigger('sync', this, data, {});
  },
  switchedInstance: function(){
    debug('instance changed.  moving subscription.');
    this.unsubscribe();
    this.subscribe();
  },
  subscribe: function(options){
    srv.connect();
    var context = require('./models').context;

    context.once('change', this.switchedInstance, this);

    _.defaults(options || (options = {}), {
      uri: _.result(this, 'uri')
    });

    this.subscription = {token: srv.token, instance_id: context.instance.id};

    srv.io
      .addListener(options.uri, this.iohandler.bind(this))
      .emit(options.uri, this.subscription);

    debug('subscribing', options.uri, this.subscription);
    return this;
  },
  unsubscribe: function(options){
    srv.connect();

    _.defaults(options || (options = {}), {
      uri: _.result(this, 'uri')
    });

    debug('$unsub ' + options.uri);
    srv.io
      .removeAllListeners(options.uri)
      .emit(_.result(this, 'uri') + '/unsubscribe', this.subscription);
    this.subscription = null;

    return this;
  }
};

module.exports.Model = Backbone.Model.extend({
  idAttribute: '_id',
  service: null,
  __data__: function(){
    var attrs = _.clone(this.attributes);
    attrs.id = this.id;
    return attrs;
  },
  toJSON: function(){
    return this.__data__();
  },
  set: function(key, val, options){
    var attr, attrs, unset, changes, silent, changing, prev, current;
    if (key === null) return this;

    // Handle both `"key", value` and `{key: value}` -style arguments.
    if (typeof key === 'object') {
      attrs = key;
      options = val;
    } else {
      (attrs = {})[key] = val;
    }

    options || (options = {});

    // Run validation.
    if (!this._validate(attrs, options)) return false;

    // Extract attributes and options.
    unset           = options.unset;
    silent          = options.silent;
    changes         = [];
    changing        = this._changing;
    this._changing  = true;

    if (!changing) {
      this._previousAttributes = _.clone(this.attributes);
      this.changed = {};
    }
    current = this.attributes, prev = this._previousAttributes;

    // Check for changes of `id`.
    if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

    // For each `set` attribute, update or delete the current value.
    for (attr in attrs){
      if(this.setters && this.setters.hasOwnProperty(attr)){
        this.setters[attr].apply(this, [attrs[attr]]);
      }
      else{
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }
    }

    // Trigger all relevant attribute changes.
    if (!silent) {
      if (changes.length) this._pending = options;
      for (var i = 0, l = changes.length; i < l; i++) {
        this.trigger('change:' + changes[i], this, current[changes[i]], options);
      }
    }

    // You might be wondering why there's a `while` loop here. Changes can
    // be recursively nested within `"change"` events.
    if (changing) return this;
    if (!silent) {
      while (this._pending) {
        options = this._pending;
        this._pending = false;
        this.trigger('change', this, options);
      }
    }
    this._pending = false;
    this._changing = false;
    return this;
  }
}).extend(mixins);

module.exports.List = Backbone.Collection.extend({
  service: null,
  __data__: function(){
    return this.models.map(function(model){
      return model.toJSON();
    });
  },
  toJSON: function(){
    return this.__data__();
  }
}).extend(mixins);
