var NotAuthorized = require('../errors').NotAuthorized,
  BadRequest = require('../errors').BadRequest,
  oplog = require('../monger/oplog'),
  read = require('../monger/read'),
  eventSource = require('event-source-emitter'),
  debug = require('debug')('mongoscope:replicaset');

module.exports = function(app){
  app.get('/api/v1/:host/replication', verify, head, tail, size, opcount, details);

  // Relay membership changes from the driver to the client.
  // Meant to just be left open, background process style.
  // See http://mongodb.github.io/node-mongodb-native/driver-articles/anintroductionto1_4_and_2_6.html
  //
  // @todo: move to monger and add socketio support.
  app.get('/api/v1/:host/replication/watch', function(req, res){
    var es = eventSource(req, res, {keepAlive: true});
    req.mongo.serverConfig
    .on('reconnect', function(){
      es.emit('reconnect', req.param('host'));
    })
    .on('left', function(err, member){
      var uri = 'mongodb://' + member.host + ':' + member.port;
      es.emit('left', uri);
    })
    .on('joined', function(err, member){
      var uri = 'mongodb://' + member.host + ':' + member.port;
      es.emit('join', uri);
    });
  });

  app.get('/api/v1/:host/replication/oplog', function(req, res, next){
    var since = req.param('since', Date.now() - 1000 * 60),
      filters = JSON.parse(req.param('filters', '[]')),
      reader;

    reader = oplog(req.mongo)
      .since(since)
      .filter(filters);

    if(req.headers.accept === 'text/event-source'){
      var es = eventSource(req, res, {keepAlive: true});

      ['insert', 'remove', 'update'].map(function(name){
        reader.on(name, function(doc){
          es.emit(name, doc);
        });
      });

      req.on('close', function() {
        reader.close();
      });
      return reader.listen('tail');
    }

    reader.find().end(function(err, ops){
      if(err) return next(err);
      res.send(ops);
    });
  });
};

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

function head(req, res, next){
  oplog(req.mongo.db('local')).since(0).find('head').first(function(err, doc){
    if(err) return next(err);
    if(doc === undefined) return new BadRequest('Not a member of a replicaset');
    req.rs_head = doc;
    debug('head', doc);
    next();
  });
}

function tail(req, res, next){
  debug('getting tail');
  oplog(req.mongo.db('local')).since(0).find('tail').first(function(err, doc){
    if(err) return next(err);
    debug('tail', doc);
    req.rs_tail = doc;
    next();
   });
}

function size(req, res, next){
  read(req.mongo.db('local'), 'system.namespaces').where({name:'local.oplog.rs'}).first(function(err, doc){
    if(err) return next(err);
    debug('oplog collection options', doc);
    req.rs_options = doc.options;
    next();
  });
}

function opcount(req, res, next){
    read(req.mongo.db('local'), 'oplog.rs').count(function(err, n){
    if(err) return next(err);
    debug('op count', n);
    req.rs_opcount = n;
    next();
  });
}

function dateFromTimestamp(ts){
  return new Date(ts.high_ * 1000);
}

function details(req, res, next){
  req.mongo.admin().command({replSetGetStatus: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to replicaset status'));

    var rs = data.documents[0];

    if(rs.ok === 0){
      debug('not a member of a replicaset');
      return next(new BadRequest('Not a member of a replicaset.'));
    }

    // As a comparison, see `DB.prototype.printReplicationInfo` and
    // `DB.prototype.getReplicationInfo` in `shell/db.js`.
    var replicaset = {
      _id: rs.set,
      primary: null,
      arbiters: [],
      secondaries: [],
      instance: null,
      options: req.rs_options
    };

    req.rs_tail.ts = dateFromTimestamp(req.rs_tail.ts);
    req.rs_head.ts = dateFromTimestamp(req.rs_head.ts);

    // From pro services script http://git.io/cMmH1w
    replicaset.oplog = {
      window: [req.rs_head.ts, req.rs_tail.ts],
      count: req.rs_opcount,
      head: req.rs_head,
      tail: req.rs_tail
    };

    rs.members.map(function(member){
        var doc = {
          _id: member._id,
          name: member.name,
          error_message: member.errmsg,
          is_healthy: member.health === 1,
          state: member.stateStr,
          state_id: member.state,
          uptime: member.uptime,
          optime: member.optimeDate,
          heartbeat: member.lastHeartbeat,
          heartbeat_previous: member.lastHeartbeatRecv,
          heartbeat_message: member.lastHeartbeatMessage,
          ping: member.pingMs
        };

        if(member.optime){
          doc.optime_count = member.optime.i;
        }

        if(member.state === 1){
          doc.is_primary = true;
          replicaset.primary = doc;
        }
        else {
          doc.lag_operational = rs.date - member.lastHeartbeat;
          doc.lag_replication = req.rs_tail.ts - member.optimeDate;

          if(member.state === 7){
            doc.is_arbiter = true;
            replicaset.arbiters.push(doc);
          }
          else {
            doc.is_secondary = true;
            replicaset.secondaries.push(doc);
          }
        }

        if(member.self === true){
          replicaset.instance = doc;
        }

        return doc;
      });
    res.send(replicaset);
  });
}
