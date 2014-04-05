var yaml = require('js-yaml'),
  fs = require('fs'),
  doc = yaml.safeLoad(fs.readFileSync(__dirname + '/privilege-actions.yml', 'utf8'));


var res = {};

doc.map(function(a){
  var action = Object.keys(a)[0];

  res[action] = {
    description: a[action].description,
    tags: []
  };

  delete a[action].description;

  Object.keys(a[action]).map(function(k){
    res[action].tags.push(k.replace('tags_', ''));
  });
});

fs.writeFileSync(__dirname + '/privilege-actions.json', JSON.stringify(res, null, 2));
