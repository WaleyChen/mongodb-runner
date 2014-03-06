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
    smongo.createTopStream(db.admin(), {interval: 10}).on('error', done)
      .on('data', function(data){
        var adminKeys = Object.keys(data).filter(function(k){
              return (/^admin/).test(k);
            }),
            nans = Object.keys(data).filter(function(k){
              return isNaN(data[k]);
            });

        assert(adminKeys.length === 0, 'exclude admin namespaces: ' + adminKeys);
        assert(nans.length === 0, 'contains NaNs: ' + nans);
        done();
      });
  });
});