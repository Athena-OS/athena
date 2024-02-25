//var foxyProxy = chrome.extension.getBackgroundPage().foxyProxy;

var foxyProxy;
var settings;
var lastTabName;

// listen for settings message from extension
chrome.runtime.onMessage.addListener(function( request, sender, sendResponse) {
    if (request.settings) {
        
        settings = request.settings;
        
        var tabName = lastTabName;
        // onTabShow
        if ('pageQuick' == tabName) {
            $("#enabledQA").setChecked(settings.enabledQA);
            $("#patternTemporaryQA").setChecked(settings.patternTemporaryQA);
            if(settings.enabledQA)
                $('#QASettingsContainer *').each(function(){ $(this).prop('disabled', false); });
            else
                $('#QASettingsContainer *').each(function(){  $(this).attr('disabled','disabled'); });
            $("#patternTemplateQA").val(settings.patternTemplateQA);
            $("#patternUrlQA").val("http://fred:secret@mail.foo.com:8080/inbox/msg102.htm#subject?style=elegant").change();
            $("#patternNameQA").val(settings.patternNameQA);
            $("#patternProxyQA *").remove();
            $.each(list, function(i, proxy){
                if(!proxy.data.readonly)
                {
                $("#patternProxyQA").append( $('<option value="'+i+'">'+proxy.data.name+'</option>'));
                }
            });

            $("#patternProxyQA option[value='"+settings.patternProxyQA+"']").attr("selected", "selected");
            //$("#patternProxyQA").change();

            $("input[name='patternWhitelistQA'][value='"+settings.patternWhitelistQA+"']").setChecked(true);
            $("input[name='patternTypeQA'][value='"+settings.patternTypeQA+"']").setChecked(true);
        }

        if ('pageGlobal' == tabName) {
            if (foxyProxy.getFoxyProxyEdition && foxyProxy.getFoxyProxyEdition() != 'Basic') {
                $("input[name='advancedMenuCheck']").attr('checked', settings.useAdvancedMenus);
                $("input[name='showContextMenuCheck']").attr('checked', settings.showContextMenu);
            } else {
                $("input[name='advancedMenuCheck']").hide();
                $("input[name='showContextMenuCheck']").hide();
                $("label[for='advancedMenuCheck']").hide();
                $("label[for='showContextMenuCheck']").hide();
            }
            $("input[name='useChromeSyncCheck']").attr('checked', settings.useSyncStorage);
            $("input[name='animateIconCheck']").attr('checked', settings.animateIcon);
            $("input[name='showUpdatesCheck']").attr('checked', settings.showUpdates);
            $("input[name='usageOptOutCheck']").attr('checked', !settings.usageOptOut);
        }
    }
});

chrome.runtime.getBackgroundPage(function( bgPage) {
    foxyProxy = bgPage.foxyProxy;
    
    foxyProxy.getSettings();
    
    if (foxyProxy.getFoxyProxyEdition() != 'Basic') {
        $("#tabQuick").show();
    }
});

function saveSettings(){
    console.log("saveSettings");
    foxyProxy.updateSettings({ "settings": settings});
}


function genPattern(url, strTemplate, caseSensitive) {
    
    var flags = caseSensitive ? "gi" : "g";
    var parsedUrl = parseUri(url);
    parsedUrl.hostport = parsedUrl.domain ? parsedUrl.domain + (parsedUrl.port ? ":"+parsedUrl.port: "") : "";
    parsedUrl.prePath = (parsedUrl.protocol?parsedUrl.protocol+"://":"")+ parsedUrl.authority;
    var ret = strTemplate.replace("${0}", parsedUrl.protocol?parsedUrl.protocol:"", flags);    
    ret = ret.replace("${1}", parsedUrl.user ? parsedUrl.user : "", flags);    
    ret = ret.replace("${2}", parsedUrl.password ? parsedUrl.password : "", flags); 
    ret = ret.replace("${3}", parsedUrl.userInfo ? parsedUrl.userInfo + "@" : "", flags); 
    ret = ret.replace("${4}", parsedUrl.domain ? parsedUrl.domain : "", flags); 
    ret = ret.replace("${5}", parsedUrl.port ? parsedUrl.port : "", flags); 
    ret = ret.replace("${6}", parsedUrl.hostport ? parsedUrl.hostport : "", flags); 
    ret = ret.replace("${7}", parsedUrl.prePath ? parsedUrl.prePath : "", flags);                 
    ret = ret.replace("${8}", parsedUrl.directory ? parsedUrl.directory : "", flags); 
    ret = ret.replace("${9}", parsedUrl.file ? parsedUrl.file : "", flags); 
    ret = ret.replace("${10}", parsedUrl.file ? parsedUrl.file : "", flags); 
    ret = ret.replace("${11}", parsedUrl.file ? parsedUrl.file : "", flags); 
    ret = ret.replace("${12}", parsedUrl.path ? parsedUrl.path : "", flags); 
    ret = ret.replace("${13}", parsedUrl.anchor ? parsedUrl.anchor : "", flags);      
    ret = ret.replace("${14}", parsedUrl.query?parsedUrl.query:"", flags);       
    ret = ret.replace("${15}", parsedUrl.source?parsedUrl.source:"", flags);

    return ret;
}

function onTabShow(tabName) {
    console.log("tagName is", tabName);
    
    lastTabName = tabName;
    
    if (tabName) {
        $("#" + tabName).show();
    }
    
    chrome.runtime.getBackgroundPage(function( bgPage) {
        foxyProxy = bgPage.foxyProxy;

        foxyProxy.getSettings();
        foxyProxy.getProxyList();
    });
    
    chrome.runtime.sendMessage({ trackEvent: {
        "category": "Options",
        "action": "tabShow",
        "label": "tabName",
        "value": tabName
    }});

}

