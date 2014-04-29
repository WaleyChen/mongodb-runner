var nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
  errors = require('./errors'),
  NotAuthorized = errors.NotAuthorized,
  BadRequest = errors.BadRequest,
  Forbidden = errors.Forbidden,
  uuid = require('uuid'),
  Deployment = require('./deployment'),
  debug = require('debug')('mongoscope:token');

module.exports = getContext;

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

module.exports.create = function(ctx, fn){
  var session_id = uuid.v4(),
    payload = {
      deployment_id: ctx.deployment._id,
      session_id: session_id
    },
    opts = {
      expiresInMinutes: nconf.get('token:lifetime')
    },
    secret = nconf.get('token:secret'),
    token = jwt.sign(payload, secret, opts),
    now = Date.now();

  debug('token payload', payload);
  ctx.session_id = session_id;

  ctx.deployment.createSession(ctx.session_id, ctx.seed, function(err){
    if(err) return fn(err);

    fn(null, {
      token: token,
      deployment_id: ctx.deployment._id,
      id: ctx.session_id,
      expires_at: new Date(now + (nconf.get('token:lifetime') * 60 * 1000)),
      created_at: new Date(now)
    });
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
  if(req.param('host')){
    req.instance_id = Deployment.getId(req.param('host'));
  }

  getContext(access_token, req, next);
};

function getContext(token, ctx, next){
    verify(token, function(err, data){
    if(err) return next(err);

    if(!data.session_id) return next(new BadRequest('Missing session id'));

    debug('token validated for deployment', data.deployment_id);

    Deployment.get(data.deployment_id, function(err, deployment){
      if(err) return next(err);
      if(!deployment) return next(new BadRequest('Deployment not found'));

      ctx.deployment = deployment;
      if(ctx.instance_id){
        debug('looking up instance', ctx.instance_id);

        ctx.instance = deployment.getInstance(ctx.instance_id);

        if(!ctx.instance){
          return next(new Forbidden('Tried getting a connection ' +
            'to `' + ctx.instance_id + '` but it is not in deployment `'+data.deployment_id+'`'));
        }

        debug('getting connection for session', data.session_id);
        ctx.mongo = ctx.instance.getConnection(data.session_id);
        return next();
      }
      else {
        deployment.getSeedConnection(function(err, db){
          if(err) return next(err);
          ctx.mongo = db;
          next();
        });
      }
    });
  });
}
