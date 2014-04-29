var NotAuthorized = require('../errors').NotAuthorized,
  diskspace = require('diskspace'),
  log = require('../monger/log'),
  topper = require('../monger/top');

module.exports = function(app){
  // @todo: should also include instance attributes from `Deployment.Instance`.
  app.get('/api/v1/:instance_id', info, dbNames, build, function(req, res){
    res.send(res.instance);
  });

  app.get('/api/v1/:instance_id/metrics', getMetrics);
  app.get('/api/v1/:instance_id/ops', currentOp);

  app.monger('/log', log);
  app.monger('/top', topper);
};

function currentOp(req, res, next){
  req.mongo.collection('$cmd.sys.inprog', function(err, col){
    if(err) return next(err);

    col.find({}).toArray(function(err, docs){
      if(err) return next(err);
      res.send(docs[0].inprog);
    });
  });
}

function getMetrics(req, res, next){
  var metrics = {};

  req.mongo.admin().serverStatus(function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to run serverStatus'));

    metrics.memory = {
      assert_regular_count: data.asserts.regular,
      assert_warning_count: data.asserts.warning,
      assert_msg_count: data.asserts.msg,
      assert_user_count: data.asserts.user,
      assert_rollovers_count: data.asserts.rollovers,
      resident_size: data.mem.resident,
      virtual_size: data.mem.virtual,
      mapped_size: data.mem.mapped,
      mapped_journal_size: data.mem.mappedWithJournal - data.mem.mapped
    };

    metrics.network = {
      connections_count: data.connections.current,
      connections_available_count: data.connections.available,
      connections_created_count: data.connections.totalCreated,
      in_size: data.network.bytesIn,
      out_size: data.network.bytesOut,
      request_count: data.network.numRequests
    };

    metrics.durability = {
      flush_total: data.backgroundFlushing.flushes,
      flush_time: data.backgroundFlushing.total_ms,
      flush_last_time: data.backgroundFlushing.last_ms,
      flush_last_finished_at: data.backgroundFlushing.last_finished,
      commits_count: data.dur.commits,
      commits_early_count: data.dur.earlyCommits,
      commits_inwritelock_count: data.dur.commitsInWriteLock,
      journaled_size: data.dur.journaledMB * 1024 * 1024,
      datafile_write_size: data.dur.writeToDataFilesMB * 1024 * 1024,
      compression: data.dur.compression,
      dt_time: data.dur.timeMs.dt,
      preplogbuffer_time: data.dur.timeMs.prepLogBuffer,
      journal_write_time: data.dur.timeMs.writeToJournal,
      datafile_write_time: data.dur.timeMs.writeToDataFiles,
      remap_time: data.dur.timeMs.remapPrivateView
    };

    metrics.lock = {
      time: data.globalLock.totalTime,
      locked_time: data.globalLock.lockTime,
      readers_queued_count: data.globalLock.currentQueue.readers,
      readers_active_count: data.globalLock.activeClients.readers,
      writers_queued_count: data.globalLock.currentQueue.writers,
      writers_active_count: data.globalLock.activeClients.writers
    };

    Object.keys(data.locks).map(function(name){
      if(name.length > 2){
        metrics.lock['db_' + name + '_readlocked_time'] = data.locks[name].timeLockedMicros.R * 1000;
        metrics.lock['db_' + name + '_writelocked_time'] = data.locks[name].timeLockedMicros.W * 1000;
        metrics.lock['db_' + name + '_readacquiring_time'] = data.locks[name].timeAcquiringMicros.R * 1000;
        metrics.lock['db_' + name + '_writeacquiring_time'] = data.locks[name].timeAcquiringMicros.W * 1000;
      }
    });

    metrics.indexes = {
      accesses_count: data.indexCounters.accesses,
      hits_count: data.indexCounters.hits,
      misses_count: data.indexCounters.misses,
      resets_count: data.indexCounters.resets
    };

    metrics.operations = {
      insert_count: data.opcounters.insert,
      query_count: data.opcounters.query,
      update_count: data.opcounters.update,
      delete_count: data.opcounters.delete,
      getmore_count: data.opcounters.getmore,
      command_count: data.opcounters.command,
      repl_insert_count: data.opcountersRepl.insert,
      repl_query_count: data.opcountersRepl.query,
      repl_update_count: data.opcountersRepl.update,
      repl_delete_count: data.opcountersRepl.delete,
      repl_getmore_count: data.opcountersRepl.getmore,
      repl_command_count: data.opcountersRepl.command
    };
// @todo: still to consolidate:
//     "recordStats": {
//       "accessesNotInMemory": 1,
//       "pageFaultExceptionsThrown": 0,
//       "admin": {
//         "accessesNotInMemory": 0,
//         "pageFaultExceptionsThrown": 0
//       },
//       "local": {
//         "accessesNotInMemory": 1,
//         "pageFaultExceptionsThrown": 0
//       }
//     },
//     "metrics": {
//       "cursor": {
//         "timedOut": 0,
//         "open": {
//           "noTimeout": 0,
//           "pinned": 0,
//           "total": 0
//         }
//       },
//       "document": {
//         "deleted": 0,
//         "inserted": 1,
//         "returned": 0,
//         "updated": 0
//       },
//       "getLastError": {
//         "wtime": {
//           "num": 0,
//           "totalMillis": 0
//         },
//         "wtimeouts": 0
//       },
//       "operation": {
//         "fastmod": 0,
//         "idhack": 0,
//         "scanAndOrder": 0
//       },
//       "queryExecutor": {
//         "scanned": 0,
//         "scannedObjects": 0
//       },
//       "record": {
//         "moves": 0
//       },
//       "repl": {
//         "apply": {
//           "batches": {
//             "num": 0,
//             "totalMillis": 0
//           },
//           "ops": 0
//         },
//         "buffer": {
//           "count": 0,
//           "maxSizeBytes": 268435456,
//           "sizeBytes": 0
//         },
//         "network": {
//           "bytes": 0,
//           "getmores": {
//             "num": 0,
//             "totalMillis": 0
//           },
//           "ops": 0,
//           "readersCreated": 0
//         },
//         "preload": {
//           "docs": {
//             "num": 0,
//             "totalMillis": 0
//           },
//           "indexes": {
//             "num": 0,
//             "totalMillis": 0
//           }
//         }
//       },
//       "storage": {
//         "freelist": {
//           "search": {
//             "bucketExhausted": 0,
//             "requests": 0,
//             "scanned": 0
//           }
//         }
//       },
//       "ttl": {
//         "deletedDocuments": 0,
//         "passes": 122
//       }
    res.send(metrics);
  });
}

