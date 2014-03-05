"use strict";

var forever = require('forever-monitor'),
  nconf = require('nconf'),
  util = require('util'),
  spawn = require('child_process').spawn,
  mongolog = require('./mongolog'),
  debug = require('debug')('mg:mongod');

module.exports = function(){
  debug('starting', nconf.get('mongod') + ' --dbpath ' + nconf.get('mongod_dbpath'));
  return new MongodMonitor({
    options: ['--dbpath', nconf.get('mongod_dbpath')],
    command: nconf.get('mongod'),
    max: 1
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
    mongolog.parse(data.split('\n')).map(function(line){
      if(line.message.length === 0) return;
      mongod.debug(line.message);

      if(line.event){
        debug('emitting', line.event);
        self.emit(line.event.name, line.event.data);
      }
    });
  });

  mongod.stdio[2].on('data', function (data){
    data.split('\n').map(function(line){
      if(line.length > 0) mongod.debugErr(line);
    });
  });

  self.on('error', function(err){
    console.error('error starting mongod:', err.message);
  });
  return mongod;
};
