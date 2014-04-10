var smongo = require('../smongo');

module.exports = function(app){
  app.get('/api/v1/:host/top', smongo.top(app));
};
