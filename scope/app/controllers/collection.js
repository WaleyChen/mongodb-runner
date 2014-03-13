var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  d3 = require('d3'),
  models = require('../models'),
  creek = require('../creek'),
  debug = require('debug')('mg:scope:collection');

module.exports = Backbone.View.extend({
  tpl: require('../templates/collection.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.metric = 'lock.count';

    this.collection = new models.Collection()
      .on('sync', this.render, this);

    this.top = new models.Top()
      .on('sync', this.onTopData, this);

    this.graph = creek('.collection-creek', {
      interpolation: 'step-after'
    });
  },
  activate: function(database, name){
    this.collection.set({database: database, name: name}, {silent: true});
    this.collection.fetch();

    this.top.fetch();
    this.top.subscribe();
  },
  onTopData: function(){
    var key =  [
        this.collection.get('database'),
        this.collection.get('name'), this.metric].join('.'),
      locks = this.top.get('deltas')[key];

    this.graph.inc(locks);
  },
  deactivate: function(){
    this.top.unsubscribe();
  },
  render: function(){
    this.$el.html(this.tpl({'collection': this.collection.toJSON()}));
    this.graph.render();
  }
});


var SampleView = Backbone.View.extend({
  tpl: require('../templates/collection-sample.jade'),
  initialize: function(opts){
    this.$el = $('.samples');
    this.el = this.$el.get(0);

    this.model = new models.Sample(opts)
      .on('sync', this.render, this)
      .on('error', this.render, this);
    this.model.fetch();
  },
  render: function(){
    this.$el = $('.samples');
    this.el = this.$el.get(0);
    this.$el.html(this.tpl({
      'samples': this.model.toJSON()
    }));
  }
});
