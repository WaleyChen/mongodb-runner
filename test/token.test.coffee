assert = require 'assert'
helpers = require './helpers'
get = helpers.get
ctx = helpers.ctx
debug = require('debug') 'mongoscope:test:token'

describe 'token', ->
  describe 'errors', ->
    it 'should reject if no host included'
    it 'should reject if username included but not password'
