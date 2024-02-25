/**
 Options Export feature
**/

/* Top Level proxy settings/nodes*/
var setDefaultFoxyProxySettings = function (foxyproxy, xmlDoc) {

  var item, warnings;
  
  var defaultSettings = {
    mode:"disabled", 
    selectedTabIndex:"0", 
    toolbaricon:"true", 
    toolsMenu:"true", 
    contextMenu:"true", 
    advancedMenus:"false", 
    previousMode:"disabled", 
    resetIconColors:"true", 
    useStatusBarPrefix:"true", 
    excludePatternsFromCycling:"false", 
    excludeDisabledFromCycling:"false", 
    ignoreProxyScheme:"false", 
    apiDisabled:"false", 
    proxyForVersionCheck:""
  };
  for (item in defaultSettings) {
    foxyproxy.setAttribute(item, defaultSettings[item]);
  }

  var random = xmlDoc.createElement("random");
  random.setAttribute("includeDirect", false);
  random.setAttribute("includeDisabled", false);
  
  var statusSettings = {
    "icon": true,
    "text": false,
    "left": "options",
    "middle": "cycle",
    "right": "contextmenu",
    "width": 0
  };
  var statusbar = xmlDoc.createElement("statusbar");
  for (item in statusSettings) {
    statusbar.setAttribute(item, statusSettings[item]);
  }

  var toolbarSettings = {
    "left": "options",
    "middle": "cycle",
    "right": "contextmenu"
  };
  var toolbar = xmlDoc.createElement("toolbar");
  for (item in toolbarSettings) {
      toolbar.setAttribute(item, toolbarSettings[item]);
  }


  var logg = xmlDoc.createElement("logg");
  logg.setAttribute("enabled", false);
  logg.setAttribute("maxSize", "500");
  logg.setAttribute("noURLs", false);
  logg.setAttribute("header", "&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;&lt;!DOCTYPE html PUBLIC &quot;-//W3C//DTD XHTML 1.0 Strict//EN&quot; &quot;http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd&quot;&gt;&lt;html xmlns=&quot;http://www.w3.org/1999/xhtml&quot;&gt;&lt;head&gt;&lt;title&gt;&lt;/title&gt;&lt;link rel=&quot;icon&quot; href=&quot;http://getfoxyproxy.org/favicon.ico&quot;/&gt;&lt;link rel=&quot;shortcut icon&quot; href=&quot;http://getfoxyproxy.org/favicon.ico&quot;/&gt;&lt;link rel=&quot;stylesheet&quot; href=&quot;http://getfoxyproxy.org/styles/log.css&quot; type=&quot;text/css&quot;/&gt;&lt;/head&gt;&lt;body&gt;&lt;table class=&quot;log-table&quot;&gt;&lt;thead&gt;&lt;tr&gt;&lt;td class=&quot;heading&quot;&gt;${timestamp-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${url-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${proxy-name-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${proxy-notes-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${pattern-name-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${pattern-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${pattern-case-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${pattern-type-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${pattern-color-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${pac-result-heading}&lt;/td&gt;&lt;td class=&quot;heading&quot;&gt;${error-msg-heading}&lt;/td&gt;&lt;/tr&gt;&lt;/thead&gt;&lt;tfoot&gt;&lt;tr&gt;&lt;td/&gt;&lt;/tr&gt;&lt;/tfoot&gt;&lt;tbody&gt;");
  logg.setAttribute("row", "&lt;tr&gt;&lt;td class=&quot;timestamp&quot;&gt;${timestamp}&lt;/td&gt;&lt;td class=&quot;url&quot;&gt;&lt;a href=&quot;${url}&quot;&gt;${url}&lt;/a&gt;&lt;/td&gt;&lt;td class=&quot;proxy-name&quot;&gt;${proxy-name}&lt;/td&gt;&lt;td class=&quot;proxy-notes&quot;&gt;${proxy-notes}&lt;/td&gt;&lt;td class=&quot;pattern-name&quot;&gt;${pattern-name}&lt;/td&gt;&lt;td class=&quot;pattern&quot;&gt;${pattern}&lt;/td&gt;&lt;td class=&quot;pattern-case&quot;&gt;${pattern-case}&lt;/td&gt;&lt;td class=&quot;pattern-type&quot;&gt;${pattern-type}&lt;/td&gt;&lt;td class=&quot;pattern-color&quot;&gt;${pattern-color}&lt;/td&gt;&lt;td class=&quot;pac-result&quot;&gt;${pac-result}&lt;/td&gt;&lt;td class=&quot;error-msg&quot;&gt;${error-msg}&lt;/td&gt;&lt;/tr&gt;");
  logg.setAttribute("footer", "lt;/tbody&gt;&lt;/table&gt;&lt;/body&gt;&lt;/html&gt;");
  
  var autoSettings = {
    "enabled": false,
    "temp": false,
    "reload": true,
    "notify": true,
    "notifyWhenCanceled": true,
    "prompt": true
  };
  var autoadd = xmlDoc.createElement("autoadd");
  for (item in autoSettings) {
    autoadd.setAttribute(item, autoSettings[item]);
  }

  var quickadd = xmlDoc.createElement("quickadd");
  quickadd.setAttribute("enabled", false);
  quickadd.setAttribute("temp", false);
  quickadd.setAttribute("reload", true);
  quickadd.setAttribute("notify", true);
  quickadd.setAttribute("notifyWhenCanceled", true);
  quickadd.setAttribute("prompt", true);

  // quickadd match
  var match1Attrs = {
      'enabled': true,
      'name': 'Dynamic AutoAdd Pattern',
      'pattern': '*://${3}${6}/*',
      'isRegEx': false,
      'isBlackList': false,
      'isMultiLine': false,
      'caseSensitive': false,
      'fromSubscription': false
  };

  var match1 = xmlDoc.createElement("match");
  for (item in match1Attrs) {
      match1.setAttribute(item, match1Attrs[item]);
  }
  autoadd.appendChild(match1);

  var match2Attrs = {
      'enabled': true,
      'name': '',
      'pattern': '*You are not authorized to view this page*',
      'isRegEx': false,
      'isBlackList': false,
      'isMultiLine': false,
      'caseSensitive': false,
      'fromSubscription': false
  };

  var match2 = xmlDoc.createElement("match");
  for (item in match2Attrs) {
      match2.setAttribute(item, match2Attrs[item]);
  }
  autoadd.appendChild(match2);
  
  var match3Attrs = {
      'enabled': true,
      'name': 'Dynamic AutoAdd Pattern',
      'pattern': '*://${3}${6}/*',
      'isRegEx': false,
      'isBlackList': false,
      'isMultiLine': false,
      'caseSensitive': false,
      'fromSubscription': false
  };
  var match3 = xmlDoc.createElement("match");
  for (item in match3Attrs) {
      match3.setAttribute(item, match3Attrs[item]);
  }
  quickadd.appendChild(match3);

  var defaultPrefs = xmlDoc.createElement("defaultPrefs");
  defaultPrefs.setAttribute("origPrefetch", 0);  

  warnings = xmlDoc.createElement("warnings");
  warnings.setAttribute("white-patterns", true);

  foxyproxy.appendChild(random);
  foxyproxy.appendChild(statusbar);
  foxyproxy.appendChild(toolbar);
  foxyproxy.appendChild(logg);
  foxyproxy.appendChild(autoadd);
  foxyproxy.appendChild(quickadd);
  foxyproxy.appendChild(defaultPrefs);
  foxyproxy.appendChild(warnings);

};

/* iterate through proxy patterns and generate xml nodes */
var generateXMLForPatterns = function (xmlDoc, patternsList) {
  var j = 0, patternLen, curPattern, curPatternNode, matches, match;
  
  if (patternsList) {
    matches = xmlDoc.createElement("matches");

    for (j = 0, patternLen = patternsList.length; j < patternLen; j++) {
      curPattern = patternsList[j].data;
      match = xmlDoc.createElement("match");
      match.setAttribute("enabled", curPattern.enabled);
      match.setAttribute("name", curPattern.name);

      if (curPattern.type != "wildcard") {
        match.setAttribute("isRegex", true);
      } else {
        match.setAttribute("isRegex", false);
      }
      match.setAttribute("pattern", curPattern.url);
      match.setAttribute("reload", true);
      match.setAttribute("autoReload", false);

      if (curPattern.whitelist == "Inclusive") {
        match.setAttribute("isBlackList", false);
      } else {
        match.setAttribute("isBlackList", true);
      }

      match.setAttribute("isMultiLine", false);
      match.setAttribute("fromSubscription", false);
      match.setAttribute("caseSensitive", false);

      matches.appendChild(match);
    }

    return matches;

  }

  return null;

};


/** process a single proxy from the local storage **/
var setSingleProxyNode = function (xmlDoc, curProxy) {

  var curProxyNode = xmlDoc.createElement("proxy");
  var manualconf, autoconf, patternsNode;

  // general settings.
  curProxyNode.setAttribute('name', curProxy.name);
  curProxyNode.setAttribute('id', curProxy.id);
  curProxyNode.setAttribute("notes", curProxy.notes);
  curProxyNode.setAttribute('enabled', curProxy.enabled);

  if (curProxy.id == "default") {
    curProxyNode.setAttribute('color', '#0055E5');
  } else {
    curProxyNode.setAttribute('color', curProxy.color);
  }



  curProxyNode.setAttribute("mode", curProxy.type);
  curProxyNode.setAttribute("autoconfMode", "pac");

  if (curProxy.id == "default") {
      curProxyNode.setAttribute("lastresort", true);
  } else {
      curProxyNode.setAttribute("lastresort", false);
  }

  // manual conf
  manualconf = xmlDoc.createElement("manualconf");
  manualconf.setAttribute("host", curProxy.host);
  manualconf.setAttribute("port", curProxy.port);
  manualconf.setAttribute("socksversion", curProxy.socks);
  if (curProxy.isSocks) {
    manualconf.setAttribute('isSocks', true);
  } else {
    manualconf.setAttribute('isSocks', false);
  }
  curProxyNode.appendChild(manualconf);

  // autoconf
  autoconf = xmlDoc.createElement("autoconf");
  autoconf.setAttribute("url", curProxy.configUrl);
  autoconf.setAttribute("reloadPac", false);
  autoconf.setAttribute("loadNotification", true);
  autoconf.setAttribute("errorNotification", true);
  autoconf.setAttribute("autoReload", false);
  autoconf.setAttribute("reloadFreqMins", "60");
  autoconf.setAttribute("disableOnBadPAC", true);
  curProxyNode.appendChild(autoconf);
  
  if (curProxy.patterns) {
    patternsNode = generateXMLForPatterns(xmlDoc, curProxy.patterns);
    if (patternsNode) {
      curProxyNode.appendChild(patternsNode);
    }
  }

  return curProxyNode;

};

