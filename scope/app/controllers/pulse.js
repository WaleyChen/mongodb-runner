"use strict";

var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  creek = require('../creek'),
  debug = require('debug')('mg:scope:pulse');

module.exports = Backbone.View.extend({
  tpl: require('../templates/pulse.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.instance = models.instance
      .on('sync', this.render, this)
      .on('error', this.render, this);

    this.top = new models.Top().on('sync', this.onTopData, this);

    this.metric = 'lock.count';
    this.graph = creek('.graph', {
      interpolation: 'step-after'
    });
  },
  onTopData: function(){
    if(!this.top.get('deltas')) return this;
    var locks = this.top.get('deltas')[this.metric];
    debug('top: ' + this.metric, this.top.get('deltas'));
    this.graph.inc(locks);
  },
  activate: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    debug('activated');

    // this.top.subscribe();
    this.instance.fetch();
  },
  deactivate: function(){
    // this.top.unsubscribe();
  },
  render: function(){
    var self = this;

    clearTimeout(this.poller);
    if(self.instance.get('database_names').length === 0){
        this.$el.html(this.tpl({
          'instance': this.instance.toJSON(),
          'metric': this.metric
        }));
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

