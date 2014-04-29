helpers = require './helpers'
debug = require('debug') 'mongoscope:test:instance'

get = (path) ->
  return helpers.get "/api/v1#{path}"
    .set 'Authorization', "Bearer #{helpers.ctx.token}"

describe 'When connecting to a standalone deployment', ->
  before helpers.before
  after helpers.after

  it 'should get instance details', (done) ->
    get '/localhost:27017'
      .expect 200
      .end (err, res)->
        return done(err) if err
        done()

  it 'should get instance metrics', (done) ->
    get '/localhost:27017/metrics'
      .expect 200
      .end (err, res)->
        return done(err) if err
        done()

  it 'should return in-progress operations', (done) ->
    get '/localhost:27017/ops'
      .expect 200
      .end (err, res)->
        return done(err) if err
        done()

  it 'should fetch the log @todo'
