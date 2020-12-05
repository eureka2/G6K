$.editable.addInputType('number', {
	element: function(settings, original) {
		var input = $('<input />', { type: 'number'});
		if (settings.width  != 'none') { input.css('width', settings.width); }  
		if (settings.height != 'none') { input.css('height', settings.height); }
		input.css('min-width', '5.6em');  
		input.css('min-height', '2em');  
		input.attr('autocomplete','off');
		$(this).append(input);
		return(input);
	}
});
