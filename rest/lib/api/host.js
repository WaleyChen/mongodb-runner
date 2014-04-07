'use strict';
var NotAuthorized = require('../errors').NotAuthorized,
  diskspace = require('diskspace');

module.exports = function(app){
  app.get('/api/v1/:host', info, dbNames, build, deployment, admin('serverStatus', 'status'), function(req, res){
    res.send({
      database_names: req.db.database_names,
      deployment: req.deployment,
      host: req.db.host,
      build: req.db.build,
      status: req.db.status
    });
  });

  app.get('/api/v1/:host/profile', admin('profilingLevel'),
      admin('profilingInfo', 'profilingEntries'), function(req, res){
    res.send({
      level: res.profilingLevel,
      entries: res.profilingEntries
    });
  });
};

function admin(cmd, sets){
  sets = sets || cmd;

  return function(req, res, next){
    req.db.admin()[cmd](function(err, data){
      if(err) return next(err);
      if(!data) return next(new NotAuthorized('not authorized to run ' + cmd));

      res[sets] = data;
      next();
    });
  };
}

function deployment(req, res, next){
  req.deployment = deployment.get(req.param('host'));
  next();
}

function info(req, res, next){
  req.db.admin().command({hostInfo: 1}, {}, function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view host information'));

    data = data.documents[0];
    req.db.host = {
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
      req.db.host.disk_total = total;
      req.db.host.disk_free = free;
      req.db.host.disk_state = state;
      next();
    });
  });
}

function dbNames(req, res, next){
  req.db.admin().listDatabases(function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to list databases'));

    req.db.database_names = data.databases.filter(function(db){
      return ['local', 'admin'].indexOf(db.name) === -1;
    }).map(function(db){
      return db.name;
    });
    next();
  });
}

function build(req, res, next){
  req.db.admin().buildInfo(function(err, data){
    if(err) return next(err);
    if(!data) return next(new NotAuthorized('not authorized to view build info'));

    req.db.build = {
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
