var Backbone = require('backbone'),
  ace = require('brace');

require('brace/mode/javascript');
require('brace/theme/monokai');

module.exports = Backbone.View.extend({
  initialize: function(){
    this.editor = ace.edit('javascript-editor');
    this.editor.getSession().setMode('ace/mode/javascript');
    this.editor.setTheme('ace/theme/monokai');
  },
  activate: function(){},
  deactivate: function(){}
});
