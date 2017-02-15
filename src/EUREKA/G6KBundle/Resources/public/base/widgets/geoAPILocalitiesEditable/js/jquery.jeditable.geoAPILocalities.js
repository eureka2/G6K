$.editable.addInputType('geoAPILocalitiesEditable', {
	element: function(settings, original) {
		var input = $('<input />');
		if (settings.width  != 'none') { input.width(settings.width);  }
		if (settings.height != 'none') { input.height(settings.height); }
		input.attr('autocomplete','off');
		$(this).append(input);
		return(input);
	},
	plugin: function(settings, original) {
		$('input', this).css('min-width', '13em');
		$('input', this).autoComplete(settings.autoComplete);
	}
});
