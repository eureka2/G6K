(function (global) {
	"use strict";

	function geoAPILocalities (input, options, onComplete) {
		var g6k = this;

		var geoAPIFromInseeCode = function(code, onComplete) {
			var param = {
				code: code,
				fields:'code,nom,codesPostaux,surface,population,centre,contour,departement,region'
			};
			ajax({
				method: 'get',
				url: 'https://geo.api.gouv.fr/communes',
				dataType: 'json',
				data: param,
			}).then(function( data, xhr, textStatus ) {
				var items = [];
				data.forEach( d => {
					d.codesPostaux.forEach( cp => {
						items.push({
							code: d.code,
							nom: d.nom,
							codePostal: cp,
							departement: d.departement.nom,
							region: d.region.nom,
							surface: d.surface,
							population: d.population,
							longitude: d.centre.coordinates[0],
							latitude: d.centre.coordinates[1],
							contour: d.contour.coordinates[0]
						});
					});
				});
				onComplete(items); 
			}).catch(function(response, xhr, textStatus) {
				if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
					console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
				} else {
					var result = { 'error': xhr.statusText };
					console.log(result);
				}
			});
		}

		var geoAPISearch = function(term, response) {
			try { 
				xhr.abort(); 
			} catch(e){
			}
			term = term.trim();
			term = normalizeTerm(term);
			var param = { nom: term };
			var cpParam = false;
			if (/^\d+$/.test(term)) {
				if (term.length == 5) {
					param = { codePostal: term };
					cpParam = true;
				} else if (term.length == 2 || (term.length == 3 && /^9[7-8]\d+$/.test(term))){
					param = { codeDepartement: term };
				}
			} else if (term == '2A' || term == '2B') {
				param = { codeDepartement: term };
			} else if (term.length < 2) {
				response([]);
				return;
			}
			param['fields'] = 'code,nom,codesPostaux';
			ajax({
				method: 'get',
				url: 'https://geo.api.gouv.fr/communes',
				dataType: 'json',
				data: param,
			}).then(function( data, xhr, textStatus ) {
				var items = [];
				data.forEach( d => {
					d.codesPostaux.forEach( cp => {
						if (!cpParam || cp == term) {
							items.push({
								code: d.code,
								nom: d.nom,
								codePostal: cp
							});
						}
					});
				});
				items.sort(function(a, b) {
					a = unaccent(a.nom).toLowerCase();
					b = unaccent(b.nom).toLowerCase();
					if (a == b) {
						return 0;
					}
					if (a > b) {
						return 1;
					}
					return -1;
				});
				response(items); 
			}).catch(function(response, xhr, textStatus) {
				if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
					console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
				} else {
					var result = { 'error': xhr.statusText };
					console.log(result);
				}
			});
		}

		var geoAPIClearInput = function(input) {
			input.removeAttribute('aria-describedby');
			input.removeAttribute('aria-invalid');
			input.removeAttribute('class');
		}

		var geoAPISetError = function(input, input2, error) {
			g6k.setError(input.getAttribute('name'), error);
			input2.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
			geoAPIClearInput(input);
		}

		var geoAPIDetectError = function(input, input2) {
			if (input.getAttribute('aria-invalid') == 'true') {
				input2.setAttribute('aria-describedby', input.getAttribute('aria-describedby'));
				geoAPIClearInput(input);
			}
		}

		var geoAPIRemoveError = function(input, input2) {
			setTimeout(function () {
				g6k.removeError(input.getAttribute('name'));
			}, 500);
			input2.setAttribute('aria-describedby', input2.getAttribute('id') + '-suggestions-help');
			geoAPIClearInput(input);
		}


		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		var id = 'geoAPILocalities' + input.getAttribute('name');
		var input2 = document.createElement('input');
		input2.id = id;
		input2.type = 'text';
//		input2.setAttribute('placeholder', Translator.trans('Enter a locality or a zipcode', {}, 'geoapilocalities'));
		var attributes = input.attributes;
		for (var i = attributes.length - 1; i >= 0; i--) {
			var attr = attributes[i];
			if (attr.name != 'id' && attr.name != 'name' && attr.name != 'value' && attr.name != 'type' && attr.name != 'data-widget') {
				input2.setAttribute(attr.name, attr.value);
			}
		}
		var label = input.parentElement.parentElement.querySelector("label[for='" + input.id + "']");
		label.setAttribute('for', input2.id);
		input.parentElement.insertBefore(input2, input);
		for (var i = attributes.length - 1; i >= 0; i--) {
			var v = attributes[i];
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
		var validateButton = document.createElement('button');
		validateButton.setAttribute('id', id + '-validate-button');
		validateButton.setAttribute('type', 'button');
		validateButton.classList.add('btn-primary');
		validateButton.innerText = Translator.trans('Validate', {}, 'geoapilocalities');

		var autocomplete = new autoComplete(input2, {
			menuId: id + '-suggestions',
			helpText: Translator.trans('Suggestions will be proposed when you enter. Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.', {}, 'geoapilocalities'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field', {}, 'geoapilocalities'),
			source: function(term, response){
				geoAPISearch (term, function (terms) { suggestions = terms; response(autocomplete, terms); });
			},
			cache: 0,
			renderItem: function (item,  search) {
				search = search.replace(/^st[- ]/, 'saint-');
				search = search.replace(/^ste[- ]/, 'sainte-');
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				var val = item.nom + ' (' + item.codePostal + ')';
				return '<div data-val="' + val + '" data-value="' + item.code + '" data-text="' + item.nom + '" data-zipcode="' + item.codePostal + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
			},
			announce: function( count) {
			   switch (count) {
					case 0:
						return Translator.trans('There is no suggestion', {}, 'geoapilocalities');
					case 1:
						return Translator.trans('There is one suggestion', {}, 'geoapilocalities');
					default:
						return Translator.trans('There are %count% suggestions, use up and down arrows to review.', { 'count': count }, 'geoapilocalities') ;
			   }
			},
			onSelect: function(e, term, item){
				geoAPIFromInseeCode (item.dataset.value, function(items) {
					selected = null;
					if (items.length > 0) {
						selected = {
							value: item.dataset.value,
							text: item.dataset.text,
							zipcode: item.dataset.zipcode,
							departement: items[0].departement,
							region: items[0].region,
							surface: items[0].surface,
							population: items[0].population,
							latitude: items[0].latitude,
							longitude: items[0].longitude,
							contour: items[0].contour
						};
						isSelected = true;
						geoAPIRemoveError(input, input2);
					}
				});
			},
			onClear: function() {
				onComplete('', '', false, true);
				geoAPIRemoveError(input, input2);
				var confirm = document.querySelector('#' + id + 'localities-confirm');
				if (confirm !== null) {
					confirm.parentElement.removeChild(confirm);
				}
				suggestions = [];
				selected = null;
			},
			onInput: function(val) {
				if (selected) {
					onComplete('', '', false, true);
					var confirm = document.querySelector('#' + id + 'localities-confirm');
					if (confirm !== null) {
						confirm.parentElement.removeChild(confirm);
					}
					suggestions = [];
					selected = null;
				} else if (val.length < 2) {
					onComplete('', '', false, true);
				}
				geoAPIRemoveError(input, input2);
			},
			onTab: function() {
				// nothing todo
			}

		});
		var next = input2.nextElementSibling;
		if (next.nextElementSibling === null) {
			next.parentElement.appendChild(validateButton);
		} else {
			next.nextElementSibling.parentElement.appendChild(validateButton, next.nextElementSibling);
		}
		validateButton.addEventListener('click', function(event) {
			validate(event);
		});
		validateButton.addEventListener('keydown', function(event) {
			var key = event.which || event.keyCode;
			if (key == 13 || key == 32) { // enter or space
				validate(event);
			}
		});

		var validate = function(event){
			var confirm = document.querySelector('#' + id + 'localities-confirm');
			if (confirm !== null) {
				confirm.parentElement.removeChild(confirm);
			}
			if (isSelected && selected) {
				geoAPIRemoveError(input, input2);
				onComplete(selected.value, selected.text, false, false, selected.zipcode, selected.departement, selected.region, selected.surface, selected.population, selected.latitude, selected.longitude, selected.contour);
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
					suggestions.forEach( v => {
						var val = v.nom + ' (' + v.codePostal + ')';
						value = v.code;
						text = normalizeTerm(v.nom);
						zipcode = v.codePostal;
						if (unaccent(text).toLowerCase() == unaccent(inputVal).toLowerCase() || inputVal == zipcode) {
							found = true;
							temp.push(v);
						}
					});
					switch (temp.length) {
						case 0:
							geoAPISetError(input, input2, Translator.trans("The entered value does not allow to find the information of the locality.", {}, 'geoapilocalities'));
							input2.focus();
							break;
						case 1:
							var val = temp[0].nom + ' (' + temp[0].codePostal + ')';
							input2.value = val;
							geoAPIFromInseeCode (temp[0].code, function(items) {
								if (items.length > 0) {
									onComplete(temp[0].code, temp[0].nom, false, false, temp[0].codePostal, items[0].departement, items[0].region, items[0].surface, items[0].population, items[0].latitude, items[0].longitude, items[0].contour);
									geoAPIDetectError(input, input2);
								}
							});
							break;
						default:
							var container = document.createElement('div');
							container.setAttribute('id', id + 'localities-confirm');
							container.classList.add('geoAPILocalities-confirm');
							var selContainer = document.createElement('div');
							selContainer.classList.add('form-group');
							var label = (/^\d+$/.test(inputVal) && inputVal.length == 5) ?
								Translator.trans("Several localities are served by the postal code entered, please specify", {}, 'geoapilocalities') :
								Translator.trans("Several localities match the name entered, please specify", {}, 'geoapilocalities');
							var labelElt = document.createElement('label');
							labelElt.setAttribute('for', id + 'localities-confirm-select');
							labelElt.innerText = label;
							selContainer.appendChild(labelElt);
							var sel = document.createElement('select');
							sel.setAttribute('id', id + 'localities-confirm-select');
							sel.classList.add('form-control');
							sel.setAttribute('size', 3);
							temp.forEach( v => {
								var val = v.nom + ' (' + v.codePostal + ')';
								sel.append($('<option>', { value: v.code, 'data-val': val, 'data-value': v.code, 'data-text': v.nom, 'data-zipcode': v.codePostal, 'text' : val}));
							});
							var okButton = document.createElement('button');
							okButton.classList.add('btn', 'btn-primary');
							okButton.innerText = Translator.trans("Ok");
							selContainer.appendChild(sel);
							container.appendChild(selContainer);
							var next = sel.nextElementSibling;
							if (next === null) {
								sel.parentElement.appendChild(okButton);
							} else {
								next.parentElement.insertBefore(okButton, next);
							}
							var grandparent = input2.parentElement.parentElement;
							next = grandparent.nextElementSibling;
							if (next === null) {
								grandparent.parentElement.appendChild(container);
							} else {
								next.parentElement.insertBefore(container, next);
							}
							okButton.addEventListener('click', function(e) {
								e.preventDefault();
								var selected = sel.find('option:selected');
								if (selected.length) {
									input2.val(selected.getAttribute('data-val'));
									container.remove();
									geoAPIFromInseeCode (selected.getAttribute('data-value'), function(items) {
										if (items.length > 0) {
											onComplete(items[0].code, items[0].nom, false, false, items[0].codePostal, items[0].departement, items[0].region, items[0].surface, items[0].population, items[0].latitude, items[0].longitude, items[0].contour);
											geoAPIDetectError(input, input2);
										}
									});
								}
							});
							sel.focus();
							break;
					}
				} else {
					onComplete('', '', false, true);
					geoAPIDetectError(input, input2);
					input2.focus();
				}
			}
		}
	}

	function normalizeTerm(s) {
		s = s.replace(/^(le|la|les)\s+(.*)$/i, '$2');
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
	
	global.geoAPILocalities = geoAPILocalities;
}(this));