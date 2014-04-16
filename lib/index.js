if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'production';
}

var express = require('express'),
  app = module.exports = express(),
  nconf = require('nconf'),
  urllib = require('url'),
  debug = require('debug')('mongoscope'),
  EventEmitter = require('events').EventEmitter;

nconf.argv().env().use('memory').defaults({
  listen: '127.0.0.1:29017',
  seed: 'mongodb://localhost:27017',
  token: {
    lifetime: 60,
    secret: 'mongoscope hehe'
  },
  // kiosk: {
  //   seed: 'mongodb://demo:demo@localhost:27017',
  //   // Minutes to wait between resets to pristine
  //   lifetime: 60,
  //   // Where to copy pristine data from
  //   source: '~/.mongodb/kiosk-pristine'
  // }
});

if(nconf.get('listen').indexOf('http') !== 0){
  nconf.overrides({
    listen: 'http://' + nconf.get('listen')
  });
  debug('listen now at', nconf.get('listen'));
}

var parsed = urllib.parse(nconf.get('listen'));
['href', 'port', 'hostname', 'protocol'].map(function(k){
  nconf.set(k, parsed[k]);
  debug('set ' + k, nconf.get(k));
});

var bus = new EventEmitter();
app.on = bus.on;
app.emit = bus.emit;


// @todo: validate token:expires <= 60 minutes
// @todo: validate token:secret is actually set

app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

require('./api')(app);

app.use(express.static(__dirname + '/../static'));

app.use(function(err, req, res, next){
  debug('error detected: ' + err.message, err.stack);
  if(err.message.indexOf('failed to connect') > -1){
    return res.send(400, err.message);
  }
  if(!err.http) return next(err);
  res.send(err.code, err.message);
});
