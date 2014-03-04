#!/usr/bin/env node
"use strict";

var app = require('../');
require('../lib/mongod')().on('ready', function(){
  app.start();
});
