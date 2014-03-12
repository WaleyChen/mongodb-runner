"use strict";

var Controller = require('../splint').Controller;

module.exports = Controller.extend({
  models: {
    instance: require('../models').instance
  },
  tpl: require('../templates/pulse.jade')
});

