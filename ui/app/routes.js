var Backbone = require('backbone'),
  debug = require('debug')('_mongoscope:routes'),
  _ = require('underscore'),
  service = require('./service'),
  flash = require('./flash'),
  router, body,
  handlers = {},
  current = {};

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
  if(router){
    console.warn('create called more than once');
    return router;
  }

  return create()
    .add('authenticate', require('./views/auth'))
    .add('connect', require('./views/connect').create)
    .add('mongodb', 'mongodb/:instance_id', require('./views/home'), null)
    .add('switch_instance', 'connect/:deployment_id/:instance_id', require('./views/connect').instance, null)
    .add('switch_deployment', 'connect/:deployment_id', require('./views/connect').deployment, null)
    .add('log', ':instance_id/log', require('./views/log'), null)
    .add('top', ':instance_id/top', require('./views/top'), null)
    .add('collection', ':instance_id/collection/:database_name/:collection_name', require('./views/collection'), function(add){
      add('explore', '/explore/:skip', 'activateExplorer');
    })
    .add('createcollection', ':instance_id/database/:database_name/collection', require('./views/database').createCollection, null)
    .add('database', ':instance_id/database/:database_name', require('./views/database'), null)
    .default('authenticate')
    .go(opts.auth ? 'authenticate' : '');
};

function create(){
  router = new Backbone.Router();
  body = Backbone.$('body');

  router.on('route', function(name){
    debug('switching to', name);
    if(current.name && current.context.exit){
      debug('deactivating', current.name);
      current.context.exit.apply(current.context);
    }
    body.removeClass(current.name).addClass(name);
    current = handlers[name] || {};
  });
  Backbone.history.start();

  watchService();
  return module.exports;
}

function watchService(){
  var srv = service();
  srv.on('error', function(err){
    flash.error(err.message);
    if(err.status === 401){
      return Backbone.history.navigate('authenticate', {trigger: true});
    }
  })
  .on('disconnect', function(){
    flash.error('server disconnected');
  })
  .on('reconnect', function(){
    flash.success('server reconnected').clear('server disconnected');
    return Backbone.history.navigate('authenticate', {trigger: true});
  });
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
