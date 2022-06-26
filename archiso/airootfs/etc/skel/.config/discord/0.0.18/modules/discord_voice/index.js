const VoiceEngine = require('./discord_voice.node');
const ChildProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const process = require('process');
const path = require('path');
const semver = require('semver');
const yargs = require('yargs');

const isElectronRenderer =
  typeof window !== 'undefined' && window != null && window.DiscordNative && window.DiscordNative.isRenderer;

const appSettings = isElectronRenderer ? window.DiscordNative.settings : global.appSettings;
const features = isElectronRenderer ? window.DiscordNative.features : global.features;
const mainArgv = isElectronRenderer ? window.DiscordNative.processUtils.getMainArgvSync() : [];
let dataDirectory;

try {
  if (process.env.DISCORD_TEST && process.env.DISCORD_USER_DATA_DIR) {
    // The smoketest's need to be able to:
    //   1) store multiple running instances data separately,
    //   2) have it in a known location so it can be used as a build artifact.
    dataDirectory = path.join(process.env.DISCORD_USER_DATA_DIR, 'discord_voice');
  } else {
    dataDirectory =
      isElectronRenderer && window.DiscordNative.fileManager.getModuleDataPathSync
        ? path.join(window.DiscordNative.fileManager.getModuleDataPathSync(), 'discord_voice')
        : null;
  }
} catch (e) {
  console.error('Failed to get data directory: ', e);
}

const releaseChannel = isElectronRenderer ? window.DiscordNative.app.getReleaseChannel() : '';
const useLegacyAudioDevice = appSettings ? appSettings.getSync('useLegacyAudioDevice') : false;
const audioSubsystemSelected = appSettings ? appSettings.getSync('audioSubsystem') : 'standard';
const audioSubsystem = useLegacyAudioDevice || audioSubsystemSelected;
const debugLogging = appSettings ? appSettings.getSync('debugLogging', true) : true;

const argv = yargs(mainArgv.slice(1))
  .describe('log-level', 'Logging level.')
  .default('log-level', -1)
  .help('h')
  .alias('h', 'help')
  .describe('use-fake-video-capture', 'Use fake video capture device.')
  .describe('use-file-for-fake-video-capture', 'Use local file for fake video capture.')
  .describe('use-fake-audio-capture', 'Use fake audio capture device.')
  .describe('use-file-for-fake-audio-capture', 'Use local file for fake audio capture.')
  .exitProcess(false).argv;
const logLevel = argv['log-level'] == -1 ? (debugLogging ? 2 : -1) : argv['log-level'];
const useFakeVideoCapture = argv['use-fake-video-capture'];
const useFileForFakeVideoCapture = argv['use-file-for-fake-video-capture'];
const useFakeAudioCapture = argv['use-fake-audio-capture'];
const useFileForFakeAudioCapture = argv['use-file-for-fake-audio-capture'];

if (dataDirectory != null) {
  try {
    fs.mkdirSync(dataDirectory, {recursive: true});
  } catch (e) {
    console.warn("Couldn't create voice data directory ", dataDirectory, ':', e);
  }
}

if (debugLogging && console.discordVoiceHooked == null) {
  console.discordVoiceHooked = true;

  for (const logFn of ['trace', 'debug', 'info', 'warn', 'error', 'log']) {
    const originalLogFn = console[logFn];

    if (originalLogFn != null) {
      console[logFn] = function () {
        originalLogFn.apply(this, arguments);

        try {
          VoiceEngine.consoleLog(
            logFn,
            JSON.stringify(Array.from(arguments).map((v) => (v != null ? v.toString() : v)))
          );
        } catch (e) {
          // Drop errors from toString()/stringify.
        }
      };
    }
  }
}

features.declareSupported('voice_panning');
features.declareSupported('voice_multiple_connections');
features.declareSupported('media_devices');
features.declareSupported('media_video');
features.declareSupported('debug_logging');
features.declareSupported('set_audio_device_by_id');
features.declareSupported('set_video_device_by_id');
features.declareSupported('loopback');
features.declareSupported('experiment_config');
features.declareSupported('remote_locus_network_control');
features.declareSupported('connection_replay');
features.declareSupported('simulcast');
features.declareSupported('simulcast_bugfix');
features.declareSupported('direct_video');
features.declareSupported('electron_video');
features.declareSupported('fixed_keyframe_interval');

