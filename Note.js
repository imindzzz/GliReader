/**
 * @author 符川
 * 2016-02
 * 笔记相关的操作
 */
var Note = function(){
	var note = this;
	note.notes = [];
	//获取所有的笔记信息暂存
	API.getNote({
		book_id:Utils.QueryString("id"),
		user_id:1,
	},function(result){
		note.notes = result.data;
		
		//显示笔记列表
		reader_get_notes( note.notes );
	});
	note.initDialog();
};

Note.prototype = {
	initDialog:function(){
		var note = this;
		var type =  getScreenShowType();
		if( type = "PC"){
			note.elem_dialog = document.querySelector(".note-add-pc");
		}else{
			note.elem_dialog = document.querySelector(".note-add-phone");
		}
		note.elem_dialog.querySelector(".left.btn").addEventListener('mouseup',function(event){
			note.elem_dialog.style.display = "none";
			loadMask(null,".pc-mask");
			stopPropagation(event);
		},false);
		
		note.elem_dialog.querySelector(".right.btn").addEventListener('mouseup',function(event){
			var value  = note.elem_dialog.querySelector(".input > textarea").value;
			note.elem_dialog.callback( value );
			note.elem_dialog.style.display = "none";
			loadMask(null,".pc-mask");
			stopPropagation(event);
		},false);
	},
	/**
	 * 添加评论到页面上
	 * @param {Object} elem
	 * @param {Object} not
	 */
	render:function(elem,not){
		var notes = Note.notes;
		for(var i=0;i<notes.length;i++){
			//把评论显示在合适的位置,篇章id要是一样
			if( notes[i].chapter_id === elem.page.parent_chapt.chapter_id ){
				//此页的的之间的字数
				var page_offset = reader.getPageOffset(elem.page.parent_chapt.index,elem.page.index);
				//在此页查找起点和终点
				var elem_start = Range.findNode( +notes[i].comm_offset_start - page_offset + 1,elem);
				var elem_end = Range.findNode( +notes[i].comm_offset_end - page_offset + 1,elem);
				if( !elem_start || !elem_end){
					continue;
				}
				
				var range = Range.create();
				//把评论显示在合适的位置,能正常设置起止点, 不会出错
				try{
					range.setStart(elem_start.elem,elem_start.offset);
					range.setEnd(elem_end.elem,elem_end.offset);
				}catch(e){
					continue;
				}
				Note.showNoteRange( notes[i],range);
			}
		}
	},
	/**
	 * 从页面移除评论下划线和按钮
	 * @param {Object} note
	 * @param {Object} range
	 */
	removeNoteRange:function( note,range ){
		//移除圆圈按钮
		Range.removeClass( range,"note-mark" );
		
		//移除下划弹出
		Range.map( range,function( elem,index){
			//不允许弹出对话框
			elem.active = false;
		});
	},
	/**
	 * 显示下划线和按钮
	 * @param {Object} not
	 * @param {Object} range
	 */
	showNoteRange:function( not,range){
		range = Range.addClass(range,"note-mark");
		Note.setNoteBtn( not,range );
		Note.setDeleteBtn( not,range );
	},
	/**
	 * 添加下划线按钮
	 * @param {Object} not
	 * @param {Object} range
	 */
	setDeleteBtn:function(not ,range){
		Range.map( range,function( elem,index){
			//激活状态, 可以点击弹出对话框
			elem.active = true;
			elem.addEventListener('mouseup',function( event ){
				if( this.active == true ){
					ContentMenu.show( event.pageX,event.pageY,range );
					stopPropagation(event);
				}
			});
		});
		
	},
	/**
	 * 圆圈按钮
	 * @param {Object} not
	 * @param {Object} range
	 */
	setNoteBtn:function(not ,range){
		var elem_circle = createElementByHtml("<span class='circle'><span>");
		elem_circle.note = not;
		
		// 移入的时候重新计算title, 避免不刷新
		elem_circle.addEventListener('mouseenter',function(){
			elem_circle.setAttribute( "title",not.comm_text );
		});
		
		//打开修改对话框
		function showDialog(){
			Note.showNoteDialog( not,range );
			stopPropagation(event);
		}
		elem_circle.addEventListener('mouseup',showDialog,false);
		elem_circle.addEventListener('touchend',showDialog,false);
		
		range.endContainer.appendChild( elem_circle );
	},
	/**
	 * 显示添加/修改对话框
	 * @param {Object} not
	 * @param {Object} range
	 */
	showNoteDialog:function( not , range){
		var elem_dialog = Note.elem_dialog;
		
		elem_dialog.querySelector(".input > textarea").value = not.comm_text;
		elem_dialog.querySelector(".content > .text").innerHTML = not.comm_mark_text;
		
		elem_dialog.callback = function( value ){
			not.comm_text = value;
			if( not.comm_id === undefined ){
				API.addNote(not,function(result){
					not.comm_id = result.data.comm_id;
					Note.notes.push( not );
					Note.showNoteRange( not,range );
				});
			}else{
				//TODO 修改
			}
			
		}
		loadMask("load",".pc-mask");
		elem_dialog.style.display = 'block';
	},
	/**
	 * 添加笔记到数据库
	 * @param {Object} chapt
	 * @param {Object} range
	 */
	addNote:function( chapt , range ){
		
		var point = reader.point;
		var text = range.toString();
		
		var offsetStart = chapt.text.indexOf( text ); //FIXME 此处查找不准确,比如有10个'乾隆',每次找到的都是第一个'乾隆'的位置
		var offsetEnd = offsetStart + text.length;
		var not = {};
		if( range.endContainer.querySelector && range.endContainer.querySelector(".circle") ){
			not = range.endContainer.querySelector(".circle").note;
		}else{
			not = {
				book_id:reader.config.bookId,
				chapter_id:chapt.chapter_id,
				comm_offset_start:offsetStart,
				comm_offset_end:offsetEnd,
				comm_mark_text:text,
				comm_text:"",
				user_id:1,
			};
		}
		
		Note.showNoteDialog( not,range )
	},
	/**
	 * 从数据库删除
	 * @param {Object} chapt
	 * @param {Object} range
	 */
	deleteNote:function( chapt , range ){
		var note = range.endContainer.querySelector(".circle").note;
		API.deleteNote(note,function(){
			console.log( range );
			Note.removeNoteRange( note,range );
		});
	}
};

Note = new Note();
