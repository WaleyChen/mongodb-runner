var nconf = require('nconf'),
    proxy = require('http-proxy').createProxyServer({});

nconf.env().argv().defaults({
    'backend': 'http://localhost:28017',
    'port': 3001
});

module.exports = require('http').createServer(function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE,OPTIONS');

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  proxy.web(req, res, { target: nconf.get('backend') });
});

module.exports.port = nconf.get('port');
