var Backbone = require('backbone'),
  context = require('../models').context;

var Theme = Backbone.View.extend({
  enter: function(theme){
    Backbone.$('link[rel="stylesheet"]:first').attr('href', 'css/'+theme+'.css');
    Backbone.history.navigate('mongodb/' + context.get('deployment_id') + '/' + context.get('instance_id'), {trigger: true});
  },
  exit: function(){}
});

module.exports = function(){
  return new Theme();
};
