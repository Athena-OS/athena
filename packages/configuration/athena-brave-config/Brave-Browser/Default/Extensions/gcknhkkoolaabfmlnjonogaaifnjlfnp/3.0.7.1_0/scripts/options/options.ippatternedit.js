/*function ipPatternLoad(pattern, edit){
		$("#ipPatternEnabled").setChecked(pattern.data.enabled);
		$("#ipPatternTemporary").setChecked(pattern.data.temp);
		$("#ipPatternName").val(pattern.data.name);
		$("#ipPatternUrl").val(pattern.data.url);
		$("input[name='ipPatternWhitelist'][value='"+pattern.data.whitelist+"']").setChecked(true);
		$("input[name='ipPatternType'][value='"+pattern.data.type+"']").setChecked(true);
		
		
		updateIpsList();

		
			$("#ipPatternEditDlg").dialog({
				title: localize("FoxyProxy - Add/Edit local IP address pattern"),
				modal: true,
				width:500,
				resizable: false,
				buttons: [{ 
					text:localize("Save"),
					click: function(){
						if($("#ipPatternUrl").val() == ''){
							alert(localize("Pattern IP must be specified"));
						} else {
							list[selectedProxy].data.ipPatterns[selectedIpPattern].data.enabled = $("#ipPatternEnabled").is(":checked");
							list[selectedProxy].data.ipPatterns[selectedIpPattern].data.temp = $("#ipPatternTemporary").is(":checked");
							list[selectedProxy].data.ipPatterns[selectedIpPattern].data.name = $("#ipPatternName").val();
							list[selectedProxy].data.ipPatterns[selectedIpPattern].data.url = $("#ipPatternUrl").val();
							list[selectedProxy].data.ipPatterns[selectedIpPattern].data.whitelist = $("input[name='ipPatternWhitelist']:checked").val();
							list[selectedProxy].data.ipPatterns[selectedIpPattern].data.type = $("input[name='ipPatternType']:checked").val();
							updateIpPatternTable();
							oIpPatternTable.fnSelectRow(selectedIpPattern);
							$( this ).dialog( "close" );
						}
					}
				},{
					text: localize("Cancel"),
					click: function(){
						if(!edit)list[selectedProxy].data.ipPatterns.splice(selectedIpPattern, 1);
						updateIpPatternTable(selectedIpPattern);
						$( this ).dialog( "close" );
					}
				}]
			});
	}

function copyIp()
{
	$("#ipPatternUrl").val($("#ipPatternCurrentIPs option:selected").val());
}

function getIpsList()
{
	/*chrome.extension.getBackgroundPage().foxyProxy.updateLocalIps();
	return chrome.extension.getBackgroundPage().foxyProxy.localIps*/
}

function updateIpsList()
{
	
	$("#ipPatternCurrentIPs").empty();
	$.map(getIpsList(),function(ip){
		$("#ipPatternCurrentIPs").append("<OPTION>"+ip+"</OPTION>");
	});
}*/