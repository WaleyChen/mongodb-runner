var app = require('./lib'),
  server = require('http').createServer(app);
app.set('io', require('socket.io').listen(server));

module.exports = server;

