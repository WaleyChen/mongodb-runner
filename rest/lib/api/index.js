var prefix = '/api/v1';

module.exports = function(app){
  app.get(prefix, function(req, res, next){
    return res.redirect('/api/v1', function(req, res, next){
      res.send(req.deployments);
    });
  });

  ['replicaset', 'host', 'log', 'top', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });
};
