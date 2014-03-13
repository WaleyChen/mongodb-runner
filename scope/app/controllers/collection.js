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

    this.explorer = new ExplorerView({collection: this.collection});
  },
  activate: function(database, name){
    this.collection.set({database: database, name: name});
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


var ExplorerView = Backbone.View.extend({
  tpl: require('../templates/collection-sample.jade'),
  events: {
    'click .next': 'next',
    'click .prev': 'prev'
  },
  initialize: function(opts){
    this.$el = $('.explorer');
    this.el = this.$el.get(0);

    this.samples = new models.Sample({
      limit: this.limit,
      skip: this.skip,
      collection: this.opts.collection
    }).on('sync', this.render, this);
  },
  prev: function(){
    this.samples.prev();
  },
  next: function(){
    this.samples.next();
  },
  render: function(){
    this.$el.html(this.tpl({
      limit: this.samples.limit,
      skip: this.samples.skip,
      schema: this.samples.schema,
      samples: this.samples.toJSON()
    }));
  }
});
