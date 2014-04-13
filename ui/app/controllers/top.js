var Backbone = require('backbone'),
  models = require('../models'),
  moment = require('moment');

var Top = Backbone.View.extend({
  tpl: require('../templates/top.jade'),
  initialize: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.$tbody = null;

    this.top = models.top;

    this.direction = 'up';
  },
  enter: function(){
    this.top
      .enter()
      .on('sync', this.render, this);
  },
  exit: function(){
    this.top
      .exit()
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

module.exports = function(opts){
  return new Top(opts);
};
