// @todo: still psuedo-code pulled from various scripts, but soon it
// shall be sweet!

function enabled(fn){
  var version = configDB.getCollection( "version" ).findOne();
  fn(null, version === null);
}

function version(fn){
  configDB.getCollection( "version" ).findOne();
}

function shards(fn){
  configDB.shards.find().sort( { _id : 1 } ).forEach(function(z){
    output( "    " + tojsononeline( z ) );
  });
}

function databases(fn){
  configDB.databases.find().sort( { name : 1 } ).forEach(function(db){
    output( "    " + tojsononeline(db,"",true) );
  });
}

function configServers(){}

function collections(databaseId, fn){
  if(!db.partitioned) return fn();

  var collections = configDB.collections.find({
    _id : new RegExp('^' + databaseId + '\\.')
  }).sort({_id : 1});

  var tasks = collections.map(function(coll){
    return function(cb){
      if(coll.dropped === true) return cb();

      var data = {
        _id: coll._id,
        shard_key: coll.key,
        chunks: [],
        chunks_total: 0,
        chunk_shards: [],
        tags: []
      };

      async.parallel([
        function chunksInCollection(done){
          var query = [
            {"$match": { ns: coll._id }},
            {"$group": { _id: "$shard", nChunks: { "$sum": 1 }}}
          ];
          configDB.chunks.aggregate(query, function(err, res){
            res.map(function(chunk){
              data.chunks_total += z.nChunks;
              data.chunks.push({_id: chunk._id, count: chunk.nChunks});
            });
            done();
          });
        },
        function chunkToShardInCollection(done){
          configDB.chunks.find( { "ns" : coll._id } ).sort( { min : 1 } ).forEach(function(chunk){
            data.chunk_shards.push({
              _id: chunk._id,
              shard: chunk.shard,
              min: chunk.min,
              max: chunk.max,
              jumbo: chunk.jumbo
            });
            done();
          });
        },
        function collectionTags(done){
          configDB.tags.find( { ns : coll._id } ).sort( { min : 1 } ).forEach(function(tag){
            data.tags.push(tag);
            done();
          });
        }], function(err){
          cb(err, data);
        });
    };
  });
}
