var assert = require('assert'),
  helpers = require('./helpers'),
  debug = require('debug')('mongoscope:test:replicaset');

describe('replica', function(){
  describe('standalone', function(){
    it('should not explode');
  });

  describe('replicaset', function(){
    it('should not explode');
  });

  describe('cluster', function(){
    describe('router', function(){
      it('should not explode');
    });
    describe('instance', function(){
      it('should not explode');
    });
  });
});
