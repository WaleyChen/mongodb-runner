// Main entrypoint for mongomin.
//
// @author Lucas Hrabovsky<lucas@mongo.com>

// By default we'll use jquery to drive the DOM from backbone,
// but we could easily switch to zepto instead.
require('backbone').$ = require('jquery');

require('debug').enable('*');

// So simple when you just use inheritance and things that already exist,
// instead of, you know, rewriting all of those things.  JK directives and
// services are a terrible idea.
var splint = require('./lib'),
  controllers = require('./controllers');

module.exports = splint({
  '': controllers.diagnostics,
  'dbs': controllers.databases,
  'health': controllers.diagnostics
});
