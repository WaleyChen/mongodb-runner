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
    models.instance.on('sync', this.update, this);
  },
  create: function(){
    var deps = models.deployments.toJSON();

    debug('deployments', deps);
    debug('instance', models.instance.toJSON());

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
    this.create();
  }
});

module.exports = function(opts){
  return new Toolbar(opts);
};
