# Sketch [Milestone](./milestones.md)

_Goal_ concrete things to point at on a screen and talk about

## Punchlist

- [x] `service` for getting data from the instance:
  - [x] mine [storage viz](http://github.com/10gen-labs/storage-viz)
  - [x] mine tyler's prototype
- [x] node.js proxy for CORS before C++ work
- [x] diagnostics
  - [x] platform name, version and family
  - [x] MongoDB version and git commit
  - [x] cpu stats
  - [x] physical memory stats
- [x] show global log
- [x] mongotop + mongostat
- [x] make the basic styles lineup and semi-presentable
- [ ] bootloader
  - [x] create `bootloader.js` that configures sterno
  - [x] make a nice `bootstrap.jade` splash screen
  - [x] gulp task generates a sterno manifest
  - [x] use [juice](https://github.com/learnboost/juice) to inline all the
    styles from `bootloader.css`
  - [x] inline css and js
  - [x] update C++ to always send back CORS headers and serve `bootloader.html`
    as the root for `http://localhost:28017`
  - [ ] bootloader transitions to app
- [ ] move to LESS and chop up MMS styles instead of copying this monster around
- [ ] wire in `bootstrap.js` plugins
- [ ] basic shell to run queries
- [ ] top shows delta values only


### bootloader

Want to have something in the C++ by the end of the week to start playing around
with that doesn't involve a dev changing anything; no proxy or nodejs install,
just start mongod and open localhost:28017.  Short-term, would be fastest and
easiest solution: modify C++ to serve 1 file and make `MiniWebServer` always
send CORS headers. Very fortunately, this is also a big part of the long-term
solution for `full embed`.

In mongoscope, we'll refer to this as the `bootloader`:

- show a nice little loading dialog
- see if there are changes to `mongoscope`
  - no changes? -> serve local cache
  - has changes? -> pull down new versions of assets, execute them and cache for
  later
