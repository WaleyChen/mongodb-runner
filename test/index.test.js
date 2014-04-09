var assert = require('assert'),
  helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  debug = require('debug')('mongoscope:test:index');

describe('api root', function(){
  before(helpers.before);
  after(helpers.after);

  it('should require a token', function(done){
    get('/api/v1/').expect(401, done);
  });

  it('should reject a malformed Authorization header', function(done){
    get('/api/v1/').set('Authorization', 'open sesame').expect(400, done);
  });

  it('should reject an invalid token', function(done){
    get('/api/v1/').set('Authorization', 'Bearer opensesame').expect(403, done);
  });

  it('should show a list of deployments', function(done){
    get('/api/v1/')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        debug('deployments', res.body);
        assert(res.body.length === 1);
        done();
      });
  });
});