function info(req, res, next){
  res.instance = {};

  req.mongo.admin().command({hostInfo: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data || !data.documents[0]) return next(new NotAuthorized('not authorized to view host information'));

    data = data.documents[0];
    res.instance.host = {
      system_time: data.system.currentTime,
      hostname:  data.system.hostname,
      os: data.os.name,
      os_family: data.os.type.toLowerCase(),
      kernel_version: data.os.version,
      kernel_version_string: data.extra.versionString,
      memory_bits: data.system.memSizeMB * 1024 * 1024,
      memory_page_size: data.extra.pageSize,
      arch: data.system.cpuArch,
      cpu_cores: data.system.numCores,
      cpu_cores_physical: data.extra.physicalCores,
      cpu_scheduler: data.extra.scheduler,
      cpu_frequency: data.extra.cpuFrequencyMHz * 1000000,
      cpu_string: data.extra.cpuString,
      cpu_features: data.extra.cpuFeatures.split(' '),
      cpu_bits: data.system.cpuAddrSize,
      machine_model: data.extra.model,
      feature_numa: data.system.numaEnabled,
      feature_always_full_sync: data.extra.alwaysFullSync,
      feature_nfs_async: data.extra.nfsAsync
    };

    diskspace.check('/', function(total, free, state){
      res.instance.host.disk_total = total;
      res.instance.host.disk_free = free;
      res.instance.host.disk_state = state;
      next();
    });
  });
}

function dbNames(req, res, next){
  req.mongo.admin().listDatabases(function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to list databases'));

    res.instance.database_names = data.databases.filter(function(db){
      return ['local', 'admin'].indexOf(db.name) === -1;
    }).map(function(db){
      return db.name;
    });
    next();
  });
}

function build(req, res, next){
  req.mongo.admin().buildInfo(function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view build info'));

    res.instance.build = {
      version: data.version,
      commit: data.gitVersion,
      commit_url: 'https://github.com/mongodb/mongo/commit/' + data.gitVersion,
      openssl_version: data.OpenSSLVersion || null,
      boost_version: /BOOST_LIB_VERSION=([\d_]+)/.exec(data.sysInfo)[1].replace('_', '.'),
      flags_loader: data.loaderFlags,
      flags_compiler: data.compilerFlags,
      allocator: data.allocator,
      javascript_engine: data.javascriptEngine,
      debug: data.debug,
      for_bits: data.bits,
      max_bson_object_size: data.maxBsonObjectSize,
    };
    next();
  });
}

// @todo: Extra host info pro services uses:
// #!/bin/bash
// #
// # Linux system data collector.

// # Execute on MongoDB server:
// #
// #   getLinuxSystemData.sh > getLinuxSystemData.log
// #
// # Author: james.tan@mongodb.com

// function ensure_linux() {
//   if ! [ `uname` = 'Linux' ]; then
//     echo "Sorry, this script only runs on Linux"
//     exit 2
//   fi
// }

// function get_ulimits() {
//   echo "** system ulimits:"
//   ulimit -a
//   echo "** ulimits for any running mongod and mongos processes:"
//   for process in mongod mongos; do
//     for pid in `pgrep $process`; do
//       ps -fp $pid
//       cat /proc/$pid/limits
//       echo
//     done
//   done
// }
// ensure_linux

// echo "** Date: `date`"
// echo "** uname: `uname -a`"
// echo "** lsb_release:"
// lsb_release -a

// echo "** cpuinfo:"
// cat /proc/cpuinfo
// echo "** meminfo:"
// cat /proc/meminfo

// echo "** dmesg:"
// dmesg

// echo "** mount:"
// mount
// echo "** df -Th:"
// df -Th
// echo "** blockdev --report:"
// /sbin/blockdev --report
// echo "** smart output:"
// /usr/sbin/smartctl --scan | sed -e 's/#.*$//' | while read i; do /usr/sbin/smartctl --all $i; done
// echo "** fdisk:"
// fdisk -l
// echo "** pvdisplay:"
// pvdisplay
// echo "** lvdisplay:"
// lvdisplay

// get_ulimits

// echo "** ps:"
// ps aux

// echo "** lspci:"
// lspci -vvv
// echo "** sysctl:"
// /sbin/sysctl -a
