document.addEventListener( 'DOMContentLoaded', function() {
	Editable.editable.addInputType('date', {
		element: function(settings, original) {
			var input = document.createElement('input');
			input.setAttribute('data-inputmask', "'alias': 'datetime', 'placeholder': '" + settings.placeholder + "'");
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
			input.setAttribute('autocomplete','off');
			this.appendChild(input);
			return input;
		},
		plugin: function(settings, original) {
			var input = this.querySelector('input');
			var inputFormat = settings.options.dateFormat.replace('d', 'dd').replace('m', 'mm').replace('Y', 'yyyy');
			input.setAttribute('data-inputmask', "'alias': 'datetime', 'inputFormat': '" + inputFormat + "', 'placeholder': '" + settings.options.placeholder + "'");
			Inputmask(undefined, {
				oncomplete: function() {
				}
			}).mask(input);
		}
	});
});
