var deployment = require('../deployment'),
  token = require('../token'),
  prefix = '/api/v1';

module.exports = function(app){
  app.get(prefix, token.required, function(req, res){
    res.send(deployment.all().map(function(d){
      return {seed: d.seed, instances: d.instances};
    }));
  });

  ['replicaset', 'host', 'log', 'top', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });

  app.get('/health-check', function(req, res){
    res.send('ok');
  });
};
