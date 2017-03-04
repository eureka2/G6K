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
		var input2 = $('<input>', {id: 'geoAPIZipCode' + input.attr('name'), type: 'text', tabindex: 0 });
		var attributes = input.prop("attributes");
		$.each(attributes, function() {
			if (this.name != 'id' && this.name != 'name' && this.name != 'value' && this.name != 'type') {
				input2.attr(this.name, this.value);
			}
		});
		input.hide();
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
									codePostal: cp
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
				return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.codePostal + '" data-text="' + item.nom + '" data-insee="' + item.code + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
			},
			onSelect: function(e, term, item){
				// input2.val(item.data('text') + ' (' + item.data('value') + ')');
				onComplete(item.data('value'), item.data('text'));
			}
		});
 	}
	global.geoAPIZipCode = geoAPIZipCode;
}(this));