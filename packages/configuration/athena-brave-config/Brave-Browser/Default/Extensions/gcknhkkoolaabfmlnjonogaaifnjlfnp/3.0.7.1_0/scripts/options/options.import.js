// see: http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-support
// and: http://www.html5rocks.com/en/tutorials/file/xhr2/

var checkBoolean = function (str, defaultNum) {
    if (str == "true") {
        return true;
    }
    
    return defaultNum;

};

var checkNumeric = function (str) {
    if ($.isNumeric(str)) {
        return str;
    }
    return 0;
};

var checkValidType = function (str) {
    if (str === "direct" ||
        str === "manual" ||
        str === "auto") {
        return str;
    }
    return "direct";
};

var importPatterns = function (xmlProxy, proxy, xmlDoc) {
    try {
        console.log("trying import patterns for", proxy.data.name);
        var xmlPatterns = xmlProxy.getElementsByTagName("matches")[0].getElementsByTagName("match");
        var i = 0, length = xmlPatterns.length, pattern;
        
        var patterns = [];

        for (; i < length; i++) {
            pattern =  new ProxyPattern();
            pattern.data.enabled = checkBoolean(xmlPatterns[i].getAttribute("enabled"), false);
            pattern.data.temp = false;
            pattern.data.name = xmlPatterns[i].getAttribute("name");
            pattern.data.url = xmlPatterns[i].getAttribute("pattern");
            console.log("isRegexp for ", pattern.data.name, "is", xmlPatterns[i].getAttribute("isRegEx"));
            pattern.data.type = (xmlPatterns[i].getAttribute("isRegEx") == "true") ? "regexp" : "wildcard";
            pattern.data.whitelist = (xmlPatterns[i].getAttribute("isBlackList") == "true") ? "Exclusive" : "Inclusive";
            patterns.push(pattern);
        }
        proxy.data.patterns = patterns;
    } catch (e) {
        // no parsable pattern... just forget about it.
        return;
    }

};


var importProxies = function (xmlDoc) {
    var proxy, elem, patterns;
    var i = 0;
    var proxies = xmlDoc.getElementsByTagName("proxies")[0].getElementsByTagName("proxy");

  for (; i < proxies.length; i++) {
    
    /* rebuild a proxy from xml element */
    proxy = new Proxy();

    proxy.data.type = checkValidType(proxies[i].getAttribute("mode"));
    proxy.data.name = proxies[i].getAttribute("name");
    proxy.data.notes = proxies[i].getAttribute("notes");

    // removed && proxy.data.type != 'direct' to fix issue with folks
    // creating a direct connection proxy with patterns. But only checking
    // the proxy.data.name is less than ideal. In the same time, the default "id"
    // is 1714905950 Firefox-centric.


    proxy.data.enabled = checkBoolean(proxies[i].getAttribute("enabled"));
    proxy.data.cycle = checkBoolean(proxies[i].getAttribute("includeInCycle"));
    proxy.data.useDns = checkBoolean(proxies[i].getAttribute("proxyDNS"));
    proxy.data.color = proxies[i].getAttribute("color");
    if (proxies[i].getElementsByTagName('manualconf')[0] != undefined) {
      elem = proxies[i].getElementsByTagName('manualconf')[0];
      proxy.data.isSocks = checkBoolean(elem.getAttribute("isSocks"));
      proxy.data.socks = checkNumeric(elem.getAttribute("socksversion"), 5);
      proxy.data.host = elem.getAttribute("host");
      proxy.data.port = checkNumeric(elem.getAttribute("port"), 0);
    } else {
      proxy.data.isSocks = false;
      proxy.data.socks = 5;
    }
    
    proxy.data.notifOnLoad = true;
    proxy.data.notifOnError = true;

    if (proxies[i].getElementsByTagName('autoconf')[0] != undefined) {
      elem = proxies[i].getElementsByTagName('autoconf')[0];
      proxy.data.reloadPAC = checkBoolean(elem.getAttribute('autoReload'));
      proxy.data.configUrl = elem.getAttribute("url");
    } else {
      proxy.data.reloadPAC = false;
    }

    /* handle patterns */
    importPatterns(proxies[i], proxy, xmlDoc);

    if (proxy.data.name == "Default") {
      // let's replace the currently default proxy with the one from the
      // import file. Certain users actually change the default from being direct
      // to going through a proxy.
      deleteDefaultProxy();
      // make this the new default.
      proxy.data.id = "default";
      proxy.data.readonly = true; // prevent future removal.

      
      // default should always be at the bottom,
      // since other proxies are added to the top,
      // but running placeDefaultToBottom at the end to
      // make sure (making it foolproof from add/replace logic)
      list.push(proxy);

      // use splice below to test placeDefaultToBottom() at the end of 
      // this function.
      // list.splice(0, 0, proxy);
      

   } 
    else {
      list.splice(0, 0, proxy);
    }
  }
  // Default should always be at the bottom.
  // This should almost never happen except with
  // funky imports.
  placeDefaultToBottom();
};


window.onload = function () {
  window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

  var fileInput = document.querySelector("#settings-import");
  var file;

  fileInput.onchange = function(e){
    file = e.target.files[0];
    var reader = new FileReader();      
    reader.onload = function (event) {
      try {
        var xmlDoc = $.parseXML(event.target.result);
        
        var addProxies = function () {
          try {
            importProxies(xmlDoc);
            updateProxyTable();
            saveProxies(list);
          } catch (e) {
            console.log("error importing", e);
          }
        };

        var replaceProxies = function () {
          // remove all existing proxies!
          var i;
          if (list && list.length) {
              for (i = list.length - 1; i >= 0; i--) {
                if (list[i].data.name != "Default") {
                  deleteProxy(i);
                }
              }
          }
          updateProxyTable();
          saveProxies(list);
          addProxies();
        };


        $("#import-dialog").dialog({resizable: false,
                                    height:200,
                                    modal:true,
                                    buttons: {
                                      "Replace": function () { replaceProxies(); $(this).dialog('close'); }, 
                                      "Add": function () { addProxies(); $(this).dialog('close'); },
                                      "Nevermind": function () { /* Do nothing */ $(this).dialog('close'); }
                                    }
                                    
                                   });

        $("#import-result").text(chrome.i18n.getMessage("import_success"));
      } catch (e) {
        $("#import-result").text(chrome.i18n.getMessage("import_error"));
      }
    };      
    reader.readAsText(file);
  };
  
  // chrome.runtime.sendMessage({ trackEvent: {
  //     "category": "Options",
  //     "action": "import"
  // }});
};