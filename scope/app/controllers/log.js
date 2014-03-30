var Backbone = require('backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  moment = require('moment'),
  debug = require('debug')('mongoscope:log');

module.exports = Backbone.View.extend({
  tpl: require('../templates/log.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.log = new models.Log().on('sync', this.render, this);
  },
  activate: function(){
    this.log.fetch();
  },
  deactivate: function(){},
  render: function(){
    debug('now', moment().format('h:mm:ss'))
    this.$el.html(this.tpl({moment: moment,
      lines: this.log.toJSON()}));
  }
});
