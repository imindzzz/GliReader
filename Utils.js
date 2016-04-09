var Utils = {
	/**
	 * 去除字符串前后空白
	 * @param {Object} str
	 */
	trim:function (str){
		return str.replace(/(^\s*)|(\s*$)/g,'');
	},
    QueryString: function (val) {
        var uri = window.location.search;
        var re = new RegExp("" + val + "\=([^\&\?]*)", "ig");
        return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 1)) : null);
    },
    localStorage: {
		get  : function(key){
			var value_str = localStorage.getItem(key);
			var value =null;
			try{
				value = JSON.parse(value_str);
			}catch(e){
				console.warn("Utils.localStorage:error:获取数据失败");
			}
			return value;
		},
		set  : function(key,value){
			var value_str = JSON.stringify(value);
			localStorage.setItem(key,value_str);
		}
	},
    tag2text:function( tag ){
    	var str = tag;
    	//去除标签
		str	 = str.replace(/<\/?[^>]*>/g,"");
		//去除全部空白
		str	 = str.replace(/\s/g,"");
    	return  str;
    },//合并对象
	extend:function(){
		for(var i=1;i<arguments.length;i++){
			for( key in arguments[i]){
				arguments[0][key] = arguments[i][key];
			}
		}
		return arguments[0];
	},
	deepcopy:function( source ){
		var dist;
		if( source instanceof Array ){
			dist = [];
			for(var i = 0;i < source.length;i++){
				if( source[i] instanceof Array || source[i] instanceof Object){
					dist.push( Utils.deepcopy( source[i] ) );
				}else{
					dist[i] = source[i];
				}
			}
		}else {
			dist = {};
			for(key in source){
				if( source[key] instanceof Array || source[key] instanceof Object){
					dist[key] = Utils.deepcopy( source[key] );
				}else{
					dist[key] = source[key];
				}
			}
		}
		return dist;
	},
	/**
	 * 拆分对象成字符串
	 * @param {Object} obj
	 * @param {Object} separator
	 */
	splitObj:function(obj,separator){
		separator = separator || "&";
		var str = '';
		for(key in obj){
			str += key + "=" + obj[key] + separator;
		}
		return str.substring(0,str.length-1);
	},
    
    /**
     * 弹出框.<br/>
     * 
     * @param {Objec} option 初始化参数.
     *              msg: {String} 默认提示信息. 如: "没有数据".
     *              type: {String} 窗口类型.    如: "normal", "small".
     * 
     * @return {Dialog} 对话框对象.
     * 
     * @author gli-gonglong-20160312.
     */
    dialog: function(option){
        
        var Dialog = function(option) {
            
            var pcCls = ""; 
//            || (!!option.type);
            if(!!option.type && option.type == "normal") {
                pcCls = "normal"
            }
            
            
            this.defOptions = {
                msg :"无效操作",
                html : "<div class='dialog-plugin "+ pcCls +" '><div class='main'></div> </div>",
                useAlert:  option.useAlert || false,
                cb: null,
                ctx: null,
            };
            
            var body = document.getElementsByTagName("body")[0];
            this.dialogDom = createElementByHtml(this.defOptions.html);
            this.content = createElementByHtml("<p class='content'></p>");
            this.btn = createElementByHtml("<div class='btn'>确定</div>");
            
            this.dialogDom.childNodes[0].appendChild(this.content);
            this.dialogDom.childNodes[0].appendChild(this.btn);
            
            body.appendChild(this.dialogDom);
            
            this.init();
        };
        
        Dialog.prototype.init = function(){
            var that = this;
            
            this.btn.addEventListener("click", function(){
                that.close();
            })
        }

        Dialog.prototype.open = function(msg, cbFunc, context){
            
            if(this.defOptions.useAlert){
                alert(msg);
                return false;
            }
            
            this.content.innerHTML = msg || this.defOptions.msg;
            this.defOptions.cb = cbFunc || null;
            this.defOptions.ctx = context || null;
            
            this.dialogDom.style.display='block';
        }

        Dialog.prototype.close = function(){
            this.dialogDom.style.display='none';
            
            this.callBack();
        }
        
        Dialog.prototype.callBack = function(){
            if(!!this.defOptions.cb) {
                this.defOptions.cb.call(this.defOptions.ctx);
            }
        }
        
        return  new Dialog(option);
    }
}
