"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.inputCaptureSetWatcher = inputCaptureSetWatcher;
exports.inputCaptureRegisterElement = inputCaptureRegisterElement;

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var MOUSE_BUTTON_TYPE = 1;
var LEFT_MOUSE_BUTTON_CODE = window.DiscordNative.process.platform === 'win32' ? 0 : 1;
var SEQUENCE_CAPTURE_TIMEOUT = 5000;
var MAX_SEQUENCE_LENGTH = 4;
var inputWatchAll = null;

var InputCapturer = /*#__PURE__*/function () {
  function InputCapturer(callback) {
    _classCallCheck(this, InputCapturer);

    this._timeout = null;
    this._callback = null;
    this._capturedInputSequence = [];
    this._callback = callback;
  }

  _createClass(InputCapturer, [{
    key: "start",
    value: function start() {
      var _this = this;

      if (this.isActive()) {
        return;
      }

      this._timeout = setTimeout(function () {
        return _this.stop();
      }, SEQUENCE_CAPTURE_TIMEOUT);

      InputCapturer._activeCapturers.push(this);

      if (InputCapturer._activeCapturers.length === 1) {
        inputWatchAll(InputCapturer._globalInputHandler);
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      var _this2 = this;

      InputCapturer._activeCapturers = InputCapturer._activeCapturers.filter(function (x) {
        return x !== _this2;
      });

      if (InputCapturer._activeCapturers.length === 0) {
        inputWatchAll(null);
      }

      if (this._timeout != null) {
        clearTimeout(this._timeout);
        this._timeout = null;
      }

      var inputSequence = this._capturedInputSequence.map(function (entry) {
        return [entry[0], entry[1]];
      });

      this._capturedInputSequence = [];

      if (this._callback != null) {
        this._callback(inputSequence);
      }
    }
  }, {
    key: "isActive",
    value: function isActive() {
      return this._timeout != null;
    }
  }, {
    key: "_handleInputEvent",
    value: function _handleInputEvent(type, state, code) {
      if (state === 0) {
        var allEntriesReleased = true;

        var _iterator = _createForOfIteratorHelper(this._capturedInputSequence),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var entry = _step.value;

            if (entry[0] === type && entry[1] === code) {
              entry[2] = false;
            }

            allEntriesReleased = allEntriesReleased && entry[2] === false;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }

        if (this._capturedInputSequence.length > 0 && allEntriesReleased) {
          this.stop();
        }
      } else {
        this._capturedInputSequence.push([type, code, true]);

        if (this._capturedInputSequence.length === MAX_SEQUENCE_LENGTH) {
          this.stop();
        }
      }
    }
  }], [{
    key: "_globalInputHandler",
    value: function _globalInputHandler(type, state, code) {
      if (type === MOUSE_BUTTON_TYPE && code === LEFT_MOUSE_BUTTON_CODE) {
        // ignore left click
        return;
      }

      var _iterator2 = _createForOfIteratorHelper(InputCapturer._activeCapturers),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var capturer = _step2.value;

          capturer._handleInputEvent(type, state, code);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);

  return InputCapturer;
}();

InputCapturer._activeCapturers = [];

function inputCaptureSetWatcher(inputWatcher) {
  inputWatchAll = inputWatcher;
}

function inputCaptureRegisterElement(elementId, callback) {
  if (inputWatchAll == null) {
    throw new Error('Input capturing is missing an input watcher');
  }

  var capturer = new InputCapturer(callback);
  var registerUserInteractionHandler = window.DiscordNative.app.registerUserInteractionHandler;
  var unregisterFunctions = [registerUserInteractionHandler(elementId, 'click', function (_) {
    return capturer.start();
  }), registerUserInteractionHandler(elementId, 'focus', function (_) {
    return capturer.start();
  }), registerUserInteractionHandler(elementId, 'blur', function (_) {
    return capturer.stop();
  })];
  return function () {
    var _iterator3 = _createForOfIteratorHelper(unregisterFunctions),
        _step3;

    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var unregister = _step3.value;
        unregister();
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }

    capturer.stop();
  };
}
