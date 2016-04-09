/**
 * @author 符川
 * 2016-02
 * 书签相关的操作
 */
var Bookmark = function() {
    var bookmark = this;
    //获取所有的书签信息
    API.getBookmark({
        book_id: Utils.QueryString("id"),
        user_id: Utils.localStorage.get('user_id'),
    }, function(result) {
        Bookmark.bookmarks = result.data;
        //显示书签列表
        reader_get_bookmarks(Bookmark.bookmarks);
    });

};
Bookmark.prototype = {
    addBookmark: function(event, obj) {
        //FIXME 最好抽一下到fn.js里,不要在这层操作组合数据
        var bookmark = {
            book_id: reader.config.bookId,
            chapter_id: reader.chapts[reader.offset.chapt_index].chapter_id,
            comm_offset_start: reader.offset.offset,
            user_id: Utils.localStorage.get('user_id'),
        }

        API.addBookmark(bookmark, function(result) {

            //获取所有的评论信息
            API.getBookmark({
                user_id: Utils.localStorage.get('user_id'),
            }, function(result) {

                if (!!obj) {
                    obj.style.backgroundImage = "url(./image/s_mark_active.png)";
                }

                Bookmark.bookmarks = result.data;
                //显示书签列表
                reader_get_bookmarks(Bookmark.bookmarks);
                // alert("添加成功");
                reader.dialogObj.open("添加成功");
            });
        });
        //		stopPropagation( event );
    },
    deleteBookmark: function(mark, callback) {
        var bookmark = this;
        bookmarks = bookmark.bookmarks;
        API.deleteBookmark(mark, function() {
            //从数组中移除
            for (var i = 0; i < bookmarks.length; i++) {
                if (bookmarks[i].comm_id === mark.comm_id) {
                    bookmarks.shift(i, 1);
                    break;
                }
            }

            callback(bookmarks);
        });
    }
};
Bookmark = new Bookmark();