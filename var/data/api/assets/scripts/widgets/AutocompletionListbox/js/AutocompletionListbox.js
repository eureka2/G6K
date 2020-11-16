(function (global) {
	"use strict";
		
	function AutocompletionListbox (select, options, onComplete) {
		var g6k = this;
		if (typeof select === "object" && select && select["jquery"]) {
			select = select[0];
		}
		var id = 'AutocompletionListbox-' + select.getAttribute('name');
		var input = document.createElement('input');
		input.id = id;
		input.type = 'text';
		var attributes = select.attributes;
		for (var i = attributes.length - 1; i >= 0; i--) {
			var attr = attributes[i];
			if (attr.name != 'id' && attr.name != 'name' && attr.name != 'value' && attr.name != 'data-widget') {
				input.setAttribute(attr.name, attr.value);
			}
		}
		select.querySelectorAll("option[value='']").forEach( option => {
			input.setAttribute('placeholder', option.innerText);
		});
		input.classList.add('auto-completion-listbox');
		var label = select.parentElement.parentElement.querySelector("label[for='" + select.getAttribute('id') + "']");
		label.setAttribute('for', input.getAttribute('id'));
		select.setAttribute('tabindex', '-1');
		select.style.display = 'none';
		select.setAttribute('aria-hidden', 'true');
		select.parentElement.insertBefore(input, select);

		input.addEventListener("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		var autocomplete = new autoComplete(input, {
			menuId: id + '-suggestions',
			helpText: Translator.trans('Suggestions will be proposed when you enter. Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 0,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, suggest){
				term = term.toLowerCase();
				var suggestions = [];
				select.querySelectorAll('option').forEach( option => {
					var text = option.innerText;
					var value = option.getAttribute('value');
					if (value !== '' && ~(text).toLowerCase().indexOf(term)) {
						suggestions.push({ text: text, value: value });
					}
				});
				suggest(autocomplete, suggestions);
			},
			cache: 1,
			renderItem: function (item,  search) {
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				return '<div data-val="' + item.text + '" data-value="' + item.value + '">' +  item.text.replace(re, "<b>$1</b>") + '</div>'; 
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
				onComplete(item.dataset.value, item.dataset.val);
			},
			onClear: function() {
				select.value = "";
				select.dispatchEvent(new Event("change"));
			}
		});
	}
	global.AutocompletionListbox = AutocompletionListbox;
}(this));