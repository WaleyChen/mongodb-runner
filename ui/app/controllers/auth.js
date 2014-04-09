var Backbone = require('backbone'),
  $ = Backbone.$,
  moment = require('moment'),
    models = require('../models'),
  debug = require('debug')('mongoscope:auth');

module.exports = Backbone.View.extend({
  tpl: require('../templates/auth.jade'),
  initialize: function(){},
  activate: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.$el.html(this.tpl({
      host: ''
    }));
  },
  deactivate: function(){},
  render: function(){}
});
