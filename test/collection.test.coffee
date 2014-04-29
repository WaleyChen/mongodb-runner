helpers = require './helpers'
ctx = helpers.ctx
assert = require 'assert'
debug = require('debug') 'mongoscope:test:collection'

get = (path) ->
  return helpers.get "/api/v1#{path}"
    .set 'Authorization', "Bearer #{ctx.token}"

describe 'When connection to a standalone deployment', ->
  before helpers.before
  after helpers.after

  it 'should not create collections automatically', (done) ->
    get '/localhost:27017/test/scopes'
      .expect 404
      .end  (err, res) -> done err, res.body

  it 'should return collection details', (done) ->
    helpers.createCollection 'scopes',    ->
      get '/localhost:27017/test/scopes'
      .expect 200
      .end (err, res) -> done err, res.body

  it 'should be able to run find', (done) ->
    get '/localhost:27017/test/scopes/find'
      .expect 200
      .end (err, res) ->
        return done err if err
        assert res.body.length is 1, 'should have got the dummy insert'
        done()

  it 'should be able to run count', (done) ->
    get '/localhost:27017/test/scopes/count'
      .expect 200
      .end (err, res) ->
        return done err if err
        assert res.body.count is 1, 'should have got the dummy insert'
        done()

  it 'should be able to run find with explain', (done) ->
    get '/localhost:27017/test/scopes/find'
      .query {explain: 1}
      .expect 200
      .end (err, res) ->
        return done err if err
        assert res.body.cursor is 'BasicCursor'
        done()

  it 'should be able to run aggregate', (done) ->
    pipeline = JSON.stringify [{$group: {_id: '$_id'}}]
    get '/localhost:27017/test/scopes/aggregate'
      .query {pipeline: pipeline}
      .expect 200
      .end (err, res) ->
        return done err if err
        assert res.body.length is 1
        done()

  it 'should do a basic distinct'
  it 'should list query plan shapes'

describe 'When connecting to a router', ->
  it 'should not explode'

describe 'When connecting to an arbiter', ->
  it 'should not explode'
