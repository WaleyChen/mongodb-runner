var d3 = require('d3');

module.exports = function(metrics, namespaces, data, opts){
  opts = opts || {};
  var table = d3.select(opts.el || '.matrix')
      .append('table').attr('class', 'table table-hover'),
    thead = table.append('thead').append('tr'),
    tbody = table.append('tbody');

  metrics.unshift({});
  function draw(){
    var matrix = namespaces.map(function(ns){
      var res = [ns];
      metrics.map(function(metric){
        if(!metric.label) return;

        res.push({
          key: metric.key,
          value: data[ns + '.' + metric.key]
        });
      });
      return res;
    });
    var th = thead.selectAll('th').data(metrics);

    th.enter().append('th').attr('data-metric', function(d){
      return d.key;
    });
    th.text(function(d){return d.label;});
    th.exit().remove();

    var tr = tbody.selectAll('tr').data(matrix);
    tr.enter().append('tr');

    tr.append('td')
      .attr('data-ns', function(d){return d[0];})
      .attr('class', 'ns');

    for(var a=1; a<metrics.length; a++){
      tr.append('td')
        .attr('class', 'metric-value')
        .attr('data-ns', function(d){return d[0];})
        .attr('data-metric', metrics[a].key);
    }
    var tds = tr.selectAll('td')
      .data(function(d, i){return matrix[i];});

    tds.text(function(d){
       return d.key ? (d.value || 0) : d;
    });
    tds.exit().remove();
    tr.exit().remove();
  }
  draw();

  return {
    metric: {
      add: function(){},
      remove: function(){},
      update: function(){}
    },
    sort: function(spec){
      tbody.selectAll('tr').sort(function(a, b){
        var k = Object.keys(spec)[0];
        return d3[spec[k] === 1 ? 'ascending' : 'descending'](a[k], b[k]);
      });
      draw();
    },
    update: function(data){
      data = data;
      draw();
    },
    add: function(){
      namespaces.unshift.apply(namespaces, Array.prototype.slice.call(arguments, 0));
      draw();
    },
    remove: function(){
      Array.prototype.slice.call(arguments, 0).map(function(ns){
        namespaces.splice(namespaces.indexOf(ns), 1);
      });
      draw();
    }
  };
};
