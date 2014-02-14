# MVP [Milestone](./milestones.md)

_Goal_ Something usable

## Punchlist

_@note_ not prioritized at all or filtered by target personas

- [ ] use `ping` command to show nice message if --rest not enabled
- [ ] offline support: (AppCache? Modify sterno to use mozilla/localForage?)
- [ ] instance actions
  - [ ] setParameter
  - [ ] getParameter
  - [ ] logRotate
  - [ ] getCmdLineOpts
  - [ ] profiling settings
  - [ ] toggle profiling
- [ ] database actions
  - [ ] create
  - [ ] clone
  - [ ] drop
  - [ ] repair
  - [ ] fsync
- [ ] create collection
- [ ] create ttl collection
- [ ] create capped collection
- [ ] collection actions from dropdown
  - [ ] rename
  - [ ] clone
  - [ ] clone as capped
  - [ ] remove
  - [ ] drop indexes
  - [ ] compact
  - [ ] reIndex
  - [ ] touch
  - [ ] validate
- [ ] create index
- [ ] remove index
[ ] [change index ttl](http://docs.mongodb.org/manual/reference/command/collMod/#index)
- [ ] documents (simple data browser like dynamo has in the aws console)
  - [ ] find
  - [ ] insert
  - [ ] remove
  - [ ] update
- [ ] view and edit instance level auth config
- [ ] auth users
  - [ ] list
  - [ ] add
  - [ ] remove
  - [ ] change password
  - [ ] add role
  - [ ] remove role
  - [ ] view a list of all databases a user has access to
- [ ] auth roles
  - [ ] list
  - [ ] view
  - [ ] add
  - [ ] remove
- [ ] aggregation query builder
- [ ] view results of system.profile
- [ ] visualize authentication


## Stretch

- [ ] figure out relevant stats for sharding
- [ ] view and edit sharding config
- [ ] figure out relevant stats for replication
- [ ] view and edit replication config
- [ ] view and kill currently running operations
- [ ] plan for tracking usage and analytics
