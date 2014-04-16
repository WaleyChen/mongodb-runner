var Backbone = require('backbone'),
  $ = Backbone.$,
  moment = require('moment'),
  models = require('../models'),
  debug = require('debug')('mongoscope:log');

var Log = Backbone.View.extend({
  tpl: require('./tpl/log.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.log = new models.Log()
      .on('sync', this.render, this);
  },
  enter: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.log.enter();
  },
  exit: function(){},
  update: function(){
    debug('got a log update', arguments);
    var updates = Backbone.$(this.tpl({
      moment: moment,
      lines: this.log.toJSON(),
      update: true
    })).hide();

    this.$el.append(updates);
    updates.fadeIn();
    this.el.scrollByLines(this.log.length);
  },
  render: function(){
    this.$el.html(this.tpl({
      moment: moment,
      lines: this.log.toJSON(),
      update: false
    }));
    this.el.scrollByLines(this.log.length);
    this.log.off('sync', this.render)
      .on('sync', this.update, this);
  }
});

module.exports = function(opts){
  return new Log(opts);
};
