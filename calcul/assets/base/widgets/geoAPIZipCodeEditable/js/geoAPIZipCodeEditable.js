(function (global) {
	"use strict";
		
	function geoAPIZipCodeEditable (input, options, onComplete) {
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
				geoAPIZipCodeEditable.editable(input, initial, onComplete);
			});
		} else { 
			geoAPIZipCodeEditable.editable(input, initial, onComplete);
		}
	}

	geoAPIZipCodeEditable.editable = function(input, initial, onComplete) {
		input.hide();
		input.attr('aria-hidden', 'true');
		var holder = $('<span>', { 'class': 'editable-geoAPIZipCode', 'data-value': input.val(), text: initial, 'data-text': initial, 'tabindex': input.prop('tabIndex') });
		input.before(holder);
		holder.editable(
			function (val, settings) {
				onComplete($(this).attr("data-value"), $(this).attr("data-value"));
				return $(this).attr("data-text");
			},
			{
				name: input.attr('name'),
				id: "geoAPIZipCodeEditable-" + Math.floor(Math.random() * 100000),
				type: 'geoAPIZipCodeEditable',
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
						return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.codePostal + '" data-text="' + item.nom + '" data-insee="' + item.code + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
					},
					onSelect: function(e, term, item){
						holder.attr("data-value", item.data('value'));
						holder.attr("data-text", item.data('text') + ' (' + item.data('value') + ')');
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
	
	global.geoAPIZipCodeEditable = geoAPIZipCodeEditable;
}(this));