var Deployment = require('../lib/deployment'),
  assert = require('assert');

describe('deployment', function(){
  describe('standalone', function(){
    it('should identify localhost:27017 correctly');
  });

  describe('replicaset', function(){
    it('should identify localhost:6000 correctly');
    it('should not create another deployment for localhost:6001');
  });

  describe('cluster', function(){
    it('should discover all instances given a router', function(done){
      Deployment.create('mongodb://localhost:30999', function(err, d){
        if(err) return done(err);

        console.log(d);
        assert.equal(d._id, '25jf');
        assert.equal(d.seed, 'mongodb://localhost:30999');
        assert.equal(d.name, 'localhost:30999');
        assert.equal(d.getInstance({name: 'localhost:30999'}).type, 'router');

        assert(d.sharding);
        assert.equal(d.instances.length, 7);
        done();
      });
    });
    it('should discover all instances from a primary', function(done){
      Deployment.create('mongodb://localhost:31200', function(err, d){
        if(err) return done(err);

        assert.equal(d.maybe_sharded, true);
        assert.equal(d.sharding, undefined);
        done();
      });
    });
    it('should discover all instances from a secondary');
    it('should not create more than one deployment');
    it('should upgrade an existing replicaset deployment to a cluster');
  });
});
