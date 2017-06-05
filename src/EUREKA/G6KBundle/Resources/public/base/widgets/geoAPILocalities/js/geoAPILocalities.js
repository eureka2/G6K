(function (global) {
	"use strict";
		
	function geoAPILocalities (input, onComplete) {
		var input2 = $('<input>', {id: 'geoAPILocalities' + input.attr('name'), type: 'text', tabindex: 0 });
		input2.attr('placeholder', Translator.trans('Enter a locality or a zipcode'));
		var attributes = input.prop("attributes");
		$.each(attributes, function() {
			if (this.name != 'id' && this.name != 'name' && this.name != 'value' && this.name != 'type' && this.name != 'data-widget') {
				input2.attr(this.name, this.value);
			}
		});
		input.hide();
		input.attr('aria-hidden', 'true');
		input.before(input2);
		input2.bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				event.stopPropagation();
			}
		});
		input2.autoComplete({
			minChars: 2,
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
				}
				param['fields'] = 'code,nom,codesPostaux,surface,population,centre,contour,departement,region';
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
										codePostal: cp,
										departement: d.departement.nom,
										region: d.region.nom,
										surface: d.surface,
										population: d.population,
										coordinates: d.centre.coordinates,
										contour: d.contour.coordinates[0]
									});
								}
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
				return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.code + '" data-text="' + item.nom + '" data-zipcode="' + item.codePostal + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '" data-contour="' + JSON.stringify(item.contour) + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
			},
			onSelect: function(e, term, item){
				// input2.val(item.data('text') + ' (' + item.data('zipcode') + ')');
				onComplete(item.data('value'), item.data('text'), item.data('zipcode'), item.data('departement'), item.data('region'), item.data('surface'), item.data('population'), item.data('latitude'), item.data('longitude'), item.data('contour'));
			}
		});
		
 	}
	global.geoAPILocalities = geoAPILocalities;
}(this));