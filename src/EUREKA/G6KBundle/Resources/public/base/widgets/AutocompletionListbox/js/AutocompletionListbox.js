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
		input.addClass('auto-completion-listbox');
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
			minChars: 2,
			source: function(term, suggest){
				term = term.toLowerCase();
				var suggestions = [];
				select.children('option').each(function(k) {
					var text = $(this).text();
					var value = $(this).attr('value');
					if (~(text).toLowerCase().indexOf(term)) {
						suggestions.push({ text: text, value: value });
					}
				});
				suggest(suggestions);
			},
			cache: 1,
			renderItem: function (item,  search) {
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				return '<div class="autocomplete-suggestion" data-value="' + item.value + '" data-text="' + item.text + '">' +  item.text.replace(re, "<b>$1</b>") + '</div>'; 
			},
			onSelect: function(e, term, item){
				input.val(item.data('text'));
				onComplete(item.data('value'), item.data('text'));
			}
		});
		
 	}
	global.AutocompletionListbox = AutocompletionListbox;
}(this));