# MVP [Milestone](../milestones.md)

## 0.2.0

> Mar 26th - Apr 2nd

### Punchlist

- [x] images not showing up when running from the binary `#bug` `2h`
- [x] bind donut on database view to real data `#database` `1h`
- replica sets
  - [x] replication page `#replica` `1h`
  - [x] get mock data
  - [x] view status `{ replSetGetStatus : 1 }` `#replica`  `2h`
  - [x] view oplog size and time range `rs.printReplicationInfo()` `#replica`  `1h`
  - [x] view members and replication lag `rs.printSlaveReplicationInfo()` `#replica`  `1h`
- auth
  - [x] shell prompt to [create admin user][create-admin] `2h`
  - [x] `mg` starts mongod with `--auth` `#auth` `1h`
  - [x] security tab `#auth` `4hr`
  - [x] view a list of users `#auth` `2h`
  - [x] view roles `#auth` `2h`
  - [x] view the [action matrix][user-actions] for a user or role `#auth` `4h`
  - [x] user actions contain friendly descriptions extracted from @mongodb/docs
- [ ] databases list has quick stats `#pulse` `2h`

[create-admin]: http://docs.mongodb.org/manual/tutorial/add-user-administrator/
[user-actions]: http://docs.mongodb.org/master/reference/privilege-actions/#security-user-actions

## Backlog

- [ ] stream `currentOp` `#pulse` `2h`
- [ ] finish bootloader wiring to enable auto ui updating `2h`

## Icebox

  - [ ] authenticate via rest research `#auth`
  - [ ] pipeline builder UI `#aggregation`
  - [ ] read only shell `#shell`
  - [ ] [working set](http://docs.mongodb.org/master/reference/command/serverStatus/#workingset)
  - [ ] [index counters](http://docs.mongodb.org/master/reference/command/serverStatus/#indexcounters)
  - [ ] [memory usage](http://docs.mongodb.org/master/reference/command/serverStatus/#mem)
  - [ ] [more metrics](http://docs.mongodb.org/master/reference/command/serverStatus/#metrics) for pulse
  - [ ] excel drag and drop: Want to take a CSV file, drop it in on
    mongoscope and start manipulating it with mongo.  shouldn’t have to
    know how to program to use mongo
  - [ ] data density info
  - [ ] tabbed shells
  - [ ] sublime text / atom integrations
  - [ ] connect to instance with ssh + reverse tunnel (eg on my laptop,
    use my ec2 pem to work against my dev server in the clouds)
  - [ ] set up local shard/repl set/etc for testing like
    [mlaunch](https://github.com/rueckstiess/mtools/wiki/mlaunch).
    extract from `shell/servers.js`, `shell/replsettest.js`, and
    `shell/shardingtest.js`
  - [ ] extract from [mplotqueries](https://github.com/rueckstiess/mtools/wiki/mplotqueries)
    - more like an expansion on top rather than reading from log files
    - [replica set state](https://github.com/rueckstiess/mtools/wiki/mplotqueries#replica-set-state-plot)
    - [connection churn](https://github.com/rueckstiess/mtools/wiki/mplotqueries#connection-churn-plot)
  - [ ] visualize query plan as a flame graph like stackvis http://us-east.manta.joyent.com/dap/public/stackvis/example.htm
  - [ ] shell recommends indexes like [dex](http://blog.mongolab.com/2012/06/introducing-dex-the-index-bot/)
  - [ ] schema analysis like [variety](https://github.com/variety/variety)
  - [ ] slow query finder like https://github.com/idealo/mongodb-slow-operations-profiler
  - [ ] might be something here or someone to lend an extra hand? https://github.com/Zarkantho/mongoui



### read actions

> things we can do

#### instance

- getParameter
- getCmdLineOpts
- view profiling config
- view profiling data

### write actions

> things we'll need to wait on

#### instance

- setParameter
- logRotate
- enable/disable profiling
- edit auth config

#### database

- create
- clone
- drop
- repair
- fsync

#### collection

- create
- create ttl
- create capped
- rename
- clone
- clone as capped
- remove
- drop indexes
- compact
- reIndex
- touch
- validate
- create index
- remove index
- [change index ttl](http://docs.mongodb.org/manual/reference/command/collMod/#index)
- insert document
- remove document
- update document

#### auth

- create user
- remove user
- change user password
- edit user role
- create role
- remove role

## Stretch

- sharding: see `shell/utils_sh.js` in server
  - `addShard( host )` - server:port OR setname/server:port
  - `enableSharding(dbname` - enables sharding on the database dbname
  - `shardCollection(fullName,key,unique` - shards the collection"
  - `splitFind(fullName,find` - splits the chunk that find is in at the median"
  - `splitAt(fullName,middle` - splits the chunk that middle is in at middle"
  - `moveChunk(fullName,find,to` - move the chunk where 'find' is to 'to' (name of shard)
  - `setBalancerState( <bool on or not> )` - turns the balancer on or off true=on, false=off"
  - `getBalancerState()` - return true if enabled"
  - `isBalancerRunning()` - return true if the balancer has work in progress on any mongos"
  - `addShardTag(shard,tag` - adds the tag to the shard"
  - `removeShardTag(shard,tag` - removes the tag from the shard"
  - `addTagRange(fullName,min,max,tag` - tags the specified range of the given collection"
  - `status()` - prints a general overview of the cluster
  - visualization http://blog.mongodb.org/post/31518267651/mongodb-sharding-visualizer
  - visualize migration https://github.com/reversefold/tourist

## Taxonomy

<dl>
  <dt>collection</dt>
  <dd>the collection entity page: `http://localhost:29017/#collection/test/rating`</dd>

  <dt>pulse</dt>
  <dd>Home page, dashboard, index: `http://localhost:29017/`</dd>

  <dt>log</dt>
  <dd>parsed version of getLog results: `http://localhost:29017/#log`</dd>

  <dt>top metric</dt>
  <dd>key returned from top: `total.count`, `test.rating.lock.count`, etc</dd>

  <dt>data table</dt>
  <dd>page through results of a find</dd>

  <dt></dt>
  <dd></dd>

</dl>
