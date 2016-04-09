<?php
$Action	= $_GET['action'];

switch( $Action ){
	//获取目录
	case "get_book_catalog":
		$BookInfo	= ( function_exists("GliReaderBookInfo") )? GliReaderBookInfo() : _GliReaderBookInfo();
		/*
		$BookInfo   = Array(
						 [book_id] => 4
						 [book_name] => 太极Spa内经养食：历代宫廷美容瘦身食疗
						 [book_menu] => Array(
			 						[0] => Array(
												 [chapter_id] => 0
												 [chapter_status] => 1
												 [chapter_name] => bookcover
												 [chapter_attr_class] =>
												 [chapter_psize] => 2
		 									  	)
		 							[1] => Array(
												 [chapter_id] => 0
												 [chapter_status] => 1
												 [chapter_name] => bookcover
												 [chapter_attr_class] =>
												 [chapter_psize] => 2
		 									  	)		  	
		 						  )
		 	  )
		 */



		//获取章节内容
		case "get_chapter_cont":
			$Row		= ( function_exists("GliGetChapter") )? GliGetChapter() : _GliGetChapter();
	//		$Row	= '告数据表明，不同时代出生的人受其时代性爱观影响较深';
				




















