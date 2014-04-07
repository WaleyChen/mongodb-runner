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

describe('root', function(){
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
    debug('generating fixtures');
    getToken(function(err, token){
      get('/api/v1/')
        .set('Authorization', 'Bearer ' + token)
        .expect(200)
        .end(function(err, res){
          assert(res.body.length === 1);
          done();
        });
    });
  });
});
