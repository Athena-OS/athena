'use strict';

var first_time_url = "https://getfoxyproxy.org/proxyservice/2.0/index.html";
//var FOXYPROXY_VERSION = "";

/* onInstalled listener opens tab to the appropriate post-install page. */
chrome.runtime.onInstalled.addListener(function(details) {
    var urlToOpen;
    
    if (details.reason ) {
        var target  = chrome.i18n.getMessage("FoxyProxy_Target").toLowerCase(),
            edition = chrome.i18n.getMessage("FoxyProxy_Edition").toLowerCase(),
            version = chrome.i18n.getMessage("FoxyProxy_Version").split('.');
        
        if ("dev" == edition) {
            // chrome.windows.create({
            //     "url": first_time_url,
            //     "width": 999,
            //     "height": 777,
            //     "focused": true,
            //     "type": "normal"
            // });
            return; //short-circuit to avoid opening tabs in dev mode.
        }
        
        if (details.reason == "install") {
            //FOXYPROXY_VERSION = "new-install";
            urlToOpen = "http://getfoxyproxy.org/" + target + "/" + edition + "/install.html";
            
            chrome.windows.create({
                "url": first_time_url,
                "width": 999,
                "height": 777,
                "focused": true,
                "type": "normal"
            });
            
            chrome.runtime.sendMessage({ trackEvent: {
                "category": "Install",
                "action": "new"
            }});
            
        } else if (details.reason == "update") {
            //FOXYPROXY_VERSION = [target, edition, version.join()].join(" ");
            urlToOpen = "http://getfoxyproxy.org/" + target + "/" + edition + "/update.html";
            
            chrome.runtime.sendMessage({ trackEvent: {
                "category": "Install",
                "action": "update"
            }});
        }

        if (urlToOpen) {
            chrome.runtime.getBackgroundPage(function( bgPage) {
                var foxyProxy = bgPage.foxyProxy;

                foxyProxy.getSettings(function( resp) {
                    if (resp.settings && resp.settings.showUpdates) {
                        chrome.tabs.create({
                            url: urlToOpen,
                            selected: true
                        });
                    }
                });
            });
        }
    }
});
