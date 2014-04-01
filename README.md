# mg

The MongoDB Launcher.

```
> ./bin/mg.js -h

The MongoDB Launcher
Usage: mg

Examples:
  mg              deploy all unicorns
  mg mongod       only start mongod
  mg mongorest    only start the rest server
```

## configuration

Temporary environment variables and defaults

 - `DEBUG`: `` logger names to print to console
 - `MG_LISTEN`: `http://localhost:29017` uri rest should listen on
 - `MG_CONNECT`: `mongodb://localhost:27017` uri to mongod to connect to
 - `MG_BIN`: `mongod` path to start mongod from if not already running
 - `MG_DBPATH`: `/data/db`

Recommended

```
DEBUG=* MG_DBPATH=~/.mongodb/data ./bin/mg.js
```

```
DEBUG=* MG_BIN=/srv/mongo/bin/mongod MG_DBPATH=~/.mongodb/data ./bin/mg.js
```

## dev

### install

```
npm install
```

### test

```
npm test
```

### bake binary

```
npm dist
```

## demo


    DEBUG=mg*,mongo* \
      MG_BIN=/srv/mongo/bin/mongod \
      MG_CONNECT=mongodb://localhost \
      MG_DBPATH=~/.mongodb/wikipedia ./bin/mg.js;

    ## Start listening to wikipedia edits to get real data
    cd ~/imlucas/wikipedia-edit-stream && node example.js;

    open http://localhost:3000/funnel.html;

    DEBUG=mg*,mongo* \
      MG_BIN=/srv/mongo/bin/mongod \
      MG_CONNECT=mongodb://scopey:scopey@localhost \
      MG_DBPATH=~/.mongodb/add-auth ./bin/mg.js;

[@10gen/mongoscope](https://github.com/10gen/mongoscope)

Packaged OSX binaries posted to [releases](https://github.com/10gen/mongoscope/releases)



## security

    killall mongod;
    rm -rf ~/.mongodb/data;
    npm start;

/srv/mongo/bin/mongo --eval "\
  db.rating.save( \
  {_id:'mongoscope', votes:[{you: 100}]})"
/srv/mongo/bin/mongo --eval "\
  admin = db.getSisterDB('admin'); \
  admin.createUser({ \
    user: 'scopey', pwd: 'scopey', \
    roles: [ \
    {role: 'clusterMonitor', db: 'admin'},\
    {role: 'readAnyDatabase', db: 'admin'},\
    {role: 'userAdmin', db: 'admin'} \
  ]});"

/srv/mongo/bin/mongo -u scopey -p scopey --authenticationDatabase admin --eval "\
  printjson(db.getSisterDB('admin').runCommand({usersInfo: 1}));";
