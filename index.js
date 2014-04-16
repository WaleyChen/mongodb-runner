var socketio = require('socket.io'),
  app = require('./lib'),
  nconf = require('nconf'),
  server = require('http').createServer(app);

app.server = server;

server.listen(nconf.get('port'), nconf.get('host'), function(){
  console.log('listening on ', nconf.get('host') + ':' + nconf.get('port'), arguments);
});
app.emit('io', socketio.listen(server));

module.exports = server;

