helpers = require './helpers'
get = helpers.get
ctx = helpers.ctx
assert = require 'assert'
debug = require('debug') 'mongoscope:test:log'

describe 'log', ->
  before helpers.before
  after helpers.after

  it 'should return the global log', (done) ->
    get '/api/v1/localhost:27017/log'
      .set 'Authorization', "Bearer #{ctx.token}"
      .expect 200
      .end (err, res) ->
        return done(err) if(err)
        assert res.body.length > 10
        done()
