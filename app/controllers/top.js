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
    if(!self.interval){
      self.interval = setInterval(function(){
        self.top.fetch();
      }, 1000);
    }
  },
  deactivate: function(){
    if(this.interval){
      clearInterval(this.interval);
    }
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
