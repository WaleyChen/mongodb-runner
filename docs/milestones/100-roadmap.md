# 1.0.0

> TBD

## Deliverables

- server
  - [ ] complete, web-friendly read-only rest api
  - [ ] cr-based authentication
- ui
  - [ ] deployments
    - [ ] connect to deployment
    - [ ] view deployment details and topology (replication and sharding status
    - [ ] easily view details for any instance
    - [ ] connect to another deployment
  - [ ] instances
    - [ ] view host and build details
    - [ ] view log
    - [ ] view top
    - [ ] view databases w/ high-level stats
    - [ ] view collections w/ high-level stats
- project
  - [ ] deployment setup
  - [ ] ground-work for qa and documentation

## Punchlist
- server
  - [ ] dns disambiguation
  - [ ] connecting automatically figures out the right deployment you want
    instead of creating a new one
  - [ ] connect to rs that is actually a cluster -> connect to cluster -> merges
    the two deployments
  - [ ] url vs. id vs. name cleanup
  - [ ] when a replicaset membership event happens, update the deployment
  - [ ] add tests to make sure if you try to connect to a config
    instance the world does not end
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

|     |         URI          |                 MongoDB Commands                 | Stream | Notes |
| --- | -------------------- | ------------------------------------------------ | ------ | ----- |
| [x] | `/`                  | `listDatabases` + `db.hostInfo` + `db.buildInfo` |        |       |
| [x] | `/metrics`           | `db.serverStatus`                                |        |       |
| [x] | `/ops`               | `db.currentOp`                                   | [x]    |       |
| [x] | `/log`               | `getLog`                                         | [x]    |       |
| [x] | `/top`               | `top`                                            | [x]    |       |
| [x] | `/replication`       | `rs.printReplicationInfo` + `rs.conf`            |        |       |
| [x] | `/replication/oplog` | `oplog.rs.find`                                  | [x]    |       |
| [x] | `/replication/watch` | no equivalent                                    | [x]    |       |

#### `/api/v1/:instance/:database_name`

|     |     URI     |           MongoDB Commands           | Stream | Notes |
| --- | ----------- | ------------------------------------ | ------ | ----- |
| [x] | `/`         | `db.stats` + `db.getCollectionNames` |        |       |
| [x] | `profiling` | `db.getProfilingStatus`              | [x]    |       |

#### `/api/v1/:instance/:database_name/:collection_name`

|     |   URI    |                          MongoDB Commands                         | Stream |                         Notes                          |
| --- | -------- | ----------------------------------------------------------------- | ------ | ------------------------------------------------------ |
| [x] | `/`      | `collection.stats` + `collection.getIndexes` + `collection.*Size` |        |                                                        |
| [x] | `/count` | `.find(:where).count()`                                           | [ ]    | :explain supported                                     |
| [x] | `/find`  | `.find(:where).limit(:limit).skip(:skip)`                         | [x]    | :explain supported. Only Stream for capped collections |

#### `/api/v1/:instance/security`

|     |                URI                |        MongoDB Commands       | Stream | Notes |
| --- | --------------------------------- | ----------------------------- | ------ | ----- |
| [ ] | `/`                               | `db.getUsers` + `db.getRoles` |        |       |
| [ ] | `/users`                          | `db.getUsers`                 |        |       |
| [x] | `/users/:database_name/:username` | `db.getUser`                  |        |       |
| [ ] | `/roles`                          | `db.getRoles`                 |        |       |
| [x] | `/roles/:database_name/:role`     | `db.getRole`                  |        |       |

> incompletes just needs to always be scoped to `:database_name`


### Other Routes

#### `/api/v1`

List deployments.

> @todo: add section explaining internal deployment and instance schemas.

#### `/api/v1/token`

> @todo: api hacking directed explaination of auth

#### `/health-check`

Ping this to see if the http server is up.


## Shell vs mongoscope

### Read

|              function             | scope'd |
| --------------------------------- | ------- |
| `collection.dataSize`             | yes     |
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
| `collection.getShardDistribution` | ?       |
| `collection.distinct`             | missing |
| `collection.find(...).sort`       | missing |
| `collection.getPlanCache`         | missing |
| `collection.getWriteConcern`      | missing |
| `collection.group`                | missing |
| `sh.getBalancerState`             | missing |
| `sh.isBalancerRunning`            | missing |
| `db.getWriteConcern`              | missing |


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
