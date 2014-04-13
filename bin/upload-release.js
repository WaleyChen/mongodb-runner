#!/usr/bin/env node

var request = require('request'),
  fs = require('fs'),
  token = process.env.GITHUB_TOKEN;

function upload(repo, tag, src, dest, fn){
  getReleases(repo, function(err, releases){
    if(err) return fn(err);
    var release = releases.filter(function(r){
      return r.tag_name === tag;
    })[0];

    if(!release) return fn(new Error('No release for ' + tag));

    fs.readFile(src, function(err, buf){
      var opts = {
          url: release.upload_url.replace('{?name}', ''),
          body: buf,
          qs: {name: dest, access_token: token},
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        };

      request.post(opts, function(err, res, body){
        if(err) return fn(err);
        fn(null, JSON.parse(body));
      });
    });
  });
}

function getReleases(repo, fn){
  var url = 'https://api.github.com/repos/' + repo + '/releases';
  request.get(url, {qs: {access_token: token}, headers: {
    'User-Agent': 'mongoscope release uploader'
  }}, function(err, res, body){
    if(err) return fn(err);
    fn(null, JSON.parse(body));
  });
}

var tag = process.argv[2],
  dest = process.argv[3];

upload('10gen/mongoscope', tag, __dirname + '/../.lone/dist/mongoscope', dest, function(err, res){
  if(err) return console.log('error', err);
  console.log('uploaded', res);
});
