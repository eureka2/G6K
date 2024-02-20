(function (global) {
	"use strict";

	function Email(input, options, onComplete) {
		var g6k;
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var email = input.value;

		for (var eventName of ['input', 'propertychange']) {
			input.addEventListener(eventName, function(e) {
				var email = input.value;
				if (email == '') {
					g6k.triggerChange(input, true, true);
				} else if (email.length >= 6) {
					if (checkEmail(email)) {
						onComplete && onComplete(email, email);
					}
				}
			});
		}

		input.addEventListener('blur', function(e) {
			if (input.value != '') {
				var len = input.value.match(/[^\s\-\.]/g).length;
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
			g6k.setError(input.getAttribute('name'), Translator.trans(error));
		}

		var email = input.value;
		if (email != '' && email.length >= 6) {
			checkEmail(email);
		}
	}

	global.Email = Email;
}(this));