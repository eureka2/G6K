(function (global) {
	"use strict";
		
	function geoAPILocalitiesEditable (input, options, onComplete) {
		var initial = input.val();
		if (/^\d{5}$/.test(initial)) {
			var codeDepartement = initial.substr(0,2);
			$.getJSON(
				'https://geo.api.gouv.fr/communes', 
				{ codeDepartement: codeDepartement }, 
				function(data) {
					if (data.length > 0) {
						$.each(data, function(k, d) {
							if (d.code == initial) {
								if (d.codesPostaux.length == 1) {
									initial = d.nom  + ' (' + d.codesPostaux[0] + ')';
								} else {
									initial = d.nom  + ' (' + codeDepartement + ')';
								}
								return false;
							}
						});
					}
				}
			).fail(function() {
			}).always(function() {
				geoAPILocalitiesEditable.editable(input, initial, onComplete);
			});
		} else { 
			geoAPILocalitiesEditable.editable(input, initial, onComplete);
		}
	}

	geoAPILocalitiesEditable.editable = function(input, initial, onComplete) {
		input.hide();
		input.attr('aria-hidden', 'true');
		var holder = $('<span>', { 'class': 'editable-geoAPILocalities', 'data-value': input.val(), text: initial, 'data-text': initial, 'tabindex': input.prop('tabIndex') });
		input.before(holder);
		holder.editable(
			function (val, settings) {
				onComplete($(this).attr("data-value"), $(this).attr("data-value"));
				return $(this).attr("data-text");
			},
			{
				name: input.attr('name'),
				id: "geoAPILocalitiesEditable-" + Math.floor(Math.random() * 100000),
				type: 'geoAPILocalitiesEditable',
				placeholder: Translator.trans("click to enter a locality or a zipcode"),
				tooltip: Translator.trans("click to edit this locality"),
				autoComplete : {
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
						return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.code + '" data-text="' + item.nom + '" data-zipcode="' + item.codePostal + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
					},
					onSelect: function(e, term, item){
						holder.attr("data-value", item.data('value'));
						holder.attr("data-text", item.data('text') + ' (' + item.data('zipcode') + ')');
						if (e.type == 'mousedown') {
							holder.find('form').submit();
						}
					}
				},
				style: "inherit",
				callback: function() {
				}
			}
		);
		holder.keydown(function(e) {
			if (e.keyCode == 13 && e.target.tagName == 'SPAN' && /\beditable-/.test(e.target.className) ) {
				e.preventDefault();
				$(this).trigger('click');
			}
		});
	}
	
	global.geoAPILocalitiesEditable = geoAPILocalitiesEditable;
}(this));