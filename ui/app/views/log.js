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
    this.orientation = 'natural';
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

    if(this.orientation === 'natural'){
      this.$el.prepend(updates);
    }
    else {
      this.$el.append(updates);
    }

    updates.fadeIn();
    if(!this.el.scrollByLines){
      return this;
    }
    this.el.scrollByLines(this.log.length);
  },
  render: function(){
    var lines = this.log.toJSON();
    if(this.orientation === 'natural'){
      lines.reverse();
    }

    this.$el.html(this.tpl({
      moment: moment,
      lines: lines,
      orientation: this.orientation,
      update: false
    }));
    if(!this.el.scrollByLines){
      return this;
    }
    this.el.scrollByLines(this.log.length);
  }
});

module.exports = function(opts){
  return new Log(opts);
};
