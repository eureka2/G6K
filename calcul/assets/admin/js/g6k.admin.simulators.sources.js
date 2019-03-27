/**
The MIT License (MIT)

Copyright (c) 2015-2018 Jacques Archimède

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is furnished
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function (global) {
	'use strict';

	Simulators.SQLFunctions = {
		"sqlite" : {
			"abs" : {arity: 1, args: ['number'], type: 'number'},
			"concat" : {arity: -1, args: ['text'], type: 'text'},
			"ifnull" : {arity: 2, args: ['text', 'text'], type: 'text'},
			"instr" : {arity: 2, args: ['text', 'text'], type: 'number'},
			"length" : {arity: 1, args: ['text'], type: 'number'},
			"like" : {arity: 2, args: ['text', 'text'], type: 'boolean'},
			"lower" : {arity: 1, args: ['text'], type: 'text'},
			"ltrim" : {arity: 1, args: ['text'], type: 'text'},
			"max" : {arity: -1, args: ['number'], type: 'number'},
			"min" : {arity: -1, args: ['number'], type: 'number'},
			"nullif" : {arity: 2, args: ['text', 'text'], type: 'text'},
			"quote" : {arity: 1, args: ['text'], type: 'text'},
			"random" : {arity: 0, args: [], type: 'number'},
			"replace": {arity: 3, args: ['text', 'text', 'text'], type: 'text'},
			"round" : {arity: 2, args: ['number', 'number'], type: 'number'},
			"rtrim" : {arity: 1, args: ['text'], type: 'text'},
			"soundex" : {arity: 1, args: ['text'], type: 'text'},
			"trim" : {arity: 1, args: ['text'], type: 'text'},
			"upper" : {arity: 1, args: ['text'], type: 'text'},
			"strftime" : {arity: 2, args: ['text', 'date'], type: 'text'}
		},
		"mysqli" : {
			"ascii": {arity: 1, args: ['text'], type: 'number'},
			"concat" : {arity: -1, args: ['text'], type: 'text'},
			"char": {arity: 1, args: ['number'], type: 'text'},
			"char_length": {arity: 1, args: ['text'], type: 'number'},
			"character_length": {arity: 1, args: ['text'], type: 'number'},
			"elt": {arity: 1, args: ['number'], type: 'text'},
			"format": {arity: 2, args: ['number', 'number'], type: 'text'},
			"insert": {arity: 4, args: ['text', 'number', 'number', 'text'], type: 'text'},
			"instr": {arity: 2, args: ['text', 'text'], type: 'number'},
			"left": {arity: 2, args: ['text', 'number'], type: 'text'},
			"length": {arity: 1, args: ['text'], type: 'number'},
			"locate": {arity: 3, args: ['text', 'text', 'number'], type: 'number'},
			"lower": {arity: 1, args: ['text'], type: 'text'},
			"lpad": {arity: 3, args: ['text', 'number', 'text'], type: 'text'},
			"ltrim": {arity: 1, args: ['text'], type: 'text'},
			"mid": {arity: 3, args: ['text', 'number', 'number'], type: 'text'},
			"position": {arity: 3, args: ['text', 'text', 'number'], type: 'number'},
			"quote": {arity: 1, args: ['text'], type: 'text'},
			"repeat": {arity: 2, args: ['text', 'number'], type: 'text'},
			"replace": {arity: 3, args: ['text', 'text', 'text'], type: 'text'},
			"reverse": {arity: 1, args: ['text'], type: 'text'},
			"right": {arity: 2, args: ['text', 'number'], type: 'text'},
			"rpad": {arity: 3, args: ['text', 'number', 'text'], type: 'text'},
			"rtrim": {arity: 1, args: ['text'], type: 'text'},
			"soundex": {arity: 1, args: ['text'], type: 'text'},
			"space": {arity: 1, args: ['number'], type: 'text'},
			"strcmp": {arity: 1, args: ['text', 'text'], type: 'number'},
			"substring": {arity: 3, args: ['text', 'number', 'number'], type: 'text'},
			"substring_index": {arity: 3, args: ['text', 'text', 'number'], type: 'text'},
			"trim": {arity: 1, args: ['text'], type: 'text'},
			"upper": {arity: 1, args: ['text'], type: 'text'},
			"abs": {arity: 1, args: ['number'], type: 'number'},
			"acos": {arity: 1, args: ['number'], type: 'number'},
			"asin": {arity: 1, args: ['number'], type: 'number'},
			"atan": {arity: 1, args: ['number'], type: 'number'},
			"atan2": {arity: 1, args: ['number'], type: 'number'},
			"ceil": {arity: 1, args: ['number'], type: 'number'},
			"ceiling": {arity: 1, args: ['number'], type: 'number'},
			"cos": {arity: 1, args: ['number'], type: 'number'},
			"cot": {arity: 1, args: ['number'], type: 'number'},
			"degrees": {arity: 1, args: ['number'], type: 'number'},
			"exp": {arity: 1, args: ['number'], type: 'number'},
			"floor": {arity: 1, args: ['number'], type: 'number'},
			"ln": {arity: 1, args: ['number'], type: 'number'},
			"log": {arity: 1, args: ['number'], type: 'number'},
			"log10": {arity: 1, args: ['number'], type: 'number'},
			"log2": {arity: 1, args: ['number'], type: 'number'},
			"power": {arity: 2, args: ['number', 'number'], type: 'number'},
			"radians": {arity: 1, args: ['number'], type: 'number'},
			"rand": {arity: 1, args: ['number'], type: 'number'},
			"round": {arity: 2, args: ['number', 'number'], type: 'number'},
			"sin": {arity: 1, args: ['number'], type: 'number'},
			"sqrt": {arity: 1, args: ['number'], type: 'number'},
			"tan": {arity: 1, args: ['number'], type: 'number'},
			"truncate": {arity: 2, args: ['number', 'number'], type: 'number'},
			"adddate": {arity: 2, args: ['date', 'number'], type: 'date'},
			"date_format": {arity: 2, args: ['date', 'text'], type: 'text'},
			"datediff": {arity: 2, args: ['date', 'date'], type: 'number'},
			"dayname": {arity: 1, args: ['date'], type: 'text'},
			"dayofmonth": {arity: 1, args: ['date'], type: 'number'},
			"dayofweek": {arity: 1, args: ['date'], type: 'number'},
			"dayofyear": {arity: 1, args: ['date'], type: 'number'},
			"from_days": {arity: 1, args: ['number'], type: 'date'},
			"last_day": {arity: 1, args: ['date'], type: 'date'},
			"makedate": {arity: 3, args: ['number', 'number', 'number'], type: 'date'},
			"month": {arity: 1, args: ['date'], type: 'number'},
			"monthname": {arity: 1, args: ['date'], type: 'text'},
			"now": {arity: 0, args: [], type: 'date'},
			"quarter": {arity: 1, args: ['date'], type: 'number'},
			"str_to_date": {arity: 1, args: ['number'], type: 'number'},
			"subdate": {arity: 2, args: ['date', 'number'], type: 'date'},
			"to_days": {arity: 1, args: ['date'], type: 'number'},
			"week": {arity: 2, args: ['date', 'number'], type: 'number'},
			"weekday": {arity: 1, args: ['date'], type: 'number'},
			"weekofyear": {arity: 1, args: ['date'], type: 'number'},
			"year": {arity: 1, args: ['date'], type: 'number'},
			"yearweek": {arity: 2, args: ['date', 'number'], type: 'number'}
		},
		"pgsql" : {
			"ascii": {arity: 1, args: ['text'], type: 'number'},
			"concat" : {arity: -1, args: ['text'], type: 'text'},
			"char": {arity: 1, args: ['number'], type: 'text'},
			"char_length": {arity: 1, args: ['text'], type: 'number'},
			"character_length": {arity: 1, args: ['text'], type: 'number'},
			"initcap": {arity: 1, args: ['text'], type: 'text'},
			"length": {arity: 1, args: ['text'], type: 'number'},
			"lower": {arity: 1, args: ['text'], type: 'text'},
			"lpad": {arity: 3, args: ['text', 'number', 'text'], type: 'text'},
			"ltrim": {arity: 2, args: ['text', 'text'], type: 'text'},
			"repeat": {arity: 2, args: ['text', 'number'], type: 'text'},
			"replace": {arity: 3, args: ['text', 'text', 'text'], type: 'text'},
			"rpad": {arity: 3, args: ['text', 'number', 'text'], type: 'text'},
			"rtrim": {arity: 2, args: ['text', 'text'], type: 'text'},
			"split_part": {arity: 3, args: ['text', 'text', 'number'], type: 'text'},
			"strpos": {arity: 2, args: ['text', 'text'], type: 'number'},
			"substr": {arity: 3, args: ['text', 'number', 'number'], type: 'text'},
			"translate": {arity: 3, args: ['text', 'text', 'text'], type: 'text'},
			"upper": {arity: 1, args: ['text'], type: 'text'},
			"abs": {arity: 1, args: ['number'], type: 'number'},
			"acos": {arity: 1, args: ['number'], type: 'number'},
			"asin": {arity: 1, args: ['number'], type: 'number'},
			"atan": {arity: 1, args: ['number'], type: 'number'},
			"atan2": {arity: 1, args: ['number'], type: 'number'},
			"cbrt": {arity: 1, args: ['number'], type: 'number'},
			"ceil": {arity: 1, args: ['number'], type: 'number'},
			"ceiling": {arity: 1, args: ['number'], type: 'number'},
			"cos": {arity: 1, args: ['number'], type: 'number'},
			"cot": {arity: 1, args: ['number'], type: 'number'},
			"degrees": {arity: 1, args: ['number'], type: 'number'},
			"exp": {arity: 1, args: ['number'], type: 'number'},
			"floor": {arity: 1, args: ['number'], type: 'number'},
			"ln": {arity: 1, args: ['number'], type: 'number'},
			"log": {arity: 1, args: ['number'], type: 'number'},
			"mod": {arity: 2, args: ['number', 'number'], type: 'number'},
			"power": {arity: 2, args: ['number', 'number'], type: 'number'},
			"radians": {arity: 1, args: ['number'], type: 'number'},
			"random" : {arity: 0, args: [], type: 'number'},
			"round": {arity: 2, args: ['number', 'number'], type: 'number'},
			"sin": {arity: 1, args: ['number'], type: 'number'},
			"sqrt": {arity: 1, args: ['number'], type: 'number'},
			"tan": {arity: 1, args: ['number'], type: 'number'},
			"trunc": {arity: 2, args: ['number', 'number'], type: 'number'},
			"date_part": {arity: 2, args: ['text', 'date'], type: 'number'},
			"date_trunc": {arity: 2, args: ['text', 'date'], type: 'date'},
			"now": {arity: 0, args: [], type: 'date'}
		}
	};

	Simulators.SQLConstants = { 
		"sqlite" : {
			CURRENT_DATE: {type: 'date'}, 
			CURRENT_TIME: {type: 'date'} 
		},
		"mysqli" : {
			CURRENT_DATE: {type: 'date'}, 
			CURRENT_TIME: {type: 'date'} 
		},
		"pgsql" : {
			CURRENT_DATE: {type: 'date'}, 
			CURRENT_TIME: {type: 'date'} 
		}
	};

	Simulators.SQLBaseOperators = {
		'present': Translator.trans("is present"),
		'blank': Translator.trans("is not present")
	};

	Simulators.SQLTextOperators = $.extend({}, Simulators.SQLBaseOperators, {
		'=': Translator.trans("is equal to"),
		'!=': Translator.trans("is not equal to"),
		'~': Translator.trans("contains"),
		'!~': Translator.trans("not contains")
	});

	Simulators.SQLNumericOperators = $.extend({}, Simulators.SQLBaseOperators, {
		'=': Translator.trans("is equal to"),
		'!=': Translator.trans("is not equal to"),
		'>': Translator.trans("is greater than"),
		'>=': Translator.trans("is greater than or equal to"),
		'<': Translator.trans("is less than"),
		'<=': Translator.trans("is less than or equal to"),
		'~': Translator.trans("contains"),
		'!~': Translator.trans("not contains")
	});

	Simulators.SQLDateOperators = $.extend({}, Simulators.SQLBaseOperators, {
		'=': Translator.trans("corresponds to"),
		'!=': Translator.trans("does not corresponds to"),
		'>': Translator.trans("is after"),
		'>=': Translator.trans("is not before"),
		'<': Translator.trans("is before"),
		'<=': Translator.trans("is not after")
	});

	Simulators.SQLBooleanOperators = $.extend({}, Simulators.SQLBaseOperators, {
		'isTrue': Translator.trans("is true"),
		'isFalse': Translator.trans("is false"),
	});

	Simulators.SQLExpressionOptions = {
		constants: Simulators.SQLConstants,
		functions: Simulators.SQLFunctions,
		operators: ['+', '-', '*', '%', '/', '&', '|'],
		onCompleted: function(type, expression) {
		},
		onEditing: function(expression) { 
		},
		onError: function(error) { console && console.log('error : ' + error); },
		language: Admin.lang,
		operandHolder: { classes: ['button', 'button-default'] },
		operatorHolder: { classes: ['button', 'button-default'] },
		nestedExpression: { classes: ['button', 'button-default'] }
	};

	Simulators.columnset = {};
	Simulators.parameterset = {};

	Simulators.findColumnById = function(id, columns) {
		var column = null;
		$.each(columns, function(c, col) {
			if (col.id == id) {
				column = col;
				return false;
			}
		});
		return column;
	}

	Simulators.sourceBackup = null;
	
	Simulators.isDataNameInSources = function(name) {
		var found = false;
		var parameters = $('#sources').find('.source-parameter-container');
		parameters.each(function(p) {
			var sourceId = $(this).attr('data-id');
			var pdatas = $(this).find("p[data-attribute='data']");
			pdatas.each(function(d) {
				if ($(this).attr('data-value') == name) {
					found = sourceId;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeDataNameInSources = function(oldName, name) {
		var parameters = $('#sources').find('.source-parameter-container');
		parameters.each(function(p) {
			var pdatas = $(this).find("p[data-attribute='data']");
			pdatas.each(function(d) {
				if ($(this).attr('data-value') == oldName) {
					$(this).attr('data-value', name);
				}
			});
		});
	}

	Simulators.changeDataLabelInSources = function(name, label) {
		var parameters = $('#sources').find('.source-parameter-container');
		parameters.each(function(p) {
			var pdatas = $(this).find("p[data-attribute='data']");
			pdatas.each(function(d) {
				if ($(this).attr('data-value') == name) {
					$(this).html(label);
				}
			});
		});
	}

	Simulators.maxSourceId = function() {
		var maxId = 0;
		var sources = $('#sources').find('.source-container');
		sources.each(function() {
			var id = parseInt($(this).attr('data-id'));
			if (id > maxId) {
				maxId = id;
			}
		});
		return maxId;
	}

	Simulators.renumberSources = function(panelGroups) {
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.source-container");
			var oldId = dataContainer.attr('data-id');
			var id = index + 1;
			if (id != oldId) {
				$(this).attr('id', 'source-' + id);
				var re = new RegExp("source-" + oldId + '([^\\d])?', 'g');
				var a = $(this).find('> .card > .card-header').find('> h4 > a');
				var txt = $.trim(a.text()).replace(/#\d+\s+/, ' #' + id + ' ');
				a.text(txt + ' ');
				var descendants = $(this).find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "source-" + id + '$1');
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "source-" + id + '$1');
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "source-" + id + '$1');
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "source-" + id + '$1');
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "source-" + id + '$1');
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeSourceIdInDatas(oldId, 'X' + id)
			}
		});
		panelGroups.each(function(index) {
			var dataContainer = $(this).find("div.source-container");
			var oldId = dataContainer.attr('data-id');
			var id = index + 1;
			if (id != oldId) {
				dataContainer.attr('data-id', id);
				Simulators.changeSourceIdInDatas('X' + id, id);
			}
		});
	}

	Simulators.bindSortableSources = function(container) {
		if (! container ) {
			container = $("#page-simulators #collapsesources");
		}
		container.find("> .sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			sort: function(event, ui) {
				if (Simulators.updating) {
					Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
					setTimeout(function() {
						container.find("> .sortable").sortable('cancel');
					}, 0);
				}
			},
			update: function( e, ui ) {
				if (!Simulators.updating) {
					var self = $(this);
					var container = $(ui.item).find('.source-container');
					var id = container.attr('data-id');
					Simulators.renumberSources($(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawSourceForDisplay = function(source) {
		var sourceElementId = 'source-' + source.id;
		var sourcePanelContainer = $('<div>', { 'class': 'panel-group', id: sourceElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var sourcePanel = $('<div>', { 'class': 'card bg-info' });
		sourcePanel.append('<div class="card-header" role="tab" id="' + sourceElementId + '-panel"><button class="btn btn-info float-right update-button delete-source" title="' + Translator.trans('Delete') + '" data-parent="#' + sourceElementId + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button><button class="btn btn-info float-right update-button edit-source" title="' + Translator.trans('Edit') + '" data-parent="#' + sourceElementId + '"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="fas fa-pencil-alt"></span></button><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + sourceElementId + '" href="#collapse' + sourceElementId + '" aria-expanded="true" aria-controls="collapse' + sourceElementId + '">#' + source.id + ' ' + source.label + '</a></h4></div>');
		var sourcePanelCollapse = $('<div id="collapse' + sourceElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + sourceElementId + '-panel"></div>');
		var sourcePanelBody = $('<div class="card-body"></div>');
		var sourceContainer = $('<div class="card bg-light source-container" id="' + sourceElementId + '-attributes-panel" data-id="' + source.id + '"></div>');
		var sourceContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'label', Translator.trans('Label'), source.label, source.label, false, Translator.trans('Label')));
		attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'datasource', Translator.trans('Datasource'), source.datasource, source.datasource, true, Translator.trans('Datasource')));
		if (datasources[source.datasource].type !== 'uri') { 
			attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'select', 'requestType', Translator.trans('Request type'), source.requestType, source.requestType, true, Translator.trans('Select a request type'), JSON.stringify({ 'simple': Translator.trans('Simple'), 'complex': Translator.trans('Complex') })));
			if (source.requestType == 'simple') {
				var tableLabel = datasources[source.datasource].tables[source.table.toLowerCase()].label;
				attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'table', Translator.trans('Table'), source.table, '«' + tableLabel + '»', true, Translator.trans('Table')));
				var columns = Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'columns', Translator.trans('Selected columns'), '', '', true, Translator.trans('Selected columns'));
				var columnsContainer = columns.find("p[data-attribute='columns']");
				$.each(source.columns, function(c, col) {
					if (c > 0) {
						columnsContainer.append("<span>, </span>");
					}
					var columnSpan = $('<span>', { 'data-attribute': 'column', 'data-value': col.column, 'data-alias': col.alias});
					if (col.alias && col.alias != '' && col.alias.toLowerCase() != col.column.toLowerCase()) {
						columnSpan.append( '«' + col.label + '» ' + Translator.trans('alias') + ' ' + col.alias );
					} else {
						columnSpan.append( '«' + col.label + '»' );
					}
					columnsContainer.append(columnSpan);
				});
				attributes.append(columns);
				if (source.where === 'true') {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'filter', Translator.trans('Filter'), encodeURIComponent(source.where), Translator.trans('No filter'), false, Translator.trans('Filter')));
				} else {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'filter', Translator.trans('Filter'), encodeURIComponent(source.where), source.where, false, Translator.trans('Filter')));
				}
				var orderbykeys = Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'orderbykeys', Translator.trans('Order by'), '', '', true, Translator.trans('Order by'));
				var orderbykeysContainer = orderbykeys.find("p[data-attribute='orderbykeys']");
				$.each(source.orderby, function(o, sort) {
					if (o > 0) {
						orderbykeysContainer.append("<span>, </span>");
					}
					var orderbykeySpan = $('<span>', { 'data-attribute': 'orderbykey', 'data-value': sort.key, 'data-order': sort.order});
					if (sort.order == 'desc') {
						orderbykeySpan.append( '«' + sort.label + '» ' + Translator.trans('in descending order') );
					} else {
						orderbykeySpan.append( '«' + sort.label + '» '  + Translator.trans('in ascending order') );
					}
					orderbykeysContainer.append(orderbykeySpan);
				});
				attributes.append(orderbykeys);
				if (source.nbresult == '' || source.nbresult == 0) {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'number', 'nbresult', Translator.trans('Number of results'), source.nbresult, Translator.trans('All results'), true, Translator.trans('Number of results')));
				} else {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'number', 'nbresult', Translator.trans('Number of results'), source.nbresult, source.nbresult, true, Translator.trans('Number of results')));
				}
				if (source.from == '' || source.from == 0) {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'number', 'from', Translator.trans('From'), source.from, Translator.trans('from start'), true, Translator.trans('From')));
				} else {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'number', 'from', Translator.trans('From'), source.from, source.from, true, Translator.trans('From')));
				}
			} else {
				if (source.request) {
					attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'request', Translator.trans('Request'), encodeURIComponent(source.request), source.request, false, Translator.trans('Request')));
				}
			}
		}
		attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'select', 'returnType', Translator.trans('Return type'), source.returnType, source.returnType, true, Translator.trans('Select a return type'), JSON.stringify(Simulators.sourceReturnTypes)));
		if (source.returnPath) {
			attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'returnPath', Translator.trans('Return path'), source.returnPath, source.returnPath, false, Translator.trans('Return path')));
		}
		if (source.returnType && source.returnType == 'csv') {
			if (source.separator) {
				attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'separator', Translator.trans('Separator'), source.separator, source.separator, false, Translator.trans('Separator')));
			}
			if (source.delimiter) {
				attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'delimiter', Translator.trans('Delimiter'), source.delimiter, source.delimiter, false, Translator.trans('Delimiter')));
			}
		}
		attributesContainer.append(attributes);
		sourceContainerBody.append(attributesContainer);
		sourceContainer.append(sourceContainerBody);
		sourcePanelBody.append(sourceContainer);
		sourcePanelCollapse.append(sourcePanelBody);
		sourcePanel.append(sourcePanelCollapse);
		sourcePanelContainer.append(sourcePanel);
		return sourcePanelContainer;
	}

	Simulators.drawSourceParametersForDisplay  = function(sourceId) {
		var parametersPanel = $('<div>', { 'class': 'card bg-light source-parameters-panel', id: 'source-' + sourceId + '-source--parameters-panel' });
		parametersPanel.append('<div class="card-header">' + Translator.trans('Parameters') + '</div>');
		var parametersPanelBody = $('<div class="card-body"></div>');
		parametersPanel.append(parametersPanelBody);
		return parametersPanel;
	}

	Simulators.drawSourceParameterForDisplay = function(datasource, parameter) {
		var parameterPanel = $('<div>', { 'class': 'card bg-light source-parameter-container',  'data-id': parameter.id });
		parameterPanel.append('<div class="card-header">' + Translator.trans('Parameter %id%', { 'id': parameter.id }) + '</div>');
		var parameterPanelBody = $('<div>', { 'class': 'card-body', id: 'source-' + parameter.sourceId + '-source-parameter-' + parameter.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasList = {};
		var type = '';
		if (parameter.origin == 'data') {
			$.each(Simulators.dataset, function( name, data) {
				datasList[name] = data.label;
				if (name == parameter.data) {
					type = data.type;
				}
			});
		}
		var typesList;
		if (datasources[datasource].type === 'uri') {
			typesList = { 
				queryString: Translator.trans('Query string parameter'), 
				path: Translator.trans('PATH'),
				header: Translator.trans('HTTP header')
			}
			if (datasources[datasource].method === 'post') {
				typesList.data = Translator.trans('POST data');
			}
			attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'type', Translator.trans('Type'), parameter.type, parameter.type, true, Translator.trans('Select a type'), JSON.stringify(typesList)));
		}
		var originsList = { 
			'data': Translator.trans('Data'), 
			'constant': Translator.trans('Constant') 
		};
		attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'name', Translator.trans('Name'), parameter.name, parameter.name, true, Translator.trans('Parameter name')));
		attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'origin', Translator.trans('Origin'), parameter.origin, parameter.origin, true, Translator.trans('Select an origin'), JSON.stringify(originsList)));
		if (parameter.origin == 'data') {
			attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'data', Translator.trans('Data'), parameter.data, parameter.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
			if (type === 'date' || type === 'day' || type === 'month' || type === 'year') {
				attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'format', Translator.trans('Format'), parameter.format, Translator.trans(parameter.format), true, Translator.trans('Parameter format')));
			}
		} else {
			attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'constant', Translator.trans('Constant'), parameter.constant, parameter.constant, true, Translator.trans('Parameter constant')));
		}
		attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'checkbox', 'optional', Translator.trans('Optional'), parameter.optional, parameter.optional, true, Translator.trans('Optional')));
		attributesContainer.append(attributes);
		parameterPanelBody.append(attributesContainer);
		parameterPanel.append(parameterPanelBody);
		return parameterPanel;
	}

	Simulators.requestColumnsAttributeForInput = function(id, sourceId, label, datasource, dbtype, table) {
		var attribute = '<div class="form-group row">';
		attribute    += '    <label for="' + id + '" class="col-sm-4 col-form-label">';
		attribute    += '    ' + label + '</label>';
		attribute    += '    <div id="' + id + '" class="col-sm-8 input-group">';
		attribute    += '        <ul class="request-columns-container form-control" tabindex="0" title="' + Translator.trans('Click the + button on the right to add a column') + '" data-source="' + sourceId + '" data-database-type="' + dbtype + '" data-datasource="' + datasource + '" data-table="' + table + '">';
		attribute    += '        </ul>';
		attribute    += '        <span class="input-group-addon"><a href="#" class="add-request-column">+</a></span>';
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.requestColumnAttributeForInput = function(value, placeholder, alias) {
		var attribute = '            <li class="request-column-container">';
		attribute    += '              <a href="#" class="delete-request-column">x</a>';
		attribute    += '              <span data-attribute="column" class="attribute-expression" data-placeholder="' + placeholder + '"  data-value="' + value + '" />'; 
		if (alias && alias != '' && alias.toLowerCase() != value.toLowerCase()) {
			attribute    += '              <span class="column-alias">' + ' ' + Translator.trans('alias') + ' </span>';
			attribute    += '              <span class="editable-text" data-value="' + alias + '">' + alias + '</span>';
		}
		attribute    += '            </li>';
		return $(attribute);
	}

	Simulators.requestFilterAttributeForInput = function(id, sourceId, connector, datasource, dbtype, table) {
		var attribute = '<div class="request-filter-tools-container form-group row">';
		attribute    += '    <label for="' + id + '-tools" class="col-sm-4 col-form-label"></label>';
		attribute    += '    <div id="' + id + '-tools" class="col-sm-8">';
		attribute    += '        <div class="request-filter-connector-container">';
		attribute    += '            <span class="editable-select connector" data-value="' + connector + '">' + Translator.trans(connector == 'all'? 'All of the following' : (connector == 'any' ? 'Any of the following' : 'Advanced')) + '</span>';
		attribute    += '        </div>';
		attribute    += '        <div class="request-filter-parenthesis-container">';
		attribute    += '            <a class="parenthesis" href="#">+ ( )</a>';
		attribute    += '        </div>';
		attribute    += '    </div>';
		attribute    += '</div>';
		attribute    += '<div class="request-filter-conditions-container form-group row">';
		attribute    += '    <label for="' + id + '-conditions" class="col-sm-4 col-form-label">' + Translator.trans('Filter') + '</label>';
		attribute    += '    <div id="' + id + '-conditions" class="col-sm-8 input-group">';
		attribute    += '        <ul class="request-filter-conditions form-control" tabindex="0" title="' + Translator.trans('Click the + button on the right to add a condition') + '" data-source="' + sourceId + '" data-database-type="' + dbtype + '" data-datasource="' + datasource + '" data-table="' + table + '">';
		attribute    += '        </ul>';
		attribute    += '        <span class="input-group-addon"><a href="#" class="add-request-condition">+</a></span>';
		attribute    += '    </div>';
		attribute    += '</div>';
		attribute    += '<div class="request-filter-expression-container form-group row">';
		attribute    += '    <label for="' + id + '-expression" class="col-sm-4 col-form-label"></label>';
		attribute    += '    <div id="' + id + '-expression" class="col-sm-8 input-group">';
		attribute    += '        <ul class="form-control request-filter-expression" data-source="' + sourceId + '" data-database-type="' + dbtype + '" data-datasource="' + datasource + '" data-table="' + table + '">';
		attribute    += '        </ul>';
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.refreshRequestFilterDisplay = function(conditionsContainer) {
		var toolsContainer = conditionsContainer.prev();
		var expressionContainer = conditionsContainer.next();
		var conditionsCount = conditionsContainer.find('.request-filter-conditions').children().length;
		if (conditionsCount < 2) {
			toolsContainer.hide();
			conditionsContainer.css('margin-top', '0px');
			conditionsContainer.find('.request-filter-condition-num').hide();
			expressionContainer.hide();
		} else {
			toolsContainer.show();
			conditionsContainer.css('margin-top', '-10px');
			conditionsContainer.find('.request-filter-condition-num').show();
			if (toolsContainer.find('.connector').attr('data-value') == 'advanced') {
				toolsContainer.find('.request-filter-parenthesis-container').show();
				expressionContainer.show();
			} else {
				toolsContainer.find('.request-filter-parenthesis-container').hide();
			}
		}
	}

	Simulators.requestFilterParenthesisAttributeForInput = function(parenthesis) {
		var bracket = parenthesis == '(' ? '[' : ']';
		var attribute = '<li class="request-expression-token-wrap request-parenthesis-container">';
		attribute    += '    <div href="#" class="request-expression-token request-bracket" data-value="' + parenthesis + '">';
		attribute    += '    ' + bracket + '<a href="#" class="fas fa-times request-expression-delete-token"></a>';
		attribute    += '    </div>';
		attribute    += '</li>';
		return $(attribute);
	}

	Simulators.requestFilterConnectorAttributeForInput = function(connector) {
		var attribute = '<li class="request-expression-token-wrap request-connector-container">';
		attribute    += '    <div class="request-expression-token request-connector" data-value="' + connector + '">';
		attribute    += '    ' + Translator.trans(connector);
		attribute    += '    </div>';
		attribute    += '</li>';
		return $(attribute);
	}

	Simulators.requestFilterConditionNumAttributeForInput = function(conditionNum) {
		var attribute = '<li class="request-expression-token-wrap request-condition-container">';
		attribute    += '    <div class="request-expression-token request-condition" data-value="' + conditionNum + '">';
		attribute    += '    ' + conditionNum;
		attribute    += '    </div>';
		attribute    += '</li>';
		return $(attribute);
	}

	Simulators.requestFilterConditionAttributeForInput = function(num, operand, placeholderOperand, operator, value, placeholderValue) {
		var attribute = '            <li class="request-filter-condition-container">';
		attribute    += '              <span class="request-expression-token request-filter-condition-num" data-value="' + num + '">' + num + '</span>';
		attribute    += '              <div class="request-filter-condition-edition-container">';
		attribute    += '                  <a href="#" class="delete-request-filter-condition">x</a>';
		attribute    += '                  <span data-attribute="operand" class="attribute-expression operand" data-placeholder="' + placeholderOperand + '"  data-value="' + operand + '" />'; 
		if (operator != '') {
			attribute    += '                  <span class="editable-select operator" data-attribute="operator" data-type="number" data-value="' + operator + '">' + Simulators.SQLNumericOperators[operator] + '</span>';
			if (value != '') {
				attribute    += '                  <span data-attribute="value" class="attribute-expression value" data-placeholder="' + placeholderValue + '"  data-value="' + value + '" />'; 
			}
		}
		attribute    += '              </div>';
		attribute    += '            </li>';
		return $(attribute);
	}

	Simulators.requestOrderByKeysAttributeForInput = function(id, sourceId, label, datasource, dbtype, table) {
		var attribute = '<div class="form-group row">';
		attribute    += '    <label for="' + id + '" class="col-sm-4 col-form-label">';
		attribute    += '    ' + label + '</label>';
		attribute    += '    <div id="' + id + '" class="col-sm-8 input-group">';
		attribute    += '        <ul class="request-orderbykeys-container form-control" tabindex="0" title="' + Translator.trans('Click the + button on the right to add a sort key') + '" data-source="' + sourceId + '" data-database-type="' + dbtype + '" data-datasource="' + datasource + '" data-table="' + table + '">';
		attribute    += '        </ul>';
		attribute    += '        <span class="input-group-addon"><a href="#" class="add-request-orderbykey">+</a></span>';
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.requestOrderByKeyAttributeForInput = function(value, placeholder, order) {
		var attribute = '            <li class="request-orderbykey-container">';
		attribute    += '              <a href="#" class="delete-request-orderbykey">x</a>';
		attribute    += '              <span data-attribute="orderbykey" class="attribute-expression" data-placeholder="' + placeholder + '"  data-value="' + value + '" />'; 
		attribute    += '              <span class="editable-select" data-value="' + order + '">' + Translator.trans(order == 'desc' ? 'in descending order' : 'in ascending order') + '</span>';
		attribute    += '            </li>';
		return $(attribute);
	}

	Simulators.drawSourceForInput = function(source) {
		var sourceElementId = 'source-' + source.id;
		var sourcePanelContainer = $('<div>', { 'class': 'panel-group', id: sourceElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var sourcePanel = $('<div>', { 'class': 'card bg-info' });
		sourcePanel.append('<div class="card-header" role="tab" id="' + sourceElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + sourceElementId + '" href="#collapse' + sourceElementId + '" aria-expanded="true" aria-controls="collapse' + sourceElementId + '">#' + source.id + '</a></h4></div>');
		var sourcePanelCollapse = $('<div id="collapse' + sourceElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + sourceElementId + '-panel"></div>');
		var sourcePanelBody = $('<div class="card-body"></div>');
		var sourceContainer = $('<div class="card bg-light source-container" id="' + sourceElementId + '-attributes-panel" data-id="' + source.id + '"></div>');
		var sourceContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasourcesList = {};
		if (source.datasource == '') {
			datasourcesList[''] = Translator.trans('Select a data source');
		}
		var datasourceType = ''
		var datasourceDbType = ''
		var tables = {};
		$.each(datasources, function( name, datasource) {
			datasourcesList[name] = name;
			if (name == source.datasource) {
				datasourceType = datasource.type;
				datasourceDbType = datasource.dbtype;
				if (datasource.type !== 'uri') {
					$.each(datasource.tables, function(tblname, tbl) {
						tables[tbl.name] = tbl.label;
					});
				}
			}
		});
		Simulators.columnset = {};
		if (source.datasource && source.table) {
			Simulators.columnset = datasources[source.datasource].tables[source.table.toLowerCase()].columns;
		}
		var requestTypes = {
			simple: Translator.trans('Simple'),
			complex: Translator.trans('Complex')
		};
		attributes.append(Simulators.simpleAttributeForInput(sourceElementId + '-label', 'text', 'label', Translator.trans('Source label'), source.label, true, Translator.trans('Source label')));
		attributes.append(Simulators.simpleAttributeForInput(sourceElementId + '-datasource', 'select', 'datasource', Translator.trans('Datasource'), source.datasource, true, Translator.trans('Select a data source'), JSON.stringify(datasourcesList)));
		var requestType = Simulators.simpleAttributeForInput(sourceElementId + '-requestType', 'select', 'requestType', Translator.trans('Request type'), source.requestType, true, Translator.trans('Select a request type'), JSON.stringify(requestTypes));
		attributes.append(requestType);
		var request = Simulators.simpleAttributeForInput(sourceElementId + '-request', 'text', 'request', Translator.trans('Request'), source.request, true, Translator.trans('Enter a SQL request'));
		attributes.append(request);
		var table = Simulators.simpleAttributeForInput(sourceElementId + '-table', 'select', 'table', Translator.trans('Table'), source.table, true, Translator.trans('Select a table'), JSON.stringify(tables));
		attributes.append(table);
		var columns = Simulators.requestColumnsAttributeForInput(sourceElementId + '-request-columns', source.id, Translator.trans('Selected columns'), source.datasource, datasourceDbType, source.table);
		var columnsContainer = columns.find('.request-columns-container');
		$.each(source.columns, function(c, column) {
			columnsContainer.append(Simulators.requestColumnAttributeForInput(column.column, Translator.trans('Select a column'), column.alias));
		});
		attributes.append(columns);
		var connector = 'all';
		var filter;
		if (source.filter != '' && source.filter != 'true') {
			var tokenizer = new SQLSelectTokenizer(datasources[source.datasource].tables, Simulators.SQLFunctions[datasourceDbType]);
			filter = tokenizer.parseWhere(source.filter, source.table);
			var parenthesis = false;
			var and = false;
			var or = false;
			$.each(filter.expression, function(t, token) {
				if (token == '('  || token == ')') {
					parenthesis = true;
				} else if (token == 'and') {
					and = true;
				} else if (token == 'or') {
					or = true;
				}
			});
			if (parenthesis || (and && or)) {
				connector = 'advanced'
			} else if (or) {
				connector = 'any';
			}
		}
		var filterContainer = Simulators.requestFilterAttributeForInput(sourceElementId + '-request-filter', source.id, connector, source.datasource, datasourceDbType, source.table);
		attributes.append(filterContainer);
		if (source.filter != '' && source.filter != 'true') {
			var conditionsContainer = filterContainer.find('.request-filter-conditions');
			var expressionContainer = filterContainer.find('.request-filter-expression');
			$.each(filter.conditions, function(c, condition) {
				var conditionContainer = Simulators.requestFilterConditionAttributeForInput(c + 1, condition.operand, Translator.trans('Select a column'), condition.operator, condition.value, Translator.trans('Select a value'));
				conditionsContainer.append(conditionContainer);
			});
			$.each(filter.expression, function(t, token) {
				if (token == '('  || token == ')') {
					expressionContainer.append(Simulators.requestFilterParenthesisAttributeForInput(token));
				} else if (token == 'and' || token == 'or') {
					expressionContainer.append(Simulators.requestFilterConnectorAttributeForInput(token));
				} else {
					expressionContainer.append(Simulators.requestFilterConditionNumAttributeForInput(token));
				}
			});
		}
		var orderbykeys = Simulators.requestOrderByKeysAttributeForInput(sourceElementId + '-request-orderbykeys', source.id, Translator.trans('Order by'), source.datasource, datasourceDbType, source.table);
		var orderbykeysContainer = orderbykeys.find('.request-orderbykeys-container');
		$.each(source.orderby, function(o, orderby) {
			orderbykeysContainer.append(Simulators.requestOrderByKeyAttributeForInput(orderby.key, Translator.trans('Select a column'), orderby.order));
		});
		attributes.append(orderbykeys);
		var nbresult = Simulators.simpleAttributeForInput(sourceElementId + '-nbresult', 'number', 'nbresult', Translator.trans('Number of results'), source.nbresult, true, Translator.trans('Number of results'));
		attributes.append(nbresult);
		var offset = Simulators.simpleAttributeForInput(sourceElementId + '-from', 'number', 'from', Translator.trans('From'), source.from, true, Translator.trans('From'));
		attributes.append(offset);
		var returnType = Simulators.simpleAttributeForInput(sourceElementId + '-returnType', 'select', 'returnType', Translator.trans('Return type'), source.returnType, true, Translator.trans('Select a return type'), JSON.stringify(Simulators.sourceReturnTypes));
		attributes.append(returnType);
		var returnPath = Simulators.simpleAttributeForInput(sourceElementId + '-returnPath', 'text', 'returnPath', Translator.trans('Return path'), source.returnPath, true, Translator.trans('Enter a return path'));
		attributes.append(returnPath);
		var separator = Simulators.simpleAttributeForInput(sourceElementId + '-separator', 'text', 'separator', Translator.trans('Separator'), source.separator, true, Translator.trans('Enter a separator'));
		attributes.append(separator);
		var delimiter = Simulators.simpleAttributeForInput(sourceElementId + '-delimiter', 'text', 'delimiter', Translator.trans('Delimiter'), source.delimiter, true, Translator.trans('Enter a delimiter'));
		attributes.append(delimiter);
		if (source.datasource == '' || datasourceType === 'uri') {
			requestType.hide();
		}
		if (source.datasource == '' || datasourceType === 'uri' || source.requestType === 'simple') {
			request.hide();
		}
		if (source.datasource == '' || datasourceType === 'uri' || source.requestType === 'complex') {
			table.hide();
			columns.hide();
			filterContainer.hide();
			orderbykeys.hide();
			nbresult.hide();
			offset.hide();
		} else {
			var conditionsContainer = attributes.find('.request-filter-conditions-container');
			Simulators.refreshRequestFilterDisplay(conditionsContainer);
		}
		if (source.datasource == '') {
			returnType.hide();
		}
		if (source.datasource == '' || source.returnType === 'singleValue') {
			returnPath.hide();
		}
		if (source.datasource == '' || source.returnType !== 'csv') {
			separator.hide();
			delimiter.hide();
		}
		attributesContainer.append(attributes);
		sourceContainerBody.append(attributesContainer);
		sourceContainer.append(sourceContainerBody);
		sourcePanelBody.append(sourceContainer);
		var sourceButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + sourceElementId + '-buttons-panel"></div>');
		var sourceButtonsBody = $('<div class="card-body source-buttons"></div>');
		sourceButtonsBody.append('<button class="btn btn-success float-right validate-edit-source">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		sourceButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-source">' + Translator.trans('Cancel') + '</span></button>');
		sourceButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		sourceButtonsPanel.append(sourceButtonsBody);
		sourcePanelBody.append(sourceButtonsPanel);
		sourcePanelCollapse.append(sourcePanelBody);
		sourcePanel.append(sourcePanelCollapse);
		sourcePanelContainer.append(sourcePanel);
		return sourcePanelContainer;
	}

	Simulators.bindSourceButtons = function(container) {
		if (! container ) {
			container = $("#collapsesources");
		}
		container.find('button.edit-source').on('click', function(e) {
		    e.preventDefault();
			Simulators.editSource($($(this).attr('data-parent')));
		});
		container.find('button.delete-source').on('click', function(e) {
		    e.preventDefault();
			Simulators.deleteSource($($(this).attr('data-parent')));
		});
	}

	Simulators.bindRequestColumnAttribute = function(columnContainer) {
		var container = columnContainer.hasClass('request-column-container') ? 
			columnContainer : 
			columnContainer.find('.request-column-container');
		container.find('.attribute-expression').each(function( index ) {
			var expression = $( this );
			var dbtype = expression.parent().parent().attr('data-database-type');
			expression.expressionbuilder({
				fields: Simulators.columnset,
				constants: Simulators.SQLExpressionOptions.constants[dbtype],
				functions: Simulators.SQLExpressionOptions.functions[dbtype],
				operators: Simulators.SQLExpressionOptions.operators,
				parameters: Simulators.parameterset,
				initial: expression.attr('data-value'),
				onCompleted: function(type, expression) {
					var val = expression.expressionbuilder('val');
					expression.attr('data-value', val.replace(
						/#(\d+)/g,
						function (match, m1, offs, str) {
							var column = Simulators.findColumnById(m1, Simulators.columnset);
							return column != null ? column.name : match;
						}
					));
					var columnsContainer = expression.parent().parent();
					var datasource = columnsContainer.attr('data-datasource');
					var table = columnsContainer.attr('data-table');
					var label = '';
					var isColumn = val.match(/^#(\d+)$/);
					if (! isColumn) {
						isColumn = datasources[datasource].tables[table.toLowerCase()].columns.hasOwnProperty(val.toLowerCase());
						if (isColumn) {
							label = datasources[datasource].tables[table.toLowerCase()].columns[val.toLowerCase()].label;
						}
					}
					if (! isColumn) {
						var alias = expression.next();
						if (alias.length == 0) {
							var editable = $('<span class="editable-text text-warning" data-value=""></span>');
							expression.after(editable);
							expression.after('<span class="column-alias">' + ' ' + Translator.trans('alias') + ' </span>');
							editable.editable(
								function (val, settings) {
									$(this).attr("data-value", val);
									return val;
								},
								{
									name: editable.attr('name'),
									id: "text-" + Math.floor(Math.random() * 100000),
									type: "text",
									placeholder: Translator.trans("click to enter the column alias"),
									tooltip: Translator.trans("click to edit the column alias"),
									style: "inherit",
									callback: function() {
										editable.removeClass('text-warning');
									}
								}
							);
						}
					}
				},
				onEditing: Simulators.SQLExpressionOptions.onEditing,
				onError: Simulators.SQLExpressionOptions.onError,
				language: Simulators.SQLExpressionOptions.language,
				operandHolder: Simulators.SQLExpressionOptions.operandHolder,
				operatorHolder: Simulators.SQLExpressionOptions.operatorHolder,
				nestedExpression: Simulators.SQLExpressionOptions.nestedExpression
			});
		});
		container.find('.editable-text').each(function( index ) {
			var editable = $( this );
			editable.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					return val;
				},
				{
					name: editable.attr('name'),
					id: "text-" + Math.floor(Math.random() * 100000),
					type: "text",
					placeholder: Translator.trans("click to enter the column alias"),
					tooltip: Translator.trans("click to edit the column alias"),
					style: "inherit"
				}
			);
		});
		columnContainer.find('.delete-request-column').on('click', function( e ) {
			e.preventDefault();
			$(this).parent().remove();
		});
	}

	Simulators.bindRequestOrderByKeyAttribute = function(orderByKeyContainer) {
		var container = orderByKeyContainer.hasClass('request-orderbykey-container') ? 
			orderByKeyContainer : 
			orderByKeyContainer.find('.request-orderbykey-container');
		container.find('.attribute-expression').each(function( index ) {
			var expression = $( this );
			var dbtype = expression.parent().parent().attr('data-database-type');
			expression.expressionbuilder({
				fields: Simulators.columnset,
				constants: Simulators.SQLExpressionOptions.constants[dbtype],
				functions: Simulators.SQLExpressionOptions.functions[dbtype],
				operators: Simulators.SQLExpressionOptions.operators,
				parameters: Simulators.parameterset,
				initial: expression.attr('data-value'),
				onCompleted: function(type, expression) {
					var val = expression.expressionbuilder('val');
					expression.attr('data-value', val.replace(
						/#(\d+)/g,
						function (match, m1, offs, str) {
							var column = Simulators.findColumnById(m1, Simulators.columnset);
							return column != null ? column.name : match;
						}
					));
				},
				onEditing: Simulators.SQLExpressionOptions.onEditing,
				onError: Simulators.SQLExpressionOptions.onError,
				language: Simulators.SQLExpressionOptions.language,
				operandHolder: Simulators.SQLExpressionOptions.operandHolder,
				operatorHolder: Simulators.SQLExpressionOptions.operatorHolder,
				nestedExpression: Simulators.SQLExpressionOptions.nestedExpression
			});
		});
		container.find('.editable-select').each(function( index ) {
			var editable = $( this );
			editable.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					settings.data.selected = val;
					return settings.data[val];
				},
				{
					data: {
						asc: Translator.trans('in ascending order'),
						desc: Translator.trans('in descending order'),
						selected: editable.attr("data-value") || 'asc'
					},
					name: editable.attr('name'),
					type: "select",
					placeholder: Translator.trans("click to enter the sort order"),
					tooltip: Translator.trans("click to edit the sort order"),
					style: "inherit"
				}
			);
		});
		orderByKeyContainer.find('.delete-request-orderbykey').on('click', function( e ) {
			e.preventDefault();
			$(this).parent().remove();
		});
	}

	Simulators.bindRequestFilterConnectorAttribute = function(connectorContainer) {
		var container = connectorContainer.hasClass('request-connector-container') ? 
			connectorContainer : 
			connectorContainer.find('.request-connector-container');
		container.find('.request-connector').on('click', function (e) {
			e.preventDefault();
			if ($(this).attr('data-value') == 'and') {
				$(this).attr('data-value', 'or');
				$(this).text(Translator.trans('or'));
			} else {
				$(this).attr('data-value', 'and');
				$(this).text(Translator.trans('and'));
			}
		});
	}

	Simulators.bindRequestFilterParenthesisAttribute = function(parenthesisContainer) {
		var container = parenthesisContainer.hasClass('request-parenthesis-container') ? 
			parenthesisContainer : 
			parenthesisContainer.find('.request-parenthesis-container');
		container.find('.request-expression-delete-token').on('click', function (e) {
			e.preventDefault();
			var li = $(this).parent().parent();
			var bracket = li.find('.request-bracket').attr('data-value');
			var npar = 0;
			if (bracket == '(') {
				var sibling = li.next();
				while (sibling.length > 0) {
					var value = sibling.find('.request-expression-token').attr('data-value');
					if (value == ')') {
						if (npar == 0) {
							sibling.remove();
							break;
						} else {
							npar--;
						}
					} else if (value == '(') {
						npar++;
					}
					sibling = sibling.next();
				}
				li.remove();
			} else {
				var sibling = li.prev();
				while (sibling.length > 0) {
					var value = sibling.find('.request-expression-token').attr('data-value');
					if (value == '(') {
						if (npar == 0) {
							sibling.remove();
							break;
						} else {
							npar--;
						}
					} else if (value == ')') {
						npar++;
					}
					sibling = sibling.prev();
				}
				li.remove();
			}
		});
	}

	Simulators.bindRequestFilterToolsAttribute = function(filterToolsContainer) {
		var container = filterToolsContainer.hasClass('request-filter-tools-container') ? 
			filterToolsContainer : 
			filterToolsContainer.find('.request-filter-tools-container');
		container.find('.editable-select').each(function( index ) {
			var editable = $( this );
			editable.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					if (val == 'advanced') {
						container.find('.request-filter-parenthesis-container').show();
						container.parent().find('.request-filter-expression-container').show();
					} else {
						container.find('.request-filter-parenthesis-container').hide();
						container.parent().find('.request-filter-expression-container').hide();
					}
					settings.data.selected = val;
					return settings.data[val];
				},
				{
					data: {
						all: Translator.trans('All of the following'),
						any: Translator.trans('Any of the following'),
						advanced: Translator.trans('Advanced'),
						selected: editable.attr("data-value") || 'all'
					},
					name: editable.attr('name'),
					type: "select",
					placeholder: Translator.trans("Select the filter type"),
					tooltip: Translator.trans("Select the filter type"),
					style: "inherit"
				}
			);
			if (editable.attr("data-value") == 'advanced') {
				container.find('.request-filter-parenthesis-container').show();
				container.parent().find('.request-filter-expression-container').show();
			} else {
				container.find('.request-filter-parenthesis-container').hide();
				container.parent().find('.request-filter-expression-container').hide();
			}
		});
		container.find('.parenthesis').on('click', function( e ) {
			e.preventDefault();
			var requestExpression = container.parent().find('.request-filter-expression');
			if (requestExpression.children().length > 0) {
				var oparenthesis = Simulators.requestFilterParenthesisAttributeForInput('(');
				requestExpression.prepend(oparenthesis);
				Simulators.bindRequestFilterParenthesisAttribute(oparenthesis);
				var cparenthesis = Simulators.requestFilterParenthesisAttributeForInput(')');
				requestExpression.append(cparenthesis);
				Simulators.bindRequestFilterParenthesisAttribute(cparenthesis);
			}
		});
	}

	Simulators.bindRequestFilterConditionAttribute = function(columnContainer) {
		var container = columnContainer.hasClass('request-filter-condition-container') ? 
			columnContainer : 
			columnContainer.find('.request-filter-condition-container');
		container.find('.attribute-expression.operand').each(function( index ) {
			var expression = $( this );
			var dbtype = expression.parent().parent().parent().attr('data-database-type');
			expression.expressionbuilder({
				fields: Simulators.columnset,
				constants: Simulators.SQLExpressionOptions.constants[dbtype],
				functions: Simulators.SQLExpressionOptions.functions[dbtype],
				operators: Simulators.SQLExpressionOptions.operators,
				parameters: Simulators.parameterset,
				initial: expression.attr('data-value'),
				onCompleted: function(type, expression) {
					var val = expression.expressionbuilder('val');
					expression.attr('data-value', val.replace(
						/#(\d+)/g,
						function (match, m1, offs, str) {
							var column = Simulators.findColumnById(m1, Simulators.columnset);
							return column != null ? column.name : match;
						}
					));
					var operator = expression.next();
					var reload = false;
					var value = "";
					if (operator.length > 0 && operator.attr('data-type') != type) {
						value = operator.attr('data-value');
						operator.editable("destroy");
						operator.remove();
						reload = true;
					}
					if (operator.length == 0 || reload) {
						var editable = $('<span class="editable-select operator" data-type="'+ type + '" data-attribute="operator" data-value="' + value + '"></span>');
						expression.after(editable);
						Simulators.bindRequestFilterConditionOperator(editable);
					}
				},
				onEditing: Simulators.SQLExpressionOptions.onEditing,
				onError: Simulators.SQLExpressionOptions.onError,
				language: Simulators.SQLExpressionOptions.language,
				operandHolder: Simulators.SQLExpressionOptions.operandHolder,
				operatorHolder: Simulators.SQLExpressionOptions.operatorHolder,
				nestedExpression: Simulators.SQLExpressionOptions.nestedExpression
			});
		});
		container.find('.editable-select.operator').each(function( index ) {
			Simulators.bindRequestFilterConditionOperator($( this ));
		});
		container.find('.attribute-expression.value').each(function( index ) {
			Simulators.bindRequestFilterConditionValue($( this ));
		});
		columnContainer.find('.delete-request-filter-condition').on('click', function( e ) {
			e.preventDefault();
			var conditionsContainer = $(this).parents('.request-filter-conditions-container');
			var expressionContainer = conditionsContainer.next();
			var num = $(this).parent().prev().attr('data-value');
			expressionContainer.find('.request-filter-expression').find(".request-condition[data-value='" + num + "']").parent().each(function(k) {
				if ($(this).prev().find('div').hasClass('request-bracket') && $(this).prev().find('div').attr('data-value') == '(' && $(this).next().find('div').hasClass('request-bracket') && $(this).next().find('div').attr('data-value') == ')') {
					$(this).prev().remove();
					$(this).next().remove();
				}
				if ($(this).prev().find('div').hasClass('request-connector')) {
					$(this).prev().remove();
				} else if ($(this).next().find('div').hasClass('request-connector')) {
					$(this).next().remove();
				}
				$(this).remove();
			});
			$(this).parent().parent().remove();
			Simulators.renumberRequestFilterConditions(expressionContainer.parent());
			Simulators.refreshRequestFilterDisplay(conditionsContainer);
		});
	}

	Simulators.renumberRequestFilterConditions = function(sourcePanelContainer) {
		var conditions = sourcePanelContainer.find('.request-filter-conditions');
		var expression = sourcePanelContainer.find('.request-filter-expression');
		conditions.children().each(function(k) {
			var num = k + 1;
			var conditionNum = $(this).find('.request-filter-condition-num');
			var oldNum = conditionNum.attr('data-value');
			if (num != oldNum) {
				conditionNum.attr('data-value', num);
				conditionNum.text(num);
				expression.find(".request-condition[data-value='" + oldNum + "']").each(function() {
					$(this).attr('data-value', 'X' + num);
					$(this).text(num);
				});
			}
		});
		expression.find(".request-condition").each(function() {
			if ($(this).attr('data-value').charAt(0) == 'X') {
				$(this).attr('data-value', $(this).text());
			}
		});
	}

	Simulators.bindRequestFilterConditionOperator = function(operator) {
		var type = operator.prev().expressionbuilder('type');
		var data;
		switch (type) {
			case 'text':
			case 'textarea':
				data = Simulators.SQLTextOperators;
				break;
			case 'date':
				data = Simulators.SQLDateOperators;
				break;
			case 'boolean':
				data = Simulators.SQLBooleanOperators;
				break;
			default:
				data = Simulators.SQLNumericOperators;
		}
		if (operator.attr("data-value") != '') {
			data.selected = operator.attr("data-value");
			operator.text(data[operator.attr("data-value")]);
		}
		operator.editable(
			function (val, settings) {
				operator.attr("data-value", val);
				settings.data.selected = val;
				return settings.data[val];
			},
			{
				data: data,
				name: operator.attr('name'),
				type: "select",
				placeholder: Translator.trans("click to select the operator"),
				tooltip: Translator.trans("click to select the operator"),
				style: "inherit",
				callback: function() {
					var value = operator.next();
					if ($.inArray(operator.attr("data-value"), ['blank', 'present', 'isTrue', 'isFalse']) == -1) {
						if (value.length == 0) {
							value = $('<span data-attribute="value" class="attribute-expression value" data-value="" />');
							operator.after(value);
							Simulators.bindRequestFilterConditionValue(value);
						}
					} else if (value.length > 0) {
						value.remove();
					}
				}
			}
		);
	}

	Simulators.bindRequestFilterConditionValue = function(value) {
		var dbtype = value.parent().parent().parent().attr('data-database-type');
		value.expressionbuilder({
			fields: Simulators.columnset,
			constants: Simulators.SQLExpressionOptions.constants[dbtype],
			functions: Simulators.SQLExpressionOptions.functions[dbtype],
			operators: Simulators.SQLExpressionOptions.operators,
			parameters: Simulators.parameterset,
			initial: value.attr('data-value'),
			onCompleted: function(type, expression) {
				var val = expression.expressionbuilder('val');
				expression.attr('data-value', val.replace(
					/#(\d+)/g,
					function (match, m1, offs, str) {
						var column = Simulators.findColumnById(m1, Simulators.columnset);
						return column != null ? column.name : match;
					}
				));
			},
			onEditing: Simulators.SQLExpressionOptions.onEditing,
			onError: Simulators.SQLExpressionOptions.onError,
			language: Simulators.SQLExpressionOptions.language,
			operandHolder: Simulators.SQLExpressionOptions.operandHolder,
			operatorHolder: Simulators.SQLExpressionOptions.operatorHolder,
			nestedExpression: Simulators.SQLExpressionOptions.nestedExpression
		});
	}

	Simulators.composeSimpleSQLRequest = function(sourcePanelContainer, dbtype) {
		var request = 'SELECT';
		var selectList = [];
		sourcePanelContainer.find('.request-column-container').each(function (c) {
			var column = $(this).find('span[data-attribute=column]').attr('data-value');
			selectList.push(column);
		});
		request += ' ' + selectList.join(', ');
		request += ' FROM ' + sourcePanelContainer.find('select[data-attribute=table]').val();
		var where = Simulators.composeSQLWhereClause(sourcePanelContainer);
		if (where.length > 0) {
			request += ' WHERE ' + where;
		}
		var orderbykeys = [];
		sourcePanelContainer.find('.request-orderbykey-container').each(function (c) {
			var orderbykey = $(this).find('span[data-attribute=orderbykey]').attr('data-value');
			var sortorder = $(this).find('span[data-attribute=orderbykey]').next().attr('data-value');
			if (sortorder == 'desc') {
				orderbykeys.push(orderbykey + ' DESC');
			} else {
				orderbykeys.push(orderbykey);
			}
		});
		if (orderbykeys.length > 0) {
			request += ' ORDER BY ' + orderbykeys.join(', ');
		}
		var limit = sourcePanelContainer.find('input[data-attribute=nbresult]').val();
		var offset = sourcePanelContainer.find('input[data-attribute=from]').val();
		if (limit > 0) {
			request += ' LIMIT ' + limit;
			if (offset > 0) {
				request += ' OFFSET ' + offset;
			}
		} else if (offset > 0 && dbtype == 'pgsql') {
			request += 'LIMIT ALL OFFSET ' + offset;
		}
		request = request.replace(/\$(\d+)\$([sdf])\b/g, function(match, m1, m2, offs, str) {
			return '%' + m1 + '$' + m2;
		});
		return request;
	}

	Simulators.composeSQLWhereClause = function(sourcePanelContainer) {
		var conditions = [];
		sourcePanelContainer.find('.request-filter-condition-edition-container').each(function (c) {
			var operand = $(this).find('span[data-attribute=operand]').attr('data-value');
			var operator = $(this).find('span[data-attribute=operator]').attr('data-value');
			var value = $(this).find('span[data-attribute=value]').attr('data-value');
			switch (operator) {
				case 'present':
					conditions.push(operand + ' IS NOT NULL');
					break;
				case 'blank':
					conditions.push(operand + ' IS NULL');
					break;
				case '~':
					if (value.length > 1 && value.charAt(0) == "'") {
						value = value.substr(1, value.length - 2);
					}
					conditions.push(operand + " LIKE '%" + value + "%'");
					break;
				case '!~':
					if (value.length > 1 && value.charAt(0) == "'") {
						value = value.substr(1, value.length - 2);
					}
					conditions.push(operand + " NOT LIKE '%" + value + "%'");
					break;
				default:
					conditions.push(operand + ' ' + operator + ' ' + value);
			}
		});
		var where = '';
		if (conditions.length > 0) {
			var connector = sourcePanelContainer.find('.request-filter-tools-container .connector').attr('data-value');
			if (connector == 'all') {
				where += conditions.join(' AND ');
			} else if (connector == 'any') {
				where += conditions.join(' OR ');
			} else {
				sourcePanelContainer.find('.request-filter-expression-container .request-expression-token').each(function (c) {
					if ($(this).hasClass('request-condition')) {
						var conditionNum = parseInt($(this).attr('data-value'), 10);
						where += conditions[conditionNum - 1];
					} else if ($(this).hasClass('request-connector')) {
						where += ' ' + $(this).attr('data-value').toUpperCase() + ' ';
					} else {
						where += $(this).attr('data-value');
					}
				});
			}
		}
		return where;
	}

	Simulators.bindSource = function(sourcePanelContainer) {
		sourcePanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		sourcePanelContainer.find('.cancel-edit-source').on('click', function() {
			sourcePanelContainer.replaceWith(Simulators.sourceBackup);
			Simulators.sourceBackup.find('button.edit-source').on('click', function(e) {
				e.preventDefault();
				Simulators.editSource($($(this).attr('data-parent')));
			});
			Simulators.sourceBackup.find('button.delete-source').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteSource($($(this).attr('data-parent')));
			});
			Simulators.sourceParametersBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		sourcePanelContainer.find('.cancel-add-source').on('click', function() {
			sourcePanelContainer.remove();
			Simulators.sourceParametersBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		sourcePanelContainer.find('.validate-edit-source, .validate-add-source').on('click', function() {
			if (! Simulators.checkSource(sourcePanelContainer)) {
				return false;
			}
			var sourceContainerGroup = sourcePanelContainer.parent();
			var sourceContainer = sourcePanelContainer.find('.source-container');
			var attributes = sourceContainer.find('.attributes-container');
			var source = { id: sourceContainer.attr('data-id') };
			attributes.find('input.simple-value:visible, select.simple-value:visible').each(function (index) {
				if ($(this).is(':checkbox')) {
					source[$(this).attr('data-attribute')] = $(this).is(':checked') ? 1 : 0;
				} else {
					source[$(this).attr('data-attribute')] = $(this).val();
				}
			});
			if ($(this).hasClass('validate-edit-source')) {
				var oldLabel = Simulators.sourceBackup.find('p[data-attribute=label]').attr('data-value') || '';
				if (source.label != oldLabel) {
					Simulators.changeSourceLabelInDatas(source.id, source.label);
				}
			}
			var columns = [];
			attributes.find('.request-column-container').each(function (c) {
				var expression = $(this).find('.attribute-expression');
				var fields = expression.data('settings').fields;
				var column = expression.attr('data-value');
				var label = '', alias = '';
				if (fields.hasOwnProperty(column.toLowerCase())) {
					alias = column;
					column = column.toLowerCase();
					label = fields[column].label;
				} else {
					label = column;
					alias = column;
				}
				var aliasContainer = $(this).find('.editable-text');
				if (aliasContainer.length > 0) {
					alias = $.trim(aliasContainer.text());
				}
				columns.push({
					column: column,
					label: label,
					alias: alias
				});
			});
			source.columns = columns;
			source.where = Simulators.composeSQLWhereClause(sourcePanelContainer) || 'true';
			var orderby = [];
			attributes.find('.request-orderbykey-container').each(function (o) {
				var expression = $(this).find('.attribute-expression');
				var fields = expression.data('settings').fields;
				var column = expression.attr('data-value');
				var label = '';
				if (fields.hasOwnProperty(column.toLowerCase())) {
					column = column.toLowerCase();
					label = fields[column].label;
				} else {
					label = column;
				}
				var orderContainer = $(this).find('.editable-select');
				var order = orderContainer.attr('data-value');
				orderby.push({
					key: column,
					label: label,
					order: order
				});
			});
			source.orderby = orderby;
			var datasourceType = datasources[source['datasource']].type;
			if (datasourceType !== 'uri') {
				if (source['request'] == '') {
					sourceContainerGroup.find('.alert .error-message').text(Translator.trans('The request field is required'));
					sourceContainerGroup.find('.alert').show();
					return;
				}
			}
			var newSourcePanel = Simulators.drawSourceForDisplay(source);
			if (sourcePanelContainer.find('.source-parameter-panel').length) {
				var parametersPanel = Simulators.drawSourceParametersForDisplay(source.id);
				var parametersContainer = parametersPanel.find('> .card-body');
				sourcePanelContainer.find('.source-parameter-panel').each(function (index) {
					var parameterPanel = $(this);
					var parameter = { id: parameterPanel.attr('data-id') };
					parameterPanel.find('input.simple-value:visible, select.simple-value:visible, span.attribute-expression:visible').each(function (index) {
						var value;
						if ($(this).hasClass('attribute-expression')) {
							value = $(this).expressionbuilder('val');
						} else if ($(this).is(':checkbox')) {
							value = $(this).is(':checked') ? 1 : 0;
						} else {
							value = $(this).val();
						}
						parameter[$(this).attr('data-attribute')] = value;
					});
					parametersContainer.append(Simulators.drawSourceParameterForDisplay(source.datasource, parameter));
				});
				newSourcePanel.find('.collapse').find('> .card-body').append(parametersPanel);
			}
			sourcePanelContainer.replaceWith(newSourcePanel);
			newSourcePanel.find('button.edit-source').on('click', function(e) {
				e.preventDefault();
				Simulators.editSource($($(this).attr('data-parent')));
			});
			newSourcePanel.find('button.delete-source').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteSource($($(this).attr('data-parent')));
			});
			Simulators.sourceParametersBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newSourcePanel.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = false;
		});
		sourcePanelContainer.find('select[data-attribute=datasource]').on('change', function(e) {
			var datasource = $(this).val();
			if (datasources[datasource]) {
				sourcePanelContainer.find(".request-columns-container").attr('data-datasource', datasource);
				var type = datasources[datasource].type;
				switch (type) {
					case 'uri':
						sourcePanelContainer.find('select[data-attribute=requestType]').parent().parent().hide();
						sourcePanelContainer.find('select[data-attribute=table]').parent().parent().hide();
						sourcePanelContainer.find('input[data-attribute=request]').parent().parent().hide();
						sourcePanelContainer.find('input[data-attribute=request]').val('');
						sourcePanelContainer.find('.request-columns-container').parent().parent().hide();
						sourcePanelContainer.find('.request-columns-container').empty();
						sourcePanelContainer.find('.request-filter-tools-container').hide();
						sourcePanelContainer.find('.request-filter-conditions-container').hide();
						sourcePanelContainer.find('.request-filter-conditions').empty();
						sourcePanelContainer.find('.request-filter-expression-container').hide();
						sourcePanelContainer.find('.request-filter-expression').empty();
						sourcePanelContainer.find('.request-orderbykeys-container').parent().parent().hide();
						sourcePanelContainer.find('.request-orderbykeys-container').empty();
						sourcePanelContainer.find('input[data-attribute=nbresult]').parent().parent().hide();
						sourcePanelContainer.find('input[data-attribute=nbresult]').val('');
						sourcePanelContainer.find('input[data-attribute=from]').parent().parent().hide();
						sourcePanelContainer.find('input[data-attribute=from]').val('');
						sourcePanelContainer.find('select[data-attribute=returnType]').parent().parent().show();
						sourcePanelContainer.find('select[data-attribute=returnType]').val('json');
						sourcePanelContainer.find('input[data-attribute=returnPath]').parent().parent().show();
						sourcePanelContainer.find('input[data-attribute=returnPath]').val('');
						break;
					default:
						sourcePanelContainer.find(".request-columns-container").attr('data-database-type', datasources[datasource].dbtype);
						var tables = sourcePanelContainer.find('select[data-attribute=table]');
						tables.empty();
						$.each(datasources[datasource].tables, function(name, table) {
							tables.append('<option value="' + table.name + '">' + table.label + '</option>');
						});
						sourcePanelContainer.find('select[data-attribute=requestType]').parent().parent().show();
						sourcePanelContainer.find('select[data-attribute=requestType]').trigger('change');
						sourcePanelContainer.find('select[data-attribute=returnType]').parent().parent().show();
						sourcePanelContainer.find('select[data-attribute=returnType]').val('assocArray');
						sourcePanelContainer.find('input[data-attribute=returnPath]').parent().parent().show();
						sourcePanelContainer.find('input[data-attribute=returnPath]').val('');
						tables.trigger('change');
				}
			}
		});
		sourcePanelContainer.find('select[data-attribute=requestType]').on('change', function(e) {
			var requestType = $(this).val();
			var datasource = sourcePanelContainer.find('select[data-attribute=datasource]').val();
			var dbtype = datasources[datasource].dbtype;
			if (requestType == 'simple') {
				var request = sourcePanelContainer.find('input[data-attribute=request]').val();
				if (request != '') {
					try {
						var tokenizer = new SQLSelectTokenizer(datasources[datasource].tables, Simulators.SQLFunctions[dbtype]);
						var num = 0;
						var sql = request.replace(/('%([sdf])'|%([sdf])\b)/g, function() {
							num++
							return '$' + num + '$' + arguments[arguments.length - 3]; 
						});
						sql = sql.replace(/'%(\d+)\$([sdf])'/g, function(match, m1, m2, offs, str) {
							return '$' + m1 + '$' + m2;
						});
						sql = sql.replace(/%(\d+)\$([sdf])\b/g, function(match, m1, m2, offs, str) {
							return '$' + m1 + '$' + m2;
						});
						var tokens = tokenizer.parseSelect(sql);
						var table = tokens.from[0].table;
						var columns = datasources[datasource].tables[table.toLowerCase()].columns;
						sourcePanelContainer.find('select[data-attribute=table]').val(table).trigger('change');
						sourcePanelContainer.find(".request-columns-container").attr('data-table', table);
						var columnsContainer = sourcePanelContainer.find('.request-columns-container');
						columnsContainer.empty();
						$.each(tokens.select, function(c, column) {
							var columContainer = Simulators.requestColumnAttributeForInput(column.column, Translator.trans('Select a column'), column.alias);
							columnsContainer.append(columContainer);
							Simulators.bindRequestColumnAttribute(columContainer);
						});
						var conditionsContainer = sourcePanelContainer.find('.request-filter-conditions');
						var expressionContainer = sourcePanelContainer.find('.request-filter-expression');
						if (tokens.where != '' && tokens.where != 'true') {
							if (tokens.conditions && tokens.conditions.conditions) {
								$.each(tokens.conditions.conditions, function(c, condition) {
									if (columns.hasOwnProperty(condition.operand.toLowerCase())) {
										condition.operand = condition.operand.toLowerCase();
									}
									if (columns.hasOwnProperty(condition.value.toLowerCase())) {
										condition.value = condition.value.toLowerCase();
									}
									var conditionContainer = Simulators.requestFilterConditionAttributeForInput(c + 1, condition.operand, Translator.trans('Select a column'), condition.operator, condition.value, Translator.trans('Select a value'));
									conditionsContainer.append(conditionContainer);
								});
								if (tokens.conditions.expression) {
									$.each(tokens.conditions.expression, function(t, token) {
										if (token == '(' || token == ')') {
											expressionContainer.append(Simulators.requestFilterParenthesisAttributeForInput(token));
										} else if (token == 'and' || token == 'or') {
											expressionContainer.append(Simulators.requestFilterConnectorAttributeForInput(token));
										} else {
											expressionContainer.append(Simulators.requestFilterConditionNumAttributeForInput(token));
										}
									});
								}
								Simulators.bindRequestFilterConditionAttribute(sourcePanelContainer);
								Simulators.bindRequestFilterConnectorAttribute(sourcePanelContainer);
								Simulators.bindRequestFilterParenthesisAttribute(sourcePanelContainer);
							}
						}
						var orderByKeysContainer = sourcePanelContainer.find('.request-orderbykeys-container');
						orderByKeysContainer.empty();
						$.each(tokens.orderby, function(o, orderby) {
							var orderByKeyContainer = Simulators.requestOrderByKeyAttributeForInput(orderby.key, Translator.trans('Select a column'), orderby.order);
							orderByKeysContainer.append(orderByKeyContainer);
							Simulators.bindRequestOrderByKeyAttribute(orderByKeyContainer);
						});
						sourcePanelContainer.find('input[data-attribute=nbresult]').val(tokens.limit);
						sourcePanelContainer.find('input[data-attribute=from]').val(tokens.offset);
					} catch (e) {
						console && console.log(e.message);
					}
				}
				sourcePanelContainer.find('input[data-attribute=request]').parent().parent().hide();
				sourcePanelContainer.find('select[data-attribute=table]').parent().parent().show();
				sourcePanelContainer.find('.request-columns-container').parent().parent().show();
				sourcePanelContainer.find('.request-filter-tools-container').show();
				sourcePanelContainer.find('.request-filter-conditions-container').show();
				sourcePanelContainer.find('.request-filter-expression-container').show();
				Simulators.refreshRequestFilterDisplay(sourcePanelContainer.find('.request-filter-conditions-container'));
				sourcePanelContainer.find('.request-orderbykeys-container').parent().parent().show();
				sourcePanelContainer.find('input[data-attribute=nbresult]').parent().parent().show();
				sourcePanelContainer.find('input[data-attribute=from]').parent().parent().show();
			} else {
				var request = Simulators.composeSimpleSQLRequest(sourcePanelContainer, dbtype);
				sourcePanelContainer.find('input[data-attribute=request]').val(request);
				sourcePanelContainer.find('input[data-attribute=request]').parent().parent().show();
				sourcePanelContainer.find('select[data-attribute=table]').parent().parent().hide();
				sourcePanelContainer.find('.request-columns-container').parent().parent().hide();
				sourcePanelContainer.find('.request-filter-tools-container').hide();
				sourcePanelContainer.find('.request-filter-conditions-container').hide();
				sourcePanelContainer.find('.request-filter-expression-container').hide();
				sourcePanelContainer.find('.request-orderbykeys-container').parent().parent().hide();
				sourcePanelContainer.find('input[data-attribute=nbresult]').parent().parent().hide();
				sourcePanelContainer.find('input[data-attribute=from]').parent().parent().hide();
			}
		});
		sourcePanelContainer.find('select[data-attribute=table]').on('change', function(e) {
			var table = $(this).val();
			var datasource = sourcePanelContainer.find('select[data-attribute=datasource]').val();
			Simulators.columnset = {};
			if (datasource && table) {
				Simulators.columnset = datasources[datasource].tables[table.toLowerCase()].columns;
			}
			sourcePanelContainer.find('input[data-attribute=request]').val('');
			sourcePanelContainer.find(".request-columns-container").attr('data-table', table);
			sourcePanelContainer.find('.request-columns-container').empty();
			sourcePanelContainer.find('.request-filter-conditions').empty();
			sourcePanelContainer.find('.request-filter-expression').empty();
			sourcePanelContainer.find('.request-orderbykeys-container').empty();
			sourcePanelContainer.find('input[data-attribute=nbresult]').val('');
			sourcePanelContainer.find('input[data-attribute=from]').val('');
		});
		sourcePanelContainer.find('select[data-attribute=returnType]').on('change', function(e) {
			var returnType = $(this).val();
			if (returnType === 'singleValue') {
				sourcePanelContainer.find('input[data-attribute=returnPath]').parent().parent().hide();
				sourcePanelContainer.find('input[data-attribute=returnPath]').val('');
			} else {
				sourcePanelContainer.find('input[data-attribute=returnPath]').parent().parent().show();
			}
			if (returnType === 'csv') {
				sourcePanelContainer.find('input[data-attribute=separator]').parent().parent().show();
				sourcePanelContainer.find('input[data-attribute=delimiter]').parent().parent().show();
			} else {
				sourcePanelContainer.find('input[data-attribute=separator]').parent().parent().hide();
				sourcePanelContainer.find('input[data-attribute=delimiter]').parent().parent().hide();
				sourcePanelContainer.find('input[data-attribute=separator]').val('');
				sourcePanelContainer.find('input[data-attribute=delimiter]').val('');
			}
		});
		sourcePanelContainer.find(".request-columns-container").sortable({
			cursor: "move",
			containment: "parent",
		});
		sourcePanelContainer.find('.add-request-column').on('click', function( e ) {
			e.preventDefault();
			var columnsContainer = $(this).parent().parent().find('.request-columns-container');
			var columContainer = Simulators.requestColumnAttributeForInput('', Translator.trans('Select a column'), '');
			columnsContainer.append(columContainer);
			Simulators.bindRequestColumnAttribute(columContainer);
		});
		Simulators.bindRequestColumnAttribute(sourcePanelContainer);

		sourcePanelContainer.find('.request-columns-container').on('click', function( e ) {
			if (e.target && $(e.target).hasClass('request-columns-container')) {
				e.preventDefault();
				sourcePanelContainer.find('.add-request-column').trigger('click');
			}
		});

		sourcePanelContainer.find('.request-columns-container').keydown(function( e ) {
			if (e.target && $(e.target).hasClass('request-columns-container') && e.keyCode == 13) {
				e.preventDefault();
				sourcePanelContainer.find('.add-request-column').trigger('click');
			}
		});

		sourcePanelContainer.find('.add-request-condition').on('click', function( e ) {
			e.preventDefault();
			var conditionsContainer = sourcePanelContainer.find('.request-filter-conditions');
			var num = conditionsContainer.children().length + 1;
			var conditionContainer = Simulators.requestFilterConditionAttributeForInput(num, '', Translator.trans('Select a column'), '', '', Translator.trans('Select a value'));
			conditionsContainer.append(conditionContainer);
			Simulators.bindRequestFilterConditionAttribute(conditionContainer);
			var expression = sourcePanelContainer.find('.request-filter-expression');
			var connectorValue = sourcePanelContainer.find('.editable-select.connector').attr('data-value') == 'any' ? 'or' : 'and';
			if (expression.children().length > 0) {
				var connector = Simulators.requestFilterConnectorAttributeForInput(connectorValue);
				expression.append(connector);
				Simulators.bindRequestFilterConnectorAttribute(connector);
			}
			expression.append(Simulators.requestFilterConditionNumAttributeForInput(num));
			Simulators.refreshRequestFilterDisplay(conditionsContainer.parent().parent());
		});
		Simulators.bindRequestFilterConnectorAttribute(sourcePanelContainer);
		sourcePanelContainer.find('.request-filter-expression').sortable({
			cursor: "move",
			containment: "parent",
			axis: "x"
		});
		Simulators.bindRequestFilterToolsAttribute(sourcePanelContainer);
		Simulators.bindRequestFilterConditionAttribute(sourcePanelContainer);
		Simulators.bindRequestFilterParenthesisAttribute(sourcePanelContainer);

		sourcePanelContainer.find('.request-filter-conditions').on('click', function( e ) {
			if (e.target && $(e.target).hasClass('request-filter-conditions')) {
				e.preventDefault();
				sourcePanelContainer.find('.add-request-condition').trigger('click');
			}
		});

		sourcePanelContainer.find('.request-filter-conditions').keydown(function( e ) {
			if (e.target && $(e.target).hasClass('request-filter-conditions') && e.keyCode == 13) {
				e.preventDefault();
				sourcePanelContainer.find('.add-request-condition').trigger('click');
			}
		});

		sourcePanelContainer.find('.add-request-orderbykey').on('click', function( e ) {
			e.preventDefault();
			var orderByKeysContainer = $(this).parent().parent().find('.request-orderbykeys-container');
			var orderByKeyContainer = Simulators.requestOrderByKeyAttributeForInput('', Translator.trans('Select a column'), '');
			orderByKeysContainer.append(orderByKeyContainer);
			Simulators.bindRequestOrderByKeyAttribute(orderByKeyContainer);
		});
		Simulators.bindRequestOrderByKeyAttribute(sourcePanelContainer);

		sourcePanelContainer.find('.request-orderbykeys-container').on('click', function( e ) {
			if (e.target && $(e.target).hasClass('request-orderbykeys-container')) {
				e.preventDefault();
				sourcePanelContainer.find('.add-request-orderbykey').trigger('click');
			}
		});

		sourcePanelContainer.find('.request-orderbykeys-container').keydown(function( e ) {
			if (e.target && $(e.target).hasClass('request-orderbykeys-container') && e.keyCode == 13) {
				e.preventDefault();
				sourcePanelContainer.find('.add-request-orderbykey').trigger('click');
			}
		});
	}

	Simulators.drawSourceParametersForInput = function(sourceId) {
		var parametersPanel = $('<div>', { 'class': 'card bg-light source-parameters-panel', id: 'source-' + sourceId + '-source-parameters-panel' });
		parametersPanel.append('<div class="card-header"><button class="btn btn-secondary float-right update-button add-source-parameter" title="' + Translator.trans('Add parameter') + '"><span class="button-label">' + Translator.trans('Add parameter') + '</span> <span class="fas fa-plus-circle"></span></button>' + Translator.trans('Parameters') + '</div>');
		var parametersPanelBody = $('<div class="card-body"></div>');
		parametersPanel.append(parametersPanelBody);
		return parametersPanel;
	}

	Simulators.drawSourceParameterForInput = function(datasource, parameter) {
		var parameterPanel = $('<div>', { 'class': 'card bg-light source-parameter-panel',  'data-id': parameter.id,  'data-name': parameter.name  });
		parameterPanel.append('<div class="card-header"><button class="btn btn-secondary float-right update-button delete-source-parameter" title="' + Translator.trans('Delete') + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button>' + Translator.trans('Parameter %id%', {'id': parameter.id}) + '</div>');
		var parameterPanelBody = $('<div>', { 'class': 'card-body', id: 'data-' + parameter.sourceId + '-source-parameter-' + parameter.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasList = {};
		$.each(Simulators.dataset, function( name, data) {
			datasList[name] = data.label;
		});
		var typesList;
		if (datasources[datasource].type === 'uri') {
			typesList = { 
				queryString: Translator.trans('Query string parameter'), 
				path: Translator.trans('PATH'),
				header: Translator.trans('HTTP header')
			}
			if (datasources[datasource].method === 'post') {
				typesList.data = Translator.trans('POST data');
			}
		} else {
			typesList = { 
				columnValue: Translator.trans('Column value') 
			}
			parameter.type = 'columnValue';
		}
		var originsList = { 
			'data': Translator.trans('Data'), 
			'constant': Translator.trans('Constant') 
		};
		var ptype = Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'type', Translator.trans('Type'), parameter.type, true, Translator.trans('Select a type'), JSON.stringify(typesList));
		attributes.append(ptype);
		if (datasources[datasource].type !== 'uri') {
			ptype.hide();
		}
		attributes.append(Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'name', Translator.trans('Name'), parameter.name, true, Translator.trans('Parameter name')));
		attributes.append(Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'origin', Translator.trans('Origin'), parameter.origin, true, Translator.trans('Select an origin'), JSON.stringify(originsList)));
		var pdata = Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'data', Translator.trans('Data'), parameter.data, true, Translator.trans('Select a data'), JSON.stringify(datasList));
		attributes.append(pdata);
		var pformat = Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'format', Translator.trans('Format'), parameter.format, true, Translator.trans('Date format of the parameter'), JSON.stringify(Simulators.parameterDateFormats));
		attributes.append(pformat);
		var pconstant = Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'constant', Translator.trans('Constant'), parameter.constant, true, Translator.trans('Constant value of the parameter'));
		attributes.append(pconstant);
		attributes.append(Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'checkbox', 'optional', Translator.trans('Optional'), parameter.optional, true, Translator.trans('Optional')));
		if (parameter.origin === 'data') {
			pconstant.hide();
		} else {
			pdata.hide();
			pformat.hide();
		}
		attributesContainer.append(attributes);
		parameterPanelBody.append(attributesContainer);
		parameterPanel.append(parameterPanelBody);
		return parameterPanel;
	}

	Simulators.bindParameters = function(parametersPanel) {
		parametersPanel.find('button.add-source-parameter').on('click', function(e) {
			var datasource = parametersPanel.parent().parent().find('.source-container').find("select[data-attribute=datasource]").val();
			var parametersContainer = parametersPanel.find('> .card-body');
			var id = parametersContainer.children('div.card').length + 1;
			var sourceId = parametersPanel.attr('id').match(/^source-(\d+)/)[1];
			var parameter = {
				id: id,
				sourceId: sourceId,
				type: '',
				name: '',
				origin: 'data',
				data: '',
				format: '',
				constant: '',
				optional: '0'
			};
			Simulators.parameterset[id] = {
				num: id,
				name: 'unknown',
				type: 'unknown'
			};
			var parameterPanel = Simulators.drawSourceParameterForInput(datasource, parameter);
			parametersContainer.append(parameterPanel);
			Simulators.bindParameter(parameterPanel);
			parameterPanel.find('select[data-attribute=data]').trigger('change');
			$("html, body").animate({ scrollTop: parameterPanel.offset().top - $('#navbar').height() }, 500);
		});
	}

	Simulators.bindParameter = function(parameterPanel) {
		parameterPanel.find('button.delete-source-parameter').on('click', function(e) {
			var num = $(this).parents('.source-parameter-panel').attr('data-id');
			delete Simulators.parameterset[num];
			var parametersPanel = parameterPanel.parents('.source-parameters-panel');
			parameterPanel.remove();
		});
		parameterPanel.find('select[data-attribute=origin]').on('change', function(e) {
			var origin = $(this).val();
			var num = $(this).parents('.source-parameter-panel').attr('data-id');
			if (origin === 'data') {
				parameterPanel.find('input[data-attribute=constant]').parent().parent().hide();
				parameterPanel.find('input[data-attribute=constant]').val('');
				parameterPanel.find('select[data-attribute=data]').parent().parent().show();
				parameterPanel.find('select[data-attribute=data]').trigger('change');
			} else {
				parameterPanel.find('input[data-attribute=constant]').parent().parent().show();
				parameterPanel.find('select[data-attribute=data]').parent().parent().hide();
				parameterPanel.find('select[data-attribute=format]').parent().parent().hide();
				parameterPanel.find('select[data-attribute=format]').val('');
				Simulators.parameterset[num].type = 'text';
			}
		});
		parameterPanel.find('select[data-attribute=data]').on('change', function(e) {
			var data = $(this).val();
			var num = $(this).parents('.source-parameter-panel').attr('data-id');
			if (Simulators.dataset[data]) {
				var type = Simulators.dataset[data].type;
				switch (type) {
					case 'date':
					case 'day':
					case 'month':
					case 'year':
						parameterPanel.find('select[data-attribute=format]').parent().parent().show();
						break;
					default:
						parameterPanel.find('select[data-attribute=format]').parent().parent().hide();
						parameterPanel.find('select[data-attribute=format]').val('');
				}
				Simulators.parameterset[num].type = type;
			}
		});
		parameterPanel.find('input[data-attribute=name]').on('change', function(e) {
			var num = $(this).parents('.source-parameter-panel').attr('data-id');
			Simulators.parameterset[num].name = $(this).val();
		});
	}

	Simulators.checkParameter = function(parameterContainer, sourcePanelContainer) {
		var sourceId = sourcePanelContainer.find('.source-container').attr('data-id');
		var parameterId = parameterContainer.attr('data-id');
		var parameterOldName = parameterContainer.attr('data-name');
		var parameterName = $.trim(parameterContainer.find('input[data-attribute=name]').val());
		if (parameterName === '') {
			sourcePanelContainer.find('.error-message').text(Translator.trans('Parameter %id% : the name is required', { 'id': parameterId }));
			sourcePanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(parameterName)) {
			sourcePanelContainer.find('.error-message').text(Translator.trans('Parameter %id% : Incorrect name', { 'id': parameterId }));
			sourcePanelContainer.find('.alert').show();
			return false;
		}
		if (parameterName != parameterOldName) {
			var exists = false;
			$.each(Simulators.parameterset, function(num, parameter) {
				if (parameterName == parameter.name && parameterId != num) {
					exists = true;
					return false;
				}
			});
			if (exists) {
				sourcePanelContainer.find('.error-message').text(Translator.trans('Parameter %id% : This parameter name already exists', { 'id': parameterId }));
				sourcePanelContainer.find('.alert').show();
				return false;
			}
		}
		var origin = parameterContainer.find('select[data-attribute=origin]').val();
		if (origin === 'data') {
			var dataName = parameterContainer.find('select[data-attribute=data]').val();
			var dataId = Simulators.dataset[dataName].id;
			if ($("#datas").find(".data-container[data-id=" + dataId + "] p[data-attribute='source'][data-value=" + sourceId + "]").length > 0) {
				sourcePanelContainer.find('.error-message').text(Translator.trans('Circular reference between parameter %id% and data «%data%»', { 'id': parameterId, data: Simulators.dataset[dataName].label }));
				sourcePanelContainer.find('.alert').show();
				return false;
			}
			if (Simulators.dataset[dataName].type == 'date') {
				var format = parameterContainer.find('select[data-attribute=format]').val();
				if (! format) {
					sourcePanelContainer.find('.error-message').text(Translator.trans('Parameter %id% : the format is required', { 'id': parameterId }));
					sourcePanelContainer.find('.alert').show();
					return false;
				}
			}
		} else {
			var constant = $.trim(parameterContainer.find('input[data-attribute=constant]').val());
			if (constant == '') {
				sourcePanelContainer.find('.error-message').text(Translator.trans('Parameter %id% : the constant value is required', { 'id': parameterId }));
				sourcePanelContainer.find('.alert').show();
				return false;
			}
		}
		return true;
	}

	Simulators.checkSource = function(sourceContainer) {
		var dataElementId = sourceContainer.attr('id');
		var datasource = $('#' + dataElementId + '-datasource').val();
		if (datasource === '') {
			sourceContainer.find('.error-message').text(Translator.trans('Select a data source'));
			sourceContainer.find('.alert').show();
			return false;
		}
		var returnType = $('#' + dataElementId + '-returnType').val();
		if (datasources[datasource].type === 'uri') {
			var returnPath = $('#' + dataElementId + '-returnPath').val();
			if (returnType == 'xml' && ! Simulators.isValidXPath(returnPath)) {
				sourceContainer.find('.error-message').text(Translator.trans('Invalid return path'));
				sourceContainer.find('.alert').show();
				return false;
			}
		} else {
			var requestType = $('#' + dataElementId + '-requestType').val();
			if (requestType == 'simple') {
				var columns = sourceContainer.find('.request-columns-container');
				if (columns.children().length == 0) {
					sourceContainer.find('.error-message').text(Translator.trans('Please select at least one column'));
					sourceContainer.find('.alert').show();
					return false;
				}
				var incompleteColumn = false;
				var invalidAlias = false;
				columns.find('.request-column-container').find('span[data-attribute=column]').each(function(k) {
					if (! $(this).expressionbuilder('completed')) {
						incompleteColumn = true;
						return false;
					}
					$(this).expressionbuilder('state');
					if ($(this).next('span.column-alias').length > 0) {
						var alias = $(this).next().next().attr('data-value');
						if (alias == '' || ! /^\w+$/.test(alias)) {
							invalidAlias = true;
							return false;
						}
					}
				});
				if (incompleteColumn) {
					sourceContainer.find('.error-message').text(Translator.trans('Please complete the column entry'));
					sourceContainer.find('.alert').show();
					return false;
				}
				if (invalidAlias) {
					sourceContainer.find('.error-message').text(Translator.trans('Invalid column alias'));
					sourceContainer.find('.alert').show();
					return false;
				}
				var incompleteFilter = false;
				sourceContainer.find('.request-filter-condition-edition-container').find('span.attribute-expression').each(function(k) {
					if (! $(this).expressionbuilder('completed')) {
						incompleteFilter = true;
						return false;
					}
					$(this).expressionbuilder('state');
				});
				sourceContainer.find('.request-filter-condition-edition-container').find('span.editable-select.operator').each(function(k) {
					if ($(this).attr('data-value') == '') {
						incompleteFilter = true;
						return false;
					}
				});
				if (incompleteFilter) {
					sourceContainer.find('.error-message').text(Translator.trans('Please complete the filter input'));
					sourceContainer.find('.alert').show();
					return false;
				}
				if (sourceContainer.find('span.editable-select.connector').attr('data-value') == 'advanced') {
					if (! Simulators.checkFilterExpression(sourceContainer)) {
						return false;
					}
				}
				var orderbykeys = sourceContainer.find('.request-orderbykeys-container');
				if (orderbykeys.children().length > 0) {
					var incompleteKey = false;
					orderbykeys.find('.request-orderbykey-container').find('span[data-attribute=orderbykey]').each(function(k) {
						if (! $(this).expressionbuilder('completed')) {
							incompleteKey = true;
							return false;
						}
						$(this).expressionbuilder('state');
					});
					if (incompleteKey) {
						sourceContainer.find('.error-message').text(Translator.trans('Please complete the sort key entry'));
						sourceContainer.find('.alert').show();
						return false;
					}
				}
				if (returnType != 'singleValue' && returnType != 'assocArray') {
					sourceContainer.find('.error-message').text(Translator.trans('Invalid return type'));
					sourceContainer.find('.alert').show();
					return false;
				}
			}
		}
		var parametersOk = true;
		sourceContainer.find('.source-parameter-panel').each(function(p) {
			if (! Simulators.checkParameter($(this), sourceContainer)) {
				parametersOk = false;
				return false;
			}
		});
		return parametersOk;
	}

	Simulators.checkFilterExpression = function(sourceContainer) {
		var error = '';
		var prev = '';
		var openingParenthesis = 0;
		var closingParenthesis = 0;
		sourceContainer.find('.request-filter-expression').find('.request-expression-token').each(function(k) {
			switch ($(this).attr('data-value')) {
				case '(':
					if (prev != '' && $.isNumeric(prev)) {
						error = 'You cannot open a parenthesis right after a condition ID! You need to use a logical operator "and" or "or"';
						return false;
					}
					openingParenthesis++;
					break;
				case ')':
					if (prev == '') {
						error = 'A closing parenthesis can not begin an expression';
						return false;
					} else if (prev == '(') {
						error = 'You cannot use closing parenthesis ")" right after an opening parenthesis "("';
						return false;
					} else if (prev == 'and' || prev == 'or') {
						error = 'You cannot use closing parenthesis ")" right after a logical operator';
						return false;
					}
					closingParenthesis++;
					break;
				case 'and':
				case 'or':
					if (prev == '') {
						error = 'A logical operator can not begin an expression';
						return false;
					} else if (prev == '(') {
						error = 'You cannot use logical operator right after opening parenthesis';
						return false;
					} else if (prev == 'and' || prev == 'or') {
						error = 'You cannot use two logical operators next to each other';
						return false;
					}
					break;
				default:
					if (prev == ')') {
						error = 'You cannot use condition ID right after closing a parenthesis! You need to use a logical operator "and" or "or"';
						return false;
					} else if ($.isNumeric(prev)) {
						error = "You cannot use two condition ID's next to each other";
						return false;
					}
					break;
			}
			prev = $(this).attr('data-value');
		});
		if (error != '') {
			sourceContainer.find('.error-message').text(Translator.trans(error));
			sourceContainer.find('.alert').show();
			return false;
		}
		if (closingParenthesis != openingParenthesis) {
			sourceContainer.find('.error-message').text(Translator.trans("The opening and closing parenthesis do not match"));
			sourceContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.isValidXPath = function (xpath) {
		var evaluator = new XPathEvaluator()
		try {
			evaluator.createExpression(xpath, null)
		} catch(e) {
			return false;
		}
		if	(xpath=='/' || xpath=='.') 
			return false;
		return true;
	}

	Simulators.addSource = function(sourceContainerGroup) {
		$('.update-button').hide();
		$('.toggle-collapse-all').hide();
		var source = {
			id: Simulators.maxSourceId() + 1, 
			label: '',
			datasource: '',
			requestType: 'simple',
			request: '',
			table: '',
			columns: [],
			filter: '',
			orderby: [],
			nbresult: 0,
			'from': 0,
			returnType: '',
			returnPath: '',
			separator: '',
			delimiter: ''
		};
		Simulators.parameterset = {};
		var parameterContainers = sourceContainerGroup.find('div.source-parameter-container');
		if (parameterContainers.length > 0) {
			parameterContainers.each(function(c) {
				var origin = $(this).find("p[data-attribute='origin']").attr('data-value') || 'data';
				Simulators.parameterset[c + 1] = {
					num: c + 1,
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					type: origin === 'data' ? Simulators.dataset[$(this).find("p[data-attribute='data']").attr('data-value')].type : 'text'
				};
			});
		}
		var sourcePanelContainer = Simulators.drawSourceForInput(source);
		sourcePanelContainer.find('button.cancel-edit-source').addClass('cancel-add-source').removeClass('cancel-edit-source');
		sourcePanelContainer.find('button.validate-edit-source').addClass('validate-add-source').removeClass('validate-edit-source');
		var sourcesPanel;
		var parentId = sourceContainerGroup.attr('id');
		if (parentId === 'sources') {
			sourcesPanel = $("#collapsesources").find("> div.sortable");
		} else {
			sourcesPanel = sourceContainerGroup.find(".sources-panel > div.sortable");
		}
		sourcesPanel.append(sourcePanelContainer);
		Simulators.bindSource(sourcePanelContainer);
		$("#collapsesources").collapse('show');
		sourcePanelContainer.find('a[data-toggle="collapse"]').each(function() {
			var objectID=$(this).attr('href');
			$(objectID).collapse('show');
		});
		$("html, body").animate({ scrollTop: sourcePanelContainer.offset().top - $('#navbar').height() }, 500);
		Simulators.updating = true;
	}

	Simulators.editSource = function(sourceContainerGroup) {
		$('.update-button').hide();
		$('.toggle-collapse-all').hide();
		var sourceContainer = sourceContainerGroup.find('.source-container');
		var id = sourceContainer.attr('data-id');
		var attributesContainer = sourceContainer.find('.attributes-container');
		var source = {
			id: sourceContainer.attr('data-id'), 
			label: attributesContainer.find("p[data-attribute='label']").attr('data-value') || '',
			datasource: attributesContainer.find("p[data-attribute='datasource']").attr('data-value'),
			requestType: attributesContainer.find("p[data-attribute='requestType']").attr('data-value'),
			request: decodeURIComponent(attributesContainer.find("p[data-attribute='request']").attr('data-value')),
			table: attributesContainer.find("p[data-attribute='table']").attr('data-value'),
			columns: Simulators.collectRequestColumns(attributesContainer),
			filter: decodeURIComponent(attributesContainer.find("p[data-attribute='filter']").attr('data-value')),
			orderby: Simulators.collectRequestOrderByKeys(attributesContainer),
			nbresult: attributesContainer.find("p[data-attribute='nbresult']").attr('data-value') || 0,
			'from': attributesContainer.find("p[data-attribute='from']").attr('data-value') || 0,
			returnType: attributesContainer.find("p[data-attribute='returnType']").attr('data-value'),
			returnPath: attributesContainer.find("p[data-attribute='returnPath']").attr('data-value') || '',
			separator: attributesContainer.find("p[data-attribute='separator']").attr('data-value'),
			delimiter: attributesContainer.find("p[data-attribute='delimiter']").attr('data-value')
		};
		var sourcePanelContainer = Simulators.drawSourceForInput(source);
		var parametersPanel = Simulators.drawSourceParametersForInput(source.id);
		var parameterContainers = sourceContainerGroup.find('div.source-parameter-container');
		Simulators.parameterset = {};
		if (parameterContainers.length > 0) {
			parametersPanel.find('button.add-parameter').removeClass('update-button').hide();
			parametersPanel.find('button.delete-source-parameter').removeClass('update-button').hide();
			parameterContainers.each(function(c) {
				var parameter = {
					id : $(this).attr('data-id'),
					sourceId: source.id,
					type: $(this).find("p[data-attribute='type']").attr('data-value') || 'columnValue',
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					origin: $(this).find("p[data-attribute='origin']").attr('data-value') || 'data',
					data: $(this).find("p[data-attribute='data']").attr('data-value')  || '',
					format: $(this).find("p[data-attribute='format']").attr('data-value') || '',
					constant: $(this).find("p[data-attribute='constant']").attr('data-value')  || '',
					optional: $(this).find("p[data-attribute='optional']").attr('data-value')  || '0'
				};
				Simulators.parameterset[ c + 1] = {
					num: c + 1,
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					type: parameter.origin === 'data' ? Simulators.dataset[$(this).find("p[data-attribute='data']").attr('data-value')].type : 'text'
				};
				var parameterPanel = Simulators.drawSourceParameterForInput(source.datasource, parameter);
				parametersPanel.find('> .card-body').append(parameterPanel);
				Simulators.bindParameter(parameterPanel);
				parameterPanel.find('select[data-attribute=data]').trigger('change');
			});
		}
		sourcePanelContainer.find('.source-buttons').before(parametersPanel);
		Simulators.bindParameters(parametersPanel);
		Simulators.sourceBackup = sourceContainerGroup.replaceWith(sourcePanelContainer);
		Simulators.bindSource(sourcePanelContainer);
		$("#collapsesource-" + id).collapse('show');
		$("html, body").animate({ scrollTop: sourcePanelContainer.offset().top - $('#navbar').height() }, 500);
		Simulators.updating = true;
	}

	Simulators.deleteSource = function(sourceContainerGroup) {
		var sourceContainer = sourceContainerGroup.find('.source-container');
		var attributesContainer = sourceContainer.find('.attributes-container');
		var id = sourceContainer.attr('data-id');
		var dataId;
		if ((dataId = Simulators.isSourceIdInDatas(id)) !== false) {
			var data = Simulators.findDataById(dataId);
			bootbox.alert({
				title: Translator.trans('Deleting source'),
				message: Translator.trans("This source is used in data #%id% : %label%. You must modify this data before you can delete this source", { 'id': dataId, 'label': data.label }) 
			});
			return;
		}
		bootbox.confirm({
			title: Translator.trans('Deleting source'),
			message: Translator.trans("Are you sure you want to delete this source"), 
			callback: function(confirmed) {
				if (confirmed) {
					var sparent = sourceContainerGroup.parent();
					sourceContainerGroup.remove();
					Simulators.renumberSources(sparent.find('> div'));
					$('.save-simulator').show();
					Admin.updated = true;
				}
			}
		}); 
	}

	Simulators.collectRequestColumns = function(attributesContainer) {
		var columns = [];
		var columnsContainer = attributesContainer.find("p[data-attribute='columns']");
		columnsContainer.find("span[data-attribute='column']").each(function(c) {
			columns.push({
				column: $(this).attr('data-value'),
				alias: $(this).attr('data-alias'),
			});
		});
		return columns;
	}

	Simulators.collectRequestOrderByKeys = function(attributesContainer) {
		var orderbykeys = [];
		var orderbykeysContainer = attributesContainer.find("p[data-attribute='orderbykeys']");
		orderbykeysContainer.find("span[data-attribute='orderbykey']").each(function(c) {
			orderbykeys.push({
				key: $(this).attr('data-value'),
				order: $(this).attr('data-order'),
			});
		});
		return orderbykeys;
	}

	Simulators.collectSources = function() {
		var sources = [];
		var containers = $('#sources').find('div.source-container');
		containers.each(function(i) {
			var attributesContainer = $(this).find('.attributes-container');
			var datasource = attributesContainer.find("p[data-attribute='datasource']").attr('data-value');
			var parameters = [];
			var parameterContainers = $(this).parent().find('div.source-parameter-container');
			parameterContainers.each(function(c) {
				parameters.push({
					type: $(this).find("p[data-attribute='type']").attr('data-value') || 'columnValue',
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					origin: $(this).find("p[data-attribute='origin']").attr('data-value') || 'data',
					data: $(this).find("p[data-attribute='data']").attr('data-value')  || '',
					format: $(this).find("p[data-attribute='format']").attr('data-value') || '',
					constant: $(this).find("p[data-attribute='constant']").attr('data-value')  || '',
					optional: $(this).find("p[data-attribute='optional']").attr('data-value')  || '0'
				});
			});
			var source;
			if (datasources[datasource].type === 'uri') {
				source = {
					id: i + 1, 
					label: attributesContainer.find("p[data-attribute='label']").attr('data-value') || '',
					datasource: datasource,
					returnType: attributesContainer.find("p[data-attribute='returnType']").attr('data-value'),
					returnPath: attributesContainer.find("p[data-attribute='returnPath']").attr('data-value') || '',
					separator: attributesContainer.find("p[data-attribute='separator']").attr('data-value'),
					delimiter: attributesContainer.find("p[data-attribute='delimiter']").attr('data-value'),
					parameters: parameters
				};
			} else {
				source = {
					id: i + 1, 
					label: attributesContainer.find("p[data-attribute='label']").attr('data-value') || '',
					datasource: datasource,
					requestType: attributesContainer.find("p[data-attribute='requestType']").attr('data-value'),
					request: decodeURIComponent(attributesContainer.find("p[data-attribute='request']").attr('data-value')),
					table: attributesContainer.find("p[data-attribute='table']").attr('data-value'),
					columns: Simulators.collectRequestColumns(attributesContainer),
					filter: decodeURIComponent(attributesContainer.find("p[data-attribute='filter']").attr('data-value')),
					orderby: Simulators.collectRequestOrderByKeys(attributesContainer),
					nbresult: attributesContainer.find("p[data-attribute='nbresult']").attr('data-value') || 0,
					'from': attributesContainer.find("p[data-attribute='from']").attr('data-value') || 0,
					returnType: attributesContainer.find("p[data-attribute='returnType']").attr('data-value'),
					returnPath: attributesContainer.find("p[data-attribute='returnPath']").attr('data-value') || '',
					separator: attributesContainer.find("p[data-attribute='separator']").attr('data-value'),
					delimiter: attributesContainer.find("p[data-attribute='delimiter']").attr('data-value'),
					parameters: parameters
				};
				if (source['requestType'] == 'simple') {
					source['dbtype'] = datasources[datasource].dbtype;
				}
			}
			sources.push(source);
		});
		return sources;
	}

}(this));

