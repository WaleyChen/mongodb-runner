var mousetrap = require('mousetrap'),
  Backbone = require('Backbone'),
  Connect = require('./views/connect');

mousetrap.bind('command+shift+p', function(){
  Connect.toggle();
  return false;
});

mousetrap.bind('control+right', function(){
  Backbone.$('#host');
  return false;
});

