var Backbone = require('backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mongoscope:log');

module.exports = Backbone.View.extend({
  tpl: require('../templates/log.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.log = new models.Log()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    this.log.fetch();
    this.log.subscribe();
  },
  deactivate: function(){
    this.log.unsubscribe();
  },
  render: function(){
    var lineTpl = require('../templates/log-line.jade');

    this.$el.html(this.tpl({
      lines: this.log.models.map(function(model, i){
        return lineTpl(model.toJSON());
      })
    }));
    return this;
  }
});
