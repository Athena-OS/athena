"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Provides native APIs for RPCWebSocket transport.
//
// Because we're passing through some native APIs, e.g. net, we recast its API
// to something more browser-safe, so don't assume the APIs are 1:1 or behave
// exactly like the native APIs.
var _require = require('./safeEmitter'),
    createSafeEmitter = _require.createSafeEmitter;

var http = require('http');

var ws = require('ws');

var origInstanceMap = new Map();
var nextInstanceId = 1; // converts Node.js Buffer to ArrayBuffer

function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function recastWSSocket(socket, req) {
  var emitter = createSafeEmitter();
  socket.on('error', function (err) {
    return emitter.emit('error', err);
  });
  socket.on('close', function (code, message) {
    return emitter.emit('close', code, message);
  });
  socket.on('message', function (data) {
    if (data instanceof Buffer) {
      data = toArrayBuffer(data);
    }

    emitter.emit('message', data);
  });
  return _objectSpread({
    upgradeReq: function upgradeReq() {
      return {
        url: req.url,
        headers: {
          origin: req.headers.origin
        }
      };
    },
    send: function send(data) {
      var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (opts.binary) {
        data = Buffer.from(data);
      }

      try {
        socket.send(data, opts);
      } catch (e) {
        // ws shouldn't be throwing when CLOSED or CLOSING
        // currently being addressed in https://github.com/websockets/ws/pull/1532
        if (!e.message.match(/CLOS(ED|ING)/)) {
          throw e;
        }
      }
    },
    close: function close(code, message) {
      return socket.close(code, message);
    }
  }, emitter);
}

function createWrappedWSServer(opts) {
  // opts.server that comes in is our remapped server, so we
  // get the original
  if (opts.instanceId) {
    opts.server = origInstanceMap.get(opts.instanceId);
  }

  var wss = new ws.Server(opts);
  var emitter = createSafeEmitter();
  wss.on('connection', function (socket, req) {
    return emitter.emit('connection', recastWSSocket(socket, req));
  });
  return _objectSpread({}, emitter);
}

function recastHTTPReq(req) {
  var attached = false;
  var emitter = createSafeEmitter();
  return {
    url: function url() {
      return req.url;
    },
    method: function method() {
      return req.method;
    },
    headers: function headers() {
      return req.headers;
    },
    on: function on(name, listener) {
      // We need to attach listeners for data only on data event, which sets the
      // request to flowing mode.
      if (name === 'data' && !attached) {
        req.on('error', function (err) {
          return emitter.emit('error', err);
        });
        req.on('end', function () {
          return emitter.emit('end');
        });
        req.on('data', function (data) {
          // force cast the data to a string
          // this is because we only deal with string data on http requests so far
          emitter.emit('data', '' + data);
        });
        attached = true;
      }

      emitter.on(name, listener);
    }
  };
}

function recastHTTPRes(res) {
  return {
    setHeader: function setHeader(header, value) {
      return res.setHeader(header, value);
    },
    writeHead: function writeHead(status, headers) {
      return res.writeHead(status, headers);
    },
    end: function end(body) {
      return res.end(body);
    }
  };
}

function createWrappedHTTPServer() {
  var server = http.createServer();
  var emitter = createSafeEmitter();
  server.on('error', function (err) {
    return emitter.emit('error', err);
  });
  server.on('request', function (req, res) {
    return emitter.emit('request', recastHTTPReq(req), recastHTTPRes(res));
  });

  var recast = _objectSpread({
    address: function address() {
      return server.address();
    },
    listening: function listening() {
      return server.listening;
    },
    listen: function listen(port, host, callback) {
      return server.listen(port, host, callback);
    },
    instanceId: nextInstanceId
  }, emitter);

  origInstanceMap.set(nextInstanceId, server);
  nextInstanceId += 1;
  return recast;
}

module.exports = {
  ws: {
    Server: createWrappedWSServer
  },
  http: {
    createServer: createWrappedHTTPServer
  }
};
