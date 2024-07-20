/* globals badger:false */

import utils from "./utils.js";

let tabs = {};

// Get all existing tabs
chrome.tabs.query({}, function(results) {
  results.forEach(function(tab) {
    tabs[tab.id] = tab.incognito;
  });
});

// Create tab event listeners
function onCreatedListener(tab) {
  tabs[tab.id] = tab.incognito;
}

function onRemovedListener(tab_id) {
  delete tabs[tab_id];
}

// Subscribe to tab events
function startListeners() {
  chrome.tabs.onCreated.addListener(onCreatedListener);
  chrome.tabs.onRemoved.addListener(onRemovedListener);
}

function learningEnabled(tab_id) {
  if (badger.getSettings().getItem("learnInIncognito")) {
    // treat all pages as if they're not incognito
    return true;
  }
  // if we don't have incognito data for whatever reason,
  // default to disabled
  if (!utils.hasOwn(tabs, tab_id)) {
    return false;
  }
  // else, do not learn in incognito tabs
  return !tabs[tab_id];
}

export default {
  learningEnabled,
  startListeners,
};
