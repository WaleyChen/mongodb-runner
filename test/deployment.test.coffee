Deployment = require('../lib/deployment')
assert = require('assert')
hostname = require('os').hostname().toLowerCase()

describe 'When connecting to a standalone deployment', ->
  it 'should discover the mongod on localhost by default'
  it 'should not create another deployment for localhost:27017'
  it 'should not add a type to instance metadata for a mongod'

describe 'When connecting to a replicaset deployment', ->
  it 'should discover the primary'
  it 'should discover the two secondaries'
  it 'should not create another deployment when connecting to a secondary'
  it 'should include the replicaset name in the instance metadata'

describe 'When connecting to the router of a cluster deployment', ->
  cluster = null
  router_id = "#{hostname}:30999"
  router_url =

  before (done) ->
    Deployment.create 30999, (err, d) ->
      return done(err) if err
      cluster = d
      done()

  it 'should correctly identify the router', ->
    instance = cluster.getInstance router_id
    assert.equal instance.type, 'router'

  it 'should discover all instances in the cluster', ->
    assert.equal cluster.instances.length, 7


  it 'should disambiguate localhost', ->
    assert.equal cluster.seed, router_id

  it 'should name the cluster using the seed', ->
    assert.equal cluster.name, "cluster on #{hostname}"

  it 'should discover all instances from a secondary'
  it 'should not create more than one deployment'
  it 'should upgrade an existing replicaset deployment to a cluster'


describe 'cluster shard', ->
  replicaset = null
  before (done) ->
    Deployment.create 'mongodb://localhost:31200', (err, deployment) ->
      return done(err) if(err)
      replicaset = deployment
      done()

  it 'should create a deployment just for the shard'

  it 'should not include any routers as the shard has no way of
      knowing it is part of a cluster on it\'s own', ->
    assert.equal replicaset.sharding, undefined

  it 'should take the hint that replica set names which end in a number are likely shards in a grander scheme', ->
    assert.equal replicaset.maybe_sharded, true


  it 'should discover all replicaset members', ->
      assert.equal replicaset.instances.length, 3
