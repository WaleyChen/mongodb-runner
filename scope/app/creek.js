"use strict";

// Simple way to make a nice chart with a single metric being streamed into it.
//
// @todo: make this an actual duplex stream.
//
// To customize, have a look at the styles below.
//
// ```css
// /**
//  * data stream wrapper.
//  */
// .data-stream {
//   font-family: 'PT Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
//   color: #494747;
// }
// .data-stream-stage {}
// /**
//  * A line of data.
//  */
// .data-stream-line {
//   fill: none;
//   stroke: #000;
//   stroke-width: 2px;
// }
// /**
//  * The area under the line.
//  */
// .data-stream-area {
//   fill: red;
//   stroke-width: 0;
// }
// /**
//  * The tracking line.
//  */
// .data-stream path.domain {
//   fill: none;
//   stroke-width: 1px;
//   stroke: #CCC;
// }
// /**
//  * axis text.
//  */
// .data-stream text {
//   color: #CCC;
//   font-size: 10px;
// }
// .data-stream .x-axis line, .data-stream .y-axis line {
//   stroke: #CCC;
//   stroke-width: 1px;
//   shape-rendering: crispEdges;
// }
// .data-stream .y-axis {
//   opacity: .7;
// }
//```

var _ = require('underscore'),
  d3 = require('d3');

function Creek(opts){
  _.defaults({}, opts, {
    n: 25,
    duration: 500,
    count: 0,
    data: [],
    interpolation: 'step-after',
    width: 320,
    height: 120,
    paused: false
  });

  var self = this;

  if(this.data.length === 0){
    this.data = d3.range(this.n).map(function(){
      return 0;
    });
  }

  this.value = 0;

  var now = new Date(Date.now() - this.duration);
  this.scales.x = d3.time.scale()
    .domain([now - (this.n - 2) * this.duration, now - this.duration])
    .range([0, this.width]);

  this.scales.y = d3.scale.linear()
    .range([this.height, 0])
    .domain([0, 0]);

  this.clipId = 'clip-' + Math.random();

  this.selection = d3.select('body').append('p');

  this.svg = this.selection
    .append('svg')
      .attr('class', 'data-stream')
    .append('g')
      .attr('transform', 'translate(40,10)');

  this.clip = this.svg.append('g')
    .attr('class', 'data-stream-stage')
    .attr('clip-path', 'url(#' + this.clipId + ')');

  this.shapes = {
    line: d3.svg.line().interpolate(this.interpolation)
      .x(function(d, i){
        return self.scales.x(now - (this.n - 1 - i) * this.duration);
      })
      .y(function(d, i){
        return self.scales.y(d);
      }),
    area: d3.svg.area().interpolate(this.interpolation)
      .x(function(d, i){
        return self.scales.x(now - (this.n - 1 - i) * this.duration);
      })
      .y(function(d, i){
        return self.scales.y(d);
      })
  };

  this.area = this.clip.append('path')
    .data([this.data])
    .attr('class', 'data-stream-area')
    .attr('d', this.shapes.area);

  this.path = this.clip.append('path')
    .data([this.data])
    .attr('class', 'data-stream-line')
    .attr('d', this.shapes.line);


  this.axes = {
    x: this.svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.scales.x.axis = d3.svg.axis().scale(this.scales.x).orient('bottom')),
    y: this.svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', 'translate(0,0)')
    .call(this.scales.y.axis = d3.svg.axis().scale(this.scales.y).orient('left'))
  };

  this.tick();
}

Creek.prototype.pause = function(i){
  this.paused = true;
  return this;
};

Creek.prototype.resume = function(i){
  this.paused = false;
  this.tick();
  return this;
};

Creek.prototype.inc = function(i){
  this.value += i;
  return this;
};

Creek.prototype.tick = function(){
  var now = new Date(),
    self = this;

  this.scales.x.domain([now - (this.n - 2) * this.duration, now - this.duration]);
  this.scales.y.domain([0, d3.max(this.data)]);

  // get new value from the queue
  this.data.push(this.value);
  this.value = 0;

  // reset the shapes
  this.svg.select('.data-stream-line')
      .attr('d', this.shapes.line)
      .attr('transform', null);

  this.svg.select('.data-stream-area')
    .attr('d', this.shapes.area)
    .attr('transform', null);

  this.transition(now);

  this.data.shift();
};

Creek.prototype.transition = function(now){
  var self = this, cancelled = false;

  // Adjust axes and scaling for incoming value
  ['x', 'y'].map(function(k){
    self.axes[k].transition()
      .duration(self.duration)
      .ease('linear')
      .call(self.scales[k].axis);
  });

  // Move the whole world over to expose the next value
  this.svg.selectAll('path').call(function(p){
    p.transition()
      .duration(self.duration)
      .ease('linear')
      .attr('transform', 'translate(' + self.scales.x(now - (self.n - 1) * self.duration) + ')')
      .each('end', function(d, i){
        if(cancelled === true){
          cancelled = false;
        }
        process.nextTick(function(){
          if(cancelled === false && self.paused === false){
            self.tick();
          }
        });
      });
  });
};
