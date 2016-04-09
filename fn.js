/**
 * @author 符川
 * 2016-02
 * PC/PHONE界面公共的操作,
 */
function loadMask( action,selector ){
	selector = selector || ".mask";
	var elem_mask = document.querySelector( selector );
	if( action == "load" ){
		elem_mask.style.display ='block';
	}else{
		elem_mask.style.display ='none';
	}
}
//目录显示
function reader_get_chapts(){
	var elem_phone_temp = document.createDocumentFragment();
	var elem_pc_temp = document.createDocumentFragment();
	for(var i = 0; i<reader.chapts.length; i++){
		//phone
		var ele       = document.createElement("li");
		ele.setAttribute("id","dir-chapt-"+i);
		ele.setAttribute("onclick","reader_goto_chapt("+i+",event,this)"); // TODO-warn-02, 疑似不规范代码-gonglong-20160304;
		ele.innerText = reader.chapts[i].chapter_name;
		elem_phone_temp.appendChild( ele );

		//pc
		var ele       = document.createElement("li");
		ele.setAttribute("id","dir-chapt-"+i);
		ele.setAttribute("onmouseup","reader_goto_chapt("+i+",event,this)");
		ele.innerText = reader.chapts[i].chapter_name;
		elem_pc_temp.appendChild( ele );
	}

	var phone = document.getElementById("phone-dir-content").children[0];
	phone.innerHTML = "";
	phone.appendChild( elem_phone_temp );
	var pc = document.getElementById("pc-dir-content").children[0];
	pc.innerHTML = "";
	pc.appendChild( elem_pc_temp );
}
/**
 * 笔记显示
 */
function reader_get_notes( notes ){
	var elem_phone_temp = document.createDocumentFragment();
	var elem_pc_temp = document.createDocumentFragment();
	for(var i = 0; i < notes.length; i++){
		var html =
			"<li>" +
				"<div class='text'>"+
					"<div class='point'></div>"+
					"<div class='content'>"+
						"<span>" + notes[i].comm_mark_text +"</span>"+
					"</div>"+
				"</div>"+
				"<div class='content'>"+
					"<span>" + notes[i].comm_text +"</span>"+
				"</div>"+
				"<div class='date'>"+
					"<span>" +  notes[i].comm_time +"</span>"+
				"</div>"+
				"<div class='opear'>"+
					"<div class='item goto'></div>"+
				"</div>"+
			"</li>";
		function anonymous( note ){
			loadMask("load");
			reader.gotoOffset({
				chapt_index:reader.findChaptById(note.chapter_id).index,
				offset:note.comm_offset_start,
			},function(){
				reader_get_pageContent();
				loadMask();
			});
		};
		var elem_phone_li = createElementByHtml(html);
		elem_phone_li.note = notes[i];
		elem_phone_li.addEventListener("touchend",function( event ){
			if( event.target.className.indexOf("goto") != -1 ){
				anonymous( this.note );
			}
		},false);
		elem_phone_temp.appendChild( elem_phone_li );

		var elem_pc_li = createElementByHtml(html);
		elem_pc_li.note = notes[i];
		elem_pc_li.addEventListener("mouseup",function( event ){
			if( event.target.className.indexOf("goto") != -1 ){
				anonymous( this.note );
			}
		},false);
		elem_pc_temp.appendChild( elem_pc_li );
	}

	var phone = document.getElementById("phone-note-content").children[0];
	phone.innerHTML = "";
	phone.appendChild( elem_phone_temp );
	var pc = document.getElementById("pc-note-content").children[0];
	pc.innerHTML = "";
	pc.appendChild( elem_pc_temp );
}

/**
 * 显示书签
 * @param {Object} bookmarks
 */
