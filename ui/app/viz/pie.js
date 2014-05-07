var d3 = require('d3');

module.exports = function(percent, opts){
  opts = opts || {};

  var width = opts.width || 21,
    height = opts.height || 21,
    radius = Math.min(width, height) / 2;

  var arc = d3.svg.arc()
    .outerRadius(radius - 2)
    .innerRadius(0);

  var pie = d3.layout.pie();

  var svg = d3.select(opts.el || '.pie').append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'pie')
    .append('g')
      .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');
  // pie([percent, 100-percent])
  var path = svg.datum([1, 1])
    .selectAll('path').data(pie);

  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }

  var chart = {
    update: function(p){
      pie.value(function(d, i){
        return (i === 0) ? p : 100-p;
      });
      path = path.data(pie);
      path.transition().duration(750).attrTween("d", arcTween);
      // path.transition().duration(250).ease('linear')
      // path.attr('d', arc);
      return chart;
    },
    draw: function(){
      path.enter()
        .append('path')
          .attr('class', function(d, i){
            return (i === 0) ? 'occupied slice' : 'free slice';
          })
          .attr('d', arc)
          .each(function(d) { this._current = d; }); // store the initial angles
      path.exit().remove();
      return chart;
    }
  };
  chart.draw();
  return chart.update(percent);
};
