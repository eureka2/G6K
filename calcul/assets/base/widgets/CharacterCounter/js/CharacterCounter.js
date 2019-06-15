(function (global) {
	"use strict";

	function CharacterCounter(input, options, onComplete) {
		var maxlength = input.attr('maxlength');
		if (maxlength) {
			maxlength = parseInt(maxlength, 10);
			var id = 'CharacterCounter-' + input.attr('name');
			var remaining = maxlength - input.val().length;
			var message = $('<p>', {
				'id': id,
				'aria-live': 'polite',
				'class': 'CharacterCounter-message',
				'aria-label': Translator.trans('Display the number of characters remaining to be entered'),
				'text': Translator.trans('Number of characters remaining: %remaining% out of %maximum% maximum', {'remaining': remaining, 'maximum': maxlength} )
			});
			input.attr('aria-controls', id);
			input.after(message);
			input.on('input propertychange', function(e) {
				remaining = maxlength - input.val().length;
				message.text(Translator.trans('Number of characters remaining: %remaining% out of %maximum% maximum', {'remaining': remaining, 'maximum': maxlength} ));
			});
		}
	}

	global.CharacterCounter = CharacterCounter;
}(this));