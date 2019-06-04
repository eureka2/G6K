(function (global) {
	"use strict";

	function Email(input, options, onComplete) {
		var email = input.val();
		var g6k = input.data('g6k');

		input.on('input propertychange', function(e) {
			var email = input.val();
			if (email == '') {
				g6k.triggerChange(input, true, true);
			} else if (email.length >= 6) {
				if (checkEmail(email)) {
					onComplete && onComplete(email, email);
				}
			}
		});

		input.on('blur', function(e) {
			if (input.val() != '') {
				var len = input.val().match(/[^\s\-\.]/g).length;
				if (len < 6) {
					setError('Please enter a valid email address.');
				}
			}
		});

		function checkEmail(email) {
			if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
				return true;
			}
			setError('Please enter a valid email address.');
			return false;
		}

		function setError(error) {
			g6k.setError(input.attr('name'), Translator.trans(error));
		}

		var email = input.val();
		if (email != '' && email.length >= 6) {
			checkEmail(email);
		}
	}

	global.Email = Email;
}(this));