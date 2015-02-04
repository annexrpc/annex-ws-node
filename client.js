/**
 * Module dependencies
 */

var Websocket = require('ws');

module.exports = Client;

function Client(url, opts) {
  if (!(this instanceof Client)) return new Client(url, opts);
  this.url = url;
  var self = this;
  var pending = self.pending = [];
  this.requests = {};

  this.marshal = opts.marshal;

  this._id = 0;

  this._setupws();

  this._interval = setInterval(function() {
    if (self.ws.readyState === Websocket.OPEN) self.ws.ping();
  }, 10000);
  this._interval.unref();

  function close() {
    self.close();
  }
  process.on('SIGINT', close);
  process.on('SIGTERM', close);
}

Client.prototype.call = function(mod, fun, args, cb) {
  var id = this._id++;
  var req = this.marshal.call(id, [mod, fun], args);

  if (this.ws.readyState !== Websocket.OPEN) this.pending.push(req);
  else this.ws.send(req);

  this.requests[id] = cb;

  return this;
};

Client.prototype.close = function() {
  this.shuttingDown = true;
  var ws = this.ws;
  ws && ws.terminate && ws.terminate();
  clearInterval(this._interval);
  return this;
};

Client.prototype._setupws = function() {
  var self = this;

  if (self.shuttingDown) return self;

  var ws = this.ws = new Websocket(this.url);

  ws.on('open', function() {
    self.pending.forEach(function(req) {
      ws.send(req);
    });
  });

  ws.on('error', function(err) {
    setTimeout(function() {
      ws.terminate();
      self._setupws();
    }, 1000);
  });

  ws.on('close', function() {
    ws.terminate();
    self._setupws();
  });

  ws.on('message', function(data) {
    self._handle(data);
  });
};

Client.prototype._handle = function(data) {
  try {
    var res = this.marshal.decode(data);
  } catch (e) {
    return this._handleError(e);
  }

  var type = res[0];
  var id = res[1];

  if (type === 1) return this._handleError(res);

  var cb = this.requests[id];

  if (cb) cb(null, res[2]);

  delete this.requests[id];
};

Client.prototype._handleError = function() {

};
