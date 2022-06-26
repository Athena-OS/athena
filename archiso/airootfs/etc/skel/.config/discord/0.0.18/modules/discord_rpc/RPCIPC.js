"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Provides native APIs for RPCIPC transport.
//
// Because we're passing through some native APIs, e.g. net, we recast its API
// to something more browser-safe, so don't assume the APIs are 1:1 or behave
// exactly like the native APIs.
var process = require('process');

var path = require('path');

var fs = require('fs');

var net = require('net');

var _require = require('./safeEmitter'),
    createSafeEmitter = _require.createSafeEmitter;

var IS_WINDOWS = process.platform === 'win32';
var SOCKET_PATH;

if (IS_WINDOWS) {
  SOCKET_PATH = '\\\\?\\pipe\\discord-ipc';
} else {
  var temp = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || process.env.TEMP || '/tmp';
  SOCKET_PATH = path.join(temp, 'discord-ipc');
} // converts Node.js Buffer to ArrayBuffer


function toArrayBuffer(buffer) {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

function getAvailableSocket(testSocketPathFn) {
  var tries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var lastErr = arguments.length > 2 ? arguments[2] : undefined;

  if (tries > 9) {
    return Promise.reject(new Error("Max tries exceeded, last error: ".concat(lastErr)));
  }

  var socketPath = "".concat(SOCKET_PATH, "-").concat(tries);
  var socket = recastNetSocket(net.createConnection(socketPath));
  return testSocketPathFn(socket).then(function () {
    if (!IS_WINDOWS) {
      try {
        fs.unlinkSync(socketPath);
      } catch (err) {}
    }

    return socketPath;
  }, function (err) {
    return getAvailableSocket(testSocketPathFn, tries + 1, err);
  });
}

function recastNetSocket(socket) {
  var didHandshake = false;
  var emitter = createSafeEmitter();
  socket.on('error', function (err) {
    return emitter.emit('error', err);
  });
  socket.on('close', function () {
    return emitter.emit('close');
  });
  socket.on('readable', function () {
    return emitter.emit('readable');
  });
  socket.on('pong', function () {
    return emitter.emit('pong');
  });
  socket.on('request', function (data) {
    return emitter.emit('request', data);
  });
  socket.once('handshake', function (data) {
    return emitter.emit('handshake', data);
  });
  return _objectSpread({
    setHandshakeComplete: function setHandshakeComplete(complete) {
      return didHandshake = complete;
    },
    getHandshakeComplete: function getHandshakeComplete() {
      return didHandshake;
    },
    pause: function pause() {
      return socket.pause();
    },
    destroy: function destroy() {
      return socket.destroy();
    },
    write: function write(buffer) {
      return socket.write(Buffer.from(buffer));
    },
    end: function end(buffer) {
      return socket.end(Buffer.from(buffer));
    },
    read: function read(len) {
      var buf = socket.read(len);
      if (!buf) return buf;
      return toArrayBuffer(buf);
    }
  }, emitter);
}

function recastNetServer(server) {
  var emitter = createSafeEmitter();
  server.on('error', function (err) {
    return emitter.emit('error', err);
  });
  return _objectSpread({
    listening: function listening() {
      return !!server.listening;
    },
    address: function address() {
      return server.address();
    },
    listen: function listen(socketPath, onListening) {
      server.listen(socketPath, function () {
        onListening();
      });
    }
  }, emitter);
}

var proxiedNet = {
  createServer: function createServer(onConnection) {
    var server = net.createServer(function (socket) {
      onConnection(recastNetSocket(socket));
    });
    return recastNetServer(server);
  }
};
module.exports = {
  getAvailableSocket: getAvailableSocket,
  net: proxiedNet
};
