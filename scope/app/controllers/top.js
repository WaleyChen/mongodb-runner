"use strict";

var Backbone = require('backbone'),
  models = require('../models'),
  debug = require('debug')('mg:scope:top'),
  creek = require('../creek');

module.exports = Backbone.View.extend({
  tpl: require('../templates/top.jade'),
  initialize: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);

    this.activated = false;
    this.metric = 'lock.count';

    this.top = new models.Top()
      .on('sync', this.render, this)
      .on('error', this.render, this);

    this.graphs = {};
  },
  activate: function(){
    this.top.fetch();
    this.top.subscribe();
    this.activated = true;
  },
  deactivate: function(){
    this.activated = false;
  },
  render: function(){
    if(!this.activated) return this;
    var self = this,
      ctx = self.top.toJSON();
    ctx.metric = this.metric;

    this.top.get('namespaces').map(function(ns, i){
      var item = creek('#creek-' + i, {interpolation: 'step-after'});
      self.graphs[ns] = item;
      return item;
    });

    this.top.get('namespaces').map(function(ns){
      self.graphs[ns].inc(self.top.get('deltas')[ns + '.total.count']);
    });

    if(this.$el.find('.graph-title').length === 0){
      self.$el.html(self.tpl(ctx));

      this.top.get('namespaces').map(function(ns){
        self.graphs[ns].render();
      });
    }
    return this;
  }
});
