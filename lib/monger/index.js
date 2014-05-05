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

        sock.on(path, function(data){
          if(!data.instance_id) return sock.emit(path + '/error', 'missing required `instance_id` param');

          var ctx = data || {};
          token(data.token, ctx, function(err){
            if(err) return sock.emit(path + '/error', err);

            if(ctx.instance.type === 'router' && ['/top', '/ops'].indexOf(path) > -1){
              return sock.emit(path + '/error', new BadRequest('No ' + path + ' for a router.'));
            }
            sock.ctx = ctx;
            fn(null, sock);
          });
        });
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
    if(req.instance.type === 'router' && ['/top', '/ops'].indexOf(path) > -1){
      return next(new BadRequest('No ' + path + ' for a router.'));
    }
    var reader = fn(req.mongo);
    return sse(req, res, reader) || serial(req, res, reader, next);
  });

  socketio(app, path, function(err, sock){
    var reader = fn(sock.ctx.mongo);

    // @todo: read.accepts(sock.ctx) better than exclusions above?
    reader.listen().on('data', function(data){
      sock.emit(path, data);
    });

    sock.on(path + '/unsubscribe', reader.close.bind(reader)).on('disconnect', reader.close.bind(reader));
  });
};

module.exports.socketio = socketio;
module.exports.oplog = require('./oplog');
module.exports.replication = require('./replication');
module.exports.log = require('./log');
module.exports.topper = require('./top');
module.exports.read = require('./read');

module.exports.currentop = require('./currentop');
