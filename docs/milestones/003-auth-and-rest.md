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
- [ ] server: way to use token to map to connections and hosts

- [ ] add working section to onesheet for authentication
- [ ] send onesheet to security team and schedule review meeting
- [ ] `smongo` needs to support on the fly stream creation for a host
- [ ] can pass an initial seed uri to `/api/v1/token` that will add the first deployment
- [ ] api route to 'attach mongoscope', aka add a new deployment

- other rest features to push through on:
  - tailing / mydb / pub sub
  - aggregation
  - serverStatus
  - profiling
  - sharding
  - more replication methods
  - stream `currentOp`

### UI

- [ ] sign in form
- [ ] client side auth controller
- [ ] scoketio: time based tokens
  - [ ] client side
  - [ ] server side
- [ ] redo bootloader
