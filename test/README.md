# testing

## deployment types


### Cluster `clusterco`

routers:

- [mongos --port 30999 --configdb localhost:29000](http://localhost:29017/#connect/localhost:30999)

shard 1:

- [mongod --port 31102 --replSet clusterco-rs0 --dbpath /data/db/clusterco-rs0-2](http://localhost:29017/#connect/localhost:31102)
- [mongod --port 31101 --replSet clusterco-rs0 --dbpath /data/db/clusterco-rs0-1](http://localhost:29017/#connect/localhost:31101)
- [mongod --port 31100 --replSet clusterco-rs0 --dbpath /data/db/clusterco-rs0-0](http://localhost:29017/#connect/localhost:31100)

shard 2:

- [mongod --port 31200 --replSet clusterco-rs1 --dbpath /data/db/clusterco-rs1-0](http://localhost:29017/#connect/localhost:31200)
- [mongod --port 31202 --replSet clusterco-rs1 --dbpath /data/db/clusterco-rs1-2](http://localhost:29017/#connect/localhost:31202)
- [mongod --port 31201 --replSet clusterco-rs1 --dbpath /data/db/clusterco-rs1-1](http://localhost:29017/#connect/localhost:31201)

config server:

- [mongod --port 29000 --dbpath /data/db/clusterco-config0 --configsvr](http://localhost:29017/#connect/localhost:29000)

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
