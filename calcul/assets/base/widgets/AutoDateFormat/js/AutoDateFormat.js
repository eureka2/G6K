(function (global) {
	"use strict";

	// https://webdesign.tutsplus.com/tutorials/auto-formatting-input-value--cms-26745
	function AutoDateFormat (input, options, onComplete) {
		var numericKeys = [48,49,50,51,52,53,54,55,56,57];
		var numericPadKeys = [96,97,98,99,100,101,102,103,104,105];
		var controlKeys = [8, 9, 13, 35, 36, 37, 39, 46];
		var date = input[0];
		date.type = 'text';
		var d = 0, m = 0, Y = 0;
		var matches = options.dateFormat.match(/^(d|m|Y)([^dmY]+)(d|m|Y)([^dmY]+)(d|m|Y)(.*)$/);
		var sep = [matches[2], matches[4], matches[6]];
		var maxlen = sep.join('').length + 8;
		var parts = options.dateFormat.split(/[^dmY]+/);
		var partial = '', complete = '';
		for (var i = 0; i < 3; i++) {
			if (parts[i] == 'd') {
				d = i;
				complete += '\\d{2}';
			} else if (parts[i] == 'm') {
				m = i;
				complete += '\\d{2}';
			} else {
				Y = i;
				complete += '\\d{4}';
			}
			complete += sep[i]
						.replace('\/', '\\/')
						.replace('\.', '\\.')
						.replace('\-', '\\-');
			partial += '(\\d*)(' 
						+ sep[i]
							.replace('\/', '\\/')
							.replace('\.', '\\.')
							.replace('\-', '\\-') 
						+ ')?';
		}
		partial = new RegExp(partial.replace('()?', ''));
		complete = new RegExp(complete);
		var allowedKeys = numericKeys.concat(numericPadKeys, controlKeys);

		date.addEventListener('input', function(e) {
			this.value = fixValue(this.value);
			if (complete.test(this.value)) {
				onComplete(this.value, this.value);
			}
		});

		date.addEventListener('keydown', function(e) {
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

		date.addEventListener('blur', function(e) {
			var values = splitValue(this.value);
			var output = '';
			var text = '';
			if (values.length == 3) {
				var year = parseInt(values[Y]);
				if (values[Y].length < 4) {
					var now = new Date();
					year += Math.floor(now.getFullYear() / 100) * 100;
				}
				var month = parseInt(values[m]) - 1;
				var day = parseInt(values[d]);
				var dateObj = new Date(year, month, day);
				if (!isNaN(dateObj)) {
					text = dateObj.toString();
					var dates = [0, 0, 0];
					dates[d] = dateObj.getDate();
					dates[m] = dateObj.getMonth() + 1;
					dates[Y] =  dateObj.getFullYear();
					output = dates.map(function(v, i) {
						v = v.toString();
						return (v.length == 1 ? '0' + v : v) + sep[i];
					}).join('');
					onComplete(output, text);
				}
			}
		});

		function fixValue(value) {
			var values = splitValue(value);
			if (values[m]) values[m] = padValue(values[m], 12);
			if (values[d]) values[d] = padValue(values[d], 31);
			var output = values.map(function(v, i) {
				if (i == Y && v.length == 4) {
					return v + sep[i];
				} else if ((i == m || i == d) && v.length == 2) {
					return v + sep[i];
				} else {
					return v;
				}
			});
			return output.join('').substr(0, maxlen);
		}

		function splitValue(value) {
			return value.match(partial).filter(function(v, i) {
				return i > 0 && sep.indexOf(v) == -1;
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

	global.AutoDateFormat = AutoDateFormat;
}(this));