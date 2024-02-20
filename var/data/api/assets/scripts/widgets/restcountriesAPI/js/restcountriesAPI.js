(function (global) {
	"use strict";

	function restcountriesAPI (input, options, onComplete) {
		var g6k;
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var lang = options.locale.split(/-/)[0];
		var countries = [];
		setTimeout(function() {
			countries = restcountriesAPI.ALL_COUNTRIES.map(function(d, k) {
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
		var id = 'restcountriesAPI' + input.getAttribute('name');
		var input2 = document.createElement('input');
		input2.setAttribute('id', id);
		input2.setAttribute('type', 'text');
		for (var i = input.attributes.length - 1; i >= 0; i--) {
			var attr = input.attributes[i];
			if (['id', 'name', 'value', 'type', 'data-widget'].indexOf(attr.name) < 0) {
				input2.setAttribute(attr.name, attr.value);
			}
		}
		var label = input.parentElement.parentElement.querySelector('label[for='+ input.getAttribute('id') + ']');
		label.setAttribute('for', input2.getAttribute('id'));
		input.before(input2);
		for (var i = input.attributes.length - 1; i >= 0; i--) {
			var v = input.attributes[i];
			if (['name', 'value', 'type'].indexOf(v.name) < 0) {
				input.removeAttribute(v.name);
			}
		}
		input.setAttribute('type', 'hidden');

		input2.addEventListener("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		input2.addEventListener("blur", function(event) {
			var val = this.value;
			onComplete(val, val, false, false);
		});

		var isSelected = false;
		var selected = null;
		var autocomplete = new autoComplete(input2, {
			menuId: id + '-suggestions',
			helpText: Translator.trans('Suggestions will be proposed when you enter. Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, response){
				var that = this;
				search (term, function (terms) {
					response(that, terms);
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
				onComplete( item.dataset.value, item.dataset.text, false, true);
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
			term = term.trim().toLowerCase();
			var items = countries.filter(function(d, k) {
				return d.country.toLowerCase().indexOf(term) >= 0;
			});
			response(items); 
		}

		function clearInput() {
			input.removeAttribute('aria-describedby');
			input.removeAttribute('aria-invalid');
			input.removeAttribute('class');
		}

		function setError (error) {
			g6k.setError(input.getAttribute('name'), error);
			input2.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
			clearInput();
		}

		function removeError() {
			setTimeout(function () {
				g6k.removeError(input.getAttribute('name'));
			}, 500);
			input2.setAttribute('aria-describedby', input2.getAttribute('id') + '-suggestions-help');
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
	var param = {fields: 'name;translations;flag'};
	ajax({
		method: 'get',
		url: 'https://restcountries.eu/rest/v2/all',
		dataType: 'json',
		data: param,
	}).then(function( data, xhr, textStatus ) {
		restcountriesAPI.ALL_COUNTRIES = data;
	}).catch(function(response, xhr, textStatus) {
		if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
			console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
		} else {
			var result = { 'error': xhr.statusText };
			console.log(result);
		}
	});
}