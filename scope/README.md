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


[node-install]: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
[node-download]: http://nodejs.org/download/
