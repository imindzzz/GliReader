/**
 * @author 符川
 * 2016-02
 * 评论相关的操作
 */
var Comment = function(){
	//获取所有的评论信息
	API.getComment({
		book_id:Utils.QueryString("id"),
	},function( result ){
		Comment.comments = result.data;
		//显示note列表
		reader_get_comments( Comment.comments );
	});
};
Comment.prototype = {
	addComment:function( comment,callback, cbError ){
		API.addComment(comment,function( result ){
			Comment.comments.push( result.data );
			//获取所有的评论信息
			API.getComment({
				book_id:Utils.QueryString("id"),
			},function( result ){
				Comment.comments = result.data;
				//显示note列表
				callback( Comment.comments );
			});
			
		},
		function(msg){
            cbError(msg);
        });
//		stopPropagation( event );
	},
	deleteComment:function( comm,callback ){
		var comment = this;
		comments = comment.comments;
		API.deleteComment(comment,function(){
			//从数组中移除
			for(var i = 0;i < comments.length ;i++){
				if( comments[i].id === comm.id ){
					comments.shift(i,1);
					break;
				}
			}
			
			callback( comments );
		});
	}
};
Comment = new Comment();
