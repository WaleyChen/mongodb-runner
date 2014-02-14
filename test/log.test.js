var assert = require('assert'),
  fixtures = require('./fixtures/log/global_raw.js'),
  roar = require('../lib/roar');

describe('log', function(){
  it('should expand the example line', function(){
    var result = roar('mongodbLogLine', fixtures[0]);
    assert.equal(result.name, 'initandlisten');
    assert.equal(result.date, '2014-02-13T18:00:04.708-0500');
    assert.equal(result.message, 'MongoDB starting : pid=34494 port=27017 dbpath=/srv/mongo/data/ 64-bit host=Lucass-MacBook-Air.local');
  });
});
