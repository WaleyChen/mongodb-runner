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
# assumptions: auth=false and mongod and scope running on localhost on the default ports
# Let's just ping the api and see what it does
curl -X GET http://localhost:29017/api/v1/;

export TOKEN=`curl -H "Accept: text/plain" -s http://localhost:29017/api/v1/token -d "seed=localhost:27017"`;
echo "Here is an auth token.  It's valid for about an hour: $TOKEN";

# Lot's of things in MongoDB can be consumed in all sorts of different ways,
# and scope wants to make it as easy as possible for you to do anything.
#
# As you saw above with token generation, scope is highly responsive
# to content negotiation.  In most cases, and judging by your 'I ♥ JSON' t-shirt',
# you'll want to use json:

curl -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' http://localhost:29017/api/v1/;

# And you should get some output along the lines of:
# [
#   {
#     "_id": "lucass-macbook-air.local:27017",
#     "seed": "lucass-macbook-air.local:27017",
#     "instances": [
#       {
#         "_id": "lucass-macbook-air.local:27017"
#       }
#     ]
#   }
# ]
#
# @todo: intro to deployments and instances?
#
# Content negotiation allows much more than that though.  Let's take top
# for example. Top can respond to a normal REST style read:
curl -H "Authorization: Bearer $TOKEN" -H 'Accept: application/json' http://localhost:29017/api/v1/localhost:27017/top;

# That's ... OK but top is really powerful and best consumed over time.
# What if we could just make one request that will keep sending us up to
# the second updates about what is actually happening on the instance?
# Turns out, the smart folks of the internet already have a protocol for that
# called "Server-Sent Events":
curl -X GET -H "Accept: text/event-stream" -H "Authorization: Bearer $TOKEN" "http://localhost:29017/api/v1/localhost:27017/top";

# Pretty nice, eh?  If your instance isn't doing anything, notice how you're
# still connected but not getting any updates.  Go ahead and run some queries
# on your instance and watch your terminal dance.  Hit ctrl+c to continue.
#
#
# You can do this for just about any of the scope api calls.  How about
# `db.currentOp()`?
curl -X GET -H "Accept: text/event-stream" -H "Authorization: Bearer $TOKEN" "http://localhost:29017/api/v1/localhost:27017/ops";

Say we want to
# nom nom all oplog events nom nom, a blow by blow of all writes to a replica set
# if you're not familiar with the jargon.
curl -X GET -H "Accept: text/event-stream" -H "Authorization: Bearer $TOKEN" "http://localhost:29017/api/v1/localhost:27017/replication/oplog";

# That's cool but what if you wanted to write a little script that made your
# terminal BELL every time someone with a mongodb email address created an
# signed up for your app?
#
# BOOM.  scope supports filtering your view of le' oplog!
export FILTERS='[["collection", "users"], ["email", "mongodb.com$"]]';
curl -X GET -H "Accept: text/event-stream" -H "Authorization: Bearer $TOKEN" "http://localhost:29017/api/v1/localhost:27017/replication/oplog?filters=$FILTERS";

# Wouldn't it be event better if now that you have your terminal BELL script,
# you could get notified when instances in your replica set get the blues?
# You can watch for replication events like reconnects, joins, and leaves:
curl -X GET -H "Accept: text/event-stream" -H "Authorization: Bearer $TOKEN" "http://localhost:29017/api/v1/localhost:27017/replication";
```
