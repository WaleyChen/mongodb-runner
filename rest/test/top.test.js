var smongo = require('../lib/smongo'),
  connect = require('mongodb').MongoClient.connect,
  assert = require('assert');

describe('top', function(){
  var db;

  before(function(done){
    connect('mongodb://localhost', {}, function(err, res){
      if(err) return done(err);

      db = res;
      done();
    });
  });
  it('should work', function(done){
    smongo.createTopStream(db.admin(), {interval: 50}).on('error', done)
      .on('data', function(data){
        assert(data['admin.total_count'] === undefined,
          'should have excluded admin');

        var nans = Object.keys(data).filter(function(k){
          return isNaN(data[k]);
        });
        assert(nans.length === 0, 'should not contain NaNs: ' + nans);
        done();
      });
  });
});
