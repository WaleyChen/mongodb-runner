var Backbone = require('backbone'),
  models = require('../models'),
  moment = require('moment');

module.exports = Backbone.View.extend({
  tpl: require('../templates/top.jade'),
  initialize: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.$tbody = null;

    this.top = models.top;

    this.direction = 'up';
  },
  activate: function(){
    this.top
      .activate()
      .on('sync', this.render, this);
  },
  deactivate: function(){
    this.top
      .deactivate()
      .off('sync', this.onTopData, this);
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
    var ctx = this.top.toJSON(), html;
    ctx.update = false;
    ctx.moment = moment;

    html = this.tpl(this.top.toJSON());

    this.$el.html(html);
    this.$tbody = this.$el.find('.body');

    this.top
      .off('sync', this.render, this)
      .on('sync', this.onTopData, this);

    this.top.subscribe();
    return this;
  }
});
