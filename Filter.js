/**
 * @author 符川
 * 2016-02
 * 在每次获取篇章数据之后的一次内容过滤操作
 * 可以过滤数据,如:限制图片/表格的大小
 * 可以添加处理方法,如:给图片添加查看大图功能
 */
var Filter = function(){
	
};
Filter.prototype = {
    /**
     * TODO, -- 每次变换 排版方式(横版/竖版)，都会执行此方法.
     * 
     */
	do:function( src ){
		//src = src.replace(/<div.+\r*\s*\n*src=>/ig,"<img src=");
		
		src = "<div>"+src+"</div>";
		var elem_src = createElementByHtml( src );
		Filter.Script( elem_src );
		Filter.Size( elem_src );
//		Filter.SyncSize( elem_src );
//		Filter.AysnSize( elem_src );
		Filter.CustomTag( elem_src );
		Filter.ImgPreview( elem_src );
		
		return elem_src.innerHTML;
	},
	/**
	 * 设置在屏幕能显示的最大的高宽度 
	 */
	Size:function( elem_src ){
		var elems = elem_src.querySelectorAll("[height],[width]");
		for(var i = 0;i < elems.length ;i++){
			var elem = elems[i];
			if( elem.getAttribute("height").indexOf("%") != -1 || elem.getAttribute("width").indexOf("%") != -1 ){
				console.warn("存在高宽为百分比的元素",elem);
				return;
			}
			//去掉style里的高框
			elem.style.maxHeight = "100%";
			elem.style.maxWidth = "100%";
			if( elem.getAttribute("style") && elem.getAttribute("style").indexOf("px") != -1 ){
				console.log( elem );
			}
			
			
			//两边留10px的距离
			var height = reader.config.height-50;
			var width  = reader.config.width-50;
			
			var e_height = parseInt( elem.getAttribute("height") );
			var e_width = parseInt( elem.getAttribute("width") );
			if( height < e_height ){
				elem.setAttribute("height",height + "px");
				elem.setAttribute("width",parseInt( e_width * (height/e_height) ) + "px");
			}
			
			e_height = parseInt( elem.getAttribute("height") );
			e_width = parseInt( elem.getAttribute("width") );
			if( width < e_width ){
				elem.setAttribute("height",parseInt( e_height * (width/e_width) ) + "px");
				elem.setAttribute("width",width + "px");
			}
		}
	},
	/**
	 * 限制同步加载元素大小 
	 */
	SyncSize :function(elem_src){
		var arr = ['table','tr','td'];
		
		for(var i = 0;i < arr.length;i++){
			var elems = elem_src.querySelectorAll( arr[i] );
			for(var j = 0;j < elems.length;j++){
				Filter.size( elems[j] );
			}
		}
		
		return elem_src;
	},
	
	/**
	 * 限制异步加载元素大小 
	 */
	AysnSize:function( elem_src ){
		var arr = ['img','audio','video'];
		
		for(var i = 0;i < arr.length;i++){
			var elems = elem_src.querySelectorAll( arr[i] );
			for(var j = 0;j < elems.length;j++){
				Filter.size( elems[j] );
			}
		}
		
		return elem_src;
	},
	/**
	 * 自定义标签转换成span
	 * @param {Object} elem_src
	 */
	CustomTag:function( elem_src ){
		var arr = ['nowrap','nzz1'];
		
		for(var i = 0;i < arr.length;i++){
			var elems = elem_src.querySelectorAll( arr[i] );
			for(var j = 0;j < elems.length;j++){
				var html = replaceElementTag( elems[j] ,"span");
				elems[j].parentNode.insertBefore(createElementByHtml(html),elems[j]);
				elems[j].parentNode.removeChild(elems[j]);
				replaceElementTag( elems[j] );
			}
		}
	},
	/**
	 * 过滤脚本
	 * @param {Object} elem_src
	 */
	Script:function( elem_src ){
		var elems = elem_src.querySelectorAll("*");
		for(var i = 0; i<elems.length; i++){
			var attrs = elems[i].attributes;
			for(var j = 0; j<attrs.length; j++){
				//console.log(attrs[j].nodeName);
				if( attrs[j].nodeName.indexOf("on") === 0){
					//TODO
					//console.log( elem_src );
				}
			}
		}
	},
	/**
	 * 点击图片查看大图的功能
	 * @param {Object} elem_src
	 */
	ImgPreview:function( elem_src ){
		//TODO remove
		//var elem_temp = document.createElement('img');
		//elem_temp.setAttribute("src","http://192.168.1.7/cgi-bin/tex.exe?123123");
		//elem_temp.setAttribute("height","100px");
		//elem_temp.setAttribute("width","100px");
		//elem_src.appendChild( elem_temp );
		
		var elem_img = elem_src.querySelectorAll("img");
		for(var i = 0;i < elem_img.length;i++){
			elem_img[i].setAttribute('onmouseup',"ImgPreview.preview( this,event );");
			elem_img[i].setAttribute('ontouchend',"ImgPreview.preview( this,event );");
		}
	},
	
    /**
     * 调整文档缩进. <br/>
     * 1. 清除 <p>的默认样式并 添加全局样式: text-indent: 2em;
     * 2. 在<br/>之后插入<span class="txt-indent"></span>. 
     *    (ps: span.txt-indent { width: 2em;  display: inline-block; })
     * 
     * @param {String} htmlStr 文档对象模型-innerHTML.
     *              例: "<div style='color:red; text-indent:2em;'>AA<br></div>"
     * @return {String} 处理后的文档对象模型
     *              例: "<div style='color:red;'>AA<br><span class="txt-indent"></span></div>"
     * 
     * @author gonglong-20160306.
     */
    setTextIndent:function (htmlStr) {
        
        var tmpHtml = "<div>"+htmlStr+"</div>";
        var domObj = createElementByHtml( tmpHtml );
        
        var spanHtml = "<br /><span class='txt-indent'></span>";
        
        var p_objs = [];
        
        try{
        	p_objs = domObj.querySelectorAll("p");
        }catch(e){
            // 因 html数据异常(标签未关闭)，导致DOM节点--domObj.querySelectorAll 为undefined.
            console.warn("html数据异常(标签未关闭)!");
        	return htmlStr;
        }
        
        var tmp = null;
        for (var i = 0, len = p_objs.length; i < len; i++) {
            tmp = p_objs[i];
            tmp.style.removeProperty("text-indent");
            // RegExp= /<br>|<br(\s?)\/>/ig;
            tmp.innerHTML = tmp.innerHTML.replace(/<br>|<br(\s?)\/>/ig, spanHtml);
            
        }
        
        return domObj.innerHTML;
        
    },
    /**
     * TODO - DEL.
     * 删除逗号等标点符号 之前的空格.<br/> 
     * ps: 句号，问号，感叹号,冒号 -- 中文版.<br/>
     * 
     * @param {String} htmlStr 字符串格式的html文本.
     * @return {String} formatHtml 修改过后的文本.
     * 
     * @author gonglong-20160307.
     */
    delSpaceBeforeComma:function ( htmlStr ){
        
        var formatHtml = "";
        
        if (!htmlStr) {
            return formatHtml;
        }
        
        formatHtml = htmlStr;
        
        // 至少一个 空格的逗号
        var regTempls = [
            //{templ: /(\s+),/g, repalceTxt: ","},
            {templ: /(\s+)，/g, repalceTxt: "，"},
            
            // [.] -- 查找单个字符，除了换行和行结束符
            //{templ: /(\s+)\./g, repalceTxt: "."},
            {templ: /(\s+)。/g, repalceTxt: "。"},
            
            // ?--匹配任何包含零个或一个 n 的字符串。
            //{templ: /(\s+)(\?)/g, repalceTxt: "?"},
            {templ: /(\s+)？/g, repalceTxt: "？"},
            
            //{templ: /(\s+)!/g, repalceTxt: "!"},
            {templ: /(\s+)！/g, repalceTxt: "！"},
            
            //{templ: /(\s+):/g, repalceTxt: ":"},
            {templ: /(\s+)：/g, repalceTxt: "："}
        ];
        
        var item = null;
        for (var i = 0, len = regTempls.length; i < len; i++) {
            item = regTempls[i];
            formatHtml = formatHtml.replace(item.templ, item.repalceTxt);
        }
        
        return formatHtml;
        
    }
	
}
Filter = new Filter();
