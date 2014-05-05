# 1.0.0

> TBD

## Deliverables

- server
  - [x] cr-based authentication
  - [x] complete, web-friendly read-only rest api
  - [ ] test coverage at ?%
- ui
  - deployment
    - [x] connect
    - [x] connect to another deployment
    - [x] replicaset details
    - [ ] connect to any instance
  - replicaset
    - [ ] oplog stream
    - [ ] replication sync progressbar
    - [ ] topology viz from mms
  - cluster
    - [ ] shards
    - [ ] chunks
    - [ ] balancer running viz
  - instance
    - [x] host detail
    - [x] build detail
    - [x] log
    - [ ] top
    - [x] list of databases
    - [ ] connection stream
    - [ ] currentop stream
    - [ ] index build progressbar
    - [ ] map reduce job progressbar
  - database
    - [ ] dbStats
    - [ ] list of collections
  - collection
    - [x] collStats
    - [x] list of indexes
  - index
    - [x] index spec
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
  - [ ] connect to rs that is actually a cluster -> connect to
    cluster -> merges the two deployments (have test, need server business)
  - [ ] progress bars
- ui
  - [x] bug: instance list stomped when switching in ui
  - [X] Bug: instance type not cleared on home
  - [X] Bug: top should just start at 0 instead of having loading state
  - [X] Replicaset view
  - [X] instance id in URL instead of just home for copy and paste/bookmarkability
  - [X] oplog details on instance home
  - [ ] handle [empty collections](http://localhost:29017/#lucass-macbook-pro.local:27017/database/test)
- project
  - [x] jira
  - [ ] roadmap
  - [ ] setup mci project
  - [ ] automated build deploy for windows, nix, and osx
  - [ ] making the server handle deployment level events (eg new
    instance in rs -> update store -> broadcast to clients) need to be
    their own release
