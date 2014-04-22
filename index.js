var socketio = require('socket.io'),
  app = require('./lib'),
  nconf = require('nconf'),
  server = require('http').createServer(app),
  debug = require('debug')('mongoscope');

app.server = server;

debug('trying to get server to listen', nconf.get('listen'));
server.listen(nconf.get('port'), nconf.get('hostname'), function(){
  debug('listening on ', nconf.get('hostname') + ':' + nconf.get('port'), arguments);
});
app.emit('io', socketio.listen(server));

module.exports = server;

