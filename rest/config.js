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

var listen = nconf.get('listen');
if(!/^https?:\/\//.test(listen)) listen = 'http://' + listen;
var parsed = urllib.parse(listen);
['href', 'port', 'hostname', 'protocol'].map(function(k){
  nconf.set(k, parsed[k]);
});
nconf.set('listen', listen);
