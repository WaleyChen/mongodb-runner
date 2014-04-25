var assert = require('assert'),
  helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  debug = require('debug')('mongoscope:test:replicaset');

describe('replica', function(){
  describe('standalone', function(){
    before(helpers.beforeWith({seed: 'mongodb://localhost:27017'}));
    after(helpers.after);
    it('should not explode', function(done){
      get('/api/v1/localhost:27017/replication')
        .set('Authorization', 'Bearer ' + ctx.token)
        .expect(400)
        .end(function(err, res){
          if(err) return done(err);
          debug('replication', res.body);
          done();
        });
    });
  });

  describe('replicaset', function(){
    it('should not explode');
  });

  describe('cluster', function(){
    describe('router', function(){
      before(helpers.beforeWith({seed: 'mongodb://localhost:30999'}));
      after(helpers.after);
      it('should not allow getting replication details through a router', function(done){
        get('/api/v1/localhost:30999/replication')
          .set('Authorization', 'Bearer ' + ctx.token)
          .expect(400)
          .end(function(err, res){
            debug('replication', res.text);
            if(err) return done(err);
            done();
          });
      });
    });
    describe('instance', function(){
      before(helpers.beforeWith({seed: 'mongodb://localhost:31100'}));
      after(helpers.after);
      // @todo: needs disambigation cleanup in `Deployment`.
      it.skip('should allow getting replication details through a shard', function(done){
        get('/api/v1/localhost:31100/replication')
          .set('Authorization', 'Bearer ' + ctx.token)
          .expect(200)
          .end(function(err, res){
            debug('replication', res.text);
            if(err) return done(err);
            done();
          });
      });
    });
  });
});
