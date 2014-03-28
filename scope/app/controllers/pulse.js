"use strict";

var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  creek = require('../creek');

module.exports = Backbone.View.extend({
  tpl: require('../templates/pulse.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.instance = models.instance.on('sync', this.render, this);
    this.top = new models.Top().on('sync', this.onTopData, this);

    this.metric = 'lock.count';
    this.graph = creek('.graph', {
      interpolation: 'step-after'
    });
  },
  onTopData: function(){
    var locks = this.top.get('deltas')[this.metric];
    this.graph.inc(locks);
  },
  activate: function(){
    this.top.fetch();
    this.top.subscribe();
  },
  render: function(){
    var self = this;

    clearTimeout(this.poller);
    if(self.instance.get('database_names').length === 0){
      return self.poller = setTimeout(function(){
        self.instance.fetch();
      }, 5000);
    }

    this.$el.html(this.tpl({
      'instance': this.instance.toJSON(),
      'metric': this.metric
    }));
    this.graph.render();
  }
});

