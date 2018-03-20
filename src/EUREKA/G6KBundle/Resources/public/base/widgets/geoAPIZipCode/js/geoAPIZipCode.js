(function (global) {
	"use strict";

	function geoAPIZipCode (input, onComplete) {
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
				geoAPIZipCode.editable(input, initial, onComplete);
			});
		} else { 
			geoAPIZipCode.editable(input, initial, onComplete);
		}
	}

	geoAPIZipCode.editable = function(input, initial, onComplete) {
		var id = 'geoAPIZipCode' + input.attr('name');
		var input2 = $('<input>', { id: id, type: 'text' });
		var attributes = input.prop("attributes");
		$.each(attributes, function() {
			if (this.name != 'id' && this.name != 'name' && this.name != 'value' && this.name != 'type') {
				input2.attr(this.name, this.value);
			}
		});
		input2.attr('aria-owns', id + '-suggestions');
		var label = input.parent().parent().find('label[for='+ input.attr('id') + ']');
		label.attr('for', input2.attr('id'));
		input.hide();
		input.attr('tabindex', '-1');
		input.attr('aria-hidden', 'true');
		input.before(input2);
		input2.val(initial);

		input2.bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		input2.autoComplete({
			menuId: id + '-suggestions',
			menuRole: 'listbox',
			helpText: Translator.trans('Use the up or down key to access and browse suggestions after entering. Confirm your choice with the Enter key, or the Esc key to close the suggestion box.'),
			minChars: 2,
			clearButton: Translator.trans('Clear this field'),
			source: function(term, response){
				try { 
					xhr.abort(); 
				} catch(e){
				}
				term = $.trim(term);
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
			},
			cache: 0,
			renderItem: function (item,  search) {
				search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
				var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
				var val = item.nom + ' (' + item.codePostal + ')';
				return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.codePostal + '" data-text="' + item.nom + '" data-insee="' + item.code + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
			},
			onSelect: function(e, term, item){
				onComplete(item.data('value'), item.data('text'));
			}
		});
 	}
	global.geoAPIZipCode = geoAPIZipCode;
}(this));