if (process.platform === 'win32' || process.platform === 'darwin') {
  features.declareSupported('soundshare');
}

if (process.platform === 'win32' || (process.platform === 'darwin' && semver.gte(os.release(), '16.0.0'))) {
  features.declareSupported('mediapipe');
  features.declareSupported('mediapipe_animated');
}

if (process.platform === 'win32') {
  features.declareSupported('voice_legacy_subsystem');
  features.declareSupported('wumpus_video');
  features.declareSupported('hybrid_video');
  features.declareSupported('elevated_hook');
  features.declareSupported('soundshare_loopback');
  features.declareSupported('screen_previews');
  features.declareSupported('window_previews');
  features.declareSupported('audio_debug_state');
  features.declareSupported('video_effects');
  features.declareSupported('voice_experimental_subsystem');
  // NOTE(jvass): currently there's no experimental encoders! Add this back if you
  // add one and want to re-enable the UI for them.
  // features.declareSupported('experimental_encoders');
}

function bindConnectionInstance(instance) {
  return {
    destroy: () => instance.destroy(),

    setTransportOptions: (options) => instance.setTransportOptions(options),
    setSelfMute: (mute) => instance.setSelfMute(mute),
    setSelfDeafen: (deaf) => instance.setSelfDeafen(deaf),

    mergeUsers: (users) => instance.mergeUsers(users),
    destroyUser: (userId) => instance.destroyUser(userId),

    setLocalVolume: (userId, volume) => instance.setLocalVolume(userId, volume),
    setLocalMute: (userId, mute) => instance.setLocalMute(userId, mute),
    setLocalPan: (userId, left, right) => instance.setLocalPan(userId, left, right),
    setDisableLocalVideo: (userId, disabled) => instance.setDisableLocalVideo(userId, disabled),

    setMinimumOutputDelay: (delay) => instance.setMinimumOutputDelay(delay),
    getEncryptionModes: (callback) => instance.getEncryptionModes(callback),
    configureConnectionRetries: (baseDelay, maxDelay, maxAttempts) =>
      instance.configureConnectionRetries(baseDelay, maxDelay, maxAttempts),
    setOnSpeakingCallback: (callback) => instance.setOnSpeakingCallback(callback),
    setOnSpeakingWhileMutedCallback: (callback) => instance.setOnSpeakingWhileMutedCallback(callback),
    setPingInterval: (interval) => instance.setPingInterval(interval),
    setPingCallback: (callback) => instance.setPingCallback(callback),
    setPingTimeoutCallback: (callback) => instance.setPingTimeoutCallback(callback),
    setRemoteUserSpeakingStatus: (userId, speaking) => instance.setRemoteUserSpeakingStatus(userId, speaking),
    setRemoteUserCanHavePriority: (userId, canHavePriority) =>
      instance.setRemoteUserCanHavePriority(userId, canHavePriority),

    setOnVideoCallback: (callback) => instance.setOnVideoCallback(callback),
    setVideoBroadcast: (broadcasting) => instance.setVideoBroadcast(broadcasting),
    setDesktopSource: (id, videoHook, type) => instance.setDesktopSource(id, videoHook, type),
    setDesktopSourceWithOptions: (options) => instance.setDesktopSourceWithOptions(options),
    clearDesktopSource: () => instance.clearDesktopSource(),
    setDesktopSourceStatusCallback: (callback) => instance.setDesktopSourceStatusCallback(callback),
    setOnDesktopSourceEnded: (callback) => instance.setOnDesktopSourceEnded(callback),
    setOnSoundshare: (callback) => instance.setOnSoundshare(callback),
    setOnSoundshareEnded: (callback) => instance.setOnSoundshareEnded(callback),
    setOnSoundshareFailed: (callback) => instance.setOnSoundshareFailed(callback),
    setPTTActive: (active, priority) => instance.setPTTActive(active, priority),
    getStats: (callback) => instance.getStats(callback),
    getFilteredStats: (filter, callback) => instance.getFilteredStats(filter, callback),
    startReplay: () => instance.startReplay(),
    startSamplesPlayback: (options, channels, callback) => instance.startSamplesPlayback(options, channels, callback),
    stopSamplesPlayback: () => instance.stopSamplesPlayback(),
  };
}

