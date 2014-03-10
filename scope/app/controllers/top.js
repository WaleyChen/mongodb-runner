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

    this.layout = true;

    this.top = new models.Top()
      .on('sync', this.render, this)
      .on('error', this.render, this);

    this.graphs = {};
  },
  activate: function(){
    this.top.fetch();
    this.top.subscribe();
    console.warn('activate top');
  },
  deactivate: function(){
    console.warn('deactivate top');
    this.top.unsubscribe();
    this.layout = true;
  },
  render: function(){
    if(!this.top.hasChanged('deltas')) return;

    var self = this,
      ctx = self.top.toJSON();

    if(this.layout === true){
      this.layout = false;

      this.top.get('namespaces').map(function(ns, i){
        var item = creek('#creek-' + i, {interpolation: 'step-after'});
        self.graphs[ns] = item;
        return item;
      });

      self.$el.html(self.tpl(ctx));
      this.top.get('namespaces').map(function(ns){
        self.graphs[ns].render();
      });
    }

    this.top.get('namespaces').map(function(ns){
      self.graphs[ns].inc(self.top.get('deltas')[ns + '.total.count']);
    });
    return self;
  }
});
