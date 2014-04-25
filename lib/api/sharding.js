var debug = require('debug')('mongoscope:sharding'),
  sharding = require('../monger/sharding');

module.exports = function(app){
  app.get('/api/v1/:host/sharding', function(req, res, next){
    sharding(req.mongo, function(err, data){
      debug('sharding info', err, data);
      if(err) return next(err);
      res.send(data);
    });
  });
};
