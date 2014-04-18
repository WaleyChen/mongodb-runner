var Backbone = require('backbone'),
  debug = require('debug')('mongoscope:sharding');

var sharding = Backbone.View.extend({
  tpl: require('./tpl/sharding.jade'),
  initialize: function(){
    this.model = require('../models').sharding().on('sync', this.render, this);
  },
  enter: function(){
    debug('enter');
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.model.fetch();
  },
  exit: function(){

  },
  render: function(){
    debug('rendering');
    this.$el.html(this.tpl({sharding: this.model.toJSON()}));
  }
});

module.exports = function(opts){
  return new sharding(opts);
};
