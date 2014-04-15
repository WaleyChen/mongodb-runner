var helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  debug = require('debug')('mongoscope:test:host');

describe('host', function(){
  before(helpers.before);
  after(helpers.after);

  it('should get instance details', function(done){
    get('/api/v1/localhost:27107')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('detail', res.body);
        done();
      });
  });

  it('should get instance metrics', function(done){
    get('/api/v1/localhost:27107/metrics')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('metrics', res.body);
        done();
      });
  });
  it('should return in-progress operations', function(done){
    get('/api/v1/localhost:27107/ops')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('currentOp', res.body);
        done();
      });
    it('should return the oplog');
  });
});
