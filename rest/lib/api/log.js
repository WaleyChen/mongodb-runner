'use strict';

var smongo = require('../smongo'),
  token = require('../token'),
  NotAuthorized = require('./errors').NotAuthorized,
  mongolog = require('mongolog');

module.exports = function(app){
  app.get('/api/v1/:host/log', token.required, get);
  app.get('/api/v1/:host/log/:name', token.required, get);

  smongo.log(app);
};

function get(req, res, next){
  req.mongo.admin().command({getLog: req.param('name', 'global')}, function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('do not have permission to view logs'));

    res.send(mongolog.parse(data.documents[0].log));
  });
}
