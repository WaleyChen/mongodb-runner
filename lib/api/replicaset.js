// @todo: include more from serverStatus:
// http://docs.mongodb.org/master/reference/command/serverStatus/#serverStatus.metrics.repl
//
var NotAuthorized = require('../errors').NotAuthorized,
  BadRequest = require('../errors').BadRequest,
  oplog = require('../monger/oplog'),
  eventSource = require('event-source-emitter'),
  debug = require('debug')('mg:mongorest:replicaset');

module.exports = function(app){
  app.get('/api/v1/:host/replication', read);
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

// @todo: from mongo `shell/utils.js`:
//
// ```
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
// ```
module.exports.removeLastOpWritten = function(req, res, next){};


function read(req, res, next){
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

    // @todo: Include oplog collection stats?
    // ```
    // ol = db.getCollection(oplog);
    // result.usedMB = ol.stats().size / ( 1024 * 1024 );
    // result.usedMB = Math.ceil( result.usedMB * 100 ) / 100;
    // ```

    // @todo: Get first and last item:
    // From pro services script http://git.io/cMmH1w
    // ```
    // var firstc = ol.find().sort({$natural:1}).limit(1);
    // var lastc = ol.find().sort({$natural:-1}).limit(1);
    // if( !firstc.hasNext() || !lastc.hasNext() ) {
    //     result.errmsg = "objects not found in local.oplog.$main -- is this a new and empty db instance?";
    //     result.oplogMainRowCount = ol.count();
    //     return result;
    // }
    // var first = firstc.next();
    // var last = lastc.next();
    // var tfirst = first.ts;
    // var tlast = last.ts;
    // if( tfirst && tlast ) {
    //     tfirst = DB.tsToSeconds( tfirst );
    //     tlast = DB.tsToSeconds( tlast );
    //     result.timeDiff = tlast - tfirst;
    //     result.timeDiffHours = Math.round(result.timeDiff / 36)/100;
    //     result.tFirst = (new Date(tfirst*1000)).toString();
    //     result.tLast  = (new Date(tlast*1000)).toString();
    //     result.now = Date();
    // }
    // else {
    //     result.errmsg = "ts element not found in oplog objects";
    // }
    // ```
    var replicaset = {
      _id: rs.set,
      members: [],
      primary: null,
      arbiters: [],
      secondaries: [],
      instance: null,
      oplog_size: rs.logSizeMB / 1024 / 1024,
      oplog_window: []
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
          replicaset.primary = doc;
        }
        else {
          doc.lag_operational = rs.date - member.lastHeartbeat;
          doc.lag_replication = member.optimeDate - member.lastHeartbeat;

          if(member.state === 7){
            doc.isArbiter = true;
            replicaset.arbiters.push(doc);
          }
          else {
            doc.isSecondary = true;
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
