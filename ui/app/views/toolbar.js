var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mongoscope:toolbar');

var Toolbar = Backbone.View.extend({
  tpl: require('./tpl/toolbar.jade'),
  initialize: function(){
    this.$el = $('#toolbar');
    this.el = this.$el.get(0);

    models.deployments.on('sync', this.create, this);
    models.instance.on('change', this.update, this);
  },
  create: function(){

    debug('deployments sync!');

    var deps = models.deployments.toJSON();
    this.$el.html(this.tpl({
      deployments: deps,
      instance: models.instance.toJSON(),
      sections: [
        {name: 'pulse', 'icon': 'flash'},
        {name: 'top', icon: 'magnet'},
        {name: 'log', icon: 'align-justify'},
        {name: 'security', icon: 'record'},
        {name: 'replication', icon: 'send'},
        {name: 'sharding', icon: 'th'}
      ]
    }));
  },
  update: function(){
    debug('instance sync');
    var deps = models.deployments.toJSON();
    this.$el.html(this.tpl({
      deployments: deps,
      instance: models.instance.toJSON(),
      sections: [
        {name: 'pulse', 'icon': 'flash'},
        {name: 'top', icon: 'magnet'},
        {name: 'log', icon: 'align-justify'},
        {name: 'security', icon: 'record'},
        {name: 'replication', icon: 'send'},
        {name: 'sharding', icon: 'th'}
      ]
    }));
  }
});

module.exports = function(opts){
  return new Toolbar(opts);
};
