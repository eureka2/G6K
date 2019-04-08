(function (global) {
	"use strict";

	function geoAPIFromInseeCode (code, onComplete) {
		var param = {
			code: code,
			fields:'code,nom,codesPostaux,surface,population,centre,contour,departement,region'
		};
		$.getJSON(
			'https://geo.api.gouv.fr/communes', 
			param, 
			function(data) {
				var items = [];
				$.each(data, function(k, d) {
					$.each(d.codesPostaux, function(c, cp) {
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
			}
		);
	}

	function geoAPISearch (term, response) {
		try { 
			xhr.abort(); 
		} catch(e){
		}
		term = $.trim(term);
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
		$.getJSON(
			'https://geo.api.gouv.fr/communes', 
			param, 
			function(data) {
				var items = [];
				$.each(data, function(k, d) {
					$.each(d.codesPostaux, function(c, cp) {
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
			}
		);
	}

	function geoAPIClearInput(input) {
		input.removeAttr('aria-describedby');
		input.removeAttr('aria-invalid');
		input.removeAttr('class');
	}

	function geoAPISetError (input, input2, error) {
		var g6k = input.data('g6k');
		g6k.setError(input.attr('name'), error);
		input2.attr('aria-describedby', input.attr('aria-describedby'));
		geoAPIClearInput(input);
	}

	function geoAPIDetectError (input, input2) {
		if (input.attr('aria-invalid') == 'true') {
			input2.attr('aria-describedby', input.attr('aria-describedby'));
			geoAPIClearInput(input);
		}
	}

	function geoAPIRemoveError (input, input2) {
		var g6k = input.data('g6k');
		setTimeout(function () {
			g6k.removeError(input.attr('name'));
		}, 500);
		input2.attr('aria-describedby', input2.attr('id') + '-suggestions-help');
		geoAPIClearInput(input);
	}

	function geoAPILocalities (input, options, onComplete) {
		var id = 'geoAPILocalities' + input.attr('name');
		var input2 = $('<input>', { id: id, type: 'text' });
//		input2.attr('placeholder', Translator.trans('Enter a locality or a zipcode'));
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

		var isSelected = false;
		input2.bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});

		var suggestions = [];
		var selected = null;
		var validateButton = $('<button>', { id: id + '-validate-button', type: 'button', class: 'btn btn-primary', text: Translator.trans('Validate')});

		input2.autoComplete({
			menuId: id + '-suggestions',
			helpText: Translator.trans('Suggestions will be proposed when you enter. Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, response){
				geoAPISearch (term, function (terms) { suggestions = terms; response(terms); });
			},
			cache: 0,
			renderItem: function (item,  search) {
				search = search.replace(/^st[- ]/, 'saint-');
				search = search.replace(/^ste[- ]/, 'sainte-');
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				var val = item.nom + ' (' + item.codePostal + ')';
				return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.code + '" data-text="' + item.nom + '" data-zipcode="' + item.codePostal + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
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
				geoAPIFromInseeCode (item.data('value'), function(items) {
					selected = null;
					if (items.length > 0) {
						selected = {
							value: item.data('value'),
							text: item.data('text'),
							zipcode: item.data('zipcode'),
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
				$('#' + id + 'localities-confirm').remove();
				suggestions = [];
				selected = null;
			},
			onInput: function(val) {
				if (selected) {
					onComplete('', '', false, true);
					$('#' + id + 'localities-confirm').remove();
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
		input2.next().after(validateButton);
		validateButton.click(function(ev) {
			$('#' + id + 'localities-confirm').remove();
			if (isSelected && selected) {
				geoAPIRemoveError(input, input2);
				onComplete(selected.value, selected.text, false, false, selected.zipcode, selected.departement, selected.region, selected.surface, selected.population, selected.latitude, selected.longitude, selected.contour);
				geoAPIDetectError(input, input2);
			} else {
				var inputVal = $.trim(input2.val());
				if (inputVal != '') {
					var found = false;
					var value = '';
					var text = '';
					var zipcode = '';
					var temp = [];
					inputVal = normalizeTerm(inputVal);
					$.each(suggestions, function(i, v) {
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
							geoAPISetError(input, input2, Translator.trans("The entered value does not allow to find the information of the locality."));
							input2.focus();
							break;
						case 1:
							var val = temp[0].nom + ' (' + temp[0].codePostal + ')';
							input2.val(val);
							geoAPIFromInseeCode (temp[0].code, function(items) {
								if (items.length > 0) {
									onComplete(temp[0].code, temp[0].nom, false, false, temp[0].codePostal, items[0].departement, items[0].region, items[0].surface, items[0].population, items[0].latitude, items[0].longitude, items[0].contour);
									geoAPIDetectError(input, input2);
								}
							});
							break;
						default:
							var container = $('<div>', { id : id + 'localities-confirm', class: 'geoAPILocalities-confirm' });
							var selContainer = $('<div>', { class: 'form-group' });
							var label = (/^\d+$/.test(inputVal) && inputVal.length == 5) ?
								Translator.trans("Several localities are served by the postal code entered, please specify") :
								Translator.trans("Several localities match the name entered, please specify");
							selContainer.append($('<label>', { 'for': id + 'localities-confirm-select', 'text': label }));
							var sel = $('<select>', { id: id + 'localities-confirm-select', 'class': 'form-control' });
							sel.attr('size', 3);
							$.each(temp, function(i, v) {
								var val = v.nom + ' (' + v.codePostal + ')';
								sel.append($('<option>', { value: v.code, 'data-val': val, 'data-value': v.code, 'data-text': v.nom, 'data-zipcode': v.codePostal, 'text' : val}));
							});
							var okButton = $('<button>', {'class': 'btn btn-primary', 'text': Translator.trans("Ok") });
							selContainer.append(sel);
							container.append(selContainer);
							sel.after(okButton);
							input2.parent().parent().after(container);
							okButton.click(function(e) {
								e.preventDefault();
								var selected = sel.find('option:selected');
								if (selected.length) {
									input2.val(selected.attr('data-val'));
									container.remove();
									geoAPIFromInseeCode (selected.attr('data-value'), function(items) {
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
		});
		
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