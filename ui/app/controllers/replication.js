var Controller = require('../lib/splint').Controller;

module.exports = Controller.extend({
  models: {
    deployments: require('../models').deployments
  },
  tpl: require('../templates/replication.jade')
});
