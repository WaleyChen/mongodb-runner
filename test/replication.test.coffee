assert = require 'assert'
helpers = require './helpers'
get = helpers.get
ctx = helpers.ctx
debug = require('debug') 'mongoscope:test:replicaset'

describe 'When connecting to a standalone deployment', ->
  before helpers.beforeWith({seed: 'mongodb://localhost:27017'})
  after helpers.after
  it 'should not explode', (done) ->
    get('/api/v1/localhost:27017/replication')
      .set 'Authorization', "Bearer #{ctx.token}"
      .expect(400)
      .end (err, res) ->
        return done(err) if err
        done()

describe 'When connecting to a replicaset deployment', ->
  it 'should not explode'

describe 'When connecting to a router in a cluster deployment', ->
  before helpers.beforeWith({seed: 'mongodb://localhost:30999'})
  after helpers.after

  it 'should not allow getting replication details through a router', (done) ->
    get '/api/v1/localhost:30999/replication'
      .set 'Authorization', "Bearer #{ctx.token}"
      .expect 400
      .end (err, res) ->
        return done(err) if err
        done()

describe 'When connecting to a shard in a cluster deployment', ->
  before helpers.beforeWith({seed: 'mongodb://localhost:31100'})
  after helpers.after

  it 'should allow getting replication details through a shard', (done) ->
    get '/api/v1/localhost:31100/replication'
      .set 'Authorization', "Bearer #{ctx.token}"
      .expect(200)
      .end (err, res) ->
        debug 'replication', res.text
        return done(err) if err
        done()
