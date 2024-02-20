(function (global) {
	"use strict";

	var g6k;
	function geoAPIZipCode (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var initial = input.value;
		if (/^\d{5}$/.test(initial)) {
			ajax({
				method: 'get',
				url: 'https://geo.api.gouv.fr/communes', 
				dataType: 'json',
				data: { codePostal: initial } 
			}).then(function( data, xhr, textStatus ) {
				if (data.length > 0) {
					var communes = [];
					data.forEach(function(d, k) {
						d.codesPostaux.forEach(function(cp, c) {
							if (cp == initial) {
								communes.push(d.nom  + ' (' + cp + ')');
							}
						});
					});
					initial = communes.join(' ' + Translator.trans('or') + ' ');
				}
			}).catch(function(response, xhr, textStatus) {
				if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
					console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
				} else {
					var result = { 'error': xhr.statusText };
					console.log(result);
				}
			}).always(function() {
				geoAPIZipCode.editable(input, initial, onComplete);
			});
		} else { 
			geoAPIZipCode.editable(input, initial, onComplete);
		}
	}

	function geoAPISearch (term, response) {
		try { 
			xhr.abort(); 
		} catch(e){
		}
		term = term.trim();
		term = term.replace(/^(le|la|les)\s+/, '');
		term = term.replace(/\s+/, '-');
		term = term.replace(/^st-/, 'saint-');
		term = term.replace(/^ste-/, 'sainte-');
		var param = { nom: term };
		if (/^\d+$/.test(term)) {
			if (term.length == 5) {
				param = { codePostal: term };
			} else if (term.length == 2 || (term.length == 3 && /^9[7-8]\d+$/.test(term))){
				param = { codeDepartement: term };
			}
		} else if (term == '2A' || term == '2B') {
			param = { codeDepartement: term };
		}
		param['fields'] = 'code,nom,codesPostaux,surface,population,centre,departement,region';
		ajax({
			method: 'get',
			url: 'https://geo.api.gouv.fr/communes', 
			dataType: 'json',
			data: param
		}).then(function( data, xhr, textStatus ) {
			var items = [];
			data.forEach(function(d, k) {
				d.codesPostaux.forEach(function(cp, c) {
					items.push({
						code: d.code,
						nom: d.nom,
						codePostal: cp,
						departement: d.departement.nom,
						region: d.region.nom,
						surface: d.surface,
						population: d.population,
						coordinates: d.centre.coordinates
					});
				});
			});
			response(items); 
		});
	}

	function geoAPIClearInput(input) {
		input.removeAttribute('aria-describedby');
		input.removeAttribute('aria-invalid');
		input.removeAttribute('class');
	}

	function geoAPISetError (input, input2, error) {
		g6k.setError(input.getAttribute('name'), error);
		input2.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
		geoAPIClearInput(input);
	}

	function geoAPIDetectError (input, input2) {
		if (input.getAttribute('aria-invalid') == 'true') {
			input2.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
			geoAPIClearInput(input);
		}
	}

	function geoAPIRemoveError (input, input2) {
		setTimeout(function () {
			g6k.removeError(input.getAttribute('name'));
		}, 500);
		input2.setAttribute('aria-describedby', input2.getAttribute('id') + '-suggestions-help');
		geoAPIClearInput(input);
	}

	geoAPIZipCode.editable = function(input, initial, onComplete) {
		var id = 'geoAPIZipCode' + input.getAttribute('name');
		var input2 = document.createElement('input');
		input2.setAttribute('id', id);
		input2.setAttribute('type', 'text');
		var attributes = input.attributes;
		for (let attr of attributes) {
			if (attr.name != 'id' && attr.name != 'name' && attr.name != 'value' && attr.name != 'type') {
				input2.setAttribute(attr.name, attr.value);
			}
		}
		var label = input.parentElement.parentElement.querySelector('label[for='+ input.getAttribute('id') + ']');
		label.setAttribute('for', input2.getAttribute('id'));
		input.insertAdjacentElement('beforebegin', input2);
		input2.value = initial;
		for (let v of attributes) {
			if (v && v.name != 'name' && v.name != 'value' && v.name != 'type') {
				input.removeAttribute(v.name);
			}
		}
		input.setAttribute('type', 'hidden');

		var isSelected = false;
		input2.addEventListener("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		var suggestions = [];
		var selected = null;


		var autocomplete = new autoComplete(input2, {
			menuId: id + '-suggestions',
			helpText: Translator.trans('Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, response){
				var that = this;
				geoAPISearch (term, function (terms) { suggestions = terms; response(that, terms); });
			},
			cache: 0,
			renderItem: function (item,  search) {
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				var val = item.nom + ' (' + item.codePostal + ')';
				return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.codePostal + '" data-text="' + item.nom + '" data-insee="' + item.code + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
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
				selected = {
					value: item.dataset.value,
					text: item.dataset.text
				};
				isSelected = true;
				geoAPIRemoveError(input, input2);
			},
			onClear: function() {
				input.value = "";
				input.dispatchEvent(new Event('change'));
				geoAPIRemoveError(input, input2);
				var confirm = document.querySelector('#' + id + 'localities-confirm');
				confirm.parentNode.removeChild(confirm);
				suggestions = [];
				selected = null;
			},
			onInput: function() {
				if (selected) {
					geoAPIRemoveError(input, input2);
					var confirm = document.querySelector('#' + id + 'localities-confirm');
					confirm.parentNode.removeChild(confirm);
					suggestions = [];
					selected = null;
				}
			},
			onTab: function() {
				document.querySelector('#' + id + '-validate-button').focus();
			}

		});
 		var validateButton = document.createElement('button');
		validateButton.setAttribute('id', id + '-validate-button');
		validateButton.setAttribute('type', 'button');
		validateButton.setAttribute('class', 'btn btn-primary');
		validateButton.textContent = Translator.trans('Validate');
		input2.nextElementSibling.insertAdjacentElement('afterend', validateButton);
		validateButton.addEventListener('click', function(ev) {
			var confirm = document.querySelector('#' + id + 'localities-confirm');
			confirm.parentNode.removeChild(confirm);
			if (isSelected && selected) {
				geoAPIRemoveError(input, input2);
				onComplete(selected.value, selected.text);
				geoAPIDetectError(input, input2);
			} else {
				var inputVal = input2.value.trim();
				if (inputVal != '') {
					var found = false;
					var value = '';
					var text = '';
					var zipcode = '';
					var temp = [];
					inputVal = normalizeTerm(inputVal);
					suggestions.forEach(function(v, i) {
						var val = v.nom + ' (' + v.codePostal + ')';
						value = v.code;
						text = v.nom;
						zipcode = v.codePostal;
						if (inputVal == val || unaccent(text).toLowerCase().indexOf(unaccent(inputVal).toLowerCase()) >= 0 || inputVal == zipcode) {
							found = true;
							temp.push(v);
						}
					});
					geoAPIRemoveError(input, input2);
					switch (temp.length) {
						case 0:
							geoAPISetError(input, input2, Translator.trans("The entered value does not allow to find the information of the locality."));
							input2.focus();
							break;
						case 1:
							var val = temp[0].nom + ' (' + temp[0].codePostal + ')';
							input2.value = val;
							onComplete(temp[0].codePostal, temp[0].nom);
							geoAPIDetectError(input, input2);
							break;
						default:
							var container = document.createElement('div');
							container.setAttribute('id', id + 'localities-confirm');
							container.setAttribute('class', 'geoAPILocalities-confirm');
							var selContainer = document.createElement('div');
							selContainer.setAttribute('class', 'form-group');
							var labelContent = (/^\d+$/.test(inputVal) && inputVal.length == 5) ?
								Translator.trans("Several localities are served by the postal code entered, please specify") :
								Translator.trans("Several localities match the name entered, please specify");
							var label = document.createElement('label');
							label.setAttribute('for', id + 'localities-confirm-select');
							label.textContent = labelContent;
							selContainer.appendChild(label);
							var sel = document.createElement('select');
							sel.setAttribute('id', id + 'localities-confirm-select');
							sel.setAttribute('class', 'form-control');
							sel.setAttribute('size', '3');
							temp.forEach(function(v, i) {
								var val = v.nom + ' (' + v.codePostal + ')';
								var option = document.createElement('option');
								option.setAttribute('value', v.code);
								option.setAttribute('data-val', val);
								option.setAttribute('data-value', v.code);
								option.setAttribute('data-text', v.nom);
								option.setAttribute('data-zipcode', v.codePostal);
								option.setAttribute('text', val);
								sel.appendChild(option);
							});
							var okButton = document.createElement('button');
							okButton.setAttribute('class', 'btn btn-primary');
							okButton.textContent = Translator.trans('Ok');
							selContainer.appendChild(sel);
							container.appendChild(selContainer);
							sel.insertAdjacentElement('afterend', okButton);
							input2.parentElement.parentElement.insertAdjacentElement('afterend', container);
							okButton.addEventListener('click', function(e) {
								e.preventDefault();
								var selected = sel.querySelector('option:checked');
								if (selected.length) {
									input2.value = selected.dataset.val;
									container.parentNode.removeChild(container);
									onComplete(items[0].codePostal, items[0].nom);
									geoAPIDetectError(input, input2);
								}
							});
							sel.focus();
							break;
					}
				} else {
					input.value = "";
					input.dispatchEvent(new Event('change'));
					geoAPIDetectError(input, input2);
					input2.focus();
				}
			}
		});
	}

	function normalizeTerm(s) {
		s = s.replace(/^(le|la|les)\s*(.*)$/, '$2');
		if (/([^\s]+)\s+([^\s]+)/.test(s)) {
			s = s.replace(/\s+([^\s]+)/g, '-$1');
		}
		s = s.replace(/^st-/, 'saint-');
		s = s.replace(/^ste-/, 'sainte-');
		return s;
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

	global.geoAPIZipCode = geoAPIZipCode;
}(this));