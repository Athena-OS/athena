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

var port;

var callbacks = {}; // TODO rename to "portCallbacks"?
var runtimeCallbacks = {};

let currentMessageSerial = 0;
let pendingMessageReplyResolvers = {};

// Callback is called with following arguments (in that order);
// - The actual message data/payload
// - The name of the action triggered
function addCallback(subsystem, action, callback) // TODO rename to "addPortCallbacks"?
{
    if (Array.isArray(action)) {
        action.forEach(function(item) {
            addCallback(subsystem, item, callback);
        });
        return;
    }

    if (!callbacks[subsystem]) {
        callbacks[subsystem] = {};
    }
    callbacks[subsystem][action] = callback;
}

function sendPortMessage(subsystem, event, payload)
{
    // why do we put stuff on root level here but otherwise have a "payload"? :(
    var message = payload || {}
    message.subsystem = subsystem;
    message.event = event;

    if (port) {
        port.postMessage(message);
    }
}

function sendPortMessageWithReply(subsystem, event, payload)
{
    return new Promise((resolve, reject) => {
        if (!port) {
            return reject("UNSUPPORTED_OS");
        }

        let message = payload || {};
        message.subsystem = subsystem;
        message.event = event;
        ++currentMessageSerial;
        if (currentMessageSerial >= Math.pow(2, 31) - 1) { // INT_MAX
            currentMessageSerial = 0;
        }
        message.serial = currentMessageSerial;

        port.postMessage(message);

        pendingMessageReplyResolvers[message.serial] = resolve;
    });
}

// Callback is called with following arguments (in that order);
// - The actual message data/payload
// - Information about the sender of the message (including tab and frameId)
// - The name of the action triggered
// Return a Promise from the callback if you wish to send a reply to the sender
function addRuntimeCallback(subsystem, action, callback)
{
    if (action.constructor === Array) {
        action.forEach(function(item) {
            addRuntimeCallback(subsystem, item, callback);
        });
        return;
    }

    if (!runtimeCallbacks[subsystem]) {
        runtimeCallbacks[subsystem] = {};
    }
    runtimeCallbacks[subsystem][action] = callback;
}

// returns an Object which only contains values for keys in allowedKeys
function filterObject(obj, allowedKeys) {
    var newObj = {}

    // I bet this can be done in a more efficient way
    for (key in obj) {
        if (obj.hasOwnProperty(key) && allowedKeys.indexOf(key) > -1) {
            newObj[key] = obj[key];
        }
    }

    return newObj;
}

// filters objects within an array so they only contain values for keys in allowedKeys
function filterArrayObjects(arr, allowedKeys) {
    return arr.map(function (item) {
        return filterObject(item, allowedKeys);
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // TODO check sender for privilege

    var subsystem = message.subsystem;
    var action = message.action;

    if (!subsystem || !action) {
        return false;
    }

    if (runtimeCallbacks[subsystem] && runtimeCallbacks[subsystem][action]) {
        let result = runtimeCallbacks[subsystem][action](message.payload, sender, action);

        // Not a promise
        if (typeof result !== "object" || typeof result.then !== "function") {
            return false;
        }

        result.then((response) => {
            sendResponse(response);
        }, (err) => {
            sendResponse({
                rejected: true,
                message: err
            });
        });

        return true;
    }

    console.warn("Don't know what to do with runtime message", subsystem, action);
    return false;
});
