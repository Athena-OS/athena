/*
    Copyright (C) 2017-2019 Kai Uwe Broulik <kde@privat.broulik.de>

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

var activeDownloads = []
var downloadUpdateInterval = 0;

function startSendingDownloadUpdates() {
    if (!chrome.downloads.onChanged.hasListener(onDownloadChanged)) {
        // Register this listener only when needed. If it's active during
        // browser startup, it can be triggered for existing downloads (also
        // no longer existing files!) and freeze the UI for >1min!
        chrome.downloads.onChanged.addListener(onDownloadChanged);
    }

    if (!downloadUpdateInterval) {
        downloadUpdateInterval = setInterval(sendDownloadUpdates, 1000);
    }
}

function stopSendingDownloadUpdates() {
    if (downloadUpdateInterval) {
        clearInterval(downloadUpdateInterval);
        downloadUpdateInterval = 0;
    }
}

function sendDownloadUpdates() {
    chrome.downloads.search({
        state: 'in_progress',
        paused: false
    }, function (results) {
        if (!results.length) {
            stopSendingDownloadUpdates();
            return;
        }

        results.forEach(function (download) {
            if (activeDownloads.indexOf(download.id) === -1) {
                return;
            }

            var payload = {
                id: download.id,
                bytesReceived: download.bytesReceived,
                estimatedEndTime: download.estimatedEndTime,
                // Firefox ends along "-1" as totalBytes on download creation
                // but then never updates it, so we send this along periodically, too
                totalBytes: download.totalBytes
            };

            port.postMessage({subsystem: "downloads", event: "update", download: payload});
        });
    });
}

function createDownload(download) {
    // don't bother telling us about completed downloads...
    // otherwise on browser startup we'll spawn a gazillion download progress notification
    if (download.state === "complete" || download.state === "interrupted") {
        return;
    }

    activeDownloads.push(download.id);
    startSendingDownloadUpdates();

    port.postMessage({subsystem: "downloads", event: "created", download: download});
}

function sendDownloads() {
    // When extension is (re)loaded, create each download initially
    chrome.downloads.search({
        state: 'in_progress',
    }, function (results) {
        results.forEach(createDownload);
    });
}

chrome.downloads.onCreated.addListener(createDownload);

function onDownloadChanged(delta) {
    if (activeDownloads.indexOf(delta.id) === -1) {
        return;
    }

    // An interrupted download was resumed. When a download is interrupted, we finish (and delete)
    // the job but the browser re-uses the existing download, so when this happen,
    // pretend a new download was created.
    if (delta.state) {
        if (delta.state.previous === "interrupted" && delta.state.current === "in_progress") {
            console.log("Resuming previously interrupted download, pretending a new download was created");
            chrome.downloads.search({
                id: delta.id
            }, function (downloads) {
                createDownload(downloads[0]);
            });
            return;
        }
    }

    // The update timer stops automatically when there are no running downloads
    // so make sure to restart it when a download is unpaused
    if (delta.paused) {
        if (delta.paused.previous && !delta.paused.current) {
            startSendingDownloadUpdates();
        }
    }

    var payload = {};

    Object.keys(delta).forEach((key) => {
        payload[key] = delta[key].current;
    });

    payload.id = delta.id; // not a delta, ie. has no current and thus isn't added by the loop below

    port.postMessage({subsystem: "downloads", event: "update", download: payload});
};

addCallback("downloads", "cancel", function (message) {
    var downloadId = message.downloadId;

    console.log("Requested to cancel download", downloadId);

    chrome.downloads.cancel(downloadId);
});

addCallback("downloads", "suspend", function (message) {
    var downloadId = message.downloadId;

    console.log("Requested to suspend download", downloadId);

    chrome.downloads.pause(downloadId);
});

addCallback("downloads", "resume", function (message) {
    var downloadId = message.downloadId;

    console.log("Requested to resume download", downloadId);

    chrome.downloads.resume(downloadId);
});

addCallback("downloads", "createAll", () => {
    sendDownloads();
});
