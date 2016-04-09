/*
 * @author 符川
 * 2016-02
 * 对Range操作的封装
 */
var Range = function(){
	this.range = null;
}
Range.prototype = {
	create:function(){
		//TODO 兼容其它浏览器
		var range = document.createRange();
		return range;
	},
	get:function(){
		//TODO 兼容其它浏览器
		try{
			var range = this.range || document.getSelection().getRangeAt(0);
			if( range.startContainer == range.endContainer && range.startOffset == range.endOffset ){
				return null;
			}
			return range;
		}catch(e){
			//console.log(e.message)
			return null;
		}
	},
	clear:function(){
		//TODO 兼容其它浏览器
		document.getSelection().removeAllRanges(); 
		this.range = null;
	},
	set:function( range ){
		//TODO 兼容其它浏览器
		this.clear();
		document.getSelection().addRange(range);
	},
	/**
	 * 通过纯文本偏移量查找节点和偏移量
	 * @param {Object} offset
	 * @param {Object} elme
	 */
	findNode:function( offset,elem ){
		var length = getElemText( elem ).length; // 当前节点文字内容长度
		if( length === 0 ){
			return false;
		}
		var elem_child = getElementChild(elem);  // 当前节点所有子节点
		//offset小于 length 那必定在当前节点
		if(offset < length){
			var sum = 0;
			for( var i = 0; i< elem_child.length ;i++){
				sum += getElemText( elem_child[i] ).length;
				if(sum > offset){
					//尾掉优化
					return this.findNode(offset - ( sum - getElemText( elem_child[i] ).length ),elem_child[i]);
				}
			}
		}
		
		return {
			elem:elem,
			offset:offset
		}
	},
	/**
	 * 遍历range选中的节点
	 * @param {Object} range
	 * @param {Object} callback
	 */
	map:function( range , callback){
		var elem_start,elem_end;
		if(range.startContainer != range.endContainer){
			elem_start = splitTextNode2Span(range.startContainer,range.startOffset)[1];
			elem_end = splitTextNode2Span(range.endContainer,range.endOffset)[0];
			
			callback( elem_start,0);
			//所有子节点
			var elem_child = range.commonAncestorContainer.childNodes;
			var flag = false;
			for(var i = 0;i<elem_child.length;i++){
				
				//查找到起点
				if( elem_child[i].contains( elem_start ) ){
					flag = true;
					continue;
				}else if( elem_child[i].contains( elem_end ) ){
					//终点时退出
					break;
				}
				
				//如果找到了终点
				if(flag){
					callback( elem_child[i],i+1);
				}
			}
			callback( elem_end,i);
		}else{
			elem_start = splitTextNode2Span(range.startContainer,range.startOffset,range.endOffset)[1];
			elem_end = elem_start;
			callback( elem_start,0);
		}
		
		this.clear();
		//重置range
		range.setStart(elem_start,0);
		range.setEnd(elem_end,1);
	},
	/**
	 * 为选中区域设置
	 * @param {Object} range
	 * @param {Object} className
	 */
	addClass:function( range,className ){
		range = range || this.get();
		if( !range ){
			return false;
		}
		
		Range.map( range , function( elem,index){
			if(elem.nodeName == "#text"){
				addClass( text2Span(elem),className );
			}else{
				addClass(elem,className);
			}
		});
		
		return range ;
	},
	removeClass:function( range,className ){
		range = range || this.get();
		if( !range ){
			return false;
		}
		
		Range.map( range , function( elem,index){
			removeClass(elem,className);
		});
		
		return range ;
	}
}
Range = new Range();