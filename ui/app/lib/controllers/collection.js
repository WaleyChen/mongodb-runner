var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mg:scope:collection');

module.exports = Backbone.View.extend({
  tpl: require('../templates/collection.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    // this.metric = 'write.count';
    this.metric = 'lock.count';

    this.collection = new models.Collection()
      .on('sync', this.render, this);

    this.top = new models.Top()
      .on('sync', this.onTopData, this);

    this.explorer = new ExplorerView({
      collection: this.collection
    });

    this.explorer.samples.on('sync',
      this.explorerChanged, this);
  },
  explorerChanged: function(){
    // if(!this.explorer.activated) return false;
    var uri = ['collection',
      this.collection.get('database'),
      this.collection.get('name'), 'explore',
      this.explorer.samples.skip].join('/');

    // Backbone.history.navigate(uri);
  },
  activate: function(database, name){
    debug('activate', database, name);
    this.collection.set({database: database, name: name});
    this.collection.fetch();
  },
  activateExplorer: function(database, name, skip){
    if(database === 'deactivate'){
      return this.deactivate;
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
  deactivate: function(){
    this.$el.removeClass('exploring');
    this.top.unsubscribe();
  },
  render: function(){
    debug('collection render');

    this.$el.html(this.tpl({
      'metric': this.metric,
      'collection': this.collection.toJSON()
    }));
    this.explorer.render();
  }
});


var ExplorerView = Backbone.View.extend({
  tpl: require('../templates/explorer.jade'),
  events: {
    'click .next:not(.disabled) a': 'next',
    'click .previous:not(.disabled) a': 'prev',
    'click .activate': 'activate'
  },
  initialize: function(opts){
    this.active = false;
    this.samples = new models.Sample({
      collection: opts.collection
    }).on('sync', this.render, this);
  },
  activate: function(){
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
    return this;
  }
});