function reader_get_bookmarks( bookmarks ){
	var elem_phone_temp = document.createDocumentFragment();
	var elem_pc_temp = document.createDocumentFragment();
	for(var i = 0; i < bookmarks.length; i++){
		var html =
			"<li>"+
				"<div class='name'><span>"+bookmarks[i].chapter_name+"</span></div>"+
				"<div class='descript'><p>"+bookmarks[i].chapter_exp+"</p></div>"+
				"<div class='date'><span>"+bookmarks[i].chapter_create_time+"</span></div>"+
				"<div class='opear'>"+
					"<div class='item delete'></div>"+
					"<div class='item goto'></div>"+
				"</div>"+
			"</li>";
		function del( bookmark ){
			loadMask("load");
			Bookmark.deleteBookmark(bookmark,function( bookmarks ){
				reader_get_bookmarks( bookmarks );
				loadMask();
			}, function(){
                loadMask();
            });
		};
		function goto( bookmark ){
			loadMask("load");
			reader.gotoOffset({
				chapt_index:reader.findChaptById( bookmark.chapter_id ).index,
				offset:bookmark.offset,
			},function(){
				reader_get_pageContent();
				loadMask();
			});
		};
		var elem_phone_li = createElementByHtml(html);
		elem_phone_li.bookmarks = bookmarks[i];
		elem_phone_li.addEventListener("touchend",function( event ){
			if( event.target.className.indexOf("delete") != -1 ){
				del( this.bookmarks );
			}
			if( event.target.className.indexOf("goto") != -1 ){
				goto( this.bookmarks );
			}
		},false);
		elem_phone_temp.appendChild( elem_phone_li );

		var elem_pc_li = createElementByHtml(html);
		elem_pc_li.bookmarks = bookmarks[i];
		elem_pc_li.addEventListener("mouseup",function( event ){
			if( event.target.className.indexOf("delete") != -1 ){
				del( this.bookmarks );
			}
			if( event.target.className.indexOf("goto") != -1 ){
				goto( this.bookmarks );
			}
		},false);
		elem_pc_temp.appendChild( elem_pc_li );
	}

	var phone = document.getElementById("phone-bookmark-content").children[0];
	phone.innerHTML = "";
	phone.appendChild( elem_phone_temp );
	var pc = document.getElementById("pc-bookmark-content").children[0];
	pc.innerHTML = "";
	pc.appendChild( elem_pc_temp );
}
/**
 * 显示评论
 * @param {Object} bookmarks
 */
function reader_get_comments( comments ){
	var elem_phone_temp = document.createDocumentFragment();
	var elem_pc_temp = document.createDocumentFragment();
	for(var i = 0; i < comments.length; i++){
		var html =
			'<li>'+
				'<div class="username"><span>' + comments[i].user_name + '</span></div>'+
				'<div class="content"><p>' + comments[i].feedback_text + '</p></div>'+
				'<div class="date"><span>' + comments[i].feedback_time + '</span></div>'+
			'</li>';
		var elem_phone_li = createElementByHtml(html);
		elem_phone_li.comments = comments[i];
		elem_phone_temp.appendChild( elem_phone_li );

		var elem_pc_li = createElementByHtml(html);
		elem_pc_li.comments = comments[i];
		elem_pc_temp.appendChild( elem_pc_li );
	}

	var phone = document.querySelector(".phone-comment-submit > ul");
	phone.innerHTML = "";
	phone.appendChild( elem_phone_temp );
	var pc = document.querySelector(".pc-comment-submit > ul");
	pc.innerHTML = "";
	pc.appendChild( elem_pc_temp );
}
/**
 * 切换显示隐藏评论
 */
function toggle_comments( action ){
	if( action == "show" ){
		loadMask( "load",".pc-mask" );
		document.querySelector(".pc-comment-submit").style.display =  "block";
		document.querySelector(".phone-comment-submit").style.display =  "block";
	}else{
		loadMask( null,".pc-mask" );
		document.querySelector(".pc-comment-submit").style.display =  "none";
		document.querySelector(".phone-comment-submit").style.display =  "none";
	}
}
/**
 * 提交评论
 * @param {Object} that
 * @param {Object} event
 */
function comment_submit(that,event){
	var content = that.parentNode.querySelector("input").value;
	var comment = {
		book_id:reader.config.bookId,
		user_id:Utils.localStorage.get('user_id'),
		text:content,
	};
	loadMask("load");
	Comment.addComment(comment,function( comments ){
		reader_get_comments( comments );
		that.parentNode.querySelector("input").value = "";
		loadMask();
	}, function(msg){
	    alert(msg);
        loadMask();
    });
}

/**
 * 切换显示隐藏评论
 */
function toggle_feedback( action ){
	if( action == "show" ){
		loadMask( "load",".pc-mask" );
		document.querySelector(".pc-feedback-submit").style.display =  "block";
		document.querySelector(".phone-feedback-submit").style.display =  "block";
	}else{
		loadMask( null,".pc-mask" );
		document.querySelector(".pc-feedback-submit").style.display =  "none";
		document.querySelector(".phone-feedback-submit").style.display =  "none";
	}
}
/**
 * 提交反馈
 * @param {Object} that
 * @param {Object} event
 */
function feedback_submit(that,event){
	var feedback = {
		book_id:reader.config.bookId,
		text:that.parentNode.parentNode.querySelector("textarea").value,
		user_id:Utils.localStorage.get('user_id'),
	};
	API.addFeedback(feedback,function(){
		toggle_feedback();
		// alert('提交成功');
        reader.dialogObj.open("提交成功");
	});
};
/**
 * 切换显示隐藏搜索结果
 * @param {Object} action
 */
