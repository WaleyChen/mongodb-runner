"use strict";

var Backbone = require('backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mongoscope:security');

module.exports = Backbone.View.extend({
  tpl: require('../templates/security.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.security = new models.Security()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    var self = this;
    this.security.fetch();
  },
  deactivate: function(){

  },
  render: function(){
    this.$el.html(this.tpl(this.security.toJSON()));
    return this;
  }
});
