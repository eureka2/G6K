/*
	jQuery autoGrowInput v1.0.0
	Copyright (c) 2014 Simon Steinberger / Pixabay
	Based on stackoverflow.com/questions/931207 (James Padolsey)
	GitHub: https://github.com/Pixabay/jQuery-autoGrowInput
	License: http://www.opensource.org/licenses/mit-license.php
*/

(function (global) {
	'use strict';

	var extend = function(out) {
		out = out || {};
		for (var i = 1; i < arguments.length; i++) {
			if (!arguments[i]) continue;
			for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key))
				out[key] = arguments[i][key];
			}
		}
		return out;
	};

	var AutoGrowInput = function(element, options) {
		var o = extend({ maxWidth: 500, minWidth: 20, comfortZone: 0 }, options);
		var event = 'oninput' in document.createElement('input') ? 'input' : 'keydown';
		var input = element;
		var minWidth = o.minWidth || input.style.width;
		var val = ' ';
		var comfortZone = o.comfortZone ? o.comfortZone : parseInt(input.style.fontSize);
		var span = document.createElement('span');
		span.style.position = 'absolute';
		span.style.top = -9999;
		span.style.left = -9999;
		span.style.width = 'auto';
		span.style.fontSize = input.style.fontSize;
		span.style.fontFamily = input.style.fontFamily;
		span.style.fontWeight = input.style.fontWeight;
		span.style.letterSpacing = input.style.letterSpacing;
		span.style.whiteSpace = 'nowrap';

		var check = function(e) {
			if (val === (val = input.value) && !e.type == 'autogrow') {
				return;
			}
			span.innerHTML = val.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			var spanWith = parseFloat(getComputedStyle(span, null).width.replace("px", ""));
			var inputWith = parseFloat(getComputedStyle(input, null).width.replace("px", ""));
			var newWidth = spanWith + comfortZone;
			var mw = typeof(o.maxWidth) == "function" ? o.maxWidth() : o.maxWidth;
			if (newWidth > mw) {
				newWidth = mw;
			} else if (newWidth < o.minWidth) {
				newWidth = o.minWidth;
			}
			if (newWidth != inputWith) {
				input.style.width = newWidth + 'px';
			}
		};

		input.insertAdjacentElement('afterend', span);
		for (let eventType of [event+'.autogrow', 'autogrow']) {
			input.addEventListener(eventType, check);
		}
		// init on page load
		check();
		return element;
	}

	global.AutoGrowInput = AutoGrowInput;

}(this));
