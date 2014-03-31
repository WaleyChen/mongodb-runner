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
    this.details = new module.exports.User();

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
    if(this.security.get('users').length > 0){
      this.details.activate(this.security.get('users')[0]._id);
      $('.chosen-select').chosen({width: '100%',
        no_results_text: 'No existing users or roles found matching'
      }).trigger('chosen:open');
    }
    return this;
  }
});

var rolio = {};
rolio.byName = {};
rolio.addToMatrix = function(matrix, database, name){
  // @todo: support custom role look ups.
  if(!rolio.byName[name]) return debug('unknown role', name);
  debug('attaching statements to matrix', rolio.byName[name].statements.length);
  rolio.byName[name].statements.map(function(statement){
    var resource = statement.resource.replace('#{database}', database),
      _id = resource + '::' + statement.action;

    if(!matrix[_id]){
      matrix[_id] = {
        _id: _id,
        action: statement.action,
        resource: resource,
        effect: 'ALLOW',
        roles: []
      };
    }
    matrix[_id].roles.push(name);
  });
};

module.exports.User = Backbone.View.extend({
  tpl: require('../templates/security/user.jade'),
  initialize: function(){
    this.model = new models.Security.User().on('sync', this.render, this);
  },
  activate: function(_id){
    this.model.set({_id: _id}, {silent: true});
    this.model.fetch();
  },
  deactivate: function(){},
  render: function(){
    this.$el = $('.details');

    var matrix = {};
    this.model.get('roles').map(function(role){
      rolio.addToMatrix(matrix, role.db, role.role);
    });

    debug('created matrix', matrix);

    this.$el.html(this.tpl({
      user: this.model.toJSON(),
      matrix: matrix
    }));
    return this;
  }
});
