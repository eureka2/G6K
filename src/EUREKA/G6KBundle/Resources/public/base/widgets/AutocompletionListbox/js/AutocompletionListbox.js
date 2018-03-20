(function (global) {
	"use strict";
		
	function AutocompletionListbox (select, onComplete) {
		var id = 'AutocompletionListbox-' + select.attr('name');
		var input = $('<input>', {id: id, type: 'text', tabindex: 0 });
		var attributes = select.prop("attributes");
		$.each(attributes, function() {
			if (this.name != 'id' && this.name != 'name' && this.name != 'value' && this.name != 'type') {
				input.attr(this.name, this.value);
			}
		});
		select.find("option[value='']").each(function(k) {
			input.attr('placeholder', $(this).text());
		});
		input.addClass('auto-completion-listbox');
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
			menuRole: 'listbox',
			helpText: Translator.trans('Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
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
				return '<div role="option" class="autocomplete-suggestion" data-val="' + item.text + '" data-value="' + item.value + '">' +  item.text.replace(re, "<b>$1</b>") + '</div>'; 
			},
			alignOnParent: true,
			menuClass: 'dropdown-menu',
			onSelect: function(e, term, item){
				onComplete(item.data('value'), item.data('val'));
			}
		});
	}
	global.AutocompletionListbox = AutocompletionListbox;
}(this));