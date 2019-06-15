(function (global) {
	"use strict";

	function AutoHoursFormat (input, options, onComplete) {
		var numericKeys = [48,49,50,51,52,53,54,55,56,57];
		var numericPadKeys = [96,97,98,99,100,101,102,103,104,105];
		var controlKeys = [8, 9, 13, 35, 36, 37, 39, 46];
		var hourminutes = input[0];
		var format = 'H:i';
		var H = 0, i = 0;
		var matches = format.match(/^(H|i)([^Hi]+)(H|i)(.*)$/);
		var sep = [matches[2], matches[4]];
		var maxlen = sep.join('').length + 4;
		var parts = format.split(/[^Hi]+/);
		var partial = '', complete = '';
		for (var k = 0; k < 2; k++) {
			if (parts[k] == 'H') {
				H = k;
				complete += '\\d{2}';
			} else {
				i = k;
				complete += '\\d{2}';
			}
			complete += sep[k]
						.replace('\/', '\\/')
						.replace('\.', '\\.')
						.replace('\-', '\\-');
			partial += '(\\d*)(' 
						+ sep[k]
							.replace('\/', '\\/')
							.replace('\.', '\\.')
							.replace('\-', '\\-') 
						+ ')?';
		}
		partial = new RegExp(partial.replace('()?', ''));
		complete = new RegExp(complete);
		var allowedKeys = numericKeys.concat(numericPadKeys, controlKeys);

		hourminutes.addEventListener('input', function(e) {
			this.value = fixValue(this.value);
			if (complete.test(this.value)) {
				onComplete(this.value, this.value);
			}
		});

		hourminutes.addEventListener('keydown', function(e) {
			// keydown is triggered before input
			var key = e.which || e.keyCode;
			var value = this.value;
			var start = this.selectionStart;
			if (key == 8 && this.selectionStart > 0) { // backspace
				var toDelete = value.charAt(start - 1);
				if (sep.indexOf(toDelete) >= 0) {
					e.preventDefault();
					this.setSelectionRange(start - 1, start - 1);
				} else {
					e.preventDefault();
					value = value.slice(0, start - 1) + ' ' + value.slice(start);
					while (value.length > 0 && !/\d/.test(value.slice(-1))) {
						value = value.slice(0, -1);
					}
					this.value = value;
					this.setSelectionRange(start - 1, start - 1);
				}
			} else if (value.charAt(start) == ' ' && 
				(numericKeys.indexOf(key) >= 0 || numericPadKeys.indexOf(key) >= 0)) {
				e.preventDefault();
				e.stopPropagation();
				var chr = numericPadKeys.indexOf(key) >= 0 ?
						String.fromCharCode(key - 48) :
						String.fromCharCode(key); 
				value = value.slice(0, start) + chr + value.slice(start + 1);
				var fixed = fixValue(value);
				if (fixed.slice(0, start + 1) == value.slice(0, start + 1)) {
					this.value = value;
					this.setSelectionRange(start + 1, start + 1);
					if (complete.test(this.value)) {
						onComplete(this.value, this.value);
					}
				}
			} else if (allowedKeys.indexOf(key) < 0 && sep.indexOf(e.key) < 0) {
				e.preventDefault();
			}
		});

		hourminutes.addEventListener('blur', function(e) {
			var values = splitValue(this.value);
			var output = '';
			var text = '';
			if (values.length == 2) {
				var minutes = parseInt(values[i]);
				var hours = parseInt(values[H]);
				var dateObj = new Date(2019, 1, 1, hours, minutes);
				if (!isNaN(dateObj)) {
					text = dateObj.toString();
					var dates = [0, 0];
					dates[H] = dateObj.getHours();
					dates[i] = dateObj.getMinutes();
					output = dates.map(function(v, k) {
						v = v.toString();
						return (v.length == 1 ? '0' + v : v) + sep[k];
					}).join('');
					onComplete(output, text);
				}
			}
		});

		function fixValue(value) {
			var values = splitValue(value);
			if (values[H]) values[H] = padValue(values[H], 23);
			if (values[i]) values[i] = padValue(values[i], 59);
			var output = values.map(function(v, k) {
				if ((k == H || k == i) && v.length == 2) {
					return v + sep[k];
				} else {
					return v;
				}
			});
			return output.join('').substr(0, maxlen);
		}

		function splitValue(value) {
			return value.match(partial).filter(function(v, k) {
				return k > 0 && sep.indexOf(v) == -1;
			}).map(function(v) {
				return v ? v.replace(/\D/g, '') : "";
			});
		}

		function padValue(value, max) {
			if (value.charAt(0) !== '0' || value == '00') {
				var num = parseInt(value);
				if (isNaN(num) || num <= 0 || num > max) {
					num = 1;
				}
				value = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1
						? '0' + num
						: num.toString();
			}
			return value;
		}
	}

	global.AutoHoursFormat = AutoHoursFormat;
}(this));