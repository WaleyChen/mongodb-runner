# Security

An experiment in modelling and generating mongod's security system.

## Built-in Roles

### read

#### read: `system.indexes`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

#### read: `system.namespaces`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

#### read: `system.js`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

#### read: `$db`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead


### readWrite

#### readWrite: `system.indexes`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update

#### readWrite: `system.namespaces`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update

#### readWrite: `system.js`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update

#### readWrite: `$db`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update
  - convertToCapped
  - createCollection
  - dropCollection
  - dropIndex
  - emptycapped
  - createIndex
  - renameCollectionSameDB


### userAdmin

#### userAdmin: `$db`
  - changeCustomData
  - changePassword
  - createUser
  - createRole
  - dropUser
  - dropRole
  - grantRole
  - revokeRole
  - viewUser
  - viewRole


### dbAdmin

#### dbAdmin: `system.indexes`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

#### dbAdmin: `system.namespaces`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

#### dbAdmin: `system.profile`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - dropCollection

#### dbAdmin: `$db`
  - collMod
  - collStats
  - compact
  - convertToCapped
  - createCollection
  - dbStats
  - dropCollection
  - dropDatabase
  - dropIndex
  - createIndex
  - indexStats
  - enableProfiler
  - planCacheIndexFilter
  - planCacheRead
  - planCacheWrite
  - reIndex
  - renameCollectionSameDB
  - repairDatabase
  - storageDetails
  - validate


### clusterMonitor

#### clusterMonitor: `*`
  - connPoolStats
  - getCmdLineOpts
  - getLog
  - getParameter
  - getShardMap
  - hostInfo
  - listDatabases
  - listShards
  - netstat
  - replSetGetStatus
  - serverStatus
  - top
  - cursorInfo
  - inprog
  - shardingState
  - collStats
  - dbStats
  - getShardVersion


### clusterManager

#### clusterManager: `*`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update
  - convertToCapped
  - createCollection
  - dropCollection
  - dropIndex
  - emptycapped
  - createIndex
  - renameCollectionSameDB

#### clusterManager: `config`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

#### clusterManager: `config.settings`
  - insert
  - remove
  - update

#### clusterManager: `local.system.replset`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead


### hostManager

#### hostManager: `*`
  - applicationMessage
  - connPoolSync
  - closeAllDatabases
  - cpuProfiler
  - logRotate
  - setParameter
  - shutdown
  - touch
  - unlock
  - diagLogging
  - flushRouterConfig
  - fsync
  - invalidateUserCache
  - killop
  - resync
  - killCursors
  - repairDatabase


### readAnyDatabase

#### readAnyDatabase: `*`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead


### readwriteAnyDatabase

#### readwriteAnyDatabase: `*`
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update
  - convertToCapped
  - createCollection
  - dropCollection
  - dropIndex
  - emptycapped
  - createIndex
  - renameCollectionSameDB


## Action Sets

### read

#### commands:

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead

### advanced read

#### commands:

- connPoolStats
- getCmdLineOpts
- getLog
- getParameter
- getShardMap
- hostInfo
- listDatabases
- listShards
- netstat
- replSetGetStatus
- serverStatus
- top
- cursorInfo
- inprog
- shardingState
- collStats
- dbStats
- getShardVersion

### basic write

#### commands:

- insert
- remove
- update

### write

#### commands:

- insert
- remove
- update
- convertToCapped
- createCollection
- dropCollection
- dropIndex
- emptycapped
- createIndex
- renameCollectionSameDB

### advanced write

#### commands:

- appendOplogNote
- applicationMessage
- replSetConfigure
- replSetStateChange
- resync
- addShard
- removeShard
- flushRouterConfig
- cleanupOrphaned
- splitChunk
- moveChunk
- enableSharding
- splitVector

### host administration

#### commands:

- applicationMessage
- connPoolSync
- closeAllDatabases
- cpuProfiler
- logRotate
- setParameter
- shutdown
- touch
- unlock
- diagLogging
- flushRouterConfig
- fsync
- invalidateUserCache
- killop
- resync
- killCursors
- repairDatabase

### administration

#### commands:

- collMod
- collStats
- compact
- convertToCapped
- createCollection
- dbStats
- dropCollection
- dropDatabase
- dropIndex
- createIndex
- indexStats
- enableProfiler
- planCacheIndexFilter
- planCacheRead
- planCacheWrite
- reIndex
- renameCollectionSameDB
- repairDatabase
- storageDetails
- validate

### authentication administration

#### commands:

- changeCustomData
- changePassword
- createUser
- createRole
- dropUser
- dropRole
- grantRole
- revokeRole
- viewUser
- viewRole

### operator

#### commands:

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead
- insert
- remove
- update
- convertToCapped
- createCollection
- dropCollection
- dropIndex
- emptycapped
- createIndex
- renameCollectionSameDB

### read & write

#### commands:

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead
- insert
- remove
- update
- convertToCapped
- createCollection
- dropCollection
- dropIndex
- emptycapped
- createIndex
- renameCollectionSameDB

### basic read & write

#### commands:

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead
- insert
- remove
- update

### view profiling

#### commands:

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead
- dropCollection

### root

#### commands:

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead
- insert
- remove
- update
- convertToCapped
- createCollection
- dropCollection
- dropIndex
- emptycapped
- createIndex
- renameCollectionSameDB
- changeCustomData
- changePassword
- createUser
- createRole
- dropUser
- dropRole
- grantRole
- revokeRole
- viewUser
- viewRole
- collMod
- compact
- dropDatabase
- indexStats
- enableProfiler
- planCacheIndexFilter
- planCacheWrite
- reIndex
- repairDatabase
- storageDetails
- validate
- applicationMessage
- connPoolSync
- closeAllDatabases
- cpuProfiler
- logRotate
- setParameter
- shutdown
- touch
- unlock
- diagLogging
- flushRouterConfig
- fsync
- invalidateUserCache
- killop
- resync
- appendOplogNote
- replSetConfigure
- replSetStateChange
- addShard
- removeShard
- cleanupOrphaned
- splitChunk
- moveChunk
- enableSharding
- splitVector
- connPoolStats
- getCmdLineOpts
- getLog
- getParameter
- getShardMap
- hostInfo
- listDatabases
- listShards
- netstat
- replSetGetStatus
- serverStatus
- top
- cursorInfo
- inprog
- shardingState
- getShardVersion
