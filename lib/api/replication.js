var BadRequest = require('../errors').BadRequest,
  monger = require('../monger'),
  eventSource = require('event-source-emitter'),
  Deployment = require('../deployment'),
  debug = require('debug')('mongoscope:replicaset');

function verify(req, res, next){
  if(!req.deployment || !req.instance){
    return next(new BadRequest('Deployment and instance contexts required'));
  }

  if(!req.deployment.hasReplication()){
    return next(new BadRequest('This deployment does not have replication'));
  }

  // @todo(lucas): better to not be over dogmatic here and return ALL replica sets?
  if(req.instance.isRouter()){
    return next(new BadRequest('Cannot use router to retrieve replication details'));
  }
  next();
}

module.exports = function(app){
  monger.socketio(app, '/replication', function(err, sock){
    sock.ctx.mongo.serverConfig
      .on('reconnect', function(){
        sock.emit('/replication', {event: 'reconnect', instance_id: sock.ctx.instance_id});
      })
      .on('left', function(err, member){
        sock.emit('/replication', {event: 'left', instance_id: Deployment.getId(member.host + ':' + member.port)});
      })
      .on('joined', function(err, member){
        sock.emit('/replication', {event: 'joined', instance_id: Deployment.getId(member.host + ':' + member.port)});
      });
  });

  app.get('/api/v1/:instance_id/replication', verify, function(req, res, next){
    monger.replication(req.mongo, function(err, state){
      if(err) return next(err);
      res.format({
        json: function(){
          res.send(state);
        },
        'event-source': function(){
          var es = eventSource(req, res, {keepAlive: true});
          es.emit('data', state);

          req.mongo.serverConfig.on('reconnect', function(){
            es.emit('data', {event: 'reconnect', instance_id: req.instance_id});
          }).on('left', function(err, member){
            es.emit('data', {event: 'left', instance_id: Deployment.getId(member.host + ':' + member.port)});
          }).on('joined', function(err, member){
            es.emit('data', {event: 'joined', instance_id: Deployment.getId(member.host + ':' + member.port)});
          });
        }
      });
    });
  });

  // Relay membership changes from the driver to the client.
  // Meant to just be left open, background process style.
  // See http://mongodb.github.io/node-mongodb-native/driver-articles/anintroductionto1_4_and_2_6.html
  app.get('/api/v1/:instance_id/replication/oplog', function(req, res, next){
    var since = req.param('since', Date.now() - 1000 * 60),
      filters = JSON.parse(req.param('filters', '[]')),
      reader = monger.oplog(req.mongo).since(since).filter(filters);

    res.format({
      'event-source': function(){
        var es = eventSource(req, res, {keepAlive: true});

        ['insert', 'remove', 'update'].map(function(name){
          reader.on(name, function(doc){
            es.emit('data', {event: name, entry: doc});
          });
        });

        req.on('close', function() {
          reader.close();
        });
        return reader.listen('tail');
      },
      json: function(){
        reader.find().end(function(err, ops){
          if(err) return next(err);
          res.send(ops);
        });
      }
    });
  });

  monger.socketio(app, '/oplog', function(err, sock){
    var since = Date.now() - 1000 * 60,
      filters = sock.ctx.filters || [],
      reader = monger.oplog(sock.ctx.mongo).since(since).filter(filters);

    ['insert', 'remove', 'update'].map(function(name){
      reader.on(name, function(doc){
        sock.emit('/oplog', {event: name, entry: doc});
      });
    });
  });
};
