# mongoscope-docs

where we keep notes on features, comparators, and figure out how to organize
the project.

## [milestones](./milestones/README.md) | [releases](https://github.com/10gen/mongoscope/releases) | [icebox](./milestones/100-icebox.md) | [elevator pitch](./elevator-pitch.md)

## api

<dl>
  <dt>↔︎</dt>
  <dd>also consumable via socket.io/server-sent events</ddd>
  <dt>✔︎</dt>
  <dd>all good! try it out</dd>
  <dt>⧠</dt>
  <dd>not yet, but soon</dd>
</dl>

### `/api/v1/:instance_id`

|     |         URI          |                 MongoDB Commands                 |  ↔︎ |
| :-: | -------------------- | ------------------------------------------------ | :-: |
|  ✔︎ | `/`                  | `listDatabases` + `db.hostInfo` + `db.buildInfo` |     |
|  ✔︎ | `/metrics`           | `db.serverStatus`                                |     |
|  ✔︎ | `/ops`               | `db.currentOp`                                   |  ✔︎ |
|  ✔︎ | `/log`               | `getLog`                                         |  ✔︎ |
|  ✔︎ | `/top`               | `top`                                            |  ✔︎ |
|  ✔︎ | `/replication`       | `rs.printReplicationInfo` + `rs.conf`            |  ✔︎ |
|  ✔︎ | `/replication/oplog` | `oplog.rs.find`                                  |  ✔︎ |

### `/api/v1/:instance_id/:database_name`

|     |     URI     |           MongoDB Commands           | ↔︎ |
| :-: | ----------- | ------------------------------------ | :----: |
| ✔︎ | `/`         | `db.stats` + `db.getCollectionNames` |        |
| ✔︎ | `profiling` | `db.getProfilingStatus`              | ✔︎      |

### `/api/v1/:instance_id/:database_name/:collection_name`

|     |       URI        |                          MongoDB Commands                         | ↔︎ |
| --- | ---------------- | ----------------------------------------------------------------- | :----: |
| ✔︎  | `/`              | `collection.stats` + `collection.getIndexes` + `collection.*Size` |        |
| ✔︎  | `/count`         | `.find(:where).count()`                                           |        |
| ✔︎  | `/find`          | `.find(:where).limit(:limit).skip(:skip)`                         |   ✔︎   |
| ✔︎  | `/aggregate`     | `.aggregate(:pipeline, :options)`                                 |   ⧠    |
| ✔︎  | `/distinct/:key` | `.distinct(:key, :where)`                                         |        |
| ✔︎  | `/plans`         | `listQueryShapes` + `getPlansByQuery`                             |        |

### `/api/v1/:instance_id/security`

|     |                URI                |        MongoDB Commands       |
| :-: | --------------------------------- | ----------------------------- |
| ⧠ | `/`                               | `db.getUsers` + `db.getRoles` |
| ⧠ | `/users`                          | `db.getUsers`                 |
| ✔︎ | `/users/:database_name/:username` | `db.getUser`                  |
| ⧠ | `/roles`                          | `db.getRoles`                 |
| ✔︎ | `/roles/:database_name/:role`     | `db.getRole`                  |

> incompletes just needs to always be scoped to `:database_name`


### `/api/v1`

List deployments.

> @todo: add section explaining internal deployment and instance schemas.

### `/api/v1/token`

> @todo: api hacking directed explaination of auth

### `/health-check`

Ping this to see if the http server is up.


## "Can I xxxx with mongoscope?"

### Read

| mongodb shell function            | scope'd |
| --------------------------------- | ------- |
| `collection.find(...).count`      | yes     |
| `collection.find(...).limit`      | yes     |
| `collection.find(...).skip`       | yes     |
| `collection.find`                 | yes     |
| `collection.findOne`              | yes     |
| `collection.getIndexes`           | yes     |
| `collection.getShardVersion`      | yes     |
| `collection.stats`                | yes     |
| `collection.storageSize`          | yes     |
| `collection.totalIndexSize`       | yes     |
| `collection.totalSize`            | yes     |
| `db.auth`                         | yes     |
| `db.currentOp`                    | yes     |
| `db.getCollection`                | yes     |
| `db.getCollectionNames`           | yes     |
| `db.getName`                      | yes     |
| `db.getProfilingLevel`            | yes     |
| `db.getProfilingStatus`           | yes     |
| `db.getReplicationInfo`           | yes     |
| `db.hostInfo`                     | yes     |
| `db.printCollectionStats`         | yes     |
| `db.printReplicationInfo`         | yes     |
| `db.printShardingStatus`          | yes     |
| `db.printSlaveReplicationInfo`    | yes     |
| `db.serverStatus`                 | yes     |
| `db.stats`                        | yes     |
| `db.version`                      | yes     |
| `rs.conf`                         | yes     |
| `rs.db.isMaster`                  | yes     |
| `rs.printReplicationInfo`         | yes     |
| `rs.printSlaveReplicationInfo`    | yes     |
| `rs.status`                       | yes     |
| `sh.status`                       | yes     |
| `collection.getShardDistribution` | yes     |
| `collection.distinct`             | yes     |
| `collection.find(...).sort`       | yes     |
| `planCache.listQueryShapes`       | yes     |
| `planCache.getPlansByQuery`       | yes     |
| `sh.getBalancerState`             | yes     |
| `sh.isBalancerRunning`            | yes     |
| `db.getWriteConcern`              | 2.0.0   |
| `collection.dataSize`             | 2.0.0   |
| `collection.getWriteConcern`      | 2.0.0   |


