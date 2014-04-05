'use strict';

var Controller = require('../lib/splint').Controller;

module.exports = Controller.extend({
  models: {
    instance: require('../models').instance
  },
  tpl: require('../templates/replication.jade')
});
