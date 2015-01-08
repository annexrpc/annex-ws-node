/**
 * Module dependencies
 */

var http = require('http');
var Server = require('..');

var server = module.exports = http.createServer();

var msgpack = require('msgpack');

var marshal = {
  encode: function(arg) {
    return msgpack.pack(arg);
  },
  decode: function(bin) {
    return msgpack.unpack(bin);
  }
};

var wss = new Server({server: server, marshal: marshal});

wss.listen(function(req, res) {
  if (req.module === 'math' && req.method === 'random') return res.send(Math.random());
  if (req.module === 'string' && req.method === 'concat') return res.send(req.params.reduce(function(acc, str) { return acc + str; }, ''));
  res.error('Undefined ' + req.module + ':' + req.method);
});
