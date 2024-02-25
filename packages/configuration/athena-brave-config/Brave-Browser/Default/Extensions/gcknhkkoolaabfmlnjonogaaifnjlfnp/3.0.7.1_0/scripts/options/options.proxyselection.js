function proxySelection(param){

    //function addNewProxy(aUri)
    var aUri = param;
    console.log("param is", param);
    if (param.domain != undefined) {
        /* there is host value given */
        aUri.domain = uri.domain;
        aUri.port = uri.port;
    }
    if (aUri == null && param ){
	/* using a param */
        aUri = parseUri(param);
        
	if(aUri.domain && aUri.port){

	} 
        else {
	    alert(chrome.i18n.getMessage("error_host_port_cannot_be_determined"));
	    return;
        }

    }

    if (aUri == null) {
	alert(chrome.i18n.getMessage("error_host_port_cannot_be_determined"));
	return;
    }
	//proxySelectionDlg
	//proxySelectionUrl
	//proxySelectionTable
	$("#proxySelectionUrl").text(param);
	$.each(list, function(i, proxy){
		$("#proxySelectionTable tbody").append(
			$("<tr />").attr("proxyId", i)
				.append(
					$("<td>").html(
						(proxy.data.enabled?"<img src='styles/images/bullet_tick.png'>":"")
					)
				)
				.append(
					$("<td>").html(
						"<span style='color: "+proxy.data.color+"'>"+proxy.data.color+"</span>"
					)
				)
				.append(
					$("<td>").text(
						proxy.data.name
					)
				)
				.append(
					$("<td>").text(
						proxy.data.notes
					)
				).click(function(){
					$("#proxySelectionTable tbody tr").removeClass('selected_row');
					$(this).toggleClass('selected_row');
				})
		)
	});
	$("#proxySelectionDlg").dialog({
		title: chrome.i18n.getMessage("appName"),
		width: "500px",
		modal: true,
		buttons:[
			{
				text: chrome.i18n.getMessage("add_new_proxy"),
				click: function() { 
					addNewProxy(aUri);
					$(this).dialog("close"); 
				},
				css:{"float":"left"}
				
			},{
				text: chrome.i18n.getMessage("Save"),
				click: function(){
					var id = parseInt($("#proxySelectionTable tbody tr.selected_row").attr("proxyId"));
					if(id || id==0){
						if(list[id].data.name == (list[id].data.host+":"+list[id].data.port)){
							list[id].data.name = aUri.domain +":"+aUri.port;
						}
						list[id].data.host = aUri.domain;
						list[id].data.port = aUri.port;
						saveProxies(list);
						updateProxyTable(id);
						$(this).dialog("close");
					} else {
						alert(chrome.i18n.getMessage('select_proxy_to_update'));
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