function toggle_search( action,event ){
	if( action == "show" ){
		loadMask( "load",".pc-mask" );
		document.querySelector('.pc-search').style.display = "block";
		document.querySelector('.phone-search').style.display = "block";
	}else{
		loadMask( 'close',".pc-mask" );
		document.querySelector('.pc-search').style.display = "none";
		document.querySelector('.phone-search').style.display = "none";
	}
	reader_toggle_phone_opera( event,"close" );
}
/**
 * 提交搜索
 * @param {Object} that
 * @param {Object} event
 */
function search_submit(that,event){
	var keywords = that.parentNode.parentNode.querySelector("input").value;
	if( keywords === '' ){
		// alert('请输入关键字');
        reader.dialogObj.open("请输入关键字");
		return false;
	}
	loadMask('load');
	API.serarch({
		book_id:Utils.QueryString("id"),
		keywords:keywords,
	},function( result ){
		//返回的是二位数组,预处理成一维的
		var data = [];
		for(var i = 0;i<result.data.length;i++){
			data = data.concat( result.data[i] );
		}
		search_render( data,keywords );
		loadMask();
	},function () {
        loadMask();
    });
//	stopPropagation( event );
}

function search_render( data,keywords ){
	var elem_pc_temp = document.createDocumentFragment();
	var elem_phone_temp = document.createDocumentFragment();
	if( data.length != 0 ){
		elem_pc_title = createElementByHtml("<p class='result'>共有"+data.length+"个结果符合搜索要求</p>");
		elem_phone_title = createElementByHtml("<p class='result'>共有"+data.length+"个结果符合搜索要求</p>");
	}else{
		elem_pc_title = createElementByHtml("<p class='result'>没有符合搜索要求的结果</p>");
		elem_phone_title = createElementByHtml("<p class='result'>没有符合搜索要求的结果</p>");
	}
	elem_pc_temp.appendChild( elem_pc_title );
	elem_phone_temp.appendChild( elem_phone_title );

	for(var i = 0;i < data.length;i++){
		var html = "<li>" + data[i]['chapter_val'].replace(keywords,"<span class='keywords'>"+keywords+"</span>") + "</li>";
		var elem_pc_li = createElementByHtml( html );
		elem_pc_li.item = data[i];
		elem_pc_temp.appendChild( elem_pc_li );

		var elem_phone_li = createElementByHtml( html );
		elem_phone_li.item = data[i];
		elem_phone_temp.appendChild( elem_phone_li );
	}

	document.querySelector('.pc-search ul').innerHTML = "";
	document.querySelector('.pc-search ul').appendChild( elem_pc_temp );

	document.querySelector('.phone-search ul').innerHTML = "";
	document.querySelector('.phone-search ul').appendChild( elem_phone_temp );
}

function search_goto(event){
	if( event.target.nodeName.toLowerCase() === 'li' ){
		var  item = event.target.item;
		var chapt = reader.findChaptById( item.chapter_id );
		toggle_search('close',event);
		loadMask('load');
		reader.gotoOffset({
			chapt_index:chapt.index,
			offset:item.seach_start,
		},function(){
			reader_get_pageContent();
			loadMask();
		});
	}
}
/**
 * 切换面板显示区域
 * @param {Object} event
 */
function toggle_panle(that,event,index ){
	//找到点击的序号
	if( !index ){
		var elem_child = that.children;
		for(var i = 0;i < elem_child.length ; i++){
			if( elem_child[i] === event.target){
				index = i + 1;
				break;
			}
		}
	}
    
    /* BUG #4791 -- add by gonglong-20160312 start */
    if(!index) {
        // index: undefined;
        return false;
    }
    var dirPanel = document.getElementsByClassName("phone-bottom-dir-content")[0];
    var liItems = dirPanel.getElementsByClassName("header-dir-ul")[0].children;
    
    for (var j = 0, len = liItems.length; j < len; j++) {
        liItems[j].removeAttribute("class");
    }
    
    liItems[index-1].setAttribute("class", "current");
    /* BUG #4791 -- add by gonglong-20160312 end */
    
	//获取显示面板
	var elem_dir_content = document.querySelectorAll(".pc-left-dir-content,.phone-bottom-dir-content");
	//切换显示面板
	for(var i = 0;i < elem_dir_content.length;i++){
		for(var j = 1;j < elem_dir_content[i].children.length ; j++){
			if( index === j ){
				elem_dir_content[i].children[j].style.display = 'block';
			}else{
				elem_dir_content[i].children[j].style.display = 'none';
			}
		}
	}

	stopPropagation( event );
}
/**
 * 获取分页显示到页面
 * @param {Object} type
 * @param {Object} isSingle
 */
