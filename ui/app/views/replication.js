var Backbone = require('backbone'),
  $ = Backbone.$,
  moment = require('moment'),
  models = require('../models'),
  debug = require('debug')('mongoscope:replication');

var Replication = Backbone.View.extend({
  tpl: require('./tpl/replication/index.jade'),
  initialize: function(){
    this.replication = models.replication()
      .on('sync', this.render, this);
  },
  enter: function(){
    this.$el = $('.replication');
    this.el = this.$el.get(0);
    this.replication.fetch();
  },
  exit: function(){},
  render: function(){
    var rs = this.replication.toJSON();
    debug('render', this.replication.toJSON());
    this.$el.html(this.tpl({
      moment: moment,
      replication: rs,
      context: models.context.toJSON()
    }));
  }
});

var Oplog = Backbone.View.extend({
  tpl: require('./tpl/replication/oplog.jade'),
  initialize: function(){
    this.oplog = models.oplog()
      .on('sync', this.update, this);
  },
  enter: function(){
    this.$el = $('.oplog');
    this.el = this.$el.get(0);
    this.oplog.fetch();
  },
  exit: function(){},
  render: function(){
    this.$el.html(this.tpl({
      moment: moment,
      oplog: this.oplog.toJSON()
    }));
  }
});

var Instances = Replication.extend({
  tpl: require('./tpl/replication/instances.jade'),
  enter: function(){
    this.$el = $('.instances');
    this.el = this.$el.get(0);
    this.replication.fetch();
  }
});

module.exports = function(opts){
  return new Replication(opts);
};

module.exports.instances = function(opts){
  return new Instances(opts);
};

module.exports.oplog = function(opts){
  return new Oplog(opts);
};
