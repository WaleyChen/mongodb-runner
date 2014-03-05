#!/usr/bin/env node
"use strict";

var rest = require('../rest'),
  mongod = require('../rest/lib/mongod');

mongod().on('ready', function(){
  rest.start();
});
