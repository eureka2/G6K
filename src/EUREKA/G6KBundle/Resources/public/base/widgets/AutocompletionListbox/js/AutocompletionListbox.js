(function (global) {
	"use strict";
		
	function AutocompletionListbox (select, onComplete) {
		var input = $('<input>', {id: 'AutocompletionListbox-' + select.attr('name'), type: 'text', tabindex: 0 });
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
		select.hide();
		select.attr('aria-hidden', 'true');
		select.before(input);
		input.after('<a class="auto-completion-listbox-button input-group-addon" role="button" aria-haspopup="true" tabindex="-1"><span class="glyphicon glyphicon-remove" title="' + Translator.trans('Erase') + '"></span></a>');
		input.bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		input.autoComplete({
			minChars: 0,
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
			alignOnParent: true,
			menuClass: 'dropdown-menu',
			onSelect: function(e, term, item){
				onComplete(item.data('value'), item.data('val'));
			}
		});
		input.parent().find('.auto-completion-listbox-button').click(function(e) {
			e.preventDefault();
			input.autoComplete('clearSuggestions');
			onComplete('', input.attr('placeholder') || '');
			return false;
		});
		
 	}
	global.AutocompletionListbox = AutocompletionListbox;
}(this));