(function (global) {
	"use strict";

	var allowedKeys = [8, 9, 27, 35, 36, 37, 39, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];
	var g6k;

	function geoAPICoupledZipCode (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			g6k = input.data('g6k');
			input = input[0];
		} else {
			g6k = this;
		}
		var originaltype = input.getAttribute('type');
		input.setAttribute('type', 'text');
		var input2 = geoAPICoupledInput(input);
		if (input2 !== false) {
			input.setAttribute('minlength', 5);
			input.setAttribute('maxlength', 5);
			input2.setAttribute('readonly', true);
			input2.setAttribute('tabindex', -1);
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
					geoAPICoupledZipCode.editable(input, input2, initial, onComplete);
				});
			} else { 
				geoAPICoupledZipCode.editable(input, input2, initial, onComplete);
			}
		} else if (originaltype != 'text') {
			input.setAttribute('type', originaltype);
		}
	}

	function geoAPICoupledInput(input) {
		var fields = input.closest('form').querySelectorAll('input[type=text]');
		var len = fields.length, index = -1;
		for (var i = 0; i < len; i++) {
			if (fields[i] === input) {
				index = i;
				break;
			}
		}
		if ( index > -1 && ( index + 1 ) < fields.length ) {
			return fields[index + 1];
		}
		return false;
	}

	function geoAPISearch (term, response) {
		try { 
			xhr.abort(); 
		} catch(e){
		}
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
		}).catch(function(response, xhr, textStatus) {
			if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
				console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
			} else {
				var result = { 'error': xhr.statusText };
				console.log(result);
			}
		});
	}

	function geoAPIClearInput(input) {
		input.removeAttribute('aria-describedby');
		input.removeAttribute('aria-invalid');
	}

	function geoAPISetError (input, error) {
		g6k.setError(input.getAttribute('name'), error);
		geoAPIClearInput(input);
	}

	function geoAPIDetectError (input) {
		if (input.getAttribute('aria-invalid') == 'true') {
			geoAPIClearInput(input);
		}
	}

	function geoAPIRemoveError (input) {
		setTimeout(function () {
			if (input.value != '') {
				g6k.removeError(input.getAttribute('name'));
			}
		}, 500);
		input.setAttribute('aria-describedby', input.getAttribute('id') + '-suggestions-help');
		geoAPIClearInput(input);
	}

	geoAPICoupledZipCode.editable = function(input1, input2, initial, onComplete) {
		if (!input1.hasAttribute('id')) {
			 input1.setAttribute('id', 'geoAPICoupledZipCode' + input1.getAttribute('name'));
		}

		var suggestions = [];
		var selected = null;
		var isSelected = false;
		input1.addEventListener("keydown", function(event) {
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		input1.addEventListener("blur", function(event) {
			if (selected == null) {
				if (input1.value.length > 0) {
					if (input1.value.length < 5) {
						geoAPISetError (input1, Translator.trans('This value is not in the expected format'));
					} else {
						geoAPISetError (input1, Translator.trans('No town match this zipcode'));
					}
				}
				input2.value = "";
				g6k.triggerChange(input2, true, false);
			}
		});

		var autocomplete = new autoComplete(input1, {
			menuId: input1.getAttribute('id') + '-suggestions',
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
				return '<div class="autocomplete-suggestion" data-val="' + item.codePostal + '" data-value="' + item.codePostal + '" data-text="' + item.nom + '" data-insee="' + item.code + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
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
				onComplete && onComplete(selected.value, selected.value, true);
				input2.value = selected.text;
				input2.dispatchEvent(new Event('change'));
				isSelected = true;
				geoAPIRemoveError(input1);
			},
			onClear: function() {
				input1.value = "";
				input1.dispatchEvent(new Event('change'));
				input2.value = "";
				input2.dispatchEvent(new Event('change'));
				geoAPIRemoveError(input1);
				suggestions = [];
				selected = null;
			},
			onInput: function() {
				if (selected) {
					suggestions = [];
					selected = null;
				}
				geoAPIRemoveError(input1);
			},
			onTab: function() {
			}

		});
	}

	global.geoAPICoupledZipCode = geoAPICoupledZipCode;
}(this));