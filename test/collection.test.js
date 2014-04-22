var helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  assert = require('assert'),
  debug = require('debug')('mongoscope:test:collection');

describe('collection', function(){
  before(helpers.before);
  after(helpers.after);

  it('should not create collections automatically', function(done){
    get('/api/v1/localhost:27017/test/scopes')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(404)
      .end(function(err, res){
        debug('detail', res.text);
        if(err) return done(err);
        done();
      });
  });

  it('should return collection details', function(done){
    helpers.createCollection('scopes', function(){
      get('/api/v1/localhost:27017/test/scopes')
        .set('Authorization', 'Bearer ' + ctx.token)
        .expect(200)
        .end(function(err, res){
          debug('detail', res.body);
          if(err) return done(err);
          done();
        });
    });
  });
  it('should be able to run find', function(done){
    get('/api/v1/localhost:27017/test/scopes/find')
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
    get('/api/v1/localhost:27017/test/scopes/count')
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
    get('/api/v1/localhost:27017/test/scopes/find')
      .set('Authorization', 'Bearer ' + ctx.token)
      .query({explain: 1})
      .expect(200)
      .end(function(err, res){
        debug('explain', res.body);

        if(err) return done(err);
        assert(res.body.cursor === 'BasicCursor');
        done();
      });
  });
  it('should be able to run aggregate', function(done){
    get('/api/v1/localhost:27017/test/scopes/aggregate')
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
