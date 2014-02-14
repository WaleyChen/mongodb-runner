// Don't let the regex party get out of control.
var debug = require('debug')('roar'),
  assert = require('assert');

function roar(name, input){
  if(!roar.patterns[name]){
    throw new Error('Unknown pattern `' + name + '`');
  }
  var pattern = roar.patterns[name],
    re = pattern.pattern,
    res = {},
    matches = re.exec(input);

  if(matches === null){
    return null;
  }

  matches.shift();
  matches.map(function(p, i){
    res[pattern.captures[i]] = p;
  });
  re.lastIndex = 0;
  return res;
}
roar.patterns = {};

roar.add = function(name, pattern, example, captures){
  captures = captures || [];

  debug('adding', name);

  var source = pattern.source,
    matcher = new RegExp('{{([' + Object.keys(roar.patterns).join('|') + ']+)}}', 'g');

  source = source.replace(matcher, function(match, name, offset){
    if(!roar.patterns[name]){
      throw new Error('Unregistered template `' + name + '`');
    }
    debug('`' + source + '`: `' + match + '` -> `' + roar.patterns[name].pattern.source + '`');

    return match.replace(new RegExp('{{' + name + '}}', 'g'),
      roar.patterns[name].pattern.source);
  });

  roar.patterns[name] = {
    'example': example,
    'pattern': new RegExp(source, 'g'),
    'captures': captures
  };
  debug('registered', name);
  return roar.patterns[name];
};

roar.add('isoDate',
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+-[0-5]\d/,
  '2014-02-13T18:00:04.709-0500');

roar.add('mongodbLogLine',
  /({{isoDate}}+) \[(\w+)\] (.*)/,
  '2014-02-13T18:00:04.709-0500 [initandlisten] db version v2.5.6-pre-',
  ['date', 'name', 'message']
);

module.exports = roar;
