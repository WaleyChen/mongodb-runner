// Bootloader entrypoint for mongoscope.
//
// Run `sterno` which will sync up our local version to latest if possible
// and run the app.
//
// @author Lucas Hrabovsky<lucas@mongodb.com>
var sterno = require('sterno'),
  /*origin = localStorage.getItem('mongoscope:origin') || 'http://10gen.github.io/mongoscope',*/
  origin = localStorage.getItem('mongoscope:origin') || 'http://mongoscope.dev',
  assets = JSON.parse(localStorage.getItem('mongoscope:assets') || '["/index.js", "/index.css"]');

sterno(origin, assets, {manifest: '/sterno-manifest.json'});
