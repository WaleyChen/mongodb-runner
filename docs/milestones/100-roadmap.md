# 1.0.0

> TBD

## Deliverables

- server
  - [x] cr-based authentication
  - [x] complete
  web-friendly read-only rest api
  - [ ] test coverage at ?%
- ui
  - deployment
    - [x] connect
    - [x] connect to another deployment
    - [x] replicaset details
    - [x] connect to any instance
  - replicaset
    - [x] oplog details
    - [x] configuration details
    - [ ] oplog stream
    - [ ] replication sync progressbar
  - cluster
    - [x] shards
  - instance
    - [x] host detail
    - [x] build detail
    - [x] log
    - [x] list of databases
    - [x] connection stream
    - [x] currentop stream
    - [ ] top
    - [ ] index build progressbar
    - [ ] map reduce job progressbar
  - database
    - [x] dbStats
    - [x] list of collections
  - collection
    - [x] collStats
    - [x] list of indexes
  - index
    - [x] index spec
    - [ ] handle single index
    - [ ] handle compound index
    - [ ] handle multikey index
    - [ ] handle geo index
    - [ ] handle text index
    - [ ] handle hashed index
    - [ ] handle ttl index
    - [ ] handle unique index
    - [ ] handle sparse index
- project
  - [ ] deployment setup
  - [ ] ground-work for qa and documentation

## Punchlist

- server
  - [x] url vs. id vs. name cleanup
  - [x] dns disambiguation
  - [X] replication: instance ids and names not using deployment level info
  - [X] clean up replication and move to monger
  - [X] include config instances in cluster deployment
  - [X] auto namer improvements
  - [ ] connecting automatically figures out the right deployment
    you want instead of creating a new one (needs test)
  - [x] connect to rs that is actually a cluster -> connect to
    cluster -> merges the two deployments (have test
    need server business)
- ui
  - [x] bug: instance list stomped when switching in ui
  - [X] Bug: instance type not cleared on home
  - [X] Bug: top should just start at 0 instead of having loading state
  - [X] Replicaset view
  - [X] instance id in URL instead of just home for copy and paste/bookmarkability
  - [X] oplog details on instance home
  - [x] handle [empty databases](http://localhost:29017/#lucass-macbook-pro.local:27017/database/test)
- project
  - [x] jira
  - [ ] roadmap
  - [ ] setup mci project
  - [ ] automated build deploy for windows, nix and osx
