var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  debug = require('debug')('mongoscope:security');

// Action Model-ish, cuz all are not created equal.
//
// level:
// - 0: hidden
// - 1: highlight
// - 2: info
// - 3: warn
var ACTIONS = require('../templates/security/privilege-actions.json');

var detail = {
  templates: {
    user: require('../templates/security/user.jade'),
    role: require('../templates/security/role.jade')
  },
  klass: {
    user: models.Security.User,
    role: models.Security.Role
  }
};

var DetailView = Backbone.View.extend({
  initialize: function(opts){
    this.type = opts.type;
    this.parent = opts.parent;

    this.model = new(detail.klass[this.type])()
      .on('sync', this.render, this)
      .on('change', this.modelChange, this);

    this.tpl = detail.templates[this.type];
    this.fetch = this.model.fetch.bind(this.model);
    this.set = this.model.set.bind(this.model);
  },
  modelChange: function(){
    debug(this + ' model changed!', arguments);
    this.fetch();
  },
  // Parent telling us to render.
  show: function(data){
    debug(this + ' updating model ', data);
    this.set(data);
    this.render();
  },
  // Router telling us to render, in which case we need to have the
  // parent circle back to us when our containing dom is ready.
  activate: function(db, _id){
    debug('activate ' + this, db, _id);
    if(this.type === 'user'){
      this.set({database: db, username: _id});
    }
    else {
      this.set({db: db, role: _id});
    }
    debug('fetching and then waiting for parent');
    this.fetch();

    // this.router.trigger('route', 'security');
    this.parent.activate(this);
  },
  toString: function(){
    return 'DetailView('+this.type+')';
  },
  deactivate: function(){
    this.parent.deactivate();
  },
  render: function(){
    this.$el = $('.details');

    var ctx = {};
    ctx[this.type] = this.model.toJSON();
    ctx.ACTIONS = ACTIONS;

    debug('render ' + this, ctx[this.type]);

    this.$el.html(this.tpl(ctx));

    $('.pop').popover({container: this.$el});
  }
});

module.exports = Backbone.View.extend({
  events: {
    'click .list-group a': 'markSelected'
  },
  tpl: require('../templates/security.jade'),
  initialize: function(){
    this.$el = $('#mongoscope');
    this.el = this.$el.get(0);

    this.active = false;
    this.pending = null;

    this.userDetail = new DetailView({type: 'user', parent: this});
    this.roleDetail = new DetailView({type: 'role', parent: this});

    this.security = new models.Security()
      .on('sync', this.render, this);
  },
  markSelected: function(e){
    debug('mark selected', e.target, e);

    var lg = this.$el.find('.list-group');
    lg.find('a.selected').removeClass('selected');
    $(e.currentTarget).addClass('selected');
  },
  activate: function(child){
    this.pending = child;
    this.security.fetch();
  },
  deactivate: function(){
    this.active = false;
  },
  render: function(){
    if(!this.active){
      debug('not active yet, so rendering full page scope');
      this.$el.html(this.tpl(this.security.toJSON()));
      this.active = true;
    }

    var users = this.security.get('users');
    if(this.pending){
      debug('popping pending detail view', this.pending);
      this.pending.show();
      this.pending = null;
    }
    else if(users.length > 0){
      debug('switching to first user', users[0]);
      this.userDetail.show(users[0]);
    }
    return this;
  }
});

