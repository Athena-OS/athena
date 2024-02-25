function proxySelectionPattern(forAll){

	var lines = $("#log tbody tr"+ (forAll ? "" : ".selected_row") );
	if(!lines.length)return;
	/*.each(function(tr){
		var data = oLog.fnGetData(tr);
		log.removeLog({
				timestamp: data[0],
				url: data[2]
			}, function(){
				logRefresh();
			}
		);
	});*/

	//$("#proxySelectionUrl").text(param);
	$("#patternProxyTraining").empty();
	$.each(list, function(i, proxy){
		if(proxy.data.readonly)return;
			$("<option />").val(i).text(proxy.data.name).appendTo("#patternProxyTraining");
	});
	
	$("input[name='patternWhitelistTraining'][value='Inclusive']").setChecked(true);
	$("input[name='patternTypeTraining'][value='wildcard']").setChecked(true);
	
	$('#patternNameTraining').val("Training Pattern");
	$('#patternTemplateTraining').val("*://${3}${6}/*");
	$("#trainingPatternsDlg").dialog({
		title: chrome.i18n.getMessage("appName"),
		width: "500px",
		modal: true,
		buttons:[
			{
				text: chrome.i18n.getMessage("add"),
				click: function(){
					var id = parseInt($("#patternProxyTraining option:selected").val());
					if(id || id==0){
						var hasDuplicates = false;
						$.each(lines, function(i, line)
						{
							var data = oLog.fnGetData(line);
							var pattern = new ProxyPattern();
							pattern.data.enabled = true;
							pattern.data.temp = $("#patternTemporaryTraining").is(":checked");
							pattern.data.name = $("#patternNameTraining").val();
							
							pattern.data.url = genPattern(data[2],$('#patternTemplateTraining').val())

							pattern.data.whitelist = $("input[name='patternWhitelistTraining']:checked").val();
							pattern.data.type = $("input[name='patternTypeTraining']:checked").val();
							

							if(patternDuplicates(list[id].data.patterns, pattern))
								hasDuplicates = true;
							else
								list[id].data.patterns.push(pattern);
						});
						
						saveProxies(list);
						updateProxyTable(id);
						if(hasDuplicates)alert(chrome.i18n.getMessage("error_duplicate_pattern"));
						$(this).dialog("close");
					} else {
						alert(chrome.i18n.getMessage('select_proxy_add_pattern'));
					}
				}
			},{
				text: chrome.i18n.getMessage("Cancel"),
				click: function(){ $(this).dialog("close");}
			}
		]
	}).parent().find(".ui-dialog-buttonset").css({
		"width":"100%",
		"text-align": "right"
	});
}