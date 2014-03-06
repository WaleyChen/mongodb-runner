var Backbone = require('backbone');

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
// @api private
function splint(){
  var specs = Array.prototype.slice.call(arguments, 0),
    router = new Backbone.Router();

  router._current = null;
  router._nameToHandler = {};

  specs.map(function(spec){
    var route = spec.shift(),
      controller = spec.shift(),
      name, opts, handler;

    if(typeof controller === 'string'){
      name = controller;
      controller = name;
      spec.shift();
    }
    opts = spec.shift() || {};

    handler = controller.activate.bind(controller);
    router._nameToHandler[name] = controller;

    // add the route
    router.route(route, name, handler);

    if(opts.index === true){
      router.route('', 'index', handler);
      router._nameToHandler.index = controller;
    }
  });

  // Deactivate the previous controller
  router.on('route', function(name, args){
    if(router._current){
      router._current.deactivate.apply(router._current, []);
    }
    router._current = router._nameToHandler[name];
  });

  Backbone.history.start();
  return router;
}

require('../models')({host: '127.0.0.1', port: 3000});

module.exports = function(opts){
  return splint(
    ['dbs',  new (require('./dbs'))(), {index: true}],
    ['log',  new (require('./log'))()]
  );
};
