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

  // Deactivate the previous controller
  router.on('route', function(name, args){
    console.log('need to deactivate?', name, args, router._current);
    if(router._current){
      router._current.deactivate();
    }
    router._current = router._nameToHandler[name];
  });

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

  Backbone.history.start();
  return router;
}

require('../models')({host: '127.0.0.1'});

module.exports = function(opts){
  return splint(
    ['pulse',  new (require('./pulse'))(), {index: true}],
    ['log',  new (require('./log'))()],
    ['top',  new (require('./top'))()],
    ['collection/:database_name/:collection_name',  new (require('./collection'))()],
    ['database/:database_name',  new (require('./database'))()]
  );
};
