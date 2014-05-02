var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mg:scope:collection');

var Collection = Backbone.View.extend({
  tpl: require('./tpl/collection/index.jade'),
  initialize: function(){
    this.metric = 'lock.count';

    this.collection = new models.Collection()
      .on('sync', this.render, this);

    this.top = new models.Top()
      .on('sync', this.onTopData, this);

    this.explorer = new ExplorerView({
      collection: this.collection
    });
  },
  enter: function(database, name){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    debug('enter', database, name);
    this.collection.set({database: database, name: name});
    this.collection.fetch();
  },
  enterExplorer: function(database, name, skip){
    if(database === 'exit'){
      return this.exit;
    }
    debug('explore', database, name, skip);
    this.explorer.skip = skip;
    this.collection.set({database: database, name: name});
    this.collection.fetch();
  },
  onTopData: function(){
    var key =  [
        this.collection.get('database'),
        this.collection.get('name'), this.metric
      ].join('.'),
      val = this.top.get('deltas')[key];
    debug(this.metric, val);
    this.graph.inc(val);
  },
  exit: function(){
    this.$el.removeClass('exploring');
    this.top.unsubscribe();
  },
  render: function(){
    debug('collection render');

    this.$el.html(this.tpl({
      'metric': this.metric,
      'collection': this.collection.toJSON(),
      context: models.context.toJSON()
    }));
    this.explorer.render();
  }
});


var ExplorerView = Backbone.View.extend({
  tpl: require('./tpl/collection/explorer.jade'),
  events: {
    'click .next:not(.disabled) a': 'next',
    'click .previous:not(.disabled) a': 'prev',
    'click .activate': 'enter',
    'dblclick tr': 'details'
  },
  initialize: function(opts){
    this.active = false;
    this.samples = new models.Sample({
      collection: opts.collection
    }).on('sync', this.render, this);
  },
  details: function(evt){
    var index = evt.currentTarget.dataset.index;
    return new DocumentView({
      sample: this.samples.at(index)
    }).enter();

  },
  enter: function(){
    this.active = true;
    this.samples.fetch();
  },
  prev: function(){
    debug('prev sample');
    this.samples.prev();
  },
  next: function(){
    debug('next sample');
    this.samples.next();
  },
  render: function(){
    this.$el = $('.explorer');
    this.el = this.$el.get(0);
    this.$el.html(this.tpl({
      limit: this.samples.limit,
      skip: this.samples.skip,
      schema: this.samples.schema,
      samples: this.samples.toJSON(),
      active: this.active
    }));

    if(this.active){
      Backbone.$('#mongoscope').addClass('exploring');
      if(!this.samples.hasMore){
        this.$el.find('.next').addClass('disabled');
      }
      if(!this.samples.hasPrev){
        this.$el.find('.previous').addClass('disabled');
      }
    }
    this.delegateEvents(this.events);
    debug('delegate explorer events');
    return this;
  }
});


var DocumentView = Backbone.View.extend({
  tpl: require('./tpl/document.jade'),
  initialize: function(opts){
    this.sample = opts.sample;
  },
  enter: function(){
    this.render();
  },
  render: function(){
    this.$el = $('.detail');
    this.el = this.$el.get(0);

    debug('sample', this.sample.toJSON());
    this.$el.html(this.tpl({sample: this.sample.toJSON()}));

    return this;
  }
});

module.exports = function(opts){
  return new Collection(opts);
};
