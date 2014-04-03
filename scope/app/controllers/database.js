var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  creek = require('../creek'),
  donut = require('../donut'),
  d3 = require('d3'),
  debug = require('debug')('mg:scope:database');

module.exports = Backbone.View.extend({
  tpl: require('../templates/database.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.summary = new Summary();
    this.database = this.summary.database;
  },
  activate: function(name){
    debug('activate', name);
    this.summary.activate(name);
    this.render();
  },
  deactivate: function(){
    this.summary.deactivate();
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

var Summary = module.exports.Summary = Backbone.View.extend({
  events: {
    'click .graph': 'graphClicked'
  },
  tpl: require('../templates/pulse/database.jade'),
  initialize: function(opts){
    this.database = new models.Database(opts)
      .on('sync', this.update, this);

    this.top = models.top;
    this.metric = 'lock.count';
    this.$metric = null;

    this.graph = creek('#graph-' +  this.database.cid, {interpolation: 'step-before'});
  },
  graphClicked: function(){
    if(!this.random){
      this.random = d3.random.normal(10, 2);
    }
    var val = ~~this.random();
    debug('pumping ' + val);
    this.graph.inc(val);
    if(this.$metric){
      this.$metric.text(val);
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
    debug('update summary');
    var provider = this.database.get('stats');

    this.$el.find('.stats .stat-value').each(function(){
      var el = $(this),
        label = el.siblings('.stat-label'),
        text = label.text(),
        val = provider[el.data('stat')];

      debug('updating stat', el.data('stat'), val, el);
      el.html(val);

      if(val === 1){
        text = text.substring(0, text.length - 1);
        if(text.charAt(text.length - 1) === 'e'){
          text = text.substring(0, text.length - 1);
        }
        label.text(text);
      }
    });

    if(this.$el.find('.donut')){
      debug('drawing donut');
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
    }
  },
  deactivate: function(){
    this.top
      .deactivate()
      .off('sync', this.onTopData, this);
    this.graph.pause();
    return this;
  },
  draw: function(){
    this.graph.draw();
    this.$metric = this.$el.find('.metric-value');
  },
  render: function(){
    debug('render summary');
    this.$el.html(this.tpl({
      database: this.database.toJSON(),
      metric: this.metric,
      cid: this.database.cid
    }));
    return this;
  }
});
