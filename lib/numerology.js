// Helper for formatting bytes
function Unit(name, abbr, exp){
  this.name = name;
  this.abbr = abbr;
  this.exp = exp;
}

Unit.prototype.toString = function(){
    return this.abbr;
};

var abbrs = {
    'B': 'bytes',
    'kB': 'kilobytes',
    'MB': 'megabytes',
    'GB': 'gigabytes',
    'TB': 'terabytes',
    'PB': 'petabytes'
  },
  units = {};

Object.keys(abbrs).map(function(abbr, i){
  var name = _unit_defs[abbr];
  units[name] = new Unit(name, abbr, i + 1);
});


module.exports = function(num){
  var neg = num < 0,
    unit,
    inUnits,
    exponent;

  if(num === 0){
    return '0 B';
  }

  exponent = Math.floor(Math.log(num) / Math.log(1000));
  unit = Object.keys(abbrs)[exponent];
  inUnits = (num / Math.pow(1000, exponent)).toFixed(2) * 1;
  return (num < 0 ? '-' : '') + inUnits + ' ' + unit;
};
