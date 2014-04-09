var Backbone = require('backbone');

module.exports = Backbone.View.extend({
  tpl: require('../templates/auth.jade'),
  initialize: function(){},
  activate: function(){
    this.$el = Backbone.$('#mongoscope');
    this.el = this.$el.get(0);
    this.$el.html(this.tpl({
      host: ''
    }));
  },
  deactivate: function(){},
  render: function(){}
});
