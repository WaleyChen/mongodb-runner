var debug = require('debug')('stor:session');

// @todo: `stor` should have a helper + proper api for
// applying partial updates like Backbone's patch method.
// @todo: id generation in `stor`?
// @todo: move the backbone bits to `stor` and it can have just 1 backbone adapter.
// @todo: `stor` should have prefix/namespace/tablename support.
function prostrate(source){
  return function(method, transform){
    transform = transform || {};

    var wrapped = function(){
      var args = Array.prototype.slice.call(arguments, 0),
        fn = args.pop(),
        res,
        real = window.sessionStorage[method];

      if(args.length === 2 && transform.before){
        args[1] = transform.before(args[1]);
      }

      if(args[0] && ['removeItem', 'getItem', 'setItem'].indexOf(method)){
        var id = args[0];
        id = id.toString();
        if(id.indexOf(prostrate.prefix) === -1){
          id = prostrate.prefix + '' + id;
          debug('applied prefix', id);
        }
        args[0] = id;
      }

      if(typeof real === 'function'){
        res = real.apply(source, args);
      }
      else {
        res = window.sessionStorage[method];
      }

      try{
        if(transform.after){
          debug('running after transform', transform.after);
          res = transform.after(res);
        }
      }
      catch(e){
        debug('could not transform', res);
      }
      debug(method + ' result', res);
      fn(null, res);
    };

    return wrapped;
  };
}

var proxy = prostrate(window.sessionStorage);


function BackboneAdapter(store, name){
  prostrate.prefix = name  + '~';
  this.store = store;
}

BackboneAdapter.prototype.sync = function(method, model, options){
  var args = [], self = this, store = this.store;

  if(Array.isArray(model.models)){
    // it's a collection, but backbone sends the same methods as models.
    method = 'all';
  }
  else {
    if(method === 'create' && !model.id){
      return store.id(function(err, id){
        model.id = id;
        model.set(model.idAttribute, id);
        self.sync(method, model, options);
      });
    }
    args.push(model.id);

    if(['create', 'update', 'patch'].indexOf(method) > -1){
      args.push(model.toJSON());
    }
  }
  args.push(function(err, data){
    if(err) return options.error(err);
    options.success(data);
  });

  store.handler(method).apply(this, args);
};

var sesh = {
  binding: window.sessionStorage,
  backbone: function(name){
    var adapter = new BackboneAdapter(module.exports, name);
    return {
      sync: function(){
        return adapter.sync.apply(adapter, arguments);
      }
    };
  },
  prefix: proxy.prefix,
  get: proxy('getItem', {after: JSON.parse}),
  set: proxy('setItem', {before: JSON.stringify}),
  remove: proxy('removeItem'),
  key: proxy('key'),
  clear: proxy('clear'),
  length: proxy('length'),
  all: function(fn){
    debug('all called');
    var store = module.exports;
    store.length(function(err, length){
      if(err) return fn(err);

      if(length === 0) return fn(null, []);

      var pending = length,
        docs = [];

      for(var i=0; i < length; i++){
        store.key(i, function(err, id){
          if(err) return fn(err);

          store.get(id, function(err, doc){
            debug('get ' + id, err, doc);
            if(err) return fn(err);

            docs.push(doc);
            pending--;
            if(pending === 0) return fn(null, docs);
          });
        });
      }
    });
  },
  // normalize the api taxonomy with a convenience that returns the
  // correct function for a store.
  handler: function(method){
    var fn, store = sesh,
          taxonomy = {
          create: store.set,
          read: store.get,
          update: store.set,
          'delete': store.remove,
          patch: store.set,
          findAll: store.all,
          findById: store.get
        };

    fn = store[method] || taxonomy[method];
    return fn;
  },

  // Generate a new id.
  // @todo: `stor` should support other id generation strategies like:
  //  - bson object id
  //  - guid
  //  - snowflake
  //  - now
  //  - concat selected document values for specified document keys
  id: function(fn){
    sesh.length(function(err, length){
      fn(null, length + 1);
    });
  }
};

module.exports = sesh;
