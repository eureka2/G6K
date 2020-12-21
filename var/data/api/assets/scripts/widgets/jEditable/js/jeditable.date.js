document.addEventListener( 'DOMContentLoaded', function() {
	Editable.editable.addInputType('date', {
		element: function(settings, original) {
			var input = document.createElement('input');
			if (settings.width  != 'none') {
				var width = typeof settings.width != 'string' ? settings.width + 'px' : settings.width;
				input.style.width = width;
			}
			if (settings.height != 'none') {
				var height = typeof settings.height != 'string' ? settings.height + 'px' : settings.height;
				input.style.height = settings.height;
			}
			input.style.minWidth = '5.6em';  
			input.style.minHeight = '2em';  
			input.setAttribute('placeholder', settings.options.placeholder);
			input.setAttribute('title', settings.options.title);
			input.setAttribute('autocomplete','off');
			this.appendChild(input);
			return input;
		},
		plugin: function(settings, original) {
			var input = this.querySelector('input');
			var options = settings.options;
			options.type = 'date';
			new Formatter (input, options, function() {

			});
		}
	});
});
