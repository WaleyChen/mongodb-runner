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

// @todo: package all of this up as json like https://www.npmjs.org/package/admittance
// and make extremely reusable?  Even better would be to use YAML
// to allow for lots of commenting...
var RoleActions = {
  // <scope>:<resource>:<action>
  read: [
    'db:bases:collStats',
    'db:bases:dbHash',
    'db:bases:dbStats',
    'db:bases:find',
    'db:bases:killCursors'
  ],
  // db -> scoped to database level
  // bases -> any non-special database
  readWrite: [
    'db:bases:collStats',
    'db:bases:convertToCapped',
    'db:bases:createCollection',
    'db:bases:dbHash',
    'db:bases:dbStats',
    'db:bases:dropCollection',
    'db:bases:createIndex',
    'db:bases:dropIndex',
    'db:bases:emptycapped',
    'db:bases:find',
    'db:bases:insert',
    'db:bases:killCursors',
    'db:bases:remove',
    'db:bases:renameCollectionSameDB',
    'db:bases:update'
  ],
  dbAdmin: [
    'db:system.indexes:collStats',
    'db:system.indexes:dbHash',
    'db:system.indexes:dbStats',
    'db:system.indexes:find',
    'db:system.indexes:killCursors',
    'db:system.namespaces:collStats',
    'db:system.namespaces:dbHash',
    'db:system.namespaces:dbStats',
    'db:system.namespaces:find',
    'db:system.namespaces:killCursors',
    'db:system.profile:collStats',
    'db:system.profile:dbHash',
    'db:system.profile:dbStats',
    'db:system.profile:find',
    'db:system.profile:killCursors',
    'db:system.profile:dropCollection',
    'db:bases:collMod',
    'db:bases:collStats',
    'db:bases:compact',
    'db:bases:convertToCapped',
    'db:bases:createCollection',
    'db:bases:createIndex',
    'db:bases:dbStats',
    'db:bases:dropCollection',
    'db:bases:dropDatabase',
    'db:bases:dropIndex',
    'db:bases:enableProfiler',
    'db:bases:indexStats',
    'db:bases:reIndex',
    'db:bases:renameCollectionSameDB',
    'db:bases:repairDatabase',
    'db:bases:storageDetails',
    'db:bases:validate'
  ],
  // @note: if bases is `admin`, bases = *.
  userAdmin: [
    'db:bases:changeCustomData',
    'db:bases:changePassword',
    'db:bases:createRole',
    'db:bases:createUser',
    'db:bases:dropRole',
    'db:bases:dropUser',
    'db:bases:grantRole',
    'db:bases:revokeRole',
    'db:bases:viewRole',
    'db:bases:viewUser',
  ],
  dbOwner: 'readWrite + dbAdmin + userAdmin',
  clusterAdmin: 'clusterManager + clusterMonitor + hostManager',
  clusterManager: [
    'cluster:addShard',
    'cluster:applicationMessage',
    'cluster:cleanupOrphaned',
    'cluster:flushRouterConfig',
    'cluster:listShards',
    'cluster:removeShard',
    'cluster:replSetConfigure',
    'cluster:replSetGetStatus',
    'cluster:replSetStateChange',
    'cluster:resync',
    'db:*:enableSharding',
    'db:*:moveChunk',
    'db:*:splitChunk',
    'db:*:splitVector',
    'db:settings:insert',
    'db:settings:remove',
    'db:settings:update',

  ]

};
