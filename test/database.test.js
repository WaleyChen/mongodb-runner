var helpers = require('./helpers'),
  get = helpers.get, ctx = helpers.ctx,
  debug = require('debug')('mongoscope:test:database');

describe('database', function(){
  before(helpers.before);
  after(helpers.after);

  it('should return database details', function(done){
    get('/api/v1/localhost:27017/test')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);

        debug('detail', res.body);
        done();
      });
  });

  it('should return default profiling info', function(done){
    get('/api/v1/localhost:27017/test/profiling')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        if(err) return done(err);
        debug('profiling', res.body);
        done();
      });
  });

  it('should return profiling entries', function(done){
    get('/api/v1/localhost:27017/test/profiling/entries')
      .set('Authorization', 'Bearer ' + ctx.token)
      .expect(200)
      .end(function(err, res){
        debug('profiling entries', res.body);
        if(err) return done(err);
        done();
      });
  });
});
