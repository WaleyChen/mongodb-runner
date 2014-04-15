var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  BadRequest = require('./errors').BadRequest,
  es = require('event-stream'),
  debug = require('debug')('mongoscope:importer');

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
    createWriteStream: function(db, collectionName){
      return es.through(function(obj){
        if(Array.isArray(obj)){
          var batch = db.collection(collectionName).initializeUnorderedBulkOp();
          obj.map(function(doc){
             batch.insert(doc);
          });
          batch.execute(function(err, res){
            console.log('batch execute result', err, res.toJSON());
            this.emit('data', obj);
          }.bind(this));
        }
        else{
          this.collection.insert(obj, function(){
            this.emit('data', obj);
          }.bind(this));
        }
      });
    },
    createReadStream: null
  };

function Pipechain(data){
  this.data = data;
}
util.inherits(Pipechain, EventEmitter);

Pipechain.prototype.run = function(fn){
  var steps = {},
    spec = this.data.read[0],
    self = this;

  function progress(name){
    return es.through(function(data){
      self.emit('step progress', name);
      this.emit('data', data);
    }, function(){
      self.emit('step complete', name);
      this.emit('end');
    });
  }

  debug('read spec', spec);
  steps[spec.name] = [ops.read[spec.name].apply(this, spec.args)];


  this.data.transform.map(function(trans){
    if(!ops.transform[trans.name]){
      throw new Error('Unknown transform: ' + trans.name);
    }
    steps[spec.name].push(ops.transform[trans.name].apply(this, trans.args));
    steps[spec.name].push(progress(trans.name));
  });

  this.data.write.map(function(writeSpec){
    steps[spec.name].push(ops.write[writeSpec.name].apply(this, writeSpec.args));
    steps[spec.name].push(progress(writeSpec.name));
  });

  steps[spec.name].push(es.wait(function(){
    debug('pipechain complete!');
    fn();
  }));

  this.on('step progress', function(step){
    debug('progress on step', step);
  })
  .on('step complete', function(step){
    debug('completed', step);
  });
  this.pipeline = es.pipeline.apply(this, steps[spec.name]);
  return this;
};

var ops = {
  read: {
    file: function(filename){
      var fs = require('fs');
      return fs.createReadStream(filename);
    },
    url: function(_url) {
      // https://secure.toronto.ca/webwizard/ws/requests.json?start_date=2012-02-01T00:00:00Z&end_date=2012-02-07T00:00:00Z&jurisdiction_id=toronto.ca
      return request(_url,{headers: {'User-Agent': 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'}});
    }
  },
  write: {
    mongo: function(db, collectionName){
      var w = mongo.createWriteStream(db, collectionName);
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


// Build a real pipechain from user input and return a list of write streams.
module.exports = function(req, res){
  var pipechain, data = JSON.parse(req.param('pipechain'));
  if(data.write[0].name === 'mongo'){
    data.write[0].args = [req.db, req.param('collection_name')];
  }

  pipechain = new Pipechain(data)
    .run(function(){
      res.send('complete');
    })
    .on('error', function(err){
      res.send(400, err.message);
    });
};
