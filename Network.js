/*
 * AJAX的封装
 * data可配置参数
 * @param url 请求地址     必须
 * @param type 请求方式     默认为POST
 * @param success() 请求成功回调方法
 * @param error()   请求失败回调方法
 */
var __getHttpReq__   = function(data){
	var XMLHttpReq;
	try {  
        XMLHttpReq = new ActiveXObject("Msxml2.XMLHTTP");//IE高版本创建XMLHTTP  
    }  
    catch(E) {  
        try {  
            XMLHttpReq = new ActiveXObject("Microsoft.XMLHTTP");//IE低版本创建XMLHTTP  
        }  
        catch(E) {  
            XMLHttpReq = new XMLHttpRequest();//兼容非IE浏览器，直接创建XMLHTTP对象  
        }  
    } 
    if(data.url == undefined){
    	return false;
    }
    if(data.type == undefined){
    	data.type = "POST";
    }
    if(data.success == undefined || typeof(data.success) !== "function"){
    	data.success  = function(){};
    }
    if(data.error == undefined || typeof(data.error) !== "function"){
    	data.error    = function(){};
    }
    XMLHttpReq.open(data.type, data.url, false);
    XMLHttpReq.onreadystatechange = function(){
    	if (XMLHttpReq.readyState == 4) {
	        if (XMLHttpReq.status == 200) {
	            var result   = XMLHttpReq.responseText;
	            var json     = eval("(" + result + ")");
	            data.success(json);
	        }else{
	        	var result   = XMLHttpReq.responseText;
	            var json     = eval("(" + result + ")");
	        	data.error(json);
	        }
	    }  
    };
    XMLHttpReq.send(null);
    return XMLHttpReq;
}




/**
 * JSONP相关的封装
 */

var JSONP_COUNTER = 0;

/**
 * Noop function.
 */

function noop(){}

/**
 * JSONP handler
 *
 * Options:
 *  - param {String} qs parameter (`callback`)
 *  - prefix {String} qs parameter (`__jp`)
 *  - name {String} qs parameter (`prefix` + incr)
 *  - timeout {Number} how long after a timeout error is emitted (`60000`)
 *
 * @param {String} url
 * @param {Object|Function} optional options / callback
 * @param {Function} optional callback
 */

function jsonp(url, opts, fn){
  url = encodeURI(url);
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }
  if (!opts) opts = {};

  var prefix = opts.prefix || '__jp';

  // use the callback name that was passed if one was provided.
  // otherwise generate a unique name by incrementing our counter.
  var id = opts.name || (prefix + (JSONP_COUNTER++));

  var param = opts.param || 'callback';
  var timeout = null != opts.timeout ? opts.timeout : 60000;
  var enc = encodeURIComponent;
  var target = document.getElementsByTagName('script')[0] || document.head;
  var script;
  var timer;


  if (timeout) {
    timer = setTimeout(function(){
      cleanup();
      if (fn) fn(new Error('Timeout'));
    }, timeout);
  }

  function cleanup(){
    if (script.parentNode) script.parentNode.removeChild(script);
    window[id] = noop;
    if (timer) clearTimeout(timer);
  }

  function cancel(){
    if (window[id]) {
      cleanup();
    }
  }

  window[id] = function(data){
    //debug('jsonp got', data);
    cleanup();
    if (fn) fn( data );
  };

  // add qs component
  url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
  url = url.replace('?&', '?');

  //debug('jsonp req "%s"', url);

  // create script
  script = document.createElement('script');
  // 时间戳, 缓存;
  var d = new Date();
  script.src = url + "&time=" + d.getTime();
  target.parentNode.insertBefore(script, target);

  return cancel;
}
