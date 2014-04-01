var Backbone = require('Backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  creek = require('../creek'),
  donut = require('../donut'),
  debug = require('debug')('mg:scope:database');

module.exports = Backbone.View.extend({
  tpl: require('../templates/database.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.database = new models.Database().on('sync', this.render, this);
    this.top = new models.Top().on('sync', this.onTopData, this);

    this.metric = 'lock.count';
    this.graph = creek('.graph', {
      interpolation: 'step-after'
    });
  },
  onTopData: function(){
      var key =  [
        this.database.get('name'),
        this.metric].join('.'),
      locks = this.top.get('deltas')[key];

    this.graph.inc(locks);
  },
  activate: function(name){
    this.database.set({name: name}, {silent: true});
    this.database.fetch();

    this.top.subscribe();
  },
  deactivate: function(){},
  render: function(){
    var db = this.database.get('name');

    this.$el.html(this.tpl({
      'database': this.database.toJSON(),
      'host': models.instance.toJSON().host,
      'metric': this.metric
    }));

    this.graph.render();

    // $('.chosen-select').chosen({width: '100%',
    //   no_results_text: 'No existing users or roles found matching'
    // }).trigger('chosen:open').on('change', function(e, data) {
    //   var uri = 'collection/' + db + '/' + data.selected;

    //   debug('go to', uri);
    //   this.router.navigate(uri, {trigger: true});
    // }.bind(this));

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
      title: '0.17%'
    });
  }
});

