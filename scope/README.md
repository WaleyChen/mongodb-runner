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


to embed scope in rest for distribution

    npm run-script build

### test

    npm test

### deploy

to update [10gen.github.io/mongoscope/](10gen.github.io/mongoscope/)

  npm run-script deploy

quite soon, i'll setup wercker to just do this automatically when changes
merged into master.

## code tour

[browserify](http://browserify.org) uses the main entrypoint
[`./app/index.js`](./blob/master/app/index.js) to create the
`./.build/app/index.js` which is actually served to the browser and should not
be checked in.

### app

- [`./app/index.js`](./blob/master/app/index.js) main entrypoint
- [`./app/controllers/*`](./blob/master/app/controllers)
  [backbone.js](http://backbonejs.org) views that pull json from the rest api
  and handle all the event binding and template rendering
- [`./app/models.js`](./blob/master/app/models.js) [backbone.js](http://backbonejs.org)
  models the controllers use for their data
- [`./app/service.js`](./blob/master/app/service.js) abstracts away all of
  the mongod rest api calls and makes their responses easier to reason about
- [`./app/templates`](./blob/master/app/templates) [jade](http://jade-lang.com/) is
  mongoscope's templating engine


### templating

- [`./app/templates/index.jade`](./blob/master/app/templates/index.jade) creates the
  HTML shell for the app
- [`./app/templates/*.jade`](./blob/master/app/templates) are precompiled by the
  [jadeify](https://github.com/domenic/jadeify) transform

### meta

- [`./docs/*`](./blob/master/docs) collection of markdown docs with
  brainstorming, roadmap, and process notes


[node-install]: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
[node-download]: http://nodejs.org/download/
