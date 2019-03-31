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

	Simulators.drawFieldSetForDisplay = function(fieldset, inClass) {
		var fieldsetElementId = 'step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id;
		var fieldsetPanelContainer;
		if (fieldset.disposition == 'grid') {
			fieldsetPanelContainer = Simulators.openCollapsiblePanel(fieldsetElementId, Translator.trans('FieldSet') + ' #' + fieldset.id + ' : ' +  $('<span>'+fieldset.legend.content + '</span>').text(), 'info',inClass, 'in', [{ 'class': 'delete-fieldset', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-fieldset', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		} else {
			fieldsetPanelContainer = Simulators.openCollapsiblePanel(fieldsetElementId, Translator.trans('FieldSet') + ' #' + fieldset.id + ' : ' +  $('<span>'+fieldset.legend.content + '</span>').text(), 'info',inClass, 'in', [{ 'class': 'delete-fieldset', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'add-field', 'label': Translator.trans('Add field'), 'icon': 'fa-plus-circle' }, { 'class': 'edit-fieldset', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		}
		var fieldsetPanelBody = fieldsetPanelContainer.find('.card-body');
		var fieldsetContainer = $('<div class="card bg-light block-container fieldset" id="' + fieldsetElementId + '-attributes-panel" data-step="' + fieldset.stepId + '" data-panel="' + fieldset.panelId + '" data-id="' + fieldset.id + '"></div>');
		var fieldsetContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldsetElementId, 'select', 'disposition', Translator.trans('Disposition'), fieldset.disposition, fieldset.disposition, false, Translator.trans('Select a Disposition'), JSON.stringify({ 'classic':Translator.trans('Classic'), 'grid':Translator.trans('Grid'), 'inline':Translator.trans('Inline') })));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldsetElementId, 'select', 'display', Translator.trans('Display'), fieldset.display, fieldset.display, false, Translator.trans('Select a Display'), JSON.stringify({ 'inline':Translator.trans('Inline'), 'grouped':Translator.trans('Grouped'), 'accordion':Translator.trans('Accordion'), 'pop-in':Translator.trans('Pop-in') })));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldsetElementId, 'text', 'popinLink', Translator.trans('Pop-in Link'), fieldset.popinLink, fieldset.popinLink, false, Translator.trans('Pop-in Link')));
		attributesContainer.append(requiredAttributes);
		fieldsetContainerBody.append(attributesContainer);
		fieldsetContainer.append(fieldsetContainerBody);
		fieldsetPanelBody.append(fieldsetContainer);
		fieldsetContainerBody.append('<div class="card bg-light legend-panel elements-container" id="' + fieldsetElementId + '-legend-panel"><div class="card-header">' + Translator.trans('Legend') + '</div><div class="card-body fieldset-legend rich-text" data-edition="' + fieldset.legend.edition + '">' + fieldset.legend.content + '</div></div>');
		if (fieldset.disposition == 'grid') {
			fieldsetPanelBody.append('<div class="card bg-light fieldset-grid-panel" id="fieldset-' + fieldset.id + '-fieldset-grid-panel"><div class="card-header"><button class="btn btn-secondary float-right update-button add-column" data-parent="#fieldset-' + fieldset.id + '-fieldset-grid-panel" title="' + Translator.trans('Add column') + '"><span class="button-label">' + Translator.trans('Add column') + '</span> <span class="fas fa-plus-circle"></span></button><button class="btn btn-secondary float-right update-button add-fieldrow" data-parent="#fieldset-' + fieldset.id + '-fieldset-grid-panel" title="' + Translator.trans('Add fieldrow') + '"><span class="button-label">' + Translator.trans('Add fieldrow') + '</span> <span class="fas fa-plus-circle"></span></button><h4 class="card-title">' + Translator.trans('Grid') + '</h4></div><div class="card-body"><div class="card bg-light columns-panel" id="step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id + '-columns-panel"><div class="card-body sortable"></div></div><div class="card bg-light fieldrows-panel" id="step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id + '-fieldrows-panel"><div class="card-body sortable"></div></div></div></div>');
		} else {
			fieldsetPanelBody.append('<div class="card bg-light columns-panel" id="' + fieldsetElementId + '-columns-panel"><div class="card-body sortable"></div></div>');
			fieldsetPanelBody.append('<div class="card bg-light fields-panel" id="' + fieldsetElementId + '-fields-panel"><div class="card-body sortable"></div></div>');
		}
		return fieldsetPanelContainer;
	}

	Simulators.drawFieldSetForInput = function(fieldset) {
		var fieldsetElementId = 'step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id;
		var fieldsetPanelContainer = $('<div>', { 'class': 'panel-group', id: fieldsetElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var fieldsetPanel = $('<div>', { 'class': 'card bg-info' });
		fieldsetPanel.append('<div class="card-header" role="tab" id="' + fieldsetElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + fieldsetElementId + '" href="#collapse' + fieldsetElementId + '" aria-expanded="true" aria-controls="collapse' + fieldsetElementId + '">#' + fieldset.id + ' : ' + fieldset.legend.content + '</a></h4></div>');
		var fieldsetPanelCollapse = $('<div id="collapse' + fieldsetElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + fieldsetElementId + '-panel"></div>');
		var fieldsetPanelBody = $('<div class="card-body"></div>');
		var fieldsetContainer = $('<div class="card bg-light block-container fieldset" id="' + fieldsetElementId + '-attributes-panel" data-step="' + fieldset.stepId + '" data-panel="' + fieldset.panelId + '" data-id="' + fieldset.id + '" data-name="' + fieldset.name + '"></div>');
		var fieldsetContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldsetElementId + '" data-type="select" data-name="disposition" data-placeholder="' + Translator.trans('FieldSet disposition') + '" data-options="' + encodeURI(JSON.stringify( {'classic': Translator.trans('Classic'), 'grid': Translator.trans('Grid') } )) + '">' + Translator.trans('Disposition') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldset.disposition) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldsetElementId + '-disposition', 'select', 'disposition', Translator.trans('Disposition'), fieldset.disposition, false, Translator.trans('FieldSet disposition'), JSON.stringify( {'classic': Translator.trans('Classic'), 'grid': Translator.trans('Grid'), 'inline': Translator.trans('Inline') } )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldsetElementId + '" data-type="select" data-name="display" data-placeholder="' + Translator.trans('FieldSet display') + '" data-options="' + encodeURI(JSON.stringify( {'inline': Translator.trans('Inline'), 'grouped': Translator.trans('Grouped'), 'accordion': Translator.trans('Accordion'), 'pop-in': Translator.trans('Pop-in') } )) + '">' + Translator.trans('Display') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldset.display) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldsetElementId + '-display', 'select', 'display', Translator.trans('Display'), fieldset.display, false, Translator.trans('FieldSet display'), JSON.stringify( {'inline': Translator.trans('Inline'), 'grouped': Translator.trans('Grouped'), 'accordion': Translator.trans('Accordion'), 'pop-in': Translator.trans('Pop-in') } )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldsetElementId + '" data-type="text" data-name="popinLink" data-placeholder="' + Translator.trans('Pop-in Link') + '">' + Translator.trans('Pop-in Link') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldset.popinLink) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldsetElementId + '-popinLink', 'text', 'popinLink', Translator.trans('Pop-in Link'), fieldset.popinLink, false, Translator.trans('Pop-in Link')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		fieldsetContainerBody.append(attributesContainer);
		fieldsetContainer.append(fieldsetContainerBody);
		fieldsetPanelBody.append(fieldsetContainer);
		fieldsetContainerBody.append('<div class="card bg-light legend-panel elements-container" id="' + fieldsetElementId + '-legend-panel"><div class="card-header">' + Translator.trans('Legend') + '</div><div class="card-body"><textarea rows="1" name="' + fieldsetElementId + '-legend" id="' + fieldsetElementId + '-legend" wrap="hard" class="form-control fieldset-legend">' + Simulators.paragraphs(fieldset.legend).content + '</textarea></div></div>');
		var fieldsetButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + fieldsetElementId + '-buttons-panel"></div>');
		var fieldsetButtonsBody = $('<div class="card-body fieldset-buttons"></div>');
		fieldsetButtonsBody.append('<button class="btn btn-success float-right validate-edit-fieldset">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		fieldsetButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-fieldset">' + Translator.trans('Cancel') + '</span></button>');
		fieldsetButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		fieldsetButtonsPanel.append(fieldsetButtonsBody);
		fieldsetContainerBody.append(fieldsetButtonsPanel);
		fieldsetPanelCollapse.append(fieldsetPanelBody);
		fieldsetPanel.append(fieldsetPanelCollapse);
		fieldsetPanelContainer.append(fieldsetPanel);
		return fieldsetPanelContainer;
	}

	Simulators.bindFieldSetButtons = function(container) {
		if (! container ) {
			container = $("#steps .blocks-panel");
		}
		container.find('button.edit-fieldset').on('click', function(e) {
			e.preventDefault();
			Simulators.editFieldSet($($(this).attr('data-parent')));
		});
		container.find('button.delete-fieldset').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteFieldSet($($(this).attr('data-parent')));
		});
		container.find('button.add-field').on('click', function(e) {
			e.preventDefault();
			var fieldrowContainer = $($(this).attr('data-parent')).find('.fieldrow-container');
			if (fieldrowContainer.length == 0) {
				Simulators.addField($($(this).attr('data-parent')));
			}
		});
		container.find('button.add-fieldrow').on('click', function(e) {
			e.preventDefault();
			Simulators.addFieldRow($($(this).attr('data-parent')));
		});
		container.find('button.add-column').on('click', function(e) {
			e.preventDefault();
			Simulators.addFieldSetColumn($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFieldSet = function(fieldsetPanelContainer) {
		var wysihtml5Options = $.extend(true, {}, Admin.wysihtml5InlineOnlyOptions, {
			toolbar: {
				insertData: true,
				insertFootnoteReference: true
			}
		});
		fieldsetPanelContainer.find('textarea').wysihtml(wysihtml5Options);
		fieldsetPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		fieldsetPanelContainer.find('.cancel-edit-fieldset').on('click', function() {
			fieldsetPanelContainer.find('.block-container.fieldset').replaceWith(Simulators.fieldsetBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldsetPanelContainer.find('.cancel-add-fieldset').on('click', function() {
			fieldsetPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldsetPanelContainer.find('.validate-edit-fieldset, .validate-add-fieldset').on('click', function() {
			var fieldsetContainerGroup = fieldsetPanelContainer.parent();
			var fieldsetContainer = fieldsetPanelContainer.find('.block-container.fieldset');
			if (! Simulators.checkFieldSet(fieldsetPanelContainer)) {
				return false;
			}
			var stepId = fieldsetContainer.attr('data-step');
			var panelId = fieldsetContainer.attr('data-panel');
			var id = fieldsetContainer.attr('data-id');
			var fieldset = { type: 'fieldset', id: id };
			fieldset['stepId'] = stepId;
			fieldset['panelId'] = panelId;
			var attributes = fieldsetContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				fieldset[$(this).attr('data-attribute')] = $(this).val();
			});
			fieldset.legend = {
				content: Admin.clearHTML(fieldsetPanelContainer.find('.fieldset-legend')),
				edition: 'wysihtml'
			};
			if (! fieldset.popinLink) {
				fieldset.popinLink = '';
			}
			if ($(this).hasClass('validate-edit-fieldset')) {
				var oldFieldSet = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }]);
				if (oldFieldSet.disposition == 'grid') {
					if (fieldset.disposition == 'grid') {
						fieldset['columns'] = oldFieldSet['columns'];
						fieldset['fieldrows'] = oldFieldSet['fieldrows'];
					} else {
						fieldset['fields'] = [];
					}
				} else if (fieldset.disposition == 'grid') {
					fieldset['columns'] = [];
					fieldset['fieldrows'] = [];
				} else {
					fieldset['fields'] = oldFieldSet['fields'];
				}
			} else {
				if (fieldset.disposition == 'grid') {
					fieldset['columns'] = [];
					fieldset['fieldrows'] = [];
				} else {
					fieldset['fields'] = [];
				}
			}
			var newFieldSetPanel = Simulators.drawFieldSetForDisplay(fieldset, 'in');
			if ($(this).hasClass('validate-edit-fieldset')) {
				if (fieldset.disposition == oldFieldSet.disposition) {
					fieldsetContainer.replaceWith(newFieldSetPanel.find('.block-container.fieldset'));
					if (fieldset.legend.content != oldFieldSet.legend.content) {
						fieldsetPanelContainer.find('> div > .card-header > h4 a').text(' ' + Translator.trans('FieldSet') + ' #' + fieldset.id + ' : ' +  $('<span>'+fieldset.legend.content + '</span>').text() + ' ');
						Simulators.changeFieldsetLegendInActionButtons(stepId, panelId, fieldset.id, fieldset.legend.content);
						Simulators.changeFieldSetLegendInRules(stepId, panelId, fieldset.id, fieldset.legend.content);
					}
					newFieldSetPanel = fieldsetPanelContainer;
				} else {
					fieldsetPanelContainer.replaceWith(newFieldSetPanel);
					Simulators.bindFieldSetButtons(newFieldSetPanel);
					Simulators.bindSortableFields(newFieldSetPanel.find('.fields-panel'));
					Simulators.deleteFieldSetInActions(oldFieldSet.stepId, oldFieldSet.panelId, oldFieldSet.id);
					Simulators.addFieldSetInActions(fieldset);
				}
				delete fieldset['stepId'];
				delete fieldset['panelId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }], fieldset);
			} else {
				fieldsetPanelContainer.replaceWith(newFieldSetPanel);
				Simulators.bindFieldSetButtons(newFieldSetPanel);
				Simulators.bindSortableFields(newFieldSetPanel.find('.fields-panel'));
				Simulators.addFieldSetInActions(fieldset);
				delete fieldset['stepId'];
				delete fieldset['panelId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }], fieldset);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newFieldSetPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newFieldSetPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(fieldsetPanelContainer);
	}

	Simulators.checkFieldSet = function(fieldsetContainer) {
		var fieldsetElementId = fieldsetContainer.attr('id');
		var display = $.trim($('#' + fieldsetElementId + '-display').val());
		if (display == 'pop-in') {
			var popinLink = $.trim($('#' + fieldsetElementId + '-popinLink').val());
			if (popinLink == '') {
				fieldsetContainer.find('.error-message').text(Translator.trans('The pop-in link text is required when display is pop-in'));
				fieldsetContainer.find('.alert').show();
				return false;
			}
		} else if (display == 'accordion') {
			var legend = $.trim(Admin.clearHTML(fieldsetContainer.find('.fieldset-legend')));
			if (legend == '') {
				fieldsetContainer.find('.error-message').text(Translator.trans('The legend is required when display is accordion'));
				fieldsetContainer.find('.alert').show();
				return false;
			}
		}
		return true;
	}

	Simulators.addFieldSet = function(panelContainerGroup) {
		try {
			var panelContainer = panelContainerGroup.find('.panel-container');
			var stepId = panelContainer.attr('data-step');
			var panelId = panelContainer.attr('data-id');
			var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId }]);
			var id = 0;
			if (panel.blocks) {
				$.each(panel.blocks, function (f, fieldset) {
					if (fieldset.id > id) {
						id = fieldset.id;
					}
				});
			}
			var fieldset = {
				type: 'fieldset',
				stepId: stepId,
				panelId: panelId,
				id: parseInt(id) + 1, 
				display: 'inline',
				disposition: 'classic',
				popinLink: '',
				legend: {
					content: '',
					edition: ''
				},
				fields: []
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var fieldsetPanelContainer = Simulators.drawFieldSetForInput(fieldset);
			fieldsetPanelContainer.find('button.cancel-edit-fieldset').addClass('cancel-add-fieldset').removeClass('cancel-edit-fieldset');
			fieldsetPanelContainer.find('button.validate-edit-fieldset').addClass('validate-add-fieldset').removeClass('validate-edit-fieldset');
			var blocksPanel;
			var parentId = panelContainerGroup.attr('id');
			if (parentId === 'blocks') {
				blocksPanel = $("#collapseblocks").find("> div.sortable");
			} else {
				blocksPanel = panelContainerGroup.find(".blocks-panel > div.sortable");
			}
			blocksPanel.append(fieldsetPanelContainer);
			Simulators.bindFieldSet(fieldsetPanelContainer);
			$("#collapse" + parentId).collapse('show');
			fieldsetPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: fieldsetPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editFieldSet = function(fieldsetContainerGroup) {
		try {
			var fieldsetContainer = fieldsetContainerGroup.find('.block-container.fieldset');
			var stepId = fieldsetContainer.attr('data-step');
			var panelId = fieldsetContainer.attr('data-panel');
			var id = fieldsetContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id } ]);
			fieldset['stepId'] = stepId;
			fieldset['panelId'] = panelId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var fieldsetPanelContainer = Simulators.drawFieldSetForInput(fieldset);
			Simulators.fieldsetBackup = fieldsetContainer.replaceWith(fieldsetPanelContainer.find('.block-container.fieldset'));
			Simulators.bindFieldSet(fieldsetContainerGroup);
			$("#collapse" + fieldsetContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: fieldsetContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteFieldSet = function(fieldsetContainerGroup) {
		try {
			var fieldsetContainer = fieldsetContainerGroup.find('.block-container.fieldset');
			var stepId = fieldsetContainer.attr('data-step');
			var panelId = fieldsetContainer.attr('data-panel');
			var id = fieldsetContainer.attr('data-id');
			var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId }]);
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }]);
			var legend = fieldset.legend.content !== '' ? fieldset.legend.content : 'fieldset #' + fieldset.id; 
			var rule;
			if ((rule = Simulators.isFieldSetInRules(stepId, panelId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting fieldset'),
					message: Translator.trans("This fieldset is used in rule #%id%. You must modify this rule before you can delete this fieldset", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if ((actionButton = Simulators.isFieldsetIdInActionButtons(stepId, panelId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting fieldset'),
					message: Translator.trans("This fieldset is used in action button « %label% ». You must modify this action button before you can delete this fieldset", { 'label': actionButton }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting fieldset'),
				message: Translator.trans("Are you sure you want to delete the fieldset : %legend%", { 'legend': legend.content }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }]);
						var fparent = fieldsetContainerGroup.parent();
						fieldsetContainerGroup.remove();
						Simulators.deleteFieldSetInActions(stepId, panelId, id);
						Simulators.renumberBlocks(panel.blocks, stepId, panelId, fparent.find('> div'));
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.renumberFieldSetColumns = function(columns, stepId, panelId, fieldsetId, panelGroups) {
		$.each(columns, function(index, column) {
			var oldId = column.id;
			var id = index + 1;
			if (oldId != 0 && id != oldId) {
				column.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-column-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-column-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Column #%id% : %label%', {'id': id, 'label': column.label }) + ' ');
				var container =  panelGroup.find('.column-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-column')) {
						$(this).attr('data-column', id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-column-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-column-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-column-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-column-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-column-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeFieldSetColumnIdInRules(stepId, panelId, fieldsetId, oldId, 'X' + id)
			}
		});
		$.each(columns, function(index, column) {
			Simulators.changeFieldSetColumnIdInRules(stepId, panelId, fieldsetId, 'X' + column.id, column.id);
		});
	}

	Simulators.bindSortableFieldSetColumns = function(container) {
		if (! container ) {
			container = $("#steps .columns-panel");
		}
		container.find("> div.sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.column-container');
				var stepId = container.attr('data-step');
				var panelId = container.attr('data-panel');
				var fieldsetId = container.attr('data-fieldset');
				var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId } ]);
				var id = container.attr('data-id');
				if (Simulators.moveInArray(fieldset.columns, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberFieldSetColumns(fieldset.columns, stepId, panelId, fieldsetId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawFieldSetColumnForDisplay = function(column, inClass) {
		var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: column.stepId, list: 'panels' }, { key: 'id', val: column.panelId, list: 'blocks' }, { key: 'id', val: column.fieldsetId }]);
		var columnElementId = 'step-' + column.stepId + '-panel-' + column.panelId + '-fieldset-' + column.fieldsetId + '-column-' + column.id;
		var columnPanelContainer = Simulators.openCollapsiblePanel(columnElementId, Translator.trans('Column #%id% : %label%', {'id': column.id, 'label': column.label }), 'warning', inClass, '', [{ 'class': 'delete-column', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-column', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var columnPanelBody = columnPanelContainer.find('.card-body');
		var columnContainer = $('<div class="card bg-light column-container" id="' + columnElementId + '-attributes-panel" data-step="' + column.stepId + '" data-panel="' + column.panelId + '" data-fieldset="' + column.fieldsetId + '" data-id="' + column.id + '"></div>');
		var columnContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(columnElementId, 'text', 'name', Translator.trans('Name'), column.name, column.name, true, Translator.trans('Column name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(columnElementId, 'text', 'label', Translator.trans('Label'), column.label, column.label, true, Translator.trans('Column label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(columnElementId, 'select', 'type', Translator.trans('Type'), column.type, column.type, true, Translator.trans('Select a column type'), JSON.stringify(Admin.types)));
		attributesContainer.append(requiredAttributes);
		columnContainerBody.append(attributesContainer);
		columnContainer.append(columnContainerBody);
		columnPanelBody.append(columnContainer);
		return columnPanelContainer;
	}

	Simulators.drawFieldSetColumnForInput = function(column) {
		var columnElementId = 'step-' + column.stepId + '-panel-' + column.panelId + '-fieldset-' + column.fieldsetId + '-column-' + column.id;
		var columnPanelContainer = $('<div>', { 'class': 'panel-group', id: columnElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var columnPanel = $('<div>', { 'class': 'card bg-warning' });
		columnPanel.append('<div class="card-header" role="tab" id="' + columnElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + columnElementId + '" href="#collapse' + columnElementId + '" aria-expanded="true" aria-controls="collapse' + columnElementId + '">' + Translator.trans('Column #%id% : %label%', {'id': column.id, 'label': column.label }) + '</a></h4></div>');
		var columnPanelCollapse = $('<div id="collapse' + columnElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + columnElementId + '-panel"></div>');
		var columnPanelBody = $('<div class="card-body"></div>');
		var columnContainer = $('<div class="card bg-light column-container" id="' + columnElementId + '-attributes-panel" data-step="' + column.stepId + '" data-panel="' + column.panelId + '" data-fieldset="' + column.fieldsetId + '" data-id="' + column.id + '" data-name="' + column.name + '"></div>');
		var columnContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group row"><label for="' + columnElementId + '-name" class="col-sm-4 col-form-label">' + Translator.trans('Name') + '</label><div class="col-sm-8"><input type="text" name="' + columnElementId + '-name" id="' + columnElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Column name without spaces or special characters') + '" value="' + column.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group row"><label for="' + columnElementId + '-label" class="col-sm-4 col-form-label">' + Translator.trans('Label') + '</label><div class="col-sm-8"><input type="text" name="' + columnElementId + '-label" id="' + columnElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Column label') + '" value="' + column.label + '" /></div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(columnElementId + '-type', 'select', 'type', 'Type', column.type, true, Translator.trans('Select a column type'), JSON.stringify(Admin.types)));
		attributesContainer.append(requiredAttributes);
		columnContainerBody.append(attributesContainer);
		columnContainer.append(columnContainerBody);
		columnPanelBody.append(columnContainer);
		var columnButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + columnElementId + '-buttons-panel"></div>');
		var columnButtonsBody = $('<div class="card-body column-buttons"></div>');
		columnButtonsBody.append('<button class="btn btn-success float-right validate-edit-column">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		columnButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-column">' + Translator.trans('Cancel') + '</span></button>');
		columnButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		columnButtonsPanel.append(columnButtonsBody);
		columnContainerBody.append(columnButtonsPanel);
		columnPanelCollapse.append(columnPanelBody);
		columnPanel.append(columnPanelCollapse);
		columnPanelContainer.append(columnPanel);
		return columnPanelContainer;
	}

	Simulators.bindFieldSetColumnButtons = function(container) {
		if (! container ) {
			container = $("#steps .columns-panel");
		}
		container.find('button.edit-column').on('click', function(e) {
			e.preventDefault();
			Simulators.editFieldSetColumn($($(this).attr('data-parent')));
		});
		container.find('button.delete-column').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteFieldSetColumn($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFieldSetColumn = function(columnPanelContainer) {
		columnPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		columnPanelContainer.find('.cancel-edit-column').on('click', function() {
			columnPanelContainer.find('.column-container').replaceWith(Simulators.columnBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		columnPanelContainer.find('.cancel-add-column').on('click', function() {
			columnPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		columnPanelContainer.find('.validate-edit-column, .validate-add-column').on('click', function() {
			var columnContainerGroup = columnPanelContainer.parent();
			var columnContainer = columnPanelContainer.find('.column-container');
			if (! Simulators.checkFieldSetColumn(columnPanelContainer)) {
				return false;
			}
			var stepId = columnContainer.attr('data-step');
			var panelId = columnContainer.attr('data-panel');
			var fieldsetId = columnContainer.attr('data-fieldset');
			var id = columnContainer.attr('data-id');
			var column = { 
				id: id,
				stepId: stepId,
				panelId: panelId,
				fieldsetId: fieldsetId,
				name: '',
				label: '',
				type: ''
			};
			var attributes = columnContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				column[$(this).attr('data-attribute')] = $(this).val();
			});
			var oldName = '';
			var oldLabel = '';
			if ($(this).hasClass('validate-edit-column')) {
				var oldFieldSetColumn = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'columns' }, { key: 'id', val: id }]);
				oldName = oldFieldSetColumn.name;
				oldLabel = oldFieldSetColumn.label;
			}
			var newFieldSetColumnPanel = Simulators.drawFieldSetColumnForDisplay(column, 'in');
			if ($(this).hasClass('validate-edit-column')) {
				columnContainer.replaceWith(newFieldSetColumnPanel.find('.column-container'));
				if (column.label != oldLabel) {
					columnPanelContainer.find('> div > .card-header > h4 a').text(Translator.trans('Column #%id% : %label%', {'id': column.id, 'label': column.label }));
					Simulators.changeFieldSetColumnLabelInRules(stepId, panelId, fieldsetId, column.id, column.label);
				}
				delete column['stepId'];
				delete column['panelId'];
				delete column['fieldsetId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'columns' }, { key: 'id', val: id }], column);
				newFieldSetColumnPanel = columnPanelContainer;
			} else {
				columnPanelContainer.replaceWith(newFieldSetColumnPanel);
				Simulators.bindFieldSetColumnButtons(newFieldSetColumnPanel);
				Simulators.addFieldSetColumnInActions(column);
				delete column['stepId'];
				delete column['panelId'];
				delete column['fieldsetId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'columns' }], column);
				Simulators.addFieldButtonToFieldRows(newFieldSetColumnPanel.parents('.fieldset-grid-panel'));
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newFieldSetColumnPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newFieldSetColumnPanel.offset().top - $('#navbar').height() }, 500);
		});
	}

	Simulators.checkFieldSetColumn = function(columnPanelContainer) {
		var columnElementId = columnPanelContainer.attr('id');
		var columnName = $.trim($('#' + columnElementId + '-name').val());
		if (columnName === '') {
			columnPanelContainer.find('.error-message').text(Translator.trans('The column name is required'));
			columnPanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(columnName)) {
			columnPanelContainer.find('.error-message').text(Translator.trans('Incorrect column name'));
			columnPanelContainer.find('.alert').show();
			return false;
		}
		var columnLabel = $.trim($('#' + columnElementId + '-label').val());
		if (columnLabel === '') {
			columnPanelContainer.find('.error-message').text(Translator.trans('The column label is required'));
			columnPanelContainer.find('.alert').show();
			return false;
		}
		var stepId = columnPanelContainer.find('.column-container').attr('data-step');
		var panelId = columnPanelContainer.find('.column-container').attr('data-panel');
		var fieldsetId = columnPanelContainer.find('.column-container').attr('data-fieldset');
		var id = columnPanelContainer.find('.column-container').attr('data-id');
		var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
		var exists = false;
		$.each(fieldset.columns, function(c, column) {
			if (column.id != id && column.name == columnName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			columnPanelContainer.find('.error-message').text(Translator.trans('This column name already exists'));
			columnPanelContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addFieldSetColumn = function(fieldsetGridPanel) {
		try {
			var fieldsetContainerGroup = fieldsetGridPanel.parent();
			var fieldsetContainer = fieldsetContainerGroup.find('.block-container.fieldset');
			var stepId = fieldsetContainer.attr('data-step');
			var panelId = fieldsetContainer.attr('data-panel');
			var fieldsetId = fieldsetContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var id = 0;
			if (fieldset.columns) {
				$.each(fieldset.columns, function (f, column) {
					if (column.id > id) {
						id = column.id;
					}
				});
			}
			var column = {
				stepId: stepId,
				panelId: panelId,
				fieldsetId: fieldsetId,
				id: parseInt(id) + 1, 
				name: '',
				label: '',
				type: ''
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var columnPanelContainer = Simulators.drawFieldSetColumnForInput(column);
			columnPanelContainer.find('button.cancel-edit-column').addClass('cancel-add-column').removeClass('cancel-edit-column');
			columnPanelContainer.find('button.validate-edit-column').addClass('validate-add-column').removeClass('validate-edit-column');
			var columnsPanel;
			var parentId = fieldsetContainerGroup.attr('id');
			if (parentId === 'columns') {
				columnsPanel = $("#collapsecolumns").find("> div.sortable");
			} else {
				columnsPanel = fieldsetContainerGroup.find(".columns-panel > div.sortable");
			}
			columnsPanel.append(columnPanelContainer);
			Simulators.bindFieldSetColumn(columnPanelContainer);
			$("#collapse" + parentId).collapse('show');
			columnPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: columnPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editFieldSetColumn = function(columnContainerGroup) {
		try {
			var columnContainer = columnContainerGroup.find('.column-container');
			var stepId = columnContainer.attr('data-step');
			var panelId = columnContainer.attr('data-panel');
			var fieldsetId = columnContainer.attr('data-fieldset');
			var id = columnContainer.attr('data-id');
			var column = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'columns' }, { key: 'id', val: id }]);
			column['stepId'] = stepId;
			column['panelId'] = panelId;
			column['fieldsetId'] = fieldsetId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var columnPanelContainer = Simulators.drawFieldSetColumnForInput(column);
			Simulators.columnBackup = columnContainer.replaceWith(columnPanelContainer.find('.column-container'));
			Simulators.bindFieldSetColumn(columnContainerGroup);
			$("#collapse" + columnContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: columnContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteFieldSetColumn = function(columnContainerGroup) {
		try {
			var columnContainer = columnContainerGroup.find('.column-container');
			var stepId = columnContainer.attr('data-step');
			var panelId = columnContainer.attr('data-panel');
			var fieldsetId = columnContainer.attr('data-fieldset');
			var id = columnContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var column = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'columns' }, { key: 'id', val: id }]);
			var label = column.label; 
			var rule;
			if ((rule = Simulators.isFieldSetColumnInRules(stepId, panelId, fieldsetId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting column'),
					message: Translator.trans("This column is used in rule #%id%. You must modify this rule before you can delete this column", { 'id': rule }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting column'),
				message: Translator.trans("Are you sure you want to delete the column : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'columns' }, { key: 'id', val: id }]);
						var cparent = columnContainerGroup.parent();
						columnContainerGroup.remove();
						Simulators.deleteFieldRowsColumn(stepId, panelId, fieldsetId, id)
						Simulators.deleteFieldSetColumnInActions(stepId, panelId, fieldsetId, id);
						Simulators.renumberFieldSetColumns(fieldset.columns, stepId, panelId, fieldsetId, cparent.find('> div'));
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
