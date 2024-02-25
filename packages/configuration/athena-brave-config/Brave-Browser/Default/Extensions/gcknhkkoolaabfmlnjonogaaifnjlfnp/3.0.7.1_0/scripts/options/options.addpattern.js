function addPattern(param){
    
    
    chrome.runtime.getBackgroundPage(function( bgPage) {
        bg = bgPage;
        var foxyProxy = bg.foxyProxy;

        foxyProxy.getSettings(function( resp) {
            var settings = resp.settings;
            if(!settings.enabledQA )// || !list[settings.patternProxyQA])
            {

                settings.enabledQA = false;
                alert(chrome.i18n.getMessage('QuickAdd_disabled'));
                return;
            }

            $(".modeAdd").hide();
            $(".modeQuickAdd").show();

            $("#patternPageUrl").val(param).change(function(e) {
                $("#patternUrl").val(genPattern(e.target.value,settings.patternTemplateQA));
            }).change();

            /* add code for proxy selected */
            $("#dialogPatternProxyQA *").remove();

            foxyProxy.getProxyList(function( resp) {
                var list = resp.proxyList;
                
                $.each(list, function(i, proxy) {
                    if(!proxy.data.readonly)
                    {
                        $("#dialogPatternProxyQA").append( $('<option value="'+i+'">'+proxy.data.name+'</option>'));
                    }
                });

                $("#dialogPatternProxyQA option[value='"+settings.patternProxyQA+"']").attr("selected", "selected");
                $("#dialogPatternProxyQA").change();

                $("#patternEditDlg").dialog({
                    title: chrome.i18n.getMessage("appName") + chrome.i18n.getMessage("quickAdd"),
                    width: "500px",
                    modal: true,
                    buttons:[
                        {
                            text: chrome.i18n.getMessage("okay"),
                            click: function() { 
                                selectedProxy = settings.patternProxyQA;
                                var exists = false;
                                var url = $("#patternUrl").val();
                                $.each(list[selectedProxy].data.patterns, function(i, pattern){ if(pattern.data.url == url)exists=true;});
                                if(!exists)
                                {
                                    list[selectedProxy].data.patterns.push(new ProxyPattern());
                                    selectedPattern = list[selectedProxy].data.patterns.length-1;
                                    list[selectedProxy].data.patterns[selectedPattern].data.enabled = true;
                                    list[selectedProxy].data.patterns[selectedPattern].data.temp = settings.patternTemporaryQA;
                                    list[selectedProxy].data.patterns[selectedPattern].data.name = settings.patternNameQA;
                                    list[selectedProxy].data.patterns[selectedPattern].data.url = url;
                                    list[selectedProxy].data.patterns[selectedPattern].data.whitelist = settings.patternWhitelistQA;
                                    list[selectedProxy].data.patterns[selectedPattern].data.type = settings.patternTypeQA;

                                    saveProxies(list);
                                }
                                $(this).dialog("close"); 
                            }
                        },
                        {
                            text: chrome.i18n.getMessage("Cancel"),
                            click: function(){ $(this).dialog("close");}
                        }
                    ]
                }).parent().find(".ui-dialog-buttonset").css({
                    "width":"100%",
                    "text-align": "right"
                });
            });

        });
    });

}

// link to keyboard shortcuts
$(document).ready(function() {
    $("a#configureKeyboardLink").click(function() {
        chrome.tabs.create({
            "url": "chrome://extensions/configureCommands"
        });
    });
});