# mongoscope

The microscope to the MMS telescope.  Comes with the MongoDB binary.

## [milestones](./blob/master/docs/milestones.md) | [ux](./blob/master/docs/ux.md) | [brainstorming](./blob/master/docs/brainstorming.md)

## dev

install nodejs with your [favorite package manager][node-install] or a
[download][node-download] and clone this repo.  To install of of mongoscope's
dependencies, just run:

    npm install

### run

to dev or run your own mongoscope, just run

    npm start

more details are available in the [`gulpfile`](./blob/master/gulpfile.js)

### test

    npm test

## code tour

[browserify](http://browserify.org) uses the main entrypoint
[`app.js`](./blob/master/app.js) to create the
`./static/app.js` which is actually served to the browser and should not
be checked in.

### app

- [`./controllers/*`](./blob/master/controllers)
  [backbone.js](http://backbonejs.org) views that pull json from the rest api
  and handle all the event binding and template rendering
- [`./models.js`](./blob/master/models.js) [backbone.js](http://backbonejs.org)
  models the controllers use for their data
- [`./app.js`](./blob/master/app.js) defines the URL routing as well as serving
  as the main entrypoint
- [`./static`](./blob/master/static) all dependency assets like fonts and css.
  this folder can just be dropped and served somewhere
- [`./templates`](./blob/master/templates) [jade](http://jade-lang.com/) is
  mongoscope's templating engine


### templating

- [`./templates/index.jade`](./blob/master/templates/index.jade) creates the
  HTML shell for the app
- [`./templates/*.jade`](./blob/master/templates) are precompiled by the
  [jadeify](https://github.com/domenic/jadeify) transform

### meta

- [`./docs/*`](./blob/master/controllers) collection of markdown docs with
  brainstorming, roadmap, and process notes



### things to move to their own modules

- [`./mongodb-api-proxy`](./blob/master/mongodb-api-proxy) instead of
  having to wait for features to be implemented in C++ land a stupid-simple
  proxy for living in the future and experimenting before committing
- [`./lib/service.js`](./blob/master/lib/service.js) abstracts away all of
  the mongod rest api calls and makes their responses easier to reason about
- [`./lib/roar.js`](./blob/master/lib/roar.js) mongoscope has a lot of regex
  action and roar provides a way to organize them in a non-shitty way and
  provide some higher level functionality for them as in other languages


[node-install]: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
[node-download]: http://nodejs.org/download/
