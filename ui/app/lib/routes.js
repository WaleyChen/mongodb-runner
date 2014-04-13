var Backbone = require('backbone'),
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
    debug('caught router event', name);
    if(router._current){
      debug('deactivating', router._current.name);
      if(typeof router._current === 'function'){
        router._current.call(router._current, 'deactivate');
      }
      else {
        router._current.deactivate.apply(router._current);
      }
      body.removeClass(router._current.name);
    }
    debug('switching current to', name);
    router._current = router._nameToHandler[name];
    router._current.name = name;
    body.addClass(name);
  });

  specs.map(function(spec){
    var route = spec[0],
      controller = spec[2],
      name = spec[1],
      opts = spec[3] || {},
      handler = controller.activate ? controller.activate.bind(controller) : controller;

    controller.router = router;

    router._nameToHandler[name] = controller;
    router.route(route, name, handler);

    if(opts.index === true){
      debug('index points to', name);
      router.route('', 'index', handler);
      router._nameToHandler.index = controller;
    }
  });
  debug('router ready', router);
  return router;
};
