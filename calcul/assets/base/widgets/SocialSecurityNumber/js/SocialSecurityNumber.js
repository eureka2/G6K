/**
 * Controle numéro de sécu
 * ========================
 */
 
(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 35, 36, 37, 39, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

	function SocialSecurityNumber(input, options, onComplete) {
		var nir = input.val();
		var g6k = input.data('g6k');

		input.on('input propertychange', function(e) {
			var nir = input.val();
			if (nir == '') {
				g6k.triggerChange(input, true, true);
			} else if (nir.match(/[\S-]/g).length >= 13) {
				if (checkNIR(nir)) {
					nir = nir.replace(/\s/g, '').replace(/-/, '');
					onComplete && onComplete(nir, nir);
				}
			}
		});
		input.on("keydown", function(event) {
			var len = $(this).val().length;
			var key = event.which || event.keyCode;
			if (len == 6 &&  $(this).val().charAt(5) == '2' && (key == 65 || key == 66)) {
				return; // corse
			}
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input.on('blur', function(e) {
			if (input.val() != '') {
				var len = input.val().match(/[\S-]/g).length;
				if (len != 13 && len != 15) {
					setError('The social security number is not in the expected format!');
				}
			}
		});

		function checkNIR(nir) {
			var re = /([12])\s*(\d{2})\s*(\d{2})\s*(\d{2}|2A|2B)\s*(\d{3})\s*(\d{3})(.*)$/;
			var matches = nir.match(re);
			if (matches) {
				var key = matches[7];
				if (key && (key.length > 2 || ! /^\d+$/.test(key))) {
					setError('The social security number key is not valid!');
					return false;
				}
				var fix = 0;
				if (parseInt(matches[3]) < 1 || parseInt(matches[3]) > 12) { // month
					setError('The month of birth is not valid!');
					return false;
				} else if (matches[4] == '00' || matches[4] == '20') { // department
					setError('The birth department is not valid!');
					return false;
				} else if (matches[4] == '2A') {
					matches[4] = '20';
					fix = -1000000;
				} else if (matches[4] == '2B') {
					matches[4] = '20';
					fix = -2000000;
				}
				nir = parseInt(matches.splice(1, 6).join(''));
				nir += fix;
				var cKey = 97 - nir % 97;
				if (key && key.length == 2 && parseInt(key) != cKey) {
					setError('The social security number key is not valid!');
					return false;
				}
				return true;
			}
			setError('The social security number is not in the expected format!');
			return false;
		}

		function setError(error) {
			g6k.setError(input.attr('name'), Translator.trans(error));
		}

		var nir = input.val();
		if (nir != '' && nir.match(/[\S-]/g).length >= 15) {
			checkNIR(nir);
		}
	}

	global.SocialSecurityNumber = SocialSecurityNumber;
}(this));