function  reader_get_pageContent(type, isSingle ){
	//console.log("reader_get_pageContent",reader.point);
	var showType = getScreenShowType();
	var elem_page ;
	switch( showType ){
		case "PC":
			var pages = reader.getPageContent();
			if( pages.length == 0){
				reader.resetPagePoint();
				// alert("没有了");
                reader.dialogObj.open("没有了");
				return ;
			}
			var elem_pages = document.querySelectorAll('.page-middle-content-each');

			for(var i = 0;i < elem_pages.length;i++){
				var page = reader.config.typesetting == "row"? pages[i]:pages[elem_pages.length-i-1];

				if( page ){
					document.querySelectorAll('.page-left-footer-content')[i].innerHTML = "第"+(page.parent_chapt.index+1) +"章/"+"第"+ (page.index+1) + "页";
					document.querySelectorAll(".page-left-header-content")[i].innerHTML = page.parent_chapt.chapter_name;

					elem_pages[i].innerHTML = page.html;
					elem_pages[i].page = page;
					// TODO 异步标注,代码报错也不影响后续代码的执行
					setTimeout(function(index){
						return function(){
							if( typeof Note != "undefined" ){

								Note.render(elem_pages[index]);
							}
						}
					}(i),1);
				}else{
					document.querySelectorAll('.page-left-footer-content')[i].innerHTML = "";
					document.querySelectorAll(".page-left-header-content")[i].innerHTML = "";

					elem_pages[i].innerHTML = "";
					elem_pages[i].page = null;
				}
			}

 		break;
		case "PHONE":
			var pages = reader.getPageContent();
			if( pages.length == 0){
				//alert("没有了");
                reader.dialogObj.open("没有了");
				reader.resetPagePoint();
				return ;
			}
			elem_page = document.getElementById('phone-text-show-content').children[0];
			elem_page.innerHTML = pages[0].html;
			elem_page.page = pages[0];

			document.querySelector(".opera-content-phone-middle .footer").innerHTML = "第"+(pages[0].parent_chapt.index+1) +"章/"+"第"+ (pages[0].index+1) + "页";
			document.querySelector(".opera-content-phone-middle .header").innerHTML = pages[0].parent_chapt.chapter_name;
			if(typeof Note != "undefined"){
				Note.render( elem_page );
			}
		break;
	}

	//重置快速跳转进度条
	var sum = reader.sumPageLength();
	var current = reader.sumPageLength(reader.offset.chapt_index) + reader.offset2Page( reader.offset ) + 1;
	var percent = current/sum*100 % 100;
	reader_change_process( null,percent);
	return;
}

//上一章  判断当前是横排还是竖排显示
function reader_page_pre( isSingle ){
	loadMask("load");
	if(reader.config.typesetting == "vertical"){
		reader.pageNext(function(state){
			loadMask();
			reader_get_pageContent( )
		});

	}else{
		reader.pagePrev(function(state){
			loadMask();
			reader_get_pageContent();
		});
	}
}
//下一章
function reader_page_next( isSingle ){
	loadMask("load");
	if(reader.config.typesetting == "vertical"){
		reader.pagePrev(function(state){
			loadMask();
			reader_get_pageContent();
		});
	}else{
		reader.pageNext(function(state){
			loadMask();
			reader_get_pageContent();
		});
	}
}
//直接跳转到某一章节
function reader_goto_chapt(index,event,that){
	loadMask("load");
	toggle_pc_dir_content('close',event,that);
	reader_toggle_phone_opera( event,"close" );
	close_opera_content(event,that);
	reader.gotoChapt(index,function(state){
		loadMask();
		reader_get_pageContent();
	});
	stopPropagation(event);
}

//设置传入doms的字体大小
function reader_set_font_size(doms,size){
	if(doms == undefined && typeof(doms) != "object"){
		return false;
	}
	if(size == undefined || size == null ){
		return false;
	}
	if(size < 12){
		size = 12;
		return ;
	}
	if(size >36){
		size = 36;
		return ;
	}
	for(var i = 0; i < doms.length; i++){
		if(doms[i] == undefined ){
			continue;
		}
		doms[i].style.fontSize   = size+"px";
		doms[i].style.lineHeight = (size + (size/2))+6 +"px";
	}
}
function toggle_bright(that,event){
	if( !that.bright ){
		filter_brightness(document.getElementsByTagName("body")[0],0);
		that.bright = true;
	}else{
		filter_brightness(document.getElementsByTagName("body")[0],100);
		that.bright = false;
	}
	stopPropagation( event );
}
//调整页面显示亮度
function filter_brightness(ele,percent){
	if(ele == undefined || ele == null || typeof(ele) != "object"){
		return false;
	}
	if(percent != undefined && percent < 0 && percent > 100){
		percent = 100;
	}
	
	//FIXME 调用 cordova 亮度调整; 在移动浏览器中使用filter会使字体变模糊   (如果检测是手机调用手机端接口调整亮度)
    if(!touchEvents.isPC()){
		try{
            
            /*
			if( cordova ){
				wnbi_setBrightness(percent/100.0);
				return true;
			}
			*/

			var newBgCol = changeBgColrBright(percent);
			var mobilePanel = document.getElementById("phone_content");
            mobilePanel.style.backgroundColor = newBgCol;
            
            if(percent == 100) {
                setBrightnessDay();
            } else if (percent == 0) {
                setBrightnessNight();
            }
            
            return true;
		}catch(e){
			return;
		}
	}
    
    // PC 亮度 范围: 30-100;
    percent = Math.ceil(30 + (70 * percent/100));
    
	var brightness              = "brightness("+percent+"%)";
	ele.style.filter            = brightness;
	ele.style.webkitFilter      = brightness;
//	ele.style.mozFilter         = brightness;
	ele.style.msFilter          = brightness;
	ele.style.oFilter           = brightness;
//	ele.style.filter            = "url(desaturate.svg#"+percent+")";
	ele.style.filter            = "progid:DXImageTransform.Microsoft.BasicImage(brightness="+(percent/100)+");"
}

