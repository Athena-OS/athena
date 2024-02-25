var ProxyManager = {
  autoPacScriptPath: null,
  socksPacScriptPath: null,
  ProxyModes: {
    direct: "direct",
    manual: "manual",
    auto: "auto"
  }
};
ProxyManager.directConnectionProfile = {
  id: "direct",
  name: "[proxy_directConnection]",
  proxyMode: ProxyManager.ProxyModes.direct,
  color: "inactive"
};

/**
 * Converts the "data" property of a Proxy object (as defined in background.html; elements of |proxyList|) to a "profile" object.
 * Not sure why we can't just use |proxyList| elements instead or |ProxyConfig| class directly.
 */
ProxyManager.profileFromProxy = function (a) {
  var b = a.data.host + ":" + a.data.port;
  return {
    // TODO: Use the |ProxyConfig| class directly. For now, see top of background.html for object model.
    proxyMode: a.data.type,
    proxyHttp: a.data.isSocks ? null : b,
    proxyHost: a.data.host,
    proxyPort: a.data.port,
    proxySocks: a.data.isSocks ? b : null,
    socksVersion: a.data.socks,
    proxyConfigUrl: a.data.configUrl

  };
};
ProxyManager.profileAuto = function () {
  return {
    proxyMode: ProxyManager.ProxyModes.auto,
    proxyHttp: "",
    proxySocks: "",
    socksVersion: "",
    proxyConfigUrl: ""
  };
};

/**
 * We're being disabled. TODO: shouldn't we use the "clear" value/setting instead of setting to system settings?
 */
ProxyManager.applyDisable = function (a) {
  ProxyConfig.mode = "system";
  chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
  console.log("Proxy is disabled: applyDisable");
  console.log(ProxyConfig);
};

/**
 * Patterns mode being set. TODO: change this from "auto" to "patterns".
 */
ProxyManager.applyAuto = function (a) {
  ProxyConfig.pacScript.url = "";
  ProxyConfig.pacScript.data = ProxyManager.generatePacAutoScript();
  // debug: dump the pac
  console.log("pac is " + ProxyConfig.pacScript.data);
  ProxyConfig.mode = "pac_script";
  console.log(ProxyConfig);
  chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
  console.log("Proxy is auto: applyAuto");
};

/**
 * Using remote PAC script.
 */
ProxyManager.applyAutoPac = function (proxy) {
    if (proxy.data && proxy.data.configUrl) {
        ProxyConfig.pacScript.url = proxy.data.configUrl;
        //ProxyConfig.pacScript.data = proxy.data.pac; 
        ProxyConfig.mode = "pac_script";
        chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
        console.log("Proxy is autoPAC: applyAutoPac");
    } else {
        console.log("failed to apply AutoPac: no configUrl in proxy.data");
    }
};

/**
 * "Use proxy for all URLs" being set. It can be configured as PAC, a fixed server (http/socks)
 * or direct. TODO: add system and WPAD as options.
 */
ProxyManager.applyProxy = function (a) {
  console.log(a);
  if (a.proxyMode == ProxyManager.ProxyModes.auto) { // Auto = Pac Script URL
    ProxyConfig.mode = "pac_script";
    ProxyConfig.data = "";
    ProxyConfig.pacScript = a.proxyConfigUrl;
    console.log(ProxyConfig);
    chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
    console.log("Proxy is auto: applyProxy");
  } else if (a.proxyMode == ProxyManager.ProxyModes.manual) { // Manually set URL/HOST
    ProxyConfig.mode = "fixed_servers";
    if (a.proxySocks) {
      console.log("setting to SOCKS version " + a.socksVersion);
      ProxyConfig.rules.singleProxy.scheme = "socks" + a.socksVersion;
    }
    else  {
      console.log("setting to HTTP(S)");
      ProxyConfig.rules.singleProxy.scheme = "http";
    }
    ProxyConfig.rules.singleProxy.host = a.proxyHost;
    ProxyConfig.rules.singleProxy.port = parseInt(a.proxyPort);
    // WHY DOES THIS THROW AN EXCEPTION? ProxyConfig.rules.fallbackProxy = ProxyConfig.rules.singleProxy; // fallbackProxy is the same
    console.log(ProxyConfig);
    chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
    console.log("Proxy is manual: applyProxy");
  } else if (a.proxyMode == ProxyManager.ProxyModes.direct) { // profileFromProxy
    ProxyConfig.mode = "direct";
    console.log(ProxyConfig);
    chrome.proxy.settings.set({value: ProxyConfig, scope: 'regular'}, function() {});
    console.log("Proxy is direct: applyProxy");
  } else {
    console.log("Proxy is ... something else! INVALID STATE");
  }
};

/*
 13 May 2012 EHJ: does not appear to be used. Remove completely if confirmed

 ProxyManager.generateSocksPacScript = function (a) {
 var b = [];
 b.push("function regExpMatch(url, pattern) {");
 b.push("\ttry { return new RegExp(pattern).test(url); } catch(ex) { return false; }");
 b.push("}\r\n");
 b.push("function FindProxyForURL(url, host) {");
 b.push('return "SOCKS' + (a.socksVersion == "5" ? "5 " : " ") + a.proxySocks + '"');
 b.push("}");
 return b.join("\r\n")
 };
 */

