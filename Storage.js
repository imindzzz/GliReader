// localStorage 的封装,可以存取对象
var __localStorage__ = {
	get  : function(key){
		var value_str = localStorage.getItem(key);
		var value =null;
		try{
			value = JSON.parse(value_str);
		}catch(e){
			//console.warn("__localStorage__:error:获取数据失败");
		}
		return value;
	},
	set  : function(key,value){
		var value_str = JSON.stringify(value);
		localStorage.setItem(key,value_str);
	}
}
