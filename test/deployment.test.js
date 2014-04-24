describe('deployment', function(){
  describe('standalone', function(){
    it('should identify localhost:27017 correctly');
  });

  describe('replicaset', function(){
    it('should identify localhost:6000 correctly');
    it('should not create another deployment for localhost:6001');
  });

  describe('cluster', function(){
    it('should discover all instances given a router');
    it('should discover all instances given a replicaset url');
    it('should discover all instances from a secondary');
  });
});
