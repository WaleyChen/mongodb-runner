var Backbone = require('backbone'),
  $ = Backbone.$,
  models = require('../models'),
  sessionStore = require('../sessionStore').backbone('auth'),
  debug = require('debug')('mongoscope:auth'),
  instance = null;


var Credentials = Backbone.Model.extend({
    sync: sessionStore.sync
  }),
  History = Backbone.Collection.extend({
    model: Credentials,
    sync: sessionStore.sync
  });

var Auth = Backbone.View.extend({
  tpl: require('./tpl/auth.jade'),
  events: {
    'keydown #host': 'keydown',
    'click button': 'submit'
  },
  els: {
    host: '#host',
    form: 'form',
    message: '.message'
  },
  autoConnect: true,
  jump: false,
  visible: false,
  closeable: false,
  url: 'localhost:27017',
  initialize: function(){
    this.redirect = window.location.hash.replace('#', '') || 'home';
    if(this.redirect.indexOf('connect/') === 0){
      this.url = this.redirect.replace('connect/', '');
      this.jump = true;
    }
    this.history = new History();
    this.history.cursor = 0;
    this.history.fetch();
  },
  enter: function(deploymentId, instanceId){
    this.$body = $('body');
    this.$modal = $('#modal');

    debug('showing auth', deploymentId, instanceId);

    var dep, instance;
    if(deploymentId && (dep = models.deployments.get(deploymentId))){
      instance = dep.getInstance(instanceId) || dep.getSeedInstance();
    }
    this.dirty = false;
    this.$modal.modal({backdrop: 'static', keyboard: false});
    this.render({url: (instance && instance.id) || this.url});

    if(this.jump){
      this.process(this.url);
    }
    else if(instance){
      this.process(instance.id);
    }
    else if(this.history.length > 0 && this.autoConnect && !instance){
      this.resume();
    }
    this.delegateInputEvents();
    this.visible = true;
    this.trigger('enter');
    return this;
  },

  resume: function(){
    var previous = this.history.at(0);
    debug('trying last used', previous);
    this.$host.text(previous.get('instance_id'));
    this.process(previous.get('instance_id'), previous.get('id'));
  },
  error: function(err){
    this.dirty = true;
    this.$message.text(err.message).fadeIn();
    this.$form.addClass('has-error');
    this.trigger('error');
  },
  exit: function(){
    this.$modal.modal('hide');
    this.$body.removeClass('authenticate');
    this.undelegateEvents();
    this.undelegateInputEvents();
    this.visible = false;
    this.trigger('exit');
  },
  loading: function(msg){
    debug('loading', msg);
    return this;
  },
  success: function(){
    if(this.redirect === 'authenticate' || this.redirect.indexOf('connect') === 0){
      this.redirect = 'home';
    }
    this.exit();
    debug('success!  redirecting to ', this.redirect);
    Backbone.history.navigate(this.redirect, {trigger: true});
    return this;
  },
  process: function(instance_id, id){
    models.connect(instance_id, function(err, res){
      if(err) return this.error(err);

      instance_id = res.instance.id;

      if(id) return this.success();

      var creds = new Credentials({instance_id: instance_id, id: instance_id});
      creds.save();
      this.history.add(creds);

      this.success();
    }.bind(this));
  },
  submit: function(){
    this.reset();
    this.process(this.$host.text());
    return false;
  },
  reset: function(){
    if(!this.dirty) return this;

    debug('reset');
    this.$message.fadeOut();
    this.$form.removeClass('has-error').removeClass('has-warning');
    this.dirty = false;
    return this;
  },
  render: function(ctx){
    this.$el = $('#modal');
    this.$el.html(this.tpl(ctx));
    this.$el.animate({'margin-top': '20%'});

    this.findElements();
    this.delegateEvents();
    return this;
  },
  findElements: function(){
    Object.keys(this.els).map(function(name){
      this['$' + name] = this.$el.find(this.els[name]);
    }.bind(this));
    return this;
  },
  delegateInputEvents: function(){
    var self = this;

    this.$host.focus().on('keydown', function(){
      self.reset();
      debug('keydown', event.keyIdentifier);
      if(event.keyIdentifier === 'Enter'){
        self.submit();
        return false;
      }
      // @todo: more key code handlers:
      //  - up/down -> cycle history
      if(event.keyIdentifier === 'Up'){
        if(self.history.length === 0) return;

        if(self.history.cursor > 0){
          self.history.cursor--;
        }
        self.$host.text(self.history.at(self.history.cursor).get('instance_id'));
        return false;
      }

      // tab -> toggle text selection betwen hostname and port
      if(event.keyIdentifier === 'Tab'){

      }

      if(event.keyIdentifier === 'Down'){
        if(self.history.length === 0) return debug('no history');
        if(self.history.cursor === self.history.length){
          return;
        }

        self.$host.text(self.history.at(self.history.cursor).get('instance_id'));
        self.history.cursor++;
        return false;
      }
      //  - esc -> clear
      if(event.keyIdentifier === 'U+001B'){
        if(self.closeable) return self.exit();
        self.$host.text('');
        return false;
      }
      //  - keyIdentifier = CapsLock -> show warning
      // only get these events when caps lock turned on, not off.
      if(event.keyIdentifier === 'CapsLock'){
        self.$message.text('CAPS LOCK').fadeIn();
        self.$form.addClass('has-warning');
        self.dirty = true;
        setTimeout(self.reset.bind(self), 2000);
        return false;
      }
      return true;
    });
  },
  undelegateInputEvents: function(){
    this.$host.off('keydown');
  }
});

module.exports = function(opts){
  if(!instance){
    instance = new Auth(opts);
  }
  return instance;
};

module.exports.ConnectModal = Auth;
module.exports.History = History;
