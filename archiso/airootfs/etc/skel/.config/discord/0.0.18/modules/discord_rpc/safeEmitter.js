"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSafeEmitter = createSafeEmitter;
exports["default"] = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

// NB: this is a limited functionality version of EventEmitter safe for passing over contextBridge
function createSafeEmitter() {
  var callbackMap = new Map();

  var addListener = function addListener(name, listener, once) {
    var listeners = callbackMap[name];

    if (listeners == null) {
      listeners = callbackMap[name] = new Set();
    }

    if (once) {
      var originalListener = listener;

      listener = function listener() {
        originalListener.apply(void 0, arguments);
        listeners["delete"](originalListener);
      };
    }

    listeners.add(listener);
  };

  var invokeListener = function invokeListener(name) {
    var listeners = callbackMap[name];

    if (listeners == null) {
      return;
    }

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var _iterator = _createForOfIteratorHelper(listeners),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var listener = _step.value;
        listener.apply(void 0, args);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  };

  return {
    on: function on(name, callback) {
      return addListener(name, callback, false);
    },
    once: function once(name, callback) {
      return addListener(name, callback, true);
    },
    emit: function emit(name) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      return invokeListener.apply(void 0, [name].concat(args));
    }
  };
}

var _default = createSafeEmitter;
exports["default"] = _default;
