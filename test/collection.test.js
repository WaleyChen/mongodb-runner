var helpers = require('./helpers'),
  ctx = helpers.ctx,
  assert = require('assert'),
  debug = require('debug')('mongoscope:test:collection');

function get(path){
  return helpers
    .get('/api/v1' + path)
    .set('Authorization', 'Bearer ' + ctx.token);
}

function fin(name, done){
  return function(err, res){
    debug(name, res.body);
    if(err) return done(err);
    done();
  };
}
describe('collection', function(){

  describe('standalone', function(){
    before(helpers.before);
    after(helpers.after);

    it('should not create collections automatically', function(done){
      get('/localhost:27017/test/scopes').expect(404)
        .end(fin('detail', done));
    });

    it('should return collection details', function(done){
      helpers.createCollection('scopes', function(){
        get('/localhost:27017/test/scopes')
        .expect(200).end(fin('detail', done));
      });
    });
    it('should be able to run find', function(done){
      get('/localhost:27017/test/scopes/find')
      .expect(200)
        .end(function(err, res){
          if(err) return done(err);
          debug('find', res.body);
          assert(res.body.length === 1, 'should have got the dummy insert');
          done();
        });
    });
    it('should be able to run count', function(done){
      get('/localhost:27017/test/scopes/count')
        .expect(200)
        .end(function(err, res){
          if(err) return done(err);

          debug('count', res.body);
          assert(res.body.count === 1, 'should have got the dummy insert');
          done();
        });
    });

    it('should be able to run find with explain', function(done){
      get('/localhost:27017/test/scopes/find').query({explain: 1})
        .expect(200)
        .end(function(err, res){
          debug('explain', res.body);
          if(err) return done(err);
          assert(res.body.cursor === 'BasicCursor');
          done();
        });
    });

    it('should be able to run aggregate', function(done){
      get('/localhost:27017/test/scopes/aggregate')
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

  describe('router', function(){
    it('should not explode');
  });

  describe('arbiter', function(){
    it('should not explode');
  });
});
