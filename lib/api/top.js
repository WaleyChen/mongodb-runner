var topper = require('../monger/top'),
  eventSource = require('event-source-emitter');

module.exports = function(app){
  app.get('/api/v1/:host/top', function(req, res, next){
    var reader = topper(req.mongo);

    if(req.headers.accept === 'text/event-source'){
      var es = eventSource(req, res, {keepAlive: true});
      reader.on('data', function(data){
        es.emit('top', data);
      });

      req.on('close', function() {
        reader.close();
      });
      return reader.listen();
    }

    reader.find().end(function(err, ops){
      if(err) return next(err);
      res.send(ops);
    });
  });
};
