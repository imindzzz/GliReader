/**
 * @author 符川
 * 2016-02
 * 评论相关的操作
 */

/**
 * 遍历拆分页
 * @param {Object} elem 待分页的Elem
 * @param {Object} parent 待插入的
 */
function traverseElem(elem,parent){
	var elem_children = getElementChild(elem);
	
	//循环插入子节点, 计算大小
	for (var i = 0;i<elem_children.length;i++ ){
		var elem_clone 			= cloneElemnt( elem_children[i] );
		
		try{
			parent.appendChild( elem_clone );
		}catch(e){
			console.log("添加节点-ERROR:" + e);
		}
		 
		var currentHeight = getShowPage().offsetHeight;
		var currentWidth = getShowPage().offsetWidth;
		
		//判断加入节点是否会导致页面超过大小
		if( currentHeight <= window.CONFIG.height && currentWidth <= window.CONFIG.width){
			elem_children[i].parentNode.removeChild(elem_children[i]);
			//getElementChild 获取到的是Array elem 的子节点是  HtmlCollection
			elem_children.splice(0,1);i--;
			document.title = currentHeight;
			continue;
		}else{
		    
		    // 如果是table
            if(elem_children[i].nodeName == "TABLE"){
                
                var theadObj = elem_clone.querySelector("thead");
                var tbodyObj = elem_clone.querySelector("tbody");
                
                var options = {
                    winH: window.CONFIG.height,
                    currenH: currentHeight,
                
                    tblH: elem_clone.offsetHeight,
                    theadH: (!!theadObj) ? theadObj.offsetHeight : 0,
                    trH: elem_clone.querySelector("tr").offsetHeight
                };
                
                var flg = splitTable(options, elem_children[i]);
                
                //移除导致页面超过大小的节点
                parent.removeChild( elem_clone );
                elem_children = getElementChild(elem);
                
                if(flg) {
                    // 本页载入结束，进入下一页计算.
                    return true;
                }
                
                i--;
                continue;
            }
            
			//移除导致页面超过大小的节点
			parent.removeChild( elem_clone );
			
			//如果是#Text节点,拆分后再重新循环插入
			if( splitTextNode( elem_children[i],2) ){
				elem_children = getElementChild(elem);
				i--;
				continue;
			}
			

			
			//如果有子节点,把子节点拆分加入
			if( getElementChild(elem_children[i]).length > 0 ){
				//当前节点外部标签()
				var child = createElementByHtml( getElementOutTag(elem_children[i]) );
				parent.appendChild(child);
				return traverseElem( elem_children[i],child );
			}
			
			return true;
		}
	}
}

//根据配置获取显示的Page
function getShowPage(){
	if( window.parent.getScreenShowType() === "PC" ){
		document.querySelector(".reader-is-pc").style.display = 'block';
		return document.querySelector("#page_pc");
	}else{
		document.querySelector(".reader-is-phone").style.display = 'block';
		return document.querySelector("#page_phone");
	}
}

//准备分页数据
function countPage(option){
	console.time("COUNTER_CHAPT");
	
	var chapt		= option.chapt;
	var config		= option.config;
	//修复宽高为小数的情况
	config.width = Math.floor(config.width);
	config.height = Math.floor(config.height);
	
	var callback	= option.callback;
	var ext_styles  = option.ext_styles;
	
	window.CONFIG = {
		height: config.height,
		width:config.width,
	}
	
	var pages = []; //结果
	var elem_page = getShowPage();
	//复制显示样式
	insertStyles( document,window.parent.getAllStyles() );
	//根据config 设置样式
	elem_page.style.fontSize = config.fontSize + 'px';
	elem_page.style.lineHeight = (config.fontSize + (config.fontSize/2))+6 +"px";
	if( config.typesetting === 'vertical'){
		addClass( elem_page,'reader-vertical-rl' );
	}
	//恢复必要的影响显示大小的样式,
	elem_page.style.overflow = 'inherit';
	if( config.typesetting === "row"){
		elem_page.style.width		= window.CONFIG.width+"px";
		elem_page.style.height		= "auto";
	}else{
		elem_page.style.width		= "auto";
		elem_page.style.height		= window.CONFIG.height+"px";
		document.querySelector(".page-middle-content-each").className += " reader-vertical-rl";
	}
	//TODO 复制DOM结构(现在是直接写在页面上的,reader.html 改变时 countPage.html 也要同步改才行);
	
	//根据篇章内容生成节点
	var elem_content = createElementByHtml( chapt.html );
	//有可能是HTMLCollection(篇章整体不是一个节点)
	if( elem_content.length != undefined ){
		var elem_temp = document.createElement("div");
		while( elem_content.length != 0 ){
			elem_temp.appendChild( elem_content[0] );
		}
		elem_content = elem_temp;
	}
	
	//拆分页, 直到内容为空
	//延时执行,不然页面会停止响应
	window.LOOP = setInterval(function(){
		//如果是锁定状态就跳过
		if( window.LOOP_STATUS ){
			return false;
		}
		
		//计算下一页
		if( getElementChild( elem_content ).length != 0 ){
			console.time("COUNTER_PAGE");
			//锁定定时器
			window.LOOP_STATUS = true;
			traverseElem( elem_content,elem_page );
			//解除锁定定时器
			window.LOOP_STATUS = false;
			//console.timeEnd("COUNTER_PAGE");
			pages.push({
				parent_chapt:chapt,
				index:pages.length,
				text:getElemText(elem_page ),
				html:elem_page.innerHTML,
			});
			
			elem_page.innerHTML = "";
			
			//分步返回
			if( pages.length % config.count_step == 0 ){
				//console.log("STEP_CALLBACK",pages.length / config.count_step);
				chapt.pages = pages;
				callback(chapt,pages.length/config.count_step,"working");
			}
		}else{
			clearInterval( window.LOOP );
			
			if( pages.length == 0){
				console.warn("存在篇章内容为0页",chapt);
			}
			//console.timeEnd("COUNTER_CHAPT");
			//console.log("CHAPT_INDEX:",chapt.index,"PAGE_SIZE:",pages.length);
			chapt.pages = pages;
			//console.log("STEP_CALLBACK",'done');
			
			if( pages.length <= config.count_step){
				callback(chapt,1,'done');
			}else{
				callback(chapt,Infinity,'done');
			}
		}
	},1);
	
}