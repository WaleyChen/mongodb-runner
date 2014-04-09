'use strict';

var deployment = require('../deployment'),
  nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
  token = require('../token'),
  debug = require('debug')('mg:rest');

module.exports = function(app){
  app.param('database_name', function(req, res, next, name){
    debug('for database', name);
    req.db = req.mongo.db(name);
    req.db.name = name;
    next();
  });

  app.param('collection_name', function(req, res, next, name){
    debug('for collection', name);
    req.db.collection(name, function(err, col){
      if(err) return next(err);
      req.col = col;
      next();
    });
  });

  app.param('host', token.required);

  app.get('/api/v1', token.required, function(req, res){
    deployment.all(function(err, docs){
      res.send(docs.map(function(d){
        return {_id: d._id, instances: d.instances};
      }));
    });
  });

  // Actor sends a post request with their `username` and `password`.
  // Try and connect to mongo with those credentials.
  app.post('/api/v1/token', function(req, res, next){
    var username = req.param('username'),
      password = req.param('password'),
      host = req.param('host', 'localhost:27017'),
      uri = 'mongodb://';

    if(username && password){
      uri += username + ':' + password + '@';
    }
    uri += host;

    debug('discovering deployment', uri);
    deployment.discover(uri, function(err, dep){
      // If we can't connect, either mongo is not running these
      // or the credentials are invalid.
      if(err) return next(err);

      debug('generating token');
      // If we're able to successfully connect, generate a signed json web
      // token that contains an id to use the connection.
      var token = jwt.sign({deployment: host},
        nconf.get('token:secret'), {expiresInMinutes: nconf.get('token:lifetime')});

      debug('adding connection for new token session');
      deployment.get(host, function(err, deploy){
        deploy.connection(token, dep.db);
        return res.send(200, {token: token});
      });
    });
  });

  ['replicaset', 'host', 'log', 'top', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });

  app.get('/health-check', function(req, res){
    res.send('ok');
  });
};
