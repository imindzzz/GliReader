/**
 * @author 符川
 * 2016-02
 * PHONE界面的操作,
 */

function reader_toggle_phone_opera(event, status) { //打开或关闭手机端控制面板    status = open 为打开 其他为关闭
    if (event == undefined || event == null) {
        return false;
    }
    if (status == undefined || status == null) {
        status = '';
    }
    var parent = document.getElementsByClassName("reader-is-phone")[0];
    var oprea_content = parent.children[0];

    if (hasClass(event.target, "oprea-panel") || status == "close") { //隐藏tab面板
        //关闭所有面板
        s_currentTab = document.getElementsByClassName("content-phone-bottom-each")[1];
        reader_phone_show_panel(s_currentTab, "url(image/s_process.png)", "phone-bottom-process-content");
        oprea_content.style.display = "none";
        return true;
    }
    if (status == "open" && CONFIG.useOperaPanel) {
        oprea_content.style.display = "block";
        // BUG #4791 add by gonglong 20160312
        document.getElementsByClassName("opera-content-phone-top")[0].style.display = "block";
        document.getElementsByClassName("opera-content-phone-bottom")[0].style.display = "block";
    }
}

function reader_toggle_phone_catalog(that) { //显示隐藏目录面板
    if (that == undefined || that == null) {
        return false;
    }
    var s_ele = document.getElementsByClassName("phone-bottom-dir-content")[0]; //phone端目录面板
    if (s_ele == undefined || s_ele == null || typeof(s_ele) != "object") {
        return false;
    }
    if (getStyle(s_ele).display == "none") {
        s_ele.style.display = "block"; //phone端目录显示
        addClass(document.getElementsByClassName("opera-content-phone-top")[0], "phone-dir-padding-left");
        addClass(document.getElementsByClassName("opera-content-phone-middle")[0], "phone-dir-padding-left");
        that.children[0].style.backgroundImage = "url(image/s_dir_active.png)";
    } else {
        s_ele.style.display = "none";
        removeClass(document.getElementsByClassName("opera-content-phone-top")[0], "phone-dir-padding-left");
        removeClass(document.getElementsByClassName("opera-content-phone-middle")[0], "phone-dir-padding-left");
        that.children[0].style.backgroundImage = "url(image/s_dir.png)";
    }
}
var s_currentTab = null;

function reader_phone_show_panel(that, imgUrl, panelName) {
    if (that == undefined || that == null) {
        return false;
    }
    var panel = document.getElementsByClassName(panelName)[0];
    if (panel == undefined || panel == null || typeof(panel) != "object") {
        return false;
    }
    //隐藏全部面板   再显示
    document.getElementsByClassName("phone-bottom-process-content")[0].style.display = "none";
    document.getElementsByClassName("phone-bottom-night-content")[0].style.display = "none";
    document.getElementsByClassName("phone-bottom-font-content")[0].style.display = "none";
    document.getElementsByClassName("phone-bottom-more-content")[0].style.display = "none";
    document.getElementsByClassName("phone-bottom-each-process")[0].style.backgroundImage = "url(image/s_process.png)";
    document.getElementsByClassName("phone-bottom-each-night")[0].style.backgroundImage = "url(image/s_daylight.png)";
    document.getElementsByClassName("phone-bottom-each-font")[0].style.backgroundImage = "url(image/s_font.png)";
    document.getElementsByClassName("phone-bottom-each-more")[0].style.backgroundImage = "url(image/s_more.png)";
    document.getElementsByClassName("phone-bottom-each-dir")[0].style.backgroundImage = "url(image/s_dir.png)";
    //如果当前打开的面板是目录则执行打开目录那一部分 ,如果不是则检查目录是否显示,如果显示就关闭
    if (hasClass(that.children[0], "phone-bottom-each-dir")) {
        reader_toggle_phone_catalog(that);
    } else {
        if (getStyle(document.getElementsByClassName("phone-bottom-dir-content")[0]).display != "none") {
            reader_toggle_phone_catalog(document.getElementsByClassName("content-phone-bottom-each")[0]);
        }
        if (s_currentTab != null && typeof(s_currentTab) == "object" && s_currentTab === that) {
            s_currentTab = null;
            return true;
        }
        panel.style.display = "block";
        that.children[0].style.backgroundImage = imgUrl;
        s_currentTab = that;
    }

    // BUG  #4791 add by gonglong 20160312 
    if (panelName == "phone-bottom-dir-content") {
        document.getElementsByClassName("opera-content-phone-top")[0].style.display = "none";
        document.getElementsByClassName("opera-content-phone-bottom")[0].style.display = "none";
    }

}

function show_comment_list() {

}

/*
 * DOM操作
 * 
 */
var startPageX, startPageY, endPageX, endPageY;
document.getElementsByClassName("opera-content-phone-middle")[0].addEventListener(touchEvents.touchstart, function(event) {
    event = touchEvents.getEvent(event);
    startPageX = event.pageX;
    //				startPageY             = event.pageY;
});
document.getElementsByClassName("opera-content-phone-middle")[0].addEventListener(touchEvents.touchend, function(event) {
    event = touchEvents.getEvent(event);
    endPageX = event.pageX;
    var eleStyle = getStyle(this);
    //				endPageY               = event.pageY;
    //计算距离和方向   判断操作  上翻页 下翻页 打开操作面板
    var drag_rangeX = endPageX - startPageX;
    //距离显示页面的位置   小于1/3 上翻页 大于2/3 下翻页  否则 出现面板
    if (drag_rangeX < 10 && drag_rangeX > -10) {
        var percentX = endPageX - this.getBoundingClientRect().left;
        var widthPercent = parseInt(eleStyle.width) / 3;
        if (percentX <= widthPercent) { //上翻页
            reader_page_pre();
        } else if (percentX >= widthPercent * 2) { //下翻页
            reader_page_next();
        } else {
            reader_toggle_phone_opera(event, "open"); //打开操作面板
        }
    } else if (drag_rangeX >= 10) {
        reader_page_pre();
    } else {
        reader_page_next();
    }

});
document.getElementById("phone-oprea-panel").addEventListener(touchEvents.touchend, function(event) {
    reader_toggle_phone_opera(event);
});
document.getElementById("phone-change-progress-btn").addEventListener(touchEvents.touchstart, function() {
    change_pocess = true;
});
document.getElementById("phone-change-bright-btn").addEventListener(touchEvents.touchstart, function() {
    change_bright = true;
});

function select_event(event) {
    //TODO 获取选中位置
    ContentMenu.show(event.pageX, event.pageY);
}

function bind_event() {
    // 调整亮度.
    
    var dayBtn = document.getElementById("day_modal");
    var nightBtn = document.getElementById("night_modal");
    
/*
    var nightCss = {
        phContent: "phone-cont-night",
        phOpera: "phone-opera-night",
        phDir: "phone-dir-night",
        phSearch: "phone-search-night",
    };

    // 正文, 抬头, 页码
    var phoneContent = document.getElementById("phone_content");
    // 操作面板, 
    var operaTop = document.getElementById("opera_phone_top");
    var operaBottom = document.getElementById("opera_phone_bottom");

    // 跳转阅读面板
    var procPanel = document.getElementById("ph_btm_process");
    // 黑夜/白天模式面板
    var nightPanel = document.getElementById("ph_btm_night");
    // 排版和字体设置面板
    var fontPanel = document.getElementById("ph_btm_font");
    // 更多操作面板
    var morePanel = document.getElementById("ph_btm_more");

    // 目录.
    var dirPanel = document.getElementById("ph_dir_panel");

    // 搜索
    var searchPanel = document.getElementById("ph_search_panel");
    */

    dayBtn.addEventListener(touchEvents.touchend, function() {

        setBrightnessDay();
        reader_change_bright(null, 100);
    });

    nightBtn.addEventListener(touchEvents.touchend, function() {

        setBrightnessNight();
        reader_change_bright(null, 0);
    });


};


function setBrightnessDay() {

    var nightCss = {
        phContent: "phone-cont-night",
        phOpera: "phone-opera-night",
        phDir: "phone-dir-night",
        phSearch: "phone-search-night",
    };

    // 正文, 抬头, 页码
    var phoneContent = document.getElementById("phone_content");
    // 操作面板, 
    var operaTop = document.getElementById("opera_phone_top");
    var operaBottom = document.getElementById("opera_phone_bottom");

    // 跳转阅读面板
    var procPanel = document.getElementById("ph_btm_process");
    // 黑夜/白天模式面板
    var nightPanel = document.getElementById("ph_btm_night");
    // 排版和字体设置面板
    var fontPanel = document.getElementById("ph_btm_font");
    // 更多操作面板
    var morePanel = document.getElementById("ph_btm_more");

    // 目录.
    var dirPanel = document.getElementById("ph_dir_panel");

    // 搜索
    var searchPanel = document.getElementById("ph_search_panel");

    removeClass(phoneContent, nightCss.phContent);

    removeClass(operaBottom, nightCss.phOpera);
    removeClass(operaTop, nightCss.phOpera);

    removeClass(procPanel, nightCss.phOpera);
    removeClass(nightPanel, nightCss.phOpera);
    removeClass(fontPanel, nightCss.phOpera);
    removeClass(morePanel, nightCss.phOpera);

    removeClass(dirPanel, nightCss.phDir);
    removeClass(searchPanel, nightCss.phSearch);
}



function setBrightnessNight() {

    var nightCss = {
        phContent: "phone-cont-night",
        phOpera: "phone-opera-night",
        phDir: "phone-dir-night",
        phSearch: "phone-search-night",
    };

    // 正文, 抬头, 页码
    var phoneContent = document.getElementById("phone_content");
    // 操作面板, 
    var operaTop = document.getElementById("opera_phone_top");
    var operaBottom = document.getElementById("opera_phone_bottom");

    // 跳转阅读面板
    var procPanel = document.getElementById("ph_btm_process");
    // 黑夜/白天模式面板
    var nightPanel = document.getElementById("ph_btm_night");
    // 排版和字体设置面板
    var fontPanel = document.getElementById("ph_btm_font");
    // 更多操作面板
    var morePanel = document.getElementById("ph_btm_more");

    // 目录.
    var dirPanel = document.getElementById("ph_dir_panel");

    // 搜索
    var searchPanel = document.getElementById("ph_search_panel");


    addClass(phoneContent, nightCss.phContent);
    addClass(operaBottom, nightCss.phOpera);
    addClass(operaTop, nightCss.phOpera);

    addClass(procPanel, nightCss.phOpera);
    addClass(nightPanel, nightCss.phOpera);
    addClass(fontPanel, nightCss.phOpera);
    addClass(morePanel, nightCss.phOpera);

    addClass(dirPanel, nightCss.phDir);
    addClass(searchPanel, nightCss.phSearch);
}

bind_event();