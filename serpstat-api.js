/*
    Сафари предупреждение
    Много строк пркдупреждение

    Сократить длину URL
    Ускорить большие таблицы в интефрйесе
    Ускорить морф фильтры
    Find landing
    Old Browser Messages
    Cancel / Elapsed time
    Падении при слишком большом числе ключей
    Разобраться с прогресс баром
    Закончить доки.
    Сортировку улучшить в SDK.
    Морф. анализ
	TODO: 
        cheap
		JSON Export
		SQL Export
		export in google docs
    SQL по требованию грузить           
*/

"use strict";
var SerpstatAPI = function(){
	var cache = {
		data    : [],
		maxSize : 10*1000*1000,
		curSize : 0
	};
    var openConnections = 0;
	var methodsArr = [
        {
            name        : 'domain_info',
			title     	: "Domain Summary",
            report      : "Domain Info",
			info      	: "This report provides you with the number of keywords domain uses in SEO and PPC, shows its online visibility and other metrics.",
			singleRow 	: true,//Have one row
			onePage  	: true, //Do not have many pages  
            examples    : ['serpstat.com','99signals.com']
		},{
            name        : 'domain_history',
            report      : "Domain History",
			title 		: "Domain Historical Data",
			info  		: "This report provides you with the historical data on a domains number of keywords and visibility.",
            examples    : ['serpstat.com','99signals.com'],
			onePage 	: true
		},{
            name        : 'domain_keywords',
            report      : "Domain Keywords",
			title 		: "Domain Organic Keywords",
			info  		: "This report shows keywords a domain ranks for in Google top 100 search results.",
			field 	 	: "hits",
			filters  	: ["position","queries","cost","concurrency","keywords","minus_keywords"],//"url",
			sortable 	: ["traff","found_results","position","cost","concurrency"],
            examples    : ['serpstat.com/blog/','99signals.com']
		},{  
            report      : "Domain URLs",
            name        : 'domain_urls',
			title    	: "List of domain's URLs",
			info     	: "Returns the list of URLs within the analyzed domain. Also, shows the number of keywords from top-100 for each URL",
			field    	: "hits",
            examples    : ['99signals.com','serpstat.com/blog/']
		},{
            report      : "Domains Intersection",
            name        : 'domains_intersection',
            slow        : true,
            avTime      : 30,    
			category 	: "domain",  
			title    	: "Domain Common Keywords",
			info     	: "Shows common keywords of 2 or 3 domains.",
            warnings    : ['Processing can take up to 5 minutes'],
			field    	: "hits",
			filters 	: ['domains_combinations',"expandDomains","expand"],
            examples    : ['serpstat.com,99signals.com','serpstat.com/blog/,99signals.com'],
            commaQuery  : true
		},{
            report      : "Domains Uniq Keywords",
            name        : "domains_uniq_keywords",
            slow        : true,
            avTime      : 30,    
			category    : "domain",  
			title 		: "Unique Keywords",
            warnings    : ['Processing can take up to 5 minutes'],
			info  		: "Shows unique keywords of a domain. Keywords that queried domain has in common with Minus Domain are removed from the list.",
			field 	    : "hits",
			filters 	: ["cost","concurrency","minus_domain",'domains_combinations'],//,"expand" "queries",
            examples    : ['serpstat.com/blog/','serpstat.com,99signals.com'],
            commaQuery  : true,
            doublesOn2Queries : true
		},{
            report      : "Domains Keywords Match(SDK)",
            nullDemand  : true, 
            overDemand  : true, 
            name        : 'domains_keywords_match_sdk',
			category 	: "domain",  
            sdk         : true,
			title    	: "Domain keywords client-side comparison",
			info     	: "Shows common keywords of up to 9 domains. Faster and more advanced, but also an expensive alternative to domains_intersection and domain_uniq_keywords",
			field    	: "hits",
			filters   	: ["position","queries","cost","concurrency","keywords","minus_keywords","minus_domain","minus_domain_position","hits_from","expand"],//"url",
			sortable 	: ["traff","found_results","position","cost","concurrency","expand"],
            examples    : ['serpstat.com/blog/','serpstat.com,99signals.com'],
            commaQuery  : false,
            warnings    : [
                'The number of useful results may be much lower than the spent API rows.',
                'If the number of downloaded rows is less than the total rows in the Serpstat, then the results of the method may be unreliable.',
            ],
        },{
            report      : "Competitors",
            name        : 'competitors',
			category 	: "domain",  
			title    	: "Domain Competitors in Organic Search",
			info     	: "This report lists domains competitors in top 20 Google search results.",
            examples    : ['serpstat.com','99signals.com'],
			onePage  	: true,
			maxRows     : 20
		},{
            report      : "Ad Keywords",
            name        : "ad_keywords",
			category 	: "domain",  
			title    	: "Domain Advertising report",
			info     	: "This report shows you ads copies that pop up for the queried keyword in Google paid search results. ",
			field    	: "hits",
			filters  	: ["position","queries","cost","concurrency"],
            examples    : ['serpstat.com/blog/','99signals.com'],
			sortable 	: ["queries","found_results","position","cost","concurrency"]
		},{
            report      : "Domains Ad Keywords Match(SDK)",
            name        : 'domains_ad_keywords_match_sdk',
			category 	: "domain",  
            sdk         : true,
            nullDemand  : true, 
            overDemand  : true, 
			title    	: "Domain Ads keywords client-side comparison",
			info     	: "Shows common Google Ads keywords of up to 9 domains. Local methods more expensive",
			field    	: "hits",
			filters   	: ["queries","found_results","position","cost","concurrency","hits_from","expand"],
			sortable 	: ["position","cost","concurrency"],
            examples    : ['serpstat.com/blog/','serpstat.com,99signals.com'],
            commaQuery  : false,
            warnings    : [
                'The number of useful results may be much lower than the spent API rows.',
                'If the number of downloaded rows is less than the total rows in the Serpstat, then the results of the method may be unreliable.',
            ]
		},{
            report      : "Get Top URLs",
            name        : "get_top_urls",
			category 	: "domain",  
			title    	: "Domain Top Pages",
			info     	: "List of domain URLs sorted by potencial traffic.",
            warnings    : ['Processing can take up to 10-20 minutes'],
			field    	: "hits",// "top_urls"
            examples    : ['serpstat.com/blog/','99signals.com']
		},{
            report      : "Keywords",
            name        : "keywords",
			category 	: "keyword",  
			title    	: "Phrase Match Keywords",
			info     	: "This method uses a full-text search to find all keywords that match the queried term. For every keyword found you will see its volume, CPC, and level of competition.",
			field    	: "hits",
			filters  	: ["queries","cost","concurrency"],//"position",
			sortable 	: ["queries","found_results","position","cost","concurrency","difficulty","minus_keywords"],
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
            doublesOn2Queries : true
		},{
            report      : "Keyword Info",
            name        : "keyword_info",
			category  	: "keyword",  
			title     	: "Keyword Overview",
			info      	: "This report provides you with the keyword overview showing its volume, CPC and level of competition.",
			singleRow 	: true,
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			onePage   	: true  // но лучше смотреть на total
		},{
            report      : "Suggestions",
            name        : "suggestions",
			category 	: "keyword",  
			title    	: "Keyword Search Suggestions",
			info     	: "These report lists autocomplete suggestions for the keyword you requested (they are found by the full-text search).",
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			field    	: "hits",
            doublesOn2Queries : true
        },{
            report      : "Keywords and Suggestions",
            name        : "keywords_and_suggestions",
			category 	: "keyword",  
            sdk         : true,
            overDemand  : true, 
			title    	: "Phrase Match Keywords and Suggestions",
			info     	: "This method uses a full-text search to find all keywords and Google Autocomplete Suggestions that match the queried term. Join of 2 methods: keywords and suggestions.",
			field    	: "hits",
			filters  	: ["position","queries","cost","concurrency"],
			sortable 	: ["queries","found_results","position","cost","concurrency","difficulty"],
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
            limitCoef   : 2,
            doublesOn2Queries : true
		},{
            report      : "Related Keywords",
            name        : 'related_keywords',
			category 	: "keyword",  
			title    	: "Similar Keywords",
			info     	: "This report gives you a comprehensive list of related keywords whose SERP is similar to the one the requested keyword has.",
			field    	: "hits",
			sortable 	: ["weight","queries","found_results","position","cost","concurrency","difficulty"],
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			filters  	: ["weight"],
            doublesOn2Queries : true
		},{
            report      : "Keyword Top",
            name        : 'keyword_top',
			title    	: "Top-100 for a keyword",
			info     	: "This report shows you Google top 100 organic search results for the keyword you requested.",
			field    	: "top",
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			onePage  	: true,  // но лучше смотреть на total
			maxRows     : 100,
			noLimit     : true  
		},{
            report      : "Keyword Top and Info",
            name        : 'keyword_top_and_info',
			title    	: "Top-100 for a keyword (with additional columns)",
			info     	: "This report shows you Google top 100 organic search results for the keyword you requested. With additional columns: frequency, difficulty, traffic, ...",
			field    	: "top",
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			onePage  	: true,  // но лучше смотреть на total
			maxRows     : 101,
			noLimit     : true,
            sdk         : true
		},{
            report      : "Competitors",
            name        : "competitors",
			category 	: "keyword",  
			title    	: "Lists domains that rank for the given keyword in Top-20",
			info     	: "The report lists all domains that rank for the given keyword in Google top 20 results.",
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			onePage  	: true,  // но лучше смотреть на total
			arrError 	: true  
		},{
            report      : "Ad Keywords",
            name        : "ad_keywords",
			category 	: "keyword",  
			title    	: "Advertising report",
			info     	: "This report shows you ads copies that pop up for the queried keyword in Google paid search results.",
			field    	: "hits",
            examples    : ['new york hotel','(new york|ny|n y) (hotel|hostel)'],
			sortable 	: ["queries","found_results","position","cost","concurrency","difficulty"],
            doublesOn2Queries : true
		},{
            report      : "URL Keywords",
            name        : "url_keywords",
			title    	: "URL Organic Keywords",
			info     	: "The report lists keywords that URL ranks for in Google search results.",
			field    	: "hits",
            examples    : ['https://serpstat.com/use-cases/'],
			sortable 	: ["queries","found_results","position","cost","concurrency","difficulty"],
			filters  	: ["position","queries","cost","concurrency"]
		},{
            report      : "URL Keywords (Alt)",
            name        : "url_keywords_alt",
			title    	: "URL Organic Keywords",
			info     	: "Alternative implementation of URL Keywords Report. The report lists keywords that URL ranks for in Google search results.",
			field    	: "hits",
            examples    : ['https://serpstat.com/use-cases/'],
			sortable 	: ["queries","found_results","position","cost","concurrency","difficulty"],
			filters  	: ["position","queries","cost","concurrency","keywords","minus_keywords"]
		},{
            report      : "URL Competitors",
            name        : 'url_competitors',
			title    	: "List of URL competitors",
			info     	: "Shows the list of URLs that compete with a queried URL in organic search.",
            examples    : ['https://serpstat.com/use-cases/'],
			field    	: "hits"
		},{
            report      : "URL Missing Keywords",
            name        : "url_missing_keywords",
			title    	: "URL missing keywords",
			info     	: "Shows a list of keywords that competitors URLs rank for in top-10 but that are missing from the queried page.",
			field    	: "hits",
            examples    : ['https://serpstat.com/use-cases/'],
			filters  	: ["queries"],
            doublesOn2Queries : true
		},{
            name        : "url_keywords_and_missing",
            report      : "URL Keywords and Missing",
			title    	: "URL Organic and Missing Keywords",
			info     	: "Join of 2 methods url_keywords and url_missing_keywords. The report lists keywords that URL and that competitors URLs ranks for in Google search results.",
			field    	: "hits",
            limitCoef   : 2,
            examples    : ['https://serpstat.com/use-cases/'],
			filters  	: ["position","queries","cost","concurrency"],
            overDemand  : true, 
            sdk         : true,
            doublesOn2Queries : true
        },{
            report      : "URLs Keywords Match(SDK)",
            name        : 'urls_keywords_match_sdk',
			category 	: "url",  
			title    	: "URL keywords client-side comparison",
			info     	: "Shows common keywords of up to 9 urls. Local methods more expensive",
			field    	: "hits",
            examples    : ['https://serpstat.com/use-cases/,https://serpstat.com/blog/'],
			filters   	: ["queries","found_results","position","cost","concurrency","difficulty","minus_domain","minus_domain_position","hits_from","expand"],
			sortable 	: ["traff","found_results","position","cost","concurrency"],
            commaQuery  : false,
            sdk         : true,
            nullDemand  : true, 
            overDemand  : true, 
            doublesOn2Queries : true,
            warnings    : [
                'The number of useful results may be much lower than the spent API rows.',
                'If the number of downloaded rows is less than the total rows in the Serpstat, then the results of the method may be unreliable.',
            ]
		}
	];	
    var methods      = {};
	var methodsByCat = {};
	var utils = {
		unixTime: function SerpstatUnixTime(){
			return Math.floor(Date.now()/1000);
		},
		sumStat: function(arr){
			var res = {
				minRows  : 0,
				maxRows  : 0,
				curRows  : 0,
				total    : 0,
				minPages : 0,
				maxPages : 0,
				curPages : 0
			};
			for(var i=0;i<arr.length;i++){
				var cur = arr[i].getStat();
				res.minRows  += cur.minRows;
				res.maxRows  += cur.maxRows;
				res.curRows  += cur.curRows;
				res.minPages += cur.minPages;
				res.maxPages += cur.maxPages;
				res.curPages += cur.curPages;
				res.total    += cur.total;
			}
			return res;
		},
        deepClone(obj){
            if(typeof(obj) !== 'object' || obj==null){
                return obj;
            }
            var res = {};
            if(Array.isArray(obj)){
                res = [];
                for(var i=0;i<obj.length;i++){
                    res.push(utils.deepClone(obj[i]));
                }
            } else {
                if(obj.constructor != Object){
                    return obj;
                }
                for(var i in obj) if(obj.hasOwnProperty(i)){
                    res[i] = utils.deepClone(obj[i]);
                }
            }
            return res;
        },
        clone  : function(obj){
            if(typeof(obj) !== 'object' || obj ===null){
                return obj;
            }
            if(typeof(obj.clone)==='function'){
                return obj.clone();
            }
            if(Array.isArray(obj)){
                return obj.slice(0);
            } 
            var res = {};
            for(var i in obj) if(obj.hasOwnProperty(i)){
                res[i] = obj[i];
            }
            return res;
        },
        extend : function(obj1,obj2){
            var res = {};
            for(var col in obj1) if(obj1.hasOwnProperty(col)){
                res[col] = obj1[col];
            }
            for(var col in obj2) if(obj2.hasOwnProperty(col)){
                res[col] = obj2[col];
            }
            return res;
        },
        parseDomain: function(str){
            str = str.trim();
            for(var protocol in {"https://":1,"https://":1}){
                if(str.startsWith(protocol)){
                    str=str.substring(protocol.length);
                }
            }
            return str.split('/')[0].trim();
        },
        normalizeSE: function(se){
            if(typeof(se) === 'string'){
                se = se.split("/n");
            }
            var res = {};
            for(var i=0;i<se.length;i++){
                var cur = se[i].trim();
                if(cur !== ''){
                    res[cur] = true;
                }
            }
            return Object.keys(res);
        },
        normalizeQuery: function(query,method,opts){
            if(!query){
                return [];
            }
            if(query.query){
                opts  = query;
                query = query.query;
            }
            opts   = opts   || {};
            method = method || opts.method;
            query  = query  || opts.query;
            var isCommaMethod = (method === 'domains_intersection'||method === 'domains_uniq_keywords');
            if(typeof(query)==='string'){
                if(method !== 'url_missing_keywords' && method!=='url_competitors' && method !== 'url_keywords' && method!=='url_keywords_and_missing' && method!=='urls_keywords_match_sdk'){
                    query = utils.Generator.getAllVariants(query,{
                        ignoreEntersInBlocks:true,
                        unic:true,
                        trim:true,
                        notEmpty:true,
                        limit   : 1000,
                        enterSeparated:true,
                        commaSeparated:!isCommaMethod
                    });
                } else {
                    query = query.trim().split('\n');
                }
            }
            
            if(opts.domains_combinations){
                if(opts.domains_combinations === '0'  || opts.domains_combinations === 'false' 
                || opts.domains_combinations === 'no' || opts.domains_combinations === 'none' 
                || opts.domains_combinations === '1'  || opts.domains_combinations === 1){
                    opts.domains_combinations = false;
                } else if(method === 'domains_uniq_keywords'){
                    if(opts.domains_combinations === '2+'){
                        opts.domains_combinations = '2+'
                    } else {
                        opts.domains_combinations = '2-'
                    }
                } else if(method === 'domains_intersection'){
                    if(opts.domains_combinations == '3' || opts.domains_combinations === '3-' || opts.domains_combinations === '3+'){
                        opts.domains_combinations = '3-';  
                    } else {
                        opts.domains_combinations = '2-';  
                    }
                }
            }
            if(typeof(query)==='string'){
                query = query.trim()
                             .split('\r\n').join('\n')
                             .split('\n\n').join('\n')
                             .split('\n\n').join('\n')
                             .split('  ').join(' ')
                             .split('  ').join(' ')
                             .split('  ').join(' ');
                if(isCommaMethod){
                    query = ('\n'+query+'\n')
                        .split(',,').join(',')
                        .split('\n,').join('\n')
                        .split(',\n').join('\n')
                        .trim();
                }             
                if(method === 'domains_intersection'){
                    var arr = query.split('/n');
                    if((arr.length===2||arr.length===3) && !opts.domains_combinations){
                        if(arr.split(',').length===1){
                            query = arr.join(',');
                        }
                    }
                }
            }
            if(isCommaMethod && opts.domains_combinations){
                var tmp     = utils.normalizeSE(query);
                var domains = [];
                for(var i=0;i<tmp.length;i++){
                    domains = domains.concat(tmp[i].split(','));
                }
                query = [];
                domains = utils.normalizeSE(domains);
                if(opts.domains_combinations === '2-' || opts.domains_combinations === '2+' || opts.domains_combinations === '2' || opts.domains_combinations === 2){
                    var isPlus = opts.domains_combinations === '2+';
                    for(var i=0; i<domains.length; i++){
                        for(var j=0; j<domains.length; j++){
                           if(i!==j && (i<j || isPlus)){
                               query.push(domains[i]+','+domains[j])
                           }
                        }
                    }
                } else {
                    for(var i=0; i<domains.length; i++){
                        for(var j=0; j<i; j++){
                            for(var k=0; k<j; k++){
                               query.push(domains[i]+','+domains[j]+','+domains[k]);
                            }
                        }
                    }
                }
            }
            var res = utils.normalizeSE(query);
            if((res.length===2 || res.length===3) 
            && res[0].split(',').length===1
            && method === 'domains_intersection'){
               res = [res.join(',')];
            }
            return res;
        },
		getMaxDemand: function serpstatGetMaxDemand(method,opts,query,se){
            if(typeof(method) === 'object'){
                opts   = method;
                method = opts.method; 
            }
            
            se    = utils.normalizeSE(   se    || opts.se);
            query = utils.normalizeQuery(query || opts.query,opts.method,opts);
            var limit  = opts.limit;
            var nSubtask  = se.length * query.length; 
			var info      = methods[method];
			var maxRows   = 1;
			var maxPages  = 1;
            
            if(!info){
                return {};
            }
            
			if(info && info.singleRow){
				maxRows  = 1;
				maxPages = 1;
			} else if(!limit){
				maxRows  = (info && info.maxRows) ? info.maxRows : 1000;
				maxPages = 1;
			} else if(info && info.onePage){
				maxRows  = (info && info.maxRows && info.maxRows < limit) ? info.maxRows : limit;
				maxPages = 1;
			} else {
                var k =  info ? (info.limitCoef || 1) : 1;
                if(limit<=1000){
                    maxRows  = k*limit;
                    maxPages = k;
                } else {
                    maxPages = k * Math.ceil((limit||1)/1000);
                    maxRows  = k * maxPages * 1000;
                }
			}
            if((method==='domains_keywords_match_sdk' || method==='domains_ad_keywords_match_sdk') && opts.minus_domain){
                var minuses = opts.minus_domain;
                if(typeof(minuses)==='string'){
                    minuses = minuses.trim().split('/n').join(',').split(',,').join(',').split(',,').join(',').split(',,').join(',').split(',');
                }
                if(minuses && minuses.length && minuses[0]){
                    nSubtask += se.length;
                }
            }
            if(method==='urls_keywords_match_sdk' && opts.minus_url){
                if(Array.isArray(opts.minus_url)){
                    nSubtask += se.length * opts.minus_url.length;
                } else if(opts.minus_url.trim()){
                    nSubtask += se.length;
                }
            }
			return {pages: nSubtask*maxPages, rows:nSubtask*maxRows};
		},
        joinTasks: function(tasks,onEnd){
            onEnd = onEnd || function(arr){
                if(!arr.length){
                    return new utils.Table();
                }
                var res = arr[0].clone();
                for(var i=1;i<arr.length;i++){
                    res = res.concat(arr[i]);
                }
                return res;
            }
            var promise  = Promise.all(tasks).then(function(res){
                return onEnd(res);
            });        
   			return (new utils.QuasiPromise(promise, {
				getStat: function(){	
                    return utils.sumStat(tasks);
				}
			}));  
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
        Generator : class SerpstatGenerator{
            constructor(code,opts,type,level){
                opts       = opts  || {};    
                type       = type  || utils.Generator.types.variant;
                level      = level || 0;
                opts.start = opts.start || '(';
                opts.end   = opts.end   || ')';
                opts.next  = opts.next  || '|';
                
                this.type  = type;
                this.code  = code;
                this.opts  = opts;
                this.level = level;
                this.arr   = [];
                
                var sanSpaces = function(code){
                    if(level>1 && opts.ignoreEntersInBlocks){
                        code = code
                            .split('\n').join(' ').split('\t').join(' ').split('\r').join(' ')
                            .split('  ').join(' ').split('  ').join(' ').split('  ').join(' ')
                            .split('  ').join(' ').split('  ').join(' ').split('  ').join(' ');
                    }
                    return code;
                }
                var isVariant = false;
                if(type === utils.Generator.types.variant){
                    if(code.indexOf(opts.start)===-1){
                        this.count = 1;
                        this.code  = sanSpaces(this.code);
                        return;
                    }
                    isVariant = true;
                } else if(type === utils.Generator.types.block){
                    if(code.indexOf(opts.next)===-1){
                        this.count = 1;
                        this.code  = sanSpaces(this.code);
                        return;
                    }
                } else throw new Error('type='+type);
                
                var isBlock = !isVariant;
                var depth   = 0;
                var buffer  = []; 
                for(var i=0;i<code.length;i++){
                    var cur = code[i];
                    var add = true;
                    
                    if(isBlock){
                        if(cur === opts.start){
                            depth++;
                        } else if(cur === opts.end){
                            depth--;
                        } else if(cur === opts.next && !depth){
                            this.arr.push(new utils.Generator(buffer.join(''),opts,utils.Generator.types.variant,level+1));
                            add    = false;
                            buffer = [];
                        }
                    } else {
                        if(cur === opts.start){
                            if(!depth){
                                if(buffer.length){
                                    this.arr.push(new utils.Generator(buffer.join(''),opts,utils.Generator.types.block,level+1));
                                    buffer = [];
                                }
                                add    = false;
                            }
                            depth++;
                        } else if(cur === opts.end){
                            depth--;
                            if(!depth){
                                if(buffer.length){
                                    this.arr.push(new utils.Generator(buffer.join(''),opts,utils.Generator.types.block,level+1));
                                    buffer = [];
                                }
                                add    = false;
                            }
                        }
                    }
                    if(add){
                        buffer.push(cur);
                    }
                }
                if(buffer.length || isBlock){
                   this.arr.push(new utils.Generator(buffer.join(''),opts,isVariant ? utils.Generator.types.block : utils.Generator.types.variant,level+1));
                }
                var count = 0;
                if(!this.arr.length){
                    count = 1;
                } else if(isVariant){
                    count = 1;
                    for(var i=0;i<this.arr.length;i++){
                        count *= this.arr[i].count;
                    }
                } else {
                    for(var i=0;i<this.arr.length;i++){
                        count += this.arr[i].count;
                    }
                }
                if(Object.defineProperty){
                    Object.defineProperty(this, 'count', {
                        value      : count,
                        enumerable : false,
                        writable   : false
                    });
                } else {
                    this.count = count;
                }
            }
            getVariant(num){
                if(!this.arr.length){
                    return this.code;
                }
                if(this.type === utils.Generator.types.block){
                    for(var i=0;i<this.arr.length;i++){
                        var cur = this.arr[i];
                        if(num < cur.count){
                            return cur.getVariant(num);
                        } else {
                            num -= cur.count;
                        }
                    }
                    throw new Error('Something gone wrong');
                }
                var res = [];
                for(var i=0;i<this.arr.length;i++){
                    var cur = this.arr[i];
                    var tmp = num % cur.count;
                    res.push(cur.getVariant(tmp))
                    num = (num-tmp)/cur.count;  
                }
                return res.join('');
            }
            getAllVariants(){
                var res = [];
                if(!this.arr.length){
                    res = [this.code];
                } else {
                    var max = this.count;
                    if(this.opts.limit && this.opts.limit<this.count){
                        max = this.opts.limit ;
                    }
                    for(var i=0;i< this.count;i++){
                        res.push(this.getVariant(i));    
                    }
                }
                Object.defineProperty(res, 'count', {
                    value      : this.count,
                    enumerable : false,
                    writable   : false
                });
                if(this.level){
                    return res;
                }
                if(this.opts.enterSeparated){
                    var tmp = [];
                    for(var i=0;i< res.length;i++){
                        tmp = tmp.concat(res[i].split('\n'));    
                    }
                    res = tmp;
                }
                if(this.opts.commaSeparated){
                    var tmp = [];
                    for(var i=0;i< res.length;i++){
                        tmp = tmp.concat(res[i].split(','));    
                    }
                    res = tmp;
                }
                
                if(this.opts.trim){
                    var tmp = [];
                    for(var i=0;i< res.length;i++){
                        tmp.push(res[i].trim());    
                    }
                    res = tmp;
                }
                
                if(this.opts.unic){
                    var tmp = {};
                    for(var i=0;i< res.length;i++){
                        tmp[res[i]] = true;    
                    }
                    res = Object.keys(tmp);
                } 
                
                if(this.opts.notEmpty){
                    var tmp = [];
                    for(var i=0;i< res.length;i++){
                        if(res[i]){
                            tmp.push(res[i]);    
                        }
                    }
                    res = tmp;
                }
                return res;
            }
        },
        Table: class SerpstatTable extends Array {
            constructor(opts, doNotApplyData){
                super();
                for(var name in utils.Table.opts){
                    var val = typeof(opts[name])==='undefined' ? utils.Table.opts[name] : opts[name];
                    val = utils.clone(val);
                    if(Object.defineProperty){
                        Object.defineProperty(this, name, {
                            value: val,
                            enumerable : false,
                            writable   : true
                        });
                    } else {
                        this[name] = val;
                    }
                }
                if(!opts.cols){
                    opts.numCols = 0;
                }
                if(opts instanceof utils.Table) {
                    if(!doNotApplyData){
                        this.push(opts);
                    }
                    this.total      = opts.total;
                    this.downloaded = opts.downloaded;
                } else {
                    var data = (!opts.data && Array.isArray(opts)) ? opts : opts.data;
                    if(data){
                        if(typeof(opts.dimensions) === 'undefined'){
                            this.detectDimensions(data);
                        }
                        if(!doNotApplyData){
                            //Bug fix. DO NOT USE this.push.apply(this,data); -- max call stack 
                            for(var i=0;i<data.length;i++){
                                this.push(data[i]);
                            }
                        }
                        if(opts.downloaded){
                            this.downloaded = opts.downloaded;
                        }
                        if(opts.total){
                            this.total      = opts.total;
                        }
                    }
                }
            }
            getCell(row,col){
                if(this.compressed){
                    return this[row][this.cols[col]];
                } else {
                    return this[row][col];
                }
            }
            detectDimensions(data){
                this.dimensions   = this.dimensions || {};
                if(data instanceof utils.Table){
                    for(var col in data.cols) if(data.cols.hasOwnProperty(col)){
                        if(utils.Table.dimNames[col]){
                            this.dimensions[col] = true;
                        }
                    }
                } else {
                    for(var i=0;i<data.length;i++){
                        var row = data[i];
                        for(var col in row) if(row.hasOwnProperty(col)){
                            if(utils.Table.dimNames[col]){
                                this.dimensions[col] = true;
                            }
                        }
                    }
                }
            }
            toArrayOfObject(){
                if(!this.compressed){
                    return this;
                } else {
                    return this.clone().setCompression(false); 
                }
            }
            setCompression(compressed){
                compressed = !(!compressed);
                if(this.compressed == compressed){
                    return;
                } 
                this.compressed = compressed;
                if(compressed){
                    for(var i=0;i<this.length;i++){
                       this[i] = this.compressRow(this[i]);  
                    }
                } else {
                    for(var i=0;i<this.length;i++){
                       this[i] = this.decompressRow(this[i]);  
                    }
                }
            }
            compressRow(row){
                var res = {};
                for(var col in row) if(row.hasOwnProperty(col)){
                    this.defineCol(col);
                    res[this.cols[col]] = row[col];
                }
                return res; 
            }
            decompressRow(row){
                var res = [];
                for(var i=0;i<this.cols.length;i++){
                    res[i] = row[this.cols[col]];
                }
                return res; 
            }
            push(data){
                if(arguments.length !== 1){
                    for(var i=0;i<arguments.length;i++){
                        this.push(arguments[i]);
                    }
                } else if(data instanceof utils.Table) {
                    if(!data.length){
                        return this.length;
                    }
                    this.total      += data.total;
                    this.downloaded += data.downloaded;
                    for(var method in data.methods) if(data.methods.hasOwnProperty(method)){
                        this.methods[method] = data.methods[method];   
                    }
                    this.dimensions = this.joinDimensions(this,data);
                    if(!data.compressed){
                        //Bug fix. DO NOT USE this.push.apply(this,data); -- max call stack 
                        for(var i=0;i<data.length;i++){
                           this.push(data[i]);
                        }
                    } else {
                        var rename = [];
                        var isSame = true;
                        for(var col in data.cols) if(data.cols.hasOwnProperty(col)){
                            this.defineCol(col);
                            var from = data.cols[col];
                            var to   = this.compressed ? this.cols[col] : col;
                            if(isSame && to !== from){
                                isSame = false;
                            }
                            rename[from] = to; 
                        }
                        if(isSame){
                            //Bug fix. DO NOT USE super.push.apply(this,data); -- max call stack 
                            for(var i=0;i<data.length;i++){
                                super.call.push(this,data[i]);
                            }
                        } else {
                            for(var i=0;i<data.length;i++){
                                var row = data[i];
                                var res = this.compressed ? [] : {};
                                for(var j=0;j<rename.length;j++){
                                    if(typeof(rename[j])!=='undefined'){
                                        res[rename[j]] = row[j];
                                    }
                                }
                                super.push(res);
                            }
                        }
                    }
                } else {
                    if(Array.isArray(data)){
                        throw new Error('Table.push(Array) is not support. Use Table.push(Object row) or Table.push(Table table)');
                    }
                    for(var col in data) if(data.hasOwnProperty(col)){
                        this.defineCol(col);
                    }
                    if(this.compressed){
                        super.push(this.compressRow(data));
                    } else {
                        super.push(data);
                    }
                }
                return this.length;
            }
            defineCol(col){
                if(typeof(this.cols[col])==='undefined'){
                    this.cols[col] = this.numCols;
                    this.numCols++;
                }
            }
            joinDimensions(table1,table2){
                if(!table1.length){
                    return utils.clone(table2.dimensions);
                }
                if(!table2.length){
                    return utils.clone(table1.dimensions);
                }
                if(!table1.dimensions || !table2.dimensions){
                    return null;
                }
                var dimensions = null;
                var was = {};
                for(var name in table1.dimensions) if(table1.dimensions.hasOwnProperty(name)){
                    was[name] = true;
                } 
                dimensions = {};
                for(var name in table2.dimensions) if(table2.dimensions.hasOwnProperty(name)){
                    if(was[name]){
                       dimensions[name] = true;
                    }
                } 
                if(typeof(table1.dimensions._is_ad)!=='undefined' || typeof(table2.dimensions._is_ad)!=='undefined'){
                    dimensions._is_ad = true;
                }
                return dimensions;
            }
            concat(data){
                if(arguments.length !== 1){
                    var res = this;
                    for (var i=0; i < arguments.length; i++) {
                        res = res.concat(arguments[i]);
                    }
                    return res;
                } 
                if(!Array.isArray(data)){
                    throw new Error('Wrong .concat param: Correct params .concat(Array) or .concat(Table)');
                }
                if(!data.length){
                    return this.clone();
                }
                if(typeof(data[0])!=='object'){
                     throw new Error('Wrong .concat param: Correct params .concat(Array of Object) or .concat(Table)');
                }
                if(!(data instanceof utils.Table)){
                    data = new utils.Table({data:data});
                }
                if(!this.length){
                    return data.clone();
                }
                var res = new utils.Table({
                    dimensions : this.joinDimensions(this,data),
                    compressed : this.compressed
                });
                res.push(this);
                res.push(data);
                return res;
            }
            removeDuplicates(){
                if(!this.dimensions){
                    return this.clone();
                }
                var dims = Object.keys(this.dimensions);
                var cols = Object.keys(this.cols);
                if(this.compressed){
                    var tmp = [];
                    for(var i=0;i<dims.length;i++){
                        tmp.push(dims[i]);
                    }
                    dims = tmp;
                    
                    var tmp = [];
                    for(var i=0;i<cols.length;i++){
                        tmp.push(cols[i]);
                    }
                    cols = tmp;
                }
                var data = [];
                var byCs = {};
                
                for(var i=0;i<this.length;i++){
                    var row = this[i];
                    var cs  = [];
                    for(var j=0;j<dims.length;j++){
                        cs.push(row[dims[j]]);
                    }
                    cs = cs.join('<~>');
                    if(typeof(byCs[cs])==='undefined'){
                        byCs[cs] = [];
                    }
                    byCs[cs].push(row);
                }
                for(var cs in byCs) if(byCs.hasOwnProperty(cs)){
                    var rows = byCs[cs];
                    var row  = this.compressed ? [] : {};
                    for(var j=0;j<cols.length;j++){
                        var colIndex = cols[j];
                        if(rows.length>1){
                            var trrs = 8;
                        }
                        for(var i=0;i<rows.length;i++){
                            var val = rows[i][colIndex];
                            if(typeof(val) !== 'undefined'){
                                row[colIndex] = val;
                                break;
                            }
                        }
                    }
                    data.push(row);
                }
                var opts = {
                    data : data
                };
                for(var i in utils.Table.opts){
                    opts[i] = utils.clone(this[i]);
                }
                var res = new utils.Table(opts);
                Object.defineProperty(res, 'dirtyRows', {
                    value      : this.dirtyRows || this.length,
                    enumerable : false,
                    writable   : false
                });
                return res;
            }
            clone(){
                return new utils.Table(this);
            }
            cloneMeta(){
                return new utils.Table(this,true);
            }
            canExpandDomains(){
                return (typeof(this.cols['domain1'])!=='undefined' 
                     || typeof(this.cols['domain2'])!=='undefined');
            }
            expandDomains(){
                if(this.compressed){
                    this.setCompression(false);
                    var res = this.expand(); 
                    this.setCompression(true);
                    return res;
                }
                if(!this.canExpandDomains()){
                    return this.clone();
                }
                var domainCols = {
                    domain:true,
                    subdomain:true,
                    url:true,
                    dynamic:true,
                    traff:true,
                    position : true
                };
                var allRenames = [];
                
                for(var j=0;j<10;j++){
                    var aff = j!==0 ? (''+j) : '';
                    if(!this.cols['domain'+aff]){
                        allRenames.push(false);
                        continue;
                    }
                    var renames = {};
                    for(var col in this.cols) if(this.cols.hasOwnProperty(col)){
                        var tCol = j!==0 ? col.slice(0, -1) : col;
                        if(domainCols[tCol]){
                            if(tCol + aff === col){
                                renames[tCol] = col;
                            }
                        } else {
                            renames[col] = col;
                        }
                    }
                    allRenames.push(renames);
                }
                var res = [];
                for(var i=0;i<this.length;i++){
                    var row = this[i];
                    for(var j=0;j<10;j++){
                        var renames = allRenames[j];
                        if(!renames || !row['domain'+(j!==0 ? (''+j) : '')]){
                            continue;
                        }
                        var newRow = {};
                        for(var toCol in renames) if(renames.hasOwnProperty(toCol)){
                            newRow[toCol] = row[renames[toCol]];
                        }
                        res.push(newRow);
                    }
                }
                var opts = {
                    data:res
                }
                for(var i in utils.Table.opts){
                    opts[i] = utils.clone(this[i]);
                }
                
                delete opts.cols;
                delete opts.numCols;
                delete opts.dimensions;
                
                return new utils.Table(opts);
            }
            getSortedCols(){
                var cols = [];
                for(var col in this.cols) if(this.cols.hasOwnProperty(col)){
                    cols.push({
                        name  : col, 
                        order : utils.Table.colsOrder[col] || (100500 + col.length),
                    })
                }
                cols.sort(function (a,b){
                    return a.order - b.order;
                })
                var res = [];
                for(var i=0;i<cols.length;i++){
                    res.push(cols[i].name);
                }
                return res;
            }
            applyColsOrder(cols){
                cols = cols || this.getSortedCols();
                if(this.compressed){
                    throw new Error('Not .applyColsOrder() supports on compressed');
                }
                for(var i=0;i<this.length;i++){
                    var row = this[i];
                    var res = {};
                    for(var j=0;j<cols.length;j++){
                        var col  = cols[j];
                        res[col] = row[col];
                    }
                    this[i] = res;
                }
            }
            _encodeCell(val,opts){
				if(typeof(val)==='undefined'){
					val = opts.undefinedText;
				} else if(typeof(val)!=='string'){
                    if(Array.isArray(val)){
                        val = val.join(', ');
                    } else {
                        var val0 = val;
                        val = val+'';
                        //digit separator. Example 1.234 => 1,234 
                        if(typeof(val0) === 'number' && opts.digitSeparator!=='.' && val.indexOf('.')!==-1){
                            val = val.split('.').join(opts.digitSeparator);
                        }
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
			}
            toCSV(opts){
   				opts                = opts                || {};
				opts.rowSeparator   = opts.rowSeparator   || "\r\n";
				opts.cellSeparator  = opts.cellSeparator  || "\t";
				opts.digitSeparator = opts.digitSeparator || ".";
				opts.undefinedText  = opts.undefinedText  || "";
                var cols            = opts.cols           || this.getSortedCols();
                if(opts.rowSeparator==='unix'||opts.rowSeparator==='\\n'){
					opts.rowSeparator = '\n';
				} else if(opts.rowSeparator==='win'||opts.rowSeparator==='windows'||opts.rowSeparator==='\\r\\n'){
					opts.rowSeparator = '\r\n';
				}
				if(opts.cellSeparator==='tab'||opts.rowSeparator==='\\t'){
					opts.rowSeparator = '\t';
				}
				var res = [];
				if(!opts.skipHeader){
					var arr = [];
					for(var j=0;j<cols.length;j++){
						arr.push(this._encodeCell(cols[j],opts));
					}
					res.push(arr.join(opts.cellSeparator));
				}
                if(this.compressed){
                    var colIndexes = [];
                    for(var j=0;j<cols.length;j++){
                        colIndexes.push(this.cols[cols[j]]);
                    }
                }
                for(var i=0;i<this.length;i++){
                    var row = this[i];
                    var arr = [];
                    for(var j=0;j<cols.length;j++){
                        arr.push(this._encodeCell(
                            row[this.compressed ? colIndexes[j] : cols[j]]
                        ,opts));
                    }
                    res.push(arr.join(opts.cellSeparator));
                }
				return res.join(opts.rowSeparator)+opts.rowSeparator;
            }
        },        
		QuasiPromise: class SerpstatQuasiPromise{
			constructor(promise, methods){//methods=undefined
				this.promise = promise;
				if(methods){
					for(var method in methods) if(methods.hasOwnProperty(method)){
						this[method] = methods[method];
					}
                    this.methods = methods;
				}
			}
			then(f1,f2){//f2=undefined
                return this.promise.then(f1,f2);
			} 
			catch(f1){
                return this.promise.catch(f1);
			}
		},
		getURL: function serpstatGetURL(url, noCache, timeout){
			timeout = timeout || 12*60*60*1000;
			if(noCache){
				url += (url.indexOf('?')===-1 && url.indexOf('&')===-1) ? '?' : '&';
				url += 'x_no_cache='+Date.now();
			} else if(url.indexOf('?x_no_cache=')!=-1 || url.indexOf('&x_no_cache=')!=-1){
				noCache = true;
			}
			if(!noCache && cache.data[url]){
				var cur = cache.data[url];
				var res = cur.val;
                if(res){
                    res = JSON.parse(cur.val);
                    if(res.hits && res.header){//decode data
                        var hits = [];
                        for(var i=0;i<res.hits.length;i++){
                            var row  = res.hits[i];
                            var row2 = {};
                            for(var j=0;j<res.header.length;j++){
                                row2[res.header[j]] = row[j];
                            }
                            hits.push(row2);
                        }
                        res.hits = hits;
                    }    
                }
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
            openConnections++;
			return new Promise(function(resolve0,reject){
				var wasEnd   = false;
				var _timeout = false;setTimeout(function(){
					if(wasEnd) return;
					wasEnd = true;
					if(_timeout) clearTimeout(_timeout);
                    openConnections--;
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
                            if(data.hits && data.hits.length>10){ //encode data
                                val  = JSON.parse(val);//clone
                                var header = {};
                                for(var i=0;i<val.hits.length;i++){
                                    var row = val.hits[i];
                                    for(var col in row) if(row.hasOwnProperty(col)){
                                        header[col] = true;
                                    }
                                }
                                header = Object.keys(header);
                                val.header = header;
                                
                                var hits = [];
                                for(var i=0;i<val.hits.length;i++){
                                    var row  = val.hits[i];
                                    var row2 = [];
                                    for(var j=0;j<header.length;j++){
                                        row2[j] = row[header[j]];
                                    }
                                    hits.push(row2);
                                }
                                val.hits = hits;
                                val  = JSON.stringify(val);
                            }
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
                    openConnections--;
					if(_timeout) clearTimeout(_timeout);
					wasEnd = true;
					statusCode = 1*statusCode;
					if(err){
						return reject(err);
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
    var lastGenCode = false;
    var lastGenOpts = false;
    var lastGenRes  = false;
    utils.Generator.getAllVariants = function(code,opts){
        if(lastGenCode===code && lastGenRes){
            var isAll = true;
            if((opts && !lastGenOpts)||(!opts &&  lastGenOpts)){
                isAll = false;
            } else if(opts){
                for(var i in opts){
                    if(opts[i]!==lastGenOpts[i]){
                        isAll = false;
                        break;
                    }
                }
            }
            if(isAll){
                return utils.clone(lastGenRes);
            }
        }
        var gen = new utils.Generator(code,opts);
        var res = gen.getAllVariants();
        lastGenRes  = utils.clone(res);
        lastGenOpts = utils.clone(opts);
        lastGenCode = utils.clone(code);
        return res;
    };
    utils.Generator.types={
        block   : 2,
        variant : 3,
    };        
    utils.Table.join = function(arr){
        if(!arr.length){
            return new utils.Table({data:[]});
        }  
        var res = arr[0].clone();
        for(var i=1;i<arr.length;i++){
            res.push(arr[i]);
        }
        return res;
    };
    utils.Table.opts = {
        total      : 0,
        downloaded : 0,
        dimensions : null,
        cols       : {},
        numCols    : 0,
        methods    : {},
        compressed : false
    }; 
    utils.Table.dimNames = {'keyword':1, 'db_name':1,
                            '_se':1, '_is_ad':1,'_d_date':1,
                            '_competitor_for_domain':1, '_competitor_for_url':1,
                            'url':1,'domain':1,'my_url':1,'my_domain':1,
                            'url1':1,'domain1':1,'url2':1,'domain2':1,'url3':1,'domain3':1,
                            'url4':1,'domain4':1,'url5':1,'domain5':1,'url6':1,'domain6':1,
                            'url7':1,'domain7':1,'url8':1,'domain8':1,'url9':1,'domain9':1,
                            'position':1,'my_position':1,'position1':1,'position2':1,'position3':1,'position4':1,'position5':1,'position6':1,'position7':1,'position8':1,'position9':1
    };

    
    utils.Table.colsOrderArr = [
        '_se','keyword','region_queries_count','cost','concurrency','queries_cost',
        'type',
        'my_domain', 'my_subdomain',  'my_url',  'my_position',  'my_traff', 'my_dynamic', 'my_traff_cost', 
        'domain'   , 'subdomain',  'url',  'intersected', 'not_intersected', 'relevance', 'our_relevance','position',  'traff', 'dynamic',  'traff_cost', 
        'domain1'  , 'subdomain1', 'url1', 'position1', 'traff1','dynamic1', 'traff_cost1', 
        'domain2'  , 'subdomain2', 'url2', 'position2', 'traff2','dynamic2', 'traff_cost2', 
        'domain3'  , 'subdomain3', 'url3', 'position3', 'traff3','dynamic3', 'traff_cost3', 
        'domain4'  , 'subdomain4', 'url4', 'position4', 'traff4','dynamic4', 'traff_cost4', 
        'domain5'  , 'subdomain5', 'url5', 'position5', 'traff5','dynamic5', 'traff_cost5', 
        'domain6'  , 'subdomain6', 'url6', 'position6', 'traff6','dynamic6', 'traff_cost6', 
        'domain7'  , 'subdomain7', 'url7', 'position7', 'traff7','dynamic7', 'traff_cost7', 
        'domain8'  , 'subdomain8', 'url8', 'position8', 'traff8','dynamic8', 'traff_cost8', 
        'domain9'  , 'subdomain9', 'url9', 'position9', 'traff9','dynamic9', 'traff_cost9', 
        'cnt',
        'title','text',
        "organic_keywords","facebook_shares","linkedin_shares","google_shares","potencial_traff",
        'region_queries_count_wide','region_queries_count_last',
        'keyword_length', 'found_results', 
        'types','geo_names','right_spelling',
        'visible','keywords',
        'visible_dynamic','keywords_dynamic','traff_dynamic',
        'date','prev_date',
        'new_keywords','out_keywords','rised_keywords','down_keywords',
        'ad_keywords','ads','ads_dynamic',
        '_query','_hits',
        'keyword_crc','url_crc','keyword_id','url_id','CRC ','CRC',' CRC','_id'
    ];
    utils.Table.colsOrder = {};
    for(var i=0;i<utils.Table.colsOrderArr.length;i++){
        utils.Table.colsOrder[utils.Table.colsOrderArr[i]] = i+1; 
    }
	var byToken = {}; //api instances by token
	class SerpstatAPI extends utils.QuasiPromise {// 
		constructor(opts){
			super();
			if(!opts || (!opts.token && !opts.backend)){
				throw new utils.Error('You must specify API-token');
			}
			byToken[opts.token]    = this;

			opts.requestsPerSecond = opts.requestsPerSecond  	|| 0.9;
			opts.backend       	   = opts.backend    			|| "https://api.serpstat.com/v3/";
			opts.maxRetry      	   = opts.maxRetry   			|| 5;
			opts.retryPause        = opts.retryPause 			|| 5  * 1000;
			opts.timeout           = opts.timeout 			    || 12 * 60 * 60 * 1000;
			opts.se                = opts.se         		  	|| 'g_us';
			opts.limit             = opts.limit             	|| 100;
			
            if(opts.requestsPerSecond>10){
                opts.requestsPerSecond = 10;
            }
            
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
					
                    var res = new utils.Table([data.result]);
                    resolve(res);
					return res;
				},reject);
			});
		}
		databases_info(){ 
			return new Promise((resolve,reject)=>{
				this.getUri('databases_info').then((data)=>{
					SerpstatAPI.databases = SerpstatAPI.prototype.databases = data.result;
                    
                    var res = new utils.Table(data.result);
                    resolve(res);
					return res;
				},reject);
			});
		}
		databasesInfo(){
			return this.databases_info();
		}
        _url_keywords_alt(opts0){
            var tasks   = [];
            var queries = utils.normalizeQuery(opts0.query,'url_keywords',opts0); 
            for(var i=0; i<queries.length; i++){
                var url    = queries[i];
                var domain = url;
                if(domain.split('//',2).length > 1){
                    domain = domain.split('//',2)
                    domain = domain[1];
                }
                domain = domain.split('/',2)
                domain = domain[0];
                var opts = utils.clone(opts0);
                delete opts.pm_url;
                opts.query = domain;
                opts.url   = url;
                tasks.push(this.domain_keywords(opts));
            }
            return utils.joinTasks(tasks);
        }
		_keyword_top_and_info(opts){
			function calcCS(row){
				return row._se+'|'+row._query;
			}
            return utils.joinTasks([this.keywordTop(opts),this.keywordInfo(opts)],function(res){
                var keyTop  = res[0];
                var keyInfo = res[1];
                
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
						row.traff = info.region_queries_count * (SerpstatAPI.ctrByPos[row.position] || 0)/100;
					}
				}
                return new utils.Table({
                    data       : keyTop,
                    total      : keyTop.total,
                    downloaded : keyTop.downloaded,
                });
                //return keyTop;
            });
		}
        _keywords_and_suggestions(opts){
            return utils.joinTasks([this.keywords(opts),this.suggestions(opts)],function(res){
                var keywords    = res[0];
                var suggestions = res[1];
                for(var i=0;i<suggestions.length;i++){
                    var cur = suggestions[i];
                    cur.region_queries_count = 5;
                    cur.keyword_length       = cur.keyword.split(' ').length;
                }
                return keywords.concat(suggestions);        
            });
        }
        _url_keywords_and_missing(opts){
            var opts2 = utils.clone(opts);
            delete opts2.position_from;
            delete opts2.position_to;
            return utils.joinTasks([this.url_keywords(opts),this.url_missing_keywords(opts2)],function(res){
                var keywords = res[0];
                var missing  = res[1];
                for(var i=0;i<missing.length;i++){
                    var cur      = missing[i];
                    cur.traff    = 0;
                    cur.position = 101;
                }
                return keywords.concat(missing);
            });
        }
        _urls_keywords_match_sdk(opts){
            opts.base_method = (opts.base_method==='url_keywords_alt') ? opts.base_method : 'url_keywords';
            return this._domains_keywords_match_sdk(opts);
        }
        _domains_ad_keywords_match_sdk(opts){
            opts.base_method = 'ad_keywords';
            return this._domains_keywords_match_sdk(opts);
        }
        _domains_keywords_match_sdk(opts){
            opts.base_method = opts.base_method || 'domain_keywords';
            var pluses  = utils.normalizeQuery(opts.query,
                (opts.base_method !== 'url_keywords' && opts.base_method !== 'url_keywords_alt')
                ? 'domains_keywords_match_sdk' 
                : 'url_keywords'
            , opts);
            var tasks   = []; 
            for(var i=0; i<pluses.length; i++){
                tasks.push(this[opts.base_method](utils.extend(opts,{
                    method : opts.base_method,
                    query  : pluses[i],
                    minus_domain   : undefined,
                    remove_duplicates: false,
                    expand: false
                }))); 
            }
            var minuses  = [];
            if(opts.base_method ==='url_keywords' || opts.base_method ==='url_keywords_alt'){
                if(Array.isArray(opts.minus_url)){
                    minuses = opts.minus_url;
                } else if(opts.minus_url && opts.minus_url.trim && opts.minus_url.trim()) {
                    minuses = [opts.minus_url];
                }
            } else {
                var minuses = opts.minus_domain;
                if(typeof(minuses)==='string'){
                    minuses = minuses.trim().split('/n').join(',').split(',,').join(',').split(',,').join(',').split(',,').join(',').split(' ').join('').split(',');
                }
                if(!minuses || !minuses.length || !minuses[0]){
                    minuses = [];
                }
            }
            for(var i=0; i<minuses.length; i++){
                //minus_domain_position_from  : 1,
                //minus_domain_position_to    : 1,
                tasks.push(this[opts.base_method](utils.extend(opts,{
                    method         : opts.base_method,                    
                    query          : minuses[i],
                    position_from  : opts.minus_domain_position_from,  
                    position_to    : opts.minus_domain_position_to,
                    minus_domain   : undefined,
                    remove_duplicates: false,
                    expand: false
                }))); 
            }           
            let minHits  = opts.hits_from;
            if(!minHits){
                if(opts.minus_domain || pluses.length===1){
                   minHits = 1;
                } else {
                   minHits = 2;
                }
            }
            var isAd     = (opts.base_method === 'ad_keywords');
            return utils.joinTasks(tasks,(res)=>{
                var index = {}; 
                var total      = 0;
                var downloaded = 0;
                var minused    = {};
                for(var t=0;t<res.length;t++){
                    var positive = (t<pluses.length);
                    var data = res[t];
                    
                    total      += data.total;
                    downloaded += data.downloaded;
                    
                    for(var i=0;i<data.length;i++){
                        var row = data[i];
                        var cs  = row._se +'<_()_>'+row.keyword;
                        if(!index[cs] && positive){
                            index[cs] = [];
                            for(var t2=0;t2<pluses.length;t2++){
                                index[cs].push(undefined);
                            }
                        }
                        if(positive){
                            index[cs][t] = row;
                        } else {
                            minused[cs] = true; 
                        }
                    }
                }
                var table = [];
                for(var cs in index) if(index.hasOwnProperty(cs)){
                    var rows  = index[cs];
                    var first = null;
                    var nHits = 0;
                    for(var i = 0; i<rows.length;i++){
                        if(rows[i]){
                            first = first || rows[i];
                            nHits++;
                        }
                    }
                    if(!nHits || nHits<minHits || minused[cs]){
                        continue;
                    }
                    var row = {
                        keyword                     : first.keyword,
                        keyword_length              : first.keyword_length || first.keyword.split(' ').length,
                        date                        : first.date,   
                        types                       : first.types,   
                        found_results               : first.found_results,
                        cost                        : first.cost,
                        concurrency                 : first.concurrency, 
                        region_queries_count        : first.region_queries_count, 
                        region_queries_count_wide   : first.region_queries_count_wide, 
                        region_queries_count_last   : first.region_queries_count_last, 
                        geo_names                   : first.geo_names, 
                        right_spelling              : first.right_spelling,
                        _hits                       : 0
                    }; 
                    for(var j=0; j<rows.length;j++){
                        var row0 = rows[j];
                        var aff  = (j+1)+'';
                        if(row0){
                            row['domain'+aff]    = row0.domain;
                            row['subdomain'+aff] = row0.subdomain;
                            row['url'+aff]       = row0.url;
                            row['position'+aff]  = row0.position;
                            row['dynamic'+aff]   = row0.dynamic;
                            row['traff'+aff]     = row0.traff;
                            if(isAd){
                                row['title'+aff]  = row0.title;
                                row['text'+aff]   = row0.text;
                            }
                            row._hits ++;
                        }
                    }                        
                    if(isAd){ 
                        row._is_ad                 = 1;
                    }
                    table.push(row);
                }
                return new utils.Table({
                    data       : table,
                    total      : total,
                    downloaded : downloaded,
                });
            });
        }
		createTask(method,opts){//Make some request to download data 
			if(method.method && !opts){
				opts   = method;
				method = method.method;
			} else {
				opts = opts || {};
			}
            var expand  = opts.expand;
            var doubles = opts.remove_duplicates;
            delete opts.expand;
            delete opts.remove_duplicates;
            var task;
			if(method==='databases_info'){
				return this.databases_info();
			} else if(method==='stats'){ 
				return this.stats();
			} else if(this['_'+method]){ 
				task = this['_'+method](opts);
			} else {
				task = new SerpstatTask(this,method,opts);
			}
            if(this.session){
                this.session.tasks.push(task);
            }
            var promise = new Promise((resolve,reject)=>{
                task.then((res)=>{
                    if(expand){
                       res = res.expandDomains();
                    }
                    if(doubles){
                       res = res.removeDuplicates();
                    }
                    res.methods = {};
                    res.methods[method] = true;
                    resolve(res);
                    return res;
                },reject);
            });
            promise.getStat = function(){
                return task.getStat();
            };
            return promise;
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
        patchAlasql(alasql, errorHandler){
            var encodeCode = function(code){
               var res   = '';
               var buf   = '';
               var lev   = 0;
               var cur,prev1,prev2;
               for(var i=0;i<code.length;i++){
                    var next = '';
                    prev2 = prev1;
                    prev1 = cur;
                    cur   = code[i];
                    if(cur==='<' && prev1==='<' && prev2==='<'){
                        if(lev===0){
                            res += buf;
                            buf =  '';
                        } else {
                            buf = buf.split('"').join('___dkv_l_'+lev+'___');
                            buf = buf.split("'").join('___skv_l_'+lev+'___');
                        }
                        lev++;
                        next = lev; 
                    }
                    if(cur==='>' && prev1==='>' && prev2==='>' && lev>0){
                        var tmp = buf.split('--').join('\n--').split('\n');
                        var arr = [];
                        for(var j=0;j<tmp.length;j++){
                            var str = tmp[j].trim();
                            if(str[0]!=='-' || str[1]!=='-'){
                                arr.push(str);
                            }
                        }
                        buf = arr.join(' ');
                        buf = buf.split('"').join('___dkv_l_'+lev+'___');
                        buf = buf.split("'").join('___skv_l_'+lev+'___');
                        res += buf;
                        buf =  '';
                        lev--;
                    }
                    buf += cur + next;
                }
                return res + buf;
            }
            alasql.serpstatPromise = function(arr,a1,a2,a3,a4,a5,a6,a7){
                if(typeof(arr)==='string'){
                    return alasql.promise(encodeCode(arr),a1,a2,a3,a4,a5,a6,a7);
                }
                for(var i=0;i<arr.length;i++){
                    arr[i]  = encodeCode(arr[i]);
                }
                return alasql.promise(arr,a1,a2,a3,a4,a5,a6,a7);
            }
            var self     = this;
            var operator = '<<<'; 
            alasql.from.SERPSTAT = function(dbtype, opts, cb, idx, query){
                opts = opts || {};
                var promises      = [];
                var pendingFields = [];
                for(var name in opts) if(opts.hasOwnProperty(name)){
                    var val = opts[name];
                    if(typeof(val) === 'string' && val.indexOf(operator)===0){
                        pendingFields.push(name);
                        val     = val.substring(operator.length);
                        var lev = val[0]*1;
                        val     = val.substring(1);
                        val     = val.split('___dkv_l_'+lev+'___').join('"');
                        val     = val.split('___skv_l_'+lev+'___').join("'");
                        val     = val.trim();
                        val     = val.substring(0,val.length-3);
                        promises.push(alasql.promise(val));
                    }
                }
                var onError = function(err){
                    if(errorHandler){
                        errorHandler(err, dbtype, opts, cb, idx, query);
                    } else {
                        cb([], idx, query);
                        throw err;
                    }
                }
                var opts = utils.clone(opts);
                Promise.all(promises).then(function(arr){
                    for(var i=0;i<pendingFields.length;i++){
                        var name = pendingFields[i];
                        var rows = arr[i];
                        var val  = [];//arr[i];
                        for(var j=0;j<rows.length;j++){
                            var nCols = 0;
                            var row   = rows[j];
                            for(var col in row) if(row.hasOwnProperty(col)){
                                val.push(row[col]);
                                if(nCols){
                                    onError(new Error('Serpstat SQL SubQuery must return one column'));
                                }
                                nCols++;
                            }
                        }
                        if(!val.length){
                            val = '';
                        } else if(val.length === 1){
                            val = val[0];
                        } else if(name === 'keywords' || name === 'minus_keywords'){
                            val = val.join(',');
                        } else if(name !== 'query' && name !== 'se'){
                            val = val[0];
                        }
                        opts[name] = val;
                    }
                    self.createTask(dbtype,opts).then(function(res){
                        if(cb){
                            cb(res, idx, query);
                        }
                    },onError);
                },onError);
                return null;
            }
            alasql.aggr.ARR_UNIC_SUM = function(value, acc, stage){
                if(stage == 1 || stage == 2) {
                    if(stage == 1){
                        acc = {};
                    }
                    if(typeof(value) === 'string'){
                        acc[value]    = true;
                    } else for(var i=0;i<value.length;i++){
                        acc[value[i]] = true;
                    }
                    return acc;
                } else {
                    return Object.keys(acc);
                }
            }
            alasql.aggr.PART_OF_NOT_NULL = function(value, acc, stage){
                if(stage == 1 || stage == 2) {
                    if(stage == 1){
                        acc = {sum:0,den:0};
                    }
                    acc.den ++;
                    if(value){
                        if(typeof(value) === 'number'){
                            acc.sum += value;
                        } else {
                            acc.sum ++;
                        }
                    } 
                    return acc;
                } else {
                    return acc.den ? acc.sum/acc.den : null;
                }
            }

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
        startSession(){
            var self = this;
            this.session = {
                tasks: [],
                getStat: function(){
                    return utils.sumStat(this.tasks);
                },
                end: function(){
                    self.session = null;
                }
            };
            return this.session;
        }
        endSession(){
            this.session = null;
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
			if(this._isPaused || openConnections > 30){
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
			opts.noCache = opts.noCache || api.opts.noCache;
	
			opts.limit   = opts.limit   * 1;
			opts.timeout = opts.timeout * 1;			
			
			opts.se      = typeof(opts.se)    === 'string' ? [opts.se]    : opts.se;
			opts.query   = utils.normalizeQuery(opts.query,method,opts);
            
            for(var par in {keywords:1,minus_keywords:1}){
                if(opts[par]){
                    if(Array.isArray(opts[par])){
                        opts[par] = opts[par].join(',');
                    }
                    opts[par] = utils.Generator.getAllVariants(opts[par],{
                        ignoreEntersInBlocks:true,
                        unic:true,
                        trim:true,
                        notEmpty:true,
                        limit   : 1000,
                        enterSeparated:true,
                        commaSeparated:true
                    }).join(',');
                }
            }
            
			this.api     = api;
			this.opts    = opts;
			this.method  = method;
			
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
				Promise.all(this.subTasks).then((data)=>{
                    if(!data.length){
                        var res = new utils.Table([]);
                        resolve(res);
                        return res;
                    }
                    var res = new utils.Table(data[0]);
                    for(var i=1;i<data.length;i++){
                        res.push(data[i])
                    }
                    resolve(res);
					return res;
				},reject);
			});			
		}
		getStat(){
            return utils.sumStat(this.subTasks);
		}
	};
	/*	SerpstatSubTask
			Can one se and one query.
			Can have limit>1000
			Thats why can have more the one Page
	*/
	class SerpstatSubTask extends utils.QuasiPromise{
		constructor(task,query,se){
            query               = query ? query.trim() : query;
			super();
			this.se             = se;
			this.api            = task.api;
			this.task           = task;
			this.opts           = utils.deepClone(task.opts);
			this.query0         = query;
			this.method         = task.method;
			this.pages          = [];
            this.opts._filters  = {};
            
            if(this.method === 'domain_keywords' || this.method === 'keywords'){
                var minuses = [];
                if(this.opts.minus_keywords && this.opts.minus_keywords.trim()){
                    minuses = [this.opts.minus_keywords.trim()];
                }
                var query = query.split(' -'); 
                for(var i=1;i<query.length;i++){
                    if(query[i].trim()){
                        minuses.push(query[i].trim());
                    }
                }
                this.opts.minus_keywords = minuses.join(',').split(',,').join(',').split(',,').join(',').split(',,').join(',').trim();
                query = query[0].trim();
                if(!this.opts.minus_keywords){
                    delete this.opts.minus_keywords;
                }
            }
            if(this.method === 'domain_keywords'){
                var keys = [];
                if(this.opts.keywords && this.opts.keywords.trim()){
                    keys = [this.opts.keywords.trim()];
                }
                query = query.split(' '); 
                for(var i=1;i<query.length;i++){
                    if(query[i].trim()){
                        keys.push(query[i].trim());
                    }
                }
                this.opts.keywords = keys.join(',').split(',,').join(',').split(',,').join(',').split(',,').join(',').trim();
                query = query[0].trim();
                if(!this.opts.keywords){
                    delete this.opts.keywords;
                }
            }
            if(this.method === 'domain_keywords' || this.method === 'domain_urls' || this.method === 'ad_keywords' || this.method === 'get_top_urls'){
                if(query != utils.parseDomain(query)){
                    this.containsAll      = this.containsAll     || {};
                    this.containsAll.url  = this.containsAll.url || [];
                    this.containsAll.url.push(query);
                    query = utils.parseDomain(query);
                }
            }
            if(this.method === 'domains_uniq_keywords'){
                query = query.split(',');
                if(query[0].trim() != utils.parseDomain(query[0].trim())){
                    this.containsAll      = this.containsAll     || {};
                    this.containsAll.url  = this.containsAll.url || [];
                    this.containsAll.url.push(query[0].trim());
                    query[0] = utils.parseDomain(query[0].trim());
                }
                if(query.length>1){
                    query[1] = utils.parseDomain(query[1].trim());
                }
                query = query.join(',');
            }
            if(this.method === 'domains_intersection'){
                query = query.split(',');
                for(var i=0;i<query.length;i++){
                    if(query[i].trim() != utils.parseDomain(query[i].trim())){
                        this.containsAll            = this.containsAll           || {};
                        this.containsAll['url'+i]   = this.containsAll['url'+i]  || [];
                        this.containsAll['url'+i].push(query[i].trim());
                        query[i] = utils.parseDomain(query[i].trim());
                    }
                }
                query = query.join(',');
            }
            this.query = query;
			var demand = utils.getMaxDemand(this.method,this.opts,[query],[se]);
			this.stat = {
				minRows  : 0,
				maxRows  : demand.rows,
				curRows  : 0,
				minPages : 1,
				maxPages : demand.pages,
				curPages : 0,
				total    : 0
			};
            
            var limit  = this.opts.limit;
            var offset = this.opts.offset || 0;
            if(offset && offset % limit){
                throw new Error('offset must be a multiple of the limit (offset % limit === 0)')
            }
			this.remain  = this.opts.limit;
			this.curPage = offset / limit;
			this.promise = new Promise((resolve,reject)=>{
				var firstPage = this.createPage();
				firstPage.then((dataData)=>{
					var total = firstPage.total;
					if(!total){
						total = dataData.length;
					}
					this.stat.total    = total;
					this.stat.maxRows  = this.stat.minRows  = (this.opts.limit>total) ? total : this.opts.limit;
					this.stat.maxPages = this.stat.minPages = Math.ceil(this.stat.minRows/1000);
					for(var i=1;i<this.stat.maxPages;i++){
						this.createPage();
					}
					Promise.all(this.pages).then((data)=>{
                        if(!data.length){
                            resolve(new utils.Table([]));
                        }
                        var res   = new utils.Table(data[0]);
                        for(var i=1;i<data.length;i++){
                            res.push(data[i])
                        }
                        if(data[data.length-1].total){
                            total           = data[data.length-1].total;  
                            this.stat.total = total;
                        }
                        res.total = total;
                        resolve(res);
                        return res;
                            
                    },reject);
                    return dataData;
				},reject);
			});
		}
   		getStat(){
            return this.stat;
        }
		createPage(){
			var rows     = Math.min(this.remain,1000);
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
		limit      		            : 1,
		requestsPerSecond           : 1, 
		backend 		            : 1, 
		maxRetry                    : 1,
		retryPause                  : 1,
		timeout                     : 1,
		method                      : 1,
		api                         : 1,
		onPageData                  : 1,
		noCache                     : 1,
        showDoubles                 : 1,
        method                      : 1,
        _filters                    : 1,
        min_hits                    : 1,
        minus_domain_position_from  : 1,
        minus_domain_position_to    : 1,
        domains_combinations        : 1,
        removeDuplicates            : 1,
        remove_duplicates           : 1,
        expand                      : 1,
        offset                      : 1,
        base_method                 : 1    
	};    
	var serpstatPageNotNullParams = { //params that canot be 0, '0', ''
		page:  		   1,
		order: 	       1,
		sort:  		   1,
		page_size:     1,
		position_from: 1,
        queries_from : 1
	};
	var serpstatPageNotOneParams = { //params that canot be 1, '1'. Bugfix
		position_from: 1,
        queries_from : 1
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
				
				this.method  = subTask.task.method;
				this.subTask = subTask;
				for(var i in subTask.opts) if(subTask.opts.hasOwnProperty(i)){
					this.params[i] = subTask.opts[i]
				}
				this.params.se     = subTask.se;
				this.params.query  = subTask.query;
				this.noCache       = subTask.opts.noCache;
				this.timeout       = subTask.opts.timeout;
			} else {
				for(var i in subTask) if(subTask.hasOwnProperty(i)){
					this.params[i] = subTask[i]
				}
				this.api    = subTask.api;
				this.method = subTask.method;
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
			for(var i in this.params) if(this.params.hasOwnProperty(i)){
                if(typeof(this.params[i])==='undefined'){
                    delete this.params[i];
                }
			}
			for(var i in serpstatPageSkipParams) if(serpstatPageSkipParams.hasOwnProperty(i)){
				delete this.params[i];
			}
			for(var i in serpstatPageNotNullParams) if(serpstatPageNotNullParams.hasOwnProperty(i)){
				if(!this.params[i] || this.params[i] === '0'){
					delete this.params[i];
				}
			}
            //bug fix
			for(var i in serpstatPageNotOneParams) if(serpstatPageNotOneParams.hasOwnProperty(i)){
				if(this.params[i]===1 || this.params[i] === '1'){
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
					data = this.normalizeData(data);
                    data = new utils.Table(data);
                    data.total = this.total;
					resolve(data);
                    return data;
				},reject);
			});
		}
		normalizeData(data){
			if(!data){
                return {data:[],downloaded:0};
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
            var isAd         = this.method === 'ad_keywords';
            var isHistory    = this.method === 'domain_history';
            var isCompUrl    = this.method === 'url_competitors';
            var isCompDomain = this.method === 'competitors'     && this.params.query.indexOf('.')!==-1;
            var isUnicKeys   = this.method === 'domains_uniq_keywords';
            var secondDomain = '';
            if(isUnicKeys){
                var tmp = this.params.query.split(',');
                if(tmp.length === 2){
                    secondDomain = utils.parseDomain(tmp[1].trim());
                } 
            }
			for(var i=0;i<pageData.length;i++){
				var row = pageData[i];

				if(typeof(row.region_queries_count) !== 'undefined' 
				&& typeof(row.cost)                 !== 'undefined'  
                && typeof(row.queries_cost)         === 'undefined'){
					row.queries_cost = row.region_queries_count * row.cost;
                }

                if(isUnicKeys && secondDomain && row[secondDomain]){
                    row.domain2  = secondDomain;
                    row.position = row[secondDomain];
                } 
				if(typeof(row.position)             !== 'undefined' 
				&& typeof(row.region_queries_count) !== 'undefined'  
				&& typeof(row.traff)                === 'undefined'){
					row.traff = row.region_queries_count * SerpstatAPI.ctrByPos[row.position]/100;
                    if(row.type == 2 || row.type == 3){ // Ad is Under or in Side from SERP 
                        row.traff /= 5; 
                    }
				}
				if(typeof(row.keyword)              === 'string' 
				&& typeof(row.keyword_length)       === 'undefined'){
                    row.keyword_length = row.keyword.split(' ').length;
                }  
 				if(typeof(row.traff)                !== 'undefined' 
				&& typeof(row.cost)                 !== 'undefined'  
                && typeof(row.traff_cost)           === 'undefined'){
					row.traff_cost = row.traff * row.cost;
                }
                for(var d=1;d<=3;d++){
                    if(row['domain'+d]){
                        if(typeof(row['position'+d])        !== 'undefined' 
                        && typeof(row.region_queries_count) !== 'undefined'  
                        && typeof(row['traff'+d])           === 'undefined'){
                            row['traff'+d] = row.region_queries_count * SerpstatAPI.ctrByPos[row['position'+d]]/100;
                            if(row.type == 2 || row.type == 3){ // Ad is Under or in Side from SERP 
                                row['traff'+d] /= 5; 
                            }
                        }
                        if(typeof(row['traff'+d])       !== 'undefined' 
                        && typeof(row.cost)             !== 'undefined'  
                        && typeof(row['traff_cost'+d])  === 'undefined'){
                            row['traff_cost'+d] = row['traff'+d] * row.cost;
                        }
                    }
                }
                if(isAd){ 
                    row._is_ad                 = 1;
                }
                if(isHistory){
                    row._d_date                = row.date;
                }
                if(isCompUrl){
                    row._competitor_for_url    = this.params.query;
                }
                if(isCompDomain){
                    row._competitor_for_domain = utils.parseDomain(this.params.query);
                }
			}
            var containsAll = false;
			if(this.subTask){
				for(var i=0;i<pageData.length;i++){
					pageData[i]._se    = this.subTask.se;
					pageData[i]._query = this.subTask.query;
                    pageData[i]._hits  = 1;
				}
                containsAll = this.subTask.containsAll;
			}
            var downloaded = pageData.length;
            if(containsAll){
                var tmp = [];
                for(var i=0;i<pageData.length;i++){
                    var row = pageData[i]; 
                    var add = true;
                    for(var col in containsAll) if(containsAll.hasOwnProperty(col)){
                        var val = row[col]; 
                        if(!val || !val.indexOf){
                            add = false;
                            break;
                        }
                        for(var j=0;j<containsAll[col].length;j++){
                            var fVal = containsAll[col][j];
                            if(val.indexOf(fVal) === -1){
                                add = false;
                                break;
                            }
                        }
                        if(!add){
                            break;
                        }
                    }
                    if(add){
                        tmp.push(row);
                    }
                }
                pageData = tmp;
            }
            return {data:pageData,downloaded:downloaded};
		}
	};
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
	(function serpstatParseMethods(){
		for(var i = 0;i<methodsArr.length;i++){
            let method      = methodsArr[i];
            let name        = method.name;
            methods[name]   = method;
			let arr    		= name.split('_');
			
			//method.name    = name;
			method.category  = method.category  || arr[0];
			method.filters   = method.filters   || []; 
            method.limitCoef = method.limitCoef || 1;
			
			if(!method.maxRows){
				if(method.singleRow){
					method.maxRows = 1;
				}
			}
			
			methodsByCat[method.category]       = methodsByCat[method.category] || {};
			methodsByCat[method.category][name] = method;
			
			for(var j=1;j<arr.length;j++){ //camelCase
				arr[j] = arr[j].charAt(0).toUpperCase() + arr[j].slice(1);
			}
			if(!SerpstatAPI.prototype[name]){
				SerpstatAPI.prototype[name] = SerpstatAPI.prototype[arr.join('')] = function(opts){
					return this.createTask(name,opts);
				}
			}
		}
	})();        
	SerpstatAPI.prototype.methods      = SerpstatAPI.methods      = methods;
	SerpstatAPI.prototype.methodsArr   = SerpstatAPI.methodsArr   = methodsArr;
	SerpstatAPI.prototype.methodsByCat = SerpstatAPI.methodsByCat = methodsByCat;
	SerpstatAPI.prototype.byToken      = SerpstatAPI.byToken      = byToken;
	SerpstatAPI.prototype.utils        = SerpstatAPI.utils        = utils;
	SerpstatAPI.prototype.cache        = SerpstatAPI.cache        = cache;
	SerpstatAPI.prototype.ctrByPos     = SerpstatAPI.ctrByPos     = [0,
                   //1   2   3  4  5  6  7 8  9  10 
            /*1*/   100,95  ,90,85,60,50,45,30,25,20,
            /*2*/   4  ,4   , 4, 4,4 ,4 ,4 ,4, 4, 4,
            /*3*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*4*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*5*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*6*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*7*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*8*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*9*/   0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*10*/  0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0,
            /*11*/  0  ,0   , 0,0 ,0 ,0 ,0,0,  0, 0
    ];
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