/**
 * @author 符川
 * 2016-02
 * PC的右键菜单
 */
var ContentMenu = function(){
	//操作配置
	var option = [{
		"name":"笔记",
		'class':"note",
		"callback":Note.addNote,
	},{
		"name":"删除",
		'class':"note",
		"callback":Note.deleteNote,
	}];
	this.option = option;
	this.init();
};
ContentMenu.prototype = {
	init:function(){
		var menu = this;
		var elem_menu = createElementByHtml("<div class='contentmenu' ></div>");
		for(i=0;i<this.option.length;i++){
			var elem_item = createElementByHtml("<div class='item' ></div>");
			addClass(elem_item,menu.option[i].class);
			elem_item.innerHTML = menu.option[i].name;
			elem_item.addEventListener('mouseup',function(index){
				//闭包
				return function(event){
					menu.handleClick(index);
					stopPropagation(event);
				}
			}(i),false);
			elem_menu.appendChild(elem_item);
		}
		document.querySelector("body").appendChild(elem_menu);
		menu.elem_menu = elem_menu;
		menu.range = null;
		menu.isSelectRange = false;
	},
	render:function(x,y,range){
		var menu = this;
		menu.range = range || Range.get();
		
		if(!menu.range){
			return false;
		}
		menu.elem_menu.style.left = x + "px";
		menu.elem_menu.style.top = y + "px";
		var commonAncestorContainer = menu.range.commonAncestorContainer;
		for(i=0;i<menu.option.length;i++){
			//TODO 更新文字
		}
	},
	show:function(x,y,range){
		this.render(x,y,range);
		this.elem_menu.style.display='inline-block';
	},
	hide:function(){
		this.elem_menu.style.display='none';
	},
	handleClick:function(index){
		var menu = this;
		var option_item = menu.option[index];
		var elem_item = menu.elem_menu.querySelectorAll(".item")[index];
		if(option_item.callback){
			var range = menu.range;
			var elem_currentPage = getParent(range.commonAncestorContainer,".page-middle-content-each ");
			if( !elem_currentPage ){
				// alert("选择错误");
                reader.dialogObj.open("选择错误");
			}else{
				var currentChapt = elem_currentPage.page.parent_chapt;
				option_item.callback(currentChapt,range);
			}
		}
		
		//避免击穿
		setTimeout(function(){
			menu.hide();
		},100);
	},
};
ContentMenu = new ContentMenu();
