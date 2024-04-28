/*
    Copyright (C) 2019 Kai Uwe Broulik <kde@privat.broulik.de>

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

const purposeShareMenuId = "purpose_share";
let hasPurposeMenu = false;
let hasPurposeTabMenu = false;

// Stores <notification id, share url> so that when you click the finished
// notification it will open the URL
let purposeNotificationUrls = {};

function purposeShare(data) {
    return new Promise((resolve, reject) => {
        sendPortMessageWithReply("purpose", "share", {data}).then((reply) => {
            if (!reply.success) {
                if (!["BUSY", "CANCELED", "INVALID_ARGUMENT"].includes(reply.errorCode)
                    && reply.errorCode !== 1 /*ERR_USER_CANCELED*/) {
                    chrome.notifications.create(null, {
                        type: "basic",
                        title: chrome.i18n.getMessage("purpose_share_failed_title"),
                        message: chrome.i18n.getMessage("purpose_share_failed_text",
                                                        reply.errorMessage || chrome.i18n.getMessage("general_error_unknown")),
                        iconUrl: "icons/document-share-failed.png"
                    });
                }

                reject();
                return;
            }

            let url = reply.response.url;
            if (url) {
                chrome.notifications.create(null, {
                    type: "basic",
                    title: chrome.i18n.getMessage("purpose_share_finished_title"),
                    message: chrome.i18n.getMessage("purpose_share_finished_text", url),
                    iconUrl: "icons/document-share.png"
                }, (notificationId) => {
                    if (chrome.runtime.lastError) {
                        return;
                    }

                    purposeNotificationUrls[notificationId] = url;
                });
            }

            resolve();
        });
    });
}

function checkPurposeEnabled() {
    return Promise.all([
        sendPortMessageWithReply("settings", "getSubsystemStatus"),
        SettingsUtils.get()
    ]).then((result) => {

        const subsystemStatus = result[0];
        const settings = result[1];

        // HACK Unfortunately I removed the loaded/unloaded signals for plugins
        // so we can't reliably know on settings change whether a module is enabled
        // sending settings is also legacy done without a reply we could wait for.
        // Instead, check whether the module is known and enabled in settings,
        // which should be close enough, since purpose plugin also has no additional
        // dependencies that could make it fail to load.
        return subsystemStatus.hasOwnProperty("purpose")
            && settings.purpose && settings.purpose.enabled;
    });
}

function updatePurposeMenu() {
    checkPurposeEnabled().then((enabled) => {
        let props = {
            id: purposeShareMenuId,
            contexts: ["link", "page", "image", "audio", "video", "selection"],
            title: chrome.i18n.getMessage("purpose_share")
        };

        if (IS_FIREFOX) {
            props.icons = {
                "16": "icons/document-share-symbolic.svg"
            }
        }

        if (enabled && !hasPurposeMenu) {
            chrome.contextMenus.create(props, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    console.warn("Error creating purpose context menu", error.message);
                    return;
                }
                hasPurposeMenu = true;
            });
        } else if (!enabled && hasPurposeMenu) {
            chrome.contextMenus.remove(props.id, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    console.warn("Error removing purpose context menu", error.message);
                    return;
                }
                hasPurposeMenu = false;
            });
        }

        // Entry on a tab in the tab bar (Firefox)
        props.id += "_tab";
        if (IS_FIREFOX && enabled && !hasPurposeTabMenu) {
            props.contexts = ["tab"];
            // TODO restrict patterns also for generic menu (however, needs a split like KDE Connect does).
            props.documentUrlPatterns = ["http://*/*", "https://*/*"];

            chrome.contextMenus.create(props, () => {
                if (!chrome.runtime.lastError) {
                    hasPurposeTabMenu = true;
                }
            });
        } else if (!enabled && hasPurposeTabMenu) {
            chrome.contextMenus.remove(props.id, () => {
                if (!chorme.runtime.lastError) {
                    hasPurposeTabMenu = false;
                }
            });
        }
    });
}

chrome.contextMenus.onClicked.addListener((info) => {
    if (!info.menuItemId.startsWith(purposeShareMenuId)) {
        return;
    }

    let url = info.linkUrl || info.srcUrl || info.pageUrl;
    let selection = info.selectionText;
    if (!url && !selection) {
        return;
    }

    let shareData = {};
    if (selection) {
        shareData.text = selection;
    } else if (url) {
        shareData.url = url;
        if (info.linkText && info.linkText != url) {
            shareData.title = info.linkText;
        }
    }

    // We probably shared the current page, add its title to shareData
    new Promise((resolve, reject) => {
        if (!info.linkUrl && !info.srcUrl && info.pageUrl) {
            let pageUrlWithoutHash = new URL(info.pageUrl);
            // chrome.tabs.query url does not match URL hash.
            pageUrlWithoutHash.hash = "";

            chrome.tabs.query({
                // more correct would probably be currentWindow + activeTab
                url: pageUrlWithoutHash.href
            }, (tabs) => {
                for (let tab of tabs) {
                    if (tab.url === info.pageUrl) {
                        return resolve(tab.title);
                    }
                }
                resolve("");
            });
            return;
        }

        resolve("");
    }).then((title) => {
        if (title) {
            shareData.title = title;
        }

        purposeShare(shareData);
    });
});

SettingsUtils.onChanged().addListener((delta) => {
    if (delta.purpose) {
        updatePurposeMenu();
    }
});

addRuntimeCallback("purpose", "share", (message, sender, action) => {
    return purposeShare(message);
});

chrome.notifications.onClicked.addListener((notificationId) => {
    const url = purposeNotificationUrls[notificationId];
    if (url) {
        chrome.tabs.create({url});
    }
});

chrome.notifications.onClosed.addListener((notificationId) => {
    delete purposeNotificationUrls[notificationId];
});
