'use strict';
var nconf = require('nconf'),
  urllib = require('url');

nconf.argv().env().use('memory').defaults({
  'listen': '0.0.0.0:29017',
  'seed': 'mongodb://localhost:27017',
  'token': {
    'lifetime': 60,
    'secret': 'mongoscope ' + process.pid + ' hehe'
  }
});

if(!/^https?:\/\//.test(nconf.get('listen'))){
  nconf.set('listen', 'http://' + nconf.get('listen'));
}

var parsed = urllib.parse(nconf.get('listen'));
['href', 'port', 'hostname', 'protocol'].map(function(k){
  nconf.set(k, parsed[k]);
});

var app = require('./lib'),
  server = require('http').createServer(app);

module.exports = server;
