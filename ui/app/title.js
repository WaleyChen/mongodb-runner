var models = require('./models');

models.instance.on('change', function(){
  document.title = 'scope://' + models.instance.get('name');
});
