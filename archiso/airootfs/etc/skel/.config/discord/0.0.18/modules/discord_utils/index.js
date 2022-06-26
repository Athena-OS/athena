const execa = require('execa');
const fs = require('fs');
const path = require('path');
const superagent = require('superagent');
const {
  inputCaptureSetWatcher,
  inputCaptureRegisterElement,
} = require('./input_capture');
const {
  wrapInputEventRegister,
  wrapInputEventUnregister,
} = require('./input_event');

module.exports = require('./discord_utils.node');
module.exports.clearCandidateGamesCallback = module.exports.setCandidateGamesCallback;

inputCaptureSetWatcher(module.exports.inputWatchAll);
delete module.exports.inputWatchAll;
module.exports.inputCaptureRegisterElement = inputCaptureRegisterElement;

module.exports.inputEventRegister = wrapInputEventRegister(module.exports.inputEventRegister);
module.exports.inputEventUnregister = wrapInputEventUnregister(module.exports.inputEventUnregister);

const isElectronRenderer =
  typeof window !== 'undefined' && window != null && window.DiscordNative && window.DiscordNative.isRenderer;

let dataDirectory;
try {
  dataDirectory =
    isElectronRenderer && window.DiscordNative.fileManager.getModuleDataPathSync
      ? path.join(window.DiscordNative.fileManager.getModuleDataPathSync(), 'discord_utils')
      : null;
} catch (e) {
  console.error('Failed to get data directory: ', e);
}

if (dataDirectory != null) {
  try {
    fs.mkdirSync(dataDirectory, {recursive: true});
  } catch (e) {
    console.warn("Couldn't create utils data directory ", dataDirectory, ':', e);
  }
}

function parseNvidiaSmiOutput(result) {
  if (!result || !result.stdout) {
    return {error: 'nvidia-smi produced no output'};
  }

  const match = result.stdout.match(/Driver Version: (\d+)\.(\d+)/);

  if (match.length === 3) {
    return {major: parseInt(match[1], 10), minor: parseInt(match[2], 10)};
  } else {
    return {error: 'failed to parse nvidia-smi output'};
  }
}

module.exports.getGPUDriverVersions = async () => {
  if (process.platform !== 'win32') {
    return {};
  }

  const result = {};
  const nvidiaSmiPath = `${process.env['ProgramW6432']}/NVIDIA Corporation/NVSMI/nvidia-smi.exe`;

  try {
    result.nvidia = parseNvidiaSmiOutput(await execa(nvidiaSmiPath, []));
  } catch (e) {
    result.nvidia = {error: e.toString()};
  }

  return result;
};

module.exports.submitLiveCrashReport = async (channel, sentryMetadata) => {
  const path = module.exports._generateLiveMinidump(dataDirectory);

  if (!path) {
    return null;
  }

  await superagent
    .post('https://sentry.io/api/146342/minidump/?sentry_key=f11e8c3e62cb46b5a006c339b2086ba3')
    .attach('upload_file_minidump', path)
    .field('channel', channel)
    .field('sentry', JSON.stringify(sentryMetadata));
};
