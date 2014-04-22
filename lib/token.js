var nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
  errors = require('./errors'),
  NotAuthorized = errors.NotAuthorized,
  BadRequest = errors.BadRequest,
  Forbidden = errors.Forbidden,
  Deployment = require('./deployment'),
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

function isPreflight(req){
  var want = (req.headers['access-control-request-headers'] || '')
    .split(', ');

  return (req.method === 'OPTIONS' && want.indexOf('authorization') !== -1);
}

function prepare(token, ctx, fn){
  verify(token, function(err, data){
    if(err) return fn(err);

    debug('token validated for deployment', data.deployment_id);

    Deployment.get(data.deployment_id, function(err, deployment){
      if(err) return fn(err);
      if(!deployment) return fn(new BadRequest('Deployment not found'));

      ctx.deployment = deployment;
      ctx.instance = deployment.getInstance({name: ctx.instance_name});
      if(ctx.instance){
        ctx.mongo = ctx.instance.getConnection(data.connection_id);
      }
      else {
        ctx.mongo = deployment.instances[0].getConnection(data.connection_id);
      }
      fn();
    });
  });
}

module.exports = prepare;
module.exports.create = function(ctx, fn){
  var token = jwt.sign({deployment_id: ctx.deployment._id},
    nconf.get('token:secret'), {expiresInMinutes: nconf.get('token:lifetime')}),
    now = Date.now();

  fn(null, {
    token: token,
    deployment_id: ctx.deployment._id,
    expires_at: new Date(now + (nconf.get('token:lifetime') * 60 * 1000)),
    created_at: new Date(now)
  });
};

module.exports.required = function(req, res, next){
  if(isPreflight(req)) return next();

  var access_token,
    auth = req.headers.authorization || '',
    parts = auth.split(' ');

  if(!auth) return next(new NotAuthorized('Missing authorization header'));

  access_token = parts[1];
  if(parts.length !== 2 || parts[0] !== 'Bearer'){
    return next(new BadRequest('Authorization header malformed.  ' +
      'Expect `Authorization: Bearer {{token}}`'));
  }

  req.instance_name = req.param('host');
  prepare(access_token, req, next);
};
