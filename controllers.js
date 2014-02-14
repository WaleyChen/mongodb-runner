var OneShot = require('./lib').OneShot;


var ace = require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');


module.exports.diagnostics = new OneShot({
  tpl: require('./templates/diagnostics.jade'),
  model: {
    model: {
      'version' : '2.5.6-pre-',
      'gitVersion' : '518cbb85a00e4e9ac7dc419569aacc3216db45d2',
      'OpenSSLVersion' : '',
      'sysInfo' : 'Darwin Lucass-MacBook-Air.local 13.0.0 Darwin Kernel Version 13.0.0: Thu Sep 19 22:22:27 PDT 2013; root:xnu-2422.1.72~6/RELEASE_X86_64 x86_64 BOOST_LIB_VERSION=1_49', 'loaderFlags' : '-fPIC -pthread -Wl,-bind_at_load -mmacosx-version-min=10.6', 'compilerFlags' : '-Wnon-virtual-dtor -Woverloaded-virtual -fPIC -fno-strict-aliasing -ggdb -pthread -Wall -Wsign-compare -Wno-unknown-pragmas -Winvalid-pch -Werror -pipe -O3 -Wno-unused-function -Wno-unused-private-field -Wno-deprecated-declarations -Wno-tautological-constant-out-of-range-compare -mmacosx-version-min=10.6',
      'allocator' : 'tcmalloc', 'versionArray' : [ 2, 5, 6, -100 ],
      'javascriptEngine' : 'V8',
      'bits' : 64,
      'debug' : false,
      'maxBsonObjectSize' : 16777216
    },
    mongodb: {version: '2.5.6'},
    platform: {}
  },
  source: 'buildInfo',
  parse: function(res){
    // @todo: Parse uname from `res.sysInfo` to determine `model.platform.*`.
    return {buildInfo: res};
  }
});

module.exports.databases = new OneShot({
  tpl: require('./templates/databases.jade'),
  model: {
    databases: [{name: 'admin'}],
    collections: [],
    indexes: []
  },
  // @todo: Not actually a one `OneShot` because we would need multiple calls.
  // what's the best way to handle that?  Collection of polymorphic models?
  source: 'listDatabases'
});

// View logs.
//
// Notes:
//
// "2014-02-13T18:00:04.708-0500 [initandlisten] ** NOTE: This is a development version (2.5.6-pre-) of MongoDB.",
module.exports.log = function(){};


module.exports.shell = function(){
  var editor = ace.edit('javascript-editor');
  editor.getSession().setMode('ace/mode/javascript');
  editor.setTheme('ace/theme/monokai');
};
