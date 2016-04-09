/**
 * @author 符川
 * 2016-02
 * 和DOM操作相关的工具函数
 * 都是全局方法,没有加入到DOM这个对象里面,可以改一下
 */
var Dom = function(){
	//TODO init
}
Dom.prototype = {
	
}

/**
 * 判断此css属性是否会影响元素大小
 * @param {Object} property  待判断的属性名
 */
function isEffectOnVisual( property ){
	//FIXME 白名单的方式肯定还是不太严谨
	var arr = ['webkitLogicalHeight','webkitLogicalWidth','height','width','cssText'];
	for(var i = 0;i < arr.length;i++){
		if( arr[i] ===  property){
			return true;
		}
	}
	return false;
}

/**
 * 通过html文本创建节点
 * @param {Object} html  html文本
 */
function createElementByHtml(html){
	var temp = document.createElement('div');
	temp.innerHTML = html;
	return temp.children.length == 1 ?temp.children[0]:temp.childNodes;
}

/**
 * 克隆节点
 * @param {Object} elem
 */
function cloneElemnt(elem){
	if( elem.nodeValue ){
		return document.createTextNode( elem.nodeValue );
	}
	return createElementByHtml( elem.outerHTML );
}

/**
 * 获取标签内容(排除了子节点内容),
 * @param {Object} elem
 */
function getElementOutTag(elem){
	if( elem.nodeValue ){
		return Utils.trim( elem.nodeValue );
	}
	
	return Utils.trim( elem.outerHTML.replace(elem.innerHTML,"") );
}
function replaceElementTag(elem,tag){
	if( !elem.parentNode ){
		return false;
	}
	var outerHtml = elem.outerHTML;
	var regx = new RegExp(elem.nodeName,"ig");
	return outerHtml.replace(regx,tag);
}
/**
 * 查找父级
 * @param {Object} elem 待查找节点
 * @param {Object} selector 查找选择器
 */
function getParent(elem,selector){
	var elems = document.querySelectorAll(selector);
	for (var i = 0;i < elems.length;i++) {
		if(elems[i].contains(elem)){
			return elems[i]; 
		}
	}
}
/**
 * 获取标签内容
 * @param {Object} elem
 */
function getElementAllTag(elem){
	if( elem.nodeValue ){
		return Utils.trim( elem.nodeValue );
	}
	return Utils.trim( elem.innerHTML );
}
/**
 * 获取子节点
 * @param {Object} elem
 */
function getElementChild(elem){
	var children = elem.childNodes || [];
	var result = [];
	for (var i = 0;i < children.length;i++) {
		if( children[i].nodeName === "#text" && Utils.trim(children[i].nodeValue) === "" ){
			continue;
		}
		result.push(children[i]);
	}
	return result;
}

/**
 * 把#Text节点拆分成 一个字一个节点
 * @param {Object} elem 待拆分的节点
 * @param {Object} size 拆分成多少段
 */
function splitTextNode(elem,size){
	//如果不是#Text节点,或者是空白节点,拆分失败
	if( elem.nodeName != "#text" || Utils.trim(elem.nodeValue) === "" ){
		return false;
	}
	
	//去掉首尾空白
	var nodeValue = Utils.trim(elem.nodeValue);
	//只有一个字符 ,拆分失败
	if(nodeValue.length <= 1){
		return false;
	}
	
	//开始拆分
	size = size || nodeValue.length;
	size = 2;
	var values = [];
	var maxLength = nodeValue.length;
	for(var i=0;i < size;i++) {
		values.push( nodeValue.substr(maxLength/size*i,maxLength/size + size*i) );
	}
	
	//合并插入
	var elem_frag = document.createDocumentFragment();
	for(var i=0;i<values.length;i++) {
		var child = document.createTextNode(values[i]);
		elem_frag.appendChild( child );
	}
	elem.parentNode.insertBefore(elem_frag,elem);
	
	//移除被拆分的节点
	elem.parentNode.removeChild(elem);
	return true;
}

/**
 * 拆分 table DOM节点.<br/>
 * 
 * @param options {Object} 窗口参数.
 *  --> winH {Number} 窗口高度
 *  --> currenH {Number} 内容总高度
 *  --> tblH {Number} 表格高度
 *  --> theadH {Number} thead高度
 *  --> trH {Number} tr高度
 * 
 * @param tblDom {object} 表格DOM对象.
 * 
 * @author gli-gonglong-20160317.
 */
function splitTable(options, tblDom) {

    var thead = tblDom.querySelector("thead");
    var tbody = tblDom.querySelector("tbody");
    // 获取第一个 tr.
    var trFirst = tblDom.querySelector("tr");
    // 获取所有 tr.
    var trAll = tblDom.querySelectorAll("tr");

    var winH = options.winH;
    var currenH = options.currenH;

    var tblH = options.tblH;
    var theadH = options.theadH;
    var trH = options.trH;
    var winRestH = winH - (currenH - tblH);

    // console.log("winRestH:" + winRestH + ", trH:" + trH + ", tblH:" + tblH);

    var tblParent = tblDom.parentNode;
    // 浅复制
    var tblClone = tblDom.cloneNode();
    var d = new Date();
    tblClone.id = tblClone.id + "_" + d.getTime();

    var hasTbody = false;
    if (typeof tbody == "object") {
        hasTbody = true;
        var tbodyClone = tbody.cloneNode();
    }

    if (!!thead) {
        var theadClone = thead.cloneNode();
        tblClone.appendChild(theadClone);
    }

    if ((theadH + trH) > winRestH) {
        // 当前页面不足以载入 至少一行数据时, 本页插入空table,并设置相应属性, height等..
        var trClone = tblDom.querySelector("tr").cloneNode();
        var tdClone = tblDom.querySelector("td").cloneNode();
        trClone.appendChild(tdClone);
        if (hasTbody) {

            tbodyClone.appendChild(trClone);
            tblClone.appendChild(tbodyClone);
        } else {

            tblClone.appendChild(trClone);
        }
        
        tblClone = document.createElement("DIV");
        
        tblClone.style.maxHeight = winRestH + "px";
        tblClone.style.maxWidth = "100%";

        tblParent.insertBefore(tblClone, tblDom);
        return true;
        
    } else {
        // 拆分表格--tblDom 移动tr 到 tblClone;

        // 判断拆分几个tr
        var moveNum = Math.floor(winRestH / trH);
        var trDoms = tblDom.querySelectorAll("tr");

        var tmpCon = document.createDocumentFragment();
        var tmpTr = null;

        for (var i = 0, len = moveNum; i < len; i++) {
            tmpTr = trDoms[i];
            tmpCon.appendChild(tmpTr);
        }

        if (hasTbody) {
            tbodyClone.appendChild(tmpCon);
            tblClone.appendChild(tbodyClone);
        } else {
            tblClone.appendChild(tmpCon);
        }
    }

    tblParent.insertBefore(tblClone, tblDom);
    return false;
}

function splitTextNode2Span(elem,strat,end){
	if( elem.nodeName != "#text"){
		return [elem,elem,elem];
	}
	var str = getElementAllTag(elem);
	end = end || str.length;
	var re  = [
		createElementByHtml("<span>"+str.substring(0,strat)+"</span>"),
		createElementByHtml("<span>"+str.substring(strat,end)+"</span>"),
		createElementByHtml("<span>"+str.substring(end,str.length)+"</span>"),
	];
	elem.parentNode.appendChild(re[0]);
	elem.parentNode.appendChild(re[1]);
	if( end != str.length){
		elem.parentNode.appendChild(re[2]);
	}
	elem.parentNode.removeChild(elem);
	return re;
}
//获取这个节点的所有文本节点
function getElemAllTextNode( elem , re){
	re = re || [];
	if(elem.nodeName === "#text" || (elem.nodeName === "SPAN" && getElementChild(elem).length <= 1) ){
		re.push(elem);
	}else{
		var elem_child = getElementChild( elem );
		for(var i = 0;i<elem_child.length;i++){
			getElemAllTextNode(elem_child[i],re);
		}
	}
	return re;
}
function text2Span(elem){
	if( !elem.nodeName || elem.nodeName != "#text"){
		return false
	}
	var elem_span = createElementByHtml("<span>"+elem.nodeValue+"</span>");
	elem.parentNode.insertBefore(elem_span,elem);
	elem.parentNode.removeChild(elem);
	return elem_span;
}
/**
 * 统计有多少字(中英文内容)
 * @param {Object} str
 */
function getElemText(elem){
	var str = getElementAllTag(elem);
	//console.log("src:\n"+str);
	//去除标签
	str	 = str.replace(/<\/?[^>]*>/g,"");
	//去除全部空白
	str	 = str.replace(/\s/g,"");
	
	//console.log("dest:\n"+str);
	return str;
}
/**
 * 创建iframe
 * @param {Object} option
 */
function createIframe(option){
	var elem_iframe = document.createElement('iframe');
	
	if(option.src){
		elem_iframe.setAttribute("src",option.src);
	}
	
	//请勿修改高宽,会影响算页.可以改为参数传递
	elem_iframe.style.height = "100%";
	elem_iframe.style.width = "100%";
	
	elem_iframe.className = "countPage-iframe";
//	elem_iframe.style.position ="fixed";
	var parentNode = option.parentNode || document.querySelector("body");
	parentNode.appendChild(elem_iframe);
	
	onIframeLoad(elem_iframe,function(contentWindow){
		//自定义样式
		if(option.styles){
			insertStyles(contentWindow.document,option.styles);
		}
		if( option.callback ){
			option.callback( elem_iframe );
		}
	});
}

function onIframeLoad(iframe,callback){
	if (iframe.attachEvent){
	    iframe.attachEvent("onload", function(){
	        callback(iframe.contentWindow);
	    });
	} else {
	    iframe.onload = function(){
	        callback(iframe.contentWindow);
	    };
	}
}

function hasClass( elements,cName ){
	if( elements == undefined || elements.className == undefined ){
		return false;
	}
    return !!elements.className.match( new RegExp( "(\\s|^)" + cName + "(\\s|$)") );   
};    
function addClass( elements,cName ){    
	if( elements != undefined && elements.className != undefined){
		if( !hasClass( elements,cName) ){   
			elements.className += " " + cName;
		}
	}
};    
function removeClass( elements,cName ){
	if( elements != undefined && elements.className != undefined){
	    if( hasClass( elements,cName ) ){    
	        elements.className = elements.className.replace( new RegExp( "(\\s|^)" + cName + "(\\s|$)" ), " " );  
	    };
	}
};
//获取元素样式
function getStyle(ele){
	var eleStyle = "";
	if(window.getComputedStyle){
//					if(ele.ownerElement.defaultView.opener){
//						eleStyle      = ele.ownerElement.defaultView.getComputedStyle(ele,null);
//					}else{
			eleStyle      = window.getComputedStyle(ele,null);
//					}
	}else if(document.documentElement.currentStyle){
		eleStyle      = ele.currentStyle;
	}
	return eleStyle;
}
function stopPropagation(event){
	if(!event){
		return false;
	}
	// 阻止事件的冒泡
	event.stopPropagation() || (window.event.cancelBubble = true); 		
	event.preventDefault();//阻止默认事件
}
/**
 * 获取当前加载的所有样式
 */
function getAllStyles(){
	var elem_styles = document.querySelectorAll("style,link");
	var styles = [];
	for(var i = 0; i<elem_styles.length;i++){
		if( elem_styles[i].nodeName.toLocaleLowerCase() == "style" ){
			styles.push( {
				type:"text",
				content:elem_styles[i].innerHTML,
			});
		}else if( elem_styles[i].nodeName.toLocaleLowerCase() == "link" ){
			styles.push( {
				type:"link",
				content:elem_styles[i].href,
			});
		}
	}
	return styles;
}
/**
 * 插入样式
 * @param {Object} doc  document 
 * @param {Object} styles 样式列表 [{type:'text',content:"body{margin:30px;}",{type:'link',content:"body{margin:30px;}];
 */
function insertStyles(doc,styles){
	var elem_temp = document.createDocumentFragment();
	for(var i = 0; i < styles.length;i++){
		if( styles[i].type == "text" ){
			var elem_style = document.createElement("style");
			elem_style.setAttribute("type","text/css");
			elem_style.innerHTML = styles[i].content;
			elem_temp.appendChild( elem_style );
		}else if( styles[i].type == "link" ){
			var elem_style = document.createElement("link");
			elem_style.setAttribute("rel","stylesheet");
			elem_style.setAttribute("href",styles[i].content);
			elem_temp.appendChild( elem_style );
		}
	}
	doc.querySelector('body').appendChild( elem_temp );
}
/**
 * 插入脚本
 * @param {Object} doc  document 
 * @param {Object} styles 样式列表 ['1.css','2.css']
 */
function insertScript(doc,scripts){
	var elem_temp = document.createDocumentFragment();
	for(var i = 0; i < scripts.length;i++){
		var elem_script = document.createElement("script");
		elem_script.setAttribute("type","text/javascript");
		elem_script.setAttribute("src",scripts[i]);
		elem_temp.appendChild( elem_script );
		
	}
	doc.querySelector('body').appendChild( elem_temp );
}
