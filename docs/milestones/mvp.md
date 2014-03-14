# MVP [Milestone](../milestones.md)

## 0.1.0

> Mar 12th - Mar 26th
> @imlucas on vacation 17th - 21st

### Carry Over

- [x] timing issues around controllers replacing content
- [x] needs to be more obvious if your instance is empty

### Punchlist

- [x] rest bails on a silly log regex failure `#bug`
- [x] refine index meta and stats, e.g. spec & size `#collection`
- [x] reconnect collection lock % from backend to chart data `#collection`
- [x] button to bring up data table instead of running automatically `#collection`
- [x] simple paging for data table `#collection`
- [ ] small tighten up for log view reliability and usability `#log`
- [x] update instance info template to use new schemas `#info`

## 0.2.0

> Mar 26th - Apr 2nd

### Punchlist

> empty

### Prioritize Me

- [ ] top supports filtering keys by regex `#pulse`
- [ ] graph of instance level lock `#pulse`
- [ ] refine databases list `#pulse`
- [ ] stream `currentOp` `#pulse`
- [ ] ACL visualization "auth user view" (biggie.) `#auth` `#needsspec`
- [ ] list users `#auth`
- [ ] list roles `#auth`
- [ ] view status `{ replSetGetStatus : 1 }` `#replica`
- [ ] view oplog size and time range `rs.printReplicationInfo()` `#replica`
- [ ] view members and replication lag `rs.printSlaveReplicationInfo()` `#replica`
- [ ] authenticate via rest research `#auth`
- [ ] backend pieces (eg middleware to enforce) `#auth`
- [ ] front-end login forms `#auth`
- [ ] pipeline builder UI `#aggregation` `#needsspec`
- [ ] read only shell `#shell` `#needsspec`

## Backlog

_@note_ not prioritized at all or filtered by target personas

- [ ] images not showing up when running from the binary `#bug`
- [ ] finalize bootloader and start deploying like whoa

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

- sharding.


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
