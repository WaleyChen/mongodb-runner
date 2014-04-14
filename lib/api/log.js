var log = require('../monger/log'),
  eventSource = require('event-source-emitter');

module.exports = function(app){
  app.get('/api/v1/:host/log', function(req, res, next){
    var reader = log(req.mongo);

    if(req.headers.accept === 'text/event-stream'){
      var es = eventSource(req, res, {keepAlive: true});
      reader.on('data', function(lines){
        es.emit('log', lines);
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
