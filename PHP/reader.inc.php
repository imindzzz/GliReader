<?php
/** 
 * GLI_READER_PATH	常量		书籍存储目录路径常量，需写权限
 * GLI_READER_AUTH	常量		书籍是否可阅读权限定义常量，NO为不可读
 * GLI_READER_SID	常量		阅读器交互反馈的唯一序号
 * GLI_REDAER_SEC   常量                 读取章+节当中的（几节）
 * 
 * 
 * 
 * GliReaderCommGet($Row)			根据章节获取交互信息，包括 	评论|批注|反馈|书签|进度
 * 参数结构: array( 'BookName','ItemID','ReaderSID' )
 * 
 * 返回数据: 多维数组
   array(0=>
   $Row['book_name']			//针对发布的书名
   $Row['comm_type']			//添加类型 				评论|批注|反馈|书签|进度
   $Row['comm_item_id']			//针对某个章节进行添加
   $Row['comm_offset_start']	//添加内容的起始偏移量
   $Row['comm_offset_end']		//添加内容的结束偏移量
   $Row['comm_text']			//添加的内容文本
   $Row['comm_time']			//添加时间
   $Row['comm_user_id']			//添加的用户
   ,)
 * 
 * 
 * GliReaderCommSet($Row)		根据章节保存交互信息，包括 评论，批注，反馈，书签
 * 
 * 参数结构$Row
   $Row							 = array();
   $Row['book_name']			//针对发布的书名
   $Row['comm_type']			//添加类型
   $Row['comm_item_id']			//针对某个章节进行添加
   $Row['comm_offset_start']	//添加内容的起始偏移量
   $Row['comm_offset_end']		//添加内容的结束偏移量
   $Row['comm_text']			//添加的内容文本
   $Row['comm_time']			//添加时间
   $Row['comm_user_id']			//添加的用户
   
      返回数据 true|false
 * 
 * 
 * 
 * 
 * GliReaderConfigSet( $Row )
 * 参数结构: 
 * array( 
 * 				'BookName',
 * 				'ItemID',
 * 				'ReaderSID',
 * 				'font_size'		//字体大小
 * 				'show_type'		//横屏|竖屏
 * 				'show_mod'		//白天|夜晚|其他
 * 				'show_bright'	//亮度
 * 				'line_height'	//行距
 *  )
 * 
 * 返回结构: true|false
 * 
 * 
 * GliReaderConfigGet( $Row )
 * 参数结构: array( 'BookName','ReaderSID' )
 * 
 * 返回结构:
 * array( 
 * 				'BookName',
 * 				'ItemID',
 * 				'ReaderSID',
 * 				'font_size'		//字体大小
 * 				'show_type'		//横屏|竖屏
 * 				'show_mod'		//白天|夜晚|其他
 * 				'show_bright'	//亮度
 * 				'line_height'	//行距
 *  )
 * 
 */


/**
 * 读取一个书籍的基本信息,如果GliReaderBookInfo被定义，直接执行GliReaderBookInfo
 * @param unknown $BookName
 * @return array
 * 
 * array( book_id=>"书籍序号",book_name=>'书籍名称',book_menu=>array( array(),array() ) )
 */

