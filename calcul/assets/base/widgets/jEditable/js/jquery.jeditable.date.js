$.editable.addInputType('date', {
	element: function(settings, original) {
		var input = $('<input />', { 'data-inputmask': "'alias': 'date', 'placeholder': '" + settings.placeholder + "'" });
		if (settings.width  != 'none') { input.css('width', settings.width); }  
		if (settings.height != 'none') { input.css('height', settings.height); }
		input.css('min-width', '5.6em');  
		input.css('min-height', '2em');  
		input.attr('autocomplete','off');
		$(this).append(input);
		return(input);
	},
	plugin: function(settings, original) {
		$('input', this).inputmask(undefined, {
			oncomplete: function() {
			}
		});
	}
});
