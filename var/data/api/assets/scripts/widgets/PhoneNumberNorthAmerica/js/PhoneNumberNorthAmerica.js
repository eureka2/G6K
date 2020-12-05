(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 32, 35, 36, 37, 39, 40, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 109, 110];

	function PhoneNumberNorthAmerica(input, options, onComplete) {
		var g6k;
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var phone = input.value;

		for (var eventName of ['input', 'propertychange']) { 
			input.addEventListener(eventName, function(e) {
				var phone = this.value;
				if (phone == '') {
					g6k.triggerChange(this, true, true);
				} else if (phone.match(/[^\s\-\.]/g).length >= 10) {
					if (checkPhone(phone)) {
						onComplete && onComplete(phone, phone);
					}
				}
			});
		}
		input.addEventListener("keydown", function(event) {
			var len = this.value.length;
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input.addEventListener('blur', function(e) {
			if (this.value != '') {
				var len = this.value.match(/[^\s\-\.]/g).length;
				if (len != 10) {
					setError('The phone number is not in an expected format!');
				}
			}
		});

		function checkPhone(phone) {
			var matches = phone.match(/^\d{3}([-. ])\d{3}([-. ])\d{4}$/);
			if (matches && matches[1] == matches[2]) {
				return true;
			}
			if (/^\d{10}$/.test(phone)) {
				return true;
			}
			setError('The phone number is not in an expected format!');
			return false;
		}

		function setError(error) {
			g6k.setError(input.getAttribute('name'), Translator.trans(error));
		}

		var phone = input.value;
		if (phone != '' && phone.match(/[^\s\-\.]/g).length >= 10) {
			checkPhone(phone);
		}
	}

	global.PhoneNumberNorthAmerica = PhoneNumberNorthAmerica;
}(this));