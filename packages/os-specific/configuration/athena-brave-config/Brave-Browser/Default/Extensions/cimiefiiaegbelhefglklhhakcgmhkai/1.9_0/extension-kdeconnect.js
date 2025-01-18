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

var kdeConnectMenuIdPrefix = "kdeconnect_page_";
var kdeConnectDevices = {};

chrome.contextMenus.onClicked.addListener(function (info) {
    if (!info.menuItemId.startsWith(kdeConnectMenuIdPrefix)) {
        return;
    }

    const deviceId = info.menuItemId.substr(info.menuItemId.indexOf("@") + 1);

    var url = info.linkUrl || info.srcUrl || info.pageUrl;
    console.log("Send url", url, "to kdeconnect device", deviceId);
    if (!url) {
        return;
    }

    port.postMessage({
        subsystem: "kdeconnect",
        event: "shareUrl",
        url: url,
        deviceId: deviceId
    });
});

let knownKdeConnectMenuEntryIds = new Set();
const createKdeConnectMenuEntry = (args) => {
    const id = kdeConnectMenuIdPrefix + args.key + "@" + args.deviceId;

    let props = {
        id,
        contexts: args.contexts,
        title: args.title
    };

    if (IS_FIREFOX && args.iconName) {
        props.icons = {
            "16": "icons/" + args.iconName + ".svg"
        };
    }

    if (args.args) {
        Object.keys(args.args).forEach((key) => {
            props[key] = args.args[key];
        });
    }

    chrome.contextMenus.create(props);
    knownKdeConnectMenuEntryIds.add(id);
};

addCallback("kdeconnect", "deviceAdded", function(message) {
    const deviceId = message.id;
    const name = message.name;
    const type = message.type;

    let iconName = "";
    switch (type) {
    case "smartphone":
    case "phone":
        iconName = "smartphone-symbolic";
        break;
    case "tablet":
        iconName = "tablet-symbolic";
        break;
    case "desktop":
    case "tv": // at this size you can't really tell desktop monitor icon from a TV
        iconName = "computer-symbolic";
        break;
    case "laptop":
        iconName = "computer-laptop-symbolic";
        break;
    }

    const httpPatterns = ["http://*/*", "https://*/*"];

    createKdeConnectMenuEntry({
        deviceId,
        iconName,
        key: "open_link",
        contexts: ["link", "image", "audio", "video"],
        title: chrome.i18n.getMessage("kdeconnect_open_device", name),
        args: {
            targetUrlPatterns: httpPatterns
        }
    });

    createKdeConnectMenuEntry({
        deviceId,
        iconName,
        key: "open_page",
        contexts: ["page"],
        title: chrome.i18n.getMessage("kdeconnect_open_device", name),
        args: {
            documentUrlPatterns: httpPatterns
        }
    });

    // Entry on tel: phone links
    createKdeConnectMenuEntry({
        deviceId,
        iconName: "call-start-symbolic",
        key: "call",
        contexts: ["link"],
        title: chrome.i18n.getMessage("kdeconnect_call_device", name),
        args: {
            targetUrlPatterns: [
                "tel:*"
            ]
        }
    });

    try {
        // Entry on a tab in the tab bar (Firefox)
        createKdeConnectMenuEntry({
            deviceId,
            iconName,
            key: "open_tab",
            contexts: ["tab"],
            title: chrome.i18n.getMessage("kdeconnect_open_device", name),
            args: {
                documentUrlPatterns: httpPatterns
            }
        });
    } catch (e) {
        console.warn("Failed to create 'tab' context menu", e);
    }

    kdeConnectDevices[deviceId] = {
        name, type
    };
});

addCallback("kdeconnect", "deviceRemoved", function(message) {
    let deviceId = message.id;

    if (!kdeConnectDevices[deviceId]) {
        return;
    }

    delete kdeConnectDevices[deviceId];

    for (let id of knownKdeConnectMenuEntryIds) {
        chrome.contextMenus.remove(id);
    }
    knownKdeConnectMenuEntryIds.clear();
});
