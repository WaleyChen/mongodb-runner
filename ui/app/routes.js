var Backbone = require('backbone'),
  debug = require('debug')('mongoscope:routes'),
  router,
  handlers = {},
  current = null;

module.exports = function(opts){
  return create()
    .add('authenticate', require('./views/auth'))
    .add('pulse', require('./views/pulse'))
    .add('log', require('./views/log'))
    .add('top', require('./views/top'))
    .add('security', require('./views/security'), function(){
      this.add('user', 'users/:database/:username', 'userDetail');
      this.add('role', 'roles/:database/:role', 'roleDetail');
    })
    .add('collection', 'collection/:database_name/:collection_name', require('./views/collection'), function(){
      this.add('explore', '/explore/:skip', 'activateExplorer');
    })
    .add('database', 'database/:database_name', require('./views/database'), function(){
      this.add('create collection', '/collection', 'createCollection');
    })
    .default('pulse')
    .go(opts.auth ? 'authenticate' : '');
};

function create(){
  router = new Backbone.Router();

  var body = Backbone.$('body');

  router.on('route', function(name){
    if(current){
      debug('deactivating', current.name);

      if(typeof current === 'function'){
        current.call(current, 'deactivate');
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
  Backbone.history.start();
  return module.exports;
}

function route(name, url, handler, context){
  debug('register route', name, url, handler, context);
  handlers[name] = {
    handler: handler,
    name: name,
    context: context,
    url: url
  };
  router.route(url, name, handler.bind(context));
}

module.exports.add = function(name, url, handler, addChild){
  var args = Array.prototype.slice.call(arguments, 0), context;

  if(args.length === 2){
    name = url = args[0];
    handler = args[1];
  }

  if(typeof handler === 'function'){
    handler = handler.call(handler);
    context = handler;
    handler = handler.activate;
  }

  if(args.length === 3){
    name = url = args[0];
    handler = args[1];
    addChild = args[2];
  }

  if(typeof addChild === 'function'){
    var childContext = {
      add: function(childName, childPath, methodName){
        debug('add child to ' + name, childName, childPath, methodName);
        route(name + ' ' + childName, url + childPath, handler[methodName].bind(context));
        return childContext;
      }
    };
    addChild.call(childContext);
  }
  return module.exports;
};

module.exports.go = function(fragment){
  Backbone.history.navigate(fragment, {trigger: true});
  return module.exports;
};

module.exports.default = function(fragment){
  router.route('', 'index', function(){
    module.exports.go(fragment);
  });
  return module.exports;
};
