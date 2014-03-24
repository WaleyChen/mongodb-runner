"use strict";

var debug = require('debug')('mg:mongorest:replicaset');

module.exports = function(app){
  app.get('/api/v1/replicaset', get, function(req, res, next){
    res.send(req.mongo.replicaset);
  });
};

var get = module.exports.get = function(req, res, next){
  req.mongo.admin().command({replSetGetStatus: 1}, {}, function(err, data){
    if(err) return next(err);

    var rs = data.documents[0];

    if(rs.ok === 0){
      debug('not a member of a replicaset');
      req.mongo.replicaset = null;
      return next();
    }

    req.mongo.replicaset = {
      _id: rs.set,
      members: rs.members.map(function(member){
        return {
          _id: member.name,
          error_message: member.errmsg,
          is_healthy: member.health > 0,
          state: member.stateStr,
          state_id: member.state,
          uptime: member.uptime,
          optime: member.optimeDate,
          optime_count: member.optime.i,
          heartbeat: member.lastHeartbeat,
          heartbeat_previous: member.lastHeartbeatRecv,
          heartbeat_message: member.lastHeartbeatMessage,
          ping: member.pingMs,
          lag_operational: rs.date - member.lastHeartbeat,
          lag_replication: member.optimeDate - member.lastHeartbeat
        };
      })
    };
    next();
  });
};
