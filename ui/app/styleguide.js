require('debug').enable('*');

var $ = window.jQuery = require('jquery');

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
