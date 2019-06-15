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

	Simulators.dataBackup = null;
	Simulators.datagroupBackup = null;
	Simulators.dataChoicesBackup = null;
	Simulators.dataset = {};
	Simulators.datagroups = {};

	Simulators.collectDataset = function() {
		$('#datas .data-container').each(function(d) {
			if ($(this).hasClass('datagroup')) {
				var name = $(this).find(".attributes-container p[data-attribute='name']").attr('data-value');
				var datagroup = {
					id:  $(this).attr('data-id'),
					label: $(this).find(".attributes-container p[data-attribute='label']").attr('data-value'),
					description: {
						content: $(this).parent().find(".datagroup-description").html(),
						edition: $(this).parent().find(".datagroup-description").attr('data-edition')
					}
				};
				Simulators.datagroups[name] = datagroup;
				$(this).parent().find('.datagroup-data-container').each(function(d) {
					var choices = [];
					$(this).parent().find('.choice-container').each(function(d) {
						choices.push({
							id:  $(this).attr('data-id'),
							name: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
						});
					});
					var name = $(this).find("p[data-attribute='name']").attr('data-value');
					var data = {
						id:  parseInt($(this).attr('data-id')),
						datagroup: datagroup.id,
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						type: $(this).find("p[data-attribute='type']").attr('data-value'),
						description: {
							content: $(this).parent().find(".data-description").html(),
							edition: $(this).parent().find(".data-description").attr('data-edition')
						}
					};
					if (choices.length > 0) {
						data['options'] = choices;
					}
					Simulators.dataset[name] = data;
				});
			} else {
				var choices = [];
				$(this).parent().find('.choice-container').each(function(d) {
					choices.push({
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='value']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
					});
				});
				var name = $(this).find("p[data-attribute='name']").attr('data-value');
				var data = {
					id:  $(this).attr('data-id'),
					datagroup: '',
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					description: {
						content: $(this).parent().find(".data-description").html(),
						edition: $(this).parent().find(".data-description").attr('data-edition')
					}
				};
				if (choices.length > 0) {
					data['options'] = choices;
				}
				Simulators.dataset[name] = data;
			}
		});
		Simulators.dataset['script'] = {
			'id': 20000, 
			'label': Translator.trans('Script'),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('Disabled'),
					'name': 0
				},
				{
					'label': Translator.trans('Enabled'),
					'name': 1
				}
			]
		};
		Simulators.dataset['dynamic'] = {
			'id': 20001, 
			'label': Translator.trans('Interactive UI'),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('No'),
					'name': 0
				},
				{
					'label': Translator.trans('Yes'),
					'name': 1
				}
			]
		};
		$('#steps .step-container').each(function() {
			Simulators.addStepToDataset($(this).attr('data-id'));
		});
	}

	Simulators.addStepToDataset = function(id) {
		Simulators.dataset['step' + id + '.dynamic'] = {
			'id': 10000 + parseInt(id), 
			'label': Translator.trans('Is step %id% interactive ?', { 'id': id }),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('No'),
					'name': 0
				},
				{
					'label': Translator.trans('Yes'),
					'name': 1
				}
			]
		};
	}

	Simulators.deleteStepInDataset = function(id) {
		delete Simulators.dataset['step' + id + '.dynamic'];
	}

	Simulators.findDatagroupById = function(id) {
		var result = null;
		$.each(Simulators.datagroups, function(name, datagroup) {
			if (datagroup.id == id) {
				result = datagroup;
				return false;
			}
		});
		return result;
	}

	Simulators.findDatagroupNameById = function(id) {
		var result = null;
		$.each(Simulators.datagroups, function(name, datagroup) {
			if (datagroup.id == id) {
				result = name;
				return false;
			}
		});
		return result;
	}

	Simulators.findDataById = function(id) {
		var result = null;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id == id) {
				result = data;
				return false;
			}
		});
		return result;
	}

	Simulators.findDataNameById = function(id) {
		var result = null;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id == id) {
				result = name;
				return false;
			}
		});
		return result;
	}

	Simulators.replaceByDataLabel = function(target) {
		return target.replace(
			/#(\d+)/g, 
			function(match, p1) {
				var data = Simulators.findDataById(p1);
				return data != null ? '<data value="' + data.id + '" class="data">« ' + data.label + ' »</data>' : "#" + p1;
			}
		);
	}

	Simulators.getChoiceLabel = function(data, name) {
		var result = "";
		if (data.options) {
			$.each(data.options, function(o, option) {
				if (option.name == name) {
					result = option.label;
					return false;
				}
			});
		}
		return result;
	}

	Simulators.replaceByValueLabel = function(data, value) {
		if (/#\d+/.test(value)) {
			return Simulators.replaceByDataLabel(value);
		} else if (data.type === 'choice') {
			var label = Simulators.getChoiceLabel(data, value);
			return label !== '' ? '« ' + label + ' »' : value;
		} else {
			return value;
		}
	}

	Simulators.maxDatasetId = function() {
		var maxId = 0;
		$.each(Simulators.dataset, function(name, data) {
			var id = parseInt(data.id);
			if (id > maxId && ! /(dynamic|script)$/.test(name)) {
				maxId = id;
			}
		});
		return maxId;
	}

	Simulators.isSourceIdInDatas = function(id) {
		var inData = false;
		var containers = $("#datas").find(".data-container");
		containers.each(function(c) {
			var field = $(this).find("p[data-attribute='source']");
			if (field.attr('data-value') == id) {
				inData = $(this).attr('data-id');
				return false;
			}
		});
		return inData;
	}

	Simulators.changeSourceIdInDatas = function(oldId, id) {
		var fields = $("#datas").find(".data-container p[data-attribute='source']");
		fields.each(function(f) {
			if ($(this).attr('data-value') == oldId) {
				$(this).attr('data-value', id);
				if ($(this).html() == oldId) {
					$(this).html(id);
				}
			}
		});
	}

	Simulators.changeSourceLabelInDatas = function(id, label) {
		var fields = $("#datas").find(".data-container p[data-attribute='source']");
		fields.each(function(f) {
			if ($(this).attr('data-value') == id) {
				$(this).html(label);
			}
		});
	}

	Simulators.isDataIdInDatas = function(id) {
		var inData = false;
		var re1 = new RegExp('#(' + id + '\\b|' + id + '(L))', 'g');
		var re2 = new RegExp('\\<data\\s+([^\\s]*\\s*)value=\\"' + id + '\\"', 'g');
		var containers = $("#datas").find(".data-container, .datagroup-data-container");
		containers.each(function(c) {
			if (! $(this).hasClass('datagroup')) {
				var field = $(this).find("span[data-attribute]");
				if ($.inArray(field.attr('data-attribute'), ['content', 'default', 'min', 'max'] > -1)) {
					if (re1.test(field.attr('data-value'))) {
						 inData = $(this).attr('data-id');
						 return false;
					}
				}
				var description = $(this).find(".data-description").html();
				if (re1.test(description)) {
					inData = $(this).attr('data-id');
					return false;
				}
				if (re2.test(description)) {
					inData = $(this).attr('data-id');
					return false;
				}
			}
		});
		return inData;
	}

	Simulators.isDataIdInDatagroups = function(id) {
		var inDatagroup = false;
		var re1 = new RegExp('#(' + id + '\\b|' + id + '(L))', 'g');
		var re2 = new RegExp('\\<data\\s+([^\\s]*\\s*)value=\\"' + id + '\\"', 'g');
		var containers = $("#datas").find(".data-container.datagroup");
		containers.each(function(c) {
			var description = $(this).find(".datagroup-description").html();
			if (re1.test(description)) {
				inDatagroup = $(this).attr('data-id');
				return false;
			}
			if (re2.test(description)) {
				inDatagroup = $(this).attr('data-id');
				return false;
			}
		});
		return inDatagroup;
	}

	Simulators.renumberDatasPass1 = function(panelGroups, startId) {
		var id = startId - 1;
		panelGroups.each(function(index) {
			var dataContainer = $(this).find(".data-container, .datagroup-data-container");
			id++;
			if (dataContainer.hasClass('datagroup')) {
				var dataGroups = dataContainer.parent().find('.datas-panel > .card-body > div');
				id = Simulators.renumberDatasPass1(dataGroups, id);
			} else {
				var oldId = dataContainer.attr('data-id');
				if (id != oldId) {
					$(this).attr('id', 'data-' + id);
					var re = new RegExp("data-" + oldId + '([^\\d])?', 'g');
					var a = $(this).find('> .card > .card-header').find('> h4 > a');
					var txt = $.trim(a.text()).replace(/#\d+\s+:/,  ' #' + id + ' :');
					a.text(txt + ' ');
					var descendants = $(this).find('*');
					descendants.each(function(d) {
						if (this.hasAttribute('id')) {
							var attr = $(this).attr('id');
							attr = attr.replace(re, "data-" + id + '$1');
							$(this).attr('id', attr);
						}
						if (this.hasAttribute('data-parent')) {
							var attr = $(this).attr('data-parent');
							attr = attr.replace(re, "data-" + id + '$1');
							$(this).attr('data-parent', attr);
						}
						if (this.hasAttribute('href')) {
							var attr = $(this).attr('href');
							attr = attr.replace(re, "data-" + id + '$1');
							$(this).attr('href', attr);
						}
						if (this.hasAttribute('aria-controls')) {
							var attr = $(this).attr('aria-controls');
							attr = attr.replace(re, "data-" + id + '$1');
							$(this).attr('aria-controls', attr);
						}
						if (this.hasAttribute('aria-labelledby')) {
							var attr = $(this).attr('aria-labelledby');
							attr = attr.replace(re, "data-" + id + '$1');
							$(this).attr('aria-labelledby', attr);
						}
					});
					Simulators.changeDataIdInSteps(oldId, 'X' + id)
					Simulators.changeDataIdInRules(oldId, 'X' + id)
					Simulators.changeDataIdInProfiles(oldId, 'X' + id)
					Simulators.changeDataIdInRichText(oldId, 'X' + id);
					Simulators.changeDataIdInExpression(oldId, 'X' + id);
				}
			}
		});
		return id;
	}

	Simulators.renumberDatasPass2 = function(panelGroups, startId) {
		var id = startId - 1;
		panelGroups.each(function(index) {
			var dataContainer = $(this).find(".data-container, .datagroup-data-container");
			id++;
			if (dataContainer.hasClass('datagroup')) {
				var dataGroups = dataContainer.parent().find('.datas-panel > .card-body > div');
				id = Simulators.renumberDatasPass2(dataGroups, id);
			} else {
				var oldId = dataContainer.attr('data-id');
				if (id != oldId) {
					dataContainer.attr('data-id', id);
					var data = Simulators.findDataById(oldId);
					data.id = id;
					Simulators.changeDataIdInSteps('X' + data.id, data.id);
					Simulators.changeDataIdInRules('X' + data.id, data.id);
					Simulators.changeDataIdInProfiles('X' + data.id, data.id);
					Simulators.changeDataIdInRichText('X' + data.id, data.id);
					Simulators.changeDataIdInExpression('X' + data.id, data.id);
				}
			}
		});
		return id;
	}

	Simulators.renumberDatas = function(panelGroups) {
		Simulators.renumberDatasPass1(panelGroups, 1);
		Simulators.renumberDatasPass2(panelGroups, 1);
	}

	Simulators.renumberDatagroups = function(panelGroups) {
		var id = 0;
		panelGroups.each(function(index) {
			var dataContainer = $(this).find(".data-container");
			if (dataContainer.hasClass('datagroup')) {
				var oldId = dataContainer.attr('data-id');
				id++;
				if (id != oldId) {
					$(this).attr('id', 'datagroup-' + id);
					var re = new RegExp("datagroup-" + oldId + '([^\\d])?', 'g');
					var descendants = $(this).find('*');
					descendants.each(function(d) {
						if (this.hasAttribute('id')) {
							var attr = $(this).attr('id');
							attr = attr.replace(re, "datagroup-" + id + '$1');
							$(this).attr('id', attr);
						}
						if (this.hasAttribute('data-parent')) {
							var attr = $(this).attr('data-parent');
							attr = attr.replace(re, "datagroup-" + id + '$1');
							$(this).attr('data-parent', attr);
						}
						if (this.hasAttribute('href')) {
							var attr = $(this).attr('href');
							attr = attr.replace(re, "datagroup-" + id + '$1');
							$(this).attr('href', attr);
						}
						if (this.hasAttribute('aria-controls')) {
							var attr = $(this).attr('aria-controls');
							attr = attr.replace(re, "datagroup-" + id + '$1');
							$(this).attr('aria-controls', attr);
						}
						if (this.hasAttribute('aria-labelledby')) {
							var attr = $(this).attr('aria-labelledby');
							attr = attr.replace(re, "datagroup-" + id + '$1');
							$(this).attr('aria-labelledby', attr);
						}
					});
					Simulators.changeDatagroupIdInSteps(oldId, 'X' + id)
				}
			}
		});
		id = 0;
		panelGroups.each(function(index) {
			var dataContainer = $(this).find(".data-container");
			if (dataContainer.hasClass('datagroup')) {
				var oldId = dataContainer.attr('data-id');
				id++;
				if (id != oldId) {
					dataContainer.attr('data-id', id);
					var datagroup = Simulators.findDatagroupById(oldId);
					datagroup.id = id;
					Simulators.changeDatagroupIdInSteps('X' + datagroup.id, datagroup.id);
				}
			}
		});
	}

	Simulators.bindSortableDatas = function(container) {
		if (! container ) {
			container = $("#page-simulators #collapsedatas");
		}
		container.find("> .sortable, .datas-panel > .sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			sort: function(event, ui) {
				if (Simulators.updating) {
					Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
					setTimeout(function() {
						container.find("> .sortable, .datas-panel > .sortable").sortable('cancel');
					}, 0);
				}
			},
			update: function( e, ui ) {
				if (!Simulators.updating) {
					Simulators.renumberDatas(container.find('> .sortable > div'));
					Simulators.renumberDatagroups(container.find('> .sortable > div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
				}
		});
	}

	Simulators.bindDataButtons = function(container) {
		if (! container ) {
			container = $("#collapsedatas");
		}
		container.find('button.edit-data').on('click', function(e) {
		    e.preventDefault();
			Simulators.editData($($(this).attr('data-parent')));
		});
		container.find('button.delete-data').on('click', function(e) {
		    e.preventDefault();
			Simulators.deleteData($($(this).attr('data-parent')));
		});
	}

	Simulators.bindOptionalDataSource = function(dataPanelContainer) {
		dataPanelContainer.find('select[data-attribute=source]').on('change', function(e) {
			var source = $(this).val();
			var index = dataPanelContainer.find(':input[data-attribute=index]');
			var optionalIndex = dataPanelContainer.find('.optional-attributes').find('li[data-name=index]');
			var returnType =  $('#collapsesources').find('.source-container[data-id=' + source + ']').find('p[data-attribute=returnType]');
			if (returnType.attr('data-value') == 'assocArray') {
				var columns = $('#collapsesources').find('.source-container[data-id=' + source + ']').find('span[data-attribute=column]');
				var indicesList = {};
				columns.each(function(k) {
					indicesList["'" + $(this).attr('data-alias') + "'"] = $(this).attr('data-alias');
				});
				if (index.length > 0) {
					if (index.is('select')) {
						index.empty();
						columns.each(function(k) {
							index.append($('<option>', {value: "'" + $(this).attr('data-alias') + "'", text: $(this).attr('data-alias')}));
						});
					} else {
						var attribute = Simulators.simpleAttributeForInput(index.attr('id'), 'select', 'index', 'label', '', false, index.attr('placeholder'), JSON.stringify(indicesList)); 
						index.replaceWith(attribute.find('select'));
					}
				}
				optionalIndex.attr('data-type', 'select');
				optionalIndex.attr('data-options', encodeURI(JSON.stringify( indicesList )));
			} else {
				if (index.length > 0) {
					if (index.is('select')) {
						var attribute = Simulators.simpleAttributeForInput(index.attr('id'), 'text', 'index', 'label', '', false, index.attr('data-placeholder')); 
						index.replaceWith(attribute.find('input'));
					} else {
						index.val('');
					}
				}
				optionalIndex.attr('data-type', 'text');
				optionalIndex.removeAttr('data-options');
			}
		});
	}

	Simulators.bindData = function(dataPanelContainer) {
		var wysihtml5Options = $.extend(true, {}, Admin.wysihtml5Options, {
			toolbar: {
				insertFootnoteReference: false
			}
		});
		dataPanelContainer.find('textarea').wysihtml(wysihtml5Options);
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.cancel-edit-data').on('click', function() {
			dataPanelContainer.replaceWith(Simulators.dataBackup);
			Simulators.dataBackup.find('button.edit-data').on('click', function(e) {
				e.preventDefault();
				Simulators.editData($($(this).attr('data-parent')));
			});
			Simulators.dataBackup.find('button.delete-data').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteData($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.cancel-add-data').on('click', function() {
			dataPanelContainer.remove();
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.validate-edit-data, .validate-add-data').on('click', function() {
			if (! Simulators.checkData(dataPanelContainer)) {
				return false;
			}
			var dataContainerGroup = dataPanelContainer.parent();
			var dataContainer = dataPanelContainer.find('.data-container');
			var attributes = dataContainer.find('.attributes-container');
			var data = { 
				id: dataContainer.attr('data-id'),
				datagroup: dataContainer.attr('data-datagroup')
			};
			attributes.find('input.simple-value, select.simple-value, span.attribute-expression').each(function (index) {
				var value;
				if ($(this).hasClass('attribute-expression')) {
					value = $(this).expressionbuilder('val');
				} else if ($(this).is(':checkbox')) {
					value = $(this).is(':checked') ? 1 : 0;
				} else {
					value = $(this).val();
				}
				data[$(this).attr('data-attribute')] = value;
			});
			if (data['name']) {
				data['name'] = $.trim(data['name']);
			}
			data.description = {
				content: Admin.clearHTML(dataPanelContainer.find('.data-description')),
				edition: 'wysihtml'
			};
			var newDataPanel = Simulators.drawDataForDisplay(data);
			var choices = [];
			if (data.type == 'choice') {
				var choicesPanel = Simulators.drawChoicesForDisplay(data.id);
				var choicesContainer = choicesPanel.find('> .card-body');
				var id = 0;
				dataPanelContainer.find('.choice-panel').each(function (index) {
					var values = $(this).find('input');
					choices.push({
						id:  ++id,
						name: values.eq(0).val(),
						label: values.eq(1).val()
					});
					choicesContainer.append(Simulators.drawChoiceForDisplay({
						id: id,
						value: values.eq(0).val(),
						label: values.eq(1).val()
					}));
				});
				dataPanelContainer.find('.choice-source-container').each(function (index) {
					var choiceSource = {
						id: '',
						idColumn: '',
						valueColumn: '',
						labelColumn: ''
					};
					$(this).find('input.simple-value, select.simple-value').each(function (v) {
						choiceSource[$(this).attr('data-attribute')] = $(this).val();
					});
					choicesContainer.append(Simulators.drawChoiceSourceForDisplay(choiceSource));
				});
				newDataPanel.find('.collapse').find('> .card-body').append(choicesPanel);
			}
			dataPanelContainer.replaceWith(newDataPanel);
			newDataPanel.find('button.edit-data').on('click', function(e) {
				e.preventDefault();
				Simulators.editData($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.delete-data').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteData($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			if ($(this).hasClass('validate-edit-data')) {
				var oldName = Simulators.dataBackup.find("p[data-attribute='name']").attr('data-value');
				var oldLabel = Simulators.dataset[oldName].label;
				if (Simulators.dataset[oldName].options) {
					var oldChoices = Simulators.dataset[oldName].options;
					if (oldChoices.length > 0) {
						$.each(oldChoices, function(c) {
							if (c < choices.length) {
								if (oldChoices[c].label != choices[c].label) {
									Simulators.changeDataChoiceLabelInProfiles(data.id, oldChoices[c].name, choices[c].label);
								}
								if (oldChoices[c].name != choices[c].name) {
									Simulators.changeDataChoiceValueInProfiles(data.id, oldChoices[c].name, choices[c].name);
								}
							}
						});
					}
				}
				if (data.label != oldLabel) {
					Simulators.changeDataLabelInSteps(data.id, oldLabel, data.label)
					Simulators.changeDataLabelInRules(data.id, data.label);
					Simulators.changeDataLabelInProfiles(data.id, data.label)
					Simulators.changeDataLabelInSources(oldName, data.label);
				}
				if (data.name != oldName) {
					Simulators.changeDataNameInRules(oldName, data.name);
					Simulators.changeDataNameInSources(oldName, data.name);
					delete Simulators.dataset[oldName];
				}
			}
			Simulators.dataset[data.name] = {
				id: data.id,
				label: data.label,
				type: data.type,
				description: {
					content: data.description.content,
					edition: 'wysihtml'
				}
			}
			if (choices.length > 0) {
				Simulators.dataset[data.name].options = choices;
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newDataPanel.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = false;
		});
		Simulators.bindOptionalAttributes(dataPanelContainer, function(attribute) {
			if (attribute.attr('data-name') == 'source') {
				Simulators.bindOptionalDataSource(dataPanelContainer);
			}
		});
		dataPanelContainer.find('select[data-attribute=type]').on('change', function(e) {
			var type = $(this).val();
			if (type === 'choice') {
				var choicesPanel;
				if (Simulators.dataChoicesBackup) {
					choicesPanel = Simulators.dataChoicesBackup;
				} else {
					var typeId = $(this).attr('id');
					var id = typeId.match(/^data-(\d+)-type/)[1];
					choicesPanel = Simulators.drawChoicesForInput(id);
					choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
					choicesPanel.find('.edit-choice-source').removeClass('update-button').hide();
				}
				dataPanelContainer.find('.description-panel').after(choicesPanel);
				Simulators.bindChoices(choicesPanel);
			} else {
				Simulators.dataChoicesBackup = dataPanelContainer.find('.choices-panel').detach();
			}
			var attributes = dataPanelContainer.find(".attributes-container");
			var optionalAttributes = dataPanelContainer.find(".optional-attributes");
			if (type === 'text' || type === 'textarea') {
				attributes.find("span[data-attribute='min']").prev().find('span:last-child').text(Translator.trans('Minimum length'));
				attributes.find("span[data-attribute='max']").prev().find('span:last-child').text(Translator.trans('Maximum length'));
				optionalAttributes.find("li[data-name='min']").text(Translator.trans('Minimum length'));
				optionalAttributes.find("li[data-name='max']").text(Translator.trans('Maximum length'));
			} else {
				attributes.find("span[data-attribute='min']").prev().find('span:last-child').text(Translator.trans('Minimum value'));
				attributes.find("span[data-attribute='max']").prev().find('span:last-child').text(Translator.trans('Maximum value'));
				optionalAttributes.find("li[data-name='min']").text(Translator.trans('Minimum value'));
				optionalAttributes.find("li[data-name='max']").text(Translator.trans('Maximum value'));
			}
		});
		Simulators.bindOptionalDataSource(dataPanelContainer);
		dataPanelContainer.find('.attribute-expression').each(function( index ) {
			var expression = $( this );
			expression.expressionbuilder({
				fields: Simulators.dataset,
				constants: Simulators.expressionOptions.constants,
				functions: Simulators.expressionOptions.functions,
				operators: Simulators.expressionOptions.operators,
				initial: expression.attr('data-value'),
				onCompleted: Simulators.expressionOptions.onCompleted,
				onEditing: Simulators.expressionOptions.onEditing,
				onError: Simulators.expressionOptions.onError,
				language: Simulators.expressionOptions.language,
				operandHolder: Simulators.expressionOptions.operandHolder,
				operatorHolder: Simulators.expressionOptions.operatorHolder,
				nestedExpression: Simulators.expressionOptions.nestedExpression
			});
		});
	}

	Simulators.bindDatagroupButtons = function(container) {
		if (! container ) {
			container = $("#collapsedatas");
		}
		container.find('button.edit-datagroup').on('click', function(e) {
		    e.preventDefault();
			Simulators.editDatagroup($($(this).attr('data-parent')));
		});
		container.find('button.delete-datagroup').on('click', function(e) {
		    e.preventDefault();
			Simulators.deleteDatagroup($($(this).attr('data-parent')));
		});
		container.find('button.add-data').on('click', function(e) {
		    e.preventDefault();
			Simulators.addData($($(this).attr('data-parent')));
		});
	}

	Simulators.bindDatagroup = function(dataPanelContainer) {
		var wysihtml5Options = $.extend(true, {}, Admin.wysihtml5Options, {
			toolbar: {
				insertFootnoteReference: false
			}
		});
		dataPanelContainer.find('textarea').wysihtml(wysihtml5Options);
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.cancel-edit-datagroup').on('click', function() {
			dataPanelContainer.replaceWith(Simulators.datagroupBackup);
			Simulators.datagroupBackup.find('button.edit-datagroup').on('click', function(e) {
				e.preventDefault();
				Simulators.editDatagroup($($(this).attr('data-parent')));
			});
			Simulators.datagroupBackup.find('button.add-data').on('click', function(e) {
				e.preventDefault();
				Simulators.addData($($(this).attr('data-parent')));
			});
			Simulators.datagroupBackup.find('button.delete-datagroup').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteDatagroup($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.cancel-add-datagroup').on('click', function() {
			dataPanelContainer.remove();
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		dataPanelContainer.find('.validate-edit-datagroup, .validate-add-datagroup').on('click', function() {
			var dataContainerGroup = dataPanelContainer.parent();
			var dataContainer = dataPanelContainer.find('.data-container');
			if (! Simulators.checkDatagroup(dataPanelContainer)) {
				return false;
			}
			var attributes = dataContainer.find('.attributes-container');
			var datagroup = { id: dataContainer.attr('data-id') };
			attributes.find('input.simple-value').each(function (index) {
				if ($(this).is(':checkbox')) {
					datagroup[$(this).attr('data-attribute')] = $(this).is(':checked') ? 1 : 0;
				} else {
					datagroup[$(this).attr('data-attribute')] = $(this).val();
				}
			});
			if (datagroup['name']) {
				datagroup['name'] = $.trim(datagroup['name']);
			}
			datagroup.description = {
				content: Admin.clearHTML(dataPanelContainer.find('.datagroup-description')),
				edition: 'wysihtml'
			};
			dataPanelContainer.find('.datagroup-description').attr('data-edition', 'wysihtml');
			var newDataPanel = Simulators.drawDatagroupForDisplay(datagroup);
			newDataPanel.find('.description-panel').after(dataPanelContainer.find('.datas-panel'));
			dataPanelContainer.replaceWith(newDataPanel);
			if ($(this).hasClass('validate-edit-datagroup')) {
				var oldName = Simulators.datagroupBackup.find("p[data-attribute='name']").attr('data-value');
				var oldLabel = Simulators.datagroups[oldName].label;
				if (datagroup.label != oldLabel) {
					Simulators.changeDatagroupLabelInSteps(datagroup.id, oldLabel, datagroup.label);
					Simulators.changeDatagroupLabelInRules(oldName, datagroup.label);
				}
				if (datagroup.name != oldName) {
					Simulators.changeDatagroupNameInRules(oldName, datagroup.name);
					delete Simulators.datagroups[oldName];
				}
			}
			Simulators.datagroups[datagroup.name] = {
				id: datagroup.id,
				label: datagroup.label,
				description: {
					content: datagroup.description.content,
					edition: datagroup.description.edition
				}
			}
			newDataPanel.find('button.edit-datagroup').on('click', function(e) {
				e.preventDefault();
				Simulators.editDatagroup($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.add-data').on('click', function(e) {
				e.preventDefault();
				Simulators.addData($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.delete-datagroup').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteDatagroup($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
		});
	}

	Simulators.bindChoices = function(choicesPanel) {
		choicesPanel.find('button.add-choice').on('click', function(e) {
			var choicesContainer = choicesPanel.find('> .card-body');
			var id = choicesContainer.children('div.card').length + 1;
			var dataId = choicesPanel.attr('id').match(/^data-(\d+)/)[1];
			var choice = {
				id: id,
				dataId: dataId,
				value: '',
				label: ''
			};
			var choicePanel = Simulators.drawChoiceForInput(choice);
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesContainer.append(choicePanel);
			Simulators.bindChoice(choicePanel);
		});
		choicesPanel.find('button.add-choice-source').on('click', function(e) {
			var choicesContainer = choicesPanel.find('> .card-body');
			var dataId = choicesPanel.attr('id').match(/^data-(\d+)/)[1];
			var choiceSource = {
				id: 1,
				dataId: dataId,
				idColumn: '',
				valueColumn: '',
				labelColumn: ''
			};
			var choicePanel = Simulators.drawChoiceSourceForInput(choiceSource);
			choicesPanel.find('button.add-choice').removeClass('update-button').hide();
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
			choicesContainer.append(choicePanel);
			Simulators.bindChoiceSource(choicePanel);
		});
		choicesPanel.find('button.delete-choice-source').on('click', function(e) {
			var choicesContainer = choicesPanel.find('> .card-body');
			choicesContainer.find('.attributes-container').remove();
			choicesPanel.find('button.add-choice').addClass('update-button').show();
			choicesPanel.find('button.add-choice-source').addClass('update-button').show();
			choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
		});
	}

	Simulators.drawChoicesForDisplay = function(dataId) {
		var choicesPanel = $('<div>', { 'class': 'card bg-light choices-panel', id: 'data-' + dataId + '-choices-panel' });
		choicesPanel.append('<div class="card-header">' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="card-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Simulators.drawChoicesForInput = function(dataId) {
		var choicesPanel = $('<div>', { 'class': 'card bg-light choices-panel', id: 'data-' + dataId + '-choices-panel' });
		choicesPanel.append('<div class="card-header"><button class="btn btn-secondary float-right update-button delete-choice-source" title="' + Translator.trans('Delete source') + '"><span class="button-label">' + Translator.trans('Delete source') + '</span> <span class="fas fa-minus-circle"></span></button><button class="btn btn-secondary float-right update-button add-choice-source" title="' + Translator.trans('Add source') + '"><span class="button-label">' + Translator.trans('Add source') + '</span> <span class="fas fa-plus-circle"></span></button><button class="btn btn-secondary float-right update-button add-choice" title="' + Translator.trans('Add choice') + '"><span class="button-label">' + Translator.trans('Add choice') + '</span> <span class="fas fa-plus-circle"></span></button>' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="card-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Simulators.bindChoice = function(choicePanel) {
		choicePanel.find('button.delete-choice').on('click', function(e) {
			var choicesPanel = choicePanel.parents('.choices-panel');
			choicePanel.remove();
			if (choicesPanel.find('> .card-body').children().length == 0) {
				var choicesPanelHeading = choicesPanel.find('> .card-header');
				choicesPanelHeading.find('button.add-choice-source').addClass('update-button').show();
			}
		});
	}

	Simulators.drawChoiceForDisplay = function(choice) {
		var choicePanel = $('<div>', { 'class': 'card bg-light choice-container',  'data-id': choice.id });
		choicePanel.append('<div class="card-header">' + Translator.trans('Choice %id%', { 'id': choice.id }) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'card-body', id: 'data-' + choice.dataId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choice.dataId + '-choice-' + choice.id, 'text', 'value', Translator.trans('Value'), choice.value, choice.value, true, Translator.trans('Choice value')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choice.dataId + '-choice-' + choice.id, 'text', 'label', Translator.trans('Label'), choice.label, choice.label, true, Translator.trans('Choice label')));
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Simulators.drawChoiceForInput = function(choice) {
		var choicePanel = $('<div>', { 'class': 'card bg-light choice-panel',  'data-id': choice.id  });
		choicePanel.append('<div class="card-header"><button class="btn btn-secondary float-right update-button delete-choice" title="' + Translator.trans('Delete') + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button>' + Translator.trans('Choice %id%', {'id': choice.id}) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'card-body', id: 'data-' + choice.dataId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append('<div class="form-group row"><label for="data-' + choice.dataId + '-choice-' + choice.id + '-value" class="col-sm-4 col-form-label">' + Translator.trans('Value') + '</label><div class="col-sm-8 input-group"><input type="text" name="data-' + choice.dataId + '-choice-' + choice.id + '-value" id="data-' + choice.dataId + '-choice-' + choice.id + '-value" class="form-control simple-value" placeholder="' + Translator.trans('Choice value') + '"  value="' + choice.value + '" /></div></div>');
		attributes.append('<div class="form-group row"><label for="data-' + choice.dataId + '-choice-' + choice.id + '-label" class="col-sm-4 col-form-label">' + Translator.trans('Label') + '</label><div class="col-sm-8 input-group"><input type="text" name="data-' + choice.dataId + '-choice-' + choice.id + '-label" id="data-' + choice.dataId + '-choice-' + choice.id + '-label" class="form-control simple-value" placeholder="' + Translator.trans('Choice label') + '"  value="' + choice.label + '" /></div></div>');
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Simulators.bindChoiceSource = function(choiceSourceContainer) {
		choiceSourceContainer.find('select[data-attribute=id]').on('change', function(e) {
			var source = $(this).val();
			var columns = $('#collapsesources').find('.source-container[data-id=' + source + ']').find('span[data-attribute=column]');
			if (columns.length > 0) {
				var valueColumn = choiceSourceContainer.find('select[data-attribute=valueColumn]');
				if (valueColumn.length > 0) {
					valueColumn.empty();
				} else {
					var input = choiceSourceContainer.find('input[data-attribute=valueColumn]');
					valueColumn = $('<select>', {
						'name': input.attr('name'),
						'id': input.attr('id'),
						'data-attribute': input.attr('data-attribute'),
						'class': input.attr('class'),
						'data-placeholder': input.attr('placeholder')
					});
					input.replaceWith(valueColumn);
				}
				columns.each(function(k) {
					valueColumn.append($('<option>', {value: $(this).attr('data-alias'), text: $(this).attr('data-alias')}));
				});
				var labelColumn = choiceSourceContainer.find('select[data-attribute=labelColumn]');
				if (labelColumn.length > 0) {
					labelColumn.empty();
				} else {
					var input = choiceSourceContainer.find('input[data-attribute=labelColumn]');
					labelColumn = $('<select>', {
						'name': input.attr('name'),
						'id': input.attr('id'),
						'data-attribute': input.attr('data-attribute'),
						'class': input.attr('class'),
						'data-placeholder': input.attr('placeholder')
					});
					input.replaceWith(labelColumn);
				}
				columns.each(function(k) {
					labelColumn.append($('<option>', {value: $(this).attr('data-alias'), text: $(this).attr('data-alias')}));
				});
				var idColumn = choiceSourceContainer.find('select[data-attribute=idColumn]');
				if (idColumn.length > 0) {
					idColumn.empty();
				} else {
					var input = choiceSourceContainer.find('input[data-attribute=idColumn]');
					idColumn = $('<select>', {
						'name': input.attr('name'),
						'id': input.attr('id'),
						'data-attribute': input.attr('data-attribute'),
						'class': input.attr('class'),
						'data-placeholder': input.attr('placeholder')
					});
					input.replaceWith(idColumn);
				}
				columns.each(function(k) {
					idColumn.append($('<option>', {value: $(this).attr('data-alias'), text: $(this).attr('data-alias')}));
				});
				idColumn = choiceSourceContainer.find('.optional-attributes').find('li[data-name=idColumn]');
				var sourceFieldsList = {};
				columns.each(function(k) {
					sourceFieldsList[$(this).attr('data-alias')] = $(this).attr('data-alias');
				});
				idColumn.attr('data-type', 'select');
				idColumn.attr('data-options', encodeURI(JSON.stringify( sourceFieldsList )));
			} else {
				var valueColumn = choiceSourceContainer.find('select[data-attribute=valueColumn]');
				if (valueColumn.length > 0) {
					var input = $('<input>', {
						'type': 'text',
						'name': valueColumn.attr('name'),
						'id': valueColumn.attr('id'),
						'data-attribute': valueColumn.attr('data-attribute'),
						'class': valueColumn.attr('class'),
						'placeholder': valueColumn.attr('data-placeholder')
					});
					valueColumn.replaceWith(input);
				}
				var labelColumn = choiceSourceContainer.find('select[data-attribute=labelColumn]');
				if (labelColumn.length > 0) {
					var input = $('<input>', {
						'type': 'text',
						'name': labelColumn.attr('name'),
						'id': labelColumn.attr('id'),
						'data-attribute': labelColumn.attr('data-attribute'),
						'class': labelColumn.attr('class'),
						'placeholder': labelColumn.attr('data-placeholder')
					});
					labelColumn.replaceWith(input);
				}
				var idColumn = choiceSourceContainer.find('select[data-attribute=idColumn]');
				if (idColumn.length > 0) {
					var input = $('<input>', {
						'type': 'text',
						'name': idColumn.attr('name'),
						'id': idColumn.attr('id'),
						'data-attribute': idColumn.attr('data-attribute'),
						'class': idColumn.attr('class'),
						'placeholder': idColumn.attr('data-placeholder')
					});
					idColumn.replaceWith(input);
				}
				idColumn = choiceSourceContainer.find('.optional-attributes').find('li[data-name=idColumn]');
				idColumn.attr('data-type', 'text');
				idColumn.removeAttr('data-options');
			}
		});
		Simulators.bindOptionalAttributes(choiceSourceContainer);
	}

	Simulators.drawChoiceSourceForDisplay = function(choiceSource) {
		var sourcesList = {};
		$('#collapsesources').find('.source-container').each(function(s) {
			sourcesList[$(this).attr('data-id')] = $(this).find('p[data-attribute=label]').attr('data-value') || Translator.trans('Source') + ' ' + $(this).attr('data-id');
		});
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'select', 'id', Translator.trans('Source'), choiceSource.id, choiceSource.id, true, Translator.trans('Select a source'), JSON.stringify(sourcesList)));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, choiceSource.idColumn, false, Translator.trans('Source column id')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, choiceSource.valueColumn, true, Translator.trans('Source column value')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, choiceSource.labelColumn, true, Translator.trans('Source column label')));
		attributesContainer.append(attributes);
		return attributesContainer;
	}

	Simulators.drawChoiceSourceForInput = function(choiceSource) {
		var sourcesList = {};
		$('#collapsesources').find('.source-container').each(function(s) {
			sourcesList[$(this).attr('data-id')] = $(this).find('p[data-attribute=label]').attr('data-value') || Translator.trans('Source') + ' ' + $(this).attr('data-id');
		});
		var sourceFieldsList = {};
		var columns = $('#collapsesources').find('.source-container[data-id=' + choiceSource.id + ']').find('span[data-attribute=column]');
		columns.each(function(k) {
			sourceFieldsList[$(this).attr('data-alias')] = $(this).attr('data-alias');
		});
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-id', 'select', 'id', Translator.trans('Source'), choiceSource.id, true, Translator.trans('Select a source'), JSON.stringify(sourcesList))); 
		if (columns.length > 0) {
			attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-valueColumn', 'select', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, true, Translator.trans('Source column value'), JSON.stringify(sourceFieldsList)));
			attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-labelColumn', 'select', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, true, Translator.trans('Source column label'), JSON.stringify(sourceFieldsList)));
		} else {
			attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-valueColumn', 'text', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, true, Translator.trans('Source column value')));
			attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-labelColumn', 'text', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, true, Translator.trans('Source column label')));
		}
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '" data-type="select" data-name="idColumn" data-placeholder="' + Translator.trans('Source column id value') + '" data-options="' + encodeURI(JSON.stringify( sourceFieldsList )) + '">' + Translator.trans('Source column id') + '</li>');
		optionalAttributes.append(optionalAttribute);
		optionalAttributesPanel.append(optionalAttributes);
		if (choiceSource.idColumn) {
			if (columns.length > 0) {
				attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-idColumn', 'select', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, false, Translator.trans('Source column id'), JSON.stringify(sourceFieldsList)));
			} else {
				attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-idColumn', 'text', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, false, Translator.trans('Source column id')));
			}
			optionalAttribute.hide();
		}
		attributesContainer.append(attributes);
		attributesContainer.append(optionalAttributesPanel);
		return attributesContainer;
	}

	Simulators.drawDataForDisplay = function(data) {
		var dataElementId = 'data-' + data.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'card bg-info' });
		dataPanel.append('<div class="card-header" role="tab" id="' + dataElementId + '-panel"><button class="btn btn-info float-right update-button delete-data" title="' + Translator.trans('Delete') + '" data-parent="#' + dataElementId + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button><button class="btn btn-info float-right update-button edit-data" title="' + Translator.trans('Edit') + '" data-parent="#' + dataElementId + '"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="fas fa-pencil-alt"></span></button><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">#' + data.id + ' : ' + data.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="card-body"></div>');
		var dataContainer = $('<div class="card bg-light" id="' + dataElementId + '-attributes-panel" data-datagroup="' + data.datagroup + '" data-id="' + data.id + '"></div>');
		if (data.datagroup == '') {
			dataContainer.addClass('data-container');
		} else {
			dataContainer.addClass('datagroup-data-container');
		}
		var dataContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'name', Translator.trans('Name'), data.name, data.name, true, Translator.trans('Data name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'label', Translator.trans('Label'), data.label, data.label, true, Translator.trans('Data label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'select', 'type', Translator.trans('Type'), data.type, data.type, true, Translator.trans('Select a data type'), JSON.stringify(Admin.types)));
		$.each(Simulators.optionalAttributes, function (name, attr) {
			if (data[name]) {
				var attribute;
				if (name == 'source') {
					var source = $('#collapsesources').find('.source-container[data-id=' + data[name] + ']').find('p[data-attribute=label]').attr('data-value') || data[name];
					attribute = Simulators.simpleAttributeForDisplay(dataElementId, 'text', name, attr.label, data[name], source, false, attr.placeholder);
				} else if (name == 'index') {
					var returnType =  $('#collapsesources').find('.source-container[data-id=' + data['source'] + ']').find('p[data-attribute=returnType]');
					if (returnType.attr('data-value') == 'assocArray') {
						attribute = Simulators.simpleAttributeForDisplay(dataElementId, 'text', name, attr.label, data[name], data[name], false, attr.placeholder);
					} else {
						attribute = Simulators.simpleAttributeForDisplay(dataElementId, 'text', name, attr.label, "'" + data[name] + "'", "'" + data[name] + "'", false, attr.placeholder);
					}
				} else if (attr.type === 'expression') {
					if (name == 'min') {
						if (data.type == 'text' || data.type == 'textarea') {
							attribute = Simulators.expressionAttributeForDisplay(dataElementId, name, Translator.trans('Minimum length'), data[name], Simulators.replaceByDataLabel(data[name]), false, attr.placeholder);
						} else {
							attribute = Simulators.expressionAttributeForDisplay(dataElementId, name, Translator.trans('Minimum value'), data[name], Simulators.replaceByDataLabel(data[name]), false, attr.placeholder);
						}
					} else if (name == 'max') {
						if (data.type == 'text' || data.type == 'textarea') {
							attribute = Simulators.expressionAttributeForDisplay(dataElementId, name, Translator.trans('Maximum length'), data[name], Simulators.replaceByDataLabel(data[name]), false, attr.placeholder);
						} else {
							attribute = Simulators.expressionAttributeForDisplay(dataElementId, name, Translator.trans('Maximum value'), data[name], Simulators.replaceByDataLabel(data[name]), false, attr.placeholder);
						}
					} else {
						attribute = Simulators.expressionAttributeForDisplay(dataElementId, name, attr.label, data[name], Simulators.replaceByDataLabel(data[name]), false, attr.placeholder);
					}
				} else {
					attribute = Simulators.simpleAttributeForDisplay(dataElementId, attr.type, name, attr.label, data[name], data[name], false, attr.placeholder);
				}
				requiredAttributes.append(attribute);
			} 
		});
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="card bg-light" id="' + dataElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body data-description rich-text" data-edition="' + data.description.edition + '">' + data.description.content + '</div></div>');
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDataForInput = function(data) {
		var dataElementId = 'data-' + data.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'card bg-info' });
		dataPanel.append('<div class="card-header" role="tab" id="' + dataElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">#' + data.id + ' : ' + data.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="card-body"></div>');
		var dataContainer = $('<div class="card bg-light data-container" id="' + dataElementId + '-attributes-panel" data-datagroup="' + data.datagroup + '" data-id="' + data.id + '" data-name="' + data.name + '"></div>');
		var dataContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group row"><label for="' + dataElementId + '-name" class="col-sm-4 col-form-label">' + Translator.trans('Name') + '</label><div class="col-sm-8 input-group"><input type="text" name="' + dataElementId + '-name" id="' + dataElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Data name without spaces or special characters') + '" value="' + data.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group row"><label for="' + dataElementId + '-label" class="col-sm-4 col-form-label">' + Translator.trans('Label') + '</label><div class="col-sm-8 input-group"><input type="text" name="' + dataElementId + '-label" id="' + dataElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Data label') + '" value="' + data.label + '" /></div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(dataElementId + '-type', 'select', 'type', 'Type', data.type, true, Translator.trans('Select a data type'), JSON.stringify(Admin.types)));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var sourcesList = {};
		$('#collapsesources').find('.source-container').each(function(s) {
			sourcesList[$(this).attr('data-id')] = $(this).find('p[data-attribute=label]').attr('data-value') || Translator.trans('Source') + ' ' + $(this).attr('data-id');
		});
		var indicesList = {};
		var source = data.source || 1;
		var returnType =  $('#collapsesources').find('.source-container[data-id=' + source + ']').find('p[data-attribute=returnType]');
		if (returnType.attr('data-value') == 'assocArray') {
			var columns = $('#collapsesources').find('.source-container[data-id=' + source + ']').find('span[data-attribute=column]');
			columns.each(function(k) {
				indicesList["'" + $(this).attr('data-alias') + "'"] = $(this).attr('data-alias');
			});
		}
		$.each(Simulators.optionalAttributes, function (name, attr) {
			var optionalAttribute;
			if (name === 'source') {
				optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="' + attr.type + '" data-name="' + name + '" data-placeholder="' + attr.placeholder + '" data-options="' + encodeURI(JSON.stringify( sourcesList )) + '">' + attr.label + '</li>');
			} else if (name === 'index') {
				if (returnType.attr('data-value') == 'assocArray') {
					optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="' + attr.type + '" data-name="' + name + '" data-placeholder="' + attr.placeholder + '" data-options="' + encodeURI(JSON.stringify( indicesList )) + '">' + attr.label + '</li>');
				} else {
					optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-placeholder="' + attr.placeholder + '">' + attr.label + '</li>');
				}
			} else if (attr.type === 'expression') {
				if (name == 'min') {
					if (data.type == 'text' || data.type == 'textarea') {
						optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + '">' + Translator.trans('Minimum length') + '</li>');
					} else {
						optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + '">' + Translator.trans('Minimum value') + '</li>');
					}
				} else if (name == 'max') {
					if (data.type == 'text' || data.type == 'textarea') {
						optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + '">' + Translator.trans('Maximum length') + '</li>');
					} else {
						optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + '">' + Translator.trans('Maximum value') + '</li>');
					}
				} else {
					optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + '">' + attr.label + '</li>');
				}
			} else {
				optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + dataElementId + '" data-type="' + attr.type + '" data-name="' + name + '" data-placeholder="' + attr.placeholder + '">' + attr.label + '</li>');
			}
			optionalAttributes.append(optionalAttribute);
			if (data[name]) {
				var attribute;
				if (name === 'source') {
					attribute = Simulators.simpleAttributeForInput(dataElementId + '-' + name, 'select', name, attr.label, data[name], false, attr.placeholder, JSON.stringify(sourcesList)); 
				} else if (name === 'index') {
					if (returnType.attr('data-value') == 'assocArray') {
						attribute = Simulators.simpleAttributeForInput(dataElementId + '-' + name, 'select', name, attr.label, data[name], false, attr.placeholder, JSON.stringify(indicesList)); 
					} else {
						var value = data[name].replace(/^'/, '').replace(/'$/, '');
						attribute = Simulators.simpleAttributeForInput(dataElementId + '-' + name, 'text', name, attr.label, value, false, attr.placeholder); 
					}
				} else if (attr.type === 'expression') {
					if (name == 'min') {
						if (data.type == 'text' || data.type == 'textarea') {
							attribute = Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, Translator.trans('Minimum length'), data[name], false, attr.placeholder);
						} else {
							attribute = Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, Translator.trans('Minimum value'), data[name], false, attr.placeholder);
						}
					} else if (name == 'max') {
						if (data.type == 'text' || data.type == 'textarea') {
							attribute = Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, Translator.trans('Maximum length'), data[name], false, attr.placeholder);
						} else {
							attribute = Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, Translator.trans('Maximum value'), data[name], false, attr.placeholder);
						}
					} else {
						attribute = Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, attr.label, data[name], false, attr.placeholder);
					}
				} else {
					attribute = Simulators.simpleAttributeForInput(dataElementId + '-' + name, attr.type, name, attr.label, data[name], false, attr.placeholder);
				}
				requiredAttributes.append(attribute);
				optionalAttribute.hide();
			} 
		});
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="card bg-light description-panel" id="' + dataElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body"><textarea rows="5" name="' + dataElementId + '-description" id="' + dataElementId + '-description" wrap="hard" class="form-control data-description">' + Simulators.paragraphs(data.description).content + '</textarea></div></div>');
		var dataButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + dataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="card-body data-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success float-right validate-edit-data">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		dataButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-data">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataPanelBody.append(dataButtonsPanel);
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDatagroupForDisplay = function(datagroup) {
		var dataElementId = 'datagroup-' + datagroup.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'card bg-success' });
		dataPanel.append('<div class="card-header" role="tab" id="' + dataElementId + '-panel"><button class="btn btn-success float-right update-button delete-datagroup" title="' + Translator.trans('Delete') + '" data-parent="#' + dataElementId + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button><button class="btn btn-success float-right update-button add-data" title="' + Translator.trans('Add data') + '" data-parent="#' + dataElementId + '"><span class="button-label">' + Translator.trans('Add data') + '</span> <span class="fas fa-plus-circle"></span></button><button class="btn btn-success float-right update-button edit-datagroup" title="' + Translator.trans('Edit datagroup') + '" data-parent="#' + dataElementId + '"><span class="button-label">' + Translator.trans('Edit datagroup') + '</span> <span class="fas fa-pencil-alt"></span></button><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">' + Translator.trans('Group') + ' ' + datagroup.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="card-body"></div>');
		var dataContainer = $('<div class="card bg-light data-container datagroup" id="' + dataElementId + '-attributes-panel" data-id="' + datagroup.id + '"></div>');
		var dataContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'name', Translator.trans('Group Name'), datagroup.name, datagroup.name, true, Translator.trans('Group Name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'label', Translator.trans('Group Label'), datagroup.label, datagroup.label, true, Translator.trans('Group Label')));
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="card bg-light description-panel" id="' + dataElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body datagroup-description rich-text" data-edition="' + datagroup.description.edition + '">' + datagroup.description.content + '</div></div>');
		dataPanelBody.append('<div class="card bg-light datas-panel" id="' + dataElementId + '-datas-panel"><div class="card-body sortable"></div></div>');
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDatagroupForInput = function(datagroup) {
		var dataElementId = 'datagroup-' + datagroup.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'card bg-success' });
		dataPanel.append('<div class="card-header" role="tab" id="' + dataElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">' + Translator.trans('Group') + ' ' + datagroup.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="card-body"></div>');
		var dataContainer = $('<div class="card bg-light data-container datagroup" id="' + dataElementId + '-attributes-panel" data-id="' + datagroup.id + '" data-name="' + datagroup.name + '"></div>');
		var dataContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group row"><label for="' + dataElementId + '-name" class="col-sm-2 col-form-label">' + Translator.trans('Group Name') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-name" id="' + dataElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Group name without spaces or special characters') + '" value="' + datagroup.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group row"><label for="' + dataElementId + '-label" class="col-sm-2 col-form-label">' + Translator.trans('Group Label') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-label" id="' + dataElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Group label') + '" value="' + datagroup.label + '" /></div></div>');
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="card bg-light description-panel" id="' + dataElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body"><textarea rows="5" name="' + dataElementId + '-description" id="' + dataElementId + '-description" wrap="hard" class="form-control datagroup-description">' + Simulators.paragraphs(datagroup.description).content + '</textarea></div></div>');
		var dataButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + dataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="card-body datagroup-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success float-right validate-edit-datagroup">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		dataButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-datagroup">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataPanelBody.append(dataButtonsPanel);
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.checkData = function(dataPanelContainer) {
		var dataElementId = dataPanelContainer.attr('id');
		var dataId = dataPanelContainer.find('.data-container').attr('data-id');
		var dataOldName = dataPanelContainer.find('.data-container').attr('data-name');
		var dataName = $.trim($('#' + dataElementId + '-name').val());
		if (dataName === '') {
			dataPanelContainer.find('.error-message').text(Translator.trans('The data name is required'));
			dataPanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(dataName)) {
			dataPanelContainer.find('.error-message').text(Translator.trans('Incorrect data name'));
			dataPanelContainer.find('.alert').show();
			return false;
		}
		if (dataName != dataOldName) {
			if (Simulators.dataset[dataName] && Simulators.dataset[dataName].id != dataId) {
				dataPanelContainer.find('.error-message').text(Translator.trans('This data name already exists'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		var dataLabel = $.trim($('#' + dataElementId + '-label').val());
		if (dataLabel === '') {
			dataPanelContainer.find('.error-message').text(Translator.trans('The data label is required'));
			dataPanelContainer.find('.alert').show();
			return false;
		}
		var source = dataPanelContainer.find('.data-container select[data-attribute=source]');
		if (source.length > 0) {
			if ($('#source-' + source.val() + '-source-parameters-panel').find(".source-parameter-container p[data-attribute=data][data-value='" + dataName + "']").length > 0) {
				dataPanelContainer.find('.error-message').text(Translator.trans('Circular reference between data «%data%» and source «%source%»', { data: dataLabel, source: source.find('option:selected').text() }));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		var dataId = dataPanelContainer.find('.data-container').attr('data-id');
		var deflt = dataPanelContainer.find('.data-container span[data-attribute=default]');
		if (deflt.length > 0) { 
			if (! deflt.expressionbuilder("completed")) {
				dataPanelContainer.find('.error-message').text(Translator.trans('Please, complete the input of the default value'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
			deflt.expressionbuilder("state");
			if (! Simulators.checkDataInExpression(dataId, deflt)) {
				dataPanelContainer.find('.error-message').text(Translator.trans('The default value can not refer to the data itself'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		var min = dataPanelContainer.find('.data-container span[data-attribute=min]');
		if (min.length > 0) { 
			if (! min.expressionbuilder("completed")) {
				dataPanelContainer.find('.error-message').text(Translator.trans('Please, complete the input of min'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
			min.expressionbuilder("state");
			if (! Simulators.checkDataInExpression(dataId, min)) {
				dataPanelContainer.find('.error-message').text(Translator.trans('min can not refer to the data itself'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		var max = dataPanelContainer.find('.data-container span[data-attribute=max]');
		if (max.length > 0) { 
			if (! max.expressionbuilder("completed")) {
				dataPanelContainer.find('.error-message').text(Translator.trans('Please, complete the input of max'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
			max.expressionbuilder("state");
			if (! Simulators.checkDataInExpression(dataId, max)) {
				dataPanelContainer.find('.error-message').text(Translator.trans('max can not refer to the data itself'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		var content = dataPanelContainer.find('.data-container span[data-attribute=content]');
		if (content.length > 0) { 
			if (! content.expressionbuilder("completed")) {
				dataPanelContainer.find('.error-message').text(Translator.trans('Please, complete the input of Content'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
			content.expressionbuilder("state");
			if (! Simulators.checkDataInExpression(dataId, content)) {
				dataPanelContainer.find('.error-message').text(Translator.trans('Content can not refer to the data itself'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		var pattern = dataPanelContainer.find('.data-container input[data-attribute=pattern]');
		if (pattern.length > 0 && pattern.val() != '') {
			var type = dataPanelContainer.find('.data-container select[data-attribute=type]');
			if (type.val() != 'text') {
				dataPanelContainer.find('.error-message').text(Translator.trans("pattern attribute only applies to data of type 'text'"));
				dataPanelContainer.find('.alert').show();
				return false;
			}
			try {
				var re = new RegExp(pattern.val());
				re.test('dummy');
			} catch(err) {
				dataPanelContainer.find('.error-message').text(Translator.trans("Invalid pattern: %error%", { 'error': err.message }));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		return true;
	}

	Simulators.addData = function(dataContainerGroup) {
		try {
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var datagroup = '';
			if (dataContainerGroup.attr('id') != 'datas') {
				var datagroupContainer = dataContainerGroup.find('.data-container.datagroup');
				if (datagroupContainer.length > 0) {
					datagroup = datagroupContainer.attr('data-id');
				}
			}
			var data = {
				id: Simulators.maxDatasetId() + 1,
				datagroup: datagroup,
				name: '',
				label: '',
				description: {
					content: '',
					edition: ''
				}
			};
			var dataPanelContainer = Simulators.drawDataForInput(data);
			dataPanelContainer.find('button.cancel-edit-data').addClass('cancel-add-data').removeClass('cancel-edit-data');
			dataPanelContainer.find('button.validate-edit-data').addClass('validate-add-data').removeClass('validate-edit-data');
			var datasPanel;
			var parentId = dataContainerGroup.attr('id');
			if (parentId === 'datas') {
				datasPanel = $("#collapsedatas").find("> div.sortable");
			} else {
				datasPanel = dataContainerGroup.find(".datas-panel > div.sortable");
			}
			datasPanel.append(dataPanelContainer);
			Simulators.bindData(dataPanelContainer);
			$("#collapse" + parentId).collapse('show');
			dataPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID=$(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: dataPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editData = function(dataContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
			var attributesContainer = dataContainer.find('.attributes-container');
			var data = {
				id: dataContainer.attr('data-id'), 
				datagroup: dataContainer.attr('data-datagroup'), 
				name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
				label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
				type: attributesContainer.find("p[data-attribute='type']").attr('data-value'),
				description: {
					content: dataContainerGroup.find('.data-description').html(),
					edition: dataContainerGroup.find('.data-description').attr('data-edition')
				}
			};
			$.each(Simulators.optionalAttributes, function (name, attr) {
				var oattr = attributesContainer.find("p[data-attribute='" + name + "'], span[data-attribute='" + name + "']");
				if (oattr.length > 0) {
					data[name] = oattr.attr('data-value');
				}
			});
			var dataPanelContainer = Simulators.drawDataForInput(data);
			if (data.type === 'choice') {
				var choicesPanel = Simulators.drawChoicesForInput(data.id);
				var choiceSourceContainers = dataContainerGroup.find('div.choice-source-container');
				if (choiceSourceContainers.length > 0) {
					choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
					choicesPanel.find('button.add-choice').removeClass('update-button').hide();
					choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
					var choiceSource = {
						id : choiceSourceContainers.eq(0).attr('data-id'),
						dataId: data.id,
						valueColumn: choiceSourceContainers.eq(0).find("p[data-attribute='valueColumn']").attr('data-value'),
						labelColumn: choiceSourceContainers.eq(0).find("p[data-attribute='labelColumn']").attr('data-value'),
						idColumn: choiceSourceContainers.eq(0).find("p[data-attribute='idColumn']").attr('data-value')
					};
					var choicePanel = Simulators.drawChoiceSourceForInput(choiceSource);
					choicesPanel.find('> .card-body').append(choicePanel);
					Simulators.bindChoiceSource(choicePanel);
				} else {
					var choiceContainers = dataContainerGroup.find('div.choice-container');
					if (choiceContainers.length > 0) {
						choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
						choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
						choiceContainers.each(function(c) {
							var choice = {
								id : $(this).attr('data-id'),
								dataId: data.id,
								value: $(this).find("p[data-attribute='value']").attr('data-value'),
								label: $(this).find("p[data-attribute='label']").attr('data-value')
							};
							var choicePanel = Simulators.drawChoiceForInput(choice);
							choicesPanel.find('> .card-body').append(choicePanel);
							Simulators.bindChoice(choicePanel);
						});
					}
				}
				dataPanelContainer.find('.description-panel').after(choicesPanel);
				Simulators.bindChoices(choicesPanel);
			}
			Simulators.dataBackup = dataContainerGroup.replaceWith(dataPanelContainer);
			Simulators.bindData(dataPanelContainer);
			$("#collapse" + dataContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: dataPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.isDataDeleteable = function(id, name) {
		var data;
		if ((data = Simulators.isDataIdInDatas(id)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in data #%id%. You must modify this data before you can delete this one", { 'id': data }) 
			});
			return false;
		}
		var datagroup;
		if ((datagroup = Simulators.isDataIdInDatagroups(id)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in datagroup #%id%. You must modify this datagroup before you can delete this data", { 'id': datagroup }) 
			});
			return false;
		}
		var source;
		if ((source = Simulators.isDataNameInSources(name)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in source #%id%. You must modify this source before you can delete this data", { 'id': source }) 
			});
			return false;
		}
		var step;
		if ((step = Simulators.isDataIdInSteps(id)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in step #%id%. You must modify this step before you can delete this data", { 'id': step }) 
			});
			return false;
		}
		var rule;
		if ((rule = Simulators.isDataIdInRules(id)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in rule #%id%. You must modify this rule before you can delete this data", { 'id': rule }) 
			});
			return false;
		}
		if ((rule = Simulators.isDataNameInRules(name)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in rule #%id%. You must modify this rule before you can delete this data", { 'id': rule }) 
			});
			return false;
		}
		var profile;
		if ((profile = Simulators.isDataInProfiles(id)) !== false) {
			bootbox.alert({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("This data is used in profile #%id%. You must modify this profile before you can delete this data", { 'id': profile }) 
			});
			return false;
		}
		return true;
	}

	Simulators.deleteData = function(dataContainerGroup) {
		try {
			var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
			var id = dataContainer.attr('data-id');
			var attributesContainer = dataContainer.find('.attributes-container');
			var name = attributesContainer.find("p[data-attribute='name']").attr('data-value');
			var dataLabel = attributesContainer.find("p[data-attribute='label']").attr('data-value');
			if (! Simulators.isDataDeleteable(id, name)) {
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting data'),
				message: Translator.trans("Are you sure you want to delete the data : %label% ?", { 'label': dataLabel }), 
				callback: function(confirmed) {
					if (confirmed) {
						delete Simulators.dataset[name];
						dataContainerGroup.remove();
						Simulators.renumberDatas($("#page-simulators #collapsedatas").find('> .sortable > div'));
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.checkDatagroup = function(dataPanelContainer) {
		var datagroupElementId = dataPanelContainer.attr('id');
		var datagroupId = dataPanelContainer.find('.data-container.datagroup').attr('data-id');
		var datagroupOldName = dataPanelContainer.find('.data-container.datagroup').attr('data-name');
		var datagroupName = $.trim($('#' + datagroupElementId + '-name').val());
		if (datagroupName === '') {
			dataPanelContainer.find('.error-message').text(Translator.trans('The datagroup name is required'));
			dataPanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(datagroupName)) {
			dataPanelContainer.find('.error-message').text(Translator.trans('Incorrect datagroup name'));
			dataPanelContainer.find('.alert').show();
			return false;
		}
		if (datagroupName != datagroupOldName) {
			if (Simulators.datagroups[datagroupName] && Simulators.datagroups[datagroupName].id != datagroupId) {
				dataPanelContainer.find('.error-message').text(Translator.trans('This datagroup name already exists'));
				dataPanelContainer.find('.alert').show();
				return false;
			}
		}
		return true;
	}

	Simulators.addDatagroup = function(dataContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var datagroup = {
				id: parseInt(Simulators.maxDatasetId()) + 1, 
				name: '',
				label: '',
				description: {
					content: '',
					edition: ''
				}
			};
			var dataPanelContainer = Simulators.drawDatagroupForInput(datagroup);
			dataPanelContainer.find('button.cancel-edit-datagroup').addClass('cancel-add-datagroup').removeClass('cancel-edit-datagroup');
			dataPanelContainer.find('button.validate-edit-datagroup').addClass('validate-add-datagroup').removeClass('validate-edit-datagroup');
			$("#collapsedatas").find("> div.sortable").append(dataPanelContainer);
			Simulators.bindDatagroup(dataPanelContainer);
			$("#collapsedatas").collapse('show');
			dataPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID=$(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: dataPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editDatagroup = function(dataContainerGroup) {
		try {
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var dataContainer = dataContainerGroup.find('.data-container.datagroup');
			var attributesContainer = dataContainer.find('.attributes-container');
			var datagroup = {
				id: dataContainer.attr('data-id'), 
				name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
				label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
				description: {
					content: dataContainerGroup.find('.datagroup-description').html(),
					edition: dataContainerGroup.find('.datagroup-description').attr('data-edition')
				}
			};
			var dataPanelContainer = Simulators.drawDatagroupForInput(datagroup);
			Simulators.datagroupBackup = dataContainerGroup.clone();
			dataContainer.replaceWith(dataPanelContainer.find('.data-container.datagroup'));
			dataContainerGroup.find('.description-panel').eq(0).replaceWith(dataPanelContainer.find('.description-panel').eq(0));
			dataContainerGroup.find('.description-panel').eq(0).after(dataPanelContainer.find('.buttons-panel'));
			Simulators.bindDatagroup(dataContainerGroup);
			$("#collapse" + dataContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: dataContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteDatagroup = function(datagroupContainerGroup) {
		try {
			var datagroupContainer = datagroupContainerGroup.find('.data-container.datagroup');
			var attributesContainer = datagroupContainer.find('.attributes-container');
			var datagroupLabel = attributesContainer.find("p[data-attribute='label']").attr('data-value');
			var step;
			if ((step = Simulators.isDatagroupIdInSteps(datagroupContainer.attr('data-id'))) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting datagroup'),
					message: Translator.trans("This datagroup is used in step #%id%. You must modify this step before you can delete this datagroup", { 'id': step }) 
				});
				return;
			}
			var rule;
			if ((rule = Simulators.isDatagroupNameInRules(name)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting datagroup'),
					message: Translator.trans("This datagroup is used in rule #%id%. You must modify this rule before you can delete this datagroup", { 'id': rule }) 
				});
				return;
			}
			var dataContainerGroups = datagroupContainer.find('.datas-panel > div.card-body > div.panel-group');
			dataContainerGroups.each(function(k) {
				var dataContainerGroup = $(this);
				var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
				var id = dataContainer.attr('data-id');
				var name = dataContainer.find(".attributes-container p[data-attribute='name']").attr('data-value');
				if (! Simulators.isDataDeleteable(id, name)) {
					return;
				}
			});
			bootbox.confirm({
				title: Translator.trans('Deleting datagroup'),
				message: Translator.trans("Are you sure you want to delete the data group : %label% ?", { 'label': datagroupLabel }), 
				callback: function(confirmed) {
					if (confirmed) {
						dataContainerGroups.each(function(k) {
							var dataContainerGroup = $(this);
							Simulators.deleteData(dataContainerGroup);
						});
						var datagroupName = attributesContainer.find("p[data-attribute='name']").attr('data-value');
						var dparent = datagroupContainerGroup.parent();
						datagroupContainerGroup.remove();
						Simulators.renumberDatagroups(dparent.find('> div'));
						Simulators.deleteDatagroupInActions(datagroupName);
						delete Simulators.datagroups[datagroupName];
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.collectDatas = function() {
		var datas = [];
		$('#datas .data-container').each(function(d) {
			if ($(this).hasClass('datagroup')) {
				var gdatas = [];
				$(this).parent().find('.datagroup-data-container').each(function(d) {
					var choices = [];
					$(this).parent().find('.choice-container').each(function(d) {
						choices.push({
							id:  $(this).attr('data-id'),
							value: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
						});
					});
					var choicesource = {};
					$(this).parent().find('.choice-source-container').each(function(d) {
						choicesource = {
							id:  $(this).attr('data-id'),
							idColumn: $(this).find("p[data-attribute='idColumn']").attr('data-value'),
							valueColumn: $(this).find("p[data-attribute='valueColumn']").attr('data-value'),
							labelColumn: $(this).find("p[data-attribute='labelColumn']").attr('data-value')
						};
					});
					gdatas.push({
						element: 'data',
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='name']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						type: $(this).find("p[data-attribute='type']").attr('data-value'),
						'default': $(this).find("span[data-attribute='default']").attr('data-value'),
						min: $(this).find("span[data-attribute='min']").attr('data-value'),
						max: $(this).find("span[data-attribute='max']").attr('data-value'),
						pattern: $(this).find("p[data-attribute='pattern']").attr('data-value'),
						content: $(this).find("span[data-attribute='content']").attr('data-value'),
						round: $(this).find("p[data-attribute='round']").attr('data-value'),
						unit: $(this).find("p[data-attribute='unit']").attr('data-value'),
						source: $(this).find("p[data-attribute='source']").attr('data-value'),
						index: $(this).find("p[data-attribute='index']").attr('data-value'),
						memorize: $(this).find("input[data-attribute='memorize']").is(':checked') ? 1 : 0,
						description: {
							content: $(this).parent().find(".data-description").html(),
							edition: $(this).parent().find(".data-description").attr('data-edition')
						},
						choices: choices,
						choicesource: choicesource
					});
				});
				datas.push({
					element: 'datagroup',
					id:  $(this).attr('data-id'),
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					description: {
						content: $(this).parent().find(".datagroup-description").html(),
						edition: 'wysihtml'
					},
					datas: gdatas
				});
			} else {
				var choices = [];
				$(this).parent().find('.choice-container').each(function(d) {
					choices.push({
						id:  $(this).attr('data-id'),
						value: $(this).find("p[data-attribute='value']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
					});
				});
				var choicesource = {};
				$(this).parent().find('.choice-source-container').each(function(d) {
					choicesource = {
						id:  $(this).attr('data-id'),
						idColumn: $(this).find("p[data-attribute='idColumn']").attr('data-value'),
						valueColumn: $(this).find("p[data-attribute='valueColumn']").attr('data-value'),
						labelColumn: $(this).find("p[data-attribute='labelColumn']").attr('data-value')
					};
				});
				datas.push({
					element: 'data',
					id:  $(this).attr('data-id'),
					name: $(this).find("p[data-attribute='name']").attr('data-value'),
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					'default': $(this).find("span[data-attribute='default']").attr('data-value'),
					min: $(this).find("span[data-attribute='min']").attr('data-value'),
					max: $(this).find("span[data-attribute='max']").attr('data-value'),
					pattern: $(this).find("p[data-attribute='pattern']").attr('data-value'),
					content: $(this).find("span[data-attribute='content']").attr('data-value'),
					round: $(this).find("p[data-attribute='round']").attr('data-value'),
					unit: $(this).find("p[data-attribute='unit']").attr('data-value'),
					source: $(this).find("p[data-attribute='source']").attr('data-value'),
					index: $(this).find("p[data-attribute='index']").attr('data-value'),
					memorize: $(this).find("input[data-attribute='memorize']").is(':checked') ? 1 : 0,
					description: {
						content: $(this).parent().find(".data-description").html(),
						edition: $(this).parent().find(".data-description").attr('data-edition')
					},
					choices: choices,
					choicesource: choicesource
				});
			}
		});
		return datas;
	}

}(this));

