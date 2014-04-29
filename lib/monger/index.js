var token = require('../token'),
  BadRequest = require('../errors').BadRequest,
  eventSource = require('event-source-emitter'),
  debug = require('debug')('mongoscope:token');

function socketio(app, path, fn){
  app.on('io', function(io){
    io.sockets.on('connection', function(sock){
      sock.get('monger_' + path, function(err, d){
        if(d) return;
        sock.set('monger_' + path, true);

        fn(null, sock);
      });
    });
  });
}

function sse(req, res, reader){
  if(req.headers.accept !== 'text/event-stream') return false;

  var es = eventSource(req, res, {keepAlive: true});
  reader.on('data', function(data){es.emit('data', data);});
  req.on('close', function(){reader.close();});
  return reader.listen();
}

function serial(req, res, reader, next){
  reader.find().end(function(err, ops){
    if(err) return next(err);
    res.send(ops);
  });
}

module.exports = function(app, path, fn){
  app.get('/api/v1/:instance_id' + path, function(req, res, next){
    if(path === '/top' && req.instance.type === 'router'){
      return next(new BadRequest('No top for a router.'));
    }
    var reader = fn(req.mongo);
    return sse(req, res, reader) || serial(req, res, reader, next);
  });

  socketio(app, path, function(err, sock){
    sock.on(path, function(data){
      if(!data.instance_id) return sock.emit('error', 'missing required `instance_id` param');

      var ctx = {instance_id: data.instance_id};
      token(data.token, ctx, function(err){
        if(err) return sock.emit('error', err);

        debug('type of instance', ctx.instance.type);
        if(path === '/top' && ctx.instance.type === 'router'){
          return sock.emit('error', new BadRequest('No top for a router.'));
        }
        var reader = fn(ctx.mongo).listen()
          .on('data', function(data){
            sock.emit(path, data);
          });

        sock.on(path + '/unsubscribe', function(){
          reader.close();
        }).on('disconnect', function(){
          reader.close();
        });
      });
    });
  });
};
