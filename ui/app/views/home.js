var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mongoscope:home'),
  log = require('./log'),
  replication = require('./replication');

var Home = Backbone.View.extend({
  tpl: require('./tpl/home.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.log = log();
    this.replication = replication();
    this.instances = replication.instances();
  },
  enter: function(){
    models.context.on('change', this.change, this);
    if(models.context.instance){
      this.render();
      this.log.enter();
    }
    else {
      debug('waiting for context to get an instance');
    }
  },
  exit: function(){
    models.context.off('change', this.change, this);
    this.log.exit();

    this.replication.exit();
    this.instances.exit();

    return this;
  },
  change: function(){
    debug('change', arguments);
    this.render();
  },
  render: function(){
    var self = this;
    self.$el.html(self.tpl({
      context: models.context.toJSON(),
      all: models.deployments.toJSON()
    }));

    if(models.context.deployment.getType() !== 'standalone'){
      this.replication.enter();
      this.instances.enter();
    }
  }
});

module.exports = function(opts){
  return new Home(opts);
};
