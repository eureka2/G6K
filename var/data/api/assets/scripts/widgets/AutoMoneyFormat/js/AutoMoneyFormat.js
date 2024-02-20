(function (global) {
	"use strict";

	function AutoMoneyFormat (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		input.style.textAlign = 'right';
		for (var eventName of ['input', 'propertychange', 'paste', 'blur']) { 
			input.addEventListener(eventName, function(event) { 
				formatInput(this, options, event.type, onComplete);
			});
		}
	}

	// https://codepen.io/559wade/pen/LRzEjj
	function separateGroup(number, options) {
		var re = new RegExp("\\B(?=(\\d{" + options.groupingSize + "})+(?!\\d))", "g");
		return number.replace(/\D/g, "").replace(re, options.groupingSeparator);
	}

	function formatInput(input, options, eventType, onComplete) {
		var value = input.value;
		if (value !== "") {
			var len = value.length;
			var caret = getSelection(input).start;
			if (value.indexOf(options.decimalPoint) >= 0) {
				var pos = value.indexOf(options.decimalPoint);
				var left = value.substring(0, pos);
				var right = value.substring(pos);
				left = separateGroup(left, options);
				right = separateGroup(right, options);
				if (eventType === "blur") {
					right += "00";
				}
				right = right.substring(0, 2);
				value = left + options.decimalPoint + right;
			} else {
				value = separateGroup(value, options);
				if (eventType === "blur") {
					value += options.decimalPoint + "00";
				}
			}
			input.value = value;
			caret = value.length - len + caret;
			input.setSelectionRange(caret, caret);
		}
		onComplete && onComplete(value, value, true, true);
	}

	function getSelection(input) {
		var start = 0, end = 0;
		if (typeof input.selectionStart == "number" 
			&& typeof input.selectionEnd == "number") {
			start = input.selectionStart;
			end = input.selectionEnd;
		} else {
			range = document.selection.createRange();
			if (range && range.parentElement() == input) {
				var len = input.value.length;
				var normalizedValue = input.value.replace(/\r\n/g, "\n");
				var textInputRange = input.createTextRange();
				textInputRange.moveToBookmark(range.getBookmark());
				var endRange = input.createTextRange();
				endRange.collapse(false);
				if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
					start = end = len;
				} else {
					start = -textInputRange.moveStart("character", -len);
					start += normalizedValue.slice(0, start).split("\n").length - 1;
					if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
						end = len;
					} else {
						end = -textInputRange.moveEnd("character", -len);
						end += normalizedValue.slice(0, end).split("\n").length - 1;
					}
				}
			}
		}
		return { start: start, end: end };
	}

	global.AutoMoneyFormat = AutoMoneyFormat;
}(this));