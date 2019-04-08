(function (global) {
	"use strict";


	var allowedKeys = [8, 9, 27, 35, 36, 37, 39, 46, 48, 49, 50, 51,52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

	function geoAPICoupledZipCode (input, options, onComplete) {
		var originaltype = input.attr('type');
		input.attr('type', 'text');
		var input2 = geoAPICoupledInput(input);
		if (input2 !== false) {
			input.attr('minlength', 5);
			input.attr('maxlength', 5);
			input2.attr('readonly', true);
			input2.attr('tabindex', -1);
			var initial = input.val();
			if (/^\d{5}$/.test(initial)) {
				$.getJSON(
					'https://geo.api.gouv.fr/communes', 
					{ codePostal: initial }, 
					function(data) {
						if (data.length > 0) {
							var communes = [];
							$.each(data, function(k, d) {
								$.each(d.codesPostaux, function(c, cp) {
									if (cp == initial) {
										communes.push(d.nom  + ' (' + cp + ')');
									}
								});
							});
							initial = communes.join(' ' + Translator.trans('or') + ' ');
						}
					}
				).fail(function() {
				}).always(function() {
					geoAPICoupledZipCode.editable(input, input2, initial, onComplete);
				});
			} else { 
				geoAPICoupledZipCode.editable(input, input2, initial, onComplete);
			}
		} else if (originaltype != 'text') {
			input.attr('type', originaltype);
		}
	}

	function geoAPICoupledInput(input) {
		var fields = input.closest('form').find('input[type=text]');
		var index = fields.index( input[0] );
		if ( index > -1 && ( index + 1 ) < fields.length ) {
			return fields.eq( index + 1 );
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
							coordinates: d.centre.coordinates
						});
					});
				});
				response(items); 
			}
		);
	}

	function geoAPIClearInput(input) {
		input.removeAttr('aria-describedby');
		input.removeAttr('aria-invalid');
	}

	function geoAPISetError (input, error) {
		var g6k = input.data('g6k');
		g6k.setError(input.attr('name'), error);
		geoAPIClearInput(input);
	}

	function geoAPIDetectError (input) {
		if (input.attr('aria-invalid') == 'true') {
			geoAPIClearInput(input);
		}
	}

	function geoAPIRemoveError (input) {
		var g6k = input.data('g6k');
		setTimeout(function () {
			if (input.val() != '') {
				g6k.removeError(input.attr('name'));
			}
		}, 500);
		input.attr('aria-describedby', input.attr('id') + '-suggestions-help');
		geoAPIClearInput(input);
	}

	geoAPICoupledZipCode.editable = function(input1, input2, initial, onComplete) {
		if (!input1[0].hasAttribute('id')) {
			 input1.attr('id', 'geoAPICoupledZipCode' + input1.attr('name'));
		}

		var suggestions = [];
		var selected = null;
		var isSelected = false;
		input1.on("keydown", function(event) {
			var key = event.which || event.keyCode;
			if (allowedKeys.indexOf(key) < 0) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		input1.on("blur", function(event) {
			if (selected == null) {
				var g6k = input1.data('g6k');
				if (input1.val().length > 0) {
					if (input1.val().length < 5) {
						geoAPISetError (input1, Translator.trans('This value is not in the expected format'));
					} else {
						geoAPISetError (input1, Translator.trans('No town match this zipcode'));
					}
				}
				input2.val("");
				g6k.triggerChange(input2, true, false);
			}
		});

		input1.autoComplete({
			menuId: input1.attr('id') + '-suggestions',
			helpText: Translator.trans('Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, response){
				geoAPISearch (term, function (terms) { suggestions = terms; response(terms); });
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
					value: item.data('value'),
					text: item.data('text')
				};
				onComplete && onComplete(selected.value, selected.value, true);
				input2.val(selected.text);
				input2.trigger("change");
				isSelected = true;
				geoAPIRemoveError(input1);
			},
			onClear: function() {
				input1.val("");
				input1.trigger("change");
				input2.val("");
				input2.trigger("change");
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