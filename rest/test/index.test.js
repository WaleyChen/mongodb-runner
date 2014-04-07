'use strict';

var helpers = require('./helpers'),
  get = helpers.get,
  post = helpers.post,
  assert = require('assert'),
  debug = require('debug')('mg:rest:test:index');

describe('rest', function(){
  var token, host = 'localhost:27017';

  before(function(done){
    debug('get fixture token for', host);
    post('/api/v1/token')
      .send({host: host})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res){
        if(err) return done(err);
        assert(res.body.token);
        token = res.body.token;
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
    it('should get instance details', function(done){
      get('/api/v1/' + host)
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err){
          if(err) return done(err);
          done();
        });
    });

    it('should get instance metrics', function(done){
      get('/api/v1/' + host + '/metrics')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err){
          if(err) return done(err);
          done();
        });
    });

    it('should return default profiling info', function(done){
      get('/api/v1/' + host + '/profiling')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err){
          if(err) return done(err);
          done();
        });
    });

    it('should return profiling entries', function(done){
      get('/api/v1/' + host + '/profiling/entries')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err){
          if(err) return done(err);
          done();
        });
    });
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
