// Main entrypoint for mongoscope.
//
// @author Lucas Hrabovsky<lucas@mongodb.com>

// By default we'll use jquery to drive the DOM from backbone,
// but we could easily switch to zepto instead.
require('backbone').$ = require('jquery');
require('debug').enable('*');

require('./models')({host: '127.0.0.1'});

module.exports = require('./controllers')({});
