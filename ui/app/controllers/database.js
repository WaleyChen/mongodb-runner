var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  d3 = require('d3'),
  creek = require('../lib/viz/creek'),
  donut = require('../lib/viz/donut'),
  models = require('../models'),
  debug = require('debug')('mg:scope:database');

var Database = Backbone.View.extend({
  tpl: require('../templates/database.jade'),
  initialize: function(){
    this.summary = new Summary();
    this.database = this.summary.database.on('sync', this.render, this);
  },
  activate: function(name){
    debug('activate', name);
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.summary.activate(name);
    // this.render();
  },
  deactivate: function(){
    debug('deactivate');
    this.summary.deactivate();
    debug('deactivate complete');
    return this;
  },
  render: function(){
    debug('render database');
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.$el.html(this.tpl({
      'database': this.database.toJSON(),
      'host': models.instance.toJSON().host,
    })).find('.summary').html(this.summary.render().el);
    this.summary.draw();
  }
});

var Summary = Backbone.View.extend({
  events: {
    'click .graph': 'graphClicked'
  },
  tagName: 'div',
  className: 'row',
  tpl: require('../templates/pulse/database.jade'),
  initialize: function(opts){
    this.database = new models.Database(opts)
      .on('sync', this.update, this);

    this.top = models.top;
    this.metric = 'lock.count';
    this.$metric = null;

    this.graph = creek('#graph-' +  this.database.cid);
  },
  graphClicked: function(){
    if(!this.random){
      this.random = d3.random.normal(10, 2);
    }
    var val = ~~this.random(),
      metricEl = this.$metric;

    debug('pumping ' + val);
    this.graph.inc(val);
    if(metricEl){
      setTimeout(function(){
        metricEl.text(val);
      }, 400);

    }
  },
  onTopData: function(){
    if(!this.top.get('deltas')) return this;
    var k = this.database.get('name') + '.' + this.metric,
      delta = this.top.get('deltas')[k];

    this.graph.inc(delta);
    if(this.$metric){
      this.$metric.text(this.graph.value);
    }
  },
  activate: function(name){
    if(name){
      this.database.set({name: name});
    }

    this.top
      .activate()
      .on('sync', this.onTopData, this);

    this.database.fetch();
    return this;
  },
  update: function(){
    var provider = this.database.get('stats');

    this.$el.find('.stats .stat-value').each(function(){
      var el = $(this),
        label = el.siblings('.stat-label'),
        text = label.text(),
        val = provider[el.data('stat')];
      el.html(val);

      if(val === 1){
        text = text.substring(0, text.length - 1);
        if(text.charAt(text.length - 1) === 'e'){
          text = text.substring(0, text.length - 1);
        }
        label.text(text);
      }
    });

    donut('.donut', [
      {
        name: 'Documents',
        size: this.database.get('stats').document_size,
        count: this.database.get('stats').document_count,
        className: 'documents'
      },
      {
        name: 'Indexes',
        size: this.database.get('stats').index_size,
        count: this.database.get('stats').index_count,
        className: 'indexes'
      }
    ], {
      title: ''
    });
  },
  deactivate: function(){
    this.top
      // .deactivate()
      .off('sync', this.onTopData, this);
    // this.graph.pause();
    return this;
  },
  draw: function(){
    this.graph.draw();
    this.$metric = this.$el.find('.metric-value');
  },
  render: function(){
    this.$el.html(this.tpl({
      database: this.database.toJSON(),
      metric: this.metric,
      cid: this.database.cid
    }));
    if(this.database.get('stats')){
      donut('.donut', [
        {
          name: 'Documents',
          size: this.database.get('stats').document_size,
          count: this.database.get('stats').document_count,
          className: 'documents'
        },
        {
          name: 'Indexes',
          size: this.database.get('stats').index_size,
          count: this.database.get('stats').index_count,
          className: 'indexes'
        }
      ], {
        title: 'storage'
      });
    }
    return this;
  }
});

var Create = Backbone.View.extend({
  tpl: require('../templates/pulse/create-collection.jade'),
  activate: function(database_name){
    this.database_name = database_name;
    this.render();
  },
  deactivate: function(){},
  render: function(){
    debug('rendering create collection');
    this.$el = $('#mongoscope');
    this.$el.html(this.tpl({
      'database_name': this.database_name
    }));
  }
});

module.exports = function(){
  return new Database();
};

module.exports.createCollection = function(){
  return new Create();
};

module.exports.Summary = Summary;
module.exports.summary = function(opts){
  return new Summary(opts);
};
