'use strict';

var smongo = require('../smongo'),
  NotAuthorized = require('../errors').NotAuthorized,
  mongolog = require('mongolog');

module.exports = function(app){
  app.get('/api/v1/:host/log', function(req, res, next){
    req.mongo.admin().command({getLog: 'global'}, function(err, data){
      if(err) return next(err);
      if(!data) return next(new NotAuthorized('do not have permission to view logs'));

      res.send(mongolog.parse(data.documents[0].log));
    });
  });

  smongo.log(app);
};
