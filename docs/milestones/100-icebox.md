## feature requests and ideas

in no particular order.  feel free to add your own.

Generate better fixtures with http://www.json-generator.com/

### `#shell`
  - read only shell
  - mine docs for autocomplete http://docs.mongodb.org/master/reference/command/
  - tabbed shells
  - extensible enough to support
    - imonogo (eg `histogram('users', 'friend_count')`)
    - run script from gist url.  https://developer.github.com/v3/gists/

### `#stats`
  - pulse level:
    - [working set](http://docs.mongodb.org/master/reference/command/serverStatus/#workingset)
    - [index counters](http://docs.mongodb.org/master/reference/command/serverStatus/#indexcounters)
    - [memory usage](http://docs.mongodb.org/master/reference/command/serverStatus/#mem)
    - [connection churn](https://github.com/rueckstiess/mtools/wiki/mplotqueries#connection-churn-plot)

  - [ ] excel drag and drop: Want to take a CSV file, drop it in on
    mongoscope and start manipulating it with mongo.  shouldn’t have to
    know how to program to use mongo
  - [ ] shell recommends indexes like [dex](http://blog.mongolab.com/2012/06/introducing-dex-the-index-bot/)
  - [ ] schema analysis like [variety](https://github.com/variety/variety)
  - [ ] might be something here or someone to lend an extra hand? https://github.com/Zarkantho/mongoui

#### kiosk mode

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


Explore a collection as a 3d grid like http://mrdoob.github.io/three.js/examples/css3d_periodictable.html


Nudge the user with out of the box templates for schema design, eg
"here is a good user model, activity stream, etc go nuts!"

Probabalistic counters -> feature request from professor barrentine

like the influx db story.  shouldn’t have to set anything else up if you
have mongo and scope installed to have your own stupidly basic time-series
dashboard.


Make `mongolog` support more fields:
```
 fields = ['_id', 'datetime', 'operation', 'thread', 'namespace', 'nscanned', 'nreturned', 'duration', 'numYields', 'w', 'r']
 ```
 see https://github.com/rueckstiess/mtools/blob/master/mtools/util/logevent.py

