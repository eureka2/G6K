(function (global) {
	"use strict";

	function restcountriesAPI (input, options, onComplete) {
		var lang = options.locale.split(/-/)[0];
		var g6k = input.data('g6k');
		var countries = [];
		setTimeout(function() {
			countries = $.map(restcountriesAPI.ALL_COUNTRIES, function(d, k) {
				return {
					country: d.translations[lang] || d.name,
					flag: d.flag
				};
			});
			countries.sort(function(a, b) {
				a = unaccent(a.country).toLowerCase();
				b = unaccent(b.country).toLowerCase();
				if (a == b) {
					return 0;
				}
				if (a > b) {
					return 1;
				}
				return -1;
			});
		}, 1000);
		var id = 'restcountriesAPI' + input.attr('name');
		var input2 = $('<input>', { id: id, type: 'text' });
		var attributes = input.prop("attributes");
		$.each(attributes, function() {
			if (this.name != 'id' && this.name != 'name' && this.name != 'value' && this.name != 'type' && this.name != 'data-widget') {
				input2.attr(this.name, this.value);
			}
		});
		var label = input.parent().parent().find('label[for='+ input.attr('id') + ']');
		label.attr('for', input2.attr('id'));
		input.before(input2);
		$.each(attributes, function(k, v) {
			if (v && v.name != 'name' && v.name != 'value' && v.name != 'type') {
				input.removeAttr(v.name);
			}
		});
		input.attr('type', 'hidden');

		input2.bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input2.on("blur", function(event) {
			var val = $(this).val();
			onComplete(val, val, false, false);
		});

		var isSelected = false;
		var selected = null;
		input2.autoComplete({
			menuId: id + '-suggestions',
			helpText: Translator.trans('Suggestions will be proposed when you enter. Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, response){
				search (term, function (terms) {
					response(terms);
				});
			},
			cache: 0,
			renderItem: function (item,  search) {
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				return '<div class="autocomplete-suggestion" data-val="' + item.country + '" data-value="' + item.country + '" data-text="' + item.country + '">' +  item.country.replace(re, "<b>$1</b>") + '</div>'; 
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
			onSelect: function(e, term, item){
				onComplete( item.data('value'), item.data('text'), false, true);
				removeError();
			},
			onClear: function() {
				onComplete('', '', false, true);
				removeError();
				selected = null;
			},
			onInput: function(val) {
				removeError();
			},
			onTab: function() {
				// nothing todo
			}
		});

		function search (term, response) {
			term = $.trim(term).toLowerCase();
			var items = $.grep(countries, function(d, k) {
				return d.country.toLowerCase().indexOf(term) >= 0;
			});
			response(items); 
		}

		function clearInput() {
			input.removeAttr('aria-describedby');
			input.removeAttr('aria-invalid');
			input.removeAttr('class');
		}

		function setError (error) {
			g6k.setError(input.attr('name'), error);
			input2.attr('aria-describedby', input.attr('aria-describedby'));
			clearInput();
		}

		function removeError() {
			setTimeout(function () {
				g6k.removeError(input.attr('name'));
			}, 500);
			input2.attr('aria-describedby', input2.attr('id') + '-suggestions-help');
			clearInput();
		}

		function unaccent(s) {
			var diacritics =[
				/[\300-\306]/g, /[\340-\346]/g,  // A, a
				/[\310-\313]/g, /[\350-\353]/g,  // E, e
				/[\314-\317]/g, /[\354-\357]/g,  // I, i
				/[\322-\330]/g, /[\362-\370]/g,  // O, o
				/[\331-\334]/g, /[\371-\374]/g,  // U, u
				/[\321]/g, /[\361]/g, // N, n
				/[\307]/g, /[\347]/g, // C, c
			];

			var chars = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

			for (var i = 0; i < diacritics.length; i++) {
				s = s.replace(diacritics[i],chars[i]);
			}
			return s;
		}
	}

	global.restcountriesAPI = restcountriesAPI;
}(this));

if (! restcountriesAPI.ALL_COUNTRIES) {
	try { 
		xhr.abort(); 
	} catch(e){
	}
	var param = {'fields': 'name;translations;flag'};
	$.getJSON(
		'https://restcountries.eu/rest/v2/all', 
		param, 
		function(data) {
			restcountriesAPI.ALL_COUNTRIES = data;
		}
	);
}