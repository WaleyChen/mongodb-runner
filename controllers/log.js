var Backbone = require('backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mongoscope:log');

module.exports = Backbone.View.extend({
  tpl: require('../templates/log.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.log = new models.Log()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  show: function(){
    this.log.fetch();
  },
  render: function(){
    var self = this;
    // @todo: Use webworker for log processing instead of animation frame?
    requestAnimationFrame(function(){
      var ctx = {'lines': []},
        lineTpl = require('../templates/log-line.jade'),
        startTime = self.log.models[0].get('date');
      debug(startTime);

      ctx.numByName = _.countBy(self.log.models, function(log){
        return log.get('name');
      });

      debug('count by name', ctx.numByName);

      self.log.models.map(function(model, i){
        ctx.lines.push(lineTpl(model.toJSON()));
      });
      self.$el.html(self.tpl(ctx));
    });
  }
});
