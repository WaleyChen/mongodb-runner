var Backbone = require('backbone'),
  models = require('../models'),
  moment = require('moment');

var Metric = Backbone.Model.extend({}),
  Metrics = Backbone.Collection.extend({
    model: Metric
  });

var Top = Backbone.View.extend({
  tpl: require('./tpl/top.jade'),
  initialize: function(){
    this.$tbody = null;

    this.top = models.top;

    this.metrics = new Metrics([
      {label: '#ops', key: 'total.count', lock_key: 'lock.count'},
      {label: '#read', key: 'read.count', lock_key: 'readlock.count'},
      {label: '#write', key: 'write.count', lock_key: 'writelock.count'}
    ]);
  },
  enter: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.top
      .enter()
      .on('sync', this.render, this);
  },
  exit: function(){
    this.top.exit().off('sync', this.onTopData, this);
  },
  onTopData: function(){
    var ctx = this.top.toJSON();
    ctx.update = true;
    ctx.moment = moment;
    ctx.selected_metrics = this.metrics.toJSON();
    this.$tbody.html(this.tpl(ctx));
  },
  render: function(){
    var ctx = this.top.toJSON();
    ctx.update = false;
    ctx.moment = moment;
    ctx.selected_metrics = this.metrics.toJSON();

    this.$el.html(this.tpl(ctx));
    this.$tbody = this.$el.find('.body');

    this.top
      .off('sync', this.render, this)
      .on('sync', this.onTopData, this);

    this.top.subscribe();
    return this;
  }
});

module.exports = function(opts){
  return new Top(opts);
};
