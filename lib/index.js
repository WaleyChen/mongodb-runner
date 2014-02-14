var Backbone = require('backbone'),
  debug = require('debug')('mongoscope');

module.exports = function(controllerMap){
  var _routes = {};
  Object.keys(controllerMap).map(function(path){
    _routes[path] = controllerMap[path].show.bind(controllerMap[path]);
    debug('add route: ' +  path, _routes[path].name);
  });

  new Backbone.Router({routes: _routes});
  Backbone.history.start();
};

module.exports.OneShot = Backbone.View.extend({
  initialize: function(opts){
    this.model = new Backbone.Model(opts.model);
    if(opts.parse) this.model.parse = opts.parse;
    opts.el = opts.el || '#mongomin';

    this.tpl = opts.tpl;
    this.$el = Backbone.$(opts.el);
    this.el = this.$el.get(0);

    this.model.url = function(){
      return 'http://' + window.location.hostname + ':3001/' + opts.source;
    };

    this.model.on('sync', this.render, this)
      .on('error', this.render, this);
  },
  show: function(){
    this.model.fetch({dataType: 'json'});
  },
  render: function(){
    var self = this;
    requestAnimationFrame(function(){
      debug('render model', self.model.toJSON());
      self.$el.html(self.tpl(self.model.toJSON()));
    });
    return self;
  }
});
