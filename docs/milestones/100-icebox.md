# features

## `#aggregation`

- [ ] pipeline builder UI

## `#shell`
  - read only shell
  - mine docs for autocomplete http://docs.mongodb.org/master/reference/command/
  - tabbed shells
  - extensible enough to support
    - imonogo (eg `histogram('users', 'friend_count')`)
    - run script from gist url.  https://developer.github.com/v3/gists/

## `#stats`
  - pulse level:
    - [working set](http://docs.mongodb.org/master/reference/command/serverStatus/#workingset)
    - [index counters](http://docs.mongodb.org/master/reference/command/serverStatus/#indexcounters)
    - [memory usage](http://docs.mongodb.org/master/reference/command/serverStatus/#mem)
    - [even more metrics](http://docs.mongodb.org/master/reference/command/serverStatus/#metrics)
    - [connection churn](https://github.com/rueckstiess/mtools/wiki/mplotqueries#connection-churn-plot)

  - collection level data density stats

  - [ ] excel drag and drop: Want to take a CSV file, drop it in on
    mongoscope and start manipulating it with mongo.  shouldn’t have to
    know how to program to use mongo
  - sublime text / atom integrations
  - set up local shard/repl set/etc for testing like
    [mlaunch](https://github.com/rueckstiess/mtools/wiki/mlaunch).
    extract from `shell/servers.js`, `shell/replsettest.js`, and
    `shell/shardingtest.js`
  - [ ] extract from [mplotqueries](https://github.com/rueckstiess/mtools/wiki/mplotqueries)
    - more like an expansion on top rather than reading from log files
  - [ ] visualize query plan as a flame graph like stackvis
    http://us-east.manta.joyent.com/dap/public/stackvis/example.htm
  - [ ] shell recommends indexes like [dex](http://blog.mongolab.com/2012/06/introducing-dex-the-index-bot/)
  - [ ] schema analysis like [variety](https://github.com/variety/variety)
  - [ ] slow query finder like https://github.com/idealo/mongodb-slow-operations-profiler
  - [ ] might be something here or someone to lend an extra hand? https://github.com/Zarkantho/mongoui

## `#sharding`

### read

  - see `shell/utils_sh.js` in server
  - `getBalancerState()` - return true if enabled"
  - `isBalancerRunning()` - return true if the balancer has work in progress on any mongos"
  - `status()` - prints a general overview of the cluster

### write

  - `addShard( host )` - server:port OR setname/server:port
  - `enableSharding(dbname` - enables sharding on the database dbname
  - `shardCollection(fullName,key,unique` - shards the collection"
  - `splitFind(fullName,find` - splits the chunk that find is in at the median"
  - `splitAt(fullName,middle` - splits the chunk that middle is in at middle"
  - `moveChunk(fullName,find,to` - move the chunk where 'find' is to 'to' (name of shard)
  - `setBalancerState( <bool on or not> )` - turns the balancer on or off true=on, false=off"
  - `addShardTag(shard,tag` - adds the tag to the shard"
  - `removeShardTag(shard,tag` - removes the tag from the shard"
  - `addTagRange(fullName,min,max,tag` - tags the specified range of the given collection"

### kiosk mode

beacause there will be a lot of demoing...

> I have created `demo` `demo` user in mongod already
> that has readOnly access to the `wikipedia.edits` collection,
> can view database/collection stats, can view all of the roles and
> users in the `wikipedia` database.

## EKG

- EKG-like viz of instance health fills header and provides background
- Full-screen/dim-the-lights-mode: just EKG and hostname on dark background
- Is something is wrong, background flashing red
- This is going to be fucking rad as a Phonegap app

## MongoDBSpeed

- Graded Health based on best practices
- What would [YSlow!](http://developer.yahoo.com/yslow/) or
  [PageSpeed](https://developers.google.com/speed/pagespeed/) grading
  rules be for a instance?

## MongoDB University integration

- Use the shell as a tutorial/wizard-mode?
- "Install mongodb" -> click here to launch mongoscope shell in fullscreen
  mode
