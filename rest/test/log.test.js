'use strict';

var helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  assert = require('assert'),
  debug = require('debug')('test:log');

describe('log', function(){
  before(helpers.before);
  after(helpers.after);

  it('should return the global log', function(done){
    get('/api/v1/localhost:27017/log')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('log tail', res.body.slice(res.body.length - 5));
        assert(res.body.length > 10);
        done();
      });
  });
});
