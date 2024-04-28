/*
    Copyright (C) 2017 Kai Uwe Broulik <kde@privat.broulik.de>

    This program is free software; you can redistribute it and/or
    modify it under the terms of the GNU General Public License as
    published by the Free Software Foundation; either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

function sendEnvironment() {
    var browser = "";

    var ua = navigator.userAgent;
    // Try to match the most derived first
    if (ua.match(/vivaldi/i)) {
        browser = "vivaldi";
    } else if(ua.match(/OPR/i)) {
        browser = "opera";
    } else if(ua.match(/chrome/i)) {
        browser = "chromium";
        // Apparently there is no better way to distinuish chromium from chrome
        for (i in window.navigator.plugins) {
            if (window.navigator.plugins[i].name === "Chrome PDF Viewer") {
                browser = "chrome";
                break;
            }
        }
    } else if(ua.match(/firefox/i)) {
        browser = "firefox";
    }

    sendPortMessage("settings", "setEnvironment", {browserName: browser});
}

function sendSettings() {
    SettingsUtils.get().then((items) => {
        sendPortMessage("settings", "changed", items);
    });
}

// activates giveb tab and raises its window, used by tabs runner and mpris Raise command
function raiseTab(tabId) {
// first activate the tab, this means it's current in its window
    chrome.tabs.update(tabId, {active: true}, function (tab) {

        if (chrome.runtime.lastError || !tab) { // this "lastError" stuff feels so archaic
            // failed to update
            return;
        }

        // then raise the tab's window too
        chrome.windows.update(tab.windowId, {focused: true});
    });
}

// Debug
// ------------------------------------------------------------------------
//

function printDebug(payload, fn) {
    let hostLabel = "Host";
    if (payload.category && payload.category !== "default") {
        hostLabel += " [" + payload.category + "]";
    }

    const hostLabelColor = "#3daee9"; // Breeze highlight color

    if (payload.line && payload.file) {
        const fileName = payload.file.split("/").pop();
        fn("%c%s: %c%s %c[%s:%i]",
           "color: " + hostLabelColor,
           hostLabel,
           "", // reset CSS
           payload.message,
           "color: #999",
           fileName,
           payload.line);
    } else {
        fn("%c%s: %c%s",
           "color: " + hostLabelColor,
           hostLabel,
           "", // reset CSS
           payload.message);
    }
}

addCallback("debug", "debug", function(payload) {
    if (payload.severity === "info") {
        printDebug(payload, console.info);
    } else {
        printDebug(payload, console.log);
    }
}
)

addCallback("debug", "warning", function(payload) {
    if (payload.severity === "critical" || payload.severity === "fatal") {
        printDebug(payload, console.error);
    } else {
        printDebug(payload, console.warn);
    }
}
)

// System
// ------------------------------------------------------------------------
//

// When connecting to native host fails (e.g. not installed), we immediately get a disconnect
// event immediately afterwards. Also avoid infinite restart loop then.
var receivedMessageOnce = false;

var portStatus = "";
var portLastErrorMessage = undefined;

function updateBrowserAction() {
    if (portStatus === "UNSUPPORTED_OS" || portStatus === "STARTUP_FAILED") {
        chrome.browserAction.setIcon({
            path: {
                "16": "icons/plasma-disabled-16.png",
                "32": "icons/plasma-disabled-32.png",
                "48": "icons/plasma-disabled-48.png",
                "128": "icons/plasma-disabled-128.png"
            }
        });
    }

    if (portLastErrorMessage && receivedMessageOnce) {
        chrome.browserAction.setBadgeText({ text: "!" });
        chrome.browserAction.setBadgeBackgroundColor({ color: "#da4453" }); // breeze "negative" color
    } else {
        chrome.browserAction.setBadgeText({ text: "" });
    }
}
updateBrowserAction();

// Check for supported platform to avoid loading it on e.g. Windows and then failing
// when the extension got synced to another device and then failing
chrome.runtime.getPlatformInfo(function (info) {
    if (!SUPPORTED_PLATFORMS.includes(info.os)) {
        console.log("This extension is not supported on", info.os);
        portStatus = "UNSUPPORTED_OS";
        updateBrowserAction();
        return;
    }

    connectHost();
});

function connectHost() {
    port = chrome.runtime.connectNative("org.kde.plasma.browser_integration");

    port.onMessage.addListener(function (message) {
        var subsystem = message.subsystem;
        var action = message.action;

        let isReply = message.hasOwnProperty("replyToSerial");
        let replyToSerial = message.replyToSerial;

        if (!isReply && (!subsystem || !action)) {
            return;
        }

        if (portStatus) {
            portStatus = "";
            updateBrowserAction();
        }

        receivedMessageOnce = true;

        if (isReply) {
            let replyResolver = pendingMessageReplyResolvers[replyToSerial];
            if (replyResolver) {
                replyResolver(message.payload);
                delete pendingMessageReplyResolvers[replyToSerial];
            } else {
                console.warn("There is no reply resolver for message with serial", replyToSerial);
            }
            return;
        }

        if (callbacks[subsystem] && callbacks[subsystem][action]) {
            callbacks[subsystem][action](message.payload, action);
        } else {
            console.warn("Don't know what to do with host message", subsystem, action);
        }
    });

    port.onDisconnect.addListener(function(port) {
        var error = chrome.runtime.lastError;
        // Firefox passes in the port which may then have an error set
        if (port && port.error) {
            error = port.error;
        }

        console.warn("Host disconnected", error && error.message);

        // Remove all kde connect menu entries since they won't work without a host
        try {
            Object.keys(kdeConnectDevices).forEach((deviceId) => {
                callbacks.kdeconnect.deviceRemoved({
                    id: deviceId
                });
            });
        } catch (e) {
            console.warn("Failed to cleanup after port disconnect", e);
        }

        portLastErrorMessage = error && error.message || "UNKNOWN";
        if (receivedMessageOnce) {
            portStatus = "DISCONNECTED";

            console.log("Auto-restarting it");
            connectHost();
        } else {
            portStatus = "STARTUP_FAILED";

            console.warn("Not auto-restarting host as we haven't received any message from it before. Check that it's working/installed correctly");
        }
        updateBrowserAction();
    });

    sendEnvironment();
    sendSettings();
    sendDownloads();

    updatePurposeMenu();
}

SettingsUtils.onChanged().addListener(() => {
    sendSettings();
});

addRuntimeCallback("settings", "openKRunnerSettings", function () {
    sendPortMessage("settings", "openKRunnerSettings");
});

addRuntimeCallback("settings", "getSubsystemStatus", (message, sender, action) => {
    return sendPortMessageWithReply("settings", "getSubsystemStatus");
});

addRuntimeCallback("settings", "getVersion", () => {
    return sendPortMessageWithReply("settings", "getVersion");
});

addRuntimeCallback("browserAction", "getStatus", (message) => {
    let info = {
        portStatus,
        portLastErrorMessage
    };

    return Promise.resolve(info);
});

addRuntimeCallback("browserAction", "ready", () => {

    // HACK there's no way to tell whether the browser action popup got closed
    // None of onunload, onbeforeunload, onvisibilitychanged are fired.
    // Instead, we create a port once the browser action is ready and then
    // listen for the port being disconnected.

    let browserActionPort = chrome.runtime.connect({
        name: "browserActionPort"
    });
    browserActionPort.onDisconnect.addListener((port) => {
        if (port.name !== "browserActionPort") {
            return;
        }

        // disabling the browser action immediately when opening it
        // causes opening to fail on Firefox, so clear the error only when it's being closed.
        // Only clear error when it was a transient error, not a startup failure
        if (receivedMessageOnce) {
            portLastErrorMessage = "";
            updateBrowserAction();
        }
    });
});
