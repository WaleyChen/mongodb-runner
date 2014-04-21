var d3 = require('d3');

// Example: http://jsfiddle.net/imlucas/Y4ThP/3/
module.exports = function(data, opts){
  var width = opts.width || 100,
    height = opts.height || 25,
    svg = null,
    x = {
      scale: d3.scale.linear().range([0, width - 2]),
      key: opts.x || 'date'
    },
    y = {
      scale: d3.scale.linear().range([height - 4, 0]),
      key: opts.y || 'value'
    },
    shapes = {
      line: d3.svg.line().interpolate('step')
        .x(function(d){return x.scale(d[x.key]);})
         .y(function(d){return y.scale(d[y.key]);})
    },
    chart = {
      line: null,
      circle: null,
      window: opts.window || 60,
      add: function(item){
        data.unshift(item);
        if(data.length === chart.window){
          data.pop();
        }
        chart.draw();
      },
      draw: function(){

        x.scale.domain(d3.extent(data, function(d){return d[x.key];}));
        y.scale.domain(d3.extent(data, function(d){return d[y.key];}));

        chart.line
          .datum(data)
          .attr('d', shapes.line);
        if(data.length < 1) return;

        chart.circle
         .attr('cx', x.scale(data[0][x.key]))
         .attr('cy', y.scale(data[0][y.key]))
         .attr('r', 1.5);
      }
    };

  svg = d3.select(opts.el || '.sparkline')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
      .attr('transform', 'translate(0, 2)');

  console.log('create sparkline', data, svg);

  chart.line = svg.append('path').attr('class', 'line');
  chart.circle = svg.append('circle').attr('class', 'circle');
  chart.draw();
  return chart;
};
