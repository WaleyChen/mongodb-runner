module.exports.routes = function(app){
  function getLog(req, res, next){
    req.mongo.admin().command({getLog: req.param('name', 'global')}, function(err, data){
      if(err) return next(err);
      res.send(data.documents[0].log);
    });
  }
  app.get('/api/v1/log', getLog);
  app.get('/api/v1/log/:name', getLog);
};
