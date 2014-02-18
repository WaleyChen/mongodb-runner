var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  moment = require('moment'),
  debug = require('debug')('mongoscope:info');

module.exports = Backbone.View.extend({
  tpl: require('../templates/info.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.build = new models.BuildInfo();
    this.host = new models.HostInfo();

    this.build.on('sync', this.render, this)
      .on('error', this.render, this);

    this.host.on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    this.host.fetch();
    this.build.fetch();
  },
  deactivate: function(){},
  render: function(){
    var self = this;
    requestAnimationFrame(function(){
      var ctx = {
        'build': self.build.toJSON(),
        'host': self.host.toJSON()
      };
      ctx.host.system_time = moment(ctx.host.system_time).format('MMM Do YYYY, h:mm:ss a');
      self.$el.html(self.tpl(ctx));
    });
  }
});
