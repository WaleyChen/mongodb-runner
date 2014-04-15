var socketio = require('socket.io'),
  app = require('./lib'),
  nconf = require('nconf'),
  server = require('http').createServer(app);

app.server = server;

var io = socketio.listen(server);


server.listen(nconf.get('port'), nconf.get('host'));

console.log('Emitting io to app bus');
app.emit('io', io);

module.exports = server;

