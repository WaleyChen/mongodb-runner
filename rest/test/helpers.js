'use strict';

var supertest = require('supertest'),
  app = require('../lib/');

module.exports = {
  get: function(path){
    return supertest(app).get(path);
  },
  post: function(path){
    return supertest(app).post(path);
  },
  before: function(){},
  beforeEach: function(){},
  after: function(){},
  afterEach: function(){},
};
