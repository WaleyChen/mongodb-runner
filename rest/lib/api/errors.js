"use strict";

var http = function(code, message, ref){
  var err = new Error();
  err.code = code;
  err.http = true;
  err.message = message;
  Error.captureStackTrace(err, ref);
  return err;
};

module.exports.NotImplemented = function(){
  return http(418, 'Coming Soon', module.exports.NotImplemented);
};

module.exports.NotFound = function(message){
  return http(404, message, module.exports.NotFound);
};

module.exports.NotAuthorized = function(message){
  return http(403, message, module.exports.NotAuthorized);
};

module.exports.BadRequest = function(message){
  return http(400, message, module.exports.BadRequest);
};
