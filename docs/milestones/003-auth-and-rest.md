## 0.0.3

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

- [x] add working section to onesheet for authentication
- [x] send onesheet to security team and schedule review meeting

- other rest features to push through on:
  - [x] tailing / mydb / pub sub
  - [x] serverStatus
  - [x] stream `currentOp`
  - [x] aggregation
  - [x] profiling

### UI

- [x] sign in form
- [x] client side auth controller
