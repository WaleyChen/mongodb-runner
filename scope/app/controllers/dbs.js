var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mongoscope:databases');

module.exports = Backbone.View.extend({
  tpl: require('../templates/databases.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.instance = models.instance
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    this.instance.fetch();
  },
  deactivate: function(){},
  render: function(){
    var self = this;
    requestAnimationFrame(function(){
      self.$el.html(self.tpl({
        'instance': self.instance.toJSON()
      }));
    });
  }
});