/**
 * 调整手机页面亮度。<br/>
 * 1. 移动浏览器中使用filter会使字体变模糊.
 * 2. 使用 cordova, 目前调查中
 * 3. 颜色范围已在方法中 固定。
 * 
 * @param {Number} bright 小于100的 正整数
 * 
 * @return {String} newColor 计算后的颜色rgb()
 * 
 */
function changeBgColrBright (bright) {

    // rgb(255,255,255)
    var start = "#FFFFFF";
    // rgb(9,12,19)
    var end = "#090c13";

    var brightVal = bright / 100;

    var rgb = [{
        name: 'r',
        start: 9,
        rang: 255 - 9,
    },{
        name: 'g',
        start: 12,
        rang: 255 - 12,
    },{
        name: 'b',
        start: 19,
        rang: 255 - 19,
    }
    ];
    
    var newRgb = [];
    var tmp = null;
    for(var i = 0, len = rgb.length; i < len; i++){
        tmp = rgb[i];
        newRgb.push( Math.ceil(tmp.start + tmp.rang*brightVal));
    }

    var newColor = 'rgb(' + newRgb.join(",") + ")";
    
    return newColor;
}

function reader_clear_search(){
	var clearEle              = document.getElementsByClassName("header-search-input")[0].children[2];
	var s_clearEle            = document.getElementsByClassName("content-phone-top-right")[0].children[2];
	clearEle.value            = "";
	s_clearEle.value          = "";
}
function reader_change_typesetting(status,event,that){
	stopPropagation(event);
	//切换横(竖)排排列  status 为toggle|row|vertical
	if(status == undefined || status == null){
		status = 'toggle';
	}
	var pageArr              = new Array();
	var ele                  = document.getElementsByClassName("page-middle-content-each");
	var pc_ele_btn           = document.getElementsByClassName("opera-content-right-typesetting")[0];
	var phone_ele            = document.getElementById("phone-text-show-content").children[0];
	var phone_ele_btn        = document.getElementById("phone-change-typesetting");
	var phone_ele_btn_v      = document.getElementById("phone-change-type-v");
	//按钮显示的背景图片


	if(ele != undefined && typeof(ele) == "object"){
		pageArr.push(ele[0]);
		pageArr.push(ele[1]);
	}
	if(phone_ele != undefined && typeof(phone_ele) == "object"){
		pageArr.push(phone_ele);
	}
	var is_vertical   = hasClass(pageArr[0],"reader-vertical-rl");
	for(var i = 0; i<pageArr.length; i++){
        
		if(status == "row"){
            
			removeClass(pageArr[i],"reader-vertical-rl");
			pc_ele_btn.style.backgroundImage    = "url(image/hengpai.png)";
			phone_ele_btn.style.backgroundImage = "url(image/s_rows_active.png)";
			reader.config.typesetting           = "row";
		}else if(status == "vertical"){
            
			addClass(pageArr[i],"reader-vertical-rl");
			pc_ele_btn.style.backgroundImage    = "url(image/shupai.png)";
			phone_ele_btn.style.backgroundImage = "url(image/s_rows.png)";
			reader.config.typesetting           = "vertical";
		}else if(is_vertical){
            
			removeClass(pageArr[i],"reader-vertical-rl");
			pc_ele_btn.style.backgroundImage    = "url(image/hengpai.png)";
			phone_ele_btn.style.backgroundImage = "url(image/s_rows_active.png)";
            phone_ele_btn_v.style.backgroundImage = "";
			reader.config.typesetting           = "row";
		}else{
            
			addClass(pageArr[i],"reader-vertical-rl");
			pc_ele_btn.style.backgroundImage    = "url(image/shupai.png)";
			phone_ele_btn.style.backgroundImage = "url(image/s_rows.png)";
            phone_ele_btn_v.style.backgroundImage = "url(image/s_vertical_active.png)";
			reader.config.typesetting           = "vertical";
		}
	}
	reader_resize();
}
function reader_change_indent(status){															//阅读方向  toggle为切换 lr为左刀右 rl为右到左

}

