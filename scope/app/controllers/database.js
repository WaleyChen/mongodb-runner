var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  creek = require('../creek'),
  donut = require('../donut'),
  debug = require('debug')('mg:scope:database');

module.exports = Backbone.View.extend({
  tpl: require('../templates/database.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.database = new models.Database().on('sync', this.render, this);
    this.top = new models.Top().on('sync', this.onTopData, this);

    this.metric = 'lock.count';
    this.graph = creek('.collection-creek', {
      interpolation: 'step-after'
    });
  },
  onTopData: function(){
      var key =  [
        this.database.get('name'),
        this.metric].join('.'),
      locks = this.top.get('deltas')[key];

    this.graph.inc(locks);
  },
  activate: function(name){
    this.database.set({name: name}, {silent: true});
    this.database.fetch();

    this.top.fetch();
    this.top.subscribe();
  },
  deactivate: function(){},
  render: function(){
    this.$el.html(this.tpl({
      'database': this.database.toJSON(),
      'host': models.instance.toJSON().host,
      'metric': this.metric
    }));
    this.graph.render();
    donut('.donut');
  }
});

