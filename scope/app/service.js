"use strict";

var $ = require('jquery')
  , debug = require('debug')('mg:scope:service')
  , socketio = require('socket.io-client')
  , srv;

module.exports = function(hostname, port){
  if(!srv) srv = new Service(hostname, port).connect();
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
}

Service.prototype.connect = function(){
  if(this.connected) return this;

  this.origin = 'http://' + this.hostname + ':' + this.port;
  this.io = socketio.connect(this.origin).on('connected', function(){
    debug('socketio connected');
  });
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

  // debug('$get  ' + pathname, params);

  $.get(this.origin + '/api/v1' + pathname, params, function(data){
    if(typeof data === 'string'){
      data = JSON.parse(data);
    }

    // debug('$res  ' + pathname, data);
    fn(null, data);
  });
};

// An easier to use top.
//
// @param {Function} fn `(err, {Top})`
// @api public
Service.prototype.top = function(fn){
  this.read('/top', function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

// Instance level metadata:
//
// - build
// - host
// - database_names
//
// @param {Function} fn `(err, data)`
// @api public
Service.prototype.instance = function(fn){
  this.read('/', function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

Service.prototype.security = function(fn){
  this.read('/security', function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

Service.prototype.securityUsers = function(username, fn){
  if(typeof username === 'function'){
    fn = username;
    username = null;
  }

  this.read('/security/users' + (username ? '/' + username : ''), function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

// Get a list of log `line` objects.
//
// @param {String, default:global} optional log name to restrict to (default: global).
// @param {Function} fn `(err, [line])`
// @api public
Service.prototype.log = function(name, fn){
  var path;
  if(typeof name === 'function'){
    fn = name;
    path = '/log';
  }
  else {
    path = '/log/' + name;
  }
  this.read(path, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};


// Get metadata for a database.
//
// @param {String} db A database name
// @param {Function} fn `fn(err, database)`
// @api public
Service.prototype.database = function(name, fn){
  this.read('/' + name, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

// @param {String} db database name
// @param {String} name collection name
// @param {String, default:{}} [spec] query spec to use
// @param {Function} fn `(err, docs)`
// @api private
Service.prototype.find = function(db, name, spec, fn){
  this.read('/' + db + '/' + name + '/find', spec, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

// Get all collection metadata.
//
// @param {String} db A database name
// @param {String} name A collection name
// @param {Function} fn `fn(err, data)`
// @api public
Service.prototype.collection = function(db, name, fn){
  this.read('/' + db + '/' + name, function(err, data){
    if(err) return fn(err);
    fn(null, data);
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

    if(this.hasChanged('deltas')){
      debug('$chang', 'deltas');
    }
    this.trigger('sync', this, data, {});
  },
  subscribe: function(options){
    if(!srv.io) return this;

    srv.connect();

    _.defaults(options || (options = {}), {
      uri: _.result(this, 'uri')
    });

    srv.io
      .on(options.uri, this.iohandler.bind(this))
      .emit(options.uri);

    this.trigger('subscribed', this, srv.io, options);
    return this;
  },
  unsubscribe: function(options){
    if(!srv.io) return this;

    srv.connect();

    _.defaults(options || (options = {}), {
      uri: _.result(this, 'uri')
    });

    debug('$unsub ' + options.uri);

    srv.io.emit(_.result(this, 'url') + '/unsubscribe');

    this.trigger('unsubscribed', this, srv.io, options);
    return this;
  }
};

module.exports.Model = Backbone.Model.extend(mixins);
module.exports.List = Backbone.Collection.extend(mixins);
