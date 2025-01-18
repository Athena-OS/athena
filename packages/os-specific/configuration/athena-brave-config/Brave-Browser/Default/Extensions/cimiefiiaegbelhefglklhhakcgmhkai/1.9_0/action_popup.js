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

class TabUtils {
    // Gets the currently viewed tab
    static getCurrentTab() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, (tabs) => {
                const error = chrome.runtime.lastError;
                if (error) {
                    return reject(error.message);
                }

                const tab = tabs[0];
                if (!tab) {
                    return reject("NO_TAB");
                }

                resolve(tab);
            });
        });
    }

    // Gets the URLs of the currently viewed tab including all of its iframes
    static getCurrentTabFramesUrls() {
        return new Promise((resolve, reject) => {
            TabUtils.getCurrentTab().then((tab) => {
                chrome.tabs.executeScript({
                    allFrames: true, // so we also catch iframe videos
                    code: `window.location.href`,
                    runAt: "document_start"
                }, (result) => {
                    const error = chrome.runtime.lastError;
                    if (error) {
                        return reject(error.message);
                    }

                    resolve(result);
                });
            });
        });
    }
};

class MPrisBlocker {
    getAllowed() {
        return new Promise((resolve, reject) => {
            Promise.all([
                SettingsUtils.get(),
                TabUtils.getCurrentTabFramesUrls()
            ]).then((result) => {

                const settings = result[0];
                const currentUrls = result[1];

                const mprisSettings = settings.mpris;
                if (!mprisSettings.enabled) {
                    return reject("MPRIS_DISABLED");
                }

                if (!currentUrls) { // can this happen?
                    return reject("NO_URLS");
                }

                const origins = currentUrls.map((url) => {
                    try {
                        return new URL(url).origin;
                    } catch (e) {
                        console.warn("Invalid url", url);
                        return "";
                    }
                }).filter((origin) => {
                    return !!origin;
                });

                if (origins.length === 0) {
                    return reject("NO_ORIGINS");
                }

                const uniqueOrigins = [...new Set(origins)];

                const websiteSettings = mprisSettings.websiteSettings || {};

                let response = {
                    origins: {},
                    mprisSettings
                };

                for (const origin of uniqueOrigins) {
                    let allowed = true;
                    if (typeof MPRIS_WEBSITE_SETTINGS[origin] === "boolean") {
                        allowed = MPRIS_WEBSITE_SETTINGS[origin];
                    }
                    if (typeof websiteSettings[origin] === "boolean") {
                        allowed = websiteSettings[origin];
                    }

                    response.origins[origin] = allowed;
                }

                resolve(response);

            }, reject);
        });
    }

    setAllowed(origin, allowed) {
        return SettingsUtils.get().then((settings) => {
            const mprisSettings = settings.mpris;
            if (!mprisSettings.enabled) {
                return reject("MPRIS_DISABLED");
            }

            let websiteSettings = mprisSettings.websiteSettings || {};

            let implicitAllowed = true;
            if (typeof MPRIS_WEBSITE_SETTINGS[origin] === "boolean") {
                implicitAllowed = MPRIS_WEBSITE_SETTINGS[origin];
            }

            if (allowed !== implicitAllowed) {
                websiteSettings[origin] = allowed;
            } else {
                delete websiteSettings[origin];
            }

            mprisSettings.websiteSettings = websiteSettings;

            return SettingsUtils.set({
                mpris: mprisSettings
            });
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {

    sendMessage("browserAction", "getStatus").then((status) => {

        switch (status.portStatus) {
        case "UNSUPPORTED_OS":
            document.getElementById("unsupported_os_error").classList.remove("hidden");
            break;

        case "STARTUP_FAILED": {
            document.getElementById("startup_error").classList.remove("hidden");

            const errorText = status.portLastErrorMessage;
            // Don't show generic error on startup failure. There's already an explanation.
            if (errorText && errorText !== "UNKNOWN") {
                const errorTextItem = document.getElementById("startup_error_text");
                errorTextItem.innerText = errorText;
                errorTextItem.classList.remove("hidden");
            }
            break;
        }

        default: {
            document.getElementById("main").classList.remove("hidden");

            let errorText = status.portLastErrorMessage;
            if (errorText === "UNKNOWN") {
                errorText = chrome.i18n.getMessage("general_error_unknown");
            }

            if (errorText) {
                document.getElementById("runtime_error_text").innerText = errorText;
                document.getElementById("runtime_error").classList.remove("hidden");

                // There's some content, hide dummy placeholder
                document.getElementById("dummy-main").classList.add("hidden");
            }

            break;
        }
        }

        // HACK so the extension can tell we closed, see "browserAction" "ready" callback in extension.js
        chrome.runtime.onConnect.addListener((port) => {
            if (port.name !== "browserActionPort") {
                return;
            }

            // do we need to do something with the port here?
        });
        sendMessage("browserAction", "ready");
    });

    // MPris blocker checkboxes
    const blocker = new MPrisBlocker();
    blocker.getAllowed().then((result) => {
        const origins = result.origins;

        if (Object.entries(origins).length === 0) { // "isEmpty"
            return;
        }

        // To keep media controls setting from always showing up, only show them, if:
        // - There is actually a player anywhere on this tab
        // or, since when mpris is disabled, there are never any players
        // - when media controls are disabled for any origin on this tab
        new Promise((resolve, reject) => {
            for (let origin in origins) {
                if (origins[origin] === false) {
                    return resolve("HAS_BLOCKED");
                }
            }

            TabUtils.getCurrentTab().then((tab) => {
                return sendMessage("mpris", "hasTabPlayer", {
                    tabId: tab.id
                });
            }).then((playerIds) => {
                if (playerIds.length > 0) {
                    return resolve("HAS_PLAYER");
                }

                reject("NO_PLAYER_NO_BLOCKED");
            });
        }).then(() => {
            // There's some content, hide dummy placeholder
            document.getElementById("dummy-main").classList.add("hidden");

            let blacklistInfoElement = document.querySelector(".mpris-blacklist-info");
            blacklistInfoElement.classList.remove("hidden");

            let originsListElement = blacklistInfoElement.querySelector("ul.mpris-blacklist-origins");

            for (const origin in origins) {
                const originAllowed = origins[origin];

                let blockListElement = document.createElement("li");

                let labelElement = document.createElement("label");
                labelElement.innerText = origin;

                let checkboxElement = document.createElement("input");
                checkboxElement.type = "checkbox";
                checkboxElement.checked = (originAllowed === true);
                checkboxElement.addEventListener("click", (e) => {
                    // Let us handle (un)checking the checkbox when setAllowed succeeds
                    e.preventDefault();

                    const allowed = checkboxElement.checked;
                    blocker.setAllowed(origin, allowed).then(() => {
                        checkboxElement.checked = allowed;
                    }, (err) => {
                        console.warn("Failed to change media controls settings:", err);
                    });
                });

                labelElement.insertBefore(checkboxElement, labelElement.firstChild);

                blockListElement.appendChild(labelElement);

                originsListElement.appendChild(blockListElement);
            }
        }, (err) => {
            console.log("Not showing media controls settings because", err);
        });
    }, (err) => {
        console.warn("Failed to check for whether media controls are blocked", err);
    });
});
