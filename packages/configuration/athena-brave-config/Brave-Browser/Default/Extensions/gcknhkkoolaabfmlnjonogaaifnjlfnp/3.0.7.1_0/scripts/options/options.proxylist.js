var selectedProxy =  -1;
var oTable;
var list = null;
var bg = null;
var isProxyTableInitialized = false;


// listen for proxyList message from extension
chrome.runtime.onMessage.addListener(function( request, sender, sendResponse) {
    if (request.proxyList && request.proxyList.length > 0) {

        list = request.proxyList.map( function (p){ return new Proxy(p);} );
        
        var proxyModeCombo = $('#proxyModeGlobal');
        proxyModeCombo.empty();
        
        if ('Basic' !== foxyProxy.getFoxyProxyEdition()) {
            $('<option value="auto">' + chrome.i18n.getMessage("mode_patterns_label") + '</option>').appendTo(proxyModeCombo);
        }
        
        $.each(list, function(i, proxy){
            if(proxy.data.enabled ){
                var option = $("<option value='"+proxy.data.id+"'>"+chrome.i18n.getMessage("mode_custom_label", proxy.data.name )+"</option>")
                    .appendTo(proxyModeCombo);
            }
        });
        
        
        $('<option value="disabled">Disable FoxyProxy</option>').appendTo(proxyModeCombo);
        $("option[value='"+bg.foxyProxy.state+"']",proxyModeCombo).attr("selected", "selected");

        if (isProxyTableInitialized) {
            updateProxyTable();
        } else {
            initProxyList();
        }
    }
});

chrome.runtime.getBackgroundPage(function( bgPage) {
    bg = bgPage;
    var foxyProxy = bg.foxyProxy;
    
    foxyProxy.getProxyList();
});


function saveProxies(list){

    bg.foxyProxy.updateSettings({ "proxyList": list }, "options", function( items) {
        //console.log("saveProxies(list got callback");
        //console.log(items);
        if (items.proxyList) {
            list = items.proxyList;
        }
        
        bg.foxyProxy.applyState();
        
        onTabShow("");
        
    });
    
    //bg.foxyProxy.state = bg.foxyProxy.state;
    
    chrome.runtime.sendMessage({ trackEvent: {
        "category": "Proxies",
        "action": "save"
    }});
}

