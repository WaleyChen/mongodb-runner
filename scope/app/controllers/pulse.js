var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mg:scope:pulse');

module.exports = Backbone.View.extend({
  tpl: require('../templates/pulse.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.activated = false;

    this.instance = models.instance
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    this.activated = true;
    this.instance.fetch();
  },
  deactivate: function(){
    this.activated = false;
  },
  render: function(){
    if(this.activated === false) return this;
    var self = this;

    self.$el.html(self.tpl({
      'instance': self.instance.toJSON()
    }));
  }
});

