var yaml = require('js-yaml'),
  fs = require('fs'),
  doc = yaml.safeLoad(fs.readFileSync(__dirname + '/grammar.yml', 'utf8')),
  data = [
    '# Security', '',
    'An experiment in modelling and generating mongod\'s security system.', '',
    '## Built-in Roles', ''
  ];

fs.writeFileSync(__dirname + '/grammar.json', JSON.stringify(doc, null, 2));

Object.keys(doc.roles).map(function(name){
  data.push.apply(data, [
    '### ' + name, ''
  ]);
  data.push.apply(data, doc.roles[name].map(function(rules){
    var collection = Object.keys(rules)[0],
      actions = Object.keys(rules[collection]);
    return '#### '+name+': `' + collection + '`\n  - ' + actions.join('\n  - ') + '\n';
  }));
  data.push('');
});

data.push.apply(data, [
  '## Action Sets', ''
]);

Object.keys(doc.actions).map(function(name){
  data.push.apply(data, [
    '### ' + name, '', '#### commands:', ''
  ]);
  data.push.apply(data, Object.keys(doc.actions[name]).map(function(a){
    return '- ' + a;
  }));
  data.push('');
});

fs.writeFileSync(__dirname + '/README.md', data.join('\n'));

