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
// .creek {
//   font-family: 'PT Sans','Helvetica Neue',Helvetica,Arial,sans-serif;
//   color: #494747;
// }
// .creek-stage {}
// /**
//  * A line of data.
//  */
// .creek-line {
//   fill: none;
//   stroke: #000;
//   stroke-width: 2px;
// }
// /**
//  * The area under the line.
//  */
// .creek-area {
//   fill: red;
//   stroke-width: 0;
// }
// *
//  * The tracking line.

// .creek path.domain {
//   fill: none;
//   stroke-width: 1px;
//   stroke: #CCC;
// }
// /**
//  * axis text.
//  */
// .creek text {
//   color: #CCC;
//   font-size: 10px;
// }
// .creek .x-axis line, .creek .y-axis line {
//   stroke: #CCC;
//   stroke-width: 1px;
//   shape-rendering: crispEdges;
// }
// .creek .y-axis {
//   opacity: .7;
// }
//```
var _ = require('underscore'),
  d3 = require('d3'),
  debug = require('debug')('mg:creek');

module.exports = function(selector, opts){
  opts = opts || {};
  opts.selector = selector;
  return new Creek(opts);
};

function Creek(opts){
  _.extend(this, _.defaults({}, opts, {
    n: 25,
    duration: 500,
    count: 0,
    data: [],
    interpolation: 'step-after',
    width: 320,
    height: 160,
    selector: 'body'
  }));

  var self = this;

  if(this.data.length === 0){
    this.data = d3.range(this.n).map(function(){
      return 0;
    });
  }

  this.value = 0;

  this.clipId = 'clip-' + Math.random();
}

Creek.prototype.render = function(){
  this.selection = d3.select(document.querySelector(this.selector));

  this.svg = this.selection.append('p')
    .append('svg')
      .attr('class', 'creek')
      .attr('height', this.height + 20)
      .attr('width', this.width)
    .append('g')
      .attr('transform', 'translate(40,0)');

  var self = this,
    clip = this.svg
    .append('g')
      .attr('class', 'creek-stage')
      .attr('clip-path', 'url(#' + this.clipId + ')');

  var now = new Date(Date.now() - this.duration);
  this.scales = {
    x: d3.time.scale()
      .domain([now - (this.n - 2) * this.duration, now - this.duration])
      .range([0, this.width]),
    y: d3.scale.linear()
    .range([this.height, 0])
    .domain([0, 0])
  };

  this.shapes = {
    line: d3.svg.line().interpolate(this.interpolation)
      .x(function(d, i){
        return self.scales.x(now - (self.n - 1 - i) * self.duration);
      })
      .y(function(d, i){
        return self.scales.y(d);
      }),
    area: d3.svg.area().interpolate(this.interpolation)
      .x(function(d, i){
        return self.scales.x(now - (self.n - 1 - i) * self.duration);
      })
      .y(function(d, i){
        return self.scales.y(d);
      })
  };

  this.area = clip.append('path')
    .data([this.data])
    .attr('class', 'creek-area')
    .attr('d', this.shapes.area);

  this.path = clip.append('path')
    .data([this.data])
    .attr('class', 'creek-line')
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
  this.paused = false;

  this.tick();
  return this;
};

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

  // get new value from the queue
  this.data.push(this.value);
  this.value = 0;

  this.scales.x.domain([now - (this.n - 2) * this.duration, now - this.duration]);
  this.scales.y.domain([0, d3.max(this.data)]);

  // reset the shapes
  this.svg.select('.creek-line')
      .attr('d', this.shapes.line);

  this.svg.select('.creek-area')
    .attr('d', this.shapes.area);

  this.transition(now);

  this.data.shift();
};

Creek.prototype.transitionAxis = function(id){
  this.axes[id].transition()
    .duration(this.duration)
    .ease('linear')
    .call(this.scales[id].axis);
};

Creek.prototype.transition = function(now){
  var self = this;

  // Adjust axes and scaling for incoming value
  ['x', 'y'].map(this.transitionAxis.bind(this));

  // Move the whole world over to expose the next value
  d3.selectAll(document.querySelectorAll(this.selector + ' .creek-stage path')).call(function(p){
    p.transition()
      .duration(self.duration)
      .ease('linear')
      .attr('transform', 'translate(' + self.scales.x(now - (self.n - 1) * self.duration) + ')')
      .each('end', function(d, i){return (i === 0) ? null : self.tick();});
  });
};
