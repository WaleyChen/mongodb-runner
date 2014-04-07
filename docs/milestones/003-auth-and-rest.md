## 0.3.0

> Apr 3nd - Apr 16

### Punchlist

- [x] auth research
- [x] REST: time based tokens
  - [x] client side
  - [x] server side
- [x] client side doesn't bail out if not authenticated
- [x] find/count/explain can take actual queries
- [x] api root used to look up deployments
- [x] on startup, use localhost/cli option as initial seed
- [x] routes account for any host
- [x] server: way to use token to map to connections and hosts
- [x] can pass an initial seed uri to `/api/v1/token` that will add the first deployment
- [x] api route to 'attach mongoscope', aka add a new deployment
- [x] `smongo` needs to support on the fly stream creation for a host

- [ ] add working section to onesheet for authentication
- [ ] send onesheet to security team and schedule review meeting

- other rest features to push through on:
  - [x] tailing / mydb / pub sub
  - [x] serverStatus
  - [x] stream `currentOp`
  - [x] aggregation
  - [x] profiling
  - [ ] sharding
    - [ ] see `shell/utils_sh.js` in server
    - [ ] `getBalancerState()` - return true if enabled"
    - [ ] `isBalancerRunning()` - return true if the balancer has work in progress on any mongos"
    - [ ] `status()` - prints a general overview of the cluster
  - [ ] more replication methods
    - db.serverConfig.on('joined|left|reconnect')
  - sse
    - https://segment.io/blog/2014-04-03-server-sent-events-the-simplest-realtime-browser-spec/
    - https://github.com/segmentio/sse
    - http://www.html5rocks.com/en/tutorials/eventsource/basics/
    - https://github.com/Yaffle/EventSource/
  - [ ] parallelCollectionScan -> export collection
  - [ ] initializeOrderedBulkOp -> import to collection

### UI

- [ ] sign in form
- [ ] client side auth controller
- [ ] scoketio: time based tokens
  - [ ] client side
  - [ ] server side
- [ ] redo bootloader
