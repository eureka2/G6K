(function (global) {
	"use strict";

	// https://webdesign.tutsplus.com/tutorials/auto-formatting-input-value--cms-26745
	function AutoDateFormat (input, options, onComplete) {
		var date = input[0];
		var sep = '/';
		var d = 0, m = 0, Y = 0;
		switch(options.dateFormat) {
			case 'd/m/Y':
				d = 0; m = 1; Y = 2;
				sep = '/';
				break;
			case 'm/d/Y':
				d = 1; m = 0; Y = 2;
				sep = '/';
				break;
			case 'd-m-Y':
				d = 0; m = 1; Y = 2;
				sep = '-';
				break;
			case 'm-d-Y':
				d = 1; m = 0; Y = 2;
				sep = '-';
				break;
			case 'd.m.Y':
				d = 0; m = 1; Y = 2;
				sep = '.';
				break;
			case 'm.d.Y':
				d = 1; m = 0; Y = 2;
				sep = '.';
				break;
			case 'Y-m-d':
				d = 2; m = 1; Y = 0;
				sep = '-';
				break;
			case 'Y.m.d':
				d = 2; m = 1; Y = 0;
				sep = '.';
				break;
			case 'Y/m/d':
				d = 2; m = 1; Y = 0;
				sep = '/';
				break;
			case 'Y-d-m':
				d = 1; m = 2; Y = 0;
				sep = '-';
				break;
			case 'Y.d.m':
				d = 1; m = 2; Y = 0;
				sep = '.';
				break;
			case 'Y/d/m':
				d = 1; m = 2; Y = 0;
				sep = '/';
				break;
		}

		date.addEventListener('input', function(e) {
			this.type = 'text';
			var input = this.value;
			if (/\D\/$/.test(input)) input = input.substr(0, input.length - 3);
			var values = input.split(sep).map(function(v) {
				return v.replace(/\D/g, '')
			});
			if (values[m]) values[m] = checkValue(values[m], 12);
			if (values[d]) values[d] = checkValue(values[d], 31);
			var output = values.map(function(v, i) {
				if (Y == 0) {
					return v.length == 4 && i < 2 ? v + sep : v;
				} else {
					return v.length == 2 && i < 2 ? v + sep : v;
				}
			});
			this.value = output.join('').substr(0, 14);
			if (this.value.length == 10) {
				onComplete(this.value, this.value);
			}
		});

		date.addEventListener('blur', function(e) {
			this.type = 'text';
			var input = this.value;
			var values = input.split(sep).map(function(v, i) {
				return v.replace(/\D/g, '')
			});
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
					output = dates.map(function(v) {
						v = v.toString();
						return v.length == 1 ? '0' + v : v;
					}).join(sep);
					onComplete(output, text);
				}
			}
		});
	}

	function checkValue(str, max) {
		if (str.charAt(0) !== '0' || str == '00') {
			var num = parseInt(str);
			if (isNaN(num) || num <= 0 || num > max) num = 1;
			str = num > parseInt(max.toString().charAt(0)) && num.toString().length == 1 ? '0' + num : num.toString();
		}
		return str;
	}

	global.AutoDateFormat = AutoDateFormat;
}(this));