
function LogEntry(_data){
	this.className = "Proxy";
	this.data = {
		'timestamp': new Date(), 
		'color': "#0000c4", 
		'url' : '', 
		'proxyName': '', 
		'proxyNotes': '',
		'proxyUrl': '', 
		'patternName': '', 
		'pattern': '', 
		'caseSensitive': '', 
		'patternType': '', 
		'whitelist': '', 
		'pac': '', 
		'error': ''
	};
	if(_data && _data.data){
		$.extend(this.data, _data.data);
	}else{
		$.extend(this.data, _data);
	}
}

LogEntry.prototype = {
	toArray: function(){
		return	[this.data.timestamp, this.data.color, this.data.url, this.data.proxyName, this.data.proxyNotes, this.data.patternName, this.data.pattern, '', this.data.patternType, this.data.whitelist, this.data.pac, this.data.error];
	}
};


function FoxyLog(){
	var self = this;
	var enabled = (localStorage.getItem('loggingEnabled') == true.toString());
	this.__defineGetter__("enabled", function(){
       return enabled;
    });
	this.__defineSetter__("enabled", function(_enabled){
		enabled = _enabled;
		localStorage.setItem("loggingEnabled", _enabled);
    });

	var maxLength = localStorage.getItem('maxLength')?parseInt(localStorage.getItem('maxLength')):500;
	this.__defineGetter__("maxLength", function(){
       return maxLength;
    });
	this.__defineSetter__("maxLength", function(_maxLength){
		maxLength = _maxLength;
		localStorage.setItem("maxLength", _maxLength);
    });
	
	var db = new Database({
		name: "foxyproxy"
	});

	db.createTable({
		name: 'log',
		fields: ['timestamp', 'color', 'url', 'proxyName', 'proxyNotes', 'patternName', 'pattern', 'caseSensitive', 'patternType', 'whitelist', 'pac', 'error']
	});
	
	this.getLogs = function(fnCallback){
		this.truncate(function(){
			db.getRows({
				sql: "SELECT * FROM log",
				size: maxLength
			}, function(t, data){ 
					fnCallback( $.map(data.rows, function(row, i){
						return new LogEntry(data.rows.item(i));
					}));
                                 
			});
		});
	};
	
	this.addLog = function(url, proxy, pattern){
		if(enabled){
			if(!pattern)
			{
				var state = foxyProxy.state;
				var str = "All URLs were configured to use this proxy";
				pattern = { };
				if(state == 'auto')
					pattern.data = { name : 'All',	url : '*',	type : 'Wildcards',	whitelist : 'Whitelist'	};					
				else
					pattern.data = { name : str,	url : str,	type : str,	whitelist : str	};
			}
			db.addRow({
				table: 'log',
				params: [	
							new Date(), 
							proxy.data.color, 
							url, 
							proxy.data.name, 
							proxy.data.notes, 
							pattern?pattern.data.name:'All', 
							pattern?pattern.data.url:'All', 
							'', 
							pattern?pattern.data.type:'All', 
							pattern?pattern.data.whitelist:'Inclusive', 
							proxy.data.configUrl, 
							''
						]
			});
		}
	};
	
	this.truncate = function(callback){
		db.truncateTable({table: 'log', size: maxLength}, callback);
	};
	
	this.removeLog = function(params, callback){
		db.removeRow({
			table: 'log',
			params: params
		}, callback);
	};
	
	this.clear = function(callback){
		db.clearTable('log', callback);
	};

}
