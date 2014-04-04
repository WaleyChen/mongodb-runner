var jwt = require('jsonwebtoken'),
  connect = require('mongodb').MongoClient.connect,
  validateToken = require('express-jwt'),
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
      req.db = app._connections[req.user];
      delete req.user;
      next();
    });

  // Where we'll keep successfully opened connections.
  app._connections = {};
  app._connectionReaperTimeouts = {};

  // Actor sends a post request with their `username` and `password`.
  // Try and connect to mongo with those credentials.
  app.post('/api/v1/token', function(req, res, next){
    var username = req.param('username'),
      password = req.param('password'),
      host = req.param('host', 'localhost');

    connect(username + ':' + password + '@' + host, function(err, db){
      // If we can't connect, either mongo is not running these
      // or the credentials are invalid.
      if(err || !db) {
        return res.send(403, 'Invalid credentials');
      }

      // If we're able to successfully connect, generate a signed json web
      // token that contains an id to use the connection.
      var connectionId = Date.now(),
        token = jwt.sign({connection: connectionId}, secret, options);

      app._connections[connectionId] = db;

      // Set a timeout to reap the connection a little after the token
      // is supposed to expire.
      app._connectionReaperTimeouts = setTimeout(function(){
        if(app._connections[connectionId]){
          delete app._connections[connectionId];
          debug('reaped connection', connectionId);
        }
      }, (options.write.expiresInMinutes * 60 * 1000) + 1000);

      return res.send(200, {token: token});
    });
  });

  // Clients are then responsible for getting a new token just before
  // it expires, re-sending username and password just like AWS does:
  // https://github.com/aws/aws-sdk-js/blob/e2c4f1e678224642e87c4446083351f7c22a37ba/lib/credentials.js#L87
  //
  // Some example code:
  //     Service.prototype.setCredentials = function(username, password, options, fn){
  //       var data = _.extend({username: username, password: password}, {}, options);
  //       debug('getting token');
  //       this.post('/api/v1/token', data, function(err, res){
  //         if(err) return fn(err);
  //         this.token = res.token;
  //
  //         var tokenLifetime = new Date(res.expiration) - Date.now();
  //         setTimeout(function(){
  //           this.setCredentials(username, password, options, function(err){
  //             if(err) return fn(err);
  //             debug('token refreshed successfully');
  //           }.bind(this));
  //         }.bind(this), tokenLifetime - (15 * 1000));
  //
  //         fn(null);
  //       }.bind(this));
  //     };
};
