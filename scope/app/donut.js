var d3 = require('d3');


function bytes(num){
  var exponent = Math.floor(Math.log(num) / Math.log(1024));
  var unit = ['B', 'kB', 'MB', 'GB', 'TB', 'PB'][exponent];
  var inUnits = (num / Math.pow(1024, exponent)).toFixed(0) * 1;
  return (num < 0 ? '-' : '') + inUnits + ' ' + unit;
}

module.exports = function(el, data, opts){
  var width = 350,
    height = 200,
    radius = Math.min(width, height) / 2;
  opts = opts || {};

  var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 40);

  var pie = d3.layout.pie()
    .sort(null)
    .value(function(d){
      return d.size;
    });

  var svg = d3.select(el)
    .append("svg")
      .attr("width", width)
      .attr("height", height)
    .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  svg.append('g')
    .attr('class', 'title')
    .append('text')
      .attr("dy", ".25em")
      .style("text-anchor", "middle")
      .text(opts.title);

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr('class', function(d){
        return d.data.className;
      });

  g.append("path")
    .attr('class', 'arc')
    .attr("d", arc);


  g.append("text")
    .attr('class', 'label')
    .attr("transform", function(d) {
      var calc = arc.centroid(d),
        x = calc[0],
        y = calc[1];
      if(d.data.name === 'Documents'){
        x += 110;
      }
      else {
        x -= 110;
      }
      return "translate(" + [x, y] + ")";
    })
    .attr("dy", ".25em")
    .style("text-anchor", "middle")
    .text(function(d) {
      return d.data.name + ' ' + bytes(d.data.size);
    });
};
