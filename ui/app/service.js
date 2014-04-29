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

// Wrap the MongoDB REST API in a pretty interface.
//
// @param {String} scope where scope is running.
// @param {Number} port mongorest is listening on.
// @api public
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
// Get a list of log `line` objects.
//
// @param {String, default:global} optional log name to restrict to (default: global).
// @param {Function} fn `(err, [line])`
// @api public
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


// Get metadata for a database.
//
// @param {String} db A database name
// @param {Function} fn `fn(err, database)`
// @api public
Service.prototype.database = function(instance_id, name, fn){
  this.get(instance_id, '/' + name, {}, fn);
};

// @param {String} db database name
// @param {String} name collection name
// @param {String, default:{}} [spec] query spec to use
// @param {Function} fn `(err, docs)`
// @api private
Service.prototype.find = function(instance_id, db, name, spec, fn){
  this.get(instance_id, '/' + db + '/' + name + '/find', spec, fn);
};

// Get all collection metadata.
//
// @param {String} db A database name
// @param {String} name A collection name
// @param {Function} fn `fn(err, data)`
// @api public
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

// Get a short lived auth token that will be automatically refreshed.
// Tokens are 1:1 for deployments.  Want to access another deployment?
// You'll need to get another token for it.
Service.prototype.setCredentials = function(seed, fn){
  var self = this,
    // Refresh our token 15 seconds before it expires.
    expirationRedLine = 15 * 1000;

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
  service: null,
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
    var instance = require('./models').instance, payload;
    instance.once('change:_id', this.switchedInstance, this);

    _.defaults(options || (options = {}), {
      uri: _.result(this, 'uri')
    });

    this.subscription = {token: srv.token, instance_id: instance.id};

    srv.io
      .addListener(options.uri, this.iohandler.bind(this))
      .emit(options.uri, payload);

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

module.exports.Model = Backbone.Model.extend(mixins);
module.exports.List = Backbone.Collection.extend(mixins);
