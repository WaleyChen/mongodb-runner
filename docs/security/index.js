var yaml = require('js-yaml'),
  fs = require('fs'),
  doc = yaml.safeLoad(fs.readFileSync(__dirname + '/grammar.yml', 'utf8')),
  data = [
    '# Security', '',
    'An experiment in modelling and generating mongod\'s security system.', '',
    '## Built-in Role Templates', ''
  ],
  security = {
    roles: []
  };

Object.keys(doc.roles).map(function(name){
  var role = {
    name: name,
    description: null,
    statements: [],
  };

  data.push.apply(data, [
    '### ' + name, ''
  ]);
  data.push.apply(data, doc.roles[name].map(function(rules){
    var collection = Object.keys(rules)[0],
      resource = collection,
      actions = Object.keys(rules[collection]);
      if(['*', '$db'].indexOf(collection) === -1){
        resource = '#{database}.' + collection;
      }
      else if(collection === '$db'){
        resource = '#{database}.#{collection}';
      }

      role.statements.push.apply(role.statements, actions.map(function(a){
        return {resource: resource, action: a};
      }));

    return '#### '+name+': `' + collection + '`\n' +
        actions.map(function(a){
      return '- [' + a + '](http://docs.mongodb.org/manual/reference/command/' + a + '/)';
    }).join('\n') + '\n';
  }));
  data.push('');
  security.roles.push(role);
});

data.push.apply(data, [
  '## Action Sets', ''
]);

Object.keys(doc.actions).map(function(name){
  data.push.apply(data, [
    '### ' + name, '', '#### commands:', ''
  ]);
  data.push.apply(data, Object.keys(doc.actions[name]).map(function(a){
    return '- [' + a + '](http://docs.mongodb.org/manual/reference/command/' + a + '/)';
  }));
  data.push('');
});

fs.writeFileSync(__dirname + '/README.md', data.join('\n'));


fs.writeFileSync(__dirname + '/security.json', JSON.stringify(security, null, 2));

