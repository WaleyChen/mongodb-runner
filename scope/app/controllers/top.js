"use strict";

var Backbone = require('backbone'),
  models = require('../models'),
  debug = require('debug')('mg:scope:top'),
  creek = require('../creek'),
  moment = require('moment');

module.exports = Backbone.View.extend({
  tpl: require('../templates/top.jade'),
  initialize: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.$tbody = null;

    this.activated = false;
    this.metric = 'lock.count';

    this.top = new models.Top();

    this.direction = 'up';
  },
  activate: function(){
    this.top.on('sync', this.render, this)
    this.top.fetch();
    this.activated = true;
  },
  deactivate: function(){
    this.activated = false;
  },
  onTopData: function(){
    var ctx = this.top.toJSON(), html;
    ctx.update = true;
    ctx.moment = moment;

    html = this.tpl(ctx);


    if(this.direction === 'up'){
      this.$tbody.prepend(html);
    }
    else{
      this.$tbody.append(html);
    }
  },
  render: function(){
    if(!this.activated) return this;

    var ctx = this.top.toJSON(), html;
    ctx.update = false;
    ctx.moment = moment;

    html = this.tpl(this.top.toJSON());

    this.$el.html(html);
    this.$tbody = this.$el.find('.top-matrix-body');

    this.top
      .off('sync', this.render, this)
      .on('sync', this.onTopData, this);

    this.top.subscribe();
    return this;
  }
});
