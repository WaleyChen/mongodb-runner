var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mongoscope:databases');

module.exports = Backbone.View.extend({
  tpl: require('../templates/databases.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.databases = new models.Databases()
      .on('sync', this.render, this)
      .on('error', this.render, this);

    this.collections = new models.Collections()
      .on('sync', this.render, this)
      .on('error', this.render, this);

    this.indexes = new models.Indexes()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    this.databases.fetch();
  },
  deactivate: function(){},
  render: function(){
    var self = this;
    requestAnimationFrame(function(){
      var ctx = {
        'databases': self.databases.toJSON(),
        'collections': self.collections.toJSON(),
        'indexes': self.indexes.toJSON()
      };
      self.$el.html(self.tpl(ctx));
    });
  }
});

