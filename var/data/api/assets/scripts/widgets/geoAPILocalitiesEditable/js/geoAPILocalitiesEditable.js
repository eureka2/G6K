(function (global) {
	"use strict";
		
	function geoAPILocalitiesEditable (input, options, onComplete) {
		if (typeof input === "object" && input && input["jquery"]) {
			input = input[0];
		}
		var initial = input.value;
		if (/^\d{5}$/.test(initial)) {
			var codeDepartement = initial.substr(0,2);
			ajax({
				method: 'get',
				url: 'https://geo.api.gouv.fr/communes', 
				dataType: 'json',
				data: { codeDepartement: codeDepartement }, 
			}).then(function( data, xhr, textStatus ) {
				if (data.length > 0) {
					for (var d of data) {
						if (d.code == initial) {
							if (d.codesPostaux.length == 1) {
								initial = d.nom  + ' (' + d.codesPostaux[0] + ')';
							} else {
								initial = d.nom  + ' (' + codeDepartement + ')';
							}
							return false;
						}
					}
				}
			}).catch(function(response, xhr, textStatus) {
				if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
					console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
				} else {
					var result = { 'error': xhr.statusText };
					console.log(result);
				}
			}).always(function() {
				geoAPILocalitiesEditable.editable(input, initial, onComplete);
			});
		} else { 
			geoAPILocalitiesEditable.editable(input, initial, onComplete);
		}
	}

	geoAPILocalitiesEditable.editable = function(input, initial, onComplete) {
		input.style.display = 'none';
		input.setAttribute('aria-hidden', 'true');
		var holder = document.createElement('span');
		holder.setAttribute('class', 'editable-geoAPILocalities');
		holder.setAttribute('data-value', input.value);
		holder.setAttribute('data-text', initial);
		holder.setAttribute('tabindex', input.tabIndex);
		holder.textContent = initial;
		input.insertAdjacentElement('beforebegin', holder);
		input.parentElement.classList.remove('native');
		new Editable(
			holder,
			function (val, settings) {
				onComplete(this.getAttribute("data-value"), this.getAttribute("data-value"));
				return this.getAttribute("data-text");
			},
			{
				name: input.getAttribute('name'),
				id: "geoAPILocalitiesEditable-" + Math.floor(Math.random() * 100000),
				type: 'geoAPILocalitiesEditable',
				placeholder: Translator.trans("click to enter a locality or a zipcode"),
				tooltip: Translator.trans("click to edit this locality"),
				autoComplete : {
					minChars: 2,
					source: function(term, response){
						var that = this;
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
										coordinates: d.centre.coordinates
									});
								});
							});
							response(that, items); 
						}).catch(function(response, xhr, textStatus) {
							if ((xhr.status != 0 && xhr.status >= 500) || textStatus === 'timeout') {
								console.log( Translator.trans("Data to continue this simulation are not accessible. Please try again later.") );
							} else {
								var result = { 'error': xhr.statusText };
								console.log(result);
							}
						});
					},
					cache: 0,
					renderItem: function (item,  search) {
						search = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
						var re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
						var val = item.nom + ' (' + item.codePostal + ')';
						return '<div class="autocomplete-suggestion" data-val="' + val + '" data-value="' + item.code + '" data-text="' + item.nom + '" data-zipcode="' + item.codePostal + '" data-departement="' + item.departement + '" data-region="' + item.region + '" data-surface="' + item.surface + '" data-population="' + item.population + '" data-longitude="' + item.coordinates[0] + '" data-latitude="' + item.coordinates[1] + '">' +  item.nom.replace(re, "<b>$1</b>") + ' (' + item.codePostal + ')</div>'; 
					},
					onSelect: function(e, term, item){
						holder.setAttribute("data-value", item.dataset.value);
						holder.setAttribute("data-text", item.dataset.text + ' (' + item.dataset.zipcode + ')');
						if (e.type == 'mousedown') {
							var form = holder.querySelector('form');
							if (form.dispatchEvent(new Event('submit', {'cancelable': true}))) {
								form.submit();
							}
						}
					}
				},
				style: "inherit",
				onblur: function (val, settings) {
					onComplete(this.getAttribute("data-value"), this.getAttribute("data-value"));
				},
				callback: function() {
				}
			}
		);
		holder.addEventListener('keydown', function(e) {
			if (e.keyCode == 13 && e.target.tagName == 'SPAN' && /\beditable-/.test(e.target.className) ) {
				e.preventDefault();
				this.dispatchEvent(new MouseEvent('click'));
			}
		});
	}
	
	global.geoAPILocalitiesEditable = geoAPILocalitiesEditable;
}(this));