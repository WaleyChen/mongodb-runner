"use strict";

var async = require('async'),
  mw = require('./middleware'),
  debug = require('debug')('mongorest:api');

module.exports.routes = function(app){
  app.get('/api/v1', mw.admin(), function(req, res, next){
    var cmds = {
        build: function(cb){
          req.database.buildInfo(function(err, data){
            if(err) return cb(err);

            cb(null, {
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
            });
          });
        },
        database_names: function(cb){
          req.database.listDatabases(function(err, data){
            if(err) return cb(err);

            cb(null, data.databases.filter(function(db){
              return ['local', 'admin'].indexOf(db.name) === -1;
            }).map(function(db){
              return db.name;
            }));
          });
        },
        host: function(cb){
          req.database.command({hostInfo: 1}, {}, function(err, data){
            if(err) return cb(err);

            data = data.documents[0];
            cb(null, {
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
            });
          });
        }
      };

    async.parallel(cmds, function(err, results){
      if(err) return next(err);
      res.send({
        database_names: results.database_names,
        host: results.host,
        build: results.build
      });
    });
  });

  app.get('/api/v1/:database_name', mw.database(), function(req, res, next){
    var cmds = {
      stats: function(cb){
        req.database.command({dbStats: 1}, {}, function(err, data){
          if(err) return cb(err);

          var stat = {
            object_count: data.objects,
            object_size: data.dataSize,
            storage_size: data.storageSize,
            index_count: data.indexes,
            index_size: data.indexSize,
            extent_count: data.numExtents,
            extent_freelist_count: data.extentFreeList.num,
            extent_freelist_size: data.extentFreeList.totalSize,
            file_size: data.fileSize,
            ns_size: data.nsSizeMB * 1024 * 1024
          };
          cb(null, stat);
        });
      },
      collection_names: function(cb){
        find(req.database, 'system.namespaces', {}, function(err, data){
          if(err) return cb(err);

          cb(null, data.filter(function(col){
            return !(col.name.indexOf('$') >= 0 && col.name.indexOf('.oplog.$') < 0);
          }).map(function(col){
            return col.name.replace(req.database.databaseName + '.', '');
          }));
        });
      }
    };

    async.parallel(cmds, function(err, results){
      if(err) return next(err);
      if(results.stats.collections === 0){
        return next(new Error('Unknown db: `' + req.param('database_name') + '`'));
      }
      res.send({
        name: req.param('database_name'),
        collection_names: results.collection_names,
        stats: results.stats
      });
    });
  });

  app.get('/api/v1/:database_name/:collection_name', mw.database(), mw.collection(), function(req, res, next){
    var ns = req.param('collection_name') + '.' + req.param('database_name'),
      cmds = {
        stats: function(cb){
          req.database.command({collStats: req.param('collection_name')}, {}, function(err, data){
            if(err) return next(err);

            var stat = {
              index_sizes: data.indexSizes,
              object_count: data.count,
              object_size: data.size,
              storage_size: data.storageSize,
              index_count: data.nindexes,
              index_size: data.totalIndexSize,
              padding_factor: data.paddingFactor,
              extent_count: data.numExtents,
              extent_last_size: data.lastExtentSize,
              flags_user: data.userFlags,
              flags_system: data.systemFlags
            };

            cb(null, stat);
          });
        },
        indexes: function(cb){
          find(req.database, 'system.indexes',
              {ns: req.param('database_name') + '.' + req.param('collection_name')}, function(err, data){
            if(err) return cb(err);
            cb(null, data);
          });
        }
      };

    async.parallel(cmds, function(err, results){
      if(err) return next(err);

      results.indexes.map(function(index, i){
        results.indexes[i].size = results.stats.index_sizes[index.name];
      });
      delete results.stats.index_sizes;

      res.send({
        name: req.param('collection_name'),
        database: req.param('database_name'),
        ns: ns,
        indexes: results.indexes,
        stats: results.stats
      });
    });
  });
};
