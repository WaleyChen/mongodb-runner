'use strict';

var jwt = require('jsonwebtoken'),
  connect = require('mongodb').MongoClient.connect,
  validateToken = require('express-jwt'),
  deployment = require('./deployment'),
  debug = require('debug')('mg:scope:auth');

// Include the pid in the secret so tokens are invalidated between
// process restarts.
var secret = 'mongoscope ' + process.pid + ' hehe';

// Issued tokens expire after 1 hour.
var options = {
  read: {
    secret: secret,
    skip: ['/api/v1/token', '/']
  },
  write: {
    expiresInMinutes: 60
  }
};

module.exports = function(app){
  // Require the client to send a valid token to any requests except
  // login post and form.
  app.use(validateToken(options.read), function(req, res, next){
      // Ok we have a valid token!  Let's get our connection
      // and ditch the unfortunate name choice...
      req.mongo = app._connections[req.user];
      delete req.user;
      next();
    });

  // Where we'll keep successfully opened connections.
  app._connections = {};
  app._connectionReaperTimeouts = {};

  // Actor sends a post request with their `username` and `password`.
  // Try and connect to mongo with those credentials.
  app.post('/api/v1/token', function(req, res){
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
      if(err || !db) {
        return res.send(403, 'Invalid credentials');
      }

      // If we're able to successfully connect, generate a signed json web
      // token that contains an id to use the connection.
      var connectionId = host,
        token = jwt.sign({connection: connectionId}, secret, options);

      deployment.ping(host, app);

      // @todo: connections should be applied to the deployment, which can
      // be a better container for all of this.
      app._connections[host] = db;

      // Set a timeout to reap the connection a little after the token
      // is supposed to expire.
      if(app._connectionReaperTimeouts[connectionId]){
        clearTimeout(app._connectionReaperTimeouts[connectionId]);
      }

      app._connectionReaperTimeouts[connectionId] = setTimeout(function(){
        if(app._connections[connectionId]){
          delete app._connections[connectionId];
          debug('reaped connection', connectionId);
        }
      }, (options.write.expiresInMinutes * 60 * 1000) + 1000);

      return res.send(200, {token: token});
    });
  });
};
