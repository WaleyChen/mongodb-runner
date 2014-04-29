require('./models').context.on('change', function(ctx){
  document.title = 'scope://' + ctx.get('instance_id');
});
