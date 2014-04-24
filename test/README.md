# testing

## deployment types


### Cluster `clusterco`

routers:

- [mongodb://localhost:30999?config=localhost:29000](http://localhost:29017/#connect/localhost:30999)

shard 1:

- [mongodb://localhost:31102?rs=clusterco-rs0](http://localhost:29017/#connect/localhost:31102)
- [mongodb://localhost:31101?rs=clusterco-rs0](http://localhost:29017/#connect/localhost:31101)
- [mongodb://localhost:31100?rs=clusterco-rs0](http://localhost:29017/#connect/localhost:31100)

shard 2:

- [mongodb://localhost:31200?rs=clusterco-rs1](http://localhost:29017/#connect/localhost:31200)
- [mongodb://localhost:31202?rs=clusterco-rs1](http://localhost:29017/#connect/localhost:31202)
- [mongodb://localhost:31201?rs=clusterco-rs1](http://localhost:29017/#connect/localhost:31201)

config server:

- [mongodb://localhost:29000?type=config](http://localhost:29017/#connect/localhost:29000)

shelljs to start and setup:

```
function createCluster(opts){
  opts = opts || {};
  var st,
    run,
    dbName = opts.db || 'clusterco',
    collName = opts.collection || 'user',
    sharding = {
      shards: opts.shards || 2,
      chunkSize: 1,
      rs: {
        oplogSize: 10
      },
      verbose: 0,
      name: dbName
    };

  st = new ShardingTest(sharding);
  run = st.s.getDB(dbName).adminCommand;
  run({enableSharding: dbName});
  run({shardCollection: dbName+'.'+collName, key: { x: 1 }});
  return st;
}
```

### Replicaset `replicacom`

- [mongod --port 6002 --replSet replicacom --dbpath /data/db/replicacom-2](http://localhost:29017/#connect/localhost:6002)
- [mongod --port 6001 --replSet replicacom --dbpath /data/db/replicacom-1](http://localhost:29017/#connect/localhost:6001)
- [mongod --port 6000 --replSet replicacom --dbpath /data/db/replicacom-0](http://localhost:29017/#connect/localhost:6000)

shelljs to start and setup:

```
function createReplicaset(opts){
  opts = opts || {};
  var instances = opts.instances || 3,
    name = 'replicacom' || opts.name,
    rs = new ReplSetTest({name: name, nodes: instances, useHostName: false, startPort: 6000});
  rs.startSet();
  rs.initiate();
  return rs;
}
```

### Standalone

[mongod --port 27017 --dbpath /data/db/standalone](http://localhost:29017/#connect/localhost:27017)
