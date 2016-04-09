/**
 * @author 符川
 * 2016-02
 * 数据接口层,可以通过替换此文件达到替换运行环境的目的
 */
var API = function(){
//	this.webUrl	= "http://glibook.dale.kf.gli.cn/api/index.php?";
//	this.webUrl = "http://storage.ts.gli.cn/reader.php?";  //id=4
//	this.webUrl = "http://storage.spbook.gli.cn/reader.php?";   
  this.webUrl = "http://www.gli.cn/external/index.php?"  //id=40816
//  this.webUrl = "http://ts.gli.cn/external/index.php?"  //id = 41035

 
// this.webUrl = "http://spbook2.gli.cn/home_reader_ajax.php?"  //id=6




};
API.prototype ={
	getStyle:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"get_chapter_style",
		},data_ex);
		jsonp(API.webUrl+Utils.splitObj(data),{
			
		},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("获取扩招样式失败");
			}else{
				success({
					data:resulet.data,
				});
			}
		});
	},
	/**
	 * 获取目录
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	getDir:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"get_book_catalog",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{
			
		},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("获取目录失败");
				error( resulet.error );
			}else{
				var data = [];
				for (var i = 0; i< resulet.data.book_menu.length ;i++) {
					data.push( resulet.data.book_menu[i] );
				}
				success({
					data:data,
				});
			}
		});
	},
	/**
	 * 获取指定篇章内容
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	getChapt:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"get_chapter_cont",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{
			
		},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("获取篇章内容失败");
				console.log( API.webUrl+Utils.splitObj(data) );
				
				if(typeof error == "function") {
				    error();
				}
				
			}else{
				success({
					html:resulet.data,
					text:Utils.tag2text(resulet.data),
				});
			}
		});
		
		
	},
	/**
	 * 添加笔记
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	addNote:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"set_book_comment",
			comm_type:"notes",
		},data_ex);
		
		console.log( data_ex );
//		return false;
		jsonp(API.webUrl+Utils.splitObj(data),{
			
		},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("添加笔记失败");
			}else{
				//改变id
				data_ex.comm_id = resulet.data,
				success({
					data:data_ex,
				});
			}
		});
	},
	/**
	 * 删除笔记
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	deleteNote:function(data_ex,success,error){
		setTimeout(function(){
			success({
			});
		},1000);
	},
	/**
	 * 获取笔记
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	getNote:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"get_book_bookmark",
			comm_type:"notes",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{
			
		},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("获取笔记失败");
			}else{
				success({
					data:resulet.data,
				});
			}
		});
	},
	/**
	 * 添加书签
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	addBookmark:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"set_book_comment",
			comm_type:"bookmark",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{
			
		},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("添加书签失败");
			}else{
				//改变id
				data_ex.comm_id = resulet.data;
				success({
					data:data_ex,
				});
			}
		});
	},
	/**
	 * 获取书签
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	getBookmark:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"get_catalog_detail",
			comm_type:"bookmark",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("获取书签失败");
			}else{
				success({
					data:resulet.data,
				});
			}
		});
	},
	/**
	 * 删除书签
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	deleteBookmark:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"set_book_comment",
			comm_id:data_ex.comm_id,
		});
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("添加评论失败");
                if(!!error && typeof error == 'function'){
                    error();
                }
			}else{
				data_ex.comm_id = resulet.date
				success({
					data:data_ex,
				});
			}
		});
	},
	/**
	 * 添加评论
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	addComment:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"set_book_feedback",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("添加评论失败");
                if(!!error && typeof error == 'function'){
                    error(resulet.error);
                }
			}else{
				data_ex.comm_id = resulet.date
				success({
					data:data_ex,
				});
			}
		});

	},
	/**
	 * 获取评论
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	getComment:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"get_book_feedback",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("获取评论失败");
			}else{
				success({
					data:resulet.data,
				});
			}
		});
	},
	/**
	 * 删除评论
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	deleteComment:function(data_ex,success,error){
		setTimeout(function(){
			data_ex.id = Date.now();
			success({
				data:data_ex,
			});
		},150);
	},
	/**
	 * 添加反馈
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	addFeedback:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"set_book_feedback",
			type:"feedback",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("提交反馈失败");
			}else{
				success();
			}
		});

	},
	/**
	 * 书内搜索
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	serarch:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"search_book_key",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("搜索失败");
                if(!!error && typeof error == 'function'){
                    error();
                }
			}else{
//				resulet.data = resulet.data.concat(resulet.data);
				success( resulet );
			}
		});
	},
	/**
	 * 把当前分页情况到服务器
	 * @param {Object} data_ex
	 * @param {Object} success
	 * @param {Object} error
	 */
	saveChaptInfo:function(data_ex,success,error){
		var data = Utils.extend({},{
			action:"set_chapter_psize",
		},data_ex);
		
		jsonp(API.webUrl+Utils.splitObj(data),{},function( resulet ){
			if( !resulet || !resulet.status){
				console.warn("保存当前分页情况到服务器失败");
			}else{
//				resulet.data = resulet.data.concat(resulet.data);
				success( resulet );
			}
		});
	},
};
API = new API();
