var app = require('./lib'),
  nconf = require('nconf'),
  server = require('http').createServer(app),
  debug = require('debug')('mongoscope');

function Logger(opts){
  opts = opts || {};
  this.level = 3;
  this.enabled = true;
}
['log', 'error','warn','info','debug'].map(function(name){
  Logger.prototype[name] = function () {return false;};
});

app.server = server;

debug('trying to get server to listen', nconf.get('listen'));
server.listen(nconf.get('port'), nconf.get('hostname'), function(){
  debug('listening on ', nconf.get('hostname') + ':' + nconf.get('port'), arguments);
});
var io = require('socket.io').listen(server);

app.emit('io', io);
io.set('log level', 1);
io.set('transports', ['websocket', 'xhr-polling']);
io.set('logger', new Logger());

module.exports = server;

