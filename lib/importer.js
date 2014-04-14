var Writable = require('stream').Writable,
  util = require('util'),
  debug = require('debug')('mongoscope:importer');

function MongoWriteStream() {
  Writable.call(this, { objectMode: true });
}
util.inherits(MongoWriteStream, Writable);

MongoWriteStream.prototype._write = function (obj, encoding, done) {
  this.collection.insert(obj, { w: 1 }, done);
};


var zlib = require('zlib'),
  request = require('request'),
  JSONStream = require('JSONStream'),
  es = require('event-stream'),
  csv = require("csv-streamify"),
  http = {
    createWriteStream: request.put,
    createReadStream: request
  },
  mongo = {
    createWriteStream: function(){
      return new MongoWriteStream();
    },
    createReadStream: null
  };

var ops = {
  read: {
    file: function(filename){
      var fs = require('fs');
      return fs.createReadStream(filename);
    },
    url: function(_url) {
      // https://secure.toronto.ca/webwizard/ws/requests.json?start_date=2012-02-01T00:00:00Z&end_date=2012-02-07T00:00:00Z&jurisdiction_id=toronto.ca
      debug('read stream for url', _url);
      return request(_url).pipe(zlib.createGunzip());
    }
  },
  write: {
    mongo: function(db, collectionName){
      var w = mongo.createWriteStream({db: db, collection: collectionName});
      if(typeof db === 'object'){
        w.db = db;
        w.collection = db.collection(collectionName);
      }
      debug('created mongo write stream', collectionName);
      return w;
    },
    http: function(url){
      return http.createWriteStream(url);
    }
  },

  transform: {
    gunzip: function() {
      debug('created gunzip');
      return zlib.createGunzip();
    },
    gzip: function() {
      return zlib.createGzip();
    },
    fromJSON: function(paths){
      debug('created fromJSON', paths);
      return JSONStream.parse(paths);
    },
    toJSON: function(){
      return JSONStream.stringify();
    },
    fromCSV: function(){
      return csv({objectMode: true, columns: true});
    },
    fromTSV: function() {
      return csv({objectMode: true, delimiter: "\t"});
    }
  }
};

function run(pipechain){
  var steps = {};
  debug('running pipechain', pipechain);
  return pipechain.read.map(function(spec){
    debug('read spec', spec);
    steps[spec.name] = [ops.read[spec.name].apply(this, spec.args)];
    pipechain.transform.map(function(trans){
      if(!ops.transform[trans.name]){
        throw new Error('Unknown transform: ' + trans.name);
      }
      steps[spec.name].push(ops.transform[trans.name].apply(this, trans.args));
    });

    pipechain.write.map(function(writeSpec){
      steps[spec.name].push(ops.write[writeSpec.name].apply(this, writeSpec.args));
    });
    return es.pipeline.apply(this, steps[spec.name]);
  });
}


// Build a real pipechain from user input and return a list of write streams.
module.exports = function(req, res){
    var pipechain = JSON.parse(req.param('pipechain'));

    if(pipechain.write[0].name === 'mongo'){
      pipechain.write[0].args = [req.db, req.param('collection_name')];
    }

    run(pipechain)[0].pipe(es.wait(function(err, text){
      debug('got an end', err, text);
      res.send('complete');
    }))
    .on('error', function(err){
      res.send(400, err.message);
    });
};
