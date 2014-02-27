# Security Team

## Feb 26th, 2014

Met yesterday to start getting feedback on project from security side, the
short version being using the built-in web server was a bad idea.  Met up again
this afternoon to walk through options and pros/cons of each.

### tldr

golang: `mongorest` is [actually quite trivial](https://gist.github.com/imlucas/4a92e69c86478094bd76)
, very secure, already has a simple path for
[including web app assets in the same binary](https://github.com/jteeuwen/go-bindata),
and we're already investing in it for other projects.

### Option 1: retrofitting `dbwebserver.cpp`

#### Pro's

- some sort of code already in there that works enough to enable REST features
- just need to run `mongod` with a flag to enable and you're off to the races

#### Con's

- big investment in securing the wire protocol could result in an embarrassing
    exploit from an optional feature
- because the kernel itself would be in the same process, very easy to cause a
    buffer overflow
- would be an investment to make sure the web server is secure enough
- just made a big deal of turning it off by default


### Option 2: mongo launcher: mg

A separate binary that exposes REST API, uses the wire protocol to talk to
mongod and runs in it's own process:

```
brew install mongodb;
mg; # Start mongod, mongoscope in separate processes
```

#### Pro's

- running in a different process so if something silly happened, it wouldn't
    pull down or compromise your entire deployment
- removes current attack vector and ongoing concerns around http and can nuke
    all options/docs/customer-confusion around it
- easy to sandbox access, reusing all of the other investments made in drivers
- if there is an http vulnerability we have to publish, customers won't
    have to do anything unless they're actually using it
- still one command for the target Persona
- dozens of half done projects already out there that do the same thing
- high security customers completely out of possible attack vectors

#### Con's

- bigger distribution size (estimating ~10-15MB for a static go/node binary,
    which is inline with the size of other individual binary tools already in
    distribution)
- extra work to ship: write a launcher supervisor

### Conclusions

The security team stressed a strong preference for mongo launcher (separate
process space, completely segments high security deploys, binds to localhost
by default, etc).  Additionally, we also chatted quite a bit about what these
options might result in over the next 12 months that are extremely exciting:

- "you already have the binary. turn it on and it will prompt your for a credit
    card number to buy a license." -> completely remove the barrier of the
    customer having to do anything to setup and acquire the license for anything
    in the mms pipeline
- `mongorest` provides the guts for most pre-canned complimentary "premium"
    applications (seriously, how much would you pay to be able to just use
    a mongo instance with a plugin than ldap/saml/activerecord/other-craziness?)
- existing customers have to change exactly 0 about how they're managing the kernel
- get all the tooling out of $PATH (try running mongo + TAB and see all the
    random stuff that's still in there)
- move completely independently of kernel dev

The security team also noted the extra operational cost of our proposed update
model in terms of operational cost of put more in S3 + cloudfront to manage.
