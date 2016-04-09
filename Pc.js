/**
 * @author 符川
 * 2016-02
 * PC界面的操作,
 */
function close_opera_content(event,that){												    //隐藏操作面板
	if(that == undefined || that == null){
		return false;
	}
	
	var opera_content        = document.querySelector(".reader-opera-content");
	opera_content.style.display = 'none';
	if(hasClass(event.target,"reader-opera-content")){									    //隐藏tab面板
		s_currentTab         = document.getElementsByClassName("content-phone-bottom-each")[1];
		toggle_pc_dir_content("close");
		that.style.display   = "none";
	}
}
function show_opera_content( event,that){
	if( typeof ContentMenu != "undefined" ){
		if( ContentMenu ){
			if( Range.get() ){
				ContentMenu.show(event.pageX,event.pageY);
				return;
			}else{
				ContentMenu.hide();
			}
		}
		
	}
	
	//判断点击区域,是否翻页或者显示面板
	var elem_content_page = document.querySelector(".reader-show-content-page");
	var percent = (event.pageX - elem_content_page.getClientRects()[0].left ) / elem_content_page.offsetWidth * 100;
	if( percent <= 30){
		reader_page_pre();
	}else if( percent >= 70 ){
		reader_page_next();
	}else if(CONFIG.useOperaPanel){
		//显示操作面板
		var opera_content        = document.getElementsByClassName("reader-opera-content");
		if(opera_content == undefined || opera_content == null || (typeof(opera_content) != "object")){
			return false;
		}
		opera_content[0].style.display   = "block";
	}
}
function toggle_pc_dir_content(status,event,that,index){
	var panel    = document.getElementsByClassName("pc-left-dir-content")[0];
	if(panel == undefined || typeof(panel) != "object"){
		return false;
	}
	if(status == undefined || status == "close"){
		panel.style.display = "none";
	}else if(status == "open"){
		panel.style.display = "block";
	}else if(status == "toggle"){
		if(getStyle(panel).display == "none"){
			toggle_pc_dir_content("open",event,that);
		}else{
			toggle_pc_dir_content("close",event,that);
		}
	}
	if( index != undefined ){
		toggle_panle(null,null,index);
	}
	stopPropagation(event);
}

document.getElementsByClassName("change-position-bar-btn")[0].addEventListener(touchEvents.touchstart,function(){
	change_pocess         = true;
});
document.getElementsByClassName("change-bright-bar-btn")[0].addEventListener(touchEvents.touchstart,function(){
	change_bright         = true;
});
