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

    this.collection = new models.Collection()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(database, name){
    var opts = {database: database, name: name};
    this.collection.set(opts, {silent: true});
    this.collection.fetch();
    this.sample = this.sample || new SampleView(opts);
  },
  deactivate: function(){},
  render: function(){
    var self = this;
    self.$el.html(self.tpl({
      'collection': self.collection.toJSON()
    }));
    var rand = d3.random.logNormal(2, 0.5);
    var data = d3.range(400).map(function(){
      return rand() * 2;
    });
    creek('.collection-creek', {interpolation: 'step-after', data: data}).render();
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
