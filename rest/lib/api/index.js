var prefix = '/api/v1';

module.exports = function(app){
  app.get(prefix, function(req, res){
    res.send(req.deployments);
  });

  ['replicaset', 'host', 'log', 'top', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });
};
