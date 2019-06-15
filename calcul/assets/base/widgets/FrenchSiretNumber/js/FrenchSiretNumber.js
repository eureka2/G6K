/**
 * Controle numéro de sécu
 * ========================
 */
 
(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 35, 36, 37, 39, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

	function FrenchSiretNumber(input, options, onComplete) {
		var siret = input.val();
		var g6k = input.data('g6k');

		input.on('input propertychange', function(e) {
			var siret = input.val();
			if (siret == '') {
				g6k.triggerChange(input, true, true);
			} else if (siret.length == 14) {
				if (checkSiret(siret)) {
					onComplete && onComplete(siret, siret);
				}
			}
		});
		input.on("keydown", function(event) {
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input.on('blur', function(e) {
			if (input.val() != '' && input.val().length != 14) {
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
			g6k.setError(input.attr('name'), Translator.trans(error));
		}

		var siret = input.val();
		if (siret != '' && siret.length >= 14) {
			checkSiret(siret);
		}
	}

	global.FrenchSiretNumber = FrenchSiretNumber;
}(this));