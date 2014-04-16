var nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
  errors = require('./errors'),
  NotAuthorized = errors.NotAuthorized,
  BadRequest = errors.BadRequest,
  Forbidden = errors.Forbidden,
  deployment = require('./deployment'),
  debug = require('debug')('mongoscope:token');


function verify(token, fn){
  debug('verifying token');
  jwt.verify(token, nconf.get('token:secret'), function(err, data) {
    if (err){
      debug('invalid token', err.message);
      return fn(new Forbidden(err.message));
    }

    fn(null, data);
  });
}

var getConnection = module.exports.connection = function(token, host, fn){
  debug('looking up deployment for', host);
  deployment.get(host, function(err, deploy){
    if(!deploy){
      return fn(new BadRequest('Could not find deployment for ' + host));
    }

    var mongo = deploy.connection(token);

    if(!mongo){
      return fn(new BadRequest('Not connection for token.  Must request a new one.'));
    }

    fn(null, mongo);
  });
};

module.exports.required = function(req, res, next){
  if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
    if (req.headers['access-control-request-headers'].split(', ').indexOf('authorization') !== -1) {
      debug('handing off cors pre-flight');
      return next();
    }
  }

  var access_token = req.param('access_token');
  if(!access_token){
    if(!req.headers.authorization){
      debug('no auth header');
      return next(new NotAuthorized('Missing authorization header'));
    }
    var parts = req.headers.authorization.split(' ');
    access_token = parts[1];

    if(parts.length !== 2 || parts[0] !== 'Bearer'){
      debug('malformed auth header');
      return next(new BadRequest('Authorization header missing Bearer scheme'));
    }
  }

  verify(access_token, function(err, data){
    if(err) return next(err);


    debug('token validated for deployment', data.deployment);

    getConnection(access_token, req.param('host'), function(err, connection){
      if(err) return next(err);

      req.mongo = connection;
      next();
    });
  });
};
