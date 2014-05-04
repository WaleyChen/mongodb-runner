var Deployment = require('../deployment'),
  token = require('../token'),
  BadRequest = require('../errors').BadRequest,
  bodyParser = require('body-parser'),
  monger = require('../monger'),
  debug = require('debug')('mongoscope');

function isPreflight(req){
  return req.method === 'OPTIONS' && req.headers.hasOwnProperty('access-control-request-headers');
}

module.exports = function(app){

  app.monger = function(path, fn){return monger(app, path, fn);};
  app.param('database_name', function(req, res, next, name){
    if(isPreflight(req)) return next();

    if(!req.mongo) return next(new BadRequest('No connection context set.'));
    debug('for database', name);
    req.db = req.mongo.db(name);
    req.db.name = name;
    next();
  });

  app.param('collection_name', function(req, res, next, name){
    if(isPreflight(req)) return next();

    debug('for collection', name);
    req.db.collection(name, function(err, col){
      if(err) return next(err);
      req.col = col;
      next();
    });
  });

  app.param('instance_id', token.required);

  app.get('/api/v1', token.required, function(req, res){
    Deployment.all(function(err, deployments){
      res.send(deployments.map(function(deployment){
        return deployment.toJSON();
      }));
    });
  });

  function send(deployment, ctx, res, next){
    debug('sending token');
    ctx.deployment = deployment;
    return token.create(ctx, function(err, data){
      if(err) return next(err);
      res.format({
        text: function(){
          res.send(201, data.token);
        },
        default: function(){
          res.send(201, data);
        }
      });
    });
  }

  app.post('/api/v1/token', bodyParser(), function(req, res, next){
    var url = req.param('seed'),
      ctx = {instance_id: Deployment.getId(url), seed: url, accept: req.headers.accept};

    if(!url) return next(new BadRequest('No seed specified'));

    Deployment.resolve(url, function(err, deployment){
      if(err) return next(err);

      if(deployment) return send(deployment, ctx, res, next);

      Deployment.create(url, function(err, deployment){
        if(err) return next(err);

        return send(deployment, ctx, res, next);
      });
    });
  });

  // @todo: now that we're on express 4, we should switch over these modules
  // to just building on `app = new Router()`.
  ['replication', 'instance', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });

  app.get('/health-check', function(req, res){
    res.send('ok');
  });
};
