window.touchEvents = {
	touchstart: "touchstart",
	touchmove: "touchmove",
	touchend: "touchend",
	isPC: function() {
		var userAgentInfo = navigator.userAgent;
		var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
		var flag = true;
		for (var v = 0; v < Agents.length; v++) {
			if (userAgentInfo.indexOf(Agents[v]) > 0) {
				flag = false;
				break;
			}
		}
		return flag;
	},
	getEvent: function(event) {
		if (!event) {
			return false;
		}
		if (touchEvents.isPC()) {
			event = event || window.event;
		} else if (event.touches !== undefined && typeof(event.touches) === "object" && event.touches.length > 0) {
			event = event.touches[0];
		} else if (event.targetTouches.touches !== undefined && typeof(event.targetTouches.touches) === "object" && event.targetTouches.touches.length > 0) {
			event = event.targetTouches.touches[0];
		} else if (event.changedTouches !== undefined && typeof(event.changedTouches) === "object" && event.changedTouches.length > 0) {
			event = event.changedTouches[0];
		} else {
			event = undefined;
		}
		return event;
	},
	initTouchEvents: function() {
		if (touchEvents.isPC()) {
			this.touchstart = "mousedown";
			this.touchmove = "mousemove";
			this.touchend = "mouseup";
		}
	}
}
touchEvents.initTouchEvents();