/** main xml generation function **/
var generateXMLFromStorage = function () {
  var xmlDoc = document.implementation.createDocument(null, null, null);
  var foxyproxy = xmlDoc.createElement("foxyproxy");

  // for Firefox compatibility.
  setDefaultFoxyProxySettings(foxyproxy, xmlDoc);

  var proxies = xmlDoc.createElement("proxies");

  var proxyList = list,//JSON.parse(localStorage.getItem("proxyList")), FIXME: maybe don't rely on global var named 'list'?
      len = proxyList.length, i = 0, curProxy, curProxyNode, 
      attr, manualconf, patterns, patternsNode, autoconf;
  
  for (; i < len; i++) {
    curProxy = proxyList[i].data;
    curProxyNode = setSingleProxyNode(xmlDoc, curProxy);
    proxies.appendChild(curProxyNode);
  }
  
  xmlDoc.appendChild(foxyproxy);
  foxyproxy.appendChild(proxies);
  
  return xmlDoc;
};

/** adds a click event to generate and download xml export **/
var exportAndDownload = function() {
  var dom = generateXMLFromStorage();
  var xmlString = new XMLSerializer().serializeToString(dom);
  var blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>' + xmlString]);
  var evt = document.createEvent("HTMLEvents");
  
   evt.initEvent("click");
   $("<a>", {
   download: "FoxyProxy-export.fpx",
   href: webkitURL.createObjectURL(blob)
   }).get(0).dispatchEvent(evt);
   

};

$(document).ready(function (e) {

  var $button = $("#export-to-file");
  $button.click(function (e) {
    exportAndDownload();
  });

}); 
