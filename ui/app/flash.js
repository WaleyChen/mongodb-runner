var $ = require('jquery'),
  debug = require('debug')('flash');

var messages = {};

function flash(msg, cls){
  cls = cls || 'info';

  var el = $('<div class="message" style="display: none;"/>');
  el.text(msg);
  if(cls) el.addClass(cls);
  $('#status .flash').append(el);
  el.fadeIn();

  if(cls !== 'error'){ // Errors must be manually cleared.
    debug('');
    el.hideTimeout = setTimeout(function(){
      flash.clear(msg);
    }, 5000);
  }

  if(!messages[msg]) messages[msg] = [];

  messages[msg].push(el);
  return flash;
}

flash.clear = function(message){
  var el = messages[message].shift();
  el.fadeOut('slow', function(){
    clearTimeout(el.hideTimeout);
    el.remove();
  });
};

module.exports = flash;

['error', 'info', 'success', 'warning'].map(function(level){
  module.exports[level] = function(msg){
    return flash(msg, level);
  };
});
