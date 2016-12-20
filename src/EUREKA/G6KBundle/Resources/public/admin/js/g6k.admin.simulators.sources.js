/**
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

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

	Simulators.sourceBackup = null;
	
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
		var maxId = 1;
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
				var a = $(this).find('> .panel > .panel-heading').find('> h4 > a');
				a.text(' #' + id + ' ');
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
			update: function( e, ui ) {
				var self = $(this);
				var container = $(ui.item).find('.source-container');
				var id = container.attr('data-id');
				Simulators.renumberSources($(ui.item).parent().find('> div'));
				$('.update-button').show();
				$('.toggle-collapse-all').show();
				Admin.updated = true;
			}
		});
	}

	Simulators.drawSourceForDisplay = function(source) {
		var sourceElementId = 'source-' + source.id;
		var sourcePanelContainer = $('<div>', { 'class': 'panel-group', id: sourceElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var sourcePanel = $('<div>', { 'class': 'panel panel-info' });
		sourcePanel.append('<div class="panel-heading" role="tab" id="' + sourceElementId + '-panel"><button class="btn btn-info pull-right update-button delete-source" title="' + Translator.trans('Delete') + '" data-parent="#' + sourceElementId + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-info pull-right update-button edit-source" title="' + Translator.trans('Edit') + '" data-parent="#' + sourceElementId + '"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + sourceElementId + '" href="#collapse' + sourceElementId + '" aria-expanded="true" aria-controls="collapse' + sourceElementId + '">#' + source.id + '</a></h4></div>');
		var sourcePanelCollapse = $('<div id="collapse' + sourceElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + sourceElementId + '-panel"></div>');
		var sourcePanelBody = $('<div class="panel-body"></div>');
		var sourceContainer = $('<div class="panel panel-default source-container" id="' + sourceElementId + '-attributes-panel" data-id="' + source.id + '"></div>');
		var sourceContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'datasource', Translator.trans('Datasource'), source.datasource, true, Translator.trans('Datasource')));
		if (source.request) {
			attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'request', Translator.trans('Request'), source.request, false, Translator.trans('Request')));
		}
		attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'select', 'returnType', Translator.trans('Return type'), source.returnType, true, Translator.trans('Select a return type'), JSON.stringify(Simulators.sourceReturnTypes)));
		if (source.returnPath) {
			attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'returnPath', Translator.trans('Return path'), source.returnPath, false, Translator.trans('Return path')));
		}
		if (source.separator) {
			attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'separator', Translator.trans('Separator'), source.separator, false, Translator.trans('Separator')));
		}
		if (source.delimiter) {
			attributes.append(Simulators.simpleAttributeForDisplay(sourceElementId, 'text', 'delimiter', Translator.trans('Delimiter'), source.delimiter, false, Translator.trans('Delimiter')));
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
		var parametersPanel = $('<div>', { 'class': 'panel panel-default source-parameters-panel', id: 'source-' + sourceId + '-source--parameters-panel' });
		parametersPanel.append('<div class="panel-heading">' + Translator.trans('Parameters') + '</div>');
		var parametersPanelBody = $('<div class="panel-body"></div>');
		parametersPanel.append(parametersPanelBody);
		return parametersPanel;
	}

	Simulators.drawSourceParameterForDisplay = function(parameter) {
		var parameterPanel = $('<div>', { 'class': 'panel panel-default source-parameter-container',  'data-id': parameter.id });
		parameterPanel.append('<div class="panel-heading">' + Translator.trans('Parameter %id%', { 'id': parameter.id }) + '</div>');
		var parameterPanelBody = $('<div>', { 'class': 'panel-body', id: 'source-' + parameter.sourceId + '-source-parameter-' + parameter.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasList = {};
		var type = '';
		$.each(Simulators.dataset, function( name, data) {
			datasList[name] = data.label;
			if (name == parameter.data) {
				type = data.type;
			}
		});
		var typesList = { 
			queryString: Translator.trans('Query string'), 
			path: Translator.trans('PATH'), 
			data: Translator.trans('Data'), 
			columnValue: Translator.trans('Column value') 
		}
		attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'type', Translator.trans('Type'), parameter.type, true, Translator.trans('Select a type'), JSON.stringify(typesList)));
		attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'name', Translator.trans('Name'), parameter.name, true, Translator.trans('Parameter name')));
		attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'data', Translator.trans('Data'), parameter.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
		if (type === 'date' || type === 'day' || type === 'month' || type === 'year') {
			attributes.append(Simulators.simpleAttributeForDisplay('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'format', Translator.trans('Format'), parameter.format, true, Translator.trans('Parameter format')));
		}
		attributesContainer.append(attributes);
		parameterPanelBody.append(attributesContainer);
		parameterPanel.append(parameterPanelBody);
		return parameterPanel;
	}

	Simulators.drawSourceForInput = function(source) {
		var sourceElementId = 'source-' + source.id;
		var sourcePanelContainer = $('<div>', { 'class': 'panel-group', id: sourceElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var sourcePanel = $('<div>', { 'class': 'panel panel-info' });
		sourcePanel.append('<div class="panel-heading" role="tab" id="' + sourceElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + sourceElementId + '" href="#collapse' + sourceElementId + '" aria-expanded="true" aria-controls="collapse' + sourceElementId + '">#' + source.id + '</a></h4></div>');
		var sourcePanelCollapse = $('<div id="collapse' + sourceElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + sourceElementId + '-panel"></div>');
		var sourcePanelBody = $('<div class="panel-body"></div>');
		var sourceContainer = $('<div class="panel panel-default source-container" id="' + sourceElementId + '-attributes-panel" data-id="' + source.id + '"></div>');
		var sourceContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasourcesList = {};
		var datasourceType = ''
		$.each(datasources, function( name, datasource) {
			datasourcesList[name] = name;
			if (name == source.datasource) {
				datasourceType = datasource.type;
			}
		});
		attributes.append(Simulators.simpleAttributeForInput(sourceElementId + '-datasource', 'select', 'datasource', Translator.trans('Datasource'), source.datasource, true, Translator.trans('Select a data source'), JSON.stringify(datasourcesList)));
		var request = Simulators.simpleAttributeForInput(sourceElementId + '-request', 'text', 'request', Translator.trans('Request'), source.request, true, Translator.trans('Enter a SQL request'));
		attributes.append(request);
		attributes.append(Simulators.simpleAttributeForInput(sourceElementId + '-returnType', 'select', 'returnType', Translator.trans('Return type'), source.returnType, true, Translator.trans('Select a return type'), JSON.stringify(Simulators.sourceReturnTypes)));
		var returnPath = Simulators.simpleAttributeForInput(sourceElementId + '-returnPath', 'text', 'returnPath', Translator.trans('Return path'), source.returnPath, true, Translator.trans('Enter a return path'));
		attributes.append(returnPath);
		var separator = Simulators.simpleAttributeForInput(sourceElementId + '-separator', 'text', 'separator', Translator.trans('Separator'), source.separator, true, Translator.trans('Enter a separator'));
		attributes.append(separator);
		var delimiter = Simulators.simpleAttributeForInput(sourceElementId + '-delimiter', 'text', 'delimiter', Translator.trans('Delimiter'), source.delimiter, true, Translator.trans('Enter a delimiter'));
		attributes.append(delimiter);
		if (datasourceType === 'uri') {
			request.hide();
		}
		if (source.returnType === 'singleValue') {
			returnPath.hide();
		}
		if (source.returnType !== 'csv') {
			separator.hide();
			delimiter.hide();
		}
		attributesContainer.append(attributes);
		sourceContainerBody.append(attributesContainer);
		sourceContainer.append(sourceContainerBody);
		sourcePanelBody.append(sourceContainer);
		var sourceButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + sourceElementId + '-buttons-panel"></div>');
		var sourceButtonsBody = $('<div class="panel-body source-buttons"></div>');
		sourceButtonsBody.append('<button class="btn btn-success pull-right validate-edit-source">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		sourceButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-source">' + Translator.trans('Cancel') + '</span></button>');
		sourceButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-source').click(function(e) {
		    e.preventDefault();
			Simulators.editSource($($(this).attr('data-parent')));
		});
		container.find('button.delete-source').click(function(e) {
		    e.preventDefault();
			Simulators.deleteSource($($(this).attr('data-parent')));
		});
	}

	Simulators.bindSource = function(sourcePanelContainer) {
		sourcePanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		sourcePanelContainer.find('.cancel-edit-source').click(function() {
			sourcePanelContainer.replaceWith(Simulators.sourceBackup);
			Simulators.sourceBackup.find('button.edit-source').click(function(e) {
				e.preventDefault();
				Simulators.editSource($($(this).attr('data-parent')));
			});
			Simulators.sourceBackup.find('button.delete-source').click(function(e) {
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
		sourcePanelContainer.find('.cancel-add-source').click(function() {
			sourcePanelContainer.remove();
			Simulators.sourceParametersBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		sourcePanelContainer.find('.validate-edit-source, .validate-add-source').click(function() {
			var sourceContainerGroup = sourcePanelContainer.parent();
			var sourceContainer = sourcePanelContainer.find('.source-container');
			var attributes = sourceContainer.find('.attributes-container');
			var source = { id: sourceContainer.attr('data-id') };
			attributes.find('input.simple-value:visible, select.simple-value:visible, span.attribute-expression:visible').each(function (index) {
				var value;
				if ($(this).hasClass('attribute-expression')) {
					value = $(this).expressionbuilder('val');
				} else {
					value = $(this).val();
				}
				source[$(this).attr('data-attribute')] = value;
			});
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
				var parametersContainer = parametersPanel.find('> .panel-body');
				sourcePanelContainer.find('.source-parameter-panel').each(function (index) {
					var parameterPanel = $(this);
					var parameter = { id: parameterPanel.attr('data-id') };
					parameterPanel.find('input.simple-value:visible, select.simple-value:visible, span.attribute-expression:visible').each(function (index) {
						var value;
						if ($(this).hasClass('attribute-expression')) {
							value = $(this).expressionbuilder('val');
						} else {
							value = $(this).val();
						}
						parameter[$(this).attr('data-attribute')] = value;
					});
					parametersContainer.append(Simulators.drawSourceParameterForDisplay(parameter));
				});
				newSourcePanel.find('.collapse').find('> .panel-body').append(parametersPanel);
			}
			sourcePanelContainer.replaceWith(newSourcePanel);
			newSourcePanel.find('button.edit-source').click(function(e) {
				e.preventDefault();
				Simulators.editSource($($(this).attr('data-parent')));
			});
			newSourcePanel.find('button.delete-source').click(function(e) {
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
		sourcePanelContainer.find('select[data-attribute=datasource]').change(function(e) {
			var datasource = $(this).val();
			if (datasources[datasource]) {
				var type = datasources[datasource].type;
				switch (type) {
					case 'uri':
						sourcePanelContainer.find('input[data-attribute=request]').parent().parent().hide();
						sourcePanelContainer.find('input[data-attribute=request]').val('');
						break;
					default:
						sourcePanelContainer.find('input[data-attribute=request]').parent().parent().show();
				}
			}
		});
		sourcePanelContainer.find('select[data-attribute=returnType]').change(function(e) {
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
	}

	Simulators.drawSourceParametersForInput = function(sourceId) {
		var parametersPanel = $('<div>', { 'class': 'panel panel-default source-parameters-panel', id: 'source-' + sourceId + '-source-parameters-panel' });
		parametersPanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button add-source-parameter" title="' + Translator.trans('Add parameter') + '"><span class="button-label">' + Translator.trans('Add parameter') + '</span> <span class="glyphicon glyphicon-plus-sign"></span></button>' + Translator.trans('Parameters') + '</div>');
		var parametersPanelBody = $('<div class="panel-body"></div>');
		parametersPanel.append(parametersPanelBody);
		return parametersPanel;
	}

	Simulators.drawSourceParameterForInput = function(parameter) {
		var parameterPanel = $('<div>', { 'class': 'panel panel-default source-parameter-panel',  'data-id': parameter.id  });
		parameterPanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-source-parameter" title="' + Translator.trans('Delete') + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="glyphicon glyphicon-minus-sign"></span></button>' + Translator.trans('Parameter %id%', {'id': parameter.id}) + '</div>');
		var parameterPanelBody = $('<div>', { 'class': 'panel-body', id: 'data-' + parameter.sourceId + '-source-parameter-' + parameter.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		var datasList = {};
		var type = '';
		$.each(Simulators.dataset, function( name, data) {
			datasList[name] = data.label;
			if (name == parameter.data) {
				type = data.type;
			}
		});
		var typesList = { 
			queryString: Translator.trans('Query string'), 
			path: Translator.trans('PATH'), 
			data: Translator.trans('Data'), 
			columnValue: Translator.trans('Column value') 
		}
		attributes.append(Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'type', Translator.trans('Type'), parameter.type, true, Translator.trans('Select a type'), JSON.stringify(typesList)));
		attributes.append(Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'name', Translator.trans('Name'), parameter.name, true, Translator.trans('Parameter name')));
		attributes.append(Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'select', 'data', Translator.trans('Data'), parameter.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
		var format = Simulators.simpleAttributeForInput('source-' + parameter.sourceId + '-source-parameter-' + parameter.id, 'text', 'format', Translator.trans('Format'), parameter.format, true, Translator.trans('Date format of the parameter with characters : d, j, D, l or z (day) - F, M, m or n (month) - Y, y (year)'));
		attributes.append(format);
		if (type !== 'date' && type !== 'day' && type !== 'month' && type !== 'year') {
			format.hide();
		}
		attributesContainer.append(attributes);
		parameterPanelBody.append(attributesContainer);
		parameterPanel.append(parameterPanelBody);
		return parameterPanel;
	}

	Simulators.bindParameters = function(parametersPanel) {
		parametersPanel.find('button.add-source-parameter').click(function(e) {
			var parametersContainer = parametersPanel.find('> .panel-body');
			var id = parametersContainer.children('div.panel').length + 1;
			var sourceId = parametersPanel.attr('id').match(/^source-(\d+)/)[1];
			var parameter = {
				id: id,
				sourceId: sourceId,
				type: '',
				name: '',
				format: '',
				data: ''
			};
			var parameterPanel = Simulators.drawSourceParameterForInput(parameter);
			// parametersPanel.find('button.add-source-parameter').removeClass('update-button').hide();
			parametersContainer.append(parameterPanel);
			Simulators.bindParameter(parameterPanel);
		});
		parametersPanel.find('button.delete-source-parameter').click(function(e) {
			var parametersContainer = parametersPanel.find('> .panel-body');
			parametersContainer.find('.attributes-container').remove();
			parametersPanel.find('button.add-source-parameter').addClass('update-button').show();
		});
	}

	Simulators.bindParameter = function(parameterPanel) {
		parameterPanel.find('button.delete-source-parameter').click(function(e) {
			var parametersPanel = parameterPanel.parents('.source-parameters-panel');
			parameterPanel.remove();
		});
		parameterPanel.find('select[data-attribute=data]').change(function(e) {
			var data = $(this).val();
			if (dataset[data]) {
				var type = dataset[data].type;
				switch (type) {
					case 'date':
					case 'day':
					case 'month':
					case 'year':
						parameterPanel.find('input[data-attribute=format]').parent().parent().show();
						break;
					default:
						parameterPanel.find('input[data-attribute=format]').parent().parent().hide();
						parameterPanel.find('input[data-attribute=format]').val('');
				}
			}
		});
	}

	Simulators.addSource = function(sourceContainerGroup) {
		$('.update-button').hide();
		$('.toggle-collapse-all').hide();
		var source = {
			id: Simulators.maxSourceId() + 1, 
			datasource: '',
			request: '',
			returnType: '',
			returnPath: '',
			separator: '',
			delimiter: ''
		};
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
			datasource: attributesContainer.find("p[data-attribute='datasource']").attr('data-value'),
			request: attributesContainer.find("p[data-attribute='request']").attr('data-value'),
			returnType: attributesContainer.find("p[data-attribute='returnType']").attr('data-value'),
			returnPath: attributesContainer.find("p[data-attribute='returnPath']").attr('data-value'),
			separator: attributesContainer.find("p[data-attribute='separator']").attr('data-value'),
			delimiter: attributesContainer.find("p[data-attribute='delimiter']").attr('data-value')
		};
		var sourcePanelContainer = Simulators.drawSourceForInput(source);
		var parametersPanel = Simulators.drawSourceParametersForInput(source.id);
		var parameterContainers = sourceContainerGroup.find('div.source-parameter-container');
		if (parameterContainers.length > 0) {
			parametersPanel.find('button.add-parameter').removeClass('update-button').hide();
			parametersPanel.find('button.delete-parameter').removeClass('update-button').hide();
			parameterContainers.each(function(c) {
				var parameter = {
					id : $(this).attr('data-id'),
					sourceId: source.id,
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					format: $(this).find("p[data-attribute='format']").attr('data-value') || '',
					data: $(this).find("p[data-attribute='data']").attr('data-value')  || ''
				};
				var parameterPanel = Simulators.drawSourceParameterForInput(parameter);
				parametersPanel.find('> .panel-body').append(parameterPanel);
				Simulators.bindParameter(parameterPanel);
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

	Simulators.collectSources = function() {
		var sources = [];
		var containers = $('#sources').find('div.source-container');
		containers.each(function(i) {
			var parameters = [];
			var parameterContainers = $(this).parent().find('div.source-parameter-container');
			parameterContainers.each(function(c) {
				parameters.push({
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					format: $(this).find("p[data-attribute='format']").attr('data-value') || '',
					data: $(this).find("p[data-attribute='data']").attr('data-value')  || ''
				});
			});
			var attributesContainer = $(this).find('.attributes-container');
			sources.push({
				id: i + 1, 
				datasource: attributesContainer.find("p[data-attribute='datasource']").attr('data-value'),
				request: attributesContainer.find("p[data-attribute='request']").attr('data-value'),
				returnType: attributesContainer.find("p[data-attribute='returnType']").attr('data-value'),
				returnPath: attributesContainer.find("p[data-attribute='returnPath']").attr('data-value'),
				separator: attributesContainer.find("p[data-attribute='separator']").attr('data-value'),
				delimiter: attributesContainer.find("p[data-attribute='delimiter']").attr('data-value'),
				parameters: parameters
			});
		});
		return sources;
	}

}(this));

