var assert = require('assert'),
  helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  debug = require('debug')('mongoscope:test:index');

describe('api root', function(){
  before(helpers.before);
  after(helpers.after);

  it('should show a list of deployments', function(done){
    get('/api/v1/')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        debug('deployments', res.text);
        assert(res.body.length === 1);
        done();
      });
  });
});
