## security

- **all authorization handled on the mongod level**
- [json web token][jwt]:
  - secret per seed/deployment to limit exposure if there is an exploit
  - holds seed id and username
  - already have code for http and socket.io
  - emerging standard with lots of libraries in all major langs and frameworks
- how to store passwords?
  - store and send hashed password in the connection string
  - keep in memory for the lifetime of the session, user must re-enter
    - (`l`: seems best to me)
- kerberos, ldap etc options and inputs acessible from auth ui
- call [isMaster][cmd-isMaster] to bootstrap a seed
  - doesnt require auth so allows us to verify the user input
    and get the instance type (eg repl set member, mongos, standalone, etc)
- two factor auth?

- dont include token in places where it would be logged

[jwt]: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
[cmd-isMaster]: http://docs.mongodb.org/master/reference/method/db.isMaster/

### server startup

#### first run

- initialize first seed
  - did we get a host and port on the command line?
  - running mongod or mongos locally?
  - nope need to include input for host
- generate json web token secret for seed 0 and persist it
- now the server is in waiting for user mode

#### run n+1

- when initializing seed,
- user opens ui

### ux cases

#### auto-seeded

- i ssh to `scope.monogdb.land`
- i run `/etc/init.d/mongoscope start`
- i open `scope.monogdb.land:29017` in chrome and see a form
  - (note: only work if auth is enabled?)
- i enter my username and pasword, `scope` `scoep` of course
- oop misspelled, enter correct `scope` `scope`
- i'm in

#### demo mode

> I have created `demo` `demo` user in mongod already
> that has readOnly access to the `wikipedia.edits` collection,
> can view database/collection stats, can view all of the roles and
> users in the `wikipedia` database.

#### replica set member, auto-seeded

#### mongos, auto-seeded

#### running on my laptop with an ssh tunnel
