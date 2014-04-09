// Main entrypoint for mongoscope.
//
// @author Lucas Hrabovsky<lucas@mongodb.com>

// By default we'll use jquery to drive the DOM from backbone,
// but we could easily switch to zepto instead.
window.jQuery = require('backbone').$ = require('jquery');

require('bootstrap/js/tooltip.js');
require('bootstrap/js/popover.js');
require('bootstrap/js/dropdown.js');

require('debug').enable('*');

module.exports = require('./controllers')({});
