var opts = {},
  st,
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
st.s.getDB(dbName).adminCommand({enableSharding: dbName});
st.s.getDB(dbName).adminCommand({shardCollection: dbName+'.'+collName, key: { x: 1 }});
