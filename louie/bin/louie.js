#!/usr/bin/env node
var async = require('async'),
  yargs = require('yargs')
    .usage('Make mongoscope dance.\nUsage: $0')
    .default('u', 'http://localhost:29017')
    .alias('u', 'scope')
    .describe('u', 'root url of the scope to point at')
    .default('s')
    .alias('s', 'seed')
    .describe('s', 'seed mongo url to run commands against'),
  argv = yargs.argv,
  d3 = require('d3');

if(argv.help) return yargs.showHelp();

var louie = require('../index'),
  client = louie(argv);

var dbs = [],
  colls = {},
  namespaces = {},
  rands = {};


client.listDatabases(function(err, names){
  dbs = names;
  async.parallel(names.map(function(name){
    return function(cb){
      client.getCollectionNames(name, function(err, cs){
        if(cs.indexOf('system') > -1) return;
        colls[name] = cs;
        cs.map(function(coll){
          rands[name + '.' + coll] = d3.random.logNormal(1, 10);
          namespaces[name + '.' + coll] = {db: name, collection: coll};
        });
        cb(err);
      });
    };
  }), function(err){
    if(err) throw err;

    async.parallel(
    Object.keys(rands).map(function(ns){
      return function(){
        var attack = function(){
          console.log('ATTACK');
          var start = Date.now();

          client.count(namespaces[ns].db, namespaces[ns].collection, {}, function(){
            console.log(' - took ' +  (Date.now() - start) + 'ms', arguments);
            schedule();
          });
        };

        var schedule = function(){
          var wait = Math.round(rands[ns]());
          if(wait <= 0){
            console.log('will check again in ' + (Math.max(wait, 3) * 1000) +
              'ms if we should attack ' + ns);
            return setTimeout(schedule, Math.max(wait, 1) * 1000);
          }
          attack();
        };

        schedule();
      };
    }));
  });
});

