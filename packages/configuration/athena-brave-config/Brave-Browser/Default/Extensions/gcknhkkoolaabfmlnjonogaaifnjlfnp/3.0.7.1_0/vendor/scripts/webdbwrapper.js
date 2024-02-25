function Database(_options){
	//Database openDatabase(in DOMString name, in DOMString version, in DOMString displayName, in unsigned long estimatedSize, in optional DatabaseCallback creationCallback);
	console.log(_options);
	var options = $.extend(null, {
		name: 'database',
		version: "0.1",
		displayName: "database",
		estimatedSize: 5*1024*1024,
		onOpen: null
	}, _options);
	
	this.db = openDatabase(options.name, options.version, options.displayName, options.estimatedSize, options.creationCallback);
	console.log(this.db);
}

Database.prototype.createTable = function(_param){
	var param = $.extend(null, {
		name: 'table',
		fields: [],
		callback: null
	}, _param);
	this.db.transaction(function (t) {
		console.log(t);
		t.executeSql('CREATE TABLE IF NOT EXISTS '+param.name+' ('+param.fields.toString()+')');
	});
};

Database.prototype.clearTable = function(tableName, callback){
	this.db.transaction(function (t) {
		t.executeSql('DELETE FROM '+tableName, null, callback);
	});
};

Database.prototype.addRow = function(_param, callback){
	var self = this;
	var param = $.extend(null, {
		table: 'table',
		params: []
	}, _param);
	var vals = '';

	this.db.transaction(function (t) {
		t.executeSql("INSERT INTO " +param.table + " VALUES ("+$.map(param.params, function(el){return "?";}).join(",")+")", param.params, callback);
	});
};

Database.prototype.removeRow = function(_param, callback){
	var param = $.extend(null, {
		table: 'table',
		params: []
	}, _param);
	var names = [];
	var vals = [];
	for(name in param.params){
		names.push(name + " = ?" );
		vals.push(param.params[name]);
	}
	var sqlParams = names.join(" AND ");
	
	this.db.transaction(function (t) {
		t.executeSql("DELETE FROM " +param.table + " WHERE "+sqlParams, vals ,callback);
	});
};

Database.prototype.getRows = function(_param, callback){
	var param = $.extend(null, {
		sql: 'select * frome table',
		params: []
	}, _param);
	
	this.db.transaction(function (t) {
		t.executeSql(param.sql, param.params, callback);
	});
};

Database.prototype.truncateTable = function(_param, callback){
	var param = $.extend(null, {
		size: 500,
		table: 'table',
		transaction: null
	}, _param);

	this.db.transaction(function (t) {
		t.executeSql("DELETE FROM "+param.table+" WHERE timestamp NOT IN (SELECT timestamp FROM "+param.table+" ORDER BY timestamp LIMIT 0, ?)", [param.size], callback);
	});

};