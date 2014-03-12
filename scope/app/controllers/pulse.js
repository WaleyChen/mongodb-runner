"use strict";

var Controller = require('../splint').Controller;

module.exports = Controller.extend({
  models: {
    instance: require('../models').instance
  },
  tpl: require('../templates/pulse.jade'),
  poller: null,
  events: function(){
    var self = this;
    this.on('rendered', function(){
      clearTimeout(self.poller);
      if(self.instance.get('database_names').length === 0){
        self.poller = setTimeout(function(){
          self.instance.fetch();
        }, 5000);
      }
    });
  }
});

