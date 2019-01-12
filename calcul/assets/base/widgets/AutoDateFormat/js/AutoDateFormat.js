(function (global) {
	"use strict";

	// https://webdesign.tutsplus.com/tutorials/auto-formatting-input-value--cms-26745
	function AutoDateFormat (input, options, onComplete) {
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

		date.addEventListener('input', function(e) {
			var values = splitValue(this.value);
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
			this.value = output.join('').substr(0, maxlen);
			if (complete.test(this.value)) {
				onComplete(this.value, this.value);
			}
		});

		date.addEventListener('keydown', function(e) {
			// keydown is triggered before input
			var key = e.which || e.keyCode;
			if (key == 8 && date.value.length > 0) { // backspace
				var value = date.value;
				var last = value.slice(-1);
				if (!/\d/.test(value.slice(-1))) {
					e.preventDefault();
					value = value.slice(0, -1);
					while (value.length > 0 && !/\d/.test(value.slice(-1))) {
						value = value.slice(0, -1);
					}
					if (value.length > 0) {
						value = value.slice(0, -1);
					}
					date.value = value;
				}
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