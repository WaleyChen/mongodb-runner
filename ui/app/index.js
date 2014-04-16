// Main entrypoint for mongoscope.
//
// @author Lucas Hrabovsky<lucas@mongodb.com>

// @todo: This should use sterno to load updates.
// var sterno = require('sterno'),
//   origin = localStorage.getItem('mongoscope:origin') || 'http://10gen.github.io/mongoscope',
//   // origin = localStorage.getItem('mongoscope:origin') || 'http://mongoscope.dev',
//   assets = JSON.parse(localStorage.getItem('mongoscope:assets') || '["/index.js", "/index.css"]');
// sterno(origin, assets);

require('debug').enable('m*');

// By default we'll use jquery to drive the DOM from backbone,
// but we could easily switch to zepto instead.
window.jQuery = require('backbone').$ = require('jquery');

// Pull in any bootstrap plugins
require('bootstrap/js/tooltip.js');
require('bootstrap/js/popover.js');
require('bootstrap/js/dropdown.js');
require('bootstrap/js/modal.js');

var routes = require('./routes'),
  debug = require('debug')('mongoscope');

require('./models')({
  error: function(deployments, err){
    window.jQuery('body').removeClass('loading');

    if(err.status === 401){
      debug('got 401.  triggering auth modal');
      return routes({auth: true});
    }

    debug('unexpected initialization error...');
    throw err;
  },
  success: function(){
    return routes({});
  }
});

require('./views/toolbar')();
