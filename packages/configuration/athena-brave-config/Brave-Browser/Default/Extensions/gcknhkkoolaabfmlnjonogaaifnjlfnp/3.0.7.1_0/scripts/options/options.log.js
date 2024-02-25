/*
logClear
logRefresh
logSet
logOpen
logDelete
*/

var oLog = null;

$(document).ready(function(){
	$("#logEnabled").setChecked(chrome.extension.getBackgroundPage().foxyProxy.log.enabled).click(function(){
		chrome.extension.getBackgroundPage().foxyProxy.log.enabled = $(this).is(':checked');
	});
	$("#logSize").val(chrome.extension.getBackgroundPage().foxyProxy.log.maxLength);
	$("#logSizeSet").click(function(){
		var logSize = $("#logSize").val();
		if(!RegExp('^\\d*$').test(logSize)){
			alert(chrome.i18n.getMessage("log_size_integer"));
			return;
		}
		chrome.extension.getBackgroundPage().foxyProxy.log.maxLength = $("#logSize").val();
		chrome.extension.getBackgroundPage().foxyProxy.log.truncate(function(){
			logRefresh();
		});
	});	
	oLog = $("#log").dataTable({
			"bFilter": true,
			"bSort": false,
			"bInfo": false,
			"bAutoWidth": false,
			"bUseRendered": false,
			"aaData": [],
			"oLanguage": {
				"sZeroRecords": ""
			},
			"aoColumns": [
				{"sTitle": chrome.i18n.getMessage( "Timestamp"),"bUseRendered":false, "fnRender": function(obj) { return new Date(obj.aData[ obj.iDataColumn ]).toUTCString(); }},
				{"sTitle": chrome.i18n.getMessage( "Color"), "bUseRendered":false, "fnRender": function(obj) { var c = obj.aData[ obj.iDataColumn ]; return "<span class='colorbox' style='background-color: "+c+"'></span>";}},
				{"sTitle": chrome.i18n.getMessage( "Url") },
				{"sTitle": chrome.i18n.getMessage( "proxy_name") },
				{"sTitle": chrome.i18n.getMessage( "proxy_notes") },
				{"sTitle": chrome.i18n.getMessage( "pattern_name") },
				{"sTitle": chrome.i18n.getMessage( "Pattern")},
				{"bVisible": false},
				{"sTitle": chrome.i18n.getMessage( "pattern_type")},
				{"sTitle": chrome.i18n.getMessage( "Whitelist")},
				{"sTitle": chrome.i18n.getMessage( "PAC")},
				{"sTitle": chrome.i18n.getMessage( "Error"),"bVisible": false}
			]
	}); 
	logRefresh();
	$("#log tbody tr").live('click', function (e) {
		var clickedRow = this;
		console.log(e);
		if(e.ctrlKey){
			$(this).toggleClass('selected_row');
		} else if (e.shiftKey){
			$("#log tbody tr.selected_row").toggleClass('selected_row');
			var iFlag = 0;
			$("#log tbody tr").each(function(i, tr){
				console.log($(tr).is(".first_selected_row") , tr == clickedRow);
				if($(tr).is(".first_selected_row") || tr == clickedRow){
					iFlag++;
					if($(tr).is(".first_selected_row") && tr == clickedRow)
						iFlag++;
				}
				console.log(iFlag);
				if(iFlag){
					$(tr).toggleClass('selected_row');
					if(iFlag>1)
						return false;
				}
			});
		} else {
			oLog.fnSelect(this);
		}
		console.log($("#log tbody tr.selected_row").length);
		if($("#log tbody tr.selected_row").length == 1){
			$("#log tbody tr.first_selected_row").toggleClass('first_selected_row');
			$("#log tbody tr.selected_row").toggleClass('first_selected_row');
		}
		toggleselectedLog();
	} ).first().click();
});


function toggleselectedLog(){

}

function logClear(){
	chrome.extension.getBackgroundPage().foxyProxy.log.clear(function(){
		logRefresh();
	});
	
}

function logRefresh(){
	chrome.extension.getBackgroundPage().foxyProxy.log.getLogs(function(logs){
		oLog.fnClearTable();
		oLog.fnAddData(logs);
	});
}
function logCopy(){
	var log = chrome.extension.getBackgroundPage().foxyProxy.log,
		sCopyText = '';
	$("#log tbody tr.selected_row").each(function(i, tr){
		var data = oLog.fnGetData(tr);
		sCopyText+= data[2] + "\n";
	});
	$.copy(sCopyText);
	console.log(sCopyText);

}

function logOpen(){
	var count = $("#log tbody tr.selected_row").length;
	if( (count>5 && window.confirm("Realy open "+$("#log tbody tr.selected_row").length + " new tabs?" )) || (count <=5)){
		$("#log tbody tr.selected_row").each(function(i, tr){
			chrome.tabs.create({
				url:oLog.fnGetData(tr)[2],
				selected: true
			});
		});
	}
}
function logDelete(){
	var log = chrome.extension.getBackgroundPage().foxyProxy.log;
	$("#log tbody tr.selected_row").each(function(tr){
		var data = oLog.fnGetData(tr);
		log.removeLog({
				timestamp: data[0],
				url: data[2]
			}, function(){
				logRefresh();
			}
		);
	});
}

function escapeHtml(str)
{
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function logSaveToFile()
{
	chrome.extension.getBackgroundPage().foxyProxy.log.getLogs(function(logs){
		head = '<html><head>';
		head += '<link rel="icon" href="http://getfoxyproxy.org/favicon.ico" /><link rel="shortcut icon" href="http://getfoxyproxy.org/favicon.ico" /><link rel="stylesheet" href="http://getfoxyproxy.org/styles/log.css" type="text/css" />';
		head += '</head><body><table class="log-table"><thead><tr><td class="heading">Timestamp</td><td class="heading">URL</td><td class="heading">Proxy Name</td>';
		head += '<td class="heading">Proxy Notes</td><td class="heading">Pattern Name</td><td class="heading">Pattern</td><td class="heading">Case sensitive</td><td class="heading">Pattern Type</td>';
		head += '<td class="heading">Whitelist (Inclusive) or Blacklist(Exclusive)</td><td class="heading">PAC Result</td><td class="heading">Error Message</td>';
		head += '</tr></thead><tbody>';
		body = "";
		
		$.map(logs,function(logEntry){
			body +='<tr><td class="timestamp">'+logEntry.data.timestamp+'</td>';
			body +='<td class="url"><a href="'+logEntry.data.url+'">'+escapeHtml(logEntry.data.url)+'</a></td>';
			body +='<td class="proxy-name">'+logEntry.data.proxyName+'</td>';
			body +='<td class="proxy-notes">'+logEntry.data.proxyNotes+'</td>';
			body +='<td class="pattern-name">'+logEntry.data.patternName+'</td>';
			body +='<td class="pattern">'+logEntry.data.pattern+'</td>';
			body +='<td class="pattern-case">'+logEntry.data.caseSensitive+'</td>';
			body +='<td class="pattern-type">'+logEntry.data.patternType+'</td>';
			body +='<td class="pattern-color">'+logEntry.data.whitelist+'</td>';
			body +='<td class="pac-result"></td>';
			body +='<td class="error-msg"></td>';
			body +='</tr>';
			
			
			
			
			
		});
		
		footer = '</tbody></table></body></html>';
		content = head + body + footer;
		chrome.extension.getBackgroundPage().foxyProxy.saveToFile(content);

	});
}

function logPatternsForSelected(){
	proxySelectionPattern();
}

function logPatternsForAll(){
	proxySelectionPattern(true);
}