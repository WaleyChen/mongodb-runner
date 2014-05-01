var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  srv = require('../service'),
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
    if(models.context.instance){
      this.render();
    }
    else {
      debug('waiting for context to get an instance');
    }
  },
  exit: function(){
    models.context.off('change', this.change, this);
    return this;
  },
  change: function(){
    debug('change', arguments);
    this.render();
  },
  render: function(){
    var self = this;
    srv().metrics(models.context.instance_id, function(err, metrics){
      self.$el.html(self.tpl({
        context: models.context.toJSON(),
        all: models.deployments.toJSON(),
        metrics: metrics
      }));
    });
  }
});

module.exports = function(opts){
  return new Home(opts);
};
