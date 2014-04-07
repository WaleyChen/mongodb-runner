'use strict';

var jwt = require('jsonwebtoken'),
  connect = require('mongodb').MongoClient.connect,
  errors = require('./api/errors'),
  NotAuthorized = errors.NotAuthorized,
  BadRequest = errors.BadRequest,
  Forbidden = errors.Forbidden,
  nconf = require('nconf'),
  deployment = require('./deployment');

module.exports = function(app){
  // Require the client to send a valid token to any requests except
  // login post and form.

  // Where we'll keep successfully opened connections.
  app._connections = {};
  app._connectionReaperTimeouts = {};

  // Actor sends a post request with their `username` and `password`.
  // Try and connect to mongo with those credentials.
  app.post('/api/v1/token', function(req, res, next){
    var username = req.param('username'),
      password = req.param('password'),
      host = req.param('host', 'localhost:27017'),
      uri = 'monogodb://';

    if(username && password){
      uri += username + ':' + password + '@';
    }
    uri += host;

    connect(uri, function(err, db){
      // If we can't connect, either mongo is not running these
      // or the credentials are invalid.
      if(err || !db) return next(new Forbidden('Invalid credentials'));

      // If we're able to successfully connect, generate a signed json web
      // token that contains an id to use the connection.
      var token = jwt.sign({deployment: host},
        nconf.get('token:secret'), {expiresInMinutes: nconf.get('token:lifetime')});

      deployment.get(host).connection(token, db).ping();

      return res.send(200, {token: token});
    });
  });
};

module.exports.required = function(req, res, next){
  if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
    if (req.headers['access-control-request-headers'].split(', ').indexOf('authorization') !== -1) {
      return next();
    }
  }

  if(!req.headers.authorization) return next(new NotAuthorized('Missing authorization header'));
  var parts = req.headers.authorization.split(' '),
    token = parts[1];

  if(parts.length !== 2) return next(new BadRequest('Authorization header malformed'));

  jwt.verify(token, nconf.get('token:secret'), function(err, decoded) {
    if (err) return next(new Forbidden('Invalid Token: ' + err.message));

    req.mongo = deployment.get(req.param('host')).connection(decoded.deployment, token);
    next();
  });
};
