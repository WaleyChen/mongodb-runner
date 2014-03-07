"use strict";

var $ = require('jquery'),
  debug = require('debug')('mg:scope:service'),
  socketio = require('socket.io-client');

// Wrap the MongoDB REST API in a pretty interface.
//
// @note: You must start mongod with `--rest` and use
// `mongodb-api-proxy <http://github.com/imlucas/mongodb-api-proxy>` for now.
//
// @todo Backbone friendly adapter?
//
// @param {String, default:localhost} Hostname of the instance
// @param {Number, default:3000} Port mongodb-api-proxy is listening on.
// @api public
function Service(hostname, port){
  this.hostname = hostname || 'localhost';
  this.port = port || 3000;
  this.origin = 'http://' + this.hostname + ':' + this.port;

  this.io = socketio.connect(this.origin);
  this.io.on('connect', function(){
    debug('socketio connected');
  });

  this.io.on('connect_error', function(err){
    debug('socketio connection error :(', err);
  });
}

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

  debug('get', this.origin + '/api/v1' + pathname, params);

  $.get(this.origin + '/api/v1' + pathname, params, function(data){
    if(typeof data === 'string'){
      data = JSON.parse(data);
    }

    debug('res', data);
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

// Get a list of log `line` objects.
//
// @param {String, default:global} optional log name to restrict to (default: global).
// @param {Function} fn `(err, [line])`
// @api public
Service.prototype.log = function(name, fn){
  var path;
  if(typeof name === 'function'){
    fn = name;
    path = '/log/global';
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
  return fn(new Error('deprecated'));
};

// Get all collection metadata.
//
// @param {String} db A database name
// @param {String} name A collection name
// @param {Function} fn `fn(err, data)`
// @api public
Service.prototype.collection = function(db, name, fn){
  this.read('/' + name, function(err, data){
    if(err) return fn(err);
    fn(null, data);
  });
};

// Get indexes in `db` and call `fn(err, indexes)` when complete.
//
// @param {String} db A database name
// @param {Function} fn `fn(err, indexes)`
// @api public
Service.prototype.indexes = function(db, fn){
  return fn(new Error('deprecated.  indexes returned via this.collection.'));
};

module.exports = Service;
