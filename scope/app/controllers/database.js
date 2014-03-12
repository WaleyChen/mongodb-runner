var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mg:scope:database');

module.exports = Backbone.View.extend({
  tpl: require('../templates/database.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.database = new models.Database()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(name){
    this.database.set({name: name}, {silent: true});
    this.database.fetch();
  },
  deactivate: function(){},
  render: function(){
    this.$el.html(this.tpl({
      'database': this.database.toJSON(),
      'host': models.instance.toJSON().host
    }));
  }
});