function _GliReaderBookInfo($BookName,$section="章"){

    //拼接名称
    $press                              = GLI_READER_PATH.$BookName;//原目录+文件名，无后缀
    if( !file_exists(GLI_READER_PATH) ){
        @mkdir(GLI_READER_PATH,0777);
    }
    //判断文件是否存在
    if( file_exists($press.".epub") ){
        //在判断zip文件是否存在
        if( !file_exists($press.".zip") ){
            @copy($press.".epub",$press."1.epub");//复制文件
        }
        @rename($press."1.epub",$press.".zip");//修改名称
        //操作压缩包
        $zip                            = new ZipArchive;
        if( $zip->open($press.".zip")===TRUE ){
            $zip->extractTo($press);//假设解压缩到在当前路径下$BookName文件夹内
            $zip->close();//关闭处理的zip文件
        }else{
            $Json['status']              = false11;
            $Json['error']               = "没有权限";
            break;
        }
        //查找主文件
        $conta 						     = file_get_contents($press."/META-INF/container.xml");
        preg_match("/<rootfile full-path=['|\"](.*)['|\"]\s.*?>/", $conta,$container);
    
        //匹配主文件读取内容
        $file_name		                 = file_get_contents($press."/".$container[1]);
        preg_match_all("/<item.*?href=['|\"](.*[html|xml][^\"])['|\"]\sid.*?>/", $file_name, $file_title);
    
        $reader_c		                     = $file_title[1];
        if( !empty($reader_c) ){
            $title_dir                   = array();
            $count_json                  = array();
            for( $i=0;$i<count($reader_c);$i++ ){
                $name_count 		     		= $press."/".dirname($container[1])."/".$reader_c[$i];
    
                $dir_name 			     		= file_get_contents($name_count);
    
                $title_dir[$i]['title']	        = $reader_c[$i];
                preg_match("/<title>(.*)<\/title>/",$dir_name,$title);
                $title_dir[$i]['name']	 	    = $title[1];
                //替换掉空字符，换行
                $BookListText		       		= str_replace("\n","",$dir_name);
                $BookListText		       		= str_replace("\r\n","",$BookListText);
                //$BookListText		               = str_replace(" ","",$BookListText);
                $BookListText		       		= str_replace("\r","",$BookListText);
    
                preg_match('/<body>[\w\W]*<\/body>/', $BookListText,$body);
                $body		                    = preg_replace("/style*=\s*('[^']*'|\"[^\"]*\")/","", $body[0]);
                $title_dir[$i]["count"]	 	    = mb_strlen(strip_tags($body),"UTF8");
                //2015年11月30日17:05:04
                preg_match_all('/<img(.*?)(src)=[\"|\'](?!.*?logo).*?>/',$dir_name,$img_name);
                //当前文章的图片总数
                $title_dir[$i]['image']  		= count( $img_name[0] );
                //添加类型
                if( $section!="章" ){
                    if( $i%(GLI_REDAER_SEC+1)==0 ){
                	   				$title_dir[$i]['type']	= "chapter";
                    }else{
                        $title_dir[$i]['type']	= "section";
                    }
                }else{
                    $title_dir[$i]['type']	    = "chapter";
                }
    
                //获取body和body里的内容
                preg_match('/<body>[\w\W]*<\/body>/',$dir_name,$body);
                //写入搜索文件
                $count_json[]                   = $body;
            }
    
            //创建文件
            $content 			        = fopen($press.".text", "w");
            //将数组json格式储存
            fwrite($content,json_encode($count_json));
            $Json['status']             = true;
            $Json['error']              = "目录";
            $Json['data']               = $title_dir;
           
            //加载配置
            $Param						= array('BookName'=>$BookName,'ReaderSID'=>$gli_session_id);
            $Json['config']				= ( function_exists("GliReaderConfigGet") )? GliReaderConfigGet($Param) : array();
        }else{
            $Json['status']             = false;
            $Json['error']              = "没有信息";
        }
    }else{
        $Json['status']                 = false;
        $Json['error']                  = "文件不存在或没有权限";
    }
    return $Json['data'];
}

/**
 * 根据书籍名称与书籍章节序号，返回章节内容
 * @param unknown $ItemID
 * @return array
 * array()
 */
function _GliReaderBookItem( $BookName,$ItemID,$gli_session_id=array() ){
    //读取主文件、主要是获取文章的路径
    $conta 						     = file_get_contents(GLI_READER_PATH.$BookName."/META-INF/container.xml");
    preg_match("/<rootfile full-path=['|\"](.*)['|\"]\s.*?>/", $conta,$container);
    
    //文章文件路径
    $dir_name                           = GLI_READER_PATH.$BookName."/".dirname($container[1])."/".$ItemID;
    if( file_exists($dir_name) ){
    
        $d_count 		                 = file_get_contents($dir_name);
        $BookListText		             = str_replace("\n","",$d_count);
        $BookListText		             = str_replace("\r\n","",$BookListText);
        //$BookListText		             = str_replace(" ","",$BookListText);
        $BookListText		             = str_replace("\r","",$BookListText);
    
        //替换掉style样式
        //2015年12月1日15:52:06  正则匹配不通过
        //style*=\s*('[^']*'|\"[^\"]*\")            /style\=["|\'].+?["|\']/
        preg_match('/<body>[\w\W]*<\/body>/', $BookListText,$body);
        $body		                    = preg_replace("/style*=\s*('[^']*'|\"[^\"]*\")/","", $body[0]);
        $Json['status']                 = true;
        $Json['error']                  = "目录详情";
        $Json['data']                   = $body;
        $Json['comm']					= array();
    
        if( function_exists("GliReaderCommGet") ){
            $Param						= array('BookName'=>$BookName,'ItemID'=>$ItemID,'ReaderSID'=>$gli_session_id);
            $Json['comm']				= eval("GliReaderCommGet(\$Param)");
        }
    
    }else{
        $Json['status']                  = false;
        $Json['error']                   = "请重新操作";
        break;
    }
    return $Json['data'];
}


