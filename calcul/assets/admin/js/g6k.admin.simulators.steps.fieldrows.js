/**
The MIT License (MIT)

Copyright (c) 2015-2019 Jacques Archimède

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

	Simulators.deleteFieldRowsColumn = function(stepId, panelId, fieldsetId, columnId) {
		var fieldrows = $('#step-' + stepId + '-panel-' + panelId + '-fieldset-' + fieldsetId + '-fieldrows-panel').find('> .sortable').find('> div');
		var deleted = [];
		fieldrows.each(function(r) {
			var fieldContainerGroups = $(this).find('.panel-group');
			fieldContainerGroups.each(function(c) {
				var fieldContainerGroup = $(this);
				var column = fieldContainerGroup.find('.field-container');
				if (column.attr('data-id') == columnId) {
					var elementId = fieldContainerGroup.attr('id')
					if ($.inArray(elementId, deleted) < 0) {
						Simulators.deleteField(fieldContainerGroup, false);
						deleted.push(elementId);
					}
				}
			});
		});
	}

	Simulators.renumberFieldRows = function(fieldrows, stepId, panelId, fieldsetId, panelGroups) {
		$.each(fieldrows, function(index, fieldrow) {
			var oldId = fieldrow.id;
			var id = index + 1;
			if (oldId != 0 && id != oldId) {
				fieldrow.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-fieldrow-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-fieldrow-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Fieldrow #%id% : %label%', {'id': id, 'label': fieldrow.label }) + ' ');
				var container =  panelGroup.find('.fieldrow-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-fieldrow')) {
						$(this).attr('data-fieldrow', id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-fieldrow-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-fieldrow-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-fieldrow-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-fieldrow-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-fieldrow-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeFieldrowIdInActionButtons(stepId, panelId, fieldsetId, oldId, 'X' + id)
				Simulators.changeFieldRowIdInRules(stepId, panelId, fieldsetId, oldId, 'X' + id)
			}
		});
		$.each(fieldrows, function(index, fieldrow) {
			Simulators.changeFieldrowIdInActionButtons(stepId, panelId, fieldsetId, 'X' + fieldrow.id, fieldrow.id);
			Simulators.changeFieldRowIdInRules(stepId, panelId, fieldsetId, 'X' + fieldrow.id, fieldrow.id);
		});
	}

	Simulators.bindSortableFieldRows = function(container) {
		if (! container ) {
			container = $("#steps .fieldrows-panel");
		}
		container.find("> div.sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.fieldrow-container');
				var stepId = container.attr('data-step');
				var panelId = container.attr('data-panel');
				var fieldsetId = container.attr('data-fieldset');
				var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId } ]);
				var id = container.attr('data-id');
				if (Simulators.moveInArray(fieldset.fieldrows, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberFieldRows(fieldset.fieldrows, stepId, panelId, fieldsetId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawFieldRowForDisplay = function(fieldrow, inClass) {
		var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: fieldrow.stepId, list: 'panels' }, { key: 'id', val: fieldrow.panelId, list: 'blocks' }, { key: 'id', val: fieldrow.fieldsetId }]);
		var fieldrowElementId = 'step-' + fieldrow.stepId + '-panel-' + fieldrow.panelId + '-fieldset-' + fieldrow.fieldsetId + '-fieldrow-' + fieldrow.id;
		var fieldrowPanelContainer = fieldrow.fields.length < fieldset.columns.length ?
			Simulators.openCollapsiblePanel(fieldrowElementId, Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }), 'success', inClass, '', [{ 'class': 'delete-fieldrow', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'add-field', 'label': Translator.trans('Add field'), 'icon': 'fa-plus-circle' }, { 'class': 'edit-fieldrow', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] ) :
			Simulators.openCollapsiblePanel(fieldrowElementId, Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }), 'success', inClass, '', [{ 'class': 'delete-fieldrow', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-fieldrow', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var fieldrowPanelBody = fieldrowPanelContainer.find('.card-body');
		var fieldrowContainer = $('<div class="card bg-light fieldrow-container" id="' + fieldrowElementId + '-attributes-panel" data-step="' + fieldrow.stepId + '" data-panel="' + fieldrow.panelId + '" data-fieldset="' + fieldrow.fieldsetId + '" data-id="' + fieldrow.id + '"></div>');
		var fieldrowContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldrowElementId, 'text', 'label', Translator.trans('Label'), fieldrow.label, fieldrow.label, true, Translator.trans('Fieldrow label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldrowElementId, 'checkbox', 'colon', Translator.trans('Show colon after field label ?'), fieldrow.colon, fieldrow.colon, false, Translator.trans('Show colon after field label ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldrowElementId, 'checkbox', 'help', Translator.trans('Show data description as help ?'), fieldrow.help, fieldrow.help, false, Translator.trans('Show data description as help ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldrowElementId, 'checkbox', 'emphasize', Translator.trans('Emphasize the text label ?'), fieldrow.emphasize, fieldrow.emphasize, false, Translator.trans('Emphasize the text label ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldrowElementId, 'text', 'datagroup', Translator.trans('Datagroup'), Simulators.findDatagroupById(fieldrow.datagroup).label, Simulators.findDatagroupById(fieldrow.datagroup).label, true, Translator.trans('Datagroup')));
		attributesContainer.append(requiredAttributes);
		fieldrowContainerBody.append(attributesContainer);
		fieldrowContainer.append(fieldrowContainerBody);
		fieldrowPanelBody.append(fieldrowContainer);
		fieldrowPanelBody.append('<div class="card bg-light fields-panel" id="' + fieldrowElementId + '-fields-panel"><div class="card-body sortable"></div></div>');
		return fieldrowPanelContainer;
	}

	Simulators.addFieldButtonToFieldRows = function(fieldsetGridPanel) {
		var deleteFieldrowButtons = fieldsetGridPanel.find('.delete-fieldrow');
		deleteFieldrowButtons.each(function(index) {
			if (! $(this).next().hasClass('add-field')) {
				var button = $('<button class="btn btn-success float-right update-button add-field" title="' + Translator.trans('Add field') + '" data-parent="' +  $(this).attr('data-parent') + '"><span class="button-label">' + Translator.trans('Add field') + '</span> <span class="fas fa-plus-circle"></span></button>');
				$(this).after(button);
				button.on('click', function(e) {
					e.preventDefault();
					Simulators.addField($($(this).attr('data-parent')));
				});
			}
		});
	}

	Simulators.checkAddFieldButton = function(fieldPanel) {
		var fieldsPanel = fieldPanel.parents('.fields-panel');
		var fieldsetGridPanel = fieldsPanel.parents('.fieldset-grid-panel');
		var columnsPanel = fieldsetGridPanel.find('.columns-panel');
		var nfields = fieldsPanel.find('> div.sortable > div').length;
		var ncolumns = columnsPanel.find('> div.sortable > div').length;
		if (nfields >= ncolumns) {
			var addFieldButton = fieldsPanel.parent().parent().parent().find('button.add-field');
			addFieldButton.remove();
		}
	}

	Simulators.drawFieldRowForInput = function(fieldrow) {
		var fieldrowElementId = 'step-' + fieldrow.stepId + '-panel-' + fieldrow.panelId + '-fieldset-' + fieldrow.fieldsetId + '-fieldrow-' + fieldrow.id;
		var fieldrowPanelContainer = $('<div>', { 'class': 'panel-group', id: fieldrowElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var fieldrowPanel = $('<div>', { 'class': 'card bg-warning' });
		fieldrowPanel.append('<div class="card-header" role="tab" id="' + fieldrowElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + fieldrowElementId + '" href="#collapse' + fieldrowElementId + '" aria-expanded="true" aria-controls="collapse' + fieldrowElementId + '">' + Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }) + '</a></h4></div>');
		var fieldrowPanelCollapse = $('<div id="collapse' + fieldrowElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + fieldrowElementId + '-panel"></div>');
		var fieldrowPanelBody = $('<div class="card-body"></div>');
		var fieldrowContainer = $('<div class="card bg-light fieldrow-container" id="' + fieldrowElementId + '-attributes-panel" data-step="' + fieldrow.stepId + '" data-panel="' + fieldrow.panelId + '" data-fieldset="' + fieldrow.fieldsetId + '" data-id="' + fieldrow.id + '"></div>');
		var fieldrowContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		var datagroupsList = {
			0: Translator.trans('--- Select a datagroup ---')
		};
		$.each(Simulators.datagroups, function( name, datagroup) {
			datagroupsList[datagroup.id] = datagroup.label;
		});
		requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-label', 'text', 'label', Translator.trans('Label'), fieldrow.label, true, Translator.trans('Fieldrow label')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldrowElementId + '" data-type="checkbox" data-name="colon" data-placeholder="' + Translator.trans('Show colon after field label ?') + '">' + Translator.trans('Show colon after field label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldrow.colon) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-colon', 'checkbox', 'colon', Translator.trans('Show colon after field label ?'), fieldrow.colon, false, Translator.trans('Show colon after field label ?')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldrowElementId + '" data-type="checkbox" data-name="help" data-placeholder="' + Translator.trans('Show data description as help ?') + '">' + Translator.trans('Show data description as help ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldrow.help) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-help', 'checkbox', 'help', Translator.trans('Show data description as help ?'), fieldrow.help, false, Translator.trans('Show data description as help ?')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldrowElementId + '" data-type="checkbox" data-name="emphasize" data-placeholder="' + Translator.trans('Emphasize the text label ?') + '">' + Translator.trans('Emphasize the text label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldrow.emphasize) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-emphasize', 'checkbox', 'emphasize', Translator.trans('Emphasize the text label ?'), fieldrow.emphasize, false, Translator.trans('Emphasize the text label ?')));
			optionalAttribute.hide();
		} 
		requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-datagroup', 'select', 'datagroup', Translator.trans('Datagroup'), fieldrow.datagroup, true, Translator.trans('Select a datagroup'), JSON.stringify(datagroupsList)));
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		fieldrowContainerBody.append(attributesContainer);
		fieldrowContainer.append(fieldrowContainerBody);
		fieldrowPanelBody.append(fieldrowContainer);
		var fieldrowButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + fieldrowElementId + '-buttons-panel"></div>');
		var fieldrowButtonsBody = $('<div class="card-body fieldrow-buttons"></div>');
		fieldrowButtonsBody.append('<button class="btn btn-success float-right validate-edit-fieldrow">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		fieldrowButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-fieldrow">' + Translator.trans('Cancel') + '</span></button>');
		fieldrowButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		fieldrowButtonsPanel.append(fieldrowButtonsBody);
		fieldrowContainerBody.append(fieldrowButtonsPanel);
		fieldrowPanelCollapse.append(fieldrowPanelBody);
		fieldrowPanel.append(fieldrowPanelCollapse);
		fieldrowPanelContainer.append(fieldrowPanel);
		return fieldrowPanelContainer;
	}

	Simulators.bindFieldRowButtons = function(container) {
		if (! container ) {
			container = $("#steps .fieldrows-panel");
		}
		container.find('button.edit-fieldrow').on('click', function(e) {
			e.preventDefault();
			Simulators.editFieldRow($($(this).attr('data-parent')));
		});
		container.find('button.delete-fieldrow').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteFieldRow($($(this).attr('data-parent')));
		});
		container.find('button.add-field').on('click', function(e) {
			e.preventDefault();
			Simulators.addField($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFieldRow = function(fieldrowPanelContainer) {
		fieldrowPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		fieldrowPanelContainer.find('.cancel-edit-fieldrow').on('click', function() {
			fieldrowPanelContainer.find('.fieldrow-container').replaceWith(Simulators.fieldrowBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldrowPanelContainer.find('.cancel-add-fieldrow').on('click', function() {
			fieldrowPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldrowPanelContainer.find('.validate-edit-fieldrow, .validate-add-fieldrow').on('click', function() {
			var fieldrowContainerGroup = fieldrowPanelContainer.parent();
			var fieldrowContainer = fieldrowPanelContainer.find('.fieldrow-container');
			if (! Simulators.checkFieldRow(fieldrowPanelContainer)) {
				return false;
			}
			var stepId = fieldrowContainer.attr('data-step');
			var panelId = fieldrowContainer.attr('data-panel');
			var fieldsetId = fieldrowContainer.attr('data-fieldset');
			var id = fieldrowContainer.attr('data-id');
			var fieldrow = { 
				id: id,
				stepId: stepId,
				panelId: panelId,
				fieldsetId: fieldsetId,
				label: '',
				colon: '0',
				help: '0',
				emphasize: '0',
				datagroup: ''
			};
			var attributes = fieldrowContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				fieldrow[$(this).attr('data-attribute')] = $(this).val();
			});
			var oldLabel = '';
			if ($(this).hasClass('validate-edit-fieldrow')) {
				var oldFieldRow = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: id }]);
				oldLabel = oldFieldRow.label;
				fieldrow['fields'] = oldFieldRow['fields'];
			} else {
				fieldrow['fields'] = [];
			}
			var newFieldRowPanel = Simulators.drawFieldRowForDisplay(fieldrow, 'in');
			if ($(this).hasClass('validate-edit-fieldrow')) {
				fieldrowContainer.replaceWith(newFieldRowPanel.find('.fieldrow-container'));
				if (fieldrow.label != oldLabel) {
					fieldrowPanelContainer.find('> div > .card-header > h4 a').text(Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }));
					Simulators.changeFieldrowLabelInActionButtons(stepId, panelId, fieldsetId, fieldrow.id, fieldrow.label);
					Simulators.changeFieldRowLabelInRules(stepId, panelId, fieldsetId, fieldrow.id, fieldrow.label);
				}
				delete fieldrow['stepId'];
				delete fieldrow['panelId'];
				delete fieldrow['fieldsetId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: id }], fieldrow);
				newFieldRowPanel = fieldrowPanelContainer;
			} else {
				fieldrowPanelContainer.replaceWith(newFieldRowPanel);
				Simulators.bindFieldRowButtons(newFieldRowPanel);
				Simulators.bindSortableFields(newFieldRowPanel.find('.fields-panel'));
				Simulators.addFieldRowInActions(fieldrow);
				delete fieldrow['stepId'];
				delete fieldrow['panelId'];
				delete fieldrow['fieldsetId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }], fieldrow);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newFieldRowPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newFieldRowPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(fieldrowPanelContainer);
	}

	Simulators.checkFieldRow = function(fieldrowContainer) {
		var fieldrowElementId = fieldrowContainer.attr('id');
		var fieldrowLabel = $.trim($('#' + fieldrowElementId + '-label').val());
		if (fieldrowLabel === '') {
			fieldrowContainer.find('.error-message').text(Translator.trans('The fieldrow label is required'));
			fieldrowContainer.find('.alert').show();
			return false;
		}
		var datagroup = $('#' + fieldrowElementId + '-datagroup').val();
		if (datagroup == 0) {
			fieldrowContainer.find('.error-message').text(Translator.trans('Please, select a datagroup'));
			fieldrowContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addFieldRow = function(fieldsetGridPanel) {
		try {
			var fieldsetContainerGroup = fieldsetGridPanel.parent();
			var fieldsetContainer = fieldsetContainerGroup.find('.block-container.fieldset');
			var stepId = fieldsetContainer.attr('data-step');
			var panelId = fieldsetContainer.attr('data-panel');
			var fieldsetId = fieldsetContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var id = 0;
			if (fieldset.fieldrows) {
				$.each(fieldset.fieldrows, function (f, fieldrow) {
					if (fieldrow.id > id) {
						id = fieldrow.id;
					}
				});
			}
			var fieldrow = {
				stepId: stepId,
				panelId: panelId,
				fieldsetId: fieldsetId,
				id: parseInt(id) + 1, 
				label: '',
				colon: '0',
				help: '0',
				emphasize: '0',
				datagroup: '',
				fields: []
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var fieldrowPanelContainer = Simulators.drawFieldRowForInput(fieldrow);
			fieldrowPanelContainer.find('button.cancel-edit-fieldrow').addClass('cancel-add-fieldrow').removeClass('cancel-edit-fieldrow');
			fieldrowPanelContainer.find('button.validate-edit-fieldrow').addClass('validate-add-fieldrow').removeClass('validate-edit-fieldrow');
			var fieldrowsPanel;
			var parentId = fieldsetContainerGroup.attr('id');
			if (parentId === 'fieldrows') {
				fieldrowsPanel = $("#collapsefieldrows").find("> div.sortable");
			} else {
				fieldrowsPanel = fieldsetContainerGroup.find(".fieldrows-panel > div.sortable");
			}
			fieldrowsPanel.append(fieldrowPanelContainer);
			Simulators.bindFieldRow(fieldrowPanelContainer);
			$("#collapse" + parentId).collapse('show');
			fieldrowPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: fieldrowPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editFieldRow = function(fieldrowContainerGroup) {
		try {
			var fieldrowContainer = fieldrowContainerGroup.find('.fieldrow-container');
			var stepId = fieldrowContainer.attr('data-step');
			var panelId = fieldrowContainer.attr('data-panel');
			var fieldsetId = fieldrowContainer.attr('data-fieldset');
			var id = fieldrowContainer.attr('data-id');
			var fieldrow = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: id }]);
			fieldrow['stepId'] = stepId;
			fieldrow['panelId'] = panelId;
			fieldrow['fieldsetId'] = fieldsetId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var fieldrowPanelContainer = Simulators.drawFieldRowForInput(fieldrow);
			Simulators.fieldrowBackup = fieldrowContainer.replaceWith(fieldrowPanelContainer.find('.fieldrow-container'));
			Simulators.bindFieldRow(fieldrowContainerGroup);
			$("#collapse" + fieldrowContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: fieldrowContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteFieldRow = function(fieldrowContainerGroup) {
		try {
			var fieldrowContainer = fieldrowContainerGroup.find('.fieldrow-container');
			var stepId = fieldrowContainer.attr('data-step');
			var panelId = fieldrowContainer.attr('data-panel');
			var fieldsetId = fieldrowContainer.attr('data-fieldset');
			var id = fieldrowContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var fieldrow = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: id }]);
			var label = fieldrow.label; 
			var rule;
			if ((rule = Simulators.isFieldRowInRules(stepId, panelId, fieldsetId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting fieldrow'),
					message: Translator.trans("This fieldrow is used in rule #%id%. You must modify this rule before you can delete this fieldrow", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if ((actionButton = Simulators.isFieldrowIdInActionButtons(stepId, panelId, fieldsetId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting fieldrow'),
					message: Translator.trans("This fieldrow is used in action button « %label% ». You must modify this action button before you can delete this fieldrow", { 'label': actionButton }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting fieldrow'),
				message: Translator.trans("Are you sure you want to delete the fieldrow : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: id }]);
						var fparent = fieldrowContainerGroup.parent();
						fieldrowContainerGroup.remove();
						Simulators.deleteFieldRowInActions(stepId, panelId, fieldsetId, id);
						Simulators.renumberFieldRows(fieldset.fieldrows, stepId, panelId, fieldsetId, fparent.find('> div'));
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

}(this));
