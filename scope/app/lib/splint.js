'use strict';

var Backbone = require('backbone'),
  Backbone = require('Backbone'),
  _ = require('underscore'),
  debug = require('debug')('mg:splint');

// Make the app from a list of `specs`.
//
// A `spec` is an array of:
//
// - route, controller
// - route, name, controller
// - route, name, controller, opts
//
// `opts`
// - **index** {Boolean}, Should this be used as the default controller?
//
// @param {Array} ... The specs
// @return {Backbone.Router}
// @api public
module.exports = function splint(){
  var specs = Array.prototype.slice.call(arguments, 0),
    router = new Backbone.Router(),
    body = Backbone.$('body');

  router._current = null;
  router._nameToHandler = {};

  // Deactivate the previous controller
  router.on('route', function(name){

    if(router._current){
      debug('deactivating', router._current.name);
      router._current.deactivate.call(router._current);
      body.removeClass(router._current.name);
    }
    router._current = router._nameToHandler[name];
    router._current.name = name;
    body.addClass(name);
  });

  specs.map(function(spec){
    var route = spec[0],
      controller = spec[2],
      name = spec[1],
      opts = spec[3] || {},
      handler = controller.activate.bind(controller);

    controller.router = router;

    router._nameToHandler[name] = controller;
    router.route(route, name, handler);

    if(opts.index === true){
      debug('index points to', name);
      router.route('', 'index', handler);
      router._nameToHandler.index = controller;
    }
  });

  Backbone.history.start();
  return router;
};

module.exports.Controller = Backbone.View.extend({
  tpl: null,
  _model_keys: [],
  initialize: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.activated = false;
    this.template = this.tpl;

    var self = this;

    _.each(_.pairs(this.models), function(i){
      var name = i[0], model = i[1];
      self._model_keys.push(name);

      self[name] = model.on('sync', self.render, self)
        .on('error', self.render, self);

      self.on('activate', function(){
        self[name].fetch();
      });
    });
  },
  ctx: function(){
    var self = this,
      ctx = {};

    _.each(this._model_keys, function(key){
      ctx[key] = self[key].toJSON();
    });
    return ctx;
  },
  activate: function(){
    debug('activate', this.name);
    this.activated = true;
    this.trigger('activate', this);
  },
  deactivate: function(){
    this.activated = false;
    this.trigger('deactivate', this);
    debug('deactivate', this.name);
  },
  render: function(){
    if(this.activated === false) return this;

    this.$el.html(this.tpl(this.ctx()));
    this.trigger('rendered', this);
    return this;
  },
  rerender: function(){
    this.activated = true;
    this.render();
    this.activate = false;
    return this;
  }
});
