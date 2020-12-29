(function (document, window) {
	'use strict';

	window.requestAnimationFrame = window.requestAnimationFrame
			|| window.mozRequestAnimationFrame
			|| window.webkitRequestAnimationFrame
			|| window.msRequestAnimationFrame;

	var Utils = {

		extend: function(out) {
			out = out || {};
			for (var i = 1; i < arguments.length; i++) {
				if (!arguments[i]) continue;
				for (var key in arguments[i]) {
					if (arguments[i].hasOwnProperty(key)) {
						out[key] = arguments[i][key];
					}
				}
			}
			return out;
		},

		outerHeight: function(element, includeMargin) {
			var hidden = false;
			if (element.style.display === 'none') {
				element.style.display = '';
				hidden = true;
			}
			var height = element.offsetHeight;
			if (includeMargin) {
				var style = getComputedStyle(element);
				height += parseInt(style.marginTop)
						+ parseInt(style.marginBottom);
			}
			if (hidden) {
				element.style.display = 'none';
			}
			return height;
		},

		offsetTop: function(element) {
			var offsetTop = 0;
			while(element) {
				offsetTop += element.offsetTop;
				element = element.offsetParent;
			}
			return offsetTop;
		},

		offsetLeft: function(element) {
			var offsetLeft = 0;
			while(element) {
				offsetLeft += element.offsetLeft;
				element = element.offsetParent;
			}
			return offsetLeft;
		},

		fadeIn: function (element, duration, complete) {
			if (!complete && duration && typeof duration === 'function') {
				complete = duration;
				duration = 400;
			} else if (!duration) {
				duration = 400;
			}
			element.style.opacity = 0;
			var last = +new Date();
			var tick = function() {
				element.style.opacity = +element.style.opacity + ( new Date() - last ) / duration;
				last = +new Date();
				if (+element.style.opacity < 1) {
					(window.requestAnimationFrame && requestAnimationFrame(tick) ) || setTimeout(tick, 16);
				} else if (complete && typeof complete === "function") {
					element.style.opacity = 1;
					complete.call(element);
				}
			};
			tick();
		},

		fadeOut: function (element, duration, complete) {
			if (!complete && duration && typeof duration === 'function') {
				complete = duration;
				duration = 400;
			} else if (!duration) {
				duration = 400;
			}
			element.style.opacity = 1;
			var last = +new Date();
			var tick = function() {
				element.style.opacity = +element.style.opacity - (new Date() - last) / duration;
				last = +new Date();
				if (+element.style.opacity > 0) {
					(window.requestAnimationFrame && requestAnimationFrame(tick) ) || setTimeout(tick, 16);
				} else if (complete && typeof complete === "function") {
					element.style.opacity = 0;
					complete.call(element);
				}
			};
			tick();
		},

		index: function (element, list) {
			var len = list.length;
			for (var i = 0; i < len; i++) {
				if (list[i] === element) {
					return i;
				}
			}
			return -1;
		}
	}

	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return Utils;
		});
	} else {
		window.Utils = Utils;
	}

}(document, window));
