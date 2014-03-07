var Backbone = require('backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mongoscope:top');

module.exports = Backbone.View.extend({
  tpl: require('../templates/top.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.top = new models.Top()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    var self = this;
    self.top.fetch();
    this.top.subscribe('top');
  },
  deactivate: function(){
    this.top.unsubscribe('top');
  },
  render: function(){
    var self = this,
      ctx = self.top.toJSON();

    requestAnimationFrame(function(){
      self.$el.html(self.tpl(ctx));
      return self;
    });
  }
});
