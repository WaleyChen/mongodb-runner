var $ = require('jquery')(process);

// Wrap the MongoDB REST API in a pretty interface.
//
// @note: You must start mongod with `--rest` and use
// `mongodb-api-proxy <http://github.com/imlucas/mongodb-api-proxy>` for now.
//
// @todo Backbone friendly adapter.
//
// @param {String, default:localhost} Hostname of the instance
// @param {Number, default:3001} Port mongodb-api-proxy is listening on.
// @api public
function Service(hostname, port){
  this.hostname = hostname || 'localhost';
  this.port = port || 3001;
  this.origin = 'http://' + this.hostname + ':' + this.port;
}

// Get raw log lines.
//
// @param {String, default:global} optional log name to restrict to (default: global).
// @param {Function} fn
// @api public
Service.prototype.getLog = function(name, fn){
  if(typeof name === 'function'){
    fn = name;
    name = 'global';
  }
  this.read('/admin/$cmd/', {filter_getLog: name, limit: 1}, function(err, data){
    if(err) return fn(err);
    fn(null, data.rows.log);
  });
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

  $.get(this.origin + pathname, params, function(data){
    fn(null, data);
  }, 'json').fail(function(event, jqxhr, settings, err){
    fn(err);
  });
};

module.exports = Service;
