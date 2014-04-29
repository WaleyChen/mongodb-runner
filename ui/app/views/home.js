var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mongoscope:home');

var Home = Backbone.View.extend({
  tpl: require('./tpl/home.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.databases = [];
  },
  enter: function(){
    models.context.on('change', this.change, this);

    if(!models.instance.synced()){
      models.instance.on('sync', this.render, this);
    }
    else {
      this.render();
    }
  },
  exit: function(){
    models.instance.off('sync', this.render, this)
      .off('change:_id', this.change, this);
    return this;
  },
  change: function(){},
  render: function(){
    this.$el.html(this.tpl({
      instance: models.instance.toJSON(),
      deployment: models.deployment.toJSON(),
      context: models.context.toJSON(),
      all: models.deployments.toJSON()
    }));
  }
});

module.exports = function(opts){
  return new Home(opts);
};
