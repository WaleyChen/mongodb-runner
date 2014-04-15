if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'production';
}

var express = require('express'),
  app = module.exports = express(),
  nconf = require('nconf'),
  path = require('path'),
  urllib = require('url'),
  debug = require('debug')('mongoscope'),
  EventEmitter = require('events').EventEmitter;

nconf.argv().env().use('memory').defaults({
  'listen': '127.0.0.1:29017',
  'seed': 'mongodb://localhost:27017',
  'token': {
    'lifetime': 60,
    'secret': 'mongoscope hehe'
  }
});

if(!/^https?:\/\//.test(nconf.get('listen'))){
  nconf.set('listen', 'http://' + nconf.get('listen'));
}

var parsed = urllib.parse(nconf.get('listen'));
['href', 'port', 'hostname', 'protocol'].map(function(k){
  nconf.set(k, parsed[k]);
});

console.log('creating app bus');
var bus = new EventEmitter();
app.on = bus.on;
app.emit = bus.emit;


// @todo: validate token:expires <= 60 minutes
// @todo: validate token:secret is actually set

app.use(function(req, res, next){
  req.io = app.get('io');

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

require('./api')(app);

app.use(express.static(__dirname + '/../static'));
debug('static root at', path.resolve(__dirname + '/../static'));

app.use(function(err, req, res, next){
  if(err.message.indexOf('failed to connect') > -1){
    return res.send(400, err.message);
  }
  if(!err.http) return next(err);
  res.send(err.code, err.message);
});
