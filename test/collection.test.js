'use strict';

var helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  assert = require('assert'),
  debug = require('debug')('test:collection');

describe('collection', function(){
  before(helpers.before);
  after(helpers.after);

  it('should not create collections automatically', function(done){
    get('/api/v1/localhost:27107/test/scopes')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(404)
      .end(function(err){
        if(err) return done(err);
        done();
      });
  });

  it('should return collection details', function(done){
    helpers.createCollection('scopes', function(){
      get('/api/v1/localhost:27107/test/scopes')
        .set('Authorization', 'Bearer ' + ctx.token)
        .expect(200)
        .end(function(err, res){
          if(err) return done(err);
          debug('detail', res.body);
          done();
        });
    });
  });
  it('should be able to run find', function(done){
    get('/api/v1/localhost:27107/test/scopes/find')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);
        debug('find', res.body);
        assert(res.body.length === 1, 'should have got the dummy insert');
        done();
      });
  });
  it('should be able to run count', function(done){
    get('/api/v1/localhost:27107/test/scopes/count')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('count', res.body);
        assert(res.body.count === 1, 'should have got the dummy insert');
        done();
      });
  });
  it('should be able to run find with explain', function(done){
    get('/api/v1/localhost:27107/test/scopes/find')
      .set('Authorization', 'Bearer ' + ctx.token)
      .query({explain: 1})
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('explain', res.body);
        assert(res.body.cursor === 'BasicCursor');
        done();
      });
  });
  it('should be able to run aggregate', function(done){
    get('/api/v1/localhost:27107/test/scopes/aggregate')
      .set('Authorization', 'Bearer ' + ctx.token)
      .query({pipeline: JSON.stringify([{$group: {_id: '$_id'}}])})
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('aggregate', res.body);

        assert(res.body.length === 1);
        done();
      });
  });
});
