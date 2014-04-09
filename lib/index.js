if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'development';
  process.env.DEBUG = '*';
}

var express = require('express'),
  app = module.exports = express(),
  nconf = require('nconf'),
  up = require('up'),
  http = require('http'),
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

app.use(function(err, req, res, next){
  if(!err.http) return next(err);
  res.send(err.code, err.message);
});

app.start = function(){
  var file = __dirname + '/../index.js',
    // numWorkers = require('os').cpus().length,
    numWorkers = 1,
    workerTimeout = null,
    keepAlive = true;

  var httpServer = http.Server().listen(nconf.get('port'));
  app.srv = up(httpServer, file, {
    numWorkers: numWorkers,
    workerTimeout: workerTimeout,
    keepAlive: keepAlive
  });
};

app.reload = function(){
  app.srv.reload();
};
