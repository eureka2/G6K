document.addEventListener( 'DOMContentLoaded', function() {
	Editable.editable.addInputType('geoAPILocalitiesEditable', {
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
			input.setAttribute('autocomplete','off');
			this.appendChild(input);
			return input;
		},
		plugin: function(settings, original) {
			this.querySelector('input').style.minWidth = '13em';
			new autoComplete(this.querySelector('input'), settings.autoComplete);
		}
	});
});
