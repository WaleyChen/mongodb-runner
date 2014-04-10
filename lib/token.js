var nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
  errors = require('./errors'),
  NotAuthorized = errors.NotAuthorized,
  BadRequest = errors.BadRequest,
  Forbidden = errors.Forbidden,
  deployment = require('./deployment'),
  debug = require('debug')('mongoscope:token');

module.exports.required = function(req, res, next){
  if (req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers')) {
    if (req.headers['access-control-request-headers'].split(', ').indexOf('authorization') !== -1) {
      debug('handing off cors pre-flight');
      return next();
    }
  }

  if(!req.headers.authorization){
    debug('no auth header', req);
    return next(new NotAuthorized('Missing authorization header'));
  }
  var parts = req.headers.authorization.split(' '),
    token = parts[1];

  if(parts.length !== 2 || parts[0] !== 'Bearer'){
    debug('malformed auth header');
    return next(new BadRequest('Authorization header missing Bearer scheme'));
  }

  debug('verifying token');

  jwt.verify(token, nconf.get('token:secret'), function(err, data) {
    if (err){
      debug('invalid token', err.message);
      return next(new Forbidden(err.message));
    }

    debug('token validated', data);
    if(!req.param('host')){
      return next();
    }

    debug('looking up deployment for', req.param('host'));
    deployment.get(req.param('host'), function(err, deploy){
      if(!deploy){
        return next(new BadRequest('Could not find deployment for ' + req.param('host')));
      }

      req.deployment = deploy;
      req.mongo = deploy.connection(token);

      if(!req.mongo){
        return next(new BadRequest('Not connection for token.  Must request a new one.'));
      }
      next();
    });
  });
};
