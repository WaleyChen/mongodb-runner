var Backbone = require('backbone'),
  ConnectModal = require('./auth').ConnectModal,
  models = require('../models'),
  srv = require('../service'),
  debug = require('debug')('mongoscope:connect');

//@todo: Switch view -> Just a hook from URL to service config.


var Create = ConnectModal.extend({
  autoConnect: false
});

module.exports.switch = function(){
  var view = new Create();
  return view;
};

module.exports.create = function(){
  var view = new Create();
  view.on('success', function(){
    view.$body.removeClass('connect');
  });
  return view;
};
