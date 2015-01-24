/**
 * Module dependencies
 */

var WS = require('ws').Server;
var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var TYPES = {
  0: 'call',
  1: 'cast'
};

module.exports = Server;

function Server (opts) {
  if (!(this instanceof Server)) return new Server(opts);
  Emitter.call(this);
  opts = opts || {};
  this.marshal = opts.marshal;
  if (!this.marshal) throw new Error('missing marshal');
  delete opts.marshal;
  this.opts = opts;
}
inherits(Server, Emitter);

Server.prototype._handle = function(bin, ws) {
  if (!(bin instanceof Buffer)) bin = new Buffer(bin);
  var message = this.marshal.decode(bin);
  if (!Array.isArray(message)) return ws.send(this.marshal.error([0, 0, 'invalid message']));
  message.unshift(ws);
  var req = IncomingMessage.apply(null, message);
  var res = req.res;
  res._marshal = this.marshal;
  this.emit('request', req, res);
};

Server.prototype.listen = function(fn) {
  var self = this;
  var wss = this.wss = new WS(this.opts);

  if (fn) self.on('request', fn);

  wss.on('connection', function(ws) {
    ws.on('message', function(msg) {
      self._handle(msg, ws);
    });
  });
};

function IncomingMessage (ws, type, id, method, params) {
  if (!(this instanceof IncomingMessage)) return new IncomingMessage(ws, type, id, method, params);
  Emitter.call(this);
  this.ws = ws;
  this.type = TYPES[id] || 'unknown';
  this.id = id;
  this.url = this.module = method[0];
  this.method = method[1];
  this.headers = this.params = params;
  this.res = new OutgoingMessage(id, ws);
  this.res.req = this;
  this.ip = ws.upgradeReq.connection.remoteAddress;
}
inherits(IncomingMessage, Emitter);

function OutgoingMessage (id, ws) {
  Emitter.call(this);
  this.id = id;
  this.ws = ws;
}
inherits(OutgoingMessage, Emitter);

OutgoingMessage.prototype.send = function(answer) {
  this._send(this._marshal.response(this.id, answer));
  this.statusCode = 200;
  this._sent = true;
};

OutgoingMessage.prototype.error = function(error, code) {
  this._send(this._marshal.error(this.id, code || 1, error));
  this.statusCode = 500;
  this._sent = true;
};

OutgoingMessage.prototype._send = function(bin) {
  var self = this;
  this._header = this._headers = {
    'content-length': bin.length
  };
  this.ws.send(bin, function(err) {
    err ?
      self.emit('error', err) :
      self.emit('end');
  });
};
