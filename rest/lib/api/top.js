'use strict';

var smongo = require('../smongo'),
  token = require('../token');

module.exports = function(app){
  app.get('/api/v1/top/:host', token.required, smongo.top(app));
};
