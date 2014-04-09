var helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  assert = require('assert'),
  debug = require('debug')('mongoscope:test:database');

describe('database', function(){
  before(helpers.before);
  after(helpers.after);

  it('should return database details', function(done){
    get('/api/v1/localhost:27107/test')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('detail', res.body);
        done();
      });
  });
});
