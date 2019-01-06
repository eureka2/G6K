(function (global) {
	"use strict";

	function geoAPIMaps(input, options, onComplete) {
		var cities = L.layerGroup();
		var baseLayers = {};
		// baseLayers['Stamen watercoler'] = L.tileLayer.provider('Stamen.Watercolor');
		baseLayers['Mapbox light'] = L.tileLayer.provider('MapBox', {id: 'mapbox.light', accessToken: 'pk.eyJ1IjoiZXVyZWthMiIsImEiOiJjajMzMGVudXgwMDB4MnhvN3cwMGN0ODZkIn0.nPoEWxu9cRWzLsEc--Q90A'});
		baseLayers['Mapbox streets'] = L.tileLayer.provider('MapBox', {id: 'mapbox.streets', accessToken: 'pk.eyJ1IjoiZXVyZWthMiIsImEiOiJjajMzMGVudXgwMDB4MnhvN3cwMGN0ODZkIn0.nPoEWxu9cRWzLsEc--Q90A'});
		baseLayers['OpenStreetMap France'] = L.tileLayer.provider('OpenStreetMap.France');
		// baseLayers['OpenStreetMap HOT'] = L.tileLayer.provider('OpenStreetMap.HOT');
		// baseLayers['OpenStreetMap Mapnik'] = L.tileLayer.provider('OpenStreetMap.Mapnik');
		// baseLayers['OpenStreetMap BlackAndWhite'] = L.tileLayer.provider('OpenStreetMap.BlackAndWhite');
		// baseLayers['OpenStreetMap DE'] = L.tileLayer.provider('OpenStreetMap.DE');
		// baseLayers['OpenTopoMap'] = L.tileLayer.provider('OpenTopoMap');
		baseLayers['IGN Geoportail'] = L.tileLayer.provider('IGNGeoPortail', { layer: 'GEOGRAPHICALGRIDSYSTEMS.PLANIGN', apiKey: 'jhyvi0fgmnuxvfv0zjzorvdn'});
	//	baseLayers['Google streets'] = L.tileLayer.provider('GoogleStreets');
		baseLayers['Google streets'] = L.gridLayer.googleMutant({type: 'roadmap'});

		var anch = input.parent('label');
		if (! anch.length) {
			anch = input;
		}
		if ("geolocation" in navigator) {
			var geoloc = $('<div></div>', { id: 'geoAPIMaps' + input.attr('name') + '-geoloc', class: 'geoAPIMaps-geoloc' } );
			var geolocIcon = $('<button></button>', { class: 'geoAPIMaps-gps', title: Translator.trans('Click for geolocation') } );
			var geolocMess = $('<span></span>', { class: 'geoAPIMaps-message' } );
			geoloc.append(geolocIcon);
			geoloc.append(geolocMess);
			anch.after(geoloc);
			geoloc.on('click', function (e) {
				e.preventDefault();
				geolocIcon.removeClass('geoAPIMaps-gps').addClass('geoAPIMaps-loading');
				geolocMess.removeClass('has-error').removeClass('has-warning');
				geolocMess.html(Translator.trans('Geolocation in progress'));
				navigator.geolocation.getCurrentPosition(function(position) {
					geoAPICoordinates (position.coords.latitude, position.coords.longitude, function (data) {
						if (contourPolygon) {
							map.removeLayer(contourPolygon);
						}
						contourPolygon = geoAPIContour(data.contour.coordinates[0], map);
						$('#geoAPILocalities' + input.attr('name')).val(data.nom + ' (' + data.codesPostaux[0] + ')');
						input.val(data.code);
						var latitude = position.coords.latitude, longitude = position.coords.longitude;
						geoAPIMarkerContent(data.nom + ' (' + data.codesPostaux[0] + ')', data.departement.nom, data.region.nom, data.surface, data.population, function(icon, content) {
							cities.clearLayers();
							L.marker([latitude, longitude], {icon: icon}).bindPopup(content).addTo(cities).openPopup();
							map.panTo([latitude, longitude]);
						});
						onComplete(data.code, data.nom + ' (' + data.codesPostaux[0] + ')');
						geolocIcon.removeClass('geoAPIMaps-loading').addClass('geoAPIMaps-gps');
						geolocMess.html("");
					});
				}, function(error) {
					var info = Translator.trans("Geolocation") + " : ";
					switch(error.code) {
						case error.TIMEOUT:
							geolocMess.addClass('has-error');
							info += Translator.trans("Timeout !");
							break;
						case error.PERMISSION_DENIED:
							geolocMess.addClass('has-warning');
							info += Translator.trans("You did not give permission");
							break;
						case error.POSITION_UNAVAILABLE:
							geolocMess.addClass('has-error');
							info += Translator.trans("The position could not be determined");
							break;
						case error.UNKNOWN_ERROR:
							geolocMess.addClass('has-error');
							info += Translator.trans("Unknown error");
							break;
					}
					geolocIcon.removeClass('geoAPIMaps-loading').addClass('geoAPIMaps-gps');
					geolocMess.html(info);
				});
			});
			anch = geoloc;
		}
		var mapDiv = $('<div></div>', { id: 'geoAPIMaps' + input.attr('name') + '-map', class: 'geoAPIMaps-map', title: Translator.trans('Click to select the city') } );
		anch.after(mapDiv);
		var map = L.map('geoAPIMaps' + input.attr('name') + '-map', {
			center: [48.84495371275856, 2.3760858842364394], // Paris
			zoom: 11, 
			layers:  [baseLayers['OpenStreetMap France'], cities]
		});
		
		var overlays = {
			"Villes": cities
		};
	
		L.control.layers(baseLayers, overlays).addTo(map);
		L.control.scale().addTo(map);

		var contourPolygon;

		var popup = L.popup();
		map.on('click', function (e) {
			geoAPICoordinates (e.latlng.lat, e.latlng.lng, function (data) {
				if (contourPolygon) {
					map.removeLayer(contourPolygon);
				}
				contourPolygon = geoAPIContour(data.contour.coordinates[0], map);
				$('#geoAPILocalities' + input.attr('name')).val(data.nom + ' (' + data.codesPostaux[0] + ')');
				input.val(data.code);
				var latitude = data.centre.coordinates[1], longitude = data.centre.coordinates[0];
				geoAPIMarkerContent(data.nom + ' (' + data.codesPostaux[0] + ')', data.departement.nom, data.region.nom, data.surface, data.population, function(icon, content) {
					cities.clearLayers();
					L.marker([latitude, longitude], {icon: icon}).bindPopup(content).addTo(cities).openPopup();
					map.panTo([latitude, longitude]);
				});
				onComplete(data.code, data.nom + ' (' + data.codesPostaux[0] + ')');
			});
		});

		geoAPILocalities (input, options, function (insee, name, preserveVal, zipcode, departement, region, surface, population, latitude, longitude, contour) {
			if (contourPolygon) {
				map.removeLayer(contourPolygon);
			}
			contourPolygon = geoAPIContour(contour, map);
			geoAPIMarkerContent(name + ' (' + zipcode + ')', departement, region, surface, population, function(icon, content) {
				cities.clearLayers();
				L.marker([latitude, longitude], {icon: icon}).bindPopup(content).addTo(cities).openPopup();
				map.panTo([latitude, longitude]);
			});
			onComplete(insee, name + ' (' + zipcode + ')');
		});
		
	}

	function geoAPICoordinates (latitude, longitude, onComplete) {
		var param = { lat: latitude, lon: longitude };
		param['fields'] = 'code,nom,codesPostaux,surface,population,centre,contour,departement,region';
		$.getJSON(
			'https://geo.api.gouv.fr/communes', 
			param, 
			function(data) {
				onComplete(data[0]);
			}
		);
	}

	function geoAPIMarkerContent (name, departement, region, surface, population, onComplete) {
		var content = '<b>' + name + '</b>';
		content += '<br>' + Translator.trans('Department') + ' : ' + departement;
		content += '<br>' + Translator.trans('Region') + ' : ' + region;
		content += '<br>' + Translator.trans('Population') + ' : ' + population.toLocaleString() + ' habitants';
		content += '<br>' + Translator.trans('Surface') + ' : ' + surface + ' ha';
		var icon = new L.Icon.Default;
		onComplete(icon, content);
	}

	function geoAPIContour(coordinates, map) {
		var latLngs = [];
		for (var i = 0; i < coordinates.length; i++) {
			latLngs.push(new L.LatLng(coordinates[i][1], coordinates[i][0]));
		}
		var polygon = L.polygon(latLngs, {color: 'maroon'}).addTo(map);
		// map.fitBounds(polygon.getBounds());
		return polygon;
	}

	global.geoAPIMaps = geoAPIMaps;
}(this));