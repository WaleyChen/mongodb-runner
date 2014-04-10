var Writable = require('stream').Writable,
  util = require('util'),
  MongoClient = require('mongodb').MongoClient;

util.inherits(StreamToMongo, Writable);

function StreamToMongo(options) {
  if(!(this instanceof StreamToMongo)) {
    return new StreamToMongo(options);
  }
  Writable.call(this, { objectMode: true });
  this.options = options;
}


StreamToMongo.prototype._write = function (obj, encoding, done) {
  var self = this;
  if (!this.db){
    MongoClient.connect(this.options.db, function (err, db) {
      if (err) throw err;
      self.db = db;
      self.collection = db.collection(self.options.collection);
      self.collection.insert(obj, { w: 1 }, done);
    });
  } else {
    console.log('insert');
    self.collection.insert(obj, { w: 1 }, done);
  }
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
    createWriteStream: StreamToMongo,
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
      return request(_url);
    }
  },
  write: {
    mongo: function(db, collectionName){
      var w = mongo.createWriteStream({db: db, collection: collectionName});
      if(typeof db === 'object'){
        w.db = db;
        w.collection = db.collection(collectionName);
      }
      return w;
    },
    http: function(url){
      return http.createWriteStream(url);
    }
  },

  transform: {
    gunzip: function() {
      return zlib.createGunzip();
    },
    gzip: function() {
      return zlib.createGzip();
    },
    fromJSON: function(paths){
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

// Build a real pipechain from user input and return a list of write streams.
module.exports = function(pipechain){
  var steps = {};

  return pipechain.read.map(function(spec){
    steps[spec.name] = [ops.read[spec.name].apply(this, spec.args)];
    pipechain.transform.map(function(trans){
      steps[spec.name].push(ops.transform[trans.name].apply(this, trans.args));
    });

    pipechain.write.map(function(writeSpec){
      steps[spec.name].push(ops.write[writeSpec.name].apply(this, writeSpec.args));
    });
    console.log('pipeline', steps[spec.name]);
    return es.pipeline.apply(this, steps[spec.name]);
  });
};
