# 1.0.0

> TBD

## Deliverables

- [x] server: cr-based authentication
- [x] server: complete, web-friendly read-only rest api
- [ ] ui: deployments: connect to deployment
- [ ] ui: deployments: view details (replication and sharding status
- [ ] ui: deployments: easily view details for any instance
- [ ] ui: deployments: connect to another deployment
- [ ] ui: instance: view host and build details
- [ ] ui: instance: view log
- [ ] ui: instance: view top
- [ ] ui: instance: view databases w/ high-level stats
- [ ] ui: instance: view collections w/ high-level stats
- [ ] project: deployment setup
- [ ] project: ground-work for qa and documentation

## Punchlist

- [x] server: url vs. id vs. name cleanup
- [x] server: dns disambiguation
- [ ] server: connecting automatically figures out the right deployment you want instead of creating a new one
- [ ] server: connect to rs that is actually a cluster -> connect to cluster -> merges the two deployments
- [ ] server: when a replicaset membership event happens, update the deployment
- ui
  - [ ] dumb down ui even further
  - [ ] starting view for cluster
  - [ ] starting view for replica set
  - [ ] starting view for standalone
  - [ ] bug: instance list stomped when switching in ui
- project
  - [ ] jira
  - [ ] roadmap
  - [ ] setup mci project
  - [ ] automated build deploy for windows, nix, and osx

## Completeness

### MongoDB Read API's

#### `/api/v1/:instance`

|     |         URI          |                 MongoDB Commands                 | Stream |
| :-: | -------------------- | ------------------------------------------------ | :----: |
|  ✔︎ | `/`                  | `listDatabases` + `db.hostInfo` + `db.buildInfo`  |        |
|  ✔︎ | `/metrics`           | `db.serverStatus`                                 |        |
|  ✔︎ | `/ops`               | `db.currentOp`                                    |   ✔︎    |
|  ✔︎ | `/log`               | `getLog`                                          |   ✔︎    |
|  ✔︎ | `/top`               | `top`                                             |   ✔︎    |
|  ✔︎ | `/replication`       | `rs.printReplicationInfo` + `rs.conf`             |        |
|  ✔︎ | `/replication/oplog` | `oplog.rs.find`                                   |   ✔︎    |
|  ✔︎ | `/replication/watch` | no equivalent                                     |   ✔︎    |

#### `/api/v1/:instance/:database_name`

|     |     URI     |           MongoDB Commands           | Stream |
| :-: | ----------- | ------------------------------------ | :----: |
| ✔︎ | `/`         | `db.stats` + `db.getCollectionNames` |        |
| ✔︎ | `profiling` | `db.getProfilingStatus`              | ✔︎      |

#### `/api/v1/:instance/:database_name/:collection_name`

|     |   URI    |                          MongoDB Commands                         | Stream |                         Notes                          |
| --- | -------- | ----------------------------------------------------------------- | :----: | ------------------------------------------------------ |
| ✔︎ | `/`      | `collection.stats` + `collection.getIndexes` + `collection.*Size`   |        |                                                        |
| ✔︎ | `/count` | `.find(:where).count()`                                             |        | :explain supported                                     |
| ✔︎ | `/find`  | `.find(:where).limit(:limit).skip(:skip)`                           | ✔︎      | :explain supported. Only Stream for capped collections |

#### `/api/v1/:instance/security`

|     |                URI                |        MongoDB Commands       |
| :-: | --------------------------------- | ----------------------------- |
| ⧠ | `/`                               | `db.getUsers` + `db.getRoles` |
| ⧠ | `/users`                          | `db.getUsers`                 |
| ✔︎ | `/users/:database_name/:username` | `db.getUser`                  |
| ⧠ | `/roles`                          | `db.getRoles`                 |
| ✔︎ | `/roles/:database_name/:role`     | `db.getRole`                  |

> incompletes just needs to always be scoped to `:database_name`


### Other Routes

#### `/api/v1`

List deployments.

> @todo: add section explaining internal deployment and instance schemas.

#### `/api/v1/token`

> @todo: api hacking directed explaination of auth

#### `/health-check`

Ping this to see if the http server is up.


## "Can I xxxx with mongoscope?"

### Read

|              function             | scope'd |
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

|              function              | scope'd |
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

|            function           |   scope'd   |
| ----------------------------- | ----------- |
| `collection.diskStorageStats` | skunkworks  |
| `collection.indexStats`       | skunkworks  |
| `collection.pagesInRAM`       | skunkworks  |