VoiceEngine.createTransport = VoiceEngine._createTransport;

if (isElectronRenderer) {
  VoiceEngine.setImageDataAllocator((width, height) => new window.ImageData(width, height));
}

VoiceEngine.createVoiceConnectionWithOptions = function (userId, connectionOptions, onConnectCallback) {
  let instance = new VoiceEngine.VoiceConnection(userId, connectionOptions, onConnectCallback);
  return bindConnectionInstance(instance);
};
VoiceEngine.createOwnStreamConnectionWithOptions = VoiceEngine.createVoiceConnectionWithOptions;

// TODO(dyc): |audioEngineId| is vestigial and does not actually get used.
// "default" was (we deleted audio engine IDs with the removal of android's
// separate gameAudio engine) hardcoded within nativelib. update the API to
// reflect this.
VoiceEngine.createReplayConnection = function (audioEngineId, callback, replayLog) {
  if (replayLog == null) {
    return null;
  }

  return bindConnectionInstance(new VoiceEngine.VoiceReplayConnection(replayLog, audioEngineId, callback));
};

VoiceEngine.setAudioSubsystem = function (subsystem) {
  if (appSettings == null) {
    console.warn('Unable to access app settings.');
    return;
  }

  // TODO: With experiment controlling ADM selection, this may be incorrect since
  // audioSubsystem is read from settings (or default if does not exists)
  // and not the actual ADM used.
  if (subsystem === audioSubsystem) {
    return;
  }

  appSettings.set('audioSubsystem', subsystem);
  appSettings.set('useLegacyAudioDevice', false);

  if (isElectronRenderer) {
    window.DiscordNative.app.relaunch();
  }
};

VoiceEngine.setDebugLogging = function (enable) {
  if (appSettings == null) {
    console.warn('Unable to access app settings.');
    return;
  }

  if (debugLogging === enable) {
    return;
  }

  appSettings.set('debugLogging', enable);

  if (isElectronRenderer) {
    window.DiscordNative.app.relaunch();
  }
};

VoiceEngine.getDebugLogging = function () {
  return debugLogging;
};

const videoStreams = {};
const directVideoStreams = {};

const ensureCanvasContext = function (sinkId) {
  let canvas = document.getElementById(sinkId);
  if (canvas == null) {
    for (const popout of window.popouts.values()) {
      const element = popout.document != null && popout.document.getElementById(sinkId);
      if (element != null) {
        canvas = element;
        break;
      }
    }

    if (canvas == null) {
      return null;
    }
  }

  const context = canvas.getContext('2d');
  if (context == null) {
    console.log(`Failed to initialize context for sinkId ${sinkId}`);
    return null;
  }

  return context;
};

let activeSinksChangeCallback;
VoiceEngine.setActiveSinksChangeCallback = function (callback) {
  activeSinksChangeCallback = callback;
};

function notifyActiveSinksChange(streamId) {
  if (activeSinksChangeCallback == null) {
    return;
  }
  const sinks = videoStreams[streamId];
  const hasVideoStreamSink = sinks != null && sinks.size > 0;
  const hasDirectVideoStreamSink = directVideoStreams[streamId] != null;

  activeSinksChangeCallback(streamId, hasVideoStreamSink || hasDirectVideoStreamSink);
}

// [adill] NB: with context isolation it has become extremely costly (both memory & performance) to provide the image
// data directly to clients at any reasonably fast interval so we've replaced setVideoOutputSink with a direct canvas
// renderer via addVideoOutputSink
const setVideoOutputSink = VoiceEngine.setVideoOutputSink;
const clearVideoOutputSink = (streamId) => {
  // [adill] NB: if you don't pass a frame callback setVideoOutputSink clears the sink
  setVideoOutputSink(streamId);
};
const signalVideoOutputSinkReady = VoiceEngine.signalVideoOutputSinkReady;
delete VoiceEngine.setVideoOutputSink;
delete VoiceEngine.signalVideoOutputSinkReady;

