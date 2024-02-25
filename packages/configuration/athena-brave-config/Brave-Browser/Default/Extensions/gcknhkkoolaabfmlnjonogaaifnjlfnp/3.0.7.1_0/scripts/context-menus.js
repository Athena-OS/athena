/***** context menus *****/

// TODO: use contextMenus.onClicked for handling clicks
function contextMenuHandler( info, tab) {
    var i,
        params,
        pattern,
        patternUrl,
        proxy,
        proxyId,
        id = info.menuItemId;
        
    console.log("contextMenu onClick handler: "+ id);
    
    switch(id) {
        case "mode_patterns_label":
            foxyProxy.state = 'auto';
            break;
        case "mode_disabled_label":
            foxyProxy.state = "disabled";
            break;
        case "context-menu-options":
            foxyProxy.options("tabProxies");
            break;
        case "context-menu-quick-add":
            foxyProxy.options("addpattern#" + tab.url);
            break;
        case "show_context_menu":
            foxyProxy.toggleShowContextMenu();
            break;
        case "use_advanced_menus":
            foxyProxy.toggleAdvancedMenus();
            break;
        default:
            // break out proxy/pattern info encoded into context menu ID
            // to handle proxy and pattern clicks.
            
            params = id.split("#");
            proxyId = params[1];
            
            if (params.length == 2) {
                
                if ('mode_custom_label' == params[0]) {
                    foxyProxy.state = proxyId;
                } else if ('enabled' == params[0]) {
                    for (i = 0; i < foxyProxy._proxyList.length; i++) {
                        if (foxyProxy._proxyList[i].data.id == proxyId) {
                            proxy = foxyProxy._proxyList[i];
                            break;
                        }
                    }
                    if (proxy) {
                        proxy.data.enabled = !proxy.data.enabled;
                        foxyProxy.applyState();
                    }
                }
            } else if (params.length == 4) {
                patternUrl = params[3];
                
                for (i = 0; i < foxyProxy._proxyList.length; i++) {
                    if (foxyProxy._proxyList[i].data.id == proxyId) {
                        proxy = foxyProxy._proxyList[i];
                        break;
                    }
                }
                
                if (proxy) {
                    for (i = 0; i < proxy.data.patterns.length; i++) {
                        if ( proxy.data.patterns[i].data.url == patternUrl) {
                            pattern = proxy.data.patterns[i];
                            break;
                        }
                    }
                }
                
                if (pattern) {
                    pattern.data.enabled = !pattern.data.enabled;
                    foxyProxy.applyState();
                }
            }
            
    }
}

chrome.contextMenus.onClicked.addListener(contextMenuHandler);



foxyProxy.updateContextMenu = function () {
    console.log("updateContextMenu");
    var useAdvancedMenus;
    
    if (foxyProxy && foxyProxy._settings) {
        useAdvancedMenus = foxyProxy._settings.useAdvancedMenus;

        chrome.contextMenus.removeAll();
    
        if (foxyProxy._settings.showContextMenu && foxyProxy.getFoxyProxyEdition() != 'Basic') {
            console.log("creating context menus");
            chrome.contextMenus.create({
                id: "mode_patterns_label",
                title: chrome.i18n.getMessage("mode_patterns_label"),
                type: "checkbox",
                checked: ('auto' == foxyProxy.state)
            });
        
            if (useAdvancedMenus) { // create sub-menu options for each proxy
                if (foxyProxy._proxyList && foxyProxy._proxyList.length) {
                    foxyProxy._proxyList.forEach( function ( proxy) {
                        chrome.contextMenus.create({
                            id: proxy.data.id,                        
                            title: proxy.data.name
                        });

                        chrome.contextMenus.create({
                            id: "enabled#" + proxy.data.id,
                            parentId: proxy.data.id,                        
                            title: chrome.i18n.getMessage("enabled"),
                            type: "checkbox",
                            checked: (proxy.data.enabled)
                        });

                        chrome.contextMenus.create({
                            id: "mode_custom_label#" + proxy.data.id,
                            parentId: proxy.data.id,                        
                            title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                            type: "checkbox",
                            checked: (proxy.data.id == foxyProxy.state)
                        });

                        if (proxy.data.id != "default" && proxy.data.patterns && proxy.data.patterns.length > 0) {
                            chrome.contextMenus.create({
                                id: "patterns#" + proxy.data.id,
                                parentId: proxy.data.id,
                                title: chrome.i18n.getMessage("patterns")
                            });
                            proxy.data.patterns.forEach( function( pattern) { 
                                chrome.contextMenus.create({
                                    id: "proxy#" + proxy.data.id + "#pattern#" + pattern.data.url,
                                    parentId: "patterns#" + proxy.data.id,
                                    title: pattern.data.url,
                                    type: "checkbox",
                                    checked: (pattern.data.enabled)
                                });
                            });
                        }
                    });
                }
            } else { // simple menus
                console.log("using simple menus");
                if (foxyProxy._proxyList && foxyProxy._proxyList.length) {            
                    foxyProxy._proxyList.forEach( function ( proxy) {
                        console.log("proxy: " + proxy.data.name);
                        if (proxy.data.enabled) {
                            chrome.contextMenus.create({
                                id: "mode_custom_label#" + proxy.data.id,
                                title: chrome.i18n.getMessage("mode_custom_label", proxy.data.name),
                                type: "checkbox",
                                checked: (proxy.data.id == foxyProxy.state)
                            });
                        }
                    });
                }
            }
        
            console.log("creating common menus");
            // common menu options (simple and advanced)
            // everybody gets disable entry
            chrome.contextMenus.create({
                id: "mode_disabled_label",
                title: chrome.i18n.getMessage("mode_disabled_label"),
                type: "checkbox",
                checked: ('disabled' == foxyProxy.state)
            });
        
            chrome.contextMenus.create({
                id: "separator",
                type: "separator"
             });
        
            if (useAdvancedMenus) { // make sure 'more' comes last for advanced menus

                 chrome.contextMenus.create({
                     id: "context-menu-more",
                     title: chrome.i18n.getMessage("more")
                 });

                 chrome.contextMenus.create({
                     id: "context-menu-global-settings",
                     parentId: "context-menu-more",
                     title: chrome.i18n.getMessage("global_settings"),
                     type: "normal"
                 });
            }
        
            chrome.contextMenus.create({
                id: "context-menu-options",
                parentId: useAdvancedMenus ? "context-menu-more" : null,
                title: chrome.i18n.getMessage("options")
            });
        
            if (foxyProxy._settings.enabledQA && foxyProxy.state != 'disabled') {
                chrome.contextMenus.create({
                    id: "context-menu-quick-add",
                    parentId: useAdvancedMenus ? "context-menu-more" : null,
                    title: chrome.i18n.getMessage("QuickAdd")
                });
            }
        
            chrome.contextMenus.create({
                id: "show_context_menu",
                parentId: useAdvancedMenus ? "context-menu-global-settings" : null,
                title: chrome.i18n.getMessage("show_context_menu"),
                type: "checkbox",
                checked: foxyProxy._settings.showContextMenu
            });
        
            chrome.contextMenus.create({
                id: "use_advanced_menus",
                parentId: useAdvancedMenus ? "context-menu-global-settings" : null,
                title: chrome.i18n.getMessage("use_advanced_menus"),
                type: "checkbox",
                checked: useAdvancedMenus
            });

         }
    }
};

// initialize context menus
chrome.runtime.getBackgroundPage(function( bgPage) {
    bgPage.foxyProxy.updateContextMenu();
});