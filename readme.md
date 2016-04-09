入口是 fn.js 里的 window.onload。

/* *** *** *** *** *** *** *** *** *** */

一. 插件目录: 
    svn://192.168.1.9/h5_plug/Reader

二. 使用方法:
1. 将 插件目录 下的所有文件，复制到你的工程目录中;
2. 初始化参数配置:
   [fn.js] --> 方法 : window.onload;
   [API.js] --> this.webUrl;
   [Config.js] --> ;
3. 入口文件:
    [reader.htmls]
    ps: 需要在 url中传入的参数有, id: 图书id（必填）, user_id:用户id(选填), chapter_id: 篇章id(选填);
    //  例如: http://127.0.0.1:8020/idiot/reader/reader.html?id=40816

4. 入口方式：
    4.1 直接访问 reader.html;
    4.2 在 本页面 中使用 <iframe> 简介访问reader.html;

<br/>[在线演示](http://xd199153.github.com/GliReader/reader.html?id=40816 "http://xd199153.github.com/GliReader/reader.html?id=40816")<br> 

