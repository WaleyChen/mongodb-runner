# Sketch [Milestone](../milestones.md)

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
- [ ] move to LESS and chop up MMS styles instead of copying this monster around
- [ ] wire in `bootstrap.js` plugins
- [ ] token based auth?
- [ ] reorganize repo now that we have rest/launcher stuff
- [ ] update service.js for ui to account for new rest backend



## Stretch

- [ ] basic shell to run queries
- [ ] top shows delta values only
