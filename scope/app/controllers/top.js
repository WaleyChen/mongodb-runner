"use strict";

var Backbone = require('backbone'),
  models = require('../models'),
  debug = require('debug')('mongoscope:top');

module.exports = Backbone.View.extend({
  tpl: require('../templates/top.jade'),
  initialize: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);

    this.top = new models.Top()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    this.top.subscribe();
  },
  deactivate: function(){
    this.top.unsubscribe();
  },
  render: function(){
    var self = this,
      ctx = self.top.toJSON();

    process.nextTick(function(){
      self.$el.html(self.tpl(ctx));
      return self;
    });
  }
});
