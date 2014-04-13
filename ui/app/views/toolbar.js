var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mg:scope:toolbar');

var Toolbar = Backbone.View.extend({
  tpl: require('./tpl/toolbar.jade'),
  initialize: function(){
    this.$el = $('#toolbar');
    this.el = this.$el.get(0);

    this.instance = models.instance.on('sync', this.render, this);
  },
  render: function(){
    debug('rendering', this.instance.toJSON());
    this.$el.html(this.tpl({
      instance: this.instance.toJSON(),
      sections: [
        {name: 'pulse', 'icon': 'flash'},
        {name: 'top', icon: 'magnet'},
        {name: 'log', icon: 'align-justify'},
        {name: 'security', icon: 'record'},
        {name: 'replication', icon: 'send'}
      ]
    }));

    if(this.instance.get('database_names').length === 0){
      this.$el.find('.log').hide();
      this.$el.find('.top').hide();
    }
  }
});

module.exports = function(opts){
  return new Toolbar(opts);
};