### Write

| mongodb shell function             | scope'd |
| ---------------------------------- | ------- |
| `collection.aggregate`             | 2.0.0   |
| `collection.convertToCapped`       | 2.0.0   |
| `collection.copyTo`                | 2.0.0   |
| `collection.drop`                  | 2.0.0   |
| `collection.dropIndex`             | 2.0.0   |
| `collection.dropIndexes`           | 2.0.0   |
| `collection.ensureIndex`           | 2.0.0   |
| `collection.findAndModify`         | 2.0.0   |
| `collection.getSplitKeysForChunks` | 2.0.0   |
| `collection.insert`                | 2.0.0   |
| `collection.mapReduce`             | 2.0.0   |
| `collection.group`                 | 2.0.0   |
| `collection.reIndex`               | 2.0.0   |
| `collection.remove`                | 2.0.0   |
| `collection.renameCollection`      | 2.0.0   |
| `collection.save`                  | 2.0.0   |
| `collection.setWriteConcern`       | 2.0.0   |
| `collection.unsetWriteConcern`     | 2.0.0   |
| `collection.update`                | 2.0.0   |
| `collection.validate`              | 2.0.0   |
| `db.cloneDatabase`                 | 2.0.0   |
| `db.copyDatabase`                  | 2.0.0   |
| `db.createCollection`              | 2.0.0   |
| `db.createUser`                    | 2.0.0   |
| `db.dropDatabase`                  | 2.0.0   |
| `db.dropUser`                      | 2.0.0   |
| `db.eval`                          | 2.0.0   |
| `db.fsyncLock`                     | 2.0.0   |
| `db.fsyncUnlock`                   | 2.0.0   |
| `db.killOp`                        | 2.0.0   |
| `db.repairDatabase`                | 2.0.0   |
| `db.setProfilingLevel`             | 2.0.0   |
| `db.setWriteConcern`               | 2.0.0   |
| `db.shutdownServer`                | 2.0.0   |
| `db.unsetWriteConcern`             | 2.0.0   |
| `rs.add`                           | 2.0.0   |
| `rs.addArb`                        | 2.0.0   |
| `rs.freeze`                        | 2.0.0   |
| `rs.initiate`                      | 2.0.0   |
| `rs.reconfig`                      | 2.0.0   |
| `rs.remove`                        | 2.0.0   |
| `rs.stepDown`                      | 2.0.0   |
| `rs.syncFrom`                      | 2.0.0   |
| `sh.addShard`                      | 2.0.0   |
| `sh.addShardTag`                   | 2.0.0   |
| `sh.addTagRange`                   | 2.0.0   |
| `sh.enableSharding`                | 2.0.0   |
| `sh.moveChunk`                     | 2.0.0   |
| `sh.removeShardTag`                | 2.0.0   |
| `sh.setBalancerState`              | 2.0.0   |
| `sh.shardCollection`               | 2.0.0   |
| `sh.splitAt`                       | 2.0.0   |
| `sh.splitFind`                     | 2.0.0   |


### Experimental

| mongodb shell function        | scope'd     |
| ----------------------------- | ----------- |
| `collection.diskStorageStats` | skunkworks  |
| `collection.indexStats`       | skunkworks  |
| `collection.pagesInRAM`       | skunkworks  |

## ux

- [`Persona`][persona] _who_ are we targeting? context of personality and skill
- [`Task`][task] _what_ a [`Persona`][persona] is trying to accomplish
- [`Scenario`][scenario] _why_ and _when_ this [`Persona`][persona] is trying to
  accomplish this [`Task`][task]
- `Goal` = `Persona` + `Task` + `Scenario` _how_ mongoscope provides value

[persona]: ./ux/personas.md
[task]: ./ux/tasks.md
[scenario]: ./ux/scenarios.md
[taxonomy]: ./ux/taxonomy.md

