var $ = require('jquery'),
  _ = require('underscore'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  debug = require('debug')('mongoscope:service'),
  socketio = require('socket.io-client'),
  srv;

module.exports = function(hostname, port){
  if(!srv){
    debug('init', hostname, port);
    srv = new Service(hostname, port).connect();
  }
  return srv;
};

// Wrap the MongoDB REST API in a pretty interface.
//
// @param {String} Hostname of the instance
// @param {Number} port mongorest is listening on.
// @api public
function Service(hostname, port){
  this.hostname = hostname;
  this.port = port;
  this.connected = false;
  this.token = null;
}
util.inherits(Service, EventEmitter);

Service.prototype.connect = function(){
  if(this.connected) return this;

  this.origin = 'http://' + this.hostname;
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

Service.prototype.get = function(host, pathname, params, fn){
  if(!host || host.indexOf(':') === -1) return fn(new Error('Must specify host'));
  return this.read('/' + host + pathname, params, fn);
};

Service.prototype.importer = function(host, dbName, collName, pipechain, fn){
  return this.post('/' + host + '/' + dbName + '/' +
      collName + '/import', {pipechain: JSON.stringify(pipechain)}, fn);
};

// An easier to use top.
//
// @param {Function} fn `(err, {Top})`
// @api public
Service.prototype.top = function(host, fn){
  this.get(host, '/top', {}, fn);
};

// Instance level metadata:
//
// - build
// - host
// - database_names
//
// @param {Function} fn `(err, data)`
// @api public
Service.prototype.instance = function(host, fn){
  this.get(host, '', {}, fn);
};

Service.prototype.deployments = function(fn){
  this.read('/', fn);
};

Service.prototype.security = function(host, fn){
  this.get(host, '/security', {}, fn);
};

Service.prototype.securityUsers = function(host, db, username, fn){
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

  this.get(host, '/security/users' + pathname, {}, fn);
};

Service.prototype.securityRoles = function(host, db, role, fn){
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
  this.get(host, '/security/roles' + pathname, {}, fn);
};
// Get a list of log `line` objects.
//
// @param {String, default:global} optional log name to restrict to (default: global).
// @param {Function} fn `(err, [line])`
// @api public
Service.prototype.log = function(host, name, fn){
  var pathname;
  if(typeof name === 'function'){
    fn = name;
    pathname = '/log';
  }
  else {
    pathname = '/log/' + name;
  }
  this.get(host, pathname, {}, fn);
};


// Get metadata for a database.
//
// @param {String} db A database name
// @param {Function} fn `fn(err, database)`
// @api public
Service.prototype.database = function(host, name, fn){
  this.get(host, '/' + name, {}, fn);
};

// @param {String} db database name
// @param {String} name collection name
// @param {String, default:{}} [spec] query spec to use
// @param {Function} fn `(err, docs)`
// @api private
Service.prototype.find = function(host, db, name, spec, fn){
  this.get(host, '/' + db + '/' + name + '/find', spec, fn);
};

// Get all collection metadata.
//
// @param {String} db A database name
// @param {String} name A collection name
// @param {Function} fn `fn(err, data)`
// @api public
Service.prototype.collection = function(host, db, name, fn){
  this.get(host, '/' + db + '/' + name, {}, fn);
};

Service.prototype.sharding = function(host, fn){
  this.get(host, '/sharding', {}, fn);
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
  iohandler: function(data){
    if (!this.set(data)) return false;
    this.trigger('sync', this, data, {});
  },
  subscribe: function(options){
    srv.connect();

    _.defaults(options || (options = {}), {
      uri: _.result(this, 'uri')
    });

    srv.io
      .addListener(options.uri, this.iohandler.bind(this))
      .emit(options.uri, {token: srv.token});

    debug('subscribing', options.uri, {token: srv.token});

    this.trigger('subscribed', this, srv.io, options);
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
      .emit(_.result(this, 'uri') + '/unsubscribe');

    this.trigger('unsubscribed', this, srv.io, options);
    return this;
  }
};

module.exports.Model = Backbone.Model.extend(mixins);
module.exports.List = Backbone.Collection.extend(mixins);
