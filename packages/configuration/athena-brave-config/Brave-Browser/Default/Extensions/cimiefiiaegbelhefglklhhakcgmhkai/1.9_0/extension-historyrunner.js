/*
    Copyright (C) 2020 Kai Uwe Broulik <kde@broulik.de>

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

let defaultFaviconData = "";

function getFavicon(url) {
    return new Promise((resolve) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }

            if (!xhr.response) {
                return resolve();
            }

            let reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            }
            reader.readAsDataURL(xhr.response);
        }
        const favIconUrl = "chrome://favicon/size/16@" + window.devicePixelRatio + "x/" + url;
        xhr.open("GET", favIconUrl);
        xhr.responseType = "blob";
        xhr.send();
    });
}

addCallback("historyrunner", "find", (message) => {
    const query = message.query;

    chrome.permissions.contains({
        permissions: ["history"]
    }, (granted) => {
        if (!granted) {
            sendPortMessage("historyrunner", "found", {
                query,
                error: "NO_PERMISSION"
            });
            return;
        }

        chrome.history.search({
            text: query,
            maxResults: 15,
            // By default searches only the past 24 hours but we want everything
            startTime: 0
        }, (results) => {
            let promises = [];

            // Collect open tabs for each history item URL to filter them out below
            results.forEach((result) => {
                promises.push(new Promise((resolve) => {
                    chrome.tabs.query({
                        url: result.url
                    }, (tabs) => {
                        if (chrome.runtime.lastError || !tabs) {
                            return resolve([]);
                        }

                        resolve(tabs);
                    });
                }));
            });

            Promise.all(promises).then((tabs) => {
                // Now filter out the entries with corresponding tabs we found earlier
                results = results.filter((result, index) => {
                    return tabs[index].length === 0;
                });

                // Now fetch all favicons from special favicon provider URL
                // There's no public API for this.
                // chrome://favicon/ works on Chrome "by accident", and for
                // Firefox' page-icon: scheme there is https://bugzilla.mozilla.org/show_bug.cgi?id=1315616
                if (IS_FIREFOX) {
                    return;
                }

                promises = [];
                results.forEach((result) => {
                    promises.push(getFavicon(result.url));
                });

                return Promise.all(promises);
            }).then((favicons) => {
                if (favicons) {
                    favicons.forEach((favicon, index) => {
                        if (favicon) {
                            results[index].favIconUrl = favicon;
                        }
                    });

                    // Now get the default favicon if we don't have it already...
                    if (!defaultFaviconData) {
                        return getFavicon("");
                    }
                }
            }).then((faviconData) => {
                if (faviconData) {
                    defaultFaviconData = faviconData;
                }

                if (defaultFaviconData) {
                    // ...and remove icon from all results that have the default one
                    results.forEach((result) => {
                        if (result.favIconUrl === defaultFaviconData) {
                            result.favIconUrl = "";
                        }
                    });
                }

                sendPortMessage("historyrunner", "found", {
                    query,
                    results
                });
            });

        });
    });
});

addCallback("historyrunner", "run", (message) => {
    const url = message.url;

    chrome.tabs.create({
        url
    });
});

addCallback("historyrunner", "requestPermission", () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("permission_request.html") + "?permission=history"
    });
});
