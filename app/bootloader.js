// Bootloader entrypoint for mongoscope.
//
// Run `sterno` which will sync up our local version to latest if possible
// and run the app.
//
// @author Lucas Hrabovsky<lucas@mongodb.com>
var sterno = require('sterno'),
  config = localStorage.getItem,
  origin = config('mongoscope:origin') || 'https://10gen.github.io/mongoscope',
  assets = JSON.parse(config('mongoscope:assets') || '["/index.js", "/index.css"]'),
  manifestName = config('mongoscope:manifestName', '/sterno-manifest.json');

sterno(origin, assets, manifestName);
