"use strict";

var forever = require('forever-monitor'),
  nconf = require('nconf'),
  util = require('util'),
  spawn = require('child_process').spawn,
  debug = require('debug')('mg:mongod');

module.exports = function(){
  debug('starting', nconf.get('mongod') + ' --dbpath ' + nconf.get('mongod_dbpath'));
  return new MongodMonitor({
    options: ['--dbpath', nconf.get('mongod_dbpath')],
    command: nconf.get('mongod'),
    max: 3
  }).on('exit', function(){
    debug('failed to start');
  }).start();
};

function MongodMonitor(opts){
  opts.checkFile = false;
  opts.fork = true;
  opts.silent = true;
  forever.Monitor.call(this, 'mongod', opts);
}
util.inherits(MongodMonitor, forever.Monitor);

MongodMonitor.prototype.trySpawn = function(){
  var opts = {
      cwd: this.cwd,
      env: this._getEnv(),
      stdio: ['pipe', 'pipe', 'pipe', 'ipc' ]
    }, self = this, mongod;

  if(this.args[0] === 'mongod'){
    this.args.shift();
  }
  mongod = spawn(this.command, this.args, opts);
  mongod.debug = require('debug')('mg:mongod:log');
  mongod.debugErr = require('debug')('mg:mongod:errorlog');

  mongod.stdio[1].setEncoding('utf8');
  mongod.stdio[2].setEncoding('utf8');

  mongod.stdio[1].on('data', function (data){
    data.split('\n').map(function(line){
      if(line.length > 0){
        mongod.debug(line);
        if(line.indexOf('waiting for connections') > -1){
          debug('sending ready');
          self.emit('ready');
        }
        else if(line.indexOf('exception') > -1){
          mongod.debugErr(line);
        }
      }
    });
  });

  mongod.stdio[2].on('data', function (data){
    data.split('\n').map(function(line){
      if(line.length > 0) mongod.debugErr(line);
    });
  });

  return mongod;
};
