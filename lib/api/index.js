var Deployment = require('../deployment'),
  nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
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

  app.param('host', token.required);

  // Example response:
  //
  // ```
  //
  //     [
  //       {
  //         "_id": "localhost:27017",
  //         "instances": {
  //           "localhost:27017": {
  //             "type": "standalone",
  //             "uri": "localhost:27017"
  //           }
  //         }
  //       }
  //     ]
  // ```
  app.get('/api/v1', token.required, function(req, res){
    Deployment.all(function(err, docs){
      res.send(docs.map(function(doc){
        return {
          _id: doc._id,
          name: doc.name,
          seed: doc.seed,
          sharding: doc.sharding,
          instances: doc.instances.map(function(i){
            return {
              _id: i._id,
              name: i.name,
              url: i.url,
              type: i.type,
              state: i.state,
              rs: i.rs,
              shard: i.shard
            };
          })
        };
      }));
    });
  });

  function send(deployment, ctx, res, next){
    debug('sending token');
    ctx.deployment = deployment;
    return token.create(ctx, function(err, data){
      if(err) return next(err);
      return res.send(201, data);
    });
  }

  app.post('/api/v1/token', bodyParser(), function(req, res, next){
    var url = req.param('seed'),
      ctx = {instance_name: url.replace('mongodb://', ''), seed: url};

    if(!url) return next(new BadRequest('No seed specified'));

    Deployment.get(url, function(err, deployment){
      if(err) return next(err);

      if(deployment) return send(deployment, ctx, res, next);

      Deployment.create(url, function(err, deployment){
        if(err) return next(err);

        return send(deployment, ctx, res, next);
      });
    });
  });

  ['sharding', 'replicaset', 'host', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });

  app.get('/health-check', function(req, res){
    res.send('ok');
  });
};
