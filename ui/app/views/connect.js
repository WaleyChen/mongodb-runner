var Backbone = require('backbone'),
  ConnectModal = require('./auth').ConnectModal,
  debug = require('debug')('mongoscope:connect');

//@todo: Switch view -> Just a hook from URL to service config.


var Create = ConnectModal.extend({
});

module.exports.switch = function(){
  return new Create();
};

module.exports.create = function(){
  return new Create();
};
