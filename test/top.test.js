'use strict';

var assert = require('assert'),
  helpers = require('./helpers'),
  get = helpers.get, post = helpers.post,
  debug = require('debug')('test:top');

describe('top', function(){
  it('should return initial data log');
});

// var smongo = require('../lib/smongo'),
//   connect = require('mongodb').MongoClient.connect,
//   assert = require('assert');

// describe('top', function(){
//   var db;

//   before(function(done){
//     connect('mongodb://localhost', {}, function(err, res){
//       if(err) return done(err);
//       db = res;
//       done();
//     });
//   });
//   it('should work', function(done){
//     smongo.createTopStream(db.admin(), {interval: 100}).on('error', done)
//       .on('data', function(res){
//         var adminKeys = Object.keys(res.deltas).filter(function(k){
//               return (/^admin/).test(k);
//             }),
//             nans = Object.keys(res.deltas).filter(function(k){
//               return isNaN(res.deltas[k]);
//             });
//         assert(res.namespaces.length > 0,
//           'no namespaces: ' + res.namespaces);

//         assert(Object.keys(res.deltas).length > 0,
//           'no deltas: ' + JSON.stringify(res.deltas));

//         assert(adminKeys.length === 0, 'exclude admin namespaces: ' + adminKeys);
//         assert(nans.length === 0, 'contains NaNs: ' + nans);
//         done();
//       });
//   });
// });
