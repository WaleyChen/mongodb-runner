var express = require('express'),
  app = module.exports = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

app.use(express.errorHandler());

module.exports = app;
module.exports.server = server;
module.exports.io = io;
