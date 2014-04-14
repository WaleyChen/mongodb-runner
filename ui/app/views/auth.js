var Backbone = require('backbone'),
  $ = Backbone.$,
  mongodb = require('../mongodb'),
  service = require('../service')(),
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
  initialize: function(){
    this.redirect = window.location.hash.replace('#', '').replace('authenticate', '') || 'pulse';
    this.history = new History().on('sync', this.historySync, this);
    this.history.fetch();
    debug('auth redirect is', this.redirect);
  },
  historySync: function(){
    debug('historySync', this.history);
  },
  enter: function(){
    debug('auth enterd');

    var self = this;
    this.dirty = false;
    $('#modal').modal({backdrop: 'static', keyboard: false});
    this.render({host: 'localhost:27017'});

    if(this.history.length > 0){
      var previous = this.history.at(0);
      debug('trying last used host', previous);
      this.$host.text(previous.get('host'));
      this.process(previous.get('host'), previous.get('id'));
    }

    this.$host.focus().on('keydown', function(){
        debug('keydown', event);
        self.reset();
        if(event.keyIdentifier === 'Enter'){
          self.submit();
          return false;
        }
        // @todo: more key code handlers:
        //  - up/down -> cycle history
        if(event.keyIdentifier === 'Up'){

        }

        if(event.keyIdentifier === 'Down'){

        }
        //  - esc -> clear
        if(event.keyIdentifier === 'U+001B'){
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
      });
    return this;
  },
  error: function(err){
    this.dirty = true;
    console.error('err', err);
    this.$message.text(err.message).fadeIn();
    this.$form.addClass('has-error');
  },
  loading: function(msg){
    debug('loading', msg);
    return this;
  },
  success: function(){
    if(this.redirect === 'authenticate'){
      this.redirect = 'pulse';
    }
    // $('.modal-backdrop').fadeOut({duration: 1000});

    $('#modal').modal('hide');
    $('body').removeClass('authenticate');


    debug('success!  redirecting to ', this.redirect);
    models.instance.fetch();
    Backbone.history.navigate(this.redirect, {trigger: true});
    return this;
  },
  process: function(url, id){
    try{
      var data = mongodb.parse('mongodb://' + url),
        server;

      if(data.servers.length === 0){
        throw new Error('Please specify at least one server');
      }

      server = data.servers[0];

      debug('getting token for hostnameport');

      this.loading('requesting access');
      service.setCredentials('mongodb://' + url, function(err){
        if(err) return this.error(err);

        if(!id){
          new Credentials({
            host: this.$host.text()
          }).save();
        }

        return this.success();
      }.bind(this));
    }
    catch(err){
      this.error(err);
    }
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
  deenter: function(){

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
  }
});

module.exports = function(opts){
  if(!instance){
    instance = new Auth(opts);
  }
  return instance;
};
