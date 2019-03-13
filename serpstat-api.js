"use strict";
/*
	Browser with ES6 support
	Node.js >= 4.9.1
	
	var api = new SerpstatAPI({
		token   :token,
		requestsPerSecond: 9
	}); 
	
	OR
	var api = SerpstatAPI.init({
		token   :token,
		requestsPerSecond: 9
	});
	
	
	//Suports many se and/or queries in one Task 
	api.domain_keywords({
		limit : 100,
		se    : ['g_us','g_ru'],
		query : ['serstat.com','yandex.com']
	}).then(function(res){});

	//Suports limit > 1000. 
	api.createTask('domain_keywords',{
		limit : 2000,
		se    : 'g_us',
		query : 'serstat.com'
	}).then(function(res){});
	
	//Suports async/await Suports camelCase 
	var res = await api.domainKeywords({
		limit : 1111,
		se    : 'g_ru',
		query : 'serstat.com',
	});
*/

var SerpstatAPI = function(){
	var cache = {
		data    : [],
		maxSize : 1000*1000,
		curSize : 0
	};
	var methods = {
		domain_info:{
			title     	: "Domain Summary",
			info      	: "This report provides you with the number of keywords domain uses in SEO and PPC, shows its online visibility and other metrics.",
			singleRow 	: true,//Have one row
			onePage  	: true //Do not have many pages  
		},
		domain_history:{
			title 		: "Domain History",
			info  		: "This report provides you with the historical data on a domain’s number of keywords and visibility.",
			onePage 	: true
		},
		domain_keywords:{
			title 		: "Domain Organic Keywords",
			info  		: "This report shows keywords a domain ranks for in Google top 100 search results.",
			field 	 	: "hits",
			filters  	: ["position","queries","cost","concurrency","url","keywords","minus_keywords"],
			sortable 	: ["traff","found_results","position","cost","concurrency"]
		},
		domain_urls:{
			title    	: "List of domain's URLs",
			info     	: "Returns the list of URLs within the analyzed domain. Also, shows the number of keywords from top-100 for each URL",
			field    	: "hits",
		},
		domains_intersection:{
			category 	: "domain",  
			title    	: "Domain Comparison",
			info     	: "Shows common keywords of up to 3 domains.",
			field    	: "hits",
		},
		domains_uniq_keywords:{
			category    : "domain",  
			title 		: "Unique Keywords",
			info  		: "Shows unique keywords of a domain. Keywords that queried domain has in common with one or two other domains are removed from the list. ",
			field 	    : "hits",
			filters 	: ["queries","cost","concurrency","minus_domain"],
		},
		competitors:{
			category 	: "domain",  
			title    	: "Domain Competitors in Organic Search",
			info     	: "This report lists domain’s competitors in top 20 Google search results.",
			onePage  	: true,
			maxRows     : 20
		},
		ad_keywords:{
			category 	: "domain",  
			title    	: "Domain Advertising report",
			info     	: "This report shows you ads copies that pop up for the queried keyword in Google paid search results. ",
			field    	: "hits",
			filters  	: ["position","queries","cost","concurrency"],
			sortable 	: ["region_queries_count","found_results","position","cost","concurrency"]			
		},
		get_top_urls:{
			category 	: "domain",  
			title    	: "Domain Top Pages",
			info     	: "Domain Top Pages",
			field    	: "hits"// "top_urls"
		},
		keywords:{
			category 	: "keyword",  
			title    	: "Phrase Match Keywords",
			info     	: "This method uses a full-text search to find all keywords that match the queried term. For every keyword found you’ll see its volume, CPC, and level of competition.",
			field    	: "hits",
			filters  	: ["position","queries","cost","concurrency"],
			sortable 	: ["region_queries_count","found_results","position","cost","concurrency","difficulty"]
		},
		keyword_info:{
			category  	: "keyword",  
			title     	: "Keyword overview",
			info      	: "This report provides you with the keyword overview showing its volume, CPC and level of competition.",
			singleRow 	: true,
			onePage   	: true  // но лучше смотреть на total
		},
		suggestions:{
			category 	: "keyword",  
			title    	: "Keyword search suggestions",
			info     	: "These report lists autocomplete suggestions for the keyword you requested (they are found by the full-text search).",
			field    	: "hits",
		},
		related_keywords:{
			category 	: "keyword",  
			title    	: "Related Keywords",
			info     	: "This report gives you a comprehensive list of related keywords whose SERP is similar to the one the requested keyword has.",
			field    	: "hits",
			sortable 	: ["weight","region_queries_count","found_results","position","cost","concurrency","difficulty"],
			filters  	: ["weight"]
		},
		keyword_top:{
			title    	: "DEPRECATED Top for a keyword",
			info     	: "This report shows you Google top 100 organic search results for the keyword you requested.",
			field    	: "top",
			onePage  	: true,  // но лучше смотреть на total
			maxRows     : 100,
			noLimit     : true  
		},
		keyword_top_and_info:{
			title    	: "Join of 2 API methods: keyword_top and keyword_info",
			info     	: "This report shows you Google top 100 organic search results for the keyword you requested.",
			field    	: "top",
			onePage  	: true,  // но лучше смотреть на total
			maxRows     : 101,
			noLimit     : true  			
		},/*
		competitors:{
			category 	: "keyword",  
			title    	: "Competitors",
			info     	: "The report lists all domains that rank for the given keyword in Google top 20 results.",
			onePage  	: true,  // но лучше смотреть на total
			arrError 	: true  
		},
		ad_keywords:{
			category 	: "keyword",  
			title    	: "Advertising report",
			info     	: "This report shows you ads copies that pop up for the queried keyword in Google paid search results.",
			field    	: "hits",
			sortable 	: ["region_queries_count","found_results","position","cost","concurrency","difficulty"]
		},*/
		url_keywords :{
			title    	: "URL Organic Keywords",
			info     	: "The report lists keywords that URL ranks for in Google search results.",
			field    	: "hits",
			sortable 	: ["region_queries_count","found_results","position","cost","concurrency","difficulty"]
		},
		url_competitors:{
			title    	: "List of URL competitors",
			info     	: "Shows the list of URLs that compete with a queried URL in organic search.",
			field    	: "hits"
		},
		url_missing_keywords:{
			title    	: "URL missing keywords",
			info     	: "Shows a list of keywords that competitors' URLs rank for in top-10 but that are missing from the queried page.",
			field    	: "hits"
		}
	};	
	var utils = {
		unixTime:function serpstatUnixTime(){
			return Math.floor(Date.now()/1000);
		},
		getMaxDemand:function serpstatGetMaxDemand(method,limit){
			if(method.method && !limit){
				limit  = method.limit;
				method = method.method;
			}
			var info     = methods[method];
			var maxRows  = 1;
			var maxPages = 1;
				
			if(info && info.singleRow){
				maxRows  = 1;
				maxPages = 1;
			} else if(!limit){
				maxRows  = (info && info.maxRows) ? info.maxRows : 1000;
				maxPages = 1;
			} else if(info && info.onePage){
				maxRows  = (info && info.maxRows && info.maxRows < limit) ? info.maxRows : limit;
				maxPages = 1;
			} else if(limit<=1000){
				maxRows  = limit;
				maxPages = 1;
			} else {
				maxPages = Math.ceil((limit||1)/1000);
				maxRows  = maxPages * 1000;
			}
			return {pages: maxPages, rows:maxRows};
		},
		csv:{
			encodeCell:function serpstatCSVEncodeCell(val,opts){
				if(typeof(val)==='undefined'){
					val = opts.undefinedText
				} else if(typeof(val)!=='string'){
					var val0 = val;
					val = val+'';
					//digit separator. Example 1.234 => 1,234 
					if(typeof(val0) === 'number' && opts.digitSeparator!=='.' && val.indexOf('.')!==-1){
						val.split('.').join(opts.digitSeparator);
					}
				}
				var quoted = false;
				if(val.indexOf('"')!==-1){
					val = val.split('"').join('""');//double-quote  must be represented by a pair of double-quote characters.
					quoted = true;//Fields with double-quote characters must be quoted.
				} else if(val.indexOf(opts.cellSeparator)!==-1 || val.indexOf("\n")!==-1){
					quoted = true; //Fields with commas characters must be quoted.
				}
				if(quoted){
					val = '"'+val+'"';
				}
				return val;
			},
			getCols:function serpstatCSVGetCols(data,opts){
				cols = cols || [];
				var was  = {};
				for(var i=0;i<cols.length;i++){
					was[cols[i]] = 1;
				}
				for(var i=0;i<data.length;i++){
					var row = data[i];
					for(var col in row) if(row.hasOwnProperty(col)){
						if(!was[col]){
							cols.push(col);
							was[col] = 1;
						}
					}
				}
				return cols;
			},
			encode:function serpstatCSVEncode(data,opts,cols,skipHeader,skipBody){//cols = undefined,skipHeader = undefined,skipBody = undefined
				opts                = opts                || {};
				opts.rowSeparator   = opts.rowSeparator   || "\r\n";
				opts.cellSeparator  = opts.cellSeparator  || "\t";
				opts.digitSeparator = opts.digitSeparator || ".";
				opts.undefinedText  = opts.undefinedText  || "";

				if(opts.rowSeparator==='unix'||opts.rowSeparator==='\\n'){
					opts.rowSeparator = '\n';
				} else if(opts.rowSeparator==='win'||opts.rowSeparator==='windows'||opts.rowSeparator==='\\r\\n'){
					opts.rowSeparator = '\r\n';
				}
				if(opts.cellSeparator==='tab'||opts.rowSeparator==='\\t'){
					opts.rowSeparator = '\t';
				}
				skipBody   = typeof(skipBody)   == 'undefined' ? opts.skipBody   : skipBody;
				skipHeader = typeof(skipHeader) == 'undefined' ? opts.skipHeader : skipHeader;
				cols       = typeof(cols)       == 'undefined' ? opts.cols       : cols;
				
				if(!cols){
					cols = utils.csv.getCols(data,opts)
				}
				var res = [];
				if(!skipHeader){
					var arr = [];
					for(var j=0;j<cols.length;j++){
						arr.push(utils.csv.encodeCell(cols[j],opts));
					}
					res.push(arr.join(opts.cellSeparator));
				}
				if(skipBody){
					return res[0];
				}
				for(var i=0;i<data.length;i++){
					var row = data[i];
					var arr = [];
					for(var j=0;j<cols.length;j++){
						arr.push(utils.csv.encodeCell(row[cols[j]],opts));
					}
					res.push(arr.join(opts.cellSeparator));
				}
				return res.join(opts.rowSeparator)+opts.rowSeparator;
			},
		},
		Error: class SerpstatError extends Error{
			constructor(message,code){
			   super(message);
			   code = 1*code;
			   this.code     = code;
			   this.message  = message;
			   this.canRetry = (code===429||code===500);
			   
			   //Bugfix
			   if(code===500 && message && message.indexOf &&  message.indexOf('Wrong request')!=-1){
				   this.canRetry = false;
			   }
			}
		},
		QuasiPromise: class SerpstatQuasiPromise{
			constructor(promise, methods){//methods=undefined
				this.promise = promise;
				if(methods){
					for(var method in methods) if(methods.hasOwnProperty(method)){
						this[method] = methods[method];
					}
				}
			}
			then(f1,f2){//f2=undefined
				if(f2){
					this.promise.then(f1,f2);
				} else {
					this.promise.then(f1);
				}
				return this;
			} 
			catch(f1){
				this.promise.catch(f1);
				return this;
			}
		},
		Storages:{ //determine how the data is stored during the execution of the task and in what format the data is returned.
			Default : class SerpstatStorageDefault{ //Simple storage. Return array of objects.It Will use musch memory but its easy to use;
				constructor(task,opts){
					this.task = task;
					this.opts = opts;
				} 
				onData(data,page){
					return data;
				}
				getData(){
					var data = [];
					for(var i=0;i<this.task.subTasks.length;i++){
						var subTask = this.task.subTasks[i];
						for(var j=0;j<subTask.pages.length;j++){
							var page = subTask.pages[j];
							data = data.concat(page.data);
						}
					}
					return data;
				}
				then(cb){
					cb();
				}
			},
			CSV: class SerpstatStorageCSV{ //Less memory neaded. But hard to use.
				constructor(task,opts){
					//super(task,opts);
					opts.skipHeader     = opts.skipHeader || false;
				} 
				onData(data,page){
					if(!data.length || !data){
						page.data = '';
						return data;
					}
					if(!this.cols){
						this.cols = utils.csv.getCols();
					}
					page.data = utils.csv.encode(data,this.opts,this.cols,true)
					return data;
				}
				getData(){
					var data = [];
					if(!this.opts.skipHeader){
						data.push(utils.csv.encode(data,this.opts,this.cols,false,true));
					}
					for(var i=0;i<this.task.subTasks.length;i++){
						var subTask = this.task.subTasks[i];
						for(var j=0;j<subTasks.pages.length;j++){
							var page = subTasks.pages[j];
							if(page.data){
								data.push(page.data);
							}
						}
					}
					return data.join(this.opts.rowSeparator)+this.opts.rowSeparator;
				}
				then(cb){
					cb();
				}
			} 
		},
		getURL: function serpstatGetURL(url, noCache, timeout){
			timeout = timeout || 50*60*1000;
			if(noCache){
				url += (url.indexOf('?')===-1 && url.indexOf('&')===-1) ? '?' : '&';
				url += 'x_no_cache='+Date.now();
			} else if(url.indexOf('?x_no_cache=')!=-1 || url.indexOf('&x_no_cache=')!=-1){
				noCache = true;
			}
			if(!noCache && cache.data[url]){
				var cur = cache.data[url];
				var res = cur.val ? JSON.parse(cur.val) : cur.val;
				cur.ts  = Date.now();
				
				var promise = new Promise(function(resolve,reject){
					resolve(res);
					return res;
				});
				
				try{
					promise._Serpstat_val         = res;
					promise._Serpstat_isFromCache = true;
				} catch(e){}
				return promise;
			}
			return new Promise(function(resolve0,reject){
				var wasEnd  = false;
				var _timeout = setTimeout(function(){
					if(wasEnd) return;
					wasEnd = true;
					if(_timeout) clearTimeout(_timeout);
					reject(new utils.Error('Timeout',1001));
				},timeout);
				function resolve(data){
					if(data && typeof(data.left_lines)!='undefined'){
						data.left_lines_ts = data.left_lines_ts || utils.unixTime(); 
					}
					if(!noCache && cache.maxSize){
						var val = data;
						var len = 2*url.length;
						if(data){
							val  = JSON.stringify(data);
							len += val.length;
						} 
						if(len<cache.maxSize){
							cache.data[url] = {
								val : val,
								len : len,
								url : url,
								ts  : Date.now()
							};
							cache.curSize += len;
							if(cache.curSize > cache.maxSize){
								var arr = [];
								for(var i in cache.data) if(cache.data.hasOwnProperty(i)){
									arr.push(cache.data[i]);
								}
								arr.sort(function(a,b){
									return b.ts - a.ts;
								});
								cache.data    = {};
								cache.curSize = 0;
								for(var i=0;i<arr.length;i++){
									var cur = arr[i];
									if(cache.curSize+cur.len < 0.5*cache.maxSize){
										cache.data[cur.url] = cur;
										cache.curSize      += cur.len;
									}
								}
							}
						}
					}
					resolve0(data);
					return data;
				}
				function onEnd(err,statusCode,statusText,text){
					if(wasEnd)  return;
					if(_timeout) clearTimeout(_timeout);
					wasEnd = true;
					statusCode = 1*statusCode;
					if(err){
						return reject(e);
					}
					if(statusCode === 200){
						try{
							var data = JSON.parse(text);
							if(!data.status_code || data.status_code === 200 || data.status_code === 404){
								resolve(data.status_code === 404 ? null : data);
							} else {
								reject(new utils.Error('Status='+data.status_code+' '+data.status_msg,data.status_code));
							}
						} catch(e){
							reject(e);
						}
					} else if(statusCode  === 404){
						resolve(null);
					} else {
						reject(new utils.Error('Status='+statusCode+' '+statusText,statusCode));
					}
				}
				if(typeof(XMLHttpRequest)!='undefined'){//Browser
					var xhr = new XMLHttpRequest();
					try{
						xhr.setRequestHeader('Content-Type', 'text/plain');
					} catch(e){}
					xhr.open("GET", url, true);
					xhr.send();
					xhr.onreadystatechange=function(){
						if(xhr.readyState === 4){
							onEnd(false,xhr.status,xhr.statusText,xhr.responseText);
						}
					}
				} else { //Node.js
					require(url.indexOf('http://')===0 ? 'http' : 'https').get(url, (res) => {
					  let data = '';
					  res.on('data', (chunk) => {
						data += chunk;
					  });
					  res.on('end', () => {
						onEnd(false,res.statusCode,res.statusText,data);
					  });
					}).on("error", (err) => {
						onEnd(err);
					});
				}
			});
		}
	};
	
	var byToken = {}; //api instances by token
	
	/*	SerpstatAPI
			Main class of SDK.
			Instances contain API-token and performs rate-limiting. 
	*/
	class SerpstatAPI extends utils.QuasiPromise{
		constructor(opts){
			super();
			if(!opts || (!opts.token && !opts.backend)){
				throw new utils.Error('You must specify API-token');
			}
			byToken[opts.token]    = this;

			opts.requestsPerSecond = opts.requestsPerSecond  	|| 0.9;
			opts.backend       	   = opts.backend    			|| "https://api.serpstat.com/v3/";
			opts.maxRetry      	   = opts.maxRetry   			|| 5;
			opts.retryPause        = opts.retryPause 			|| 5    * 1000;
			opts.timeout           = opts.timeout 			    || 3000 * 1000;
			opts.se                = opts.se         		  	|| 'g_us';
			opts.limit             = opts.limit             	|| 100;
			opts.storage           = opts.storage             	|| {};
			opts.storage.Class     = opts.storage.Class         || utils.Storages.Default;
			
			this.setOptions(opts);
			
			this.updateInterval();   // create interval for rate limiting
			this.queue         = []; // for rate limiting
			this.timeouts      = {}; // for impliment stop
			this.lastRequestTs = 0;  // for faster evaluate in some cases
			this.userStats     = {}; // remain rows of current user and other info
			this.promise       = this.stats();
			
			// If this.opts.requestsPerSecond changes that code will change interval: 
			this._tmpInterval = setInterval(()=>this.updateInterval(),777);	 
		}
		destroy(){
			if(this._tmpInterval)    {clearInterval(this._tmpInterval);}
			if(this._queryInterval)  {clearInterval(this._queryInterval);}
			this.stop();
		}
		stats(){ // remain rows of current user and other info
			return new Promise((resolve,reject)=>{
				this.getUri('stats',true).then((data)=>{
					this.userStats = data.result;
					this.userStats.left_lines_ts = utils.unixTime();
					resolve([data.result]);
					return [data.result];
				},reject);
			});
		}
		databases_info(){ 
			return new Promise((resolve,reject)=>{
				this.getUri('databases_info').then((data)=>{
					SerpstatAPI.databases = SerpstatAPI.prototype.databases = data.result;
					resolve(data.result);
					return data.result;
				},reject);
			});
		}
		databasesInfo(){
			return this.databases_info();
		}
		keyword_top_and_info(opts){
			var keyTop, keyInfo;
			function calcCS(row){
				return row._se+'|'+row._query;
			}
			
			try{
				//console.log(opts);
				var topPromise  = this.keywordTop(opts);
				var infoPromise = this.keywordInfo(opts);
			}catch(e){
				console.error(e);
			}
			
			var res = Promise.all([
				topPromise.then(  function(data){ keyTop  = data; return data;}),
				infoPromise.then( function(data){ keyInfo = data; return data;})
			]).then(()=>{
				var byCS = {};
				for(var i=0; i<keyInfo.length; i++){
					var row  = keyInfo[i];
					var cs = calcCS(row);
					byCS[cs] = row;
				}
				for(var i=0; i<keyTop.length; i++){
					var row  = keyTop[i];
					var cs   = calcCS(row);
					var info = byCS[cs];
					if(info){
						for(var col in info) if(info.hasOwnProperty(col)){
							if(typeof(row[col]) === 'undefined'){
								row[col] = info[col];
							}
						}
						row.ctr   = this.ctrByPos[row.position] || 0;
						row.traff = info.region_queries_count * row.ctr/100;
					} else {
						row.ctr   = 0;
						row.traff = 0;
					}
				}
				return keyTop;
			});
			return new utils.QuasiPromise(res, {
				getData: function(){return keyTop;},
				getStat: function(){				
					var stat = {};
					var s1  = topPromise.getStat();
					var s2  = infoPromise.getStat();
					for(var col in s1) if(s1.hasOwnProperty(col)){
						stat[col] = s1[col];
					}
					for(var col in s2) if(s2.hasOwnProperty(col)){
						stat[col] += s2[col];
					}
					return stat;
				}
			});
		}
		keywordTopAndInfo(opts){
			return this.keyword_top_and_info(opts);
		}
		createTask(method,opts){//Make some request to download data 
			if(method.method && !opts){
				opts   = method;
				method = method.method;
			} else {
				opts = opts || {};
			}
			if(method==='databases_info'){
				return this.databases_info();
			} else if(method==='stats'){ 
				return this.stats();
			} else if(method==='keyword_top_and_info'){ 
				return this.keyword_top_and_info(opts);
			} else {
				return new SerpstatTask(this,method,opts);
			}
		}
		getUri(uri,noCache,timeout){//Make request. Can retry on some error. Support cache.
			var retryNum = 0;
			timeout = timeout || this.opts.timeout;
			var url = this.opts.backend + uri;
			if(this.opts.backend[this.opts.backend.length-1]=='/' && uri[0]=='/'){
				url = this.opts.backend + uri.slice(1);
			}
			if(url.indexOf('&token=')===-1 && url.indexOf('?token=')===-1 && this.opts.token){
				url = url + ((url.indexOf('?')===-1) ? '?' : '&')+ 'token='+this.opts.token;
			}
			//console.log(url);
			var api = this;
			return new Promise(function(resolve,reject){
				function retry(){
					retryNum++;
					api.addToQueue(function(){
						var promise = utils.getURL(url,noCache,timeout);
						promise.then(function(data){
							if(data && typeof(data.left_lines)!='undefined'){
								data.left_lines_ts = data.left_lines_ts || utils.unixTime();
								if(!api.userStats.left_lines_ts || api.userStats.left_lines_ts<data.left_lines_ts){
									api.userStats.left_lines    = data.left_lines;
									api.userStats.left_lines_ts = data.left_lines_ts;
								}
							}
							resolve(data);
							return data;
						}).catch(function(err){
							if(!err || !err.canRetry || retryNum > api.opts.maxRetry){
								reject(err);
							} else {
								var tid = setTimeout(function(){
									retry();
									if(tid && api.timeouts[tid]){
										delete(api.timeouts[tid]);
									}
								},1+Math.round((0.5 + Math.random())*api.opts.retryPause));
								api.timeouts[tid] = tid;
							}
						});
						if(promise._Serpstat_isFromCache){
							api.nextCicle(true);//Skip rate limiting if result from cache
						}
					});
				}
				retry();
			});
		}
		addToQueue(fun){
			this.queue.push(fun);
			this.nextCicle();
		}
		nextCicle(forced){ 
			//Parse next url and update rate limiting interval
			//If !forced function check last time. 
			//In this case rate limit cannot be violated
			if(forced || (Date.now()-this.lastRequestTs)>(1000.0/this.opts.requestsPerSecond)){
				this.parseNextURL();
				this.updateInterval(true);
			}			
		}
		pause(){
			this._isPaused = true;
		}
		resume(){
			this._isPaused = false;
			this.nextCicle();
		}
		stop(){
			this.queue = [];
			this._isPaused = false;
			for(var i in this.timeouts) if(this.timeouts.hasOwnProperty(i)){
				clearTimeout(this.timeouts[i]);
			}
			this.timeouts = {};
		}
		parseNextURL(){
			if(this._isPaused){
				return;
			}
			var fun = this.queue.shift();
			if(fun){
				fun.call(this,this);
				this.lastRequestTs = Date.now();
			}
			this.updateInterval();
		}
		updateInterval(forced){
			var ms = Math.round(1000.0/this.opts.requestsPerSecond);
			if(this._intervalMs !== ms || forced){
				if(this._queryInterval){
					clearInterval(this._queryInterval);
				}
				var self = this;
				this._queryInterval = setInterval(function(){
					self.parseNextURL();
				},ms);
				this._intervalMs = ms;
			}
		}
		setOptions(opts){
			this.opts = this.opts || {};
			opts.maxRetry          = opts.maxRetry          ? opts.maxRetry*1          : opts.maxRetry;
			opts.retryPause        = opts.retryPause        ? opts.retryPause*1        : opts.retryPause;
			opts.limit             = opts.limit             ? opts.limit*1             : opts.limit;
			opts.requestsPerSecond = opts.requestsPerSecond ? opts.requestsPerSecond*1 : opts.requestsPerSecond;
			
			for(var i in opts) if(opts.hasOwnProperty(i)){
				if(typeof(opts[i])!=='undefined'){
					this.opts[i] = opts[i];
				}
			}
			this.updateInterval();
		}
	};
	
	/*	SerpstatTask
			Can have multiple se and queries.
			Each se and query combination is subTask
	*/
	class SerpstatTask extends utils.QuasiPromise{
		constructor(api,method,opts){
			super();
			opts.se      = opts.se      || api.opts.se;
			opts.limit   = opts.limit   || api.opts.limit;
			opts.timeout = opts.timeout || api.opts.timeout;
			opts.storage = opts.storage || api.opts.storage;
			opts.noCache = opts.noCache || api.opts.noCache;
	
			opts.limit   = opts.limit   * 1;
			opts.timeout = opts.timeout * 1;			
			
			opts.se      = typeof(opts.se)    === 'string' ? [opts.se]    : opts.se;
			opts.query   = typeof(opts.query) === 'string' ? [opts.query] : opts.query;
			
			this.api     = api;
			this.opts    = opts;
			this.method  = method;
			this.storage = new opts.storage.Class(this,opts.storage);
			
			var methInfo =  SerpstatAPI.methods[method];
			if(methInfo){
				this.field     = methInfo.field;
				this.singleRow = methInfo.singleRow;
				this.onePage   = methInfo.onePage;
				this.arrError  = methInfo.arrError;
			}
			
			this.subTasks = [];
			for(var i=0;i<opts.se.length;i++){
				for(var j=0;j<opts.query.length;j++){
					var se    = opts.se[i];
					var query = opts.query[j];
					this.subTasks.push(new SerpstatSubTask(this,query,se));
				}
			}
			
			this.promise = new Promise((resolve,reject)=>{
				Promise.all(this.subTasks).then(()=>{
					var data;
					this.storage.then(()=>{
						data = this.getData();
						resolve(data);
						return data;
					});
					return data;
				},reject);
			});			
		}
		getData(){
			return this.storage.getData();
		}
		getStat(){
			var res = {
				minRows  : 0,
				maxRows  : 0,
				curRows  : 0,
				total    : 0,
				minPages : 0,
				maxPages : 0,
				curPages : 0
			};
			for(var i=0;i<this.subTasks.length;i++){
				var cur = this.subTasks[i].stat;
				res.minRows  += cur.minRows;
				res.maxRows  += cur.maxRows;
				res.curRows  += cur.curRows;
				res.minPages += cur.minPages;
				res.maxPages += cur.maxPages;
				res.curPages += cur.curPages;
				res.total    += cur.total;
			}
			return res;
		}
	};
	/*	SerpstatSubTask
			Can one se and one query.
			Can have limit>1000
			Thats why can have more the one Page
	*/
	class SerpstatSubTask extends utils.QuasiPromise{
		constructor(task,query,se){
			super();
			
			this.se      = se;
			this.api     = task.api;
			this.task    = task;
			this.opts    = task.opts;
			this.query   = query;
			this.method  = task.method;
			this.pages   = [];
			
			
			var demand = utils.getMaxDemand(this.method,this.opts.limit);
			this.stat = {
				minRows  : 0,
				maxRows  : demand.rows,
				curRows  : 0,
				minPages : 1,
				maxPages : demand.pages,
				curPages : 0,
				total    : 0
			};
			
			this.remain  = this.opts.limit;
			this.curPage = 0;
			this.promise = new Promise((resolve,reject)=>{
				var firstPage = this.createPage();
				firstPage.then((data)=>{
					var total = firstPage.total;
					if(!total){
						total = data.length;
					}
					this.stat.total    = total;
					this.stat.maxRows  = this.stat.minRows  = (this.opts.limit>total) ? total : this.opts.limit;
					this.stat.maxPages = this.stat.minPages = Math.ceil(this.stat.minRows/1000);
					
					for(var i=1;i<this.stat.maxPages;i++){
						this.createPage();
					}
					Promise.all(this.pages).then(resolve,reject);
					return data;
				},reject);
			});
		}
		createPage(){
			var rows     = this.curPage ? 1000 : Math.min(this.remain,1000);
			var page     = new SerpstatPage(this,this.curPage,rows);
			this.remain -= rows;
			this.curPage++;
			var isLast   = !this.remain;
			this.pages.push(page);
			page.then((data)=>{
				this.stat.curPages += 1;
				this.stat.curRows  += data.length;
				if(isLast && page.total){
					this.stat.total   = page.total;
					this.stat.minRows = this.stat.maxRows = (this.opts.limit>page.total) ? page.total : this.opts.limit;
				}
				return data;
			});
			return page;
		}
	};
	var serpstatPageSkipParams = { //params that excluded from URL
		limit      		  : 1,
		requestsPerSecond : 1, 
		backend 		  : 1, 
		maxRetry          : 1,
		retryPause        : 1,
		timeout           : 1,
		method            : 1,
		api               : 1,
		storage           : 1,
		onPageData        : 1,
		noCache           : 1
	};
	var serpstatPageNotNullParams = { //params that canot be 0, '0', '',...
		page:  		   1,
		order: 	       1,
		sort:  		   1,
		page_size:     1,
		position_from: 1
	};
	
	/*	SerpstatPage
			Have one url
			On some errors can retry and do more then one requests
	*/	
	class SerpstatPage extends utils.QuasiPromise{
		constructor(subTask,num,page_size){
			super();
			this.params = {};
			if(subTask.task){
				this.num     = num||0;
				this.api     = subTask.api;
				this.task    = subTask.task;
				this.storage = subTask.task.storage;
				
				this.method  = subTask.task.method;
				this.subTask = subTask;
				for(var i in subTask.opts) if(subTask.opts.hasOwnProperty(i)){
					this.params[i] = subTask.opts[i]
				}
				this.params.se     = subTask.se;
				this.params.query  = subTask.query;
				this.onData        = subTask.opts.onPageData;
				this.noCache       = subTask.opts.noCache;
				this.timeout       = subTask.opts.timeout;
				
				
			} else {
				for(var i in subTask) if(subTask.hasOwnProperty(i)){
					this.params[i] = subTask[i]
				}
				this.api    = subTask.api;
				this.method = subTask.method;
				this.onData = subTask.onPageCompeate;
			}
			if(this.params.se && this.params.se.length>2 && this.params.se[0]==='y' && this.params.se[1]==='_' && this.params.concurrency_from){
				delete this.params.concurrency_from;
			}
			
			var methodInfo =  SerpstatAPI.methods[this.method];
			if(methodInfo){
				this.field     = methodInfo.field;
				this.singleRow = methodInfo.singleRow;
				this.onePage   = methodInfo.onePage;
				this.arrError  = methodInfo.arrError;
			}
			
			if(typeof(num)!='undefined'){
				this.params.page = num+1;
			}
			this.params.page = this.params.page || 1;
			if(page_size){
				this.params.page_size = page_size;
			}
			if(!this.params.page_size){
				this.params.page_size = this.params.limit;
			}
			this.params.page_size = this.params.page_size || 100;
			if(this.params.page_size>1000){
				this.params.page_size = 1000;
			}
			for(var i in serpstatPageSkipParams) if(serpstatPageSkipParams.hasOwnProperty(i)){
				delete this.params[i];
			}
			for(var i in serpstatPageNotNullParams) if(serpstatPageNotNullParams.hasOwnProperty(i)){
				if(!this.params[i] || this.params[i] === '0'){
					delete this.params[i];
				}
			}
			
			this.uri = this.method + '?';
			var arr = []; 
			for(var i in this.params) if(this.params.hasOwnProperty(i)){
				arr.push(i+'='+encodeURIComponent(this.params[i]));
			}		
			this.uri += arr.join('&');	
			
			this.promise = new Promise((resolve,reject)=>{
				this.api.getUri(this.uri,this.noCache,this.timeout).then((data)=>{
					if(data && typeof(data.total)!='undefined'){
						this.total = data.total;
					} else if(data && data.result && typeof(data.result.total)!='undefined'){
						this.total = data.result.total;
					}
					var data = this.data = this.normalizeData(data);
					if(this.onData){
						this.onData(data,this);
					}
					this.storage.onData(data,this);
					resolve(data);
				},reject);
			});
		}
		normalizeData(data){
			if(!data){
				return [];
			}
			var pageData = this.field ? data.result[this.field] : data.result;
			if(this.arrError){
				var arr = [];
				for(var i in pageData) if(pageData.hasOwnProperty(i)){
					arr.push(pageData[i]);
				}
				pageData = arr;
			}
			if(!Array.isArray(pageData)){
				pageData = [pageData];
			}
			for(var i=0;i<pageData.length;i++){
				var row = pageData[i];
				if(typeof(row.position)             !== 'undefined' 
				&& typeof(row.region_queries_count) !== 'undefined'  
				&& typeof(row.traff)                === 'undefined'){
					row.traff = row.region_queries_count * SerpstatAPI.ctrByPos[row.position]/100;
				}
			}
			if(this.subTask){
				for(var i=0;i<pageData.length;i++){
					pageData[i]._se    = this.subTask.se;
					pageData[i]._query = this.subTask.query;
				}
			}
			return pageData;
		}
	};
	
	/*	SerpstatAPI.util.getURL
		Download Data and parse JSON or throw error
	*/
	/*	SerpstatAPI.init
			create instance if not exists
			or return exiting and update its options
	*/
	SerpstatAPI.init = function(opts){
		if(!opts || (!opts.token && !opts.backend)){
			throw new utils.Error('You must specify API-token');
		}
		opts.token = opts.token || '';
		if(!byToken[opts.token]){
			byToken[opts.token] = new SerpstatAPI(opts);
		} else {
			byToken[opts.token].setOptions(opts);
		}
		return byToken[opts.token];
	};
	var methodsByCat = {};
	(function serpstatParseMethods(){
		for(let name in methods) if(methods.hasOwnProperty(name)){
			var arr    		= name.split('_');
			var method 		= methods[name];
			
			method.name     = name;
			method.category = method.category || arr[0];
			method.filters  = method.filters  || []; 
			
			if(!method.maxRows){
				if(method.singleRow){
					method.maxRows = 1;
				}
			}
			
			methodsByCat[method.category]       = methodsByCat[method.category] || {};
			methodsByCat[method.category][name] = method;
			
			for(var i=1;i<arr.length;i++){ //camelCase
				arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
			}
			if(!SerpstatAPI.prototype[name]){
				SerpstatAPI.prototype[name] = SerpstatAPI.prototype[arr.join('')] = function(opts){
					return this.createTask(name,opts);
				}
			}
		}
	})();
	
	SerpstatAPI.prototype.methods      = SerpstatAPI.methods      = methods;
	SerpstatAPI.prototype.methodsByCat = SerpstatAPI.methodsByCat = methodsByCat;
	SerpstatAPI.prototype.byToken      = SerpstatAPI.byToken      = byToken;
	SerpstatAPI.prototype.utils        = SerpstatAPI.utils        = utils;
	SerpstatAPI.prototype.cache        = SerpstatAPI.cache        = cache;
	SerpstatAPI.prototype.ctrByPos     = SerpstatAPI.ctrByPos     = [30,30,15,10,6,4,3,2.2,1.8,1.4,1.1,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	return SerpstatAPI;
}();

try{
	if(typeof module !== 'undefined' && module.exports) {
		module.exports = SerpstatAPI;
	}
} catch(e){};

try{
	if(typeof window !== 'undefined') {
		window.SerpstatAPI = SerpstatAPI;
	}
} catch(e){};
