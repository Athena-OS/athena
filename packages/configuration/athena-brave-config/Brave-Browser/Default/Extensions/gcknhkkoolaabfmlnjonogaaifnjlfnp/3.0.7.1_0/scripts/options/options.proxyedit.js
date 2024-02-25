var oPatternTable = null;
//var oIpPatternTable = null;
var sProxyColor = null;
var selectedPattern = -1;

(function($)  {
    $.fn.extend({
    setChecked : function(state)  {
        if (state)
        return this.filter(":radio, :checkbox").attr("checked", true);
        else 
        return this.filter(":radio, :checkbox").removeAttr("checked");
    }
    });
    
}(jQuery));

function proxyLoad(proxy, edit){
    
    //console.log(proxy.data);
    
    $("input[name='proxyType'][value='"+proxy.data.type+"']").setChecked(true).click();
    
    $("#proxyHost").val(proxy.data.host);
    $("#proxyPort").val(proxy.data.port);
    $("#proxyIsSocks").setChecked(proxy.data.isSocks);
    $("input[name='proxySocks'][value='"+proxy.data.socks+"']").setChecked(true);
    

    
    $("#proxyEnabled").setChecked(proxy.data.enabled).prop('disabled', proxy.data.readonly ? true: false);
    $("#proxyName").val(proxy.data.name).prop('disabled', proxy.data.readonly ? true: false);
    $("#proxyNotes").val(proxy.data.notes.replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm')).prop('disabled', proxy.data.readonly ? true: false);
    $("#proxyCycle").setChecked(proxy.data.cycle);//.attr('disabled', proxy.data.readonly);
    $("#proxyDNS").setChecked(proxy.data.useDns);//.attr('disabled', proxy.data.readonly);      
    
     $("#proxyConfigUrl").val(proxy.data.configUrl).prop('disabled', proxy.data.readonly ? true: false);
     $("#proxyNotifLoad").setChecked(proxy.data.notifOnLoad).prop('disabled', proxy.data.readonly ? true: false);
     $("#proxyNotifError").setChecked(proxy.data.notifOnError).prop('disabled', proxy.data.readonly ? true: false);
     $("#proxyPACReload").setChecked(proxy.data.reloadPAC).prop('disabled', proxy.data.readonly ? true: false);
    /*$("#bypassFPForPAC").setChecked(proxy.data.bypassFPForPAC).prop('disabled', proxy.data.readonly ? true: false);*/
     $("#proxyPACInterval").val(proxy.data.reloadPACInterval).prop('disabled', proxy.data.readonly ? true: false);
     
    $("#proxyPatterns * input[type='button']");//.button("option", "disabled", proxy.data.readonly);
    $("#configUrlPanel input[type='button']");//.button("option", "disabled", proxy.data.readonly);
    $("#proxyLogin").val(list[selectedProxy].data.login);
    $("#proxyPass").val(list[selectedProxy].data.pass);
    
    $("input[name='proxyType']:checked").click();
    
    sProxyColor = proxy.data.color;
    $('#proxyColor').ColorPickerSetColor(sProxyColor);//.prop('disabled', proxy.data.readonly ? true: false);
    $('#proxyColor div').css('backgroundColor',sProxyColor);
    
    if ('Basic' != foxyProxy.getFoxyProxyEdition()) {
        oPatternTable.fnClearTable();
        //oIpPatternTable.fnClearTable();
        if(proxy.data.patterns && proxy.data.patterns.length) {
            oPatternTable.fnAddData(proxy.data.patterns);
        }
        //if(proxy.data.ipPatterns && proxy.data.ipPatterns.length)
        //oIpPatternTable.fnAddData(proxy.data.ipPatterns);
        if(proxy.data.readonly && ( $("#tabs").tabs('option', 'selected') == 2 || $("#tabs").tabs('option', 'selected') == 3 ) ){
            $("#tabs").tabs( "select" , 1 );
        }
        $("#proxyPatternsLink").css("display", proxy.data.readonly?"none":"block");
        $("#proxyIpPatternsLink").css("display", proxy.data.readonly?"none":"block");
    } else {
        // we are basic edition, hide URL patterns tab
        $("#proxyPatternsLink").hide();
    }
        
    if (proxy.data.credentials) {
        console.log("proxyLoad getting credentials for proxy: " + proxy.data.name);
        var crds = foxyProxy.getCredentials(proxy);
        $("input[name='username']").val(crds.username);
        $("input[name='password']").val(crds.password);
        $("input[name='passwordConfirm']").val(crds.password);
        $("#authBox").css("opacity",1);
        //$("#testAuth").css("opacity", 1);
        $("#authCheck").setChecked(true);        
    } else {
        $("input[name='username']").val("");
        $("input[name='password']").val("");
        $("input[name='passwordConfirm']").val("");
        $("#authBox").css("opacity",0.3);
        //$("#testAuth").css("opacity", 0.3);
        $("#authCheck").setChecked(false);
    }
    
    $("#authCheck").on("change", function() {
        if (!foxyProxy._settings.noAuthWarn) {
            $("#hint_auth_1").text(chrome.i18n.getMessage("hint_auth_1"));
            $("#hint_auth_2").text(chrome.i18n.getMessage("hint_auth_2"));
            $("#hint_auth_3").text(chrome.i18n.getMessage("hint_auth_3"));
            
            $("#authWarningDlg").dialog({
                modal: true,
                width: "500px",
                resizable: false,
                buttons: [
                    {
                        text: "OK",
                        click: function() {
                            if ($("input[name='noAuthWarn']").is(":checked")) {
                                foxyProxy._settings.noAuthWarn = true;
                                foxyProxy.updateSettings({ "settings": foxyProxy._settings });
                            }
                            
                            $("#authBox").css("opacity",1);
                            //$("#testAuth").css("opacity", 1);
                            
                            $("#authCheck").setChecked(true);
                            
                            $( this ).dialog( "close" );
                        }
                    },
                    {
                        text: "Cancel",
                        click: function() {
                            $( this ).dialog( "close" );
                        }
                    }
                ]
            });
        } else if ($(this).is(":checked")) {
            $("#authBox").css("opacity",1);
            //$("#testAuth").css("opacity", 1);
            
            $("#authCheck").setChecked(true);
            
            $( this ).dialog( "close" );
        } else {
            $("#authBox").css("opacity",0.3);
            //$("#testAuth").css("opacity", 0.3);
        }

    });
    
    
    $("#proxyEditDlg").dialog({
        title: chrome.i18n.getMessage("FoxyProxy") + " - " + chrome.i18n.getMessage("proxy_settings"),
        modal: true,
        width:"800px",
        //      height: 460,
        resizable: false,
        close: function( evt) {
            if(!edit)
                deleteProxy(selectedProxy);
            else
                updateProxyTable();
        },
        buttons: [
            {
                text: chrome.i18n.getMessage("Save"),
                click: function() {
                    var regexp, mode, index, found, name;
                    if ($("input[name='proxyType']:checked").val() == 'manual' && ($("#proxyHost").val()=='' || $("#proxyPort").val()=='')) {
                        alert(chrome.i18n.getMessage("error_no_hostname_or_ip"));
                        return;
                    }
                    if ($("input[name='proxyType']:checked").val() == 'auto' && !RegExp('^\\d*$').test($("#proxyPACInterval").val())) {
                        alert(chrome.i18n.getMessage("error_non_integer_interval"));
                        return;
                    }
                    if ($("input[name='proxyType']:checked").val()=="auto") {
                        regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
                
                        if (!regexp.test($("#proxyConfigUrl").val())){
                            alert(chrome.i18n.getMessage("error_invalid_proxy_config_url"));
                            return;
                        }
            
                    }
            
                    if($("#proxyName").val() == ''){
                        mode = $("input[name='proxyType']:checked").val();
                        if(mode == 'manual') {
                            $("#proxyName").val($("#proxyHost").val() +":"+$("#proxyPort").val());
                        }
                        else {
                
                            index = 0;
                            found = true;
                            while(found) {
                                index++;
                                name = "New Proxy";
                                if(index>1)name+=" ("+index+")";
                                found = false;
                                for( var i in list) {
                                    if(list[i].data.name == name) {
                                        found = true;
                                        break;                                              
                                    }
                                }
                                if(!found)$("#proxyName").val(name);
                    
                            }
                        }
                    }
                
                    list[selectedProxy].data.enabled = $("#proxyEnabled").is(":checked");
                    list[selectedProxy].data.cycle = $("#proxyCycle").is(":checked");
                    list[selectedProxy].data.useDns = $("#proxyDNS").is(":checked");
                    list[selectedProxy].data.isSocks = $("#proxyIsSocks").is(":checked");
            
                    list[selectedProxy].data.notifOnLoad = $("#proxyNotifLoad").is(":checked");
                    list[selectedProxy].data.notifOnError = $("#proxyNotifError").is(":checked");
                    list[selectedProxy].data.reloadPAC = $("#proxyPACReload").is(":checked");
                    //list[selectedProxy].data.bypassFPForPAC = $("#bypassFPForPAC").is(":checked");
                         
                    list[selectedProxy].data.name = $("#proxyName").val().replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm');
                    list[selectedProxy].data.notes = $("#proxyNotes").val().replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm');
                    list[selectedProxy].data.type = $("input[name='proxyType']:checked").val();
                    list[selectedProxy].data.socks = $("input[name='proxySocks']:checked").val();
                    list[selectedProxy].data.host = $("#proxyHost").val();
                    list[selectedProxy].data.port = $("#proxyPort").val();
                        
                    list[selectedProxy].data.configUrl = $("#proxyConfigUrl").val();
                    list[selectedProxy].data.reloadPACInterval = $("#proxyPACInterval").val();
                         
                    list[selectedProxy].data.color = sProxyColor;
            

                    if ( $("input[name='password']").val() == $("input[name='passwordConfirm']").val() ) {
                        foxyProxy.setCredentials(list[selectedProxy], $("input[name='username']").val(), $("input[name='password']").val());
                    } else {
                        alert('Passwords do not match.'); //FIXME - i18n
                        return false;
                    }
            
                    if($("input[name='proxyType']:checked").val()=="auto")
                    {
                        list[selectedProxy].updatePAC();
                    }
            
                    //updateProxyTable();
                    //oTable.fnSelectRow(selectedProxy);
                    saveProxies(list);
                    edit = true; // set edit flag so that close event handler doesn't delete new proxy

                    $( this ).dialog( "close" );
                }
            },
            {
                text: chrome.i18n.getMessage("Cancel"),
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });
}

$(document).ready(function(){
    $("#tabs").tabs({ selected:1});
    $("input[type='button']").button();
    oPatternTable = $("#patternList").dataTable( {
    "bPaginate": false,
    "bLengthChange": false,
    "bFilter": false,
    "bSort": false,
    "bInfo": false,
    "bAutoWidth": false,
    "bUseRendered": false,
    "aaData": [],
    "oLanguage": {
        "sZeroRecords": ""
    },
    "aoColumns": [
        { "sTitle": chrome.i18n.getMessage("enabled"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='styles/images/bullet_tick.png'>":"";}},
        { "sTitle": chrome.i18n.getMessage("pattern_name")},
        { "sTitle": chrome.i18n.getMessage("url_pattern")},
        { "sTitle": chrome.i18n.getMessage("pattern_type")},
        { "sTitle": chrome.i18n.getMessage("Whitelist_or_Blacklist")},
        //{ "sTitle": chrome.i18n.getMessage("Case sensitive"},
        { "sTitle": chrome.i18n.getMessage("temporary"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='styles/images/bullet_tick.png'>":"";}}
    ]
    } );
    /*oIpPatternTable = $("#ipPatternList").dataTable( {
     "bPaginate": false,
     "bLengthChange": false,
     "bFilter": false,
     "bSort": false,
     "bInfo": false,
     "bAutoWidth": false,
     "bUseRendered": false,
     "aaData": [],
     "oLanguage": {
     "sZeroRecords": ""
     },
     "aoColumns": [
     { "sTitle": chrome.i18n.getMessage("Enabled"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='styles/images/bullet_tick.png'>":"";}},
     { "sTitle": chrome.i18n.getMessage("Pattern Name")},
     { "sTitle": chrome.i18n.getMessage("Local IP address pattern")},
     { "sTitle": chrome.i18n.getMessage("Pattern Type")},
     { "sTitle": chrome.i18n.getMessage("Whitelist (Inclusive) or Blacklist (Exclusive)")},
     { "sTitle": chrome.i18n.getMessage("Temporary"), "bUseRendered":false, "fnRender": function(obj) { return (obj.aData[ obj.iDataColumn ])?"<img src='styles/images/bullet_tick.png'>":"";}}
     ]
     } );*/
    
    $("#patternList tbody tr").live('click', function () {
    oPatternTable.fnSelect(this);
    } );
    $("#patternList tbody tr").live('dblclick', function (e) {
        e.preventDefault();
        e.stopPropagation();
        oPatternTable.fnSelect(this);
        editPattern();
        return false;
    });
    /*$("#ipPatternList tbody tr").live('click', function () {
     oIpPatternTable.fnSelect(this);
     } );*/
    $('#proxyColor').ColorPicker({
    color: "#000",
    onShow: function (colpkr) {
        $(colpkr).fadeIn(500);
        return false;
    },
    onHide: function (colpkr) {
        $(colpkr).fadeOut(500);
        return false;
    },
    onChange: function (hsb, hex, rgb) {
        sProxyColor = '#' + hex;
        $('#proxyColor div').css('backgroundColor',sProxyColor);
    }
    }).children("div").css({'background-color':'#000'});            
});

function addNewPattern(){
    list[selectedProxy].data.patterns.push(new ProxyPattern());
    selectedPattern = list[selectedProxy].data.patterns.length-1;
    patternLoad(list[selectedProxy].data.patterns[selectedPattern]);
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Patterns",
    //     "action": "add"
    // }});
}

function editPattern(){
    selectedPattern = oPatternTable.fnGetSelectedPosition();
    patternLoad(list[selectedProxy].data.patterns[selectedPattern], true);
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Patterns",
    //     "action": "edit"
    // }});
}

function updatePatternTable(selected){
    oPatternTable.fnClearTable();
    if(list[selectedProxy].data.patterns && list[selectedProxy].data.patterns.length)
    oPatternTable.fnAddData(list[selectedProxy].data.patterns);
    if(typeof selected != 'undefined')
    oPatternTable.fnSelectRow(selected);        
}

function deleteSelectedPattern(){
    selectedPattern = oPatternTable.fnGetSelectedPosition();
    if(selectedPattern === null)return;
    list[selectedProxy].data.patterns.splice(selectedPattern, 1);
    updatePatternTable();
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Patterns",
    //     "action": "delete"
    // }});
}       
function copySelectedPattern(){
    console.log(selectedPattern);
    selectedPattern = oPatternTable.fnGetSelectedPosition();
    console.log(selectedPattern);
    if(typeof selectedPattern=='number' && selectedPattern>=0){
    list[selectedProxy].data.patterns.splice(selectedPattern, 0, new ProxyPattern(list[selectedProxy].data.patterns[selectedPattern]));
    updatePatternTable(selectedPattern);
    }
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Patterns",
    //     "action": "copy"
    // }});
}

function openPacViewDlg(){
    if($("#proxyConfigUrl").val()){
    $.ajax({
        url: $("#proxyConfigUrl").val(),
            cache: false,
            error: function(xhr, textStatus, httpError) {
        alert(chrome.i18n.getMessage("PAC_file_error") + ": " + textStatus + " " + (httpError ? httpError : "")); // httpError can be null
            },
        success: function(data){
        console.log(data);
        $("#pacViewDlgText").val(data);
        $("#pacViewDlg").dialog({
            width: '520px',
            title: chrome.i18n.getMessage("appName") + " - " + chrome.i18n.getMessage("PAC_View"),
            modal: true
        });
        }
    });
    }

}

function testPac() {
    if($("#proxyConfigUrl").val()){
    $.ajax({
        url: $("#proxyConfigUrl").val() + "?rnd=" + Math.random(),
        cache: false,
        error: function(xhr, textStatus, httpError) {
        alert(chrome.i18n.getMessage("PAC_file_error") + ": " + textStatus + " " + (httpError ? httpError : "")); // httpError can be null
        },
        success: function(data){
                var iframe = document.getElementById("testPacFrame");
                var message = {
                    command: 'test',
                    script: data
                };
                iframe.contentWindow.postMessage(message, '*');
        }
    });

    }

}

/* Add window listener for testPac function */
window.addEventListener('message', function (event) {
    if (event.data) {
        alert(event.data.name);
    }
});

/*      
 function addNewIpPattern() {
 list[selectedProxy].data.ipPatterns.push(new ProxyPattern());
 selectedIpPattern = list[selectedProxy].data.ipPatterns.length - 1;
 console.log(list[selectedProxy].data.ipPatterns);
 ipPatternLoad(list[selectedProxy].data.ipPatterns[selectedIpPattern]);
 }

 function editIpPattern() {
 selectedIpPattern = oIpPatternTable.fnGetSelectedPosition();
 ipPatternLoad(list[selectedProxy].data.ipPatterns[selectedIpPattern], true);
 }
 
 function updateIpPatternTable(selected){
 oIpPatternTable.fnClearTable();                
 if(list[selectedProxy].data.ipPatterns && list[selectedProxy].data.ipPatterns.length)
 oIpPatternTable.fnAddData(list[selectedProxy].data.ipPatterns);
 if(typeof selected != 'undefined')
 oIpPatternTable.fnSelectRow(selected); 
 }
 
 function deleteSelectedIpPattern(){
 selectedIpPattern = oIpPatternTable.fnGetSelectedPosition();
 if(selectedIpPattern === null)return;
 list[selectedProxy].data.ipPatterns.splice(selectedIpPattern, 1);
 updateIpPatternTable();
 }
 
 function copySelectedIpPattern(){
 selectedIpPattern = oPatternTable.fnGetSelectedPosition();
 if(typeof selectedIpPattern=='number' && selectedIpPattern>=0){
 list[selectedProxy].data.ipPatterns.splice(selectedIpPattern, 0, new ProxyPattern(list[selectedProxy].data.ipPatterns[selectedIpPattern]));
 updateIpPatternTable(selectedIpPattern);
 }
 }      
 */
