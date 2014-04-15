var deployment = require('../deployment'),
  nconf = require('nconf'),
  jwt = require('jsonwebtoken'),
  token = require('../token'),
  eventSource = require('event-source-emitter'),
  BadRequest = require('../errors').BadRequest,
  bodyParser = require('body-parser'),
  debug = require('debug')('mongoscope');

module.exports = function(app){
  app.monger_io = function(handler){
    app.on('io', function(io){
      io.sockets.on('connection', function(socket){
        handler(null, socket);
      });
    });
  };

  app.monger = function(path, fn){
    app.get('/api/v1/:host' + path, function(req, res, next){
      var reader = fn(req.mongo);

      if(req.headers.accept === 'text/event-stream'){
        var es = eventSource(req, res, {keepAlive: true});
        reader.on('data', function(lines){
          es.emit('data', lines);
        });

        req.on('close', function() {
          reader.close();
        });
        return reader.listen();
      }

      reader.find().end(function(err, ops){
        if(err) return next(err);
        res.send(ops);
      });
    });

    app.monger_io(function(err, socket){
      socket.on(path, function(data){
        token.connection(data.token, 'localhost:27017', function(err, mongo){
          if(err) return socket.emit('error', err);

          var reader = fn(mongo).listen();

          reader.on('data', function(data){
            socket.emit(path, data);
          });

          socket.on(path + '/unsubscribe', function(){
            if(reader){
              reader.close();
            }
          });

          socket.on('disconnect', function(){
            if(reader){
              reader.close();
            }
          });
        });
      });
    });
  };

  app.param('database_name', function(req, res, next, name){
    debug('for database', name);
    req.db = req.mongo.db(name);
    req.db.name = name;
    next();
  });

  app.param('collection_name', function(req, res, next, name){
    debug('for collection', name);
    req.db.collection(name, function(err, col){
      if(err) return next(err);
      req.col = col;
      next();
    });
  });

  app.param('host', token.required);

  // Example response:
  //
  // ```
  //
  //     [
  //       {
  //         "_id": "localhost:27017",
  //         "instances": {
  //           "localhost:27017": {
  //             "type": "standalone",
  //             "uri": "localhost:27017"
  //           }
  //         }
  //       }
  //     ]
  // ```
  app.get('/api/v1', token.required, function(req, res){
    deployment.all(function(err, docs){
      res.send(docs.map(function(d){
        return {_id: d._id, instances: d.instances};
      }));
    });
  });

  // Actor sends a post request with their `username` and `password`.
  // Try and connect to mongo with those credentials.
  app.post('/api/v1/token', bodyParser(), function(req, res, next){
    var host = req.param('seed');

    if(!host) return next(new BadRequest('No host specified'));

    debug('discovering deployment', host);
    deployment.discover(host, function(err, dep){
      // If we can't connect, either mongo is not running these
      // or the credentials are invalid.
      if(err) return next(err);

      debug('generating token');
      // If we're able to successfully connect, generate a signed json web
      // token that contains an id to use the connection.
      var token = jwt.sign({deployment: host},
        nconf.get('token:secret'), {expiresInMinutes: nconf.get('token:lifetime')}),
        now = Date.now();

      debug('adding connection for new token session');
      deployment.get(host, function(err, deploy){
        deploy.connection(token, dep.db);

        return res.send(200, {
          token: token,
          expires_at: new Date(now + (nconf.get('token:lifetime') * 60 * 1000)),
          created_at: new Date(now)
        });
      });
    });
  });

  ['replicaset', 'host', 'security', 'database', 'collection'].map(function(name){
    require('./' + name)(app);
  });

  app.get('/health-check', function(req, res){
    res.send('ok');
  });
};
