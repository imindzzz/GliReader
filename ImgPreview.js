/**
 * @author 符川
 * 2016-02
 * 图片查看大图的功能
 */
var ImgPreview = function(){
	
}
ImgPreview.prototype = {
	initDrag:function(){
		this.elem_peview.addEventListener("mousedown",this.handleDragStart);
		this.elem_peview.addEventListener("touchstart",this.handleDragStart);
		
		this.elem_peview.addEventListener("mousemove",this.handleDragStep);
		this.elem_peview.addEventListener("touchmove",this.handleDragStep);
		
		this.elem_peview.addEventListener("mouseup",this.handleDragEnd);
		this.elem_peview.addEventListener("touchend",this.handleDragEnd);
	},
	handleDragStart:function( event ){
		this.isDragStart = true;
		this.style.cursor = "move";
		stopPropagation( event );
	},
	handleDragStep:function( event ){
		if( !this.isDragStart){
			return ;
		}
		var that = ImgPreview.elem_peview_img;
		if( !that.beforEvent){
			if( event instanceof MouseEvent ){
				that.beforEvent = event;
			}else if( event instanceof TouchEvent ){
				that.beforEvent = {
					pageX:event.touches[0].pageX,
					pageY:event.touches[0].pageY,
				};
			}
			return ;
		}
		
		var style = getStyle( that );
		if( event instanceof MouseEvent ){
			ImgPreview.elem_peview_img.style.top = parseFloat(style.top) - (that.beforEvent.pageY - event.pageY) + "px";
			ImgPreview.elem_peview_img.style.left = parseFloat(style.left) - (that.beforEvent.pageX - event.pageX) + "px";
		}else if( event instanceof TouchEvent ){
			ImgPreview.elem_peview_img.style.top = parseFloat(style.top) - (that.beforEvent.pageY - event.touches[0].pageY) + "px";
			ImgPreview.elem_peview_img.style.left = parseFloat(style.left) - (that.beforEvent.pageX - event.touches[0].pageX) + "px";
		}
		
		if( event instanceof MouseEvent ){
			that.beforEvent = event;
		}else if( event instanceof TouchEvent ){
			that.beforEvent = {
				pageX:event.touches[0].pageX,
				pageY:event.touches[0].pageY,
			};
		}
		//stopPropagation( event );
	},
	handleDragEnd:function( event ){
		this.isDragStart = false;
		this.style.cursor = "initial";
		var that = ImgPreview.elem_peview_img;
		that.beforEvent = undefined;
		stopPropagation( event );
	},
	inintZoom:function(){
		this.elem_peview.addEventListener("mousewheel",this.handleZoom);
		this.elem_peview.addEventListener("touchmove",function( event ){
			if( event.touches.length != 2 ){
				return false;
			}
			var p1 = {
				x:event.touches[0].pageX,
				y:event.touches[0].pageY,
			};
			var p2 = {
				x:event.touches[1].pageX,
				y:event.touches[1].pageY,
			};
			var distance = Math.sqrt( (p1.x-p2.x)*(p1.x-p2.x) + (p1.y-p2.y)*(p1.y-p2.y) );
			
			if( typeof this.befordistance != "undefined" ){
				if( Math.abs(this.befordistance-distance) > 30 ){
					event.deltaY = this.befordistance-distance;
					ImgPreview.handleZoom( event );
					this.befordistance = distance;
				}
			}else{
				this.befordistance = distance;
			}
			
		});
	},
	handleZoom:function( event ){
		var that = ImgPreview.elem_peview_img;
		var style = getStyle( that );
		var height = parseFloat(style.height);
		if( event.deltaY > 0 ){
			height -= 50;
		}else{
			height += 50;
		}
		that.style.height =  height+"px";
		that.style.maxHeight = "initial";
		that.style.maxWidth = "initial";
	},
	initClose:function(){
		var elem_close = this.elem_peview.querySelector(".preview-close");
		elem_close.addEventListener("mouseup",this.handleClose);
		elem_close.addEventListener("touchend",this.handleClose);
	},
	handleClose:function( event ){
		ImgPreview.elem_peview.parentNode.removeChild( ImgPreview.elem_peview );
	},
	preview:function( that,event ){
		this.max_src = that.getAttribute("max-src") || that.getAttribute("src");
		//this.max_src = "https://www.baidu.com/img/bd_logo1.png";
		if( !this.max_src ){
			return false;
		}
		this.elem_peview = createElementByHtml( ImgPreview.htmlTemplate );
		this.elem_peview_img = this.elem_peview.querySelector(".preview-img");
		this.elem_peview_img.setAttribute("src",this.max_src);
		
		this.initDrag();
		this.inintZoom();
		this.initClose();
		
		document.body.appendChild( this.elem_peview );
		stopPropagation( event );
	},
	htmlTemplate:'<div class="img-preview" >'+
					'<img class="preview-img" />'+
					'<div class="preview-close"></div>'+
				'</div>',
}
ImgPreview = new ImgPreview();
