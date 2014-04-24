var ConnectModal = require('./auth').ConnectModal;

var Create = ConnectModal.extend({
  autoConnect: false,
  closeable: true
});

var view;

function getView(){
  if(view) return view;
  view = new Create()
    .on('enter', function(){
      view.$body.addClass('connect');
    })
    .on('exit', function(){
      view.$body.removeClass('connect');
    });
  return view;
}

module.exports.switch = function(){
  return getView();
};

module.exports.create = function(){
  return getView();
};

module.exports.toggle = function(){
  if(view.visible){
    view.exit();
  }
  else {
    view.enter();
  }
  return view;
};

