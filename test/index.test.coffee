assert = require 'assert'
helpers = require './helpers'
get = helpers.get
ctx = helpers.ctx
debug = require('debug') 'mongoscope:test:index'

describe 'api root', ->
  before helpers.before
  after helpers.after

  it 'should show a list of deployments', (done) ->
    get '/api/v1/'
      .set 'Authorization', "Bearer #{helpers.ctx.token}"
      .expect 200
      .end (err, res) ->
        return done(err) if err
        done()
