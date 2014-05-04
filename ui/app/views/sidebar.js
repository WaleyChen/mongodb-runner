var Backbone = require('backbone'),
  models = require('../models'),
  debug = require('debug')('mongoscope:sidebar');

var Toolbar = Backbone.View.extend({
  tpl: require('./tpl/sidebar.jade'),
  el: '#sidebar',
  events: {
    'click a': 'click'
  },
  initialize: function(){
    models.context.on('change', this.change, this);
  },
  draw: function(){
    this.$el.html(this.tpl({
      all: models.deployments.toJSON(),
      context: models.context.toJSON(),
    }));
    return this;
  },
  change: function(){
    return this.draw();
  }
});

module.exports = function(opts){
  return new Toolbar(opts);
};
