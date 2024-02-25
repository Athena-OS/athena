function patternLoad(pattern, edit){
        $(".modeAdd").show();
        $(".modeQuickAdd").hide();
        $("#patternEnabled").setChecked(pattern.data.enabled);
        $("#patternTemporary").setChecked(pattern.data.temp);
        $("#patternName").val(pattern.data.name.replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm'));
        $("#patternUrl").val(pattern.data.url.replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm'));
        $("input[name='patternWhitelist'][value='"+pattern.data.whitelist+"']").setChecked(true);
        $("input[name='patternType'][value='"+pattern.data.type+"']").setChecked(true);
        
        
        
            $("#patternEditDlg").dialog({
                title: chrome.i18n.getMessage("appName") + " - " + chrome.i18n.getMessage("add_edit_pattern"),
                modal: true,
                width:500,
                resizable: false,
                close: function() {
                    if(!edit)list[selectedProxy].data.patterns.splice(selectedPattern, 1);
                    
                },
                buttons: [{ 
                    text:chrome.i18n.getMessage("Save"),
                    click: function(){
                        if($("#patternUrl").val() == ''){
                            alert(chrome.i18n.getMessage("Pattern URL must be specified"));
                        } else {
                            var patterns = list[selectedProxy].data.patterns;
                            patterns[selectedPattern].data.enabled = $("#patternEnabled").is(":checked");
                            patterns[selectedPattern].data.temp = $("#patternTemporary").is(":checked");
                            patterns[selectedPattern].data.name = $("#patternName").val().replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm');
                            patterns[selectedPattern].data.url = $("#patternUrl").val().replace("<", "&lt;", 'gm').replace(">", "&gt;", 'gm');
                            patterns[selectedPattern].data.whitelist = $("input[name='patternWhitelist']:checked").val();
                            patterns[selectedPattern].data.type = $("input[name='patternType']:checked").val();
                            if(!edit && patternDuplicates(patterns, pattern))
                            {
                                patterns.splice(selectedPattern,1);
                                alert(chrome.i18n.getMessage("error_duplicate_pattern"));
                            }
                            updatePatternTable();
                            oPatternTable.fnSelectRow(selectedPattern);
                            edit = true;
                            $( this ).dialog( "close" );
                        }
                    }
                },{
                    text: chrome.i18n.getMessage("Cancel"),
                    click: function(){
                        $( this ).dialog( "close" );
                    }
                }]
            });
    }

function patternDuplicates(patternsList, pattern)
{   
    duplicate = false;
    $.each(patternsList, function (a, b)
        {
            if(b == pattern)return;
            if(b.data.url == pattern.data.url)duplicate = true;
        }
    );
    return duplicate;
}