/**
 * 搜索一本书
 * @param unknown $BookName
 * @param unknown $Search
 */
function _GliReaderSearch($BookName,$Search){

    //文章整合的text
    $dir_text                            = GLI_READER_PATH.$BookName.".text";
    if( !file_exists($dir_text) ){
        $Json['status']          = false;
        $Json['error']           = "请重新操作";
        return $Json;
    }
    
    $count_json                          = file_get_contents($dir_text);
    //转换json格式为数组
    $count_de_json                       = json_decode($count_json,true);
    if( is_array($count_de_json)){
        foreach ($count_de_json as $K=>$V ){
            if( preg_match_all('/'.$Search.'/', $V[0]) ){
                $key_all			        = explode($Search, $V[0]);
                $count_len                  = "";
                for( $i=0;$i<count($key_all)-1;$i++ ) {
                    $BookListText		 	= str_replace("\n","",@$key_all[$i]);
                    $BookListText		 	= str_replace("\r\n","",$BookListText);
                    $BookListText		 	= str_replace(" ","",$BookListText);
                    $BookListText		 	= str_replace("\r","",$BookListText);
                    $all_strlen			 	= strlen( $BookListText );
                    $count_len			 	= $count_len+$all_strlen;
                    $key_title[$K+1][$i]	= $count_len.",".$count_len+=mb_strlen($Search,'UTF8');
                }
            }
        }
    
        $Json['status']           = true;
        $Json['error']            = "目录";
        $Json['data']             = $key_title;
    }else{
        $Json['status']           = false;
        $Json['error']            = "目录不存在";
    }
    return $Json['data'];
}



//如果尚未定义EPUB存储路径，该处定义默认路径
if( !defined("GLI_READER_PATH") ){
	define("GLI_READER_PATH", "/usr/share/nginx/WebWareHouse/99.gli.cn/www/static/images/epub/");                  //储存文件路径
}

//如果尚未定义指定书籍的阅读权限，该处定义默认权限为允许阅读
if( !defined("GLI_READER_AUTH") ){
	define("GLI_READER_AUTH","YES");            //权限开关  YES有权限，NO没有权限
}

//如果尚未定义指定书籍章下 节的读取数，改处定义默认为读取节的数
if( !defined("GLI_REDAER_SEC") ){
    define("GLI_REDAER_SEC","4");            //权限开关  YES有权限，NO没有权限
}

$Action                                 = empty($_POST['action']) 		? $_GET['action'] 		: $_POST['action'];

$BookName                               = empty($_POST['bname']) 		? $_GET['bname'] 		: $_POST['bname'];			//书籍名称
$ItemID                                 = empty($_POST['item_id']) 		? $_GET['item_id'] 		: $_POST['item_id'];		//需要读取的章节
$keyword                                = empty($_POST['keyword']) 		? $_GET['keyword'] 		: $_POST['keyword'];		//搜索关键字
$gli_session_id							= empty($_POST['reader_sid'])	? $_GET['reader_sid']	: $_POST['reader_sid'];		//服务器下发的 类似 SESSION_ID的数据
$section                                = empty($_POST['section'])      ? "章"                   : urldecode($_POST['section']);//读取章|章+节
$book_id                                = empty($_POST['book_id'])      ? $_GET['book_id']      : $_POST['book_id']; 

if( empty($BookName) )					$BookName	= "789" ;           //默认读取的书名
if( empty($keyword) ) 					$keyword	= "购买";		
if( empty($ItemID) ) 					$ItemID		= "1.html"; 		//默认读取的章节


