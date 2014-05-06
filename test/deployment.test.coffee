Deployment = require('../lib/deployment')
assert = require('assert')
hostname = require('os').hostname().toLowerCase()
debug = require('debug')('mongoscope:test:deployment')

describe 'When connecting to a standalone deployment', ->
  standalone = null
  before (done) ->
    Deployment.create 27017, (err, d) ->
      return done(err) if err
      standalone = d
      done()


  it 'should discover the mongod on localhost by default', ->
    assert.equal standalone.instances.length, 1

  it 'should not add a type to instance metadata for a mongod', ->
    assert.equal standalone.type, undefined

describe 'When connecting to a replicaset deployment', ->
  rs = null
  before (done) ->
    Deployment.create 6000, (err, d) ->
      return done(err) if err
      rs = d
      done()

  it 'should discover the primary', ->
    assert.equal (rs.instances.filter (i) -> i.state is 'primary').length, 1

  it 'should discover the two secondaries', ->
    assert.equal (rs.instances.filter (i) -> i.state is 'secondary').length, 2

  it 'should include the replicaset name in the instance metadata', ->
    assert.equal (rs.instances.filter (i) -> i.rs is 'replicacom').length, 3

  it 'should not create another deployment when connecting to a secondary @todo'

describe 'When connecting to the router of a cluster deployment', ->
  cluster = null
  router_id = "#{hostname}:30999"

  before (done) ->
    Deployment.create 30999, (err, d) ->
      return done(err) if err
      cluster = d
      done()

  it 'should correctly identify the router', ->
    instance = cluster.getInstance router_id
    assert.equal instance.type, 'router'

  it 'should discover all instances in the cluster', ->
    assert.equal cluster.instances.length, 8


  it 'should disambiguate localhost', ->
    assert.equal cluster.seed, router_id

  it 'should name the cluster using the seed', ->
    assert.equal cluster.name.indexOf("cluster on"), 0

  it 'should not create more than one deployment @todo'
  it 'should upgrade an existing replicaset deployment to a cluster @todo'


describe 'When connecting directly to a cluster shard', ->
  replicaset = null
  cluster = null
  before (done) ->
    Deployment.create 'mongodb://localhost:31200', (err, deployment) ->
      return done(err) if(err)
      replicaset = deployment
      done()

  it 'should create a deployment just for the shard', ->
    assert.equal replicaset.instances.length, 3

  it 'should not include any routers as the shard has no way of
      knowing it is part of a cluster on it\'s own', ->
    assert.equal replicaset.sharding, undefined

  it 'should take the hint that replica set names which end in a number are likely shards in a grander scheme', ->
    assert.equal replicaset.maybe_sharded, true

  it 'should discover all replicaset members', ->
      assert.equal replicaset.instances.length, 3

  describe 'If you then connect to a router', ->
    before (done) ->
      Deployment.create 'mongodb://localhost:30999', (err, deployment) ->
        return done(err) if(err)
        cluster = deployment
        done()

    it 'should have removed the old deployment', (done)->
      Deployment.get "#{hostname}:31200", (err, deployment) ->
        return done(err) if err
        debug 'deployment.get returned', deployment
        assert.equal deployment._id, "#{hostname}:30999"
        done()