/**
 * Used for "patterns" (a.k.a "auto") mode since chrome does not natively
 * support switching by URL like Gecko.
 */
ProxyManager.generatePacAutoScript = function () {
  var a = [],
      b = foxyProxy._proxyList;
  if (b && b.length) { 
      a.push("function FindProxyForURL(url, host) {");
      for (var c = 0, sz=b.length; c < sz; c++) {
        a.push(ProxyManager.proxyToScript(b[c]));
      }
      a.push("}");
      return a.join("\r\n");
  }
};



ProxyManager.template = "\
\
var patterns = [{patterns}], white = -1;\n\
for (var i=0, sz=patterns.length; i<sz; i++) {\n\
// ProxyPattern instances\n\
var p = patterns[i];\n\
if (p.enabled) {\n\
if (RegExp(p.regex).test(url)) {\n\
if (p.whitelist != \"Inclusive\") {\n\
// Black takes priority over white -- skip this pattern\n\
return \"DIRECT\";\n\
}\n\
else if (white == -1) {\n\
white = i; // store first matched index and continue checking for blacklist matches!\n\
}\n\
}\n\
}\n\
}\n\
if (white != -1) return {proxyStr};\n\
";

ProxyManager.proxyToScript = function (proxy) {
  var c = "", proxyStr;
  switch (proxy.data.type) {
  case "direct":
    proxyStr = '"DIRECT"';
    break;
  case "manual":
    if (!proxy.data.pac || proxy.data.pac.length == 0) {
      console.log("regular proxy manual used");
      proxyStr = '"' + (proxy.data.isSocks ? (proxy.data.socks == 5 ? "SOCKS5 " : "SOCKS ") : "PROXY ") + proxy.data.host + ":" + proxy.data.port + '"';
    } else {
      console.log("Manual mode set and using remote PAC");
      c += " function wrapper(url, host){ " + proxy.data.pac + " return FindProxyForURL(url, host); }", proxyStr = "wrapper(url, host)";
    }
    break;
  case "auto": // PAC
    if (!proxy.data.pac || proxy.data.pac.length == 0) {
      proxyStr = '"' + "PROXY badpac:6666" + '"';
    } 
    else {
      c += "function wrapper(url, host){ " + proxy.data.pac + " return FindProxyForURL(url, host); }", proxyStr = "wrapper(url, host)";
    }
    break;
  default:
    console.log("Error: unknown proxy.data.type");
    break;
  }

  if (proxy.data.id == "default") {
    c += "/* Default FoxyProxy PAC */\n";
    c += "return " + proxyStr + ";";
    return c;
  }

  // Non-default proxies
  // Handle patterns, if any
  if (proxy.data.patterns.length == 0) return "";
  c += ProxyManager.template.replace(/{patterns}|{proxyStr}/g, function(s) {
    switch(s) {
    case "{patterns}":
      var ret = "";
      // current punycode proxy
      var pp = null;
      // the original proxy
      var p = null;
      for (var k=0, sz=proxy.data.patterns.length; k<sz; k++) {
        proxy.data.patterns[k].data.regex = proxy.data.patterns[k].convertWildcardToRegexString();
        /* set name and hostnames to punycode to prevent following error:
         * Error during types.ChromeSetting.set: 
         * 'pacScript.data' supports only ASCII 
         * code(encode URLs in Punycode format). 
         */
        pp = {};
        p = proxy.data.patterns[k].data;
        // use new object to prevent punycoding the
        // real object (which appears in options page)
        pp.name = punycode.toASCII(p.name);
        pp.url = p.url;
        pp.regex = p.regex;
        pp.enabled = p.enabled;
        pp.temp = p.temp;
        pp.whitelist = p.whitelist;
        pp.type = p.type;
        ret += JSON.stringify(pp);
        if (k+1<sz) ret += ", ";
      }
      return ret;
    case "{proxyStr}":
      return proxyStr;
    }
  });

  // TODO: handle IP patterns
  return c;
};

ProxyManager.getPatternForUrl = function (url) {
  console.log("Looking for pattern");
  var b = {
    proxy: null,
    pattern: null
  };
  foxyProxy._proxyList.every( function (proxy) {
    proxy.data.enabled && proxy.data.patterns.every( function ( pattern) {
        console.log("testing pattern against " + url, pattern);
        if (pattern.data.enabled && pattern.test(url)) {
          if (pattern.data.whitelist != 'Inclusive') {
              b.proxy = null;
              b.pattern = null;
              return false;
          }
          b.proxy = proxy;
          b.pattern = pattern;
          console.log("found pattern", pattern);
          console.log("proxy for pattern is:", proxy.data.name);
      }
      return true;
    });
    return b.proxy == null;
  });
  if (b.proxy == null) {
    b.proxy = foxyProxy._proxyList[foxyProxy._proxyList.length - 1];
  }
  return b;
};
