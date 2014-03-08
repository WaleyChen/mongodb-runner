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

    this.top = new models.Top()
      .on('sync', this.render, this)
      .on('error', this.render, this);

    this.graphs = [];
  },
  activate: function(){
    this.top.fetch();
    this.top.subscribe();
  },
  deactivate: function(){
    this.top.unsubscribe();
  },
  render: function(){
    if(!this.top.hasChanged('deltas')) return;

    var self = this,
      ctx = self.top.toJSON();

    if(this.top.hasChanged('namespaces')){
      this.graphs = this.top.get('namespaces').map(function(ns, i){
        return creek('#creek-' + i, {});
      });
    }

    process.nextTick(function(){
      debug('writing template');
      self.$el.html(self.tpl(ctx));
      self.graphs.map(function(graph){
        graph.render();
      });
    });
    return self;
  }
});
