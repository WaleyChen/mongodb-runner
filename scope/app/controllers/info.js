var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  moment = require('moment'),
  debug = require('debug')('mongoscope:info');

module.exports = Backbone.View.extend({
  tpl: require('../templates/info.jade'),
  initialize: function(){
    this.activated = false;
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.instance = models.instance.on('sync', this.render, this);
  },
  activate: function(){
    this.activated = true;
    this.instance.fetch();
  },
  deactivate: function(){
    this.activated = false;
  },
  render: function(){
    if(!this.activated) return this;
    var ctx = this.instance.toJSON();
    ctx.host.system_time = moment(ctx.host.system_time)
      .format('MMM Do YYYY, h:mm:ss a');

    this.$el.html(this.tpl(ctx));
    return this;
  }
});
