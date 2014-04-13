var Backbone = require('Backbone'),
  $ = Backbone.$,
  models = require('../models'),
  DatabasePulseView = require('./database').Summary,
  debug = require('debug')('mg:scope:pulse');

var Pulse = Backbone.View.extend({
  tpl: require('../templates/pulse.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);
    this.enterd = false;

    this.instance = models.instance;
    this.databases = [];
  },
  enter: function(){
    debug('pulse enterd');
    this.enterd = true;
    if(!this.instance.get('host')){
      this.instance.once('sync', this.render, this);
      this.instance.fetch();
    }
    else {
      this.render();
    }
  },
  exit: function(){
    if(this.databases.length === 0){
      return this;
    }
    this.databases.map(function(database){
      database.exit();
    });
    this.enterd = false;
  },
  render: function(){
    var self = this;

    clearTimeout(this.poller);
    if(self.instance.get('database_names').length === 0){
      this.$el.html(this.tpl({
          'instance': this.instance.toJSON(),
          'metric': this.metric
        }));
      return self.poller = setTimeout(function(){
        self.instance.fetch();
      }, 5000);
    }
    debug('render template', this.instance.toJSON());
    this.$el.html(this.tpl({instance: this.instance.toJSON()}));

    if(this.databases.length === 0){
      debug('creating database views');
      this.databases = this.instance.get('database_names').map(function(name){
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
