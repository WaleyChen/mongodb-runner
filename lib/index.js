if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'production';
}

var express = require('express'),
  app = module.exports = express(),
  nconf = require('nconf'),
  up = require('up'),
  path = require('path'),
  http = require('http'),
  urllib = require('url'),
  debug = require('debug')('mongoscope');

nconf.argv().env().use('memory').defaults({
  'listen': '127.0.0.1:29017',
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

// @todo: validate token:expires <= 60 minutes
// @todo: validate token:secret is actually set

app.use(express.urlencoded());

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
  if(!err.http) return next(err);
  res.send(err.code, err.message);
});

app.start = function(){
  debug('starting up master...');
  var httpServer, options,
    file = path.resolve(__dirname + '/../index.js');

  debug('server entrypoint', file);

  options = {
    numWorkers: 1,
    workerTimeout: null,
    keepAlive: true,
    hostname: nconf.get('hostname'),
    port: nconf.get('port')
  };
  debug('master options', options);

  debug('creating master http server');
  httpServer = http.Server().listen(nconf.get('port'), nconf.get('hostname'));

  debug('initializing up master');
  app.srv = up(httpServer, file, options);
};

// for running embedded
// because `lone` doesnt understand how to start scripts for `up`.
app.listen = function(){
  require(path.resolve(__dirname + '/../index.js'))
    .listen(nconf.get('port'), nconf.get('hostname'), function(){
      debug('listening', nconf.get('port'), nconf.get('hostname'));
    });
};

app.reload = function(){
  app.srv.reload();
};
