// @todo: redo all of this...
var Backbone = require('backbone');

var Replication = Backbone.View.extend({
  models: {
    deployments: require('../models').deployments
  },
  tpl: require('../templates/replication.jade')
});

module.exports = function(opts){
  return new Replication(opts);
};
