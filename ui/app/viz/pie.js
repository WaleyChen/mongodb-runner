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

  var path = svg.datum(pie([percent, 100-percent]))
    .selectAll('path').data(pie);

  var chart = {
    update: function(p){
      console.log(p);
      pie.value(function(d, i){
        return (i === 0) ? p : 100-p;
      });
      path = path.data(pie);

      // path.transition().duration(250).ease('linear')
      path.attr('d', arc);
      return chart;
    },
    draw: function(){
      path.enter()
        .append('path')
          .attr('class', function(d, i){
            return (i === 0) ? 'occupied slice' : 'free slice';
          })
          .attr('d', arc);
      path.exit().remove();
      return chart;
    }
  };
  // var next = 1;

  // setInterval(function(){
  //   chart.update( (next > 0) ? percent * 2 : percent);
  //   next *= -1;
  // }, 500);
  chart.draw();
  return chart.update(percent);
};