function addVideoOutputSinkInternal(sinkId, streamId, frameCallback) {
  let sinks = videoStreams[streamId];
  if (sinks == null) {
    sinks = videoStreams[streamId] = new Map();
  }

  // notifyActiveSinksChange relies on videoStreams having the correct state
  const needsToSubscribeToFrames = sinks.size === 0;
  sinks.set(sinkId, frameCallback);

  if (needsToSubscribeToFrames) {
    console.log(`Subscribing to frames for streamId ${streamId}`);
    const onFrame = (imageData) => {
      const sinks = videoStreams[streamId];
      if (sinks != null) {
        for (const callback of sinks.values()) {
          if (callback != null) {
            callback(imageData);
          }
        }
      }
      signalVideoOutputSinkReady(streamId);
    };
    setVideoOutputSink(streamId, onFrame, true);
    notifyActiveSinksChange(streamId);
  }
}

VoiceEngine.addVideoOutputSink = function (sinkId, streamId, frameCallback) {
  let canvasContext = null;
  addVideoOutputSinkInternal(sinkId, streamId, (imageData) => {
    if (canvasContext == null) {
      canvasContext = ensureCanvasContext(sinkId);
      if (canvasContext == null) {
        return;
      }
    }
    if (frameCallback != null) {
      frameCallback(imageData.width, imageData.height);
    }
    // [adill] NB: Electron 9+ on macOS would show massive leaks in the the GPU helper process when a non-Discord
    // window completely occludes the Discord window. Adding this tiny readback ameliorates the issue. We tried WebGL
    // rendering which did not exhibit the issue, however, the context limit of 16 was too small to be a real
    // alternative.
    const leak = canvasContext.getImageData(0, 0, 1, 1);
    canvasContext.putImageData(imageData, 0, 0);
  });
};

VoiceEngine.removeVideoOutputSink = function (sinkId, streamId) {
  const sinks = videoStreams[streamId];
  if (sinks != null) {
    sinks.delete(sinkId);
    if (sinks.size === 0) {
      delete videoStreams[streamId];
      console.log(`Unsubscribing from frames for streamId ${streamId}`);
      clearVideoOutputSink(streamId);
      notifyActiveSinksChange(streamId);
    }
  }
};

// We wrap the direct video calls so we can keep track of all active
// video output sinks
const addDirectVideoOutputSink_ = VoiceEngine.addDirectVideoOutputSink;
const removeDirectVideoOutputSink_ = VoiceEngine.removeDirectVideoOutputSink;
VoiceEngine.addDirectVideoOutputSink = function (streamId) {
  console.log(`Subscribing to direct frames for streamId ${streamId}`);
  addDirectVideoOutputSink_(streamId);
  directVideoStreams[streamId] = true;
  notifyActiveSinksChange(streamId);
};
VoiceEngine.removeDirectVideoOutputSink = function (streamId) {
  console.log(`Unsubscribing from direct frames for streamId ${streamId}`);
  removeDirectVideoOutputSink_(streamId);
  delete directVideoStreams[streamId];
  notifyActiveSinksChange(streamId);
};

let sinkId = 0;
VoiceEngine.getNextVideoOutputFrame = function (streamId) {
  const nextVideoFrameSinkId = `getNextVideoFrame_${++sinkId}`;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      VoiceEngine.removeVideoOutputSink(nextVideoFrameSinkId, streamId);
      reject(new Error('getNextVideoOutputFrame timeout'));
    }, 5000);

    addVideoOutputSinkInternal(nextVideoFrameSinkId, streamId, (imageData) => {
      VoiceEngine.removeVideoOutputSink(nextVideoFrameSinkId, streamId);
      resolve({
        width: imageData.width,
        height: imageData.height,
        data: new Uint8ClampedArray(imageData.data.buffer),
      });
    });
  });
};

console.log(`Initializing voice engine with audio subsystem: ${audioSubsystem}`);
VoiceEngine.platform = process.platform;
VoiceEngine.initialize({
  audioSubsystem,
  logLevel,
  dataDirectory,
  useFakeVideoCapture,
  useFileForFakeVideoCapture,
  useFakeAudioCapture,
  useFileForFakeAudioCapture,
});

module.exports = VoiceEngine;
