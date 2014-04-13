var Backbone = require('backbone'),
  $ = Backbone.$,
  moment = require('moment'),
    models = require('../models');

var Log = Backbone.View.extend({
  tpl: require('./tpl/log.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.log = new models.Log().on('sync', this.render, this);
  },
  enter: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.log.fetch();
  },
  exit: function(){},
  render: function(){
    this.$el.html(this.tpl({moment: moment,
      lines: this.log.toJSON()}));
  }
});

module.exports = function(opts){
  return new Log(opts);
};
