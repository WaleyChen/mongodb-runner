var Backbone = require('backbone'),
  debug = require('debug')('_mongoscope:routes'),
  _ = require('underscore'),
  router,
  handlers = {},
  current = null;

Backbone.history.loadUrl = function(fragment) {
  debug('load url', fragment);
  fragment = this.fragment = this.getFragment(fragment);
  var res = _.any(this.handlers, function(handler) {
    if (handler.route.test(fragment)) {
      handler.callback(fragment);
      return true;
    }
  });
  if(!res) return notFound(fragment);
  return res;
};

function notFound(fragment){
  console.warn('No route found for', fragment);
}

module.exports = function(opts){
  return create()
    .add('authenticate', require('./views/auth'))
    .add('pulse', require('./views/pulse'))
    .add('log', require('./views/log'))
    .add('top', require('./views/top'))
    .add('replication', require('./views/replication'))
    .add('security', require('./views/security'), function(add){
      add('user', '/users/:database/:username', 'userDetail');
      add('role', '/roles/:database/:role', 'roleDetail');
    })
    .add('collection', 'collection/:database_name/:collection_name', require('./views/collection'), function(add){
      add('explore', '/explore/:skip', 'activateExplorer');
    })
    .add('createcollection', 'database/:database_name/collection', require('./views/database').createCollection, null)
    .add('database', 'database/:database_name', require('./views/database'), null)
    .default('pulse')
    .go(opts.auth ? 'authenticate' : '');
};

function create(){
  router = new Backbone.Router();

  var body = Backbone.$('body');

  router.on('route', function(name){

    if(current && current.context.exit){
      debug('deactivating', current.name);
      current.context.exit.apply(current.context);
      body.removeClass(current.name);
    }

    debug('switching current to', name);
    current = handlers[name];
    body.addClass(name);
  });
  Backbone.history.start();
  return module.exports;
}

function register(name, url, handler, context){
  handlers[name] = {
    handler: handler,
    name: name,
    context: context,
    url: url
  };
  debug('register route', handlers[name]);
  router.route(url, name, handler.bind(context));
}

module.exports.trigger = function(name){
  return router.trigger(name);
};

module.exports.add = function(name, url, handler, addChild){
  var args = Array.prototype.slice.call(arguments, 0),
    context, parentModule;
  debug('.add', args);

  if(args.length === 2){
    name = url = args[0];
    handler = args[1];
  }

  if(args.length === 3){
    name = url = args[0];
    handler = args[1];
    addChild = args[2];
  }

  if(typeof handler === 'function'){
    parentModule = handler;
    handler = handler.call(handler);
    context = handler;
    handler = handler.activate;
  }

  if(!handler){
    handler = context.enter;
  }

  register(name, url, handler, context);

  if(typeof addChild === 'function'){
    var add = function addChildRoute(childName, childPath, methodName){
      if(context[methodName]){
        register(name + '-' + childName, url + childPath,
          context[methodName].enter, context[methodName]);
      }
      else if(parentModule[methodName]){
        var view = parentModule[methodName]();
        register(name + '-' + childName, url + childPath, view.enter, view);
      }
    };
    addChild.call(addChild, add);
  }
  return module.exports;
};

module.exports.go = function(fragment){
  if(fragment === 'authenticate'){
    Backbone.history.navigate('loading', {trigger: true});
  }

  debug('go', fragment);
  Backbone.history.navigate(fragment, {trigger: true});
  return module.exports;
};

module.exports.default = function(fragment){
  router.route('', 'index', function(){
    module.exports.go(fragment);
  });
  return module.exports;
};
