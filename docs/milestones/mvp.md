# MVP [Milestone](../milestones.md)

## 0.2.0

> Mar 26th - Apr 2nd

### Punchlist

- [x] images not showing up when running from the binary `#bug` `2h`
- replica sets
  - [x] replication page `#replica` `1h`
  - [x] get mock data
  - [x] view status `{ replSetGetStatus : 1 }` `#replica`  `2h`
  - [x] view oplog size and time range `rs.printReplicationInfo()` `#replica`  `1h`
  - [x] view members and replication lag `rs.printSlaveReplicationInfo()` `#replica`  `1h`
- [ ] stream `currentOp` `#pulse` `2h`
- [ ] finish bootloader wiring to enable auto ui updating `2h`
- auth
  - [ ] shell prompt to [create admin user][create-admin] `2h`
  - [ ] `mg` starts mongod with `--auth` `#auth` `1h`
  - [ ] security tab `#auth` `4hr`
  - [ ] table view of [`system.users`][system.users]  `#auth` `2h`
  - [ ] table view of [`system.roles`][system.roles] `#auth` `2h`
  - [ ] view the [action matrix][user-actions] for a user or role `#auth` `4h`
- [x] bind donut on database view to real data `#database` `1h`
- [ ] graph of instance level lock `#pulse` `1h`
- [ ] databases list has quick stats `#pulse` `2h`

[create-admin]: http://docs.mongodb.org/manual/tutorial/add-user-administrator/
[user-actions]: http://docs.mongodb.org/master/reference/privilege-actions/#security-user-actions
[system.roles]: http://docs.mongodb.org/master/reference/system-roles-collection/
[system.users]: http://docs.mongodb.org/master/reference/system-users-collection/

## Backlog


### needsspec
  - [ ] authenticate via rest research `#auth`
  - [ ] pipeline builder UI `#aggregation`
  - [ ] read only shell `#shell`

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
