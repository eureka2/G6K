document.addEventListener( 'DOMContentLoaded', function() {
	Editable.editable.addInputType('number', {
		element: function(settings, original) {
			var input = document.createElement('input');
			input.type =  'number';
			if (settings.width  != 'none') {
				input.style.width = settings.width;
			}
			if (settings.height != 'none') {
				input.style.height = settings.height;
			}
			input.style.minWidth = '5.6em';  
			input.style.minHeight = '2em';  
			input.setAttribute('autocomplete','off');
			this.appendChild(input);
			return input;
		}
	});
});
