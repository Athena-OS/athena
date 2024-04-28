/*
    Copyright (C) 2017 Kai Uwe Broulik <kde@privat.broulik.de>
    Copyright (C) 2018 David Edmundson <davidedmundson@kde.org>

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

var callbacks = {};

function addCallback(subsystem, action, callback)
{
    if (!callbacks[subsystem]) {
        callbacks[subsystem] = {};
    }
    callbacks[subsystem][action] = callback;
}

function initPageScript(cb) {
    // On reloads, unload the previous page-script.
    executePageAction({"action": "unload"});

    // The script is only run later, wait for that before sending events.
    window.addEventListener("pbiInited", cb, {"once": true});

    var element = document.createElement('script');
    element.src = chrome.runtime.getURL("page-script.js");
    (document.body || document.head || document.documentElement).prepend(element);
    // We need to remove the script tag after inserting or else websites relying on the order of items in
    // document.getElementsByTagName("script") will break (looking at you, Google Hangouts)
    element.parentNode.removeChild(element);
}

function executePageAction(args) {
    // The page script injection and communication mechanism
    // was inspired by https://github.com/x0a/uBO-YouTube
    if (IS_FIREFOX) {
        args = cloneInto(args, window);
    }

    window.dispatchEvent(new CustomEvent('pbiEvent', {detail: args}));
}

chrome.runtime.onMessage.addListener(function (message, sender) {
    // TODO do something with sender (check privilige or whatever)

    var subsystem = message.subsystem;
    var action = message.action;

    if (!subsystem || !action) {
        return;
    }

    if (callbacks[subsystem] && callbacks[subsystem][action]) {
        callbacks[subsystem][action](message.payload);
    }
});

initPageScript(() => {
    SettingsUtils.get().then((items) => {
        if (items.breezeScrollBars.enabled) {
            loadBreezeScrollBars();
        }

        const mpris = items.mpris;
        if (mpris.enabled) {
            const origin = window.location.origin;

            const websiteSettings = mpris.websiteSettings || {};

            let mprisAllowed = true;
            if (typeof MPRIS_WEBSITE_SETTINGS[origin] === "boolean") {
                mprisAllowed = MPRIS_WEBSITE_SETTINGS[origin];
            }
            if (typeof websiteSettings[origin] === "boolean") {
                mprisAllowed = websiteSettings[origin];
            }

            if (mprisAllowed) {
                loadMpris();
                if (items.mprisMediaSessions.enabled) {
                    loadMediaSessionsShim();
                }
            }
        }

        if (items.purpose.enabled) {
            sendMessage("settings", "getSubsystemStatus").then((status) => {
                if (status && status.purpose) {
                    loadPurpose();
                }
            }, (err) => {
                // No warning, can also happen when port isn't connected for unsupported OS
                console.log("Failed to get subsystem status for purpose", err);
            });
        }
    });
});

// BREEZE SCROLL BARS
// ------------------------------------------------------------------------
//
function loadBreezeScrollBars() {
    if (IS_FIREFOX) {
        return;
    }

    if (!document.head) {
        return;
    }

    // You cannot access cssRules for <link rel="stylesheet" ..> on a different domain.
    // Since our chrome-extension:// URL for a stylesheet would be, this can
    // lead to problems in e.g modernizr, so include the <style> inline instead.
    // "Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules"
    var styleTag = document.createElement("style");
    styleTag.appendChild(document.createTextNode(`
html::-webkit-scrollbar {
    /* we'll add padding as "border" in the thumb*/
    height: 20px;
    width: 20px;
    background: white;
}

html::-webkit-scrollbar-track {
    border-radius: 20px;
    border: 7px solid white; /* FIXME why doesn't "transparent" work here?! */
    background-color: white;
    width: 6px !important; /* 20px scrollbar - 2 * 7px border */
    box-sizing: content-box;
}
html::-webkit-scrollbar-track:hover {
    background-color: #BFC0C2;
}

html::-webkit-scrollbar-thumb {
    background-color: #3DAEE9; /* default blue breeze color */
    border: 7px solid transparent;
    border-radius: 20px;
    background-clip: content-box;
    width: 6px !important; /* 20px scrollbar - 2 * 7px border */
    box-sizing: content-box;
    min-height: 30px;
}
html::-webkit-scrollbar-thumb:window-inactive {
   background-color: #949699; /* when window is inactive it's gray */
}
html::-webkit-scrollbar-thumb:hover {
    background-color: #93CEE9; /* hovered is a lighter blue */
}

html::-webkit-scrollbar-corner {
    background-color: white; /* FIXME why doesn't "transparent" work here?! */
}
    `));

    document.head.appendChild(styleTag);
}


// MPRIS
// ------------------------------------------------------------------------
//

var activePlayer;
// When a player has no duration yet, we'll wait for it becoming known
// to determine whether to ignore it (short sound) or make it active
var pendingActivePlayer;
var playerMetadata = {};
var playerCallbacks = [];

// Playback state communicated via media sessions api
var playerPlaybackState = "";

var players = new WeakSet();

var pendingSeekingUpdate = 0;

var titleTagObserver = null;
var oldPageTitle = "";

addCallback("mpris", "play", function () {
    playerPlay();
});

addCallback("mpris", "pause", function () {
    playerPause();
});

addCallback("mpris", "playPause", function () {
    if (activePlayer) {
        if (activePlayer.paused) { // TODO take into account media sessions playback state
            playerPlay();
        } else {
            playerPause();
        }
    }
});

addCallback("mpris", "stop", function () {
    // When available, use the "stop" media sessions action
    if (playerCallbacks.indexOf("stop") > -1) {
        executePageAction({"action": "mpris", "mprisCallbackName": "stop"});
        return;
    }

    // otherwise since there's no "stop" on the player, simulate it be rewinding and reloading
    if (activePlayer) {
        activePlayer.pause();
        activePlayer.currentTime = 0;
        // calling load() now as is suggested in some "how to fake video Stop" code snippets
        // utterly breaks stremaing sites
        //activePlayer.load();

        // needs to be delayed slightly otherwise we pause(), then send "stopped", and only after that
        // the "paused" signal is handled and we end up in Paused instead of Stopped state
        setTimeout(function() {
            sendMessage("mpris", "stopped");
        }, 1);
        return;
    }
});

addCallback("mpris", "next", function () {
    if (playerCallbacks.indexOf("nexttrack") > -1) {
        executePageAction({"action": "mpris", "mprisCallbackName": "nexttrack"});
    }
});

addCallback("mpris", "previous", function () {
    if (playerCallbacks.indexOf("previoustrack") > -1) {
        executePageAction({"action": "mpris", "mprisCallbackName": "previoustrack"});
    }
});

addCallback("mpris", "setFullscreen", (message) => {
    if (activePlayer) {
        if (message.fullscreen) {
            activePlayer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
});

addCallback("mpris", "setPosition", function (message) {
    if (activePlayer) {
        activePlayer.currentTime = message.position;
    }
});

addCallback("mpris", "setPlaybackRate", function (message) {
    if (activePlayer) {
        activePlayer.playbackRate = message.playbackRate;
    }
});

addCallback("mpris", "setVolume", function (message) {
    if (activePlayer) {
        activePlayer.volume = message.volume;
        activePlayer.muted = (message.volume == 0.0);
    }
});

addCallback("mpris", "setLoop", function (message) {
    if (activePlayer) {
        activePlayer.loop = message.loop;
    }
});

addCallback("mpris", "identify", function (message) {
    if (activePlayer) {
        // We don't have a dedicated "send player info" callback, so we instead send a "playing"
        // and if we're paused, we'll send a "paused" event right after
        // TODO figure out a way how to add this to the host without breaking compat

        var paused = activePlayer.paused;
        playerPlaying(activePlayer);
        if (paused) {
            playerPaused(activePlayer);
        }
    }
});

function playerPlaying(player) {
    setPlayerActive(player);
}

function playerPaused(player) {
    sendPlayerInfo(player, "paused");
}

function setPlayerActive(player) {
    pendingActivePlayer = player;

    if (isNaN(player.duration)) {
        // Ignore this player for now until we know a duration
        // In durationchange event handler we'll check for this and end up here again
        return;
    }

    // Ignore short sounds, they are most likely a chat notification sound
    // A stream has a duration of Infinity
    // Note that "NaN" is also not finite but we already returned earlier for that
    if (isFinite(player.duration) && player.duration > 0 && player.duration < 8) {
        return;
    }

    pendingActivePlayer = undefined;
    activePlayer = player;

    // when playback starts, send along metadata
    // a website might have set Media Sessions metadata prior to playing
    // and then we would have ignored the metadata signal because there was no player
    sendMessage("mpris", "playing", {
        mediaSrc: player.currentSrc || player.src,
        pageTitle: document.title,
        poster: player.poster,
        duration: player.duration,
        currentTime: player.currentTime,
        playbackRate: player.playbackRate,
        volume: player.volume,
        muted: player.muted,
        loop: player.loop,
        metadata: playerMetadata,
        callbacks: playerCallbacks,
        fullscreen: document.fullscreenElement !== null,
        canSetFullscreen: player.tagName.toLowerCase() === "video"
    });

    if (!titleTagObserver) {

        // Observe changes to the <title> tag in case it is updated after the player has started playing
        let titleTag = document.querySelector("head > title");
        if (titleTag) {
            oldPageTitle = titleTag.innerText;

            titleTagObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    const pageTitle = mutation.target.textContent;
                    if (pageTitle && oldPageTitle !== pageTitle) {
                        sendMessage("mpris", "titlechange", {
                            pageTitle: pageTitle
                        });
                    }
                    oldPageTitle = pageTitle;
                });
            });

            titleTagObserver.observe(titleTag, {
                childList: true, // text content is technically a child node
                subtree: true,
                characterData: true
            });
        }
    }
}

function sendPlayerGone() {
    activePlayer = undefined;
    pendingActivePlayer = undefined;
    playerMetadata = {};
    playerCallbacks = [];
    sendMessage("mpris", "gone");

    if (titleTagObserver) {
        titleTagObserver.disconnect();
        titleTagObserver = null;
    }
}

function sendPlayerInfo(player, event, payload) {
    if (player != activePlayer) {
        return;
    }

    sendMessage("mpris", event, payload);
}

function registerPlayer(player) {
    if (players.has(player)) {
        //console.log("Already know", player);
        return;
    }

    // auto-playing player, become active right away
    if (!player.paused) {
        playerPlaying(player);
    }
    player.addEventListener("play", function () {
        playerPlaying(player);
    });

    player.addEventListener("pause", function () {
        playerPaused(player);
    });

    // what about "stalled" event?
    player.addEventListener("waiting", function () {
        sendPlayerInfo(player, "waiting");
    });

    // playlist is now empty or being reloaded, stop player
    // e.g. when using Ajax page navigation and the user nagivated away
    player.addEventListener("emptied", function () {
        // When the player is emptied but the website tells us it's just "paused"
        // keep it around (Bug 402324: Soundcloud does this)
        if (player === activePlayer && playerPlaybackState === "paused") {
            return;
        }

        // could have its own signal but for compat it's easier just to pretend to have stopped
        sendPlayerInfo(player, "stopped");
    });

    // opposite of "waiting", we finished buffering enough
    // only if we are playing, though, should we set playback state back to playing
    player.addEventListener("canplay", function () {
        if (!player.paused) {
            sendPlayerInfo(player, "canplay");
        }
    });

    player.addEventListener("timeupdate", function () {
        sendPlayerInfo(player, "timeupdate", {
            currentTime: player.currentTime
        });
    });

    player.addEventListener("ratechange", function () {
        sendPlayerInfo(player, "ratechange", {
            playbackRate: player.playbackRate
        });
    });

    // TODO use player.seekable for determining whether we can seek?
    player.addEventListener("durationchange", function () {
        // Deferred active due to unknown duration
        if (pendingActivePlayer == player) {
            setPlayerActive(pendingActivePlayer);
            return;
        }

        sendPlayerInfo(player, "duration", {
            duration: player.duration
        });
    });

    player.addEventListener("seeking", function () {
        if (pendingSeekingUpdate) {
            return;
        }

        // Compress "seeking" signals, this is invoked continuously as the user drags the slider
        pendingSeekingUpdate = setTimeout(function() {
            pendingSeekingUpdate = 0;
        }, 250);

        sendPlayerInfo(player, "seeking", {
            currentTime: player.currentTime
        });
    });

    player.addEventListener("seeked", function () {
        sendPlayerInfo(player, "seeked", {
            currentTime: player.currentTime
        });
    });

    player.addEventListener("volumechange", function () {
        sendPlayerInfo(player, "volumechange", {
            volume: player.volume,
            muted: player.muted
        });
    });

    players.add(player);
}

function findAllPlayersFromNode(node) {
    if (typeof node.getElementsByTagName !== "function") {
        return [];
    }

    return [...node.getElementsByTagName("video"), ...node.getElementsByTagName("audio")];
}


function registerAllPlayers() {
    var players = findAllPlayersFromNode(document);
    players.forEach(registerPlayer);
}

function playerPlay() {
    // if a media sessions callback is registered, it takes precedence over us manually messing with the player
    if (playerCallbacks.indexOf("play") > -1) {
        executePageAction({"action": "mpris", "mprisCallbackName": "play"});
    } else if (activePlayer) {
        activePlayer.play();
    }
}

function playerPause() {
    if (playerCallbacks.indexOf("pause") > -1) {
        executePageAction({"action": "mpris", "mprisCallbackName": "pause"});
    } else if (activePlayer) {
        activePlayer.pause();
    }
}

function loadMpris() {
    // TODO figure out somehow when a <video> tag is added dynamically and autoplays
    // as can happen on Ajax-heavy pages like YouTube
    // could also be done if we just look for the "audio playing in this tab" and only then check for player?
    // cf. "checkPlayer" event above

    var observer = new MutationObserver(function (mutations) {
        let nodesRemoved = false;
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (node) {
                if (typeof node.matches !== "function") {
                    return;
                }

                // Check whether the node itself or any of its children is a player
                var players = findAllPlayersFromNode(node);
                if (node.matches("video,audio")) {
                    players.unshift(node);
                }

                players.forEach(function (player) {
                    registerPlayer(player);
                });
            });

            mutation.removedNodes.forEach((node) => {
                if (typeof node.matches !== "function") {
                    return;
                }

                // Check whether the node itself or any of its children is the current player
                const players = findAllPlayersFromNode(node);
                if (node.matches("video,audio")) {
                    players.unshift(node);
                }

                for (let player of players) {
                    if (player !== activePlayer) {
                        continue;
                    }

                    // If the player is still in the visible DOM, don't consider it gone
                    if (document.body.contains(player)) {
                        continue;
                    }

                    // If the player got temporarily added by us, don't consider it gone
                    if (player.dataset.pbiPausedForDomRemoval === "true") {
                        continue;
                    }

                    sendPlayerGone();
                    break;
                }
            });
        });
    });

    window.addEventListener("pagehide", function () {
        // about to navigate to a different page, tell our extension that the player will be gone shortly
        // we listen for tab closed in the extension but we don't for navigating away as URL change doesn't
        // neccesarily mean a navigation.
        // NOTE beforeunload is not emitted for iframes!
        sendPlayerGone();
    });

    function documentReady() {
        registerAllPlayers();

        observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    // In some cases DOMContentLoaded won't fire, e.g. when watching a video file directly in the browser
    // it generates a "video player" page for you but won't fire the event.
    // Also, make sure to install the mutation observer if this codepath is executed after the page is already ready.
    if (["interactive", "complete"].includes(document.readyState)) {
        documentReady();
    } else {
        registerAllPlayers(); // in case the document isn't ready but the event also doesn't fire...
        document.addEventListener("DOMContentLoaded", documentReady);
    }

    document.addEventListener("fullscreenchange", () => {
        if (activePlayer) {
            sendPlayerInfo(activePlayer, "fullscreenchange", {
                fullscreen: document.fullscreenElement !== null
            });
        }
    });
}

// This adds a shim for the Chrome media sessions API which is currently only supported on Android
// Documentation: https://developers.google.com/web/updates/2017/02/media-session
// Try it here: https://googlechrome.github.io/samples/media-session/video.html

// Bug 379087: Only inject this stuff if we're a proper HTML page
// otherwise we might end up messing up XML stuff
// only if our documentElement is a "html" tag we'll do it
// the rest is only set up in DOMContentLoaded which is only executed for proper pages anyway

// tagName always returned "HTML" for me but I wouldn't trust it always being uppercase
function loadMediaSessionsShim() {
    if (document.documentElement.tagName.toLowerCase() === "html") {

        window.addEventListener("pbiMprisMessage", (e) => {
            let data = e.detail || {};

            let action = data.action;
            let payload = data.payload;

            switch (action) {
            case "metadata":
                playerMetadata = {};

                if (typeof payload !== "object") {
                    return;
                }

                playerMetadata = payload;
                sendMessage("mpris", "metadata", payload);

                return;

            case "playbackState":
                if (!["none", "paused", "playing"].includes(payload)) {
                    return;
                }

                playerPlaybackState = payload;

                if (!activePlayer) {
                    return;
                }

                if (playerPlaybackState === "playing") {
                    playerPlaying(activePlayer);
                } else if (playerPlaybackState === "paused") {
                    playerPaused(activePlayer);
                }

                return;

            case "callbacks":
                if (Array.isArray(payload)) {
                    playerCallbacks = payload;
                } else {
                    playerCallbacks = [];
                }
                sendMessage("mpris", "callbacks", playerCallbacks);

                return;
            }
        });

        executePageAction({"action": "mediaSessionsRegister"});
    }
}

// PURPOSE / WEB SHARE API
// ------------------------------------------------------------------------
//
var purposeLoaded = false;
function loadPurpose() {
    if (purposeLoaded) {
        return;
    }

    purposeLoaded = true;

    // navigator.share must only be defined in secure (https) context
    if (!window.isSecureContext) {
        return;
    }

     window.addEventListener("pbiPurposeMessage", (e) => {
        const data = e.detail || {};

        const action = data.action;
        const payload = data.payload;

        if (action !== "share") {
            return;
        }

        sendMessage("purpose", "share", payload).then((response) => {
            executePageAction({"action": "purposeShare"});
        }, (err) => {
            // Deliberately not giving any more details about why it got rejected
            executePageAction({"action": "purposeReject"});
        }).finally(() => {
            executePageAction({"action": "purposeReset"});
        });;
    });

    executePageAction({"action": "purposeRegister"});
}
