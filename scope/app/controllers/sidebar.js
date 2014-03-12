var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mg:scope:pulse');

module.exports = Backbone.View.extend({
  tpl: require('../templates/sidebar.jade'),
  initialize: function(){
    this.$el = $('#sidebar');
    this.el = this.$el.get(0);

    this.instance = models.instance
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  render: function(){
    var self = this;
    self.$el.html(self.tpl({}));
    if(self.instance.get('database_names').length === 0){
      self.$el.find('.log').hide();
      self.$el.find('.top').hide();
    }
  }
});
