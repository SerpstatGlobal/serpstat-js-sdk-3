<?php
	error_reporting(E_ALL);
	set_time_limit(3800);
	$opts = array('http' =>
		array(
			'method'  => "POST",
			'timeout' =>  3600
		)
	);
	$context  = stream_context_create($opts);
		
	try{
		ini_set('allow_url_fopen',1);
	} catch(Exception $e){}
	$token        = ''; //can be empty
	$replaceToken = true;
	//print_r($_SERVER);
	
	$origin = false;
	if(isset($_SERVER['HTTP_ORIGIN'])){
		$origin = $_SERVER['HTTP_ORIGIN'];
	} else if(isset($_SERVER['ORIGIN'])){
		$origin = $_SERVER['ORIGIN'];
	} else if(isset($_SERVER['Origin'])){
		$origin = $_SERVER['Origin'];
	}

	header("Access-Control-Allow-Methods: OPTIONS, GET");		
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 1');
    if($origin) {
        header("Access-Control-Allow-Origin: ".($origin ? $origin : '*'));
    }
	if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
		exit();
	}
	
	$uri = $_SERVER['REQUEST_URI'];
	$uri = explode('?method=',$uri,2);
	$uri = $uri[1];
	
	if(count(explode('?',$uri,2))===1){
		$uri = explode('&',$uri,2);
		$uri = join('?',$uri);
	}
	if($token){
		$str = '?token=';
		$arr = explode($str,$uri,2);
		
		if(count($arr)==1){
			$str = '&token=';
			$arr = explode($str,$uri,2);
		}
		if(count($arr)==1){
			if(explode('?',$uri,2)===1){
				$uri .= '?token='.$token;
			} else {
				$uri .= '&token='.$token;
			}
		} else if($replaceToken){
			$arr[1] = explode('&',$uri,2);
			$arr[1][0] = $token;
			$arr[1] = join('&',$arr[1]);
			$arr = join($str,$arr);
		}
	}
	set_error_handler(function($errno, $errstr, $errfile, $errline, array $errcontext) {
		throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
	});
	try{
		$res = file_get_contents('https://api.serpstat.com/v3/'.$uri, false, $context);
		if($res === false){
			echo '{"status_code":402,"status_msg":"Backend error false"}';
		} else if(!$res){
			echo '{"status_code":402,"status_msg":"Backend error void string"}';
		} else {
			echo $res;
		}
	} catch(Exception $e){
		$mess = $e.'';// ->getMessage ? $e->getMessage() : $e->message;
		echo '{"status_code":402,"status_msg":"Backend: '.str_replace(Array("\n","\r",'"'),Array(' ',' ',"'"),$mess).'"}';
	}