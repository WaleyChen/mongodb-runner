// @todo: redo all of this...
var Backbone = require('backbone'),
  moment = require('moment'),
  debug = require('debug')('mongoscope:replication');

var Replication = Backbone.View.extend({
  tpl: require('./tpl/replication.jade'),
  initialize: function(){
    this.replication = require('../models').replication();
  },
  enter: function(){
    debug('enter');
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.replication.once('sync', this.insert, this);
    this.replication.fetch();
  },
  exit: function(){

  },
  insert: function(){
    this.$el.html(this.tpl({moment: moment,
      replication: this.replication.toJSON()}));
  }
});

module.exports = function(opts){
  return new Replication(opts);
};