function reader_fontsize_plugs(event,that){
    
	if( reader.config.fontSize >= 36 || reader.countPageLock){
		return false;
	}
    // reader.countPageLock = true;
    
	stopPropagation(event);
	//加大阅读界面字体
	var doms           = new Array();
	var pageEle        = document.getElementsByClassName("page-middle-content-each");
	var phone_ele      = document.getElementById("phone-text-show-content").children[0];
	if(pageEle != undefined && typeof(pageEle) == "object"){
		doms.push(pageEle[0]);
		doms.push(pageEle[1]);
	}
	if(phone_ele != undefined && typeof(phone_ele) == "object"){
		doms.push(phone_ele);
	}
	reader.config.fontSize += 2;
	if(reader.config.fontSize >36) reader.config.fontSize = 36;
	reader_set_font_size(doms,reader.config.fontSize);
    
	reader_resize();
}
function reader_fontsize_sub(event,that){
   
	if( reader.config.fontSize <= 12 || reader.countPageLock){
		return false;
	}
    // reader.countPageLock = true;
    
	stopPropagation(event);
	//减小阅读界面字体
	var doms           = new Array();
	var pageEle        = document.getElementsByClassName("page-middle-content-each");
	var phone_ele      = document.getElementById("phone-text-show-content").children[0];
	if(pageEle != undefined && typeof(pageEle) == "object"){
		doms.push(pageEle[0]);
		doms.push(pageEle[1]);
	}
	if(phone_ele != undefined && typeof(phone_ele) == "object"){
		doms.push(phone_ele);
	}
	reader.config.fontSize -= 2;
	if(reader.config.fontSize <12) reader.config.fontSize = 12;
	reader_set_font_size(doms,reader.config.fontSize);
    
	reader_resize();
}
function reader_change_bright(event,percent){															//调节亮度
	if(percent == undefined && (event == undefined  || typeof(event) != "object")){
		return false;
	}
//	stopPropagation(event);
	var pageX,eventPageX,width,widthPercent,pc_chidren_width,phone_chidren_width;
	var pc_ele               = document.getElementsByClassName("bottom-change-bright-bar")[0];
	var phone_ele            = document.getElementById("phone-change-bright-bar");
	var pc_percent_text      = document.getElementsByClassName("change-bright-bar-percent")[0];
	var phone_percent_text   = document.getElementById("phone-change-bright-text");
	//当直接传递了百分比时就直接使用传递的百分比
	if(percent == undefined || typeof(percent) != "number"){
		event             = touchEvents.getEvent(event);
		eventPageX        = event.pageX;													//鼠标点击的位置
		//   判断根据pc端还是phone端计算百分比
	    if(getStyle(document.getElementsByClassName("reader-is-phone")[0]).display == "none"){
	    	pageX       =  pc_ele.getBoundingClientRect().left;
	    	width       =  getStyle(pc_ele).width;
	    }else{
	    	pageX       = phone_ele.getBoundingClientRect().left;
	    	width       = getStyle(phone_ele).width;
	    }
		widthPercent    = parseInt((eventPageX-pageX)/(parseInt(width))*100);
	}else{
		widthPercent    = Math.ceil(percent);
	}
	if(widthPercent > 100){
		widthPercent      = 100;
	}
	//最低只能为 0.3  不然界面就全黑了 什么都看不到
	if(widthPercent <= 0 ){
		widthPercent      = 0;
	}
    
	//chidren 为百分比
	pc_ele.children[0].style.width     = widthPercent+"%";
	phone_ele.children[0].style.width  = widthPercent+"%";
	pc_percent_text.innerText          = widthPercent+"%";
	phone_percent_text.innerText       = widthPercent+"%";
	reader.config.brightness           = widthPercent;
	filter_brightness(document.getElementsByTagName("body")[0],widthPercent);
}
//调节阅读进度
function reader_change_process(event,percent){
	if(percent == undefined && (event == undefined  || typeof(event) != "object")){
		return false;
	}
	//console.log( percent );
	var pageX,width,widthPercent,pc_chidren_width,phone_chidren_width;
	event                      = touchEvents.getEvent(event);
	var eventPageX             = event.pageX;
	var pc_ele               = document.getElementsByClassName("bottom-change-position-bar")[0];
	var phone_ele            = document.getElementById("phone-change-progress-bar");
	var phone_percent_text   = document.getElementById("phone-change-progress-text");
	//当直接传递了百分比时就直接使用传递的百分比
	if(percent == undefined || typeof(percent) != "number"){
	    //   判断根据pc端还是phone端计算百分比
	    if(getStyle(document.getElementsByClassName("reader-is-phone")[0]).display == "none"){
	    	pageX       =  pc_ele.getBoundingClientRect().left;
	    	width       =  getStyle(pc_ele).width;
	    }else{
	    	pageX       = phone_ele.getBoundingClientRect().left;
	    	width       = getStyle(phone_ele).width;
	    }
		widthPercent    = parseInt((eventPageX-pageX)/(parseInt(width))*100);
	}else{
		widthPercent    = Math.ceil(percent);
	}
	if(widthPercent > 100){
		widthPercent      = 100;
	}
	if(widthPercent < 0 ){
		widthPercent      = 0;
	}
	//chidren 为百分比
	pc_ele.children[0].style.width     = widthPercent+"%";
	phone_ele.children[0].style.width  = widthPercent+"%";
	phone_percent_text.innerText       = widthPercent+"%";

	pc_ele.children[0].percent = widthPercent;
	phone_ele.children[0].percent = widthPercent;
//	reader.config.progress             = widthPercent;
}
function reader_change_process_do(percent){
	loadMask("load");
	reader.gotoPercent(percent,function(){
		reader_get_pageContent();
		loadMask();

	});
}

function reader_resize(){
	if( !reader.chapts || reader.chapts.length == 0 ){
		return false;
	}
	loadMask("load");
	reader.reCount(function(){
		loadMask();
		//重新获取页面显示内容
		reader_get_pageContent();
        
	});
}

//页面初始化 字体大小  亮度 阅读进度  横排竖排显示等
function reader_body_init(){
	var config = reader.config;
	if(config == undefined){
		return false;
	}
	//设置横排/竖排显示
	reader_change_typesetting(config.typesetting);
	//设置亮度
	reader_change_bright(null,config.brightness);
	//设置字体大小
	var doms           = new Array();
	var pageEle        = document.getElementsByClassName("page-middle-content-each");
	var phone_ele      = document.getElementById("phone-text-show-content").children[0];
	if(pageEle != undefined && typeof(pageEle) == "object"){
		doms.push(pageEle[0]);
		doms.push(pageEle[1]);
	}
	if(phone_ele != undefined && typeof(phone_ele) == "object"){
		doms.push(phone_ele);
	}
	reader_set_font_size(doms,reader.config.fontSize);
}

/**
 * 获取当前显示的屏幕类型
 */
function getScreenShowType(){
	if( getStyle(document.querySelector('.reader-is-pc')).display != 'none' ){
		return "PC";
	}
	if( getStyle(document.querySelector('.reader-is-phone')).display != 'none' ){
		return "PHONE";
	}
	return false;
}

/**
 * 获取当前显示的Page大小
 */
function getScreenShowPageOffset(){
	var showType = getScreenShowType();
	var elem_page ;
	switch(showType){
		case "PC":
			elem_page = document.querySelector(".reader-is-pc .page-middle-content-each");
		break;
		case "PHONE":
			elem_page = document.querySelector(".reader-is-phone .text-content ");
		break;
	}

	return elem_page.getClientRects()[0];
}
//退出阅读器
function exit_reader(event) {
    
    //调用cordova关闭
    if (typeof cordova != "undefined") {
        var exec = cordova.require("cordova/exec");
        exec(null, null, "gliplug", "exit_current", []);
    }
    
    var exitReaderCb = reader.config.exitReaderCb;
    
    if(!!exitReaderCb && typeof exitReaderCb == "function") {
        // 关闭浏览器;
        // window.close();
        exitReaderCb();
    } else {
        //浏览器直接回退
        window.history.go(-1);
    }

    return 0;
}

//亮度 和 快速阅读

var change_bright       = false;
var change_pocess       = false;

