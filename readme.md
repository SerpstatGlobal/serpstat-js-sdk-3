Serpstat SDK it is powerfull JS-library for Internet marketing, SEO, Search Analitics and Keywords Research. Works in Node.js and Browsers.

# Install

## Node.js
Node.js >= 4.9.1
```
  npm install serpstat-api-3
```
```javascript
  var SerpstatAPI = require('serpstat-api-3');
```

## Browser
Or Browser with ES6 support (will work with 95-99% of users)

```html
   <script src="https://cdn.jsdelivr.net/npm/serpstat-api-3/serpstat-api.js"></script>
```

# Usage
## Init api
It is recommended to use SerpstatAPI.init({...}), not new SerpstatAPI({...}).
The second SerpstatAPI.init call with the same token will not create a new object, but return the old one.

```javascript
	var api = SerpstatAPI.init({
		token   :token,
		requestsPerSecond: 9
	});
```

### token
You need enter Serpstat API Token.
[How To Get a Token](https://serpstat.com/api/4-how-to-get-a-token/)


### requestsPerSecond
SDK has an automatic frequency limiter. 
But in this version you nead to enter Rate Limit manualy when init API.
- Plan B have 1 request per second limit. 
- Other plans have 10 request per second limit


### Get left lines
```javascript
	var api = SerpstatAPI.init({
		...
	}).then(function(){
		console.log(api.userStats.left_lines);
	});
```
api.userStats.left_lines automatically updated after each request.


## Call API method
For methods names [see API documentation](https://serpstat.com/api/)

api.createTask(methodName, opts) returns Promise.
```javascript	
	api.createTask('domain_keywords',{
		limit : 100,
		se    : 'g_us',
		query : 'serpstat.com'
	}).then(function(results){
		console.log(results);
	}).catch(function(err){
		console.error(err);
	});
```
OR api.methodName(opts) OR api.method_name(opts)

```javascript	
	api.domainKeywords({
		...
	}).then(function(results){
		console.log(results);
	},function(err){
		console.error(err);
	});
```
### se
[List of Search Engines and Regions](https://serpstat.com/api/6-request-parameters/)

### limit
SDK supports loading more than 1000 results in a single method call.
In this case, SDK will automatically download several results pages from the server.


### Multi regions and queries
```javascript	
	api.domain_keywords({
		limit : 100,
		se    : ['g_us','g_ru','g_ua'],
		query : ['serpstat.com','netpeak.com']
	})
```
This code can return up to 3x2x100 = 600 rows.

Due to the support of many regions and queries in one request, columns _se and _query are added to the results.

### async/await
For Node.js >= 7.6 you can use async/await
```javascript
	var results = await api.createTask('domain_keywords',{
		limit : 100,
		se    : 'g_us',
		query : 'serpstat.com'
	});
	console.log(results)
```
# Warnings
## Safari
May not work on Safari

## Big data
Browser Tab may fall if downloaded rows > 100,000

## Spend more rows than return 
Some new features as *_keywords_match_sdk  spend more rows than return.

## Slow methods
Methods get_top_urls, domains_intersection, domains_uniq_keywords can take up to 10 minutes

## limit < 1000 || limit%1000===0 
The limit must be less than 1000 OR be divided by 1000: 1,2,3,...,999,1000,2000,3000, ...
Not 1001, 2100, 5999. Offset must be be divided by 1000.

## Downloaded rows > limit 
If you enter few regions or se or use methods *_and_*  SDK can load more then limit rows.

## keyword_top and limit
In keywords_top and keyword_top_and_info no limit parameteres. This methods can demand up to 101 rows per query and se combination.

 
# Differences from API
- Supports multi regions (se) and queries
- Retry on some errors
- Client-side cache
- Can download more than 1000 rows
- All results in array of object format [{...},{...},...]
- Added 2 columns in results (_se and _query)
- In some methods added column traff 
- New method keyword_top_and_info - join of keyword_top and keyword_info methods
- New method domains_keywords_match_sdk - join of keyword_top and keyword_info methods
- You can enter keywords in Generator syntax (ny|n y) (hotel|hostel)
- In some domain methods you can enter URL part (serpstat.com/blog/)

## *_keywords_match_sdk
There are new methods that make a comparison of keywords of several domains or Url on a local machine. They first download data to the local machine, and then compare keywords.

### domains_keywords_match_sdk
More fast, advances alternative to domains_intersection and domains_uniq_keywords.

### domains_ad_keywords_match_sdk
Same as previus method but match Google Ads keywords (not organic). 

### urls_keywords_match_sdk
Match urls keywords

### hits_from
The minimum number of domains or urls that have this keyword.

## expand
*_keywords_match_sdk and domains_intersection has expend param. It param intcrease result rows (not spend)  


expend=false

| keyword      | cost         | ...         | domain1     | traff1      | ...         | domain2      | traff2       | ... 
| ------------ | ------------ |------------ |------------ |------------ |------------ | ------------ | ------------ | ------------ 
| key1         | 1.23         | ...         | site1.com   | 1000        | ...         | site2.com    | 2000         | ... 
| key2         | 3.45         | ...         | site1.com   | 100         | ...         | site2.com    | 200          | ... 


expend=true

| keyword | cost | ... | domain | traff | ... 
| ------------ | ------------ |-------------- |-------------- |-------------- |-------------- |
| key1 | 1.23 | ... | site1.com | 1000 | ...
| key1 | 1.23 | ... | site2.com | 2000 | ...
| key2 | 3.45 | ... | site1.com | 100 | ...
| key2 | 3.45 | ... | site2.com | 200 | ...

## remove_duplicates
All methods has param remove_dublicates. When remove_dublicates=true SDK will delete dublicate rows

# Methods
## Domain
In query list of domain

|   name       | info         | params       
| ------------ | ------------ | ------------ 
|  [domain_info](https://serpstat.com/api/14-domain-summary-report-domaininfo/ "domain_info") | Domain Summary. This report provides you with the number of keywords domain uses in SEO and PPC, shows its online visibility and other metrics. | se, query
|  [domain_history](https://serpstat.com/api/16-domain-summary-report-domainhistory/ "domain_history") | Domain Historical Data. This report provides you with the historical data on a domains number of keywords and visibility. | se, query, limit, offset
|  [domain_keywords](http://https://serpstat.com/api/18-domain-organic-keywords-domainkeywords/ "domain_keywords") | Domain Organic Keywords. This report shows keywords a domain ranks for in Google top 100 search results. | se, query, limit, offset, position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to, keywords, minus_keywords
|  [domain_urls](http://https://serpstat.com/api/20-list-of-domains-urls-domainurls/ "domain_urls") | List of domain's URLs. Returns the list of URLs within the analyzed domain. Also, shows the number of keywords from top-100 for each URL. | se, query, limit, offset,
| [domains_intersection](https://serpstat.com/api/22-domain-comparison-common-and-unique-keywords-domainsintersection-domainsuniqkeywords/http:// "domains_intersection") |  Shows common keywords of 2 or 3 domains | se, query, limit, offset, domains_combinations, expand
| [domains_uniq_keywords](http://https://serpstat.com/api/65-domain-comparison-common-and-unique-keywords-domainsuniqkeywords/ "domains_uniq_keywords") |  Shows unique keywords of a domain. Keywords that queried domain has in common with Minus Domain are removed from the list. | se, query, limit, offset, cost_from, cost_to, concurrency_from, concurrency_to, minus_domain, domains_combinations
| domains_keywords_match_sdk |  Domain keywords client-side comparison | se, query, limit, offset,  limit, offset, position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to, keywords, minus_keywords, minus_domain, minus_domain_position_from, minus_domain_position_to, expand, hits_from
| [competitors](http://https://serpstat.com/api/23-domain-competitors-in-organic-search-competitors/ "competitors") |  Domain Competitors in Organic Search | se, query, limit, offset
| [ad_keywords](http://https://serpstat.com/api/66-advertising-report-adkeywords-but/ "ad_keywords") | Domain Advertising report.This report shows you ads copies that pop up for the queried keyword in Google paid search results. | se, query, limit, offset, position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to
| domains_ad_keywords_match_sdk | Domain Ads keywords client-side comparison. Shows common Google Ads keywords of up to 9 domains. Local methods more expensive | se, query, limit, offset, position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to,minus_domain, minus_domain_position_from, minus_domain_position_to, expand, hits_from
| [get_top_urls](http://https://serpstat.com/api/261-gettopurls/ "get_top_urls") | Domain Top Pages. List of domain URLs sorted by potencial traffic. | se, query, limit, offset

## Keyword

|   name       | info         | params       
| ------------ | ------------ | ------------ 
|  [keyword](https://serpstat.com/api/29-phrase-match-keywords-keywords/ "keyword")  |  Phrase Match Keywords. This method uses a full-text search to find all keywords that match the queried term. For every keyword found you will see its volume, CPC, and level of competition.  | se, query, limit, offset, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to
| [keyword_info](http://https://serpstat.com/api/31-keyword-overview-keywordinfo/ "keyword_info") | Keyword overview. This report provides you with the keyword overview showing its volume, CPC and level of competition. | se, query
| [suggestions](https://serpstat.com/api/33-keyword-search-suggestions-suggestions/ "suggestions") | These method lists autocomplete suggestions (Google Suggest) for the keyword you requested (they are found by the full-text search). | se, query
| keywords_and_suggestions | Phrase Match Keywords and Suggestions. This method uses a full-text search to find all keywords and Google Autocomplete Suggestions that match the queried term. Join of 2 methods: keywords and suggestions. | se, query, limit, offset, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to |
| [related_keywords](https://serpstat.com/api/35-related-keywords-relatedkeywords/ "related_keywords") | Return list of related keywords whose SERP is similar to requested keywords. Disabled on some subscribtion plans | se, query, limit, offset,weight
| [keyword_top](https://serpstat.com/api/37-top-for-a-keyword-keywordtop/ "keyword_top") | This report shows you Google top 100 organic search results for the keyword you requested. |  se, query
| keyword_top_and_info | This report shows you Google top 100 organic search results for the keyword you requested. Wuth additional columns: frequency, difficulty, traffic, ...  |  se, query
| [competitors](https://serpstat.com/api/39-competitors-competitors/ "competitors") | The report lists all domains that rank for the given keyword in Google top 20 results. If you specify the keyword, the report lists all competitors for the given keyword in Google top 20 results. | se, query, limit, offset 
| [ad_keywords](https://serpstat.com/api/41-advertising-report-adkeywords/ "ad_keywords") | This report shows you ads copies that pop up for the queried keyword in Google paid search results. |  se, query, limit, offset

## URL
In query list of URLs

|   name       | info         | params       
| ------------ | ------------ | ------------ 
|  [url_keywords](https://serpstat.com/api/45-url-organic-keywords-urlkeywords/ "url_keywords") |  The report lists keywords that URL ranks for in Google search results.  | se, query, limit, offset,  position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to
|  url_keywords_alt |  Alterative realization  of url_keywords | se, query, limit, offset,  position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to, keywords, minus_keywords
|  url_competitors |  List of URL competitors. Shows the list of URLs that compete with a queried URL in organic search. | se, query, limit, offset
|  [url_missing_keywords](https://serpstat.com/api/49-competitors-keywords-that-are-missing-from-a-queried-page-urlmissingkeywords/ "url_missing_keywords") |  Shows a list of keywords that competitors URLs rank for in top-10 but that are missing from the queried page.. | se, query, limit, offset, queries_from, queries_to
| url_keywords_and_missing | URL Organic and Missing Keywords.  The report lists keywords that URL and that competitors URLs ranks for in Google search results | se, query, limit, offset,  position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to
| urls_keywords_match_sdk | URL keywords client-side comparison. Shows common keywords of up to 9 urls. Local methods more expensive |  se, query, limit, offset,  position_from, position_to, queries_from, queries_to, cost_from, cost_to, concurrency_from, concurrency_to, minus_domain, minus_domain_position_from, minus_domain_position_to, hits_from, expand

#Integration with alaSQL
```javascript
//include and init SDK
//include alasql

api.patchAlasql(alasql);

alasql.serpstatPromise('SELECT * FROM Serpstat("competitors",{"se":"g_us","query":"serpstat.com"} ').then(console.log);

alasql.serpstatPromise(
  'SELECT * FROM Serpstat("competitors",{"limit":2, "query" : "~GUI~",    \
      "se"    : "<<<    --nested SQL request                                                    \
          SELECT `db_name` FROM Serpstat("databases_info")                       \
          WHERE (`db_name` LIKE "y_%")                                                         \
          LIMIT 3                                                                                               \
  >>>"})').then(console.log);
```

# Browser Cases
## Use intermediate backend
If you use SDK in browser you may want to hide you token. 
You can use intermediate backend.
Download [backend.php](https://github.com/SerpstatGlobal/serpstat-js-sdk-3/blob/master/backend.php) and config it.

```javascript
	var api = SerpstatAPI.init({
	    ...
		backend: 'https://site.com/backend.php?method=',
	});
```

## Controls
Have 2 controls Token Input and Regions Input. 
As in [Bootstrap API Console](http://utils.serpstat.com/apiConsole/)
Controls dont not require other libs (as JQuery), but controls supports Bootstrap styles.

```html
    <!-- bootstrap (not required, for styling only) -->
	<link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">	
	<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
	<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.bundle.min.js" integrity="sha384-pjaaA8dDz/5BgdFUPX6M/9SUZv4d12SUPF0axWc+VRZkx5xU3daN+lYb49+Ax+Tl" crossorigin="anonymous"></script>
    <!--/bootstrap-->


    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/serpstat-api-3/controls.css">
    <script src="https://cdn.jsdelivr.net/npm/serpstat-api-3/serpstat-api.js"></script>
    <script src="controls.js"></script>
    <form style="padding:40px">
        <div class="form-group row" id="row-token">
            <label class="col-sm-2 col-form-label">Token</label>
        </div>
        <div class="form-group row" id="row-se">
            <label class="col-sm-2 col-form-label">SE</label>
        </div>
    </form>

    <script>
        window.SerpstatControls.token({
            'id':'row-token'
        });
        window.SerpstatControls.se({
            'id':'row-se'
        });
    </script>
```