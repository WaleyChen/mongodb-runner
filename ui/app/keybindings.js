var mousetrap = require('mousetrap'),
  Backbone = require('Backbone');

mousetrap.bind('command+shift+p', function(){
  Backbone.history.navigate('connect', {trigger: true});
  return false;
});

mousetrap.bind('control+right', function(){
  Backbone.$('#host');
  return false;
});

