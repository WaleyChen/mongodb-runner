var Backbone = require('backbone'),
  $ = Backbone.$,
  moment = require('moment'),
  models = require('../models'),
  debug = require('debug')('mongoscope:log');

var Log = Backbone.View.extend({
  tpl: require('./tpl/log.jade'),
  initialize: function(){
    this.log = new models.Log()
      .on('sync', this.update, this);
  },
  enter: function(){
    this.$el = $('.log-container');
    this.el = this.$el.get(0);
    this.log.fetch();
    this.render();
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
  }
});

module.exports = function(opts){
  return new Log(opts);
};
