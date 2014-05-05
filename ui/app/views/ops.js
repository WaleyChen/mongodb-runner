var Backbone = require('backbone'),
  models = require('../models'),
  debug = require('debug')('mongoscope:ops');

var Ops = Backbone.View.extend({
  tpl: require('./tpl/ops.jade'),
  initialize: function(){},
  enter: function(){
    this.$el = Backbone.$('.ops');
    this.el = this.$el.get(0);

    models.ops.fetch({success: this.insert.bind(this)});
  },
  exit: function(){
    models.ops.exit().off('sync', this.update, this);
  },
  update: function(){
    this.$el = Backbone.$('.ops');
    debug('rendering', models.ops.toJSON());
    this.$el.html(this.tpl({ops: models.ops.toJSON()}));
  },
  insert: function(){
    this.update();
    models.ops.off('sync', this.insert, this)
      .on('sync', this.update, this);

    models.ops.subscribe();
    return this;
  }
});

module.exports = function(opts){
  return new Ops(opts);
};
