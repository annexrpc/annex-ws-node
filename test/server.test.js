/**
 * Module dependencies
 */

var http = require('http');
var annex = require('..');

var server = module.exports = http.createServer();

var marshal = require('annex-marshal-msgpack-node');

var wss = new annex.Server({server: server, marshal: marshal});

wss.listen(function(req, res) {
  if (req.module === 'math' && req.method === 'random') return res.send(Math.random());
  if (req.module === 'math' && req.method === 'add') return res.send(req.params.reduce(function(acc, n) {return acc + n}, 0))
  if (req.module === 'string' && req.method === 'concat') return res.send(req.params.reduce(function(acc, str) { return acc + str; }, ''));
  res.error('Undefined ' + req.module + ':' + req.method);
});
