"use strict";

// @todo: all of the below was debug out of various company repos,
// trying to figure out what data/operations people actually care about
// when it comes to replicasets.  it needs to be incorporated into the
// actual rest api.
//
// @todo: include more from serverStatus:
// http://docs.mongodb.org/master/reference/command/serverStatus/#serverStatus.metrics.repl
//
// @todo: from mongo `shell/utils.js`
//
// rs.debug.nullLastOpWritten = function(primary, secondary) {
//     var p = connect(primary+"/local");
//     var s = connect(secondary+"/local");
//     s.getMongo().setSlaveOk();

//     var secondToLast = s.oplog.rs.find().sort({$natural : -1}).limit(1).next();
//     var last = p.runCommand({findAndModify : "oplog.rs",
//                              query : {ts : {$gt : secondToLast.ts}},
//                              sort : {$natural : 1},
//                              update : {$set : {op : "n"}}});

//     if (!last.value.o || !last.value.o._id) {
//         print("couldn't find an _id?");
//     }
//     else {
//         last.value.o = {_id : last.value.o._id};
//     }

//     print("nulling out this op:");
//     printjson(last);
// };

// rs.debug.getLastOpWritten = function(server) {
//     var s = db.getSisterDB("local");
//     if (server) {
//         s = connect(server+"/local");
//     }
//     s.getMongo().setSlaveOk();

//     return s.oplog.rs.find().sort({$natural : -1}).limit(1).next();
// };

// @todo: extra shell commands pro services use.
// see https://github.com/10gen/professional-services/blob/master/bin/getMongoData.js
//
// print("\n** Replica set config:");
// printjson(db.getSisterDB("local").system.replset.findOne());
//
// DB.prototype.getReplicationInfo = function() {
//     var db = this.getSiblingDB("local");

//     var result = { };
//     var oplog;
//     if (db.system.namespaces.findOne({name:"local.oplog.rs"}) != null) {
//         oplog = 'oplog.rs';
//     }
//     else if (db.system.namespaces.findOne({name:"local.oplog.$main"}) != null) {
//         oplog = 'oplog.$main';
//     }
//     else {
//         result.errmsg = "neither master/slave nor replica set replication detected";
//         return result;
//     }

//     var ol_entry = db.system.namespaces.findOne({name:"local."+oplog});
//     if( ol_entry && ol_entry.options ) {
//         result.logSizeMB = ol_entry.options.size / ( 1024 * 1024 );
//     } else {
//         result.errmsg  = "local."+oplog+", or its options, not found in system.namespaces collection";
//         return result;
//     }
//     ol = db.getCollection(oplog);

//     result.usedMB = ol.stats().size / ( 1024 * 1024 );
//     result.usedMB = Math.ceil( result.usedMB * 100 ) / 100;

//     var firstc = ol.find().sort({$natural:1}).limit(1);
//     var lastc = ol.find().sort({$natural:-1}).limit(1);
//     if( !firstc.hasNext() || !lastc.hasNext() ) {
//         result.errmsg = "objects not found in local.oplog.$main -- is this a new and empty db instance?";
//         result.oplogMainRowCount = ol.count();
//         return result;
//     }

//     var first = firstc.next();
//     var last = lastc.next();
//     var tfirst = first.ts;
//     var tlast = last.ts;

//     if( tfirst && tlast ) {
//         tfirst = DB.tsToSeconds( tfirst );
//         tlast = DB.tsToSeconds( tlast );
//         result.timeDiff = tlast - tfirst;
//         result.timeDiffHours = Math.round(result.timeDiff / 36)/100;
//         result.tFirst = (new Date(tfirst*1000)).toString();
//         result.tLast  = (new Date(tlast*1000)).toString();
//         result.now = Date();
//     }
//     else {
//         result.errmsg = "ts element not found in oplog objects";
//     }

//     return result;
// };

// DB.prototype.printReplicationInfo = function() {
//     var result = this.getReplicationInfo();
//     if( result.errmsg ) {
//         if (!this.isMaster().ismaster) {
//             print("this is a slave, printing slave replication info.");
//             this.printSlaveReplicationInfo();
//             return;
//         }
//         print(tojson(result));
//         return;
//     }
//     print("configured oplog size:   " + result.logSizeMB + "MB");
//     print("log length start to end: " + result.timeDiff + "secs (" + result.timeDiffHours + "hrs)");
//     print("oplog first event time:  " + result.tFirst);
//     print("oplog last event time:   " + result.tLast);
//     print("now:                     " + result.now);
// }

// DB.prototype.printSlaveReplicationInfo = function() {
//     var startOptimeDate = null;

//     function getReplLag(st) {
//         assert( startOptimeDate , "how could this be null (getReplLag startOptimeDate)" );
//         print("\tsyncedTo: " + st.toString() );
//         var ago = (startOptimeDate-st)/1000;
//         var hrs = Math.round(ago/36)/100;
//         print("\t" + Math.round(ago) + " secs (" + hrs + " hrs) behind the primary ");
//     };

//     function getMaster(members) {
//         var found;
//         members.forEach(function(row) {
//             if (row.self) {
//                 found = row;
//                 return false;
//             }
//         });

//         if (found) {
//             return found;
//         }
//     };

//     function g(x) {
//         assert( x , "how could this be null (printSlaveReplicationInfo gx)" )
//         print("source: " + x.host);
//         if ( x.syncedTo ){
//             var st = new Date( DB.tsToSeconds( x.syncedTo ) * 1000 );
//             getReplLag(st);
//         }
//         else {
//             print( "\tdoing initial sync" );
//         }
//     };

//     function r(x) {
//         assert( x , "how could this be null (printSlaveReplicationInfo rx)" );
//         if ( x.state == 1 || x.state == 7 ) {  // ignore primaries (1) and arbiters (7)
//             return;
//         }

//         print("source: " + x.name);
//         if ( x.optime ) {
//             getReplLag(x.optimeDate);
//         }
//         else {
//             print( "\tno replication info, yet.  State: " + x.stateStr );
//         }
//     };

//     var L = this.getSiblingDB("local");

//     if (L.system.replset.count() != 0) {
//         var status = this.adminCommand({'replSetGetStatus' : 1});
//         startOptimeDate = getMaster(status.members).optimeDate;
//         status.members.forEach(r);
//     }
//     else if( L.sources.count() != 0 ) {
//         startOptimeDate = new Date();
//         L.sources.find().forEach(g);
//     }
//     else {
//         print("local.sources is empty; is this db a --slave?");
//         return;
//     }
// }

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
