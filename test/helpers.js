process.env.NODE_ENV = 'testing';

var supertest = require('supertest'),
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert'),
  app = require('../lib/'),
  store = require('../lib/store'),
  debug = require('debug')('mongoscope:test:helpers');

var ctx = {
    get: function(key){
      return ctx[key] || defaults[key];
    },
    reset: function(){
      Object.keys(ctx).map(function(k){
        if(typeof ctx[k] !== 'function'){
          delete ctx[k];
        }
      });
      return ctx;
    }
  };

var defaults = {
  seed: 'mongodb://localhost:27017'
};

exports = {
  collections: {},
  get: function(path){
    return supertest(app).get(path);
  },
  post: function(path){
    return supertest(app).post(path);
  },
  beforeWith: function(context){
    return function(done){
      Object.keys(context).map(function(k){
        ctx[k] = context[k];
      });
      exports.before(done);
    };
  },
  before: function(done){
    debug('\n-------------------------------\nsetup');

    exports.post('/api/v1/token')
      .send({seed: ctx.get('seed')})
      .expect(201)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if(err) return done(err);

        assert(res.body.token);
        exports.ctx.token = res.body.token;
        debug('running test\n-------------------------------\n');
        done();
      });
  },
  beforeEach: function(){},
  after: function(done){
    debug('\n-------------------------------\nteardown');
    ctx.reset();
    store.clear(function(){
      var names = Object.keys(exports.collections),
        pending = names.length;

      if(pending === 0) return done();

      names.map(function(col){
        exports.collections[col].drop(function(){
          pending--;
          if(pending === 0){
            return done();
          }
        });
      });
    });
  },
  afterEach: function(){},
  createCollection: function(name, done){
    MongoClient.connect(ctx.get('seed') + '/test', function(err, db){
      if(err) return done(err);
      db.collection(name, function(err, collection){
        if(err) return done(err);
        debug('created collection', name);
        exports.collections[name] = collection;
        collection.insert({_id: 'dummy'}, function(){
          done();
        });
      });
    });
  },
  ctx: ctx
};

module.exports = exports;
