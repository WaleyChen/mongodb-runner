var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mongoscope:toolbar');

var Toolbar = Backbone.View.extend({
  tpl: require('./tpl/toolbar.jade'),
  initialize: function(){
    this.$el = $('#toolbar');
    this.el = this.$el.get(0);

    models.context.on('change', this.change, this);
  },
  draw: function(){
    this.$el.html(this.tpl({
      all: models.deployments.toJSON(),
      context: models.context.toJSON(),
      sections: [
        {name: 'home', icon: 'home'},
        {name: 'top', icon: 'magnet'},
        {name: 'log', icon: 'align-justify'}
      ]
    }));
    return this;
  },
  change: function(){
    debug('context changed');
    return this.draw();
  }
});

module.exports = function(opts){
  return new Toolbar(opts);
};