$(document).ready(function() {
    
    $(".tabPage").hide(); // hide all tabs until we get settings loaded.
    
    $("#enabledQA").click(function(){
        if(list.length<=1) {
            alert("You must have entered at least one proxy in order to use QuickAdd");
            return false;
        }

        settings.enabledQA = $(this).is(":checked");
    
        saveSettings();
        
        if (settings.enabledQA)
            $('#QASettingsContainer *').each(function(){ $(this).prop('disabled', false); });
        else
            $('#QASettingsContainer *').each(function(){  $(this).attr('disabled','disabled'); });
    });

    $("#patternTemporaryQA").click(function(){
        settings.patternTemporaryQA = $(this).is(":checked");
        saveSettings();
    });
    
    $("#patternTemplateQA").keyup(function(){
        settings.patternTemplateQA=$(this).val();
        saveSettings();
        $("#patternResultQA").val(genPattern($("#patternUrlQA").val(),settings.patternTemplateQA));
    });

    
    $("#patternUrlQA").change(function(){
        $("#patternResultQA").val(genPattern($(this).val(),settings.patternTemplateQA));
    });
    
    $("#patternNameQA").change(function(){
        settings.patternNameQA=$(this).val();
        saveSettings();
    });
    
    $("input[name='patternWhitelistQA']").click(function(){
        settings.patternWhitelistQA = $(this).val();
        saveSettings();
    });
    
    $("input[name='patternTypeQA']").click(function(){
        settings.patternTypeQA = $(this).val();
        saveSettings();
    });
    
    $("#patternProxyQA, #dialogPatternProxyQA").change(function(){
        settings.patternProxyQA = $(this).val();
        saveSettings();
    });


    $("#proxyTypeDirect").click(function(){
        if($(this).is(":checked")) {
            $(".proxyTypeManualGroup *").attr('disabled','disabled');
            $(".proxyTypeAutoGroup *").attr('disabled','disabled');
            $("#proxyDNS").attr('disabled','disabled');
        }
    });
    $("#proxyTypeManual").click(function(){
        if($(this).is(":checked")) {
            $(".proxyTypeManualGroup *").prop('disabled', false);
            $(".proxyTypeAutoGroup *").attr('disabled','disabled');
            $("#proxyDNS").prop('disabled', false);
        }
    });
    $("#proxyTypeAuto").click(function(){
        if($(this).is(":checked")) {
            $(".proxyTypeManualGroup *").attr('disabled','disabled');
            $(".proxyTypeAutoGroup *").prop('disabled', false);
            $("#proxyDNS").prop('disabled', false);
        }
    });
    
    
    $(document.body).keydown(function (e) {
        var s, 
            tables,
            dialogs = $('.ui-dialog:visible');
            
        if(dialogs.size()>0)
        {
            tables = $('.dataTables_wrapper > table',dialogs).filter(':visible');
        }
        else
        {
            tables = $('.dataTables_wrapper > table').filter(':visible');
        }
    
        var activeTable = tables;
        if (e.keyCode == 38) {
            s = activeTable.find("tbody tr.selected_row");
            s.toggleClass("selected_row");
            if(s.length && !s.is(":first-child"))
                s.prev().toggleClass("selected_row").click();
            else
                activeTable.find("tbody tr:last").toggleClass("selected_row").click();
        }
        if (e.keyCode == 40) {
            s = activeTable.find("tbody tr.selected_row");
            s.toggleClass("selected_row");
            if(s.length && !s.is(":last-child"))
                s.next().toggleClass("selected_row").click();
            else
                activeTable.find("tbody tr:first").toggleClass("selected_row").click();
        }
    });
    
    $("#proxyModeGlobal").change(function () {
        var newState = $("option:selected",this).val();
        foxyProxy.state = newState;
    });
    
    $("input[name='advancedMenuCheck']").click(function() {
        foxyProxy.toggleAdvancedMenus();
    });
    
    $("input[name='showContextMenuCheck']").click(function() {
        foxyProxy.toggleShowContextMenu();
    });
    
    $("input[name='useChromeSyncCheck']").click(function() {
        foxyProxy.toggleSyncStorage();
    });
    
    
    $("input[name='animateIconCheck']").click(function() {
        foxyProxy.toggleAnimateIcon();
    });
    
    
    $("input[name='showUpdatesCheck']").click(function() {
        foxyProxy.toggleShowUpdates();
    });
    
    $("input[name='usageOptOutCheck']").click(function() {
        foxyProxy.toggleUsageOptOut();
    });
    
    $("#resetButton").click(function() {
        if (confirm("Are you sure you want to reload all settings?")) {
            foxyProxy.reloadSettings();
        }
    });
    
    $("#resetDefaultsButton").click(function() {
        if (confirm("This will reset all settings and remove any proxies that were added! Are you sure you want to reset?")) {
            foxyProxy.resetToDefaults();
        }
    });
    
    
    onTabShow('');
});

function exportConfig()
{
    var settingsString = chrome.extension.getBackgroundPage().foxyProxy.settingsToXml();
    chrome.extension.getBackgroundPage().foxyProxy.saveToFile(settingsString);  
    
    // chrome.runtime.sendMessage({ trackEvent: {
    //     "category": "Options",
    //     "action": "export"
    // }});
}