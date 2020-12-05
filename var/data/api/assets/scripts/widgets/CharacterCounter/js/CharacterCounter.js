(function (global) {
	"use strict";

	function CharacterCounter(input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		var maxlength = input.getAttribute('maxlength');
		if (maxlength) {
			maxlength = parseInt(maxlength, 10);
			var id = 'CharacterCounter-' + input.getAttribute('name');
			var remaining = maxlength - input.value.length;
			var text = 'Number of characters remaining: %remaining% out of %maximum% maximum';
			var message = document.createElement('p');
			message.setAttribute('id', id);
			message.setAttribute('aria-live', 'polite');
			message.setAttribute('class', 'CharacterCounter-message');
			message.setAttribute('aria-label', Translator.trans('Display the number of characters remaining to be entered'));
			message.textContent = Translator.trans(text, {'remaining': remaining, 'maximum': maxlength} );
			input.getAttribute('aria-controls', id);
			input.insertAdjacentElement('afterend', message);
			for (var eventName of ['input', 'propertychange']) {
				input.addEventListener(eventName, function(e) {
					remaining = maxlength - input.value.length;
					message.textContent = Translator.trans(text, {'remaining': remaining, 'maximum': maxlength} );
				});
			}
		}
	}

	global.CharacterCounter = CharacterCounter;
}(this));