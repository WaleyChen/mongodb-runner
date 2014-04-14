# mongoscope

![mongoscope-demo-v0.0.3](https://cloud.githubusercontent.com/assets/23074/2688434/2d1f3b5a-c29e-11e3-969a-367020b729b6.gif)


```
> ./bin/mongoscope.js
```

## settings

- `listen`: what the http interface should listen on. default `127.0.0.1:29017`
- `seed`: url of an initial deployment to discover on startup. default `mongodb://localhost:27017`
- `token:lifetime`: minutes to allow tokens to be used before requiring a new one. default `60`
- `token:secret`: string used to sign and verify tokens.

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
npm run-script dist
```

## curl party

```
npm install -g jsontool;

# assuming you dont have auth on and are running mongod
export TOKEN=`curl -s http://localhost:29017/api/v1/token --data "seed=mongodb://localhost:27017" | json token`;

# top can respond to a normal REST style GET
curl -X GET "http://localhost:29017/api/v1/localhost:27017/top?access_token=$TOKEN";

# Fun things happen though if we kick the server into server-sent events mode
curl -X GET -H 'Accept: text/event-stream' "http://localhost:29017/api/v1/localhost:27017/top?access_token=$TOKEN";

# nom nom all oplog events nom nom:
curl -X GET -H 'Accept: text/event-stream' "http://localhost:29017/api/v1/localhost:27017/replication/oplog?access_token=$TOKEN";

# filtered view of le' oplog:
export FILTERS='[['collection', 'users'], ['email', 'mongodb.com$']]';
curl -X GET -H 'Accept: text/event-stream' "http://localhost:29017/api/v1/localhost:27017/replication/oplog?access_token=$TOKEN&filters=$FILTERS";

# Watch replica set events => reconnects, joins, leaves:
curl -X GET -H 'Accept: text/event-stream' "http://localhost:29017/api/v1/localhost:27017/replication/watch?access_token=$TOKEN";
```
