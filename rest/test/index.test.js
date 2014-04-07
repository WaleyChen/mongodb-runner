'use strict';

var helpers = require('./helpers'),
  get = helpers.get,
  post = helpers.post,
  assert = require('assert'),
  debug = require('debug')('mg:rest:test:index');

function getToken(done){
  post('/api/v1/token')
    .send({host: 'localhost:27017'})
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res){
      assert(res.body.token);
      done(null, res.body.token);
    });
}

describe('rest', function(){
  var token;
  before(function(done){
    getToken(function(err, data){
      if(err) return done(err);
      token = data;
      done();
    });
  });

  describe('api root', function(){
    it('should require a token', function(done){
      get('/api/v1/').expect(401, done);
    });

    it('should reject a malformed Authorization header', function(done){
      get('/api/v1/')
        .set('Authorization', 'open sesame')
        .expect(400, done);
    });

    it('should reject an invalid token', function(done){
      get('/api/v1/')
        .set('Authorization', 'Bearer opensesame')
        .expect(403, done);
    });

    it('should show a list of deployments', function(done){
      get('/api/v1/')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res){
          assert(res.body.length === 1);
          done();
        });
    });
  });
  describe('host', function(){
    it('should get instance details');
    it('should return default profiling info');
  });

  describe('database', function(){
    it('should return database details');
    it('should return in-progress operations');
    it('should return the oplog');
  });

  describe('collection', function(){
    it('should return collection details');
    it('should be able to run find');
    it('should be able to run count');
    it('should be able to run find with explain');
    it('should be able to run aggregate');
  });
});
