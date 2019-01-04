(function (global) {
	"use strict";
		
	function jEditable (input, options, onComplete) {
		var editable;
		if (input.is('select')) {
			var data = {};
			var selected  = '';
			var text = '';
			input.children().each(function() {
				var value = $(this).is('[value]') ? $(this).attr('value') : $(this).text();
				data[value] = $(this).text();
				if ($(this).attr('selected')) {
					selected = value;
					text = $(this).text();
				}
			});
			data.selected = selected;
			editable = $('<span>', { 'class': 'editable-select', 'data-value': selected, text: text, 'tabindex': input.prop('tabIndex') });
			input.hide();
			input.attr('aria-hidden', 'true');
			input.before(editable);
			editable.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					settings.data.selected = val;
					onComplete(val, settings.data[val]);
					return settings.data[val];
				},
				{
					data: data,
					name: input.attr('name'),
					type: "select",
					placeholder: Translator.trans("click to enter a value"),
					tooltip: Translator.trans("click to edit this value"),
					style: "inherit"
				}
			);
		} else {
			var type = input.attr('type');
			var placeholder = Translator.trans("click to enter a value");
			if (type == 'text') {
				if (input.hasClass('date')) {
					type = 'date';
					placeholder = input.attr('placeholder');
				} else {
					type = 'autogrow';
				}
			}
			input.hide();
			input.attr('aria-hidden', 'true');
			editable = $('<span>', { 'class': 'editable-' + type, 'data-value': input.val(), text: input.val(), 'tabindex': input.prop('tabIndex') });
			input.before(editable);
			editable.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					onComplete(val, val);
					return val;
				},
				{
					name: input.attr('name'),
					id: "text-" + Math.floor(Math.random() * 100000),
					type: type,
					placeholder: placeholder,
					tooltip: Translator.trans("click to edit this value"),
					style: "inherit",
					onblur: 'submit',
					callback: function() {
					}
				}
			);
		}
		editable.keydown(function(e) {
			if (e.keyCode == 13 && e.target.tagName == 'SPAN' && /\beditable-/.test(e.target.className) ) {
				e.preventDefault();
				$(this).trigger('click');
			}
		});
 	}

	global.jEditable = jEditable;
}(this));