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

        done();
      });
    });
    it('should discover all instances given a replicaset url');
    it('should discover all instances from a secondary');
  });
});
