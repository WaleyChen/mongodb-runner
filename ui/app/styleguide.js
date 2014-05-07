require('debug').enable('*');

var $ = window.jQuery = require('jquery');

require('bootstrap/js/dropdown.js');

$('.dropdown').dropdown();

var donut = require('./viz/donut');
donut('.donut', [
    {
      name: 'Documents',
      size: 16384,
      count: 100,
      className: 'documents'
    },
    {
      name: 'Indexes',
      size: 8192,
      count: 1,
      className: 'indexes'
    }
  ], {title: ''}
);

donut('#donut-example-2',
  [{
    name: 'scope.user',
    size: 16384,
    count: 100,
    className: 'documents'
  },
  {
    name: 'scope.event',
    size: 819200,
    count: 100000,
    className: 'indexes'
  },
  {
    name: 'scope.message',
    size: 81920,
    count: 1000,
    className: 'indexes'
  }], {title: ''});


var pie = require('./viz/pie');

pie(50, {el: '#pie-1'});
pie(32, {el: '#pie-2'});
pie(10, {el: '#pie-3'});
pie(20, {el: '#pie-4'});
pie(30, {el: '#pie-5'});

var opts = {el: '#pie-7', height: 200, width: 200};
pie(0, opts);
pie(10, opts);
pie(20, opts);
pie(30, opts);
pie(40, opts);
pie(50, opts);
pie(60, opts);
pie(70, opts);
pie(80, opts);
pie(90, opts);
pie(100, opts);

function updater(i, max, min){
  var pieChart = pie(min, {el: '#pie-updating-' + i, height: 200, width: 200});
  pieChart.next = 1;
  setInterval(function(){
    pieChart.update( (pieChart.next > 0) ? max : min);
    pieChart.next *= -1;
  }, 1000);
}

updater(1, 75, 35);
updater(2, 100, 20);
updater(3, 40, 0);
updater(4, 1, 0);
updater(5, 100, 99);
updater(6, 100, 0);

var charts = [];
for(var i=0; i< 10; i++){
    var c = pie(0, {el: '#pie-update-shares-' + i, height: 200, width: 200});
    c.next = 1;
    charts.push(c);
    setInterval(function(){
      c.update((charts[i].next > 0) ? 10*(i+1) : 10*i);
      charts[i].next *= -1;
    }, 1500);
}


var d3 = require('d3'),
  rand = d3.random.normal(),
  sparkline = require('./viz/sparkline'),
  streaming = sparkline([], {
    el: '#sparkline-streaming', window: 20, height: 23
  });

setInterval(function(){
  streaming.write({date: Date.now(), value: rand()});
}, 500);

var data = d3.range(20).map(function(i){
  return {date: Date.now() - (1000* i), value: rand()};
});
sparkline(data, {el: '#sparkline-static', height: 23});



var controls = '<div class="btn-group btn-group-xs"><a class="btn btn-default active" data-lang="javascript">js</a><a class="btn btn-default" data-lang="jade">jade</a></div>';

$('.example .code').each(function(){
  var example = $(this);
  example.prepend(controls).find('.btn-group .btn').on('click', function(){
    example.find('.btn').removeClass('active');
    $(this).addClass('active');
    example.find('pre').hide();
    example.find('.lang-' + $(this).data('lang')).parent().show();
  });
  if(example.find('pre').length > 1){
    example.find('.lang-jade').parent().hide();
  }
  else {
    example.find('.btn[data-lang="javascript"]').remove();
    example.find('.btn:first').addClass('active');
  }
});
