"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wrapInputEventRegister = wrapInputEventRegister;
exports.wrapInputEventUnregister = wrapInputEventUnregister;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var RESTRICTED_SCAN_CODE_RANGES = {
  win32: [[65, 90]],
  darwin: [[4, 29]],
  linux: [[24, 33], [38, 46], [52, 58]]
};
var MAX_SINGLE_CHARACTER_BINDS = 8;
var singleCharacterBinds = new Set();

var isRestrictedSingleCharacterKeybind = function isRestrictedSingleCharacterKeybind(buttons) {
  if (buttons == null || buttons.length !== 1) {
    return false;
  }

  var button = buttons[0];

  if (button.length !== 2) {
    return false;
  }

  var deviceType = button[0];

  if (deviceType !== 0) {
    return false;
  }

  var scanCode = button[1];

  if (buttons.length === 1 && buttons[0].length === 2) {
    var _deviceType = buttons[0][0];
    var _scanCode = buttons[0][1];

    if (_deviceType === 0) {
      var restrictedRanges = RESTRICTED_SCAN_CODE_RANGES[window.DiscordNative.process.platform];

      var _iterator = _createForOfIteratorHelper(restrictedRanges),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var restrictedRange = _step.value;

          if (_scanCode >= restrictedRange[0] && _scanCode <= restrictedRange[1]) {
            return true;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }

  return false;
};

function wrapInputEventRegister(originalFunction) {
  return function (eventId, buttons, callback, options) {
    singleCharacterBinds["delete"](eventId);

    if (isRestrictedSingleCharacterKeybind(buttons)) {
      if (singleCharacterBinds.size >= MAX_SINGLE_CHARACTER_BINDS) {
        throw new Error('Invalid keybind');
      }

      singleCharacterBinds.add(eventId);
    }

    originalFunction(eventId, buttons, callback, options);
  };
}

function wrapInputEventUnregister(originalFunction) {
  return function (eventId) {
    singleCharacterBinds["delete"](eventId);
    originalFunction(eventId);
  };
}
