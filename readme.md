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


### Use intermediate backend
If you use SDK in browser you may want to hide you token. 
You can use intermediate backend.
Download [backend.php](https://github.com/SerpstatGlobal/serpstat-js-sdk-3/blob/master/backend.php) and config it.

```javascript
	var api = SerpstatAPI.init({
	    ...
		backend: 'https://site.com/backend.php?method=',
	});
```


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
However, the limit must be less than 1000 OR be divided by 1000: 1,2,3,...,999,1000,2000,3000, ...

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

# Differences from API
- Supports multi regions (se) and queries
- Retry on some errors
- Client-side cache
- Can download more than 1000 rows
- All results in array of object format [{...},{...},...]
- Added 2 columns in results (_se and _query)
- In some methods added traff column
- New method keyword_top_and_info - join of keyword_top and keyword_info methods