
(function() {
    var localSettings,
        localProxyList,
        storageApi,
        queryUrl = "chrome-extension://" + chrome.i18n.getMessage("@@extension_id") + "/options.html";


    //// migration code - move old settings from localStorage
        
    localSettings = localStorage.getItem("settings");
    if (localSettings) {
        console.log("migrating settings from localStorage");
        localSettings = JSON.parse(localSettings);
        
        //localStorage.removeItem("settings");
    }

    localProxyList = localStorage.getItem("proxyList");
    if (localProxyList) {
        console.log("migrating proxyList from localStorage");
        var proxyJSON = JSON.parse(localProxyList);
        localProxyList = proxyJSON.map( function (p) {
            var t = new Proxy(p); // depends on proxy.js
            var i = 0;
            while (i < t.data.patterns.length) {
                if (t.data.patterns[i].data.temp) t.data.patterns.splice(i, 1);
                else i++;
            }

            return t;
        });
    
        //localStorage.removeItem("proxyList");
    }

     ///// end migration code
    
    
    /* 
     * load initial settings or default settings
     */
    function initSettings( reload) {
        var defaults = getDefaults(),
        useSyncStorage = JSON.parse(localStorage.getItem("useSyncStorage"));
        
        storageApi = useSyncStorage ? chrome.storage.sync : chrome.storage.local;
        
        if (useSyncStorage === null) {
            localStorage.setItem("useSyncStorage", false);
        }
        
        if (reload || (!foxyProxy._settings && !foxyProxy._proxyList)) {
            
            try {
                foxyProxy.getSettings(function( items) {
                    if (!items || !items.settings) {
                        if (localSettings) {
                            console.log("using localStorage settings");
                            // merge default settings
                            for (var p in defaults.settings) {
                                if (defaults.settings.hasOwnProperty(p) && typeof(localSettings[p]) == "undefined") {
                                    localSettings[p] = defaults.settings[p];
                                }
                            }
                            foxyProxy._settings = localSettings;
                        } else {
                            console.log("set settings to default");
                            foxyProxy._settings = defaults.settings;
                        }
                    }
                    
                    // get system info for debugging
                    if (!foxyProxy._settings.sczd) {
                        try {
                            chrome.system.cpu.getInfo(function( info) {
                                info = JSON.stringify(info);
                                console.log("sczd debug info: " + info);
                                foxyProxy._settings.sczd = info;
                            });
                        } catch (cpuX) {
                            console.log('failed to get info: ' + cpuX);
                            foxyProxy._settings.sczd = 'no info: ' + Date.now();
                        }
                    }
                });
            } catch ( exc) {
                console.log("exception initializing settings");
                console.log(exc);
                
                if (localSettings) {
                    console.log("using localStorage settings");
                    foxyProxy._settings = localSettings;
                } else {
                    console.log("set settings to default");
                    foxyProxy._settings = defaults.settings;
                }
            }
            
            try {
                console.log("trying to load proxy list...");
                foxyProxy.getProxyList(function( items) {
                    if (!items || !items.proxyList) {
                        if (localProxyList) {
                            console.log("using localStorage proxyList");
                            foxyProxy._proxyList = localProxyList;
                        } else {
                            console.log("set proxyList to default");
                            foxyProxy._proxyList = defaults.proxyList;
                        }
                    }
                });
            } catch ( exc) {
                console.log("exception initializing proxyList");
                console.log(exc);
                
                if (localProxyList) {
                    console.log("using localStorage proxyList");
                    foxyProxy._proxyList = localProxyList;
                } else {
                    console.log("set proxyList to default");
                    foxyProxy._proxyList = defaults.proxyList;
                }
            }
            
            // chrome.storage.onChanged.addListener(function( changes, areaName) {
            //     console.log("got storage.onChanged for area: " + areaName);
            //     console.log(changes);
            // });
        }
    }
    
    /*
     * Returns an object that contains default settings and proxyList.
     */
    function getDefaults() {
        var defaultSettings = {
            showContextMenu: true,
            enabledQA: false,
            patternTemplateQA: "*://${3}${6}/*",
            patternNameQA: "Dynamic QuickAdd Pattern",
            patternTemporaryQA: false,
            patternWhitelistQA:"Inclusive",
            patternTypeQA:"wildcard",
            useAdvancedMenus: false,
            useSyncStorage: false,
            animateIcon: true,
            showUpdates: true,
            usageOptOut: false
        };
        
        var defaultProxy = new Proxy({
            "data": {
                "id": "default",
                "readonly": true,
                "enabled": true,
                "color": "#0000ff",
                "name": "Default",
                "notes": "These are the settings that are used when no patterns match an URL",
                "host": "",
                "port": "",
                "isSocks": false,
                "socks": "5",
                "pac": "",
                "dns": "",
                "type": "direct", // proxyMode
                "cycle": false,
                "useDns": true,
                "reloadPAC": false,
                "bypassFPForPAC": false,
                "reloadPACInterval": 60,
                "configUrl": "",
                "notifOnLoad": false,
                "notifOnError": false,
                "patterns": [],
                "ipPatterns": [],
                "login": "",
                "pass": ""
                } 
        });
        
        return {"settings": defaultSettings, "proxyList": [ defaultProxy ] };
    }
    
    
    ///// FP Settings API /////
    
    foxyProxy.setSync = function setSync( isSync ) {
        console.log("foxyProxy setSync: " + isSync);
        var useSyncStorage = !!isSync;
        localStorage.setItem("useSyncStorage", useSyncStorage);
        
        foxyProxy._settings.useSyncStorage = useSyncStorage;
        
        foxyProxy.updateSettings({"settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList }, 'setSync',
        function() {
            storageApi = foxyProxy._settings.useSyncStorage ? chrome.storage.sync : chrome.storage.local;
            if (foxyProxy._settings.useSyncStorage) {
                // call getSettings and getProxyList to get sync'd changed and broadcast sync change to UI.
                console.log("sync'ing settings...");
                foxyProxy.getSettings();
                foxyProxy.getProxyList();
            }
        });

    };
    
    foxyProxy.getSettings = function getSettings( callback) {
        storageApi.get("settings", function( items) {
            if (chrome.runtime.lastError) {
                console.log("failed to get settings from chrome.storage");
                console.log(chrome.runtime.lastError);
            } else {
                if (items.settings) {
                    foxyProxy._settings = items.settings;
                } else {
                    console.log("no settings found in chrome.storage.");
                }
                    
                if (typeof(callback) == "function") {
                    callback({ "settings": foxyProxy._settings });
                } else {
                    chrome.tabs.query({"url": queryUrl},
                        function( tabs) {
                            for (var i = 0; i < tabs.length; i++) {
                                chrome.tabs.sendMessage(tabs[i].id, { "settings": foxyProxy._settings });
                            }
                        }
                    );
                }

            }
        });
    };
        
    foxyProxy.getProxyList = function getProxyList( callback) {
        var list = [];
        storageApi.get("proxyList", function( items) {
            if (chrome.runtime.lastError) {
                console.log("failed to get proxyList from chrome.storage");
                console.log(chrome.runtime.lastError);
            } else {
                if (items.proxyList && items.proxyList.length) {
                    try {
                        storageApi.get(items.proxyList, function( proxies) {
                            for (var i = 0; i < items.proxyList.length; i++) {
                                list.push(new Proxy(proxies[items.proxyList[i]]));
                            }
                        
                            // reset default proxy id to string 'default'
                            var last = list[list.length-1];
                            if (last.data && last.data.id !== "default") {
                                if (last.data.readonly && last.data.name == "Default") {
                                    last.data.id = "default";
                                    list[list.length-1] = last;
                                    console.log("reset default proxy ID.");
                                }
                            }

                            foxyProxy._proxyList = list;
                    
                            if (typeof(callback) == "function") {
                                callback({"proxyList": list });
                            } else {
                                chrome.tabs.query({"url": queryUrl },
                                    function( tabs) {
                                        console.log("sending proxyList to " + tabs.length + " foxyproxy tabs");
                                        for (var i = 0; i < tabs.length; i++) {
                                            chrome.tabs.sendMessage(tabs[i].id, { "proxyList": list });
                                        }
                                    }
                                );

                            }
                        });
                    } catch (exc) {
                        console.log("Failed to load proxy data for proxyList: " + items.proxyList);
                        if (chrome.runtime.lastError) {
                            console.log(chrome.runtime.lastError);
                        }
                        
                        // return empty list
                        if (typeof(callback) == "function") {
                             callback({"proxyList": [] });
                         } else {
                             chrome.tabs.query({"url": queryUrl },
                                 function( tabs) {
                                     console.log("sending proxyList to " + tabs.length + " foxyproxy tabs");
                                     for (var i = 0; i < tabs.length; i++) {
                                         chrome.tabs.sendMessage(tabs[i].id, { "proxyList": [] });
                                     }
                                 }
                             );

                         }
                    }
                } else {
                    console.log("no proxies found in chrome.storage.");
                    if (typeof(callback) == "function") {
                        callback({ "proxyList": foxyProxy._proxyList });
                    } else {
                        chrome.tabs.query({"url": queryUrl },
                            function( tabs) {
                                console.log("sending proxyList to " + tabs.length + " foxyproxy tabs");
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.sendMessage(tabs[i].id, { "proxyList": foxyProxy._proxyList });
                                }
                            }
                        );
                    }
                }
                
            }
        });
    };

    /*
     * Update settings and/or proxyList object in chrome.storage
     */
    foxyProxy.updateSettings = function updateSettings( message, sender, sendResponse ) {
        var i,
            proxy,
            proxyId,
            list = [],
            saveObj = {};

        if (message.settings && message.settings !== null) {
            saveObj.settings = message.settings;
        }
    
        if (message.proxyList && message.proxyList !== null && message.proxyList.length) {
            // save proxies keyed off of ID to avoid storage quota limit.
            for (i = 0; i < message.proxyList.length; i++) {
                proxy = message.proxyList[i];
                id = proxy.data.id;
                list.push(id);
                saveObj[id] = proxy;
            }
            saveObj.proxyList = list;
        }
        
        try {
            storageApi.set(saveObj, function() {
                if (chrome.runtime.lastError) {
                    console.log("error updating settings: ");
                    console.log(chrome.runtime.lastError);
                } else {
                    if (saveObj.settings) {
                        foxyProxy._settings = saveObj.settings;
                    }
                    if (saveObj.proxyList) {
                        var pList = [];
                        for (i = 0; i < saveObj.proxyList.length;i++) {
                            pList.push(saveObj[saveObj.proxyList[i]]);
                        }
                        foxyProxy._proxyList = pList;
                    }
                    if (typeof(sendResponse) == "function") {
                        sendResponse({ "settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList });
                    } else {
                        chrome.tabs.query({"url": queryUrl},
                            function( tabs) {
                                for (var i = 0; i < tabs.length; i++) {
                                    chrome.tabs.sendMessage(tabs[i].id, { "settings": foxyProxy._settings, "proxyList": foxyProxy._proxyList });
                                }
                            }
                        );
                        if (foxyProxy.updateContextMenu) {
                            foxyProxy.updateContextMenu();
                        }
                    }
                }
            });
        } catch (exc) {
            console.log("exception updating settings");
            console.log(exc);
        }
    
    };
    
    foxyProxy.resetToDefaults = function resetToDefaults() {
        foxyProxy.updateSettings(getDefaults());
    };
    
    foxyProxy.reloadSettings = function reloadSettings() {
        initSettings(true);
    };
    
    // bootstrap settings
    initSettings();
    
})();