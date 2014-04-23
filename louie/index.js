var request = require('superagent'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter,
  debug = require('debug')('louie');

module.exports = Client;

function Token(opts){
  opts = opts || {};
  if(!(this instanceof Token)) return new Token(opts);
  this.scope = opts.scope || 'http://localhost:29017';
  this.seed = opts.seed || 'mongodb://localhost:27017';
  this.expirationRedLine = 15 * 1000;
  this.session = {};

  this.exec();
}
util.inherits(Token, EventEmitter);

Token.prototype.toString = function(){
  return this.session.token;
};

Object.defineProperty(Token.prototype, 'token', {get: function(){
  return this.session.token;
}});

Token.prototype.bake = function(done){
  debug('getting token for', this.seed);
  request.post(this.scope + '/api/v1/token')
    .send({seed: this.seed})
    .end(function(err, res){
      debug('got token response', res.body);

      if(err) return done(err);

      if(!res.body.expires_at || !res.body.created_at){
        return done(new Error('Malformed response.  Missing expires_at or created_at'));
      }

      if(new Date(res.body.expires_at) - Date.now() < (1 * 60 * 1000)){
        return done(new Error('Got an expires that is less than a minute from now.'));
      }

      done(null, res.body);
    }.bind(this));
};

Token.prototype.refresh = function(){
  this.bake(function(err, res){
    if(err) this.emit('error', err);
    this.session = res;

    debug('token refreshed successfully');
    return this.schedule();
  }.bind(this));
};

Token.prototype.schedule = function(){
  var ms = (new Date(this.session.expires_at) - Date.now()) - this.expirationRedLine;
  debug('token redline in ' + ms + 'ms', (ms/1000/60) + 'minutes');
  setTimeout(this.refresh.bind(this), ms);
};

Token.prototype.exec = function(){
  debug('starting new token');
  var self = this;

  this.bake(function(err, res){
    if(err) return self.emit('error', err);

    self.session = res;
    self.schedule();

    debug('sending ready');
    self.ready = true;
    self.emit('ready');
  });
};

function Client(opts){
   if(!(this instanceof Client)) return new Client(opts);

  var self = this;

  this.queuedRequests = [];
  this.ready = false;

  this.token = new Token(opts).on('error', function(err){
    self.emit('error', err);
  }).on('ready', function(){
    debug('token consuming queue of ', self.queuedRequests);

    self._instance = {
      name: self.token.seed.replace('mongodb://', '')
    };
    self.ready = true;
    self.consume();
    self.emit('ready');
  });


}
util.inherits(Client, EventEmitter);

Client.prototype.consume = function(){
  var self = this;
  this.queuedRequests.map(function(q){
    debug('calli');
    self[q.method].apply(self, q.args);
  });
  return this;
};

Client.prototype.url = function(path){
  return this.token.scope + '/api/v1' + path;
};

Client.prototype.queue = function(){
  var args = Array.prototype.slice.call(arguments, 0),
    method = args.shift();
  this.queuedRequests.push({method: method, args: args});
  return this;
};

// Install facade methods against the shell api people are more accustomed to.
var facade = {
  listDatabases: ['instance', 'database_names'],
  getCollectionNames: ['database', 'collection_names'],
};

Object.keys(facade).map(function(shellMethod){
  var method = facade[shellMethod][0];

  Client.prototype[shellMethod] = function(){
    var args = Array.prototype.slice.call(arguments, 0),
      fn = args.pop();
    args.push(function(err, data){
      if(err) return fn(err);

      if(facade[shellMethod][1]) return fn(null, data[facade[shellMethod][1]]);
      fn(null, data);
    });
    this[method].apply(this, args);
  };
});

Client.prototype.instance = function(fn){
  if(!this.ready) return this.queue('instance', fn);

  request.get(this.url('/' + this._instance.name))
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.token.toString())
    .end(function(err, res){
      if(err) return fn(err);

      fn(null, res.body);
    });
};

Client.prototype.database = function(name, fn){
  if(!this.ready) return this.queue('database', name, fn);

  request.get(this.url('/' + this._instance.name + '/' + name))
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.token.toString())
    .end(function(err, res){
      if(err) return fn(err);

      fn(null, res.body);
    });
};

Client.prototype.find = function(db, coll, where, fn){
  if(!this.ready) return this.queue('find', db, coll, where, fn);

  request.get(this.url('/' + this._instance.name + '/' + db + '/' + coll + '/find'))
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.token.toString())
    .query({where: JSON.stringify(where)})
    .end(function(err, res){
      if(err) return fn(err);

      fn(null, res.body);
    });
};

Client.prototype.count = function(db, coll, where, fn){
  if(!this.ready) return this.queue('count', db, coll, where, fn);

  request.get(this.url('/' + this._instance.name + '/' + db + '/' + coll + '/count'))
    .set('Accept', 'application/json')
    .set('Authorization', 'Bearer ' + this.token.toString())
    .query({where: JSON.stringify(where)})
    .end(function(err, res){
      if(err) return fn(err);

      fn(null, res.body);
    });
};
