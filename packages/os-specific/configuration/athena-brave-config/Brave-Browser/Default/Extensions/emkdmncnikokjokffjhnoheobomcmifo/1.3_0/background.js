"use strict";
let lifeline;

keepAlive();

/*Detection Firefox of Chromium-based browser*/
/*if (typeof browser === "undefined") {
  var browser = chrome;
}*/

/*Currently, better using directly "chrome" namespace and not "browser" since I see that keepAlive() does not work properly and Service Worker stops to load*/

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
  if (chrome.runtime.lastError) {
    console.log(`Error: ${chrome.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

/*
Called when the item has been removed.
We'll just log success here.
*/
function onRemoved() {
  console.log("Item removed successfully");
}

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

/*
Create all the context menu items.
*/

chrome.contextMenus.create({
  id: "tools-copy",
  //title: chrome.i18n.getMessage("menuItemToolsCopy"),
  title: "HacKontext",
  contexts: ["all"],
}, onCreated);

let id_menu =["tools-OSINT","tools-OSINT-crt","tools-OSINT-dig-any","tools-OSINT-openssl-cert","tools-OSINT-curl-sonar-all","tools-OSINT-curl-sonar-subdomain","tools-OSINT-curl-sonar-tlds","tools-OSINT-sublist3r","tools-OSINT-theHarvester","tools-OSINT-waybackurls","tools-OSINT-WHOIS","tools-Recon","tools-cURLheader","tools-copy-ffuf","tools-copy-nmap","tools-copy-sqlmap","tools-copy-wafw00f","tools-copy-wfuzz","tools-copy-whatweb","tools-copy-wpscan","tools-copy-xsstrike","tools-bruteforcing","tools-copy-cewl","tools-copy-hydra","tools-copy-timeverter"]
let parent_id_menu =["tools-copy","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-OSINT","tools-copy","tools-Recon","tools-Recon","tools-Recon","tools-Recon","tools-Recon","tools-Recon","tools-Recon","tools-Recon","tools-Recon","tools-copy","tools-bruteforcing","tools-bruteforcing","tools-bruteforcing"]
//let title_menu=["menuItemOSINTCopy","menuItemOSINTcrt","menuItemOSINTDiG","menuItemOSINTOpenSSL","menuItemOSINTSonarAllCopy","menuItemOSINTSonarSubdomainCopy","menuItemOSINTSonarTLDsCopy","menuItemOSINTsublist3r","menuItemOSINTtheHarvester","menuItemOSINTwaybackurls","menuItemOSINTWHOIS","menuItemRecon","menuItemcURLheader","menuItemFFUF","menuItemNmap","menuItemSQLMap","menuItemWafW00f","menuItemWfuzz","menuItemWhatWeb","menuItemXSStrike","menuItemBruteforcing","menuItemCEWL","menuItemHydra","menuItemTimeVerter"]
let title_menu=["OSINT","Copy as crt.sh","Copy as DNS any records","Copy as OpenSSL","Copy as Sonar All","Copy as Sonar Subdomains","Copy as Sonar TLDs","Copy as Sublist3r","Copy as theHarvester","Copy as waybackurls","Copy as WHOIS","Recon","Copy as cURL Header","Copy as FFUF","Copy as Nmap","Copy as SQLMap","Copy as WafW00f","Copy as Wfuzz","Copy as WhatWeb","Copy as WPScan","Copy as XSStrike","Bruteforcing","Copy as CEWL","Copy as Hydra","Copy as TimeVerter"]

for (let i = 0; i < id_menu.length; i++) {
  chrome.contextMenus.create({
    id: id_menu[i],
    parentId: parent_id_menu[i],
    //title: chrome.i18n.getMessage(title_menu[i]),
    title: title_menu[i],
    contexts: ["all"],
  }, onCreated);
}

const FILTER = {
  types: ['main_frame', 'sub_frame'],
  urls: ['<all_urls>'],
};

const TOOLS = {
  OSINT: id_menu[0],
  CRT: id_menu[1],
  DIG_ANY: id_menu[2],
  OPENSSL_CERT: id_menu[3],
  SONAR_ALL: id_menu[4],
  SONAR_SUBDOM: id_menu[5],
  SONAR_TLD: id_menu[6],
  SUBLIST3R: id_menu[7],
  THEHARVESTER: id_menu[8],
  WAYBACKURLS: id_menu[9],
  WHOIS: id_menu[10],
  RECON: id_menu[11],
  CURLHEADER: id_menu[12],
  FFUF: id_menu[13],
  NMAP: id_menu[14],
  SQLMAP: id_menu[15],
  WAFW00F: id_menu[16],
  WFUZZ: id_menu[17],
  WHATWEB: id_menu[18],
  WPSCAN: id_menu[19],
  XSSTRIKE: id_menu[20],
  BRUTEFORCING: id_menu[21],
  CEWL: id_menu[22],
  HYDRA: id_menu[23],
  TIMEVERTER: id_menu[24],
};

const tabData = {};
const getProp = (obj, key) => (obj[key] || (obj[key] = {}));
const encodeBody = body => {
  var data = '';
  // Read key
  for (var key in body.formData) { //body is a JSON object
    data += `${key}=${body.formData[key]}&`;
  }
  data = data.replace(/.$/,"");
  var body_data = `'${data}'`; //console.log(JSON.stringify(body.formData));
  return body_data;
}

chrome.webRequest.onBeforeSendHeaders.addListener(e => {
  getProp(getProp(tabData, e.tabId), e.frameId).headers = e.requestHeaders;
  chrome.storage.local.set({tabData: tabData}, function() {
    console.log('HTTP requestHeaders saved');
  });
}, FILTER, ['requestHeaders']);

chrome.webRequest.onBeforeRequest.addListener(e => {
  getProp(getProp(tabData, e.tabId), e.frameId).body = e.requestBody;
  chrome.storage.local.set({tabData: tabData}, function() {
    console.log('HTTP requestBody saved');
  });
}, FILTER, ['requestBody']);

chrome.tabs.onRemoved.addListener(tabId => delete tabData[tabId]);

chrome.tabs.onReplaced.addListener((addId, delId) => delete tabData[delId]);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  
  chrome.storage.local.get(["tabData"], function(items) {

    const url = `${info.frameUrl || tab.url}`;

    let domain = (new URL(url));
    const base_url = domain.hostname;
    const path_url = domain.pathname;
    const protocol_url = domain.protocol.replace(':','');
    let fqdn = base_url.replace('www.','');
    const data = tabData[tab.id]?.[info.frameId || 0] || {};

    /*OSINT Tools */
    if (info.menuItemId === TOOLS.CRT) {
      var req = `curl -s "https://crt.sh/?q=${fqdn}&output=json" | jq -r '.[] | "\\(.name_value)\\n\\(.common_name)"' | sort -u`;
    }

    if (info.menuItemId === TOOLS.DIG_ANY) {
      var req = `dig any ${fqdn} @8.8.8.8`;
    }

    if (info.menuItemId === TOOLS.OPENSSL_CERT) {
      var req = `openssl s_client -ign_eof 2>/dev/null <<<$'HEAD / HTTP/1.0\\r\\n\\r' -connect "${fqdn}:443" | openssl x509 -noout -text -in - | grep 'DNS' | sed -e 's|DNS:|\\n|g' -e 's|^\\*.*||g' | tr -d ',' | sort -u`;
    }

    if (info.menuItemId === TOOLS.SONAR_ALL) {
      var req = `curl -s https://sonar.omnisint.io/all/${fqdn}` + ` | jq -r '.[]' | sort -u`;
    }

    if (info.menuItemId === TOOLS.SONAR_SUBDOM) {
      var req = `curl -s https://sonar.omnisint.io/subdomains/${fqdn}` + ` | jq -r '.[]' | sort -u`;
    }

    if (info.menuItemId === TOOLS.SONAR_TLD) {
      var req = `curl -s https://sonar.omnisint.io/tlds/${fqdn}` + ` | jq -r '.[]' | sort -u`;
    }

    if (info.menuItemId === TOOLS.SUBLIST3R) {
      var req = `python sublist3r.py -d ${fqdn}`;
    }

    if (info.menuItemId === TOOLS.THEHARVESTER) {
      var req = `theHarvester -d "${fqdn}" -b all`;
    }

    if (info.menuItemId === TOOLS.WAYBACKURLS) {
      var req = `waybackurls -dates ${fqdn}`;
    }

    if (info.menuItemId === TOOLS.WHOIS) {
      var req = `whois ${fqdn}`;
    }

    if (info.menuItemId === TOOLS.CURLHEADER) {
      var req = `curl -I ${url}`;
    }

    if (info.menuItemId === TOOLS.FFUF) {
      var req = `ffuf -u ${url}` +
        (data.headers?.map(h => ` -H '${h.name}: ${h.value}'`).join('') || '') +
        (data.body ? ' -d ' + encodeBody(data.body) : '');
    }

    if (info.menuItemId === TOOLS.NMAP) {
      var req = `nmap ${base_url}`;
    }

    if (info.menuItemId === TOOLS.SQLMAP) {
      var req = `sqlmap -u ${url}` +
        (data.headers?.map(h => ` -H '${h.name}: ${h.value}'`).join('') || '') +
        (data.body ? ' --data ' + encodeBody(data.body) : '');
    }

    if (info.menuItemId === TOOLS.WAFW00F) {
      var req = `wafw00f -v ${url}`;
    }

    if (info.menuItemId === TOOLS.WFUZZ) {
      var req = `wfuzz -u ${url}` +
        (data.headers?.map(h => ` -H '${h.name}: ${h.value}'`).join('') || '') +
        (data.body ? ' -d ' + encodeBody(data.body) : '');
    }

    if (info.menuItemId === TOOLS.WHATWEB) {
      var req = `whatweb ${url} -v`;
    }

    if (info.menuItemId === TOOLS.WPSCAN) {
      var req = `wpscan --url ${url}` +
        (data.headers?.map(h => ` --headers '${h.name}: ${h.value}'`).join('') || '');
    }

    if (info.menuItemId === TOOLS.XSSTRIKE) {
      var req = `python xsstrike.py -u ${url}` + (data.headers? ` --headers "` : '') +
      (data.headers?.map(h => `${h.name}: ${h.value}\n`).join('').replace(/\n$/,'') || '') + (data.headers?`"` : '') +
      (data.body ? ' --data ' + encodeBody(data.body) : '');
    }

    if (info.menuItemId === TOOLS.CEWL) {
      var req = `cewl ${url} -a -e --with-numbers`;
    }

    if (info.menuItemId === TOOLS.HYDRA) {
      var req = `hydra ${base_url} ${protocol_url}-[complete-here] ${path_url}`;
    }

    if (info.menuItemId === TOOLS.TIMEVERTER) {
      var req = `python timeverter.py -u ${url}` +
        (data.headers?.map(h => ` -H '${h.name}: ${h.value}'`).join('') || '') +
        (data.body ? ' -d ' + encodeBody(data.body) : '');
    }
    
    chrome.tabs.sendMessage(tab.id, 
      {
          message: "copyText",
          textToCopy: req
      }, function(response) {})
  });

  
});