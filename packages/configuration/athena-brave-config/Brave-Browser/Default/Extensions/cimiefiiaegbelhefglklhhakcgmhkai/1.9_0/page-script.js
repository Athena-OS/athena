(function() {
    let purposeTransferObject = null;
    let mprisTransferObject = null;
    let eventCallback = function(e) {
        e.stopPropagation();
        const args = e.detail;
        if (args.action == "unload") {
            // TODO: Undo other operations
            window.removeEventListener("pbiEvent", eventCallback, {"capture": true});
        } else if (args.action == "mediaSessionsRegister") {
            const MediaSessionsClassName_constructor = function() {
                this.callbacks = {};
                this.pendingCallbacksUpdate = 0;
                this.metadata = null;
                this.playbackState = "none";

                this.sendMessage = function(action, payload) {
                    let event = new CustomEvent("pbiMprisMessage", {
                        detail: {
                            action: action,
                            payload: payload
                        }
                    });
                    window.dispatchEvent(event);
                };

                this.executeCallback = function(action) {
                    let details = {
                        action: action
                        // for seekforward, seekbackward, seekto there's additional information one would need to add
                    };
                    this.callbacks[action](details);
                };

                this.setCallback = function(name, cb) {
                    const oldCallbacks = Object.keys(this.callbacks).sort();

                    if (cb) {
                        this.callbacks[name] = cb;
                    } else {
                        delete this.callbacks[name];
                    }

                    const newCallbacks = Object.keys(this.callbacks).sort();

                    if (oldCallbacks.toString() === newCallbacks.toString()) {
                        return;
                    }

                    if (this.pendingCallbacksUpdate) {
                        return;
                    }

                    this.pendingCallbacksUpdate = setTimeout(() => {
                        this.pendingCallbacksUpdate = 0;

                        // Make sure to send the current callbacks, not "newCallbacks" at the time of starting the timeout
                        const callbacks = Object.keys(this.callbacks);
                        this.sendMessage("callbacks", callbacks);
                    }, 0);
                };

                this.setMetadata = function(metadata) {
                    // MediaMetadata is not a regular Object so we cannot just JSON.stringify it
                    let newMetadata = {};

                    let dirty = (!metadata != !this.metadata);
                    if (metadata) {
                        const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(metadata));

                        const oldMetadata = this.metadata || {};

                        keys.forEach((key) => {
                            const value = metadata[key];
                            if (!value || typeof value === "function") {
                                return; // continue
                            }

                            // We only have Strings or the "artwork" Array, so a toString() comparison should suffice...
                            dirty |= (value.toString() !== (oldMetadata[key] || "").toString());

                            newMetadata[key] = value;
                        });
                    }

                    this.metadata = metadata;

                    if (dirty) {
                        this.sendMessage("metadata", newMetadata);
                    }
                };

                this.setPlaybackState = function(playbackState) {
                    if (this.playbackState === playbackState) {
                        return;
                    }

                    this.playbackState = playbackState;
                    this.sendMessage("playbackState", playbackState);
                };
            };

            mprisTransferObject = new MediaSessionsClassName_constructor();

            if (!navigator.mediaSession) {
                navigator.mediaSession = {};
            }

            var noop = function() {};

            var oldSetActionHandler = navigator.mediaSession.setActionHandler || noop;
            navigator.mediaSession.setActionHandler = function(name, cb) {
                mprisTransferObject.setCallback(name, cb);

                // Call the original native implementation
                // "call()" is needed as the real setActionHandler is a class member
                // and calling it directly is illegal as it lacks the context
                // This may throw for unsupported actions but we registered the callback
                // ourselves before
                return oldSetActionHandler.call(navigator.mediaSession, name, cb);
            };

            Object.defineProperty(navigator.mediaSession, "metadata", {
                get: () => mprisTransferObject.metadata,
                set: (newValue) => {
                    mprisTransferObject.setMetadata(newValue);
                }
            });
            Object.defineProperty(navigator.mediaSession, "playbackState", {
                get: () => mprisTransferObject.playbackState,
                set: (newValue) => {
                    mprisTransferObject.setPlaybackState(newValue);
                }
            });

            if (!window.MediaMetadata) {
                window.MediaMetadata = function(data) {
                    Object.assign(this, data);
                };
                window.MediaMetadata.prototype.title = "";
                window.MediaMetadata.prototype.artist = "";
                window.MediaMetadata.prototype.album = "";
                window.MediaMetadata.prototype.artwork = [];
            }

            // here we replace the document.createElement function with our own so we can detect
            // when an <audio> tag is created that is not added to the DOM which most pages do
            // while a <video> tag typically ends up being displayed to the user, audio is not.
            // HACK We cannot really pass variables from the page's scope to our content-script's scope
            // so we just blatantly insert the <audio> tag in the DOM and pick it up through our regular
            // mechanism. Let's see how this goes :D

            // HACK When removing a media object from DOM it is paused, so what we do here is once the
            // player loaded some data we add it (doesn't work earlier since it cannot pause when
            // there's nothing loaded to pause) to the DOM and before we remove it, we note down that
            // we will now get a paused event because of that. When we get it, we just play() the player
            // so it continues playing :-)
            let addPlayerToDomEvadingAutoPlayBlocking = function(player) {
                player.registerInDom = () => {
                    // Needs to be dataset so it's accessible from mutation observer on webpage
                    player.dataset.pbiPausedForDomRemoval = "true";
                    player.removeEventListener("play", player.registerInDom);

                    // If it is already in DOM by the time it starts playing, we don't need to do anything
                    // Also, if the page already parented it around, don't mess with it
                    if (document.documentElement.contains(player)
                        || player.parentNode) {
                        delete player.dataset.pbiPausedForDomRemoval;
                        player.removeEventListener("pause", player.replayAfterRemoval);
                    } else {
                        (document.head || document.documentElement).appendChild(player);
                        player.parentNode.removeChild(player);
                    }
                };

                player.replayAfterRemoval = () => {
                    if (player.dataset.pbiPausedForDomRemoval === "true") {
                        delete player.dataset.pbiPausedForDomRemoval;
                        player.removeEventListener("pause", player.replyAfterRemoval);

                        player.play();
                    }
                };

                player.addEventListener("play", player.registerInDom);
                player.addEventListener("pause", player.replayAfterRemoval);
            }

            const oldCreateElement = Document.prototype.createElement;
            Document.prototype.createElement = function() {
                const createdTag = oldCreateElement.apply(this, arguments);
                const tagName = arguments[0];

                if (typeof tagName === "string") {
                    if (tagName.toLowerCase() === "audio" || tagName.toLowerCase() === "video") {
                        const player = createdTag;
                        addPlayerToDomEvadingAutoPlayBlocking(player);
                    }
                }
                return createdTag;
            };

            // We also briefly add items created as new Audio() to the DOM so we can control it
            // similar to the document.createElement hack above since we cannot share variables
            // between the actual website and the background script despite them sharing the same DOM
            var oldAudio = window.Audio;
            window.Audio = function(...args) {
                const player = new oldAudio(...args);
                addPlayerToDomEvadingAutoPlayBlocking(player);
                return player;
            };
        } else if (args.action == "mpris") {
            try {
                mprisTransferObject.executeCallback(args.mprisCallbackName);
            } catch (e) {
                console.warn("Exception executing '" + args.mprisCallbackName + "' media sessions callback", e);
            }
        } else if (args.action == "purposeRegister") {
            purposeTransferObject = function() {};
            purposeTransferObject.reset = () => {
                purposeTransferObject.pendingResolve = null;
                purposeTransferObject.pendingReject = null;
            };
            purposeTransferObject.reset();

            if (!navigator.canShare) {
                navigator.canShare = (data) => {
                    if (!data) {
                        return false;
                    }

                    if (data.title === undefined && data.text === undefined && data.url === undefined) {
                        return false;
                    }

                    if (data.url) {
                        // check if URL is valid
                        try {
                            new URL(data.url, document.location.href);
                        } catch (e) {
                            return false;
                        }
                    }

                    return true;
                }
            }

            if (!navigator.share) {
                navigator.share = (data) => {
                    return new Promise((resolve, reject) => {
                        if (!navigator.canShare(data)) {
                            return reject(new TypeError());
                        }

                        if (data.url) {
                            // validity already checked in canShare, hence no catch
                            data.url = new URL(data.url, document.location.href).toString();
                        }

                        if (!window.event || !window.event.isTrusted) {
                            return reject(new DOMException("navigator.share can only be called in response to user interaction", "NotAllowedError"));
                        }

                        if (purposeTransferObject.pendingResolve || purposeTransferObject.pendingReject) {
                            return reject(new DOMException("A share is already in progress", "AbortError"));
                        }

                        purposeTransferObject.pendingResolve = resolve;
                        purposeTransferObject.pendingReject = reject;

                        const event = new CustomEvent("pbiPurposeMessage", {
                            detail: {
                                action: "share",
                                payload: data
                            }
                        });
                        window.dispatchEvent(event);
                    });
                };
            }
        } else if (args.action == "purposeShare") {
            purposeTransferObject.pendingResolve();
        } else if (args.action == "purposeReject") {
            purposeTransferObject.pendingReject(new DOMException("Share request aborted", "AbortError"));
        } else if (args.action == "purposeReset") {
            purposeTransferObject.reset();
        } else {
            console.warn("Unknown page script action" + args.action, args);
        }
    };
    window.addEventListener("pbiEvent", eventCallback, {"capture": true});
    window.dispatchEvent(new CustomEvent("pbiInited"));
}());
