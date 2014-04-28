Example: Get a detailed report on the current sharding status
of a deployment.  [view result](https://gist.github.com/imlucas/11374071)

```
var scope = require('scope')('http://localhost:29017');
// @todo: should deployment.get allow just a hostname, from which it will
// search the process tree for a router proc or mongod proc?
scope.get('mongodb://localhost:30999', function(err, deployment){
  if(err) return console.error('error', err);

  var router = deployment.instances.filter(function(instance){
    return instance.type === 'router';
  })[0];

  console.log('> using router ' + router.name + '\n');

  scope.sharding(router.name, function(err, res){
    if(err) return console.error('error', err);
    console.log('# ' + deployment.name + ' sharding report');

    console.log('## collections\n');
    res.collections.map(function(col){
      console.log('### `' + col._id + '`\n');
      console.log('- shard on `' + JSON.stringify(col.shard_key) + '`');
      console.log('- tags `' + (col.tags.length ? col.tags.join(', ') : 'none') + '`');
      console.log('- storage ' + col.stats.storage_size +
          ', documents ' + col.stats.document_size +
          ', indexes ' + col.stats.index_size);
      console.log('- documents ' + col.stats.document_count);
      console.log('- indexes ' + col.stats.index_count);

      // @todo: there should be some tolerance to showing warnings if
      // distribution is off target.
      var target = (1/col.shards.length) * 100;

      console.log('- target distribution per shard ' + target + '%');
      console.log();

      col.shards.map(function(s){
        console.log('#### `' + s._id + '`\n');
        s.warnings = [];

        if(s.stats.document_count === 0){
          return console.log('- **warning** empty shard\n');
        }

        s.stats.document_share = (s.stats.document_count/col.stats.document_count * 100).toFixed(2);
        s.stats.document_storage_share = (s.stats.document_size/col.stats.document_size * 100).toFixed(2);
        s.stats.storage_share = (s.stats.storage_size/col.stats.storage_size * 100).toFixed(2);

        if(s.stats.document_share > target){
          s.warnings.push('EHIGHDOCS');
        }
        else if(s.stats.document_share < target){
          s.warnings.push('ELOWDOCS');
        }

        if(s.stats.document_storage_share > target){
          s.warnings.push('EHIGHDOCSTOR');
        }
        else if(s.stats.document_storage_share < target){
          s.warnings.push('ELOWDOCSTOR');
        }

        if(s.stats.storage_share > target){
          s.warnings.push('EHIGHSTOR');
        }
        else if(s.stats.storage_share < target){
          s.warnings.push('ELOWSTOR');
        }

        if(s.warnings){
          console.log('- **warning** ' + s.warnings.join(', '));
        }

        console.log('- documents (' + s.stats.document_share + '%) ' + 'storage (' + s.stats.document_storage_share + '%)');

        console.log();
        s.chunks.map(function(chunk){
          console.log('##### `' + chunk._id + '`\n');
          console.log('- last modified: ' + chunk.last_modified_on);
          console.log('- ' + JSON.stringify(chunk.keyspace[0]) + ' → ' + JSON.stringify(chunk.keyspace[1]));
          console.log();
        });
      });

    });

    console.log('## topology');
    var l = null;
    res.instances.map(function(i){
      if(i.shard !== l){
        l = i.shard;
        if(l){
          console.log('\n### `' + l + '`\n');
        }
        else {
          console.log('\n### routers\n');
        }
      }
      console.log('  - [' + i.name + '](http://scope.mongodb.land/#connect/'+i.url+')');
    });

    console.log();
    console.log('## other databases\n');
    res.databases.map(function(db){
      if(db.partitioned) return;
      console.log('- ' + db._id + '(' + db.primary + ')');
    });

  });
});
```
