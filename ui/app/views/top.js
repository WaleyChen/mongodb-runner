var Backbone = require('backbone'),
  models = require('../models'),
  matrix = require('../viz/matrix'),
  sparkline = require('../viz/sparkline');

var Metric = Backbone.Model.extend({}),
  Metrics = Backbone.Collection.extend({
    model: Metric
  });

var Top = Backbone.View.extend({
  tpl: require('./tpl/top.jade'),
  initialize: function(){
    this.metrics = new Metrics([
      {label: '#ops', key: 'total.count', lock_key: 'lock.count'},
      {label: '#commands', key: 'commands.count'},
      {label: '#read', key: 'read.count', lock_key: 'readlock.count'},
      {label: '#write', key: 'write.count', lock_key: 'writelock.count'}
    ]);

    this.sparks = {};
    this.features = {sparkline: true};
  },
  enter: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);

    this.$el.html(this.tpl({
      context: models.context
    }));

    models.top.fetch({success: this.insert.bind(this)});
  },
  exit: function(){
    models.top.exit().off('sync', this.update, this);
  },
  update: function(){
    var self = this;

    this.matrix.update(models.top.get('deltas'));

    if(!this.features.sparkline) return this;

    this.$el.find('.metric-value').each(function(){
      var el = Backbone.$(this),
        k = el.data('ns') + '.' + el.data('metric');

      if(!self.sparks[k]){
        var off = el.offset();
        var spark = Backbone.$('<div class="sparkline" style="position: absolute; top: ' + (off.top - 35) + 'px;left: ' + (off.left + 50) + 'px; "id="sparkline-'+k+'"/>');
        self.$el.append(spark);

        self.sparks[k] = sparkline([{
          date: Date.now(),
          value: models.top.get('deltas')[k] || 0
        }], {el: spark.get(0)});
      }
      else {
        self.sparks[k].add({
          date: Date.now(),
          value: models.top.get('deltas')[k] || 0
        });
      }
    });
  },
  insert: function(){
    this.$el.find('p').remove();

    this.matrix = matrix(this.metrics.toJSON(),
      models.top.get('namespaces'), models.top.get('deltas'));

    models.top.off('sync', this.insert, this)
      .on('sync', this.update, this);

    models.top.subscribe();
    return this;
  }
});

module.exports = function(opts){
  return new Top(opts);
};
