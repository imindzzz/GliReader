/*
 * @author 符川
 * 2016-02
 * 不允许直接对DOM进行操作,需要操作的部分用参数传递进来  功能与界面完全分离
 * 
 */
(function(window, undefined) {
	window.Reader = function(config){
		//TODO 判断参数合法性
		
		//合并默认参数
		var def  = {
			count_offset:0,			//要计算分页数据的时候,前后获取
			count_step:5, 			//处理分页时每获取多少页之后就返回
			probotionCb : null // 试读结束回调方法
		};
		config = Utils.extend({},def,config);
		
		return new Reader.fn.init(config);
	}; 
	Reader.fn = Reader.prototype = {
		init:function(config){
			var reader          = this;
			reader.config       = config;       //白天/黑夜 line-height 字体大小 横排/竖排
			reader.pageWords    = 0;            //每页显示字数
			reader.pageCount    = 0;			//总页数
			reader.chapts       = [];			//章节信息
			reader.point 		= 0; 			//当前指向的页
			
			reader.offset = reader.config.offset || {chapt_index:0,offset:0};  //相对于摸个篇章的文字偏移量  {chapt_index:1,offset:10}
			reader.chapts = [];  //目录(所有篇章)
			reader.pages  = [];  //所有页数
			reader.initStyle(); // 初始化样式表
			reader.initDir(); // 初始化目录
            reader.countPageLock = false; // true: 算页中, false: 算页完毕;
            
            var option = {
                msg:"对不起, 操作无效。",
                type: (getScreenShowType() == "PC") ? "normal": "small",
                useAlert : true
            };
            reader.dialogObj = Utils.dialog(option);
		},
		/**
		 * 初始化样式表
		 */
		initStyle:function(){
			var reader = this;
			API.getStyle({book_id:reader.config.bookId},function(result){
				reader.styles = result.data;
				insertStyles(document,reader.styles);
				reader.styles = reader.styles.concat( getAllStyles() );
			});
		},
		/**
		 * 初始化目录
		 */
		initDir:function(){
            var getDirCb = this.config.getDirCb;
            
			var reader = this;
			API.getDir({
				book_id:reader.config.bookId,
				user_id:Utils.localStorage.get('user_id'),
				font_size:reader.config.fontSize,
				screen_type:reader.config.typesetting,
				screen_size:reader.config.width + "*" + reader.config.height,
			},function(result){
				reader.chapts   = result.data;
				
				var tmpIdx = 0;
				var tmpChapter = null;
				for(var i = 0; i<reader.chapts.length;i++){
				    tmpChapter = reader.chapts[i];
					tmpChapter.index = i;
					if(tmpChapter.chapter_id == reader.config.chapterId) {
					    tmpIdx = i;
					}
				}
				
				reader.offset.chapt_index = tmpIdx;

				//获取首屏(恢复Offset)
				reader.restoreOffset(function(){
					if( reader.config.onReady ){
						reader.config.onReady(reader);
					}
				});
                
                if(!!getDirCb && typeof getDirCb == 'function') {
                    getDirCb();
                }
			},function(){
				if( reader.config.onError ){
						reader.config.onError(  );
					}
			});
		},
		
		/**
		 * 获取此页之前(本篇章内)有多少个字
		 * @param {Object} chapt_index 篇章序号
		 * @param {Object} page 要获取的页
		 */
		getPageOffset:function(chapt_index,page){
			var reader = this;
			var pages = reader.chapts[chapt_index].pages;
			var sum = 0;
			for(var i = 0; i<pages.length;i++){
				if(i === page){
					break;
				}
				sum += pages[i].text.length;
			}
			return sum;
		},
		/**
		* 重新计算分页
		* @param {Object} callback 处理完成的回调
		* */
		reCount:function( callback ){
			var reader = this;
			for(var i = 0 ; i < reader.chapts.length; i++){
				reader.chapts[i].pages = null;
			}
			reader.pages = [];
			reader.restoreOffset(callback);
		},
		/**
		 * 将要处理分页
		 * @param {Object} chapt 将要处理的篇章
		 * @param {Object} callback 处理完成的回调
		 */
		willCountChapt:function(chapt,callback){
			callback = callback || function(){};
			var reader = this;
			reader.countChapt(chapt,callback);
			
			//前后预处理分页
			for(var i = 1 ; i <= reader.config.count_offset; i++){
				var prevChapt = reader.chapts[chapt.index - i];
				reader.countChapt(prevChapt,null);
				
				var nextChapt = reader.chapts[chapt.index + i];
				reader.countChapt(nextChapt,null);
			}
		},
		/**
		 * 处理分页
		 * @param {Object} chapt 将要处理的篇章
		 * @param {Object} callback 处理完成的回调
		 */
		countChapt:function(chapt,callback){
            
            var getDataCb = this.config.getDataCb;
            
			callback = callback || function(){};
			//没找到篇章,失败
			if( !chapt ){
				callback(false);
				return false;
			}
			//已经存在,不用再处理
			if( chapt.pages ){
				callback(true);
				return true;
			}
			
			var reader = this;
			//你不觉得这个回调金字塔很好看吗0.0
			//篇章数据存在时执行
			function anonymous(){
				
				chapt.html = Filter.do( chapt.html );
				chapt.text = Utils.tag2text( chapt.html );
				
				createIframe({
					src:"countPage.html",
					//插入样式
					styles:reader.styles,
					//页面加载完成时回调
					callback:function( elem_iframe ){
						//分步返回分页,是否已经符合offset的最小要求并回调了
						var bool_callback = false;
						//开始分页
						elem_iframe.contentWindow.countPage({
							chapt:chapt,
							config:reader.config,
//							ext_styles:getStyle( getShow),
							callback:function(chapt,step,status){
								//分页完成 
								if( status === 'done' ){
                                    // 算页结束，接触lock;
                                    // parent.window.reader.countPageLock = false;
                                    
									//移除ifraame
									elem_iframe.parentNode.removeChild( elem_iframe );
									//补齐一屏
									var i = chapt.pages.length % reader.config.pageSize;
									while( i-- ){
										chapt.pages.push({
											parent_chapt:chapt,
											index:chapt.pages.length,
											text:"",
											html:'<div class="blank-page"></div>',
										});
									}
									
									// 向服务发送此篇章的在当前参数下的分页情况
									var chaptInfo = {
										psize:chapt.pages.length,
										book_id:reader.config.bookId,
										chapter_id:chapt.chapter_id,
										font_size:reader.config.fontSize,
										screen_type:reader.config.typesetting,
										screen_size:reader.config.width + "*" + reader.config.height,
									};
									API.saveChaptInfo(chaptInfo,function(){
										//console.info("保存当前分页情况到服务器",chaptInfo);
									});
								}
								
								//判断是否已经符合offset的最小要求,或者分页完成了
								if( bool_callback === false && (chapt.pages.length >= reader.offset.offset || status === 'done') ){
									bool_callback = true;
									reader.didCountChapt(chapt,callback);
								}else{
									reader.didCountChapt(chapt,null);
								}
                                
                                if(!!getDataCb && typeof getDataCb == 'function') {
                                    getDataCb();
                                }
                                
							}
						});
					},
				});
			}
			
			//如果还没有获取篇章内容,先获取
			if( !chapt.html ){
			    
			    if(reader.config.chapterId != null) {
			        // 首次载入, 从 url地址获取的chapterid.
			        chapt.chapter_id = reader.config.chapterId;
			        reader.config.chapterId = null;
			    }
				API.getChapt({
					book_id:reader.config.bookId,
					chapter_id:chapt.chapter_id,
					user_id:Utils.localStorage.get('user_id'),
				},function(result){
					// chapt.html = result.html;
                    chapt.html = Filter.setTextIndent(result.html);
					anonymous();
				}, function (){
				    // 无权限 读取图书内容.
				    if (typeof reader.config.probotionCb == "function") {
				        reader.config.probotionCb();
				    } else {
				        alert("对不起无数据。");
				    }
				});
			}else{
				anonymous();
			}
		},
		/**
		 * 处理分页完成
		 * @param {Object} chapt  处理好分页的篇章数据
		 * @param {Object} callback 处理完成的回调
		 */
		didCountChapt:function(chapt,callback){
			callback = callback || function(){};
			var reader = this;
			chapt.chapter_psize = chapt.pages.length;
			reader.chapts[chapt.index] = chapt;
			reader.appendPage( chapt );
			if(callback){
				callback(true);
			}
		},
		/**
		 * 把计算好的pages 加入到pages 数组
		 * @param {Object} chapt 计算好分页的篇章
		 */
		appendPage:function( chapt ){
			var reader = this;
			var index = -1;
			var  currentchapt  = reader.pages[reader.point];
			//判断此篇章是否已经有分页数据存在了
			if( reader.findChaptStartPage(chapt.index)!=-1 ){
				//加入了分步计算功能,此语句失效
				//return true;
			}
			//查找要插入的位置
			for(var i = 0;i < reader.pages.length;i++){
				if(chapt.index <= reader.pages[i].parent_chapt.index){
					index = i;
					break;
				}
			}
			
			//跳过已经存在的
			var i = 0;
			do{
				var nextIndex = index + i;
				var nextPage = reader.pages[nextIndex];
				if( nextPage && nextPage.parent_chapt.index == chapt.index ){
					i++;
				}else{
					break;
				}
			}while(true);
			
			//插入
			for(;i < chapt.pages.length;i++){
				//查看顺序是否正确
				//console.log("appendPgae",chapt.index,i);
				
				if( index == -1 ){
					reader.pages .splice( reader.pages.length,0,chapt.pages[i]);
				}else{
					reader.pages .splice( index + i,0,chapt.pages[i]);
				}
			}
			
			//如果插入的page在显示的page之前, 需要调整指针
			if( currentchapt && chapt.index < currentchapt.parent_chapt.index ){
				reader.point += chapt.pages.length;
			}
			
		},
		/**
		 * 保证能getPageContent一次获取到 pageSize 那么多页
		 * @param {Object} count 已经保证了几页
		 * @param {Object} direction 向前还是向后获取
		 * @param {Object} callback
		 */
		promisePageExist:function(count,direction,callback){
			callback = callback || function(){};
			var reader = this;
			//每一个页都获取了之后回调
			if( count == reader.config.pageSize ){
				callback(true);
				return ;
			}
			
			//向前或者先后获取
			var point = reader.point+(direction === 'next'?count+reader.config.pageSize:-count-1);
			var currentPage,currentChapt;
			if( reader.point >= 0 && reader.point < reader.pages.length){
				  currentPage = reader.pages[ reader.point ];
				  currentChapt = currentPage.parent_chapt ;
			}
			currentChapt = reader.chapts[ reader.offset.chapt_index ];
			
			var nextPage = reader.pages[point];
			if( !nextPage ){  //此页不存在
				var nextChaptIndex;
				if( direction == "next"){
					nextPage = reader.pages[ reader.pages.length-1] || reader.pages[ 0 ];
					nextChaptIndex = !nextPage?0:nextPage.parent_chapt.index + 1;
				}else{
					nextPage = reader.pages[ 0 ];
					nextChaptIndex = !nextPage?0:nextPage.parent_chapt.index - 1;
				}
				var chapt = reader.chapts[ nextChaptIndex ];
				reader.willCountChapt( chapt,function(){
					reader.promisePageExist(count+1,direction,callback);
				});
			}else if( Math.abs(currentChapt.index - nextPage.parent_chapt.index) > 1 ){ //此页存在,但是不是紧挨着的篇章内
				var nextChaptIndex;
				if( direction == "next"){
					nextChaptIndex = currentChapt.index + 1;
				}else{
					nextChaptIndex = currentChapt.index - 1;
				}
				var chapt = reader.chapts[ nextChaptIndex ];
				reader.willCountChapt( chapt,function(){
					reader.promisePageExist(count+1,direction,callback);
				});
			}else{  
				reader.promisePageExist(count+1,direction,callback);
			}
			
			// 还原手机书签状态.
			document.getElementById("phone_bookmart").style.backgroundImage = "";
			
		},
		/**
		 * 下一页
		 * @param {Object} callback
		 */
		pageNext:function(callback){
			callback = callback || function(){};
			var reader 			=  this;
			reader.promisePageExist(0,'next',function(){
				reader.point += reader.config.pageSize;
				reader.recordOffset();
				callback(true);
			});
		},
		/**
		 * 上一页
		 * @param {Object} callback
		 */
		pagePrev:function(callback){
			callback = callback || function(){};
			var reader 			=  this;
			reader.promisePageExist(0,'prev',function(){
				reader.point -= reader.config.pageSize;
				reader.recordOffset();
				callback(true);
			});
		},
		/**
		 * 记录当前相对位置 offset
		 */
		recordOffset:function(){
			var reader 			=  this;
			var point 			= reader.point;
			if( !reader.pages[point] ){
				return false;
			}
			var count			= 0;
			for (var i = point-1 ;i >= 0;i--) {
				if(reader.pages[i].parent_chapt != reader.pages[point].parent_chapt){
					break;
				}
				count += reader.pages[i].text.length;
			}
			reader.offset = {
				chapt_index:reader.pages[point].parent_chapt.index,
				offset:count,
			}
		},
		/**
		 * 恢复offset
		 */
		restoreOffset:function( callback ){
			callback = callback || function(){};
			var reader 			= this;
			var offset 			= reader.offset;
			var index 			= reader.findChaptStartPage( offset.chapt_index );  //获取篇章在reader.pages中的起点
			
			//篇章数据存在时开始处理
			function anonymous(){
				index = reader.findChaptStartPage( offset.chapt_index ) + reader.offset2Page( offset );
				
				//保证是偶数
				index -= index % reader.config.pageSize;
				
				reader.point = index - reader.config.pageSize;
				reader.pageNext(function(){
					callback(true);
				});
			}
			
			//如果未找到篇章分页 先分页;
			if(index == -1){
				reader.willCountChapt( reader.chapts[offset.chapt_index],function( state ){
					if( state){
						anonymous();
					}
				});
			}else{
				anonymous();
			}
			
		},
		//复位Point
		resetPagePoint:function(){
			var reader = this;
			if(reader.point < 0){
				reader.point += reader.config.pageSize;
			}
			if(reader.point >= reader.pages.length ){
				reader.point -= reader.config.pageSize;
			}
			reader.recordOffset();
		},
		/**
		 * 查找此篇章在pages中的起点页
		 * @param {Object} index 篇章序号
		 */
		findChaptStartPage:function( index ){
			var reader = this;
			for(var i =0;i < reader.pages.length ;i++){
				if( reader.pages[i].parent_chapt.index === index ){
					return i;
				}
			}
			return -1;
		},
		/**
		 * 通过id查找篇章
		 * @param {Object} id
		 */
		findChaptById:function( id ){
			var reader = this;
			for(var i =0;i < reader.chapts.length ;i++){
				if( reader.chapts[i].chapter_id == id ){
					return reader.chapts[i];
				}
			}
			return null;
		},
		/**
		 * 跳转到某篇章开头
		 * @param {Object} index
		 * @param {Object} callback
		 */
		gotoChapt:function( index,callback ){
			callback = callback || function(){};
			var reader = this;
			reader.offset = {
				chapt_index:index,
				offset:0,
			}
			reader.restoreOffset(callback);
			
			return true;
		},
		/**
		 * 根据offset跳转
		 * @param {Object} offset
		 * @param {Object} callback
		 */
		gotoOffset:function( offset,callback ){
			callback = callback || function(){};
			var reader = this;
			reader.offset = offset;
			reader.restoreOffset(callback);
			return true;
		},
		/**
		 * 根据offset获取在哪个页
		 */
		offset2Page:function( offset ){
			//获取起点
			var index = reader.findChaptStartPage( offset.chapt_index );
			var i	  = 0;
			var count = 0;
			//开始查找符合条件的page index
			while( reader.pages[index + i] ){
				count += reader.pages[index + i].text.length;
				if( count < offset.offset ){
					i++;
				}else{
					break;
				}
			}
			return i;
		},
		/**
		 * 统计此篇章指定页之前的所有文字数量
		 * @param {Object} chapt_index
		 * @param {Object} page_index
		 */
		sumTextLength:function(chapt_index,page_index){
			var reader = this;
			chapt_index = chapt_index || 0;
			var chapt = reader.chapts[ chapt_index ];
			var sum = 0;
			if( chapt.pages && page_index){
				for(var i = 0;i < page_index && i < chapt.pages.length;i++){
					sum += chapt.pages[i]?chapt.pages[i].text.length : 0;
				}
			}
			return sum;
		},
		/**
		 * 统计此篇章之前的所有页数量
		 * @param {Object} index
		 */
		sumPageLength:function( chapt_index ){
			chapt_index = chapt_index || reader.chapts.length;
			var sum = 0;
			//统计总数
			for(var i = 0;i < chapt_index;i++){
				var psize = reader.chapts[i].chapter_psize;
				if( psize ){
					sum += parseInt( psize );
				}else{
					sum += reader.config.pageSize;
				}
			}
			return sum;
		},
		/**
		 * 百分比快速跳转
		 * @param {Object} percent
		 * @param {Object} callback
		 */
		gotoPercent:function( percent,callback ){
			callback = callback || function(){};
			var reader = this;
			var sum = reader.sumPageLength();
			
			//取得相对定位 offset
			var index = Math.floor( sum*percent/100 );
			sum = 0;
			var i;
			for(i = 0;i < reader.chapts.length;i++){
				var psize = reader.chapts[i].chapter_psize;
				if( psize ){
					sum += parseInt( psize );
				}else{
					sum += reader.config.pageSize;
				}
				if( sum >= index ){
					break;
				}
			}
			
			reader.offset.chapt_index = i; // i?  
			reader.offset.offset = reader.sumTextLength( i,index - (sum-psize) );
			//console.log( percent,reader.offset );
			reader.restoreOffset( callback );
			return true;
		},
		/**
		 * 根据当前指针获取page
		 */
		getPageContent:function(){
			var reader = this;
			return reader.pages.slice( reader.point,reader.point + reader.config.pageSize);
		},
        /**
         * 获取文章目录信息.<br/>
         * 
         * 
         * @return {Array} [{
         *                      chapter_id : {Number}
         *                      chapter_name : {String}
         *                  },]
         *
         * @author gonglong-20160304.
         *
         */
        getDirsInfo : function () {

            var chapter = this.chapts;
            var dir = [];
            var dirItem = null;
            var tempItem = null;

            for (var i = 0, len = chapter.length; i < len; i++) {
                tempItem = chapter[i];
                dirItem = {
                    chapter_id : tempItem.chapter_id || 0,
                    chapter_name : tempItem.chapter_name || "",
                };
                dir.push(dirItem);
            }
            return dir;
        },
        /**
         * 分步返回(当前)分页计算完毕的图书信息.<br/>
         * 
         *
         * @author gonglong-20160310.
         */
        getPagesAll : function () {
            return reader.chapts;
        }
		
	}
	Reader.fn.init.prototype = Reader.fn;
})(window);