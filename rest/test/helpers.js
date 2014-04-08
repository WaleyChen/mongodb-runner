'use strict';

var supertest = require('supertest'),
  MongoClient = require('mongodb').MongoClient,
  assert = require('assert'),
  app = require('../lib/'),
  debug = require('debug')('mg:rest:test:helpers');

exports = {
  collections: {},
  get: function(path){
    return supertest(app).get(path);
  },
  post: function(path){
    return supertest(app).post(path);
  },
  before: function(done){
    debug('get fixture token');

    exports.post('/api/v1/token')
      .send({host: 'localhost:27017'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if(err) return done(err);

        assert(res.body.token);
        exports.ctx.token = res.body.token;
        done();
      });
  },
  beforeEach: function(){},
  after: function(done){
    var names = Object.keys(exports.collections),
      pending = names.length;

    names.map(function(col){
      exports.collections[col].drop(function(){
        pending--;
        if(pending === 0){
          return done();
        }
      });
    });
  },
  afterEach: function(){},
  createCollection: function(name, done){
    MongoClient.connect('mongodb://localhost:27017/test', function(err, db){
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
  ctx: {}
};
