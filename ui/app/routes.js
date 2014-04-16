var Backbone = require('backbone'),
  debug = require('debug')('_mongoscope:routes'),
  _ = require('underscore'),
  service = require('./service'),
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
  if(router){
    console.warn('create called more than once');
    return router;
  }

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

  watchService();
  return module.exports;
}

Backbone.flash = function(msg, cls){
  var el = Backbone.$('<div class="message" style="display: none;"/>');
  el.text(msg);
  if(cls) el.addClass(cls);
  Backbone.$('#status .flash').append(el);
  el.fadeIn();

  if(cls !== 'error'){ // Errors must be manually cleared.
    el.hideTimeout = setTimeout(function(){
      Backbone.flash.clear(msg);
    }, 5000);
  }

  if(!Backbone.flash.messages[msg]){
    Backbone.flash.messages[msg] = [];
  }
  Backbone.flash.messages[msg].push(el);
};
Backbone.flash.messages = {};

Backbone.flash.clear = function(message){
  var el = Backbone.flash.messages[message].shift();
  el.fadeOut('slow', function(){
    el.remove();
    clearTimeout(el.hideTimeout);
    delete el;
  });
};

function watchService(){
  var srv = service();
  srv.on('error', function(err){
    console.error('routes caught service error', err);
    Backbone.flash(err.message, 'error');
    if(err.status === 401){
      return Backbone.history.navigate('authenticate', {trigger: true});
    }
  })
  .on('disconnect', function(){
    Backbone.flash('server disconnected', 'error');
    console.error('server disconnected');
  })
  .on('reconnect', function(){
    console.error('server reconnected');
    Backbone.flash('server reconnected', 'success');
    Backbone.flash.clear('server disconnected');

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