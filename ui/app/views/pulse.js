var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  DatabasePulseView = require('./database').Summary,
  debug = require('debug')('mongoscope:pulse');

var Pulse = Backbone.View.extend({
  tpl: require('./tpl/pulse.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.databases = [];
  },
  enter: function(){
    debug('pulse enter');
    models.instance.on('change:_id', this.switchedInstance, this);

    if(!Array.isArray(models.instance.get('database_names'))){
      models.instance.on('sync', this.render, this);
    }
    else {
      this.render();
    }
  },
  exit: function(){
    models.instance.off('sync', this.render, this)
      .off('change:_id', this.switchedInstance, this);

    this.$el.find('.databases').remove();

    if(this.databases.length === 0){
      return this;
    }
    this.databases.map(function(database){
      database.exit();
    });
  },
  switchedInstance: function(){

  },
  render: function(){
    var self = this;
    debug('got render', models.instance.toJSON());

    clearTimeout(this.poller);
    if(models.instance.get('database_names').length === 0){
      this.$el.html(this.tpl({
          'instance': models.instance.toJSON(),
          'metric': this.metric
        }));
      return self.poller = setTimeout(function(){
        debug('checking for instance updates', models.instance);
        models.instance.fetch();
      }, 5000);
    }

    this.$el.html(this.tpl({instance: models.instance.toJSON()}));

    if(this.databases.length === 0){
      debug('creating database views');
      this.databases = models.instance.get('database_names').map(function(name){
        return new DatabasePulseView({name: name});
      });
    }

    this.$el.find('.databases').append(this.databases.map(function(database){
      return database.enter().render().el;
    }));

    this.databases.map(function(database){
      database.draw();
    });
  }
});

module.exports = function(opts){
  return new Pulse(opts);
};
