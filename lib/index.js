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
  listen: 'http://127.0.0.1:29017',
  seed: 'mongodb://localhost:27017',
  token: {
    lifetime: 60,
    secret: 'mongoscope hehe'
  }
});

nconf.overrides({readonly: true});

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
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  next();
});

app.set('json spaces', 2);

require('./api')(app);

app.use(express.static(__dirname + '/../static'));

app.use(function(err, req, res, next){
  if(err.message.indexOf('failed to connect') > -1) err.http = 400;

  if(!err.http) return next(err);

  console.log('caught error', JSON.stringify(err));
  res.format({
    text: function(){
      res.send(err.code, err.message.toString());
    },
    json: function(){
      res.send(err.code, err);
    }
  });
});
