// @todo: redo all of this...
var Backbone = require('backbone'),
  debug = require('debug')('mongoscope:replication');

var Replication = Backbone.View.extend({
  tpl: require('./tpl/replication.jade'),
  initialize: function(){
    this.instance = require('../models').instance;
  },
  enter: function(){
    debug('enter');
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.render();
  },
  exit: function(){

  },
  render: function(){
    debug('rendering');
    this.$el.html(this.tpl({instance: this.instance.toJSON()}));
  }
});

module.exports = function(opts){
  return new Replication(opts);
};
