(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 32, 35, 36, 37, 39, 40, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 109, 110];

	function PhoneNumber10Digits(input, options, onComplete) {
		var phone = input.val();
		var g6k = input.data('g6k');

		input.on('input propertychange', function(e) {
			var phone = input.val();
			if (phone == '') {
				g6k.triggerChange(input, true, true);
			} else if (phone.match(/[^\s\-\.]/g).length >= 10) {
				if (checkPhone(phone)) {
					onComplete && onComplete(phone, phone);
				}
			}
		});
		input.on("keydown", function(event) {
			var len = $(this).val().length;
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input.on('blur', function(e) {
			if (input.val() != '') {
				var len = input.val().match(/[^\s\-\.]/g).length;
				if (len != 10) {
					setError('The phone number is not in an expected format!');
				}
			}
		});

		function checkPhone(phone) {
			var matches = phone.match(/^\d{2}([-. ])\d{2}([-. ])\d{2}([-. ])\d{2}([-. ])\d{2}$/);
			if (matches && matches[1] == matches[2] && matches[1] == matches[3] && matches[1] == matches[4]) {
				return true;
			}
			if (/^\d{10}$/.test(phone)) {
				return true;
			}
			setError('The phone number is not in an expected format!');
			return false;
		}

		function setError(error) {
			g6k.setError(input.attr('name'), Translator.trans(error));
		}

		var phone = input.val();
		if (phone != '' && phone.match(/[^\s\-\.]/g).length >= 10) {
			checkPhone(phone);
		}
	}

	global.PhoneNumber10Digits = PhoneNumber10Digits;
}(this));