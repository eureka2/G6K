(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 35, 36, 37, 39, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

	function FrenchSiretNumber(input, options, onComplete) {
		var g6k;
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var siret = input.value;

		for (var eventName of ['input', 'propertychange']) { 
			input.addEventListener(eventName, function(e) {
				var siret = this.value;
				if (siret == '') {
					g6k.triggerChange(this, true, true);
				} else if (siret.length == 14) {
					if (checkSiret(siret)) {
						onComplete && onComplete(siret, siret);
					}
				}
			});
		}
		input.addEventListener("keydown", function(event) {
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input.addEventListener('blur', function(e) {
			if (this.value != '' && this.value.length != 14) {
				setError('The siret number is not in the expected format!');
			}
		});

		function checkSiret(siret) {
			if (siret.length == 14 && /^\d+$/.test(siret)) {
				var tmp, sum = 0, len = siret.length;
				for (var i = 0; i < len; i++) {
					if ((i % 2) == 0) {
						tmp = siret.charAt(i) * 2; 
						if (tmp > 9) {
							tmp -= 9;
						}
					} else {
						tmp = siret.charAt(i);
					}
					sum += parseInt(tmp);
				}
				if ((sum % 10) != 0) {
					setError('The key control of the siret number is not valid!');
					return false;
				}
				return true;
			}
			setError('The siret number is not in the expected format!');
			return false;
		}

		function setError(error) {
			g6k.setError(input.getAttribute('name'), Translator.trans(error));
		}

		var siret = input.value;
		if (siret != '' && siret.length >= 14) {
			checkSiret(siret);
		}
	}

	global.FrenchSiretNumber = FrenchSiretNumber;
}(this));