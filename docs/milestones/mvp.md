# MVP [Milestone](../milestones.md)

## 0.2.0

> Mar 26th - Apr 2nd

### Punchlist

- [x] images not showing up when running from the binary `#bug` `2h`
- [ ] bind donut on database view to real data `#database` `1h`
- [ ] graph of instance level lock `#pulse` `1h`
- [ ] databases list has quick stats `#pulse` `2h`
- [ ] if instance is a member of a replica set, enable menu item `#replica` `1h`
- [ ] view status `{ replSetGetStatus : 1 }` `#replica`  `2h`
- [ ] view oplog size and time range `rs.printReplicationInfo()` `#replica`  `1h`
- [ ] view members and replication lag `rs.printSlaveReplicationInfo()` `#replica`  `1h`
- [ ] stream `currentOp` `#pulse` `2h`
- [ ] finish bootloader wiring to enable auto ui updating `2h`

### Prioritize Me

- [ ] ACL visualization "auth user view" (biggie.) `#auth` `#needsspec`
- [ ] list users `#auth`
- [ ] list roles `#auth`
- [ ] authenticate via rest research `#auth`
- [ ] backend pieces (eg middleware to enforce) `#auth`
- [ ] front-end login forms `#auth`
- [ ] pipeline builder UI `#aggregation` `#needsspec`
- [ ] read only shell `#shell` `#needsspec`

## Backlog

_@note_ not prioritized at all or filtered by target personas

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
