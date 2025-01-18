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

// URL - data URL
let favIconDataForUrl = {};
let clearFavIconDataTimeoutId = 0;
let runningGetTabsQueries = 0;

addCallback("tabsrunner", "activate", function (message) {
    var tabId = message.tabId;

    console.log("Tabs Runner requested to activate tab with id", tabId);

    raiseTab(tabId);
});

addCallback("tabsrunner", "setMuted", function (message) {

    var tabId = message.tabId;
    var muted = message.muted;

    chrome.tabs.update(tabId, {muted: muted}, function (tab) {

        if (chrome.runtime.lastError || !tab) { // this "lastError" stuff feels so archaic
            // failed to mute/unmute
            return;
        }
    });

});

// only forward certain tab properties back to our host
var whitelistedTabProperties = [
    "id", "active", "audible", "favIconUrl", "incognito", "title", "url", "mutedInfo"
];

// FIXME We really should enforce some kind of security policy, so only e.g. plasmashell and krunner
// may access your tabs
addCallback("tabsrunner", "getTabs", function (message) {
    ++runningGetTabsQueries;

    chrome.tabs.query({
        windowType: "normal"
    }, (tabs) => {
        if (clearFavIconDataTimeoutId) {
            clearTimeout(clearFavIconDataTimeoutId);
            clearFavIconDataTimeoutId = 0;
        }

        // remove incognito tabs and properties not in whitelist
        let filteredTabs = tabs;

        // Firefox before 67 runs extensions in incognito by default
        // but we keep running after an update, so exclude those tabs for it
        if (IS_FIREFOX) {
            filteredTabs = filteredTabs.filter(function (tab) {
                return !tab.incognito;
            });
        }

        filteredTabs = filterArrayObjects(filteredTabs, whitelistedTabProperties);

        let favIconUrlsToFetch = new Set();

        // Collect a set of fav icons to be requested
        filteredTabs.forEach((tab) => {
            const url = tab.favIconUrl;
            if (!url) {
                return;
            }

            // Already a data URL
            if (url.match(/^data:image/)) {
                return;
            }

            // Already in cache
            if (favIconDataForUrl[url]) {
                return;
            }

            favIconUrlsToFetch.add(url);
        });

        // Prepare the download requests for all fav icons
        let requests = [];
        favIconUrlsToFetch.forEach((url) => {
            requests.push(new Promise((resolve) => {
                fetch(url, {
                    cache: "force-cache"
                }).then((response) => {
                    if (!response.ok) {
                        return resolve();
                    }

                    response.blob().then((blob) => {
                        let reader = new FileReader();
                        reader.onloadend = function() {
                            favIconDataForUrl[url] = reader.result;
                            return resolve();
                        }
                        reader.readAsDataURL(blob);
                    }, (err) => {
                        console.warn("Failed to read response of", url, "as blob", err);
                        resolve();
                    });
                }, (err) => {
                    console.warn("Failed to get favicon from", url, err);
                    resolve();
                });
            }));
        });

        // Download all favicons and send them out
        Promise.all(requests).then(() => {
            filteredTabs = filteredTabs.map((tab) => {
                const favIconUrl = tab.favIconUrl;
                if (!favIconUrl) {
                    return tab;
                }

                if (favIconUrl.match(/^data:image/)) {
                    tab.favIconData = favIconUrl;
                    return tab
                }

                const data = favIconDataForUrl[favIconUrl];
                if (data) {
                    tab.favIconData = data;
                }
                return tab;
            });

            --runningGetTabsQueries;
            if (runningGetTabsQueries === 0) {
                clearFavIconDataTimeoutId = setTimeout(() => {
                    favIconDataForUrl = {};
                    clearFavIconDataTimeoutId = 0;
                }, 60000);
            }

            port.postMessage({
                subsystem: "tabsrunner",
                event: "gotTabs",
                tabs: filteredTabs
            });
        });
    });
});
