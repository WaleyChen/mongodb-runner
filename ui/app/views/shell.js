var Backbone = require('backbone'),
  ace = require('brace');

require('brace/mode/javascript');
require('brace/theme/monokai');

var Shell = Backbone.View.extend({
  initialize: function(){
    this.editor = ace.edit('javascript-editor');
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');
  },
  enter: function(){},
  exit: function(){}
});

module.exports = function(opts){
  return new Shell(opts);
};
