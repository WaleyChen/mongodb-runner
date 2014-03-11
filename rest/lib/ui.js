var express = require('express');

module.exports.routes = function(app){
  app.use(express.static(__dirname + '/static'));
};
