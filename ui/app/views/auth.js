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
  redirect: null,
  initialize: function(){
    if(window.location.hash.indexOf('#mongodb/') === 0){
      this.url = window.location.hash.replace('#mongodb/', '');
    }
    else {
      this.redirect = window.location.hash.replace('#', '');
      if(this.redirect === 'authenticate'){
        this.redirect = null;
      }
    }
    this.history = new History();
    this.history.cursor = 0;
    this.history.fetch();
  },
  enter: function(deploymentId, instanceId){
    this.$body = $('body');
    var dep, instance;
    console.log('enter', this.redirect);
    if(this.redirect && /\w+\:\d+\//.test(this.redirect)){
      this.url = this.redirect.split('/')[0];
      this.jump = true;
    }

    if(deploymentId && (dep = models.deployments.get(deploymentId))){
      instance = dep.getInstance(instanceId) || dep.getSeedInstance();
    }

    this.dirty = false;

    if(instance){
      debug('instance is', instance);
      this.process(instance.id);
    }
    else if(this.jump){
      debug('jump to', this.url);
      this.process(this.url);
      this.jump = false;
    }
    else if(this.history.length > 0 && this.autoConnect && !instance){
      debug('resuming last connection');
      this.resume();
    }
    else {
      debug('expecting input');
      this.show();
    }
    this.trigger('enter');
    return this;
  },
  show: function(){
    this.$modal = $('#modal');
    this.$modal.modal({backdrop: 'static', keyboard: false});
    this.render({url: (instance && instance.id) || this.url || 'localhost:27017'});
    this.delegateInputEvents();
    this.visible = true;
  },
  resume: function(){
    var previous = this.history.at(0);
    debug('trying last used', previous);
    this.process(previous.get('instance_id'), previous.get('id'));
  },
  error: function(err){
    this.show();
    this.dirty = true;
    this.$message.text(err.message).fadeIn();
    this.$form.addClass('has-error');
    this.trigger('error');
  },
  exit: function(){
    this.$body.removeClass('authenticate');

    if(this.visible){
      this.$modal.modal('hide');
      this.undelegateEvents();
      this.undelegateInputEvents();
      this.visible = false;
    }
    this.trigger('exit');
  },
  loading: function(msg){
    debug('loading', msg);
    return this;
  },
  success: function(instance_id){
    this.exit();
    debug('redirecting to', 'mongodb/' + instance_id);
    Backbone.history.navigate(this.redirect || 'mongodb/' + instance_id, {trigger: true});
    return this;
  },
  process: function(instance_id, id){
    models.connect(instance_id, function(err, res){
      if(err) return this.error(err);

      instance_id = res.instance.id;

      if(id) return this.success(instance_id);

      var creds = new Credentials({instance_id: instance_id, id: instance_id});
      creds.save();
      this.history.add(creds);

      this.success(instance_id);
    }.bind(this));
  },
  cancel: function(){
    return this.success();
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
    this.$el.css({'margin-top': '20%'});

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
        if(self.history.length === 0) return;
        if(self.history.cursor === self.history.length){
          return;
        }

        self.$host.text(self.history.at(self.history.cursor).get('instance_id'));
        self.history.cursor++;
        return false;
      }
      //  - esc -> clear
      if(event.keyIdentifier === 'U+001B'){
        if(self.closeable) return self.cancel();
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
