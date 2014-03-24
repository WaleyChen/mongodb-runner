"use strict";

var debug = require('debug')('mg:mongorest:replicaset');

var mock = {
  documents: [{
    ok: 1,
    set : "scopeco",
    date : new Date("2014-03-24T18:26:31Z"),
    myState : 1,
    members : [
      {
        _id : 1,
        name : 'arbiter1.scope.co:30000',
        health : 1,
        state : 7,
        stateStr : 'ARBITER',
        uptime : 15049107,
        lastHeartbeat : new Date('2014-03-24T18:26:31Z'),
        lastHeartbeatRecv : new Date('2014-03-24T18:26:31Z'),
        pingMs : 1
      },
      {
        _id : 2,
        name : 'mongod1.scope.co:27017',
        health : 1,
        state : 1,
        stateStr : 'PRIMARY',
        uptime : 15049108,
        optime : {t: 1395685591, i:3},
        optimeDate : new Date('2014-03-24T18:26:31Z'),
        self : true
      },
      {
        _id : 3,
        name : 'mongod2.scope.co:27017',
        health : 0,
        state : 8,
        stateStr : '(not reachable/healthy)',
        uptime : 0,
        optime : {t: 1382402099, i: 1},
        optimeDate : new Date('2013-10-22T00:34:59Z'),
        lastHeartbeat : new Date('2014-03-24T18:26:17Z'),
        lastHeartbeatRecv : new Date('2013-10-22T00:34:59Z'),
        pingMs : 0,
        syncingTo : 'mongod1.scope.co:27017'
      }
    ]
  }],
};

module.exports = function(app){
  app.get('/api/v1/replicaset', get, function(req, res, next){
    res.send(req.mongo.replicaset);
  });
};

var get = module.exports.get = function(req, res, next){
  req.mongo.admin().command({replSetGetStatus: 1}, {}, function(err, data){
    if(err) return next(err);

    data = mock;

    var rs = data.documents[0];

    if(rs.ok === 0){
      debug('not a member of a replicaset');
      req.mongo.replicaset = null;
      return next();
    }

    req.mongo.replicaset = {
      _id: rs.set,
      members: [],
      primary: null,
      arbiters: [],
      secondaries: [],
      instance: null
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
          doc.isPrimary = true;
          req.mongo.replicaset.primary = doc;
        }
        else {
          doc.lag_operational = rs.date - member.lastHeartbeat;
          doc.lag_replication = member.optimeDate - member.lastHeartbeat;

          if(member.state === 7){
            doc.isArbiter = true;
            req.mongo.replicaset.arbiters.push(doc);
          }
          else {
            doc.isSecondary = true;
            req.mongo.replicaset.secondaries.push(doc);
          }
        }

        if(member.self === true){
          req.mongo.replicaset.instance = doc;
        }

        return doc;
      });
    next();
  });
};
