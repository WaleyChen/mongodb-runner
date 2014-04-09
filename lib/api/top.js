var smongo = require('../smongo');

module.exports = function(app){
  app.get('/api/v1/top/:host', smongo.top(app));
};
