# Security

An experiment in modelling and generating mongod's security system.

## Built-in Roles

### read

- `system.indexes`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
- `system.namespaces`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
- `system.js`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
- `$db`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

### readWrite

- `system.indexes`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update
- `system.namespaces`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update
- `system.js`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - insert
  - remove
  - update
- `$db`:
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

- `$db`:
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

- `system.indexes`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
- `system.namespaces`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
- `system.profile`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
  - dropCollection
- `$db`:
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

- `*`:
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

- `*`:
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
- `config`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead
- `config.settings`:
  - insert
  - remove
  - update
- `local.system.replset`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

### hostManager

- `*`:
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

- `*`:
  - collStats
  - dbHash
  - dbStats
  - find
  - killCursors
  - planCacheRead

### readwriteAnyDatabase

- `*`:
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

## Actions

### read

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead

### advanced read

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

- insert
- remove
- update

### write

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

- collStats
- dbHash
- dbStats
- find
- killCursors
- planCacheRead
- dropCollection

### root

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