var initProxyList = function initProxyList() {
    console.log("initProxyList");
        
    $(".listManupualtionButtons > button").css('width', '150px');
    $("button").button().css({"text-align": "left"});
    oTable = $('#proxyList').dataTable( {
    "bPaginate": false,
    "bLengthChange": false,
    "bFilter": false,
    "bSort": false,
    "bInfo": false,
    "bAutoWidth": false,
    "bUseRendered": false,
    "aaData": list,
    "oLanguage": {
        "sZeroRecords": ""
    },
    "aoColumns": [
        {"bVisible": false},
        {"sTitle": chrome.i18n.getMessage( "Enabled"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='styles/images/bullet_tick.png'>":"";}},
        {"sTitle": chrome.i18n.getMessage( "Color"), "bUseRendered":false, "fnRender": function(obj) { var c = obj.aData[ obj.iDataColumn ]; return "<span class='colorbox' style='background-color: "+c+"'></span>";}},
        
        {"sTitle": chrome.i18n.getMessage( "proxy_name") },
        {"sTitle": chrome.i18n.getMessage( "proxy_notes") },
        {"sTitle": chrome.i18n.getMessage( "Host_or_IP_Address") },
        {"sTitle": chrome.i18n.getMessage( "port")},
        {"sTitle": chrome.i18n.getMessage( "is_SOCKS_proxy"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='styles/images/bullet_tick.png'>":"";}},
        {"sTitle": chrome.i18n.getMessage( "SOCKS_Version")},

             // Will need to remove and reintroduce columns when functionality is working.
        {"sTitle": chrome.i18n.getMessage( "Auto_PAC_URL")},
/*      {"sTitle": chrome.i18n.getMessage( "Proxy_DNS")}
*/
    ]
    } );
    

    
    $("#proxyList tbody tr").live('click', function () {
        oTable.fnSelect(this);
        toggleselectedProxy();
    } ).first().click();
    $("#proxyList tbody tr").live('dblclick', function (e) {
        e.preventDefault();
        e.stopPropagation();
        oTable.fnSelect(this);
        toggleselectedProxy();
        editProxy();
        return false;
    });
    
    isProxyTableInitialized = true;
    $("#pageProxies").show();
};

function toggleselectedProxy(){
    selectedProxy = oTable.fnGetSelectedPosition();
    if(selectedProxy === null) {
        $("#proxylistMoveUp").button( "option", "disabled", "disabled");
        $("#proxylistMoveDown").button( "option", "disabled", "disabled");
        $("#proxylistDelete, #proxylistCopy, #proxylistEdit").button( "option", "disabled", "disabled");
    }
    else {
        $("#proxylistMoveUp").button( "option", "disabled", (selectedProxy===0) || (selectedProxy==list.length-1));
        $("#proxylistMoveDown").button( "option", "disabled",  (selectedProxy==list.length-2) || (selectedProxy==list.length-1));
        $("#proxylistDelete, #proxylistCopy").button( "option", "disabled",  (selectedProxy==list.length-1));
        $('#proxylistEdit').button( "option", "disabled", "");
    }
    

}

function addNewProxy(aUri){
    var proxy = null;
    if (aUri){
        if(aUri.domain && aUri.port){
            proxy = new Proxy({
            host: aUri.domain,
            port: aUri.port
            });
        } else {
            alert(chrome.i18n.getMessage("error_host_port_cannot_be_determined"));
            return;
        }
    } else {
        proxy = new Proxy();
    }
    list.splice(list.length-1, 0, proxy);
    selectedProxy = list.length-2;
    proxyLoad(proxy);
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Proxies",
    //     "action": "add"
    // }});
}

function editProxy(){
    selectedProxy = oTable.fnGetSelectedPosition();
    proxyLoad(list[selectedProxy],true);
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Proxies",
    //     "action": "edit"
    // }});
}

function updateProxyTable(selected) {
    oTable.fnClearTable();
    if(list && list.length)
        oTable.fnAddData(list);
    if(typeof selected != 'undefined')
        oTable.fnSelectRow(selected);
    toggleselectedProxy();
}

function deleteSelectedProxy() {
    selectedProxy = oTable.fnGetSelectedPosition();
    deleteProxy(selectedProxy);
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Proxies",
    //     "action": "delete"
    // }});
}

function deleteDefaultProxy() {
  var i;
  for (i = list.length - 1; i >= 0; i--) {
    if (list[i].data.name == "Default") {
      // deleting default proxy which is located by making a special
      // call to deleteProxy.
      deleteProxy(i, true);
    }
  }
}

function deleteProxy(index, deleteDefault) {
  deleteDefault = deleteDefault || false;
  if(!list[index].data.readonly || 
     (list[index].data.readonly && deleteDefault)) {
    list.splice(index, 1);
    
    if(list.length<=1) {
      chrome.extension.getBackgroundPage().foxyProxy._settings.enabledQA=false;
    }
    
    saveProxies(list);
    updateProxyTable();

    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Proxies",
    //     "action": "delete",
    //     "value": deleteDefault ? "default": ""
    // }});
  }
}

function copySelectedProxy() {
    selectedProxy = oTable.fnGetSelectedPosition();
    if(typeof selectedProxy=='number' && selectedProxy>=0 && !list[selectedProxy].data.readonly){
        list.splice(selectedProxy, 0, new Proxy(list[selectedProxy], true));
        saveProxies(list);
        updateProxyTable(selectedProxy);
        
        // chrome.runtime.sendMessage({ trackEvent: {
        //     "category": "Proxies",
        //     "action": "copy"
        // }});
    }
}

function moveSelectedProxyUp(){
    selectedProxy = oTable.fnGetSelectedPosition();
    if(selectedProxy >0){
        var buf = list[selectedProxy-1];
        list[selectedProxy-1] = list[selectedProxy];
        list[selectedProxy] = buf;
        saveProxies(list);
        updateProxyTable(selectedProxy-1);
    }
}

function moveSelectedProxyDown(){
    selectedProxy = oTable.fnGetSelectedPosition();
    if(selectedProxy < list.length-1){
        var buf = list[selectedProxy+1];
        list[selectedProxy+1] = list[selectedProxy];
        list[selectedProxy] = buf;
        saveProxies(list);
        updateProxyTable(selectedProxy+1);
    }
}

/**
 * Default is always at the bottom currently, but issues can arise if
 * it is not (e.g.: if there is a bug in the code) So it is safe to
 * have a function that ensures it is at the bottom for later
 * use. Especially with import, which should place all proxies at the
 * bottom (arr[0]) and the default at the top, but this function may
 * still be useful in case of failure.
 */
var placeDefaultToBottom = function () {
  // place default at the bottom of the proxy list.
  
  var i = 0;
  var le = list.length;
  var defaultProxy;
  if (list[le-1].data.name != 'Default') {
    // default should always be at the bottom.
    for (; i < le; i++) {
      if (list[i].data.name == 'Default') {
        defaultProxy = list.splice(i, 1);
        list.push(defaultProxy.pop());
        return;
      }
    }
  }
};