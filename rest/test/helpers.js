'use strict';

var supertest = require('supertest'),
  MongoClient = require('mongodb').MongoClient,
  app = require('../lib/'),
  debug = require('debug')('mg:rest:test:helpers');

module.exports = {
  collections: {},
  get: function(path){
    return supertest(app).get(path);
  },
  post: function(path){
    return supertest(app).post(path);
  },
  before: function(){},
  beforeEach: function(){},
  after: function(done){
    var names = Object.keys(module.exports.collections),
      pending = names.length;

    names.map(function(col){
      module.exports.collections[col].drop(function(){
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
        module.exports.collections[name] = collection;
        collection.insert({_id: 'dummy'}, function(){
          done();
        });
      });
    });
  }
};
