# Security

An experiment in modelling and generating mongod's security system.

## Built-in Role Templates

### read

#### read: `system.indexes`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

#### read: `system.namespaces`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

#### read: `system.js`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

#### read: `$db`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)


### readWrite

#### readWrite: `system.indexes`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)

#### readWrite: `system.namespaces`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)

#### readWrite: `system.js`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)

#### readWrite: `$db`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)


### userAdmin

#### userAdmin: `$db`
- [changeCustomData](http://docs.mongodb.org/manual/reference/command/changeCustomData/)
- [changePassword](http://docs.mongodb.org/manual/reference/command/changePassword/)
- [createUser](http://docs.mongodb.org/manual/reference/command/createUser/)
- [createRole](http://docs.mongodb.org/manual/reference/command/createRole/)
- [dropUser](http://docs.mongodb.org/manual/reference/command/dropUser/)
- [dropRole](http://docs.mongodb.org/manual/reference/command/dropRole/)
- [grantRole](http://docs.mongodb.org/manual/reference/command/grantRole/)
- [revokeRole](http://docs.mongodb.org/manual/reference/command/revokeRole/)
- [viewUser](http://docs.mongodb.org/manual/reference/command/viewUser/)
- [viewRole](http://docs.mongodb.org/manual/reference/command/viewRole/)


### dbAdmin

#### dbAdmin: `system.indexes`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

#### dbAdmin: `system.namespaces`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

#### dbAdmin: `system.profile`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)

#### dbAdmin: `$db`
- [collMod](http://docs.mongodb.org/manual/reference/command/collMod/)
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [compact](http://docs.mongodb.org/manual/reference/command/compact/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropDatabase](http://docs.mongodb.org/manual/reference/command/dropDatabase/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [indexStats](http://docs.mongodb.org/manual/reference/command/indexStats/)
- [enableProfiler](http://docs.mongodb.org/manual/reference/command/enableProfiler/)
- [planCacheIndexFilter](http://docs.mongodb.org/manual/reference/command/planCacheIndexFilter/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [planCacheWrite](http://docs.mongodb.org/manual/reference/command/planCacheWrite/)
- [reIndex](http://docs.mongodb.org/manual/reference/command/reIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)
- [repairDatabase](http://docs.mongodb.org/manual/reference/command/repairDatabase/)
- [storageDetails](http://docs.mongodb.org/manual/reference/command/storageDetails/)
- [validate](http://docs.mongodb.org/manual/reference/command/validate/)


### clusterMonitor

#### clusterMonitor: `*`
- [connPoolStats](http://docs.mongodb.org/manual/reference/command/connPoolStats/)
- [getCmdLineOpts](http://docs.mongodb.org/manual/reference/command/getCmdLineOpts/)
- [getLog](http://docs.mongodb.org/manual/reference/command/getLog/)
- [getParameter](http://docs.mongodb.org/manual/reference/command/getParameter/)
- [getShardMap](http://docs.mongodb.org/manual/reference/command/getShardMap/)
- [hostInfo](http://docs.mongodb.org/manual/reference/command/hostInfo/)
- [listDatabases](http://docs.mongodb.org/manual/reference/command/listDatabases/)
- [listShards](http://docs.mongodb.org/manual/reference/command/listShards/)
- [netstat](http://docs.mongodb.org/manual/reference/command/netstat/)
- [replSetGetStatus](http://docs.mongodb.org/manual/reference/command/replSetGetStatus/)
- [serverStatus](http://docs.mongodb.org/manual/reference/command/serverStatus/)
- [top](http://docs.mongodb.org/manual/reference/command/top/)
- [cursorInfo](http://docs.mongodb.org/manual/reference/command/cursorInfo/)
- [inprog](http://docs.mongodb.org/manual/reference/command/inprog/)
- [shardingState](http://docs.mongodb.org/manual/reference/command/shardingState/)
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [getShardVersion](http://docs.mongodb.org/manual/reference/command/getShardVersion/)


### clusterManager

#### clusterManager: `*`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)

#### clusterManager: `config`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

#### clusterManager: `config.settings`
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)

#### clusterManager: `local.system.replset`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)


### hostManager

#### hostManager: `*`
- [applicationMessage](http://docs.mongodb.org/manual/reference/command/applicationMessage/)
- [connPoolSync](http://docs.mongodb.org/manual/reference/command/connPoolSync/)
- [closeAllDatabases](http://docs.mongodb.org/manual/reference/command/closeAllDatabases/)
- [cpuProfiler](http://docs.mongodb.org/manual/reference/command/cpuProfiler/)
- [logRotate](http://docs.mongodb.org/manual/reference/command/logRotate/)
- [setParameter](http://docs.mongodb.org/manual/reference/command/setParameter/)
- [shutdown](http://docs.mongodb.org/manual/reference/command/shutdown/)
- [touch](http://docs.mongodb.org/manual/reference/command/touch/)
- [unlock](http://docs.mongodb.org/manual/reference/command/unlock/)
- [diagLogging](http://docs.mongodb.org/manual/reference/command/diagLogging/)
- [flushRouterConfig](http://docs.mongodb.org/manual/reference/command/flushRouterConfig/)
- [fsync](http://docs.mongodb.org/manual/reference/command/fsync/)
- [invalidateUserCache](http://docs.mongodb.org/manual/reference/command/invalidateUserCache/)
- [killop](http://docs.mongodb.org/manual/reference/command/killop/)
- [resync](http://docs.mongodb.org/manual/reference/command/resync/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [repairDatabase](http://docs.mongodb.org/manual/reference/command/repairDatabase/)


### readAnyDatabase

#### readAnyDatabase: `*`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)


### readwriteAnyDatabase

#### readwriteAnyDatabase: `*`
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)


## Action Sets

### read

#### commands:

- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)

### advanced read

#### commands:

- [connPoolStats](http://docs.mongodb.org/manual/reference/command/connPoolStats/)
- [getCmdLineOpts](http://docs.mongodb.org/manual/reference/command/getCmdLineOpts/)
- [getLog](http://docs.mongodb.org/manual/reference/command/getLog/)
- [getParameter](http://docs.mongodb.org/manual/reference/command/getParameter/)
- [getShardMap](http://docs.mongodb.org/manual/reference/command/getShardMap/)
- [hostInfo](http://docs.mongodb.org/manual/reference/command/hostInfo/)
- [listDatabases](http://docs.mongodb.org/manual/reference/command/listDatabases/)
- [listShards](http://docs.mongodb.org/manual/reference/command/listShards/)
- [netstat](http://docs.mongodb.org/manual/reference/command/netstat/)
- [replSetGetStatus](http://docs.mongodb.org/manual/reference/command/replSetGetStatus/)
- [serverStatus](http://docs.mongodb.org/manual/reference/command/serverStatus/)
- [top](http://docs.mongodb.org/manual/reference/command/top/)
- [cursorInfo](http://docs.mongodb.org/manual/reference/command/cursorInfo/)
- [inprog](http://docs.mongodb.org/manual/reference/command/inprog/)
- [shardingState](http://docs.mongodb.org/manual/reference/command/shardingState/)
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [getShardVersion](http://docs.mongodb.org/manual/reference/command/getShardVersion/)

### basic write

#### commands:

- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)

### write

#### commands:

- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)

### advanced write

#### commands:

- [appendOplogNote](http://docs.mongodb.org/manual/reference/command/appendOplogNote/)
- [applicationMessage](http://docs.mongodb.org/manual/reference/command/applicationMessage/)
- [replSetConfigure](http://docs.mongodb.org/manual/reference/command/replSetConfigure/)
- [replSetStateChange](http://docs.mongodb.org/manual/reference/command/replSetStateChange/)
- [resync](http://docs.mongodb.org/manual/reference/command/resync/)
- [addShard](http://docs.mongodb.org/manual/reference/command/addShard/)
- [removeShard](http://docs.mongodb.org/manual/reference/command/removeShard/)
- [flushRouterConfig](http://docs.mongodb.org/manual/reference/command/flushRouterConfig/)
- [cleanupOrphaned](http://docs.mongodb.org/manual/reference/command/cleanupOrphaned/)
- [splitChunk](http://docs.mongodb.org/manual/reference/command/splitChunk/)
- [moveChunk](http://docs.mongodb.org/manual/reference/command/moveChunk/)
- [enableSharding](http://docs.mongodb.org/manual/reference/command/enableSharding/)
- [splitVector](http://docs.mongodb.org/manual/reference/command/splitVector/)

### host administration

#### commands:

- [applicationMessage](http://docs.mongodb.org/manual/reference/command/applicationMessage/)
- [connPoolSync](http://docs.mongodb.org/manual/reference/command/connPoolSync/)
- [closeAllDatabases](http://docs.mongodb.org/manual/reference/command/closeAllDatabases/)
- [cpuProfiler](http://docs.mongodb.org/manual/reference/command/cpuProfiler/)
- [logRotate](http://docs.mongodb.org/manual/reference/command/logRotate/)
- [setParameter](http://docs.mongodb.org/manual/reference/command/setParameter/)
- [shutdown](http://docs.mongodb.org/manual/reference/command/shutdown/)
- [touch](http://docs.mongodb.org/manual/reference/command/touch/)
- [unlock](http://docs.mongodb.org/manual/reference/command/unlock/)
- [diagLogging](http://docs.mongodb.org/manual/reference/command/diagLogging/)
- [flushRouterConfig](http://docs.mongodb.org/manual/reference/command/flushRouterConfig/)
- [fsync](http://docs.mongodb.org/manual/reference/command/fsync/)
- [invalidateUserCache](http://docs.mongodb.org/manual/reference/command/invalidateUserCache/)
- [killop](http://docs.mongodb.org/manual/reference/command/killop/)
- [resync](http://docs.mongodb.org/manual/reference/command/resync/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [repairDatabase](http://docs.mongodb.org/manual/reference/command/repairDatabase/)

### administration

#### commands:

- [collMod](http://docs.mongodb.org/manual/reference/command/collMod/)
- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [compact](http://docs.mongodb.org/manual/reference/command/compact/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropDatabase](http://docs.mongodb.org/manual/reference/command/dropDatabase/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [indexStats](http://docs.mongodb.org/manual/reference/command/indexStats/)
- [enableProfiler](http://docs.mongodb.org/manual/reference/command/enableProfiler/)
- [planCacheIndexFilter](http://docs.mongodb.org/manual/reference/command/planCacheIndexFilter/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [planCacheWrite](http://docs.mongodb.org/manual/reference/command/planCacheWrite/)
- [reIndex](http://docs.mongodb.org/manual/reference/command/reIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)
- [repairDatabase](http://docs.mongodb.org/manual/reference/command/repairDatabase/)
- [storageDetails](http://docs.mongodb.org/manual/reference/command/storageDetails/)
- [validate](http://docs.mongodb.org/manual/reference/command/validate/)

### authentication administration

#### commands:

- [changeCustomData](http://docs.mongodb.org/manual/reference/command/changeCustomData/)
- [changePassword](http://docs.mongodb.org/manual/reference/command/changePassword/)
- [createUser](http://docs.mongodb.org/manual/reference/command/createUser/)
- [createRole](http://docs.mongodb.org/manual/reference/command/createRole/)
- [dropUser](http://docs.mongodb.org/manual/reference/command/dropUser/)
- [dropRole](http://docs.mongodb.org/manual/reference/command/dropRole/)
- [grantRole](http://docs.mongodb.org/manual/reference/command/grantRole/)
- [revokeRole](http://docs.mongodb.org/manual/reference/command/revokeRole/)
- [viewUser](http://docs.mongodb.org/manual/reference/command/viewUser/)
- [viewRole](http://docs.mongodb.org/manual/reference/command/viewRole/)

### operator

#### commands:

- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)

### read & write

#### commands:

- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)

### basic read & write

#### commands:

- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)

### view profiling

#### commands:

- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)

### root

#### commands:

- [collStats](http://docs.mongodb.org/manual/reference/command/collStats/)
- [dbHash](http://docs.mongodb.org/manual/reference/command/dbHash/)
- [dbStats](http://docs.mongodb.org/manual/reference/command/dbStats/)
- [find](http://docs.mongodb.org/manual/reference/command/find/)
- [killCursors](http://docs.mongodb.org/manual/reference/command/killCursors/)
- [planCacheRead](http://docs.mongodb.org/manual/reference/command/planCacheRead/)
- [insert](http://docs.mongodb.org/manual/reference/command/insert/)
- [remove](http://docs.mongodb.org/manual/reference/command/remove/)
- [update](http://docs.mongodb.org/manual/reference/command/update/)
- [convertToCapped](http://docs.mongodb.org/manual/reference/command/convertToCapped/)
- [createCollection](http://docs.mongodb.org/manual/reference/command/createCollection/)
- [dropCollection](http://docs.mongodb.org/manual/reference/command/dropCollection/)
- [dropIndex](http://docs.mongodb.org/manual/reference/command/dropIndex/)
- [emptycapped](http://docs.mongodb.org/manual/reference/command/emptycapped/)
- [createIndex](http://docs.mongodb.org/manual/reference/command/createIndex/)
- [renameCollectionSameDB](http://docs.mongodb.org/manual/reference/command/renameCollectionSameDB/)
- [changeCustomData](http://docs.mongodb.org/manual/reference/command/changeCustomData/)
- [changePassword](http://docs.mongodb.org/manual/reference/command/changePassword/)
- [createUser](http://docs.mongodb.org/manual/reference/command/createUser/)
- [createRole](http://docs.mongodb.org/manual/reference/command/createRole/)
- [dropUser](http://docs.mongodb.org/manual/reference/command/dropUser/)
- [dropRole](http://docs.mongodb.org/manual/reference/command/dropRole/)
- [grantRole](http://docs.mongodb.org/manual/reference/command/grantRole/)
- [revokeRole](http://docs.mongodb.org/manual/reference/command/revokeRole/)
- [viewUser](http://docs.mongodb.org/manual/reference/command/viewUser/)
- [viewRole](http://docs.mongodb.org/manual/reference/command/viewRole/)
- [collMod](http://docs.mongodb.org/manual/reference/command/collMod/)
- [compact](http://docs.mongodb.org/manual/reference/command/compact/)
- [dropDatabase](http://docs.mongodb.org/manual/reference/command/dropDatabase/)
- [indexStats](http://docs.mongodb.org/manual/reference/command/indexStats/)
- [enableProfiler](http://docs.mongodb.org/manual/reference/command/enableProfiler/)
- [planCacheIndexFilter](http://docs.mongodb.org/manual/reference/command/planCacheIndexFilter/)
- [planCacheWrite](http://docs.mongodb.org/manual/reference/command/planCacheWrite/)
- [reIndex](http://docs.mongodb.org/manual/reference/command/reIndex/)
- [repairDatabase](http://docs.mongodb.org/manual/reference/command/repairDatabase/)
- [storageDetails](http://docs.mongodb.org/manual/reference/command/storageDetails/)
- [validate](http://docs.mongodb.org/manual/reference/command/validate/)
- [applicationMessage](http://docs.mongodb.org/manual/reference/command/applicationMessage/)
- [connPoolSync](http://docs.mongodb.org/manual/reference/command/connPoolSync/)
- [closeAllDatabases](http://docs.mongodb.org/manual/reference/command/closeAllDatabases/)
- [cpuProfiler](http://docs.mongodb.org/manual/reference/command/cpuProfiler/)
- [logRotate](http://docs.mongodb.org/manual/reference/command/logRotate/)
- [setParameter](http://docs.mongodb.org/manual/reference/command/setParameter/)
- [shutdown](http://docs.mongodb.org/manual/reference/command/shutdown/)
- [touch](http://docs.mongodb.org/manual/reference/command/touch/)
- [unlock](http://docs.mongodb.org/manual/reference/command/unlock/)
- [diagLogging](http://docs.mongodb.org/manual/reference/command/diagLogging/)
- [flushRouterConfig](http://docs.mongodb.org/manual/reference/command/flushRouterConfig/)
- [fsync](http://docs.mongodb.org/manual/reference/command/fsync/)
- [invalidateUserCache](http://docs.mongodb.org/manual/reference/command/invalidateUserCache/)
- [killop](http://docs.mongodb.org/manual/reference/command/killop/)
- [resync](http://docs.mongodb.org/manual/reference/command/resync/)
- [appendOplogNote](http://docs.mongodb.org/manual/reference/command/appendOplogNote/)
- [replSetConfigure](http://docs.mongodb.org/manual/reference/command/replSetConfigure/)
- [replSetStateChange](http://docs.mongodb.org/manual/reference/command/replSetStateChange/)
- [addShard](http://docs.mongodb.org/manual/reference/command/addShard/)
- [removeShard](http://docs.mongodb.org/manual/reference/command/removeShard/)
- [cleanupOrphaned](http://docs.mongodb.org/manual/reference/command/cleanupOrphaned/)
- [splitChunk](http://docs.mongodb.org/manual/reference/command/splitChunk/)
- [moveChunk](http://docs.mongodb.org/manual/reference/command/moveChunk/)
- [enableSharding](http://docs.mongodb.org/manual/reference/command/enableSharding/)
- [splitVector](http://docs.mongodb.org/manual/reference/command/splitVector/)
- [connPoolStats](http://docs.mongodb.org/manual/reference/command/connPoolStats/)
- [getCmdLineOpts](http://docs.mongodb.org/manual/reference/command/getCmdLineOpts/)
- [getLog](http://docs.mongodb.org/manual/reference/command/getLog/)
- [getParameter](http://docs.mongodb.org/manual/reference/command/getParameter/)
- [getShardMap](http://docs.mongodb.org/manual/reference/command/getShardMap/)
- [hostInfo](http://docs.mongodb.org/manual/reference/command/hostInfo/)
- [listDatabases](http://docs.mongodb.org/manual/reference/command/listDatabases/)
- [listShards](http://docs.mongodb.org/manual/reference/command/listShards/)
- [netstat](http://docs.mongodb.org/manual/reference/command/netstat/)
- [replSetGetStatus](http://docs.mongodb.org/manual/reference/command/replSetGetStatus/)
- [serverStatus](http://docs.mongodb.org/manual/reference/command/serverStatus/)
- [top](http://docs.mongodb.org/manual/reference/command/top/)
- [cursorInfo](http://docs.mongodb.org/manual/reference/command/cursorInfo/)
- [inprog](http://docs.mongodb.org/manual/reference/command/inprog/)
- [shardingState](http://docs.mongodb.org/manual/reference/command/shardingState/)
- [getShardVersion](http://docs.mongodb.org/manual/reference/command/getShardVersion/)
