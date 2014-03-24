"use strict";

var Backbone = require('backbone'),
  $ = Backbone.$,
  _ = require('underscore'),
  models = require('../models'),
  debug = require('debug')('mongoscope:security');

module.exports = Backbone.View.extend({
  tpl: require('../templates/security.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.security = new models.Security()
      .on('sync', this.render, this)
      .on('error', this.render, this);
  },
  activate: function(){
    var self = this;
    this.security.fetch();
  },
  deactivate: function(){

  },
  render: function(){
    this.$el.html(this.tpl(this.security.toJSON()));
    return this;
  }
});

module.exports.User = Backbone.View.extend({
  tpl: require('../templates/security/user.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.model = new models.Security.User().on('sync', this.render, this);
  },
  activate: function(_id){
    this.model.set({_id: _id}, {silent: true});
    this.model.fetch();
  },
  deactivate: function(){},
  render: function(){
    this.$el.html(this.tpl({user: this.model.toJSON()}));
    return this;
  }
});