document.addEventListener(touchEvents.touchmove,function(event){
	if(change_bright){
		//var ele      = document.getElementsByClassName("bottom-change-bright-bar")[0];
		reader_change_bright(event);
	}
	if(change_pocess){
		//var ele      = document.getElementsByClassName("bottom-change-position-bar")[0];
		reader_change_process(event);
	}
});
document.addEventListener(touchEvents.touchend,function(event){
	if(change_pocess){
		var percent = document.querySelector(".change-position-bar-copy").percent;
		reader_change_process_do(percent);
		stopPropagation(event);
	}
	if( change_pocess || change_bright){
		change_pocess         = false;
		change_bright         = false;
		stopPropagation(event);
	}
});
//界面初始化(切记不要跳转代码顺序)
function init(){
    
	//笔记(依赖菜单)
	if( CONFIG.note_off == true ){
		document.querySelector(".opera-content-left-note").style.display = "none";
		document.querySelector(".notebtn").style.display = "none";
		document.querySelector(".header-dir-ul").children[1].style.display = "none";
	}else{
		insertScript(document,["Note.js"]);
	}

	//菜单
	if( CONFIG.contentMenu_off == true ){
		//  -moz-user-select:none;
		//  -webkit-user-select:none;
		//  user-select:none;
		document.body.style.mozUserSelect = "none";
		document.body.style.webkitUserSelect = "none";
		document.body.style.userSelect = "none";

	}else{
		insertStyles(document,[{
			type:"link",
			content:"css/ContentMenu.css",
		}]);
		setTimeout(function(){
			insertScript(document,["ContentMenu.js"]);
		},1000);
	}

	//书签
	if( CONFIG.bookmark_off == true ){
		document.querySelector(".opera-content-header-bookmark").style.display = "none";
		document.querySelector(".opera-content-left-mark").style.display = "none";
		document.querySelector(".bookmarkbtn").style.display = "none";
		document.querySelector(".header-dir-ul").children[2].style.display = "none";
	}else{
		insertScript(document,["Bookmark.js"]);
	}

	//评论
	if( CONFIG.note_off == true ){
		document.querySelector(".opera-content-left-comment").style.display = "none";
		document.querySelectorAll(".more-each")[0].style.display = "none";
	}else{
		insertScript(document,["Comment.js"]);
	}

	//反馈
	if( CONFIG.note_off == true ){
		document.querySelector(".opera-content-left-feedback").style.display = "none";
		document.querySelectorAll(".more-each")[1].style.display = "none";
	}else{
		//insertScript(document,["Feedback.js"]);
	}
}
window.onload    = function(){
	if( navigator.userAgent.indexOf("Android") != -1 || navigator.userAgent.indexOf("Linux") != -1){
		insertScript(document,['../phone/cordova-android.js']);
	}else{
		insertScript(document,['../phone/cordova-ios.js']);
	}
	//TODO 判断
	insertScript(document,['Pc.js']);
	insertScript(document,['Phone.js']);

	init(); //界面初始化

	// 把user_id 存入localStorage
	// var user_id = Utils.QueryString("user_id") || "";
	// Utils.localStorage.set("user_id",user_id);

	var pageOffset = getScreenShowPageOffset();
	//初始化 reader
	loadMask("load");
	var config = {
		currentStyle  : "daylight",  //night 晚上 其他的绿色或者其他颜色
		fontSize: 15,				 //
		typesetting:"row",		// vertical 竖排 row 横排
//		offset    : ,          //阅读进度百分比
		brightness  : 100,          //显示亮度
		bookId	: Utils.QueryString('id'),
		chapterId	: Utils.QueryString('chapter_id') || null,
		pageSize	: getScreenShowType() === "PC"?2:1,
	    width       : pageOffset.width, 			//页面高宽
	    height      : pageOffset.height,
	    onReady		: function(){
	    	loadMask();
			reader_get_chapts();				//获取章节目录
			reader_get_pageContent('next');			//获取当前页内容
	    },
	    onError		: function(){
	    	// alert("加载失败");
            reader.dialogObj.open("加载失败");
			exit_reader();
			return false;
	    },
        /** 
         * 算页过程中(分步返回),执行用户回调。
         * 如: function(){
         *        // var pages = reader.getPagesAll();
         *        // data数据结构 与 reader.chapts 相同;
         *        // 在此完成业务逻辑。
         *     }
         */
        getDataCb : null,
        /** 
         * reader取得目录信息后,执行用户回调。
         * 如: function(){
         *        // var pages = reader.getDirsInfo();
         *        // 在此完成业务逻辑。
         *     }
         */
        getDirCb : null,
        /**
         * 书籍处于 试读状态，当翻到最后一页后 点击 获取下一章数据时触发回调; 
         * 约定: 回调方法逻辑--跳转页面.
         * 
         */
        probotionCb : null,
        /**
         * 退出 阅读器 回调函数.<br/>
         * 
         */
        exitReaderCb : null
	};

	//TODO  从服务器获取
	var beforeConfig = Utils.localStorage.get("reder_config") || {};
	//config = Utils.extend({},config,beforeConfig);

	window.reader = new Reader( config );
	reader_body_init();                 //界面初始化

	//定时保存当前界面阅读进度
	setInterval(function(){
		var beforeConfig = {
			currentStyle:reader.config.currentStyle,
			fontSize:reader.config.fontSize,
			typesetting:reader.config.typesetting,
			brightness:reader.config.brightness,
			offset:reader.offset,
		};
		//TODO 存到服务器
		Utils.localStorage.set("reder_config",beforeConfig);
	},500);
}
window.onresize	 = function(){
    //reader_resize();
};
