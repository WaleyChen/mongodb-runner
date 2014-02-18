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
  activate: function(){
    this.log.fetch();
  },
  deactivate: function(){},
  render: function(){
    var self = this;
    // @todo: Use webworker for log processing instead of animation frame?
    requestAnimationFrame(function(){
      var ctx = {'lines': []},
        lineTpl = require('../templates/log-line.jade'),
        startTime = self.log.models[0].get('date');
      debug(startTime);

      ctx.countByName = _.countBy(self.log.models, function(log){
        return log.get('name');
      });

      var filterBtns = [];
      for(var name in ctx.countByName){
        filterBtns.push(new FilterButton({
          model: new Backbone.Model({
              name: name, count: ctx.countByName[name]})
          }).render().el
        );
      }
      debug('filter btns', filterBtns);
      debug('count by name', ctx.numByName);

      self.log.models.map(function(model, i){
        ctx.lines.push(lineTpl(model.toJSON()));
      });
      self.$el.html(self.tpl(ctx));
      $('.filter-bar .btn-group').append(filterBtns);
      return self;
    });
  }
});

var FilterButton = Backbone.View.extend({
  className: 'btn btn-default',
  tagName: 'a',
  initialize: function(opts){
    this.model = opts.model;
    this.model.on('change', this.render, this);
  },
  render: function(){
    this.$el.text(this.model.get('name') + ' ('+this.model.get('count') +')');
    return this;
  }
});
