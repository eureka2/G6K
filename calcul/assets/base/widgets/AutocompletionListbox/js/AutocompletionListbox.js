(function (global) {
	"use strict";
		
	function AutocompletionListbox (select, options, onComplete) {
		var id = 'AutocompletionListbox-' + select.attr('name');
		var input = $('<input>', {id: id, type: 'text' });
		var attributes = select.prop("attributes");
		$.each(attributes, function() {
			if (this.name != 'id' && this.name != 'name' && this.name != 'value' && this.name != 'data-widget') {
				input.attr(this.name, this.value);
			}
		});
		select.find("option[value='']").each(function(k) {
			input.attr('placeholder', $(this).text());
		});
		input.addClass('auto-completion-listbox');
		var label = select.parent().parent().find('label[for='+ select.attr('id') + ']');
		label.attr('for', input.attr('id'));
		select.attr('tabindex', '-1');
		select.hide();
		select.attr('aria-hidden', 'true');
		select.before(input);

		input.bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		input.autoComplete({
			menuId: id + '-suggestions',
			helpText: Translator.trans('Suggestions will be proposed when you enter. Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 0,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, suggest){
				term = term.toLowerCase();
				var suggestions = [];
				select.children('option').each(function(k) {
					var text = $(this).text();
					var value = $(this).attr('value');
					if (value !== '' && ~(text).toLowerCase().indexOf(term)) {
						suggestions.push({ text: text, value: value });
					}
				});
				suggest(suggestions);
			},
			cache: 1,
			renderItem: function (item,  search) {
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				return '<div class="autocomplete-suggestion" data-val="' + item.text + '" data-value="' + item.value + '">' +  item.text.replace(re, "<b>$1</b>") + '</div>'; 
			},
			announce: function( count) {
			   switch (count) {
					case 0:
						return Translator.trans('There is no suggestion');
					case 1:
						return Translator.trans('There is one suggestion');
					default:
						return Translator.trans('There are %count% suggestions, use up and down arrows to review.', { 'count': count }) ;
			   }
			},
			alignOnParent: true,
			onSelect: function(e, term, item){
				onComplete(item.data('value'), item.data('val'));
			},
			onClear: function() {
				select.val("");
				select.trigger("change");
			}
		});
	}
	global.AutocompletionListbox = AutocompletionListbox;
}(this));