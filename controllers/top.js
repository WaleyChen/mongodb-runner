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
  show: function(){
    this.top.fetch();
  },
  render: function(){
    var self = this;
    // @todo: Use webworker for log processing instead of animation frame?
    requestAnimationFrame(function(){
      var ctx = self.top.toJSON();
      self.$el.html(self.tpl(ctx));
      return self;
    });
  }
});
