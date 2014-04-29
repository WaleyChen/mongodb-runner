helpers = require('./helpers')
get = helpers.get
ctx = helpers.ctx
debug = require('debug')('mongoscope:test:database')

describe 'database', () ->
  before helpers.before
  after helpers.after

  it 'should return database details', (done) ->
    get '/api/v1/localhost:27017/test'
      .set 'Authorization', 'Bearer ' + ctx.token
      .expect 200
      .end (err, res) -> done err

  it 'should return default profiling info', (done) ->
    get '/api/v1/localhost:27017/test/profiling'
      .set 'Authorization', 'Bearer ' + ctx.token
      .expect 200
      .end (err, res) -> done err

  it 'should return profiling entries', (done) ->
    get '/api/v1/localhost:27017/test/profiling/entries'
      .set 'Authorization', 'Bearer ' + ctx.token
      .expect 200
      .end (err, res) ->
        debug 'profiling', res.text
        done err
