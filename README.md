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


## todo

- [ ] move mongod wrappers from rest up to this level
