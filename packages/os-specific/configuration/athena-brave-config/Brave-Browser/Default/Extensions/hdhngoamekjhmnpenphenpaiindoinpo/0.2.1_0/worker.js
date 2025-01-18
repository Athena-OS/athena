'use strict';

// context menu
{
  const once = () => {
    chrome.contextMenus.create({
      id: 'search',
      title: 'Search Cookies by Domain',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'open',
      title: 'Open Cookie Editor in new Tab',
      contexts: ['action']
    });
    chrome.contextMenus.create({
      id: 'separator',
      contexts: ['action'],
      type: 'separator'
    });
    chrome.contextMenus.create({
      id: 'import',
      title: 'Import Cookies',
      contexts: ['action']
    });
  };
  chrome.runtime.onStartup.addListener(once);
  chrome.runtime.onInstalled.addListener(once);
}
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'search') {
    chrome.tabs.create({
      url: '/data/popup/index.html?search=true'
    });
  }
  else if (info.menuItemId === 'open') {
    chrome.tabs.create({
      url: '/data/popup/index.html?tabId=' + encodeURIComponent(tab.id)
    });
  }
  else if (info.menuItemId === 'import') {
    chrome.tabs.create({
      url: '/data/options/index.html'
    });
  }
});

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
