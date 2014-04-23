module.exports = function nf(number, decimals, decPoint, thousandsSep){
  decimals = isNaN(decimals) ? 0 : Math.abs(decimals);
  decPoint = (decPoint === undefined) ? '.' : decPoint;
  thousandsSep = (thousandsSep === undefined) ? ',' : thousandsSep;
  var sign = number < 0 ? '-' : '';
  number = Math.abs(+number || 0);
  var intPart = parseInt(number.toFixed(decimals), 10) + '';
  var j = intPart.length > 3 ? intPart.length % 3 : 0;
  return sign + (j ? intPart.substr(0, j) + thousandsSep : '') + intPart.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousandsSep) + (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '');
};