$Json									= array();

if( defined('GLI_READER_SID') ){
	$Json['reader_sid']					= GLI_READER_SID;
}

if( strtolower(GLI_READER_AUTH)=="no" ){
    $Json['status']               = false;
    $Json['error']                = "没有权限";
    exit(json_encode($Json));
}


switch( $Action ){

    /**
     * 获取目录
     * rename
     * $BookName          该书籍存下的文件名
     */
    case "get_book_catalog":
        
            $user_id                        = $_GET['user_id'];
            $read_option['font_size']		= $_GET['font_size'];
            $read_option['screen_type']		= $_GET['screen_type'];
            $read_option['screen_size']		= $_GET['screen_size'];
            
    		$BookInfo						= ( function_exists("GliReaderBookInfo") )? GliReaderBookInfo($book_id,$user_id,$read_option) : _GliReaderBookInfo($BookName,$section);
    		
    		if( !empty($BookInfo) ){
    			$Json['status']    = true;
    			$Json['error']     = "目录";
    			$Json['data']      = $BookInfo;
    		}else{
    			$Json['status']    = false;
    			$Json['error']     = "文件不存在和没有权限";
    		}
    		
        break;
        
        
        
        /**
         *  获取目录详情:
         *  1.书籍标签
         *  2.书籍评论          
         *  3.书籍批注
         *  $user_id           用户ID
         *  $type              获取类型(书签，笔记等)
         */
    case "get_catalog_detail":

            $user_id                        = $_GET['user_id'];
            $type                           = empty($_GET['comm_type'])?'bookmark':$_GET['comm_type'];
 			$body							= ( function_exists("GliReaderCommGet") )? GliReaderCommValGet($book_id,$user_id,$type) : _GliReaderCommValGet();
 			
            $Json['status']    = true;
            $Json['error']     = "章节";
            $Json['data']      = $body;
            
        break;
        
        
        
        /**
         * 搜索关键字
         * $BookName  当前要搜索的书籍名称
         * $keywords    当前要搜索的关键字
         */
    case "search_book_key":
            $BookName               = $_GET['book_id'];
            $keywords               = $_GET['keywords'];
            
            $key_title			   = ( function_exists("GliReaderSearch") )? GliReaderSearch($BookName,$keywords) : _GliReaderSearch($BookName,$keywords);
            
            if( !empty($key_title) ){
                $Json['status']    = true;
                $Json['error']     = "搜索关键字";
                $Json['data']      = $key_title;
            }else{
                $Json['status']    = true;
                $Json['error']     = "搜索不存在";
                $Json['data']      = array();
            }
            
        break;
        
	
    /**
     * 书籍添加 标签,批注,笔记等信息
     *  $Row['comm_book_id']                = $_GET['book_id'];             //被标注的书籍ID
		$Row['comm_type']					= $_GET['comm_type'];			//添加类型
		$Row['comm_item_id']				= $_GET['chapter_id'];		    //针对某个章节进行添加
		$Row['comm_offset_start']			= $_GET['comm_offset_start'];	//添加内容的起始偏移量
		$Row['comm_offset_end']				= $_GET['comm_offset_end'];	    //添加内容的结束偏移量
		$Row['comm_text']					= $_GET['comm_text'];		    //添加的内容文本
		$Row['comm_user_id']				= $_GET['user_id'];		        //添加的用户
	 *
	 *	$CommId 信息ID(书签、笔记等)	如果不为空则代表是删除
     */
    case "set_book_comment":
    		 
		$Row							 	= array();
//  		$Row['comm_book_name']				= $BookName;				//针对发布的书名
		$Row['comm_book_id']                = $_GET['book_id'];             //被标注的书籍ID
		$Row['comm_type']					= $_GET['comm_type'];			//添加类型
		$Row['comm_item_id']				= $_GET['chapter_id'];		    //针对某个章节进行添加
		$Row['comm_offset_start']			= $_GET['comm_offset_start'];	//添加内容的起始偏移量
		$Row['comm_offset_end']				= $_GET['comm_offset_end'];	    //添加内容的结束偏移量
		$Row['comm_text']					= $_GET['comm_text'];		    //添加的内容文本
		$Row['comm_user_id']				= $_GET['user_id'];		        //添加的用户
        $Row['comm_mark_text']              = !empty($_GET['comm_mark_text'])?urldecode($_GET['comm_mark_text']):'';           //被标注的内容
        
        $CommId                           	= $_GET['comm_id'];
        if( empty($CommId) ){
			$result						   	= ( function_exists("GliReaderCommSet") )? GliReaderCommSet($Row) : _GliReaderCommSet($Row);
			
			if( $result==false || empty($result) ){
				$Json['error']             	= "删除标签失败";
			}
			
        }else{
        	$result						   	= ( function_exists("GliReaderConfigdel") )? GliReaderConfigdel($CommId) : _GliReaderConfigdel($CommId);
        	
        	if( $result==false || empty($result) ){
        		$Json['error']             	= "删除标签失败";
        	}
            
        }
        
        if( $result==false || empty($result) ){
        	$Json['status']            		= false;
        	$Json['data']              		= $result;
        }else{
        	$Json['status']            		= true;
        	$Json['error']             		= "";
        	$Json['data']              		= $result;
        }
        
        
    break;
    
    /**
     * 获取用户  笔记/书签
     * $user_id		用户ID
     * $book_id		书籍ID
     * $type		//'notes','bookmark','indexing'
     */
    case "get_book_bookmark":

        $user_id                   = $_GET['user_id'];
        $book_id                   = $_GET['book_id'];
        $type                      = !empty($_GET['type'])?$_GET['type']:'notes';
        $type_arr                  = array('notes','bookmark','indexing');
        if( empty($user_id) || empty($book_id) || !in_array($type,$type_arr)){
            $Json['status']        = false;
            $Json['error']         = "请传入参数";
            $Json['data']          = array();
            
        }else{
        	$data				   = ( function_exists("GliReaderCommGet") )? GliReaderCommGet($book_id,'',$user_id,$type) : _GliReaderCommGet();
        	
        	$Json['status']        = true;
        	$Json['error']         = "";
        	$Json['data']          = $data;
        }
        
        break;
        
    /**
     * 添加  评论/反馈
     * $arr['book_id']                      = $_GET['book_id'];     //评论书籍
       $arr['feedback_type']                = !empty($_GET['type'])?'反馈':'评论';        //类型 评论
       $arr['user_id']                      = $_GET['user_id'];     //评论用户 
       $arr['feedback_text']                = $_GET['text'];        //评论类容
     */
    case "set_book_feedback":

       $arr['book_id']                      = $_GET['book_id'];     //评论书籍
       $arr['feedback_type']                = !empty($_GET['type'])?'反馈':'评论';        //类型 评论
       $arr['user_id']                      = $_GET['user_id'];     //评论用户 
       $arr['feedback_text']                = $_GET['text'];        //评论类容

       //增加评论/反馈
       if( empty($arr['book_id'])  ||  empty($arr['feedback_type'])  || empty($arr['user_id'])  || empty($arr['feedback_text'])  ){
            $Json['status']       	 		= false;
            $Json['error']         			= "请填写评论内容";
            $Json['data']               	= false;
       }else{
       		$result							= ( function_exists("GliReaderFeedSet") )? GliReaderFeedSet($arr,1) : _GliReaderFeedSet($arr);
       	
       		if( $result==false || empty($result) ){
       			$Json['status']             = false;
       			$Json['error']              = "添加笔记失败";
       			$Json['data']               = $result;
       		}else{
       			$Json['status']             = true;
       			$Json['error']              = "";
       			$Json['data']               = $result;
       		}
       }
       
    break;  
    
    /**
     * 查看  评论
     * $book_id
     */
    case "get_book_feedback":
    
        $book_id                    = $_GET['book_id'];     //评论用户    
       
        if( empty($book_id) ){
            $Json['status']        	= false;
            $Json['error']         	= "请传入参数";
        }else{
        	$data					= ( function_exists("GliReaderFeedGet") )? GliReaderFeedGet($book_id) : _GliReaderFeedGet($arr);
        	
        	$Json['status']     = true;
        	$Json['data']       = $data ;
        	$Json['error']      = "";
        }
        
        break;
    
    /**
     * 保存阅读配置
     *  $Row['show_type']					= $_POST['show_type'];		//针对发布的书名
    	$Row['font_size']					= $_POST['font_size'];		//添加类型
    	$Row['show_mod']					= $_POST['show_mod'];		//针对某个章节进行添加
    	$Row['show_bright']					= $_POST['show_bright'];	//添加内容的起始偏移量
    	$Row['line_height']					= $_POST['line_height'];	//添加内容的结束偏移量
     */
    case "set_reader_config":
    	$Row							 	= array();
    	$Row['show_type']					= $_POST['show_type'];		//针对发布的书名
    	$Row['font_size']					= $_POST['font_size'];		//添加类型
    	$Row['show_mod']					= $_POST['show_mod'];		//针对某个章节进行添加
    	$Row['show_bright']					= $_POST['show_bright'];	//添加内容的起始偏移量
    	$Row['line_height']					= $_POST['line_height'];	//添加内容的结束偏移量

    	$Add								= ( function_exists("GliReaderConfigSet") )? GliReaderConfigSet($Row) : _GliReaderConfigSet($Row);

        if( $Add==false || empty($Add) ){
            $Json['status']          		= false;
            $Json['error']           		= "保存阅读配置失败";
            $Json['data']               	= $Add;
        }else{
        	$Json['status']              	= true;
        	$Json['error']               	= "";
        	$Json['data']               	= $Add;
        }
    	
    	
    	break;
    	
    	
    
    	/**
    	 * 获取章节内容
    	 * $book_id                        = $_GET['book_id'];
    	   $user_id                        = $_GET['user_id'];
    	   $chapter_id                     = $_GET['chapter_id'];
    	 */
   	 case "get_chapter_cont":
    	    $book_id                        = $_GET['book_id'];
    	    $user_id                        = $_GET['user_id'];
    	    $chapter_id                     = $_GET['chapter_id'];

    	    $Row							= ( function_exists("GliGetChapter") )? GliGetChapter($book_id,$chapter_id,$user_id) : _GliGetChapter();
    	    
    	    if( !empty($Row) ){
    	       $Json['status']              = true;
    	       $Json['error']               = "";
    	       $Json['data']                = $Row;
    	    }else{
    	       $Json['status']              = false;
    	       $Json['error']               = '您尚未购买或错误信息';
    	    }
     break;
     
     
     case 'get_chapter_style':
     	$ChapterID						= $_GET['chapter_id'];
     	$Style							= ( function_exists("GliGetStyle") )? GliGetStyle($book_id,$ChapterID) : _GliGetStyle();
     		
     	$Json['status']              	= true;
     	$Json['error']               	= "";
     	$Json['data']               	= !empty($Style) ? $Style : array();
     
     	exit($_REQUEST["callback"]."(".json_encode($Json).")");
     		
    break;
     
     
     /**
	 * 保存对应css样式下的篇章页码
	 * $Row['psize']			//缓存页码
	 * $Row['font_size']		//字号大小
	 * $Row['book_id']			//书籍id
	 * $Row['chapter_id']		//篇章id
	 * $Row['screen_type']		//横竖屏 'vertical'为竖屏,'row'为横屏
	 * $Row['screen_size']		//屏幕分辨率
	 * 
	 */
     case "set_chapter_psize":
     	$Row['psize']					= $_GET['psize'];		//缓存页码
     	$Row['font_size']				= $_GET['font_size'];	//字号大小
     	$Row['book_id']					= $_GET['book_id'];		//书籍id
     	$Row['chapter_id']				= $_GET['chapter_id'];	//篇章id
     	$Row['screen_type']				= $_GET['screen_type'];	//横竖屏 'vertical'为竖屏,'row'为横屏
     	$Row['screen_size']				= $_GET['screen_size'];	//屏幕分辨率
     	
     	$Ex								= ( function_exists("GliSetPsize") )? GliSetPsize($Row) : _GliSetPsize();
     		
     	if( !empty($Ex) ){
     		$Json['status']             = true;
     		$Json['error']              = "";
     		$Json['data']               = $Ex;
     	}else{
     		$Json['status']             = false;
     		$Json['error']              = '缓存页码失败';
     	}
     break;
     	
    	
    default:
            $Json['status']                 = false;
            $Json['error']                  = "";
    break;
    
   
}

$callback                       = $_GET['callback'];
echo $callback.'('.json_encode($Json).')';


