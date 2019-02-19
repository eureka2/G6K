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

	Simulators.renumberPanels = function(panels, stepId, panelGroups) {
		$.each(panels, function(index, panel) {
			var oldId = panel.id;
			var id = index + 1;
			if (oldId != 0 && id != oldId) {
				panel.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-panel-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-panel-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Panel') + ' #' + id + ' : ' + panel.label + ' ');
				var container =  panelGroup.find('.panel-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-panel')) {
						$(this).attr('data-panel', id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-panel-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-panel-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-panel-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-panel-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-panel-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changePanelIdInActionButtons(stepId, oldId, 'X' + id)
				Simulators.changePanelIdInRules(stepId, oldId, 'X' + id)
			}
		});
		$.each(panels, function(index, panel) {
			Simulators.changePanelIdInActionButtons(stepId, 'X' + panel.id, panel.id);
			Simulators.changePanelIdInRules(stepId, 'X' + panel.id, panel.id);
		});
	}

	Simulators.bindSortablePanels = function(container) {
		if (! container ) {
			container = $("#steps .panels-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.panel-container');
				var stepId = container.attr('data-step');
				var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId } ]);
				var id = container.attr('data-id');
				if (Simulators.moveInArray(step.panels, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberPanels(step.panels, stepId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawPanelForDisplay = function(panel, inClass) {
		var panelElementId = 'step-' + panel.stepId + '-panel-' + panel.id;
		var panelPanelContainer = Simulators.openCollapsiblePanel(panelElementId, Translator.trans('Panel') + ' #' + panel.id + ' : ' + panel.label, 'success', inClass, 'sortable', [{ 'class': 'delete-panel', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'add-fieldset', 'label': Translator.trans('Add fieldset'), 'icon': 'fa-plus-circle' }, { 'class': 'add-blockinfo', 'label': Translator.trans('Add blockinfo'), 'icon': 'fa-plus-circle' }, { 'class': 'edit-panel', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var panelPanelBody = panelPanelContainer.find('.card-body');
		var panelContainer = $('<div class="card bg-light panel-container" id="' + panelElementId + '-attributes-panel" data-step="' + panel.stepId + '" data-id="' + panel.id + '"></div>');
		var panelContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(panelElementId, 'text', 'name', Translator.trans('Name'), panel.name, panel.name, true, Translator.trans('Panel name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(panelElementId, 'text', 'label', Translator.trans('Label'), panel.label, panel.label, true, Translator.trans('Panel label')));
		attributesContainer.append(requiredAttributes);
		panelContainerBody.append(attributesContainer);
		panelContainer.append(panelContainerBody);
		panelPanelBody.append(panelContainer);
		panelPanelBody.append('<div class="card bg-light blocks-panel" id="' + panelElementId + '-blocks-panel"><div class="card-body sortable"></div></div>');
		return panelPanelContainer;
	}

	Simulators.drawPanelForInput = function(panel) {
		var panelElementId = 'step-' + panel.stepId + '-panel-' + panel.id;
		var panelPanelContainer = $('<div>', { 'class': 'panel-group', id: panelElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var panelPanel = $('<div>', { 'class': 'card bg-success' });
		panelPanel.append('<div class="card-header" role="tab" id="' + panelElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + panelElementId + '" href="#collapse' + panelElementId + '" aria-expanded="true" aria-controls="collapse' + panelElementId + '">' + Translator.trans('Panel') + ' #' + panel.id + ' : ' + panel.label + '</a></h4></div>');
		var panelPanelCollapse = $('<div id="collapse' + panelElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + panelElementId + '-panel"></div>');
		var panelPanelBody = $('<div class="card-body"></div>');
		var panelContainer = $('<div class="card bg-light panel-container" id="' + panelElementId + '-attributes-panel" data-step="' + panel.stepId + '" data-id="' + panel.id + '" data-name="' + panel.name + '"></div>');
		var panelContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(panelElementId + '-name', 'text', 'name', Translator.trans('Name'), panel.name, false, Translator.trans('Panel name without spaces or special characters')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + panelElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Panel label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (panel.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(panelElementId + '-label', 'text', 'label', Translator.trans('Label'), panel.label, false, Translator.trans('Panel label')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		panelContainerBody.append(attributesContainer);
		panelContainer.append(panelContainerBody);
		panelPanelBody.append(panelContainer);
		var panelButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + panelElementId + '-buttons-panel"></div>');
		var panelButtonsBody = $('<div class="card-body panel-buttons"></div>');
		panelButtonsBody.append('<button class="btn btn-success float-right validate-edit-panel">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		panelButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-panel">' + Translator.trans('Cancel') + '</span></button>');
		panelButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		panelButtonsPanel.append(panelButtonsBody);
		panelContainerBody.append(panelButtonsPanel);
		panelPanelCollapse.append(panelPanelBody);
		panelPanel.append(panelPanelCollapse);
		panelPanelContainer.append(panelPanel);
		return panelPanelContainer;
	}

	Simulators.bindPanelButtons = function(container) {
		if (! container ) {
			container = $("#steps .panels-panel");
		}
		container.find('button.edit-panel').on('click', function(e) {
			e.preventDefault();
			Simulators.editPanel($($(this).attr('data-parent')));
		});
		container.find('button.delete-panel').on('click', function(e) {
			e.preventDefault();
			Simulators.deletePanel($($(this).attr('data-parent')));
		});
		container.find('button.add-fieldset, a.add-fieldset').on('click', function(e) {
			e.preventDefault();
			Simulators.addFieldSet($($(this).attr('data-parent')));
		});
		container.find('button.add-blockinfo, a.add-blockinfo').on('click', function(e) {
			e.preventDefault();
			Simulators.addBlockInfo($($(this).attr('data-parent')));
		});
	}

	Simulators.bindPanel = function(panelPanelContainer) {
		panelPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		panelPanelContainer.find('.cancel-edit-panel').on('click', function() {
			panelPanelContainer.find('.panel-container').replaceWith(Simulators.panelBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		panelPanelContainer.find('.cancel-add-panel').on('click', function() {
			panelPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		panelPanelContainer.find('.validate-edit-panel, .validate-add-panel').on('click', function() {
			var panelContainerGroup = panelPanelContainer.parent();
			var panelContainer = panelPanelContainer.find('.panel-container');
			if (! Simulators.checkPanel(panelPanelContainer)) {
				return false;
			}
			var stepId = panelContainer.attr('data-step');
			var id = panelContainer.attr('data-id');
			var panel = {
				stepId: stepId,
				id: id,
				label: ''
			};
			panel['stepId'] = stepId;
			var attributes = panelContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				panel[$(this).attr('data-attribute')] = $(this).val();
			});
			if (panel['name']) {
				panel['name'] = $.trim(panel['name']);
			}
			var oldLabel = '';
			if ($(this).hasClass('validate-edit-panel')) {
				var oldPanel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: id }]);
				oldLabel = oldPanel.label;
				panel['blocks'] = oldPanel['blocks'];
			} else {
				panel['blocks'] = [];
			}
			var newPanelPanel = Simulators.drawPanelForDisplay(panel, 'in');
			if ($(this).hasClass('validate-edit-panel')) {
				panelContainer.replaceWith(newPanelPanel.find('.panel-container'));
				if (panel.label != oldLabel) {
					panelPanelContainer.find('> div > .card-header > h4 a').text(' ' + Translator.trans('Panel') + ' #' + panel.id + ' : ' + panel.label + ' ');
					Simulators.changePanelLabelInActionButtons(stepId, panel.id, panel.label);
					Simulators.changePanelLabelInRules(stepId, panel.id, panel.label);
				}
				delete panel['stepId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: id }], panel);
				newPanelPanel = panelPanelContainer;
			} else {
				panelPanelContainer.replaceWith(newPanelPanel);
				Simulators.bindPanelButtons(newPanelPanel);
				Simulators.bindSortableBlocks(newPanelPanel.find('.blocks-panel'));
				Simulators.addPanelInActions(panel);
				delete panel['stepId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }], panel);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newPanelPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newPanelPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(panelPanelContainer);
	}

	Simulators.checkPanel = function(panelContainer) {
		var panelElementId = panelContainer.attr('id');
		var panelName = $.trim($('#' + panelElementId + '-name').val());
		if (panelName === '') {
			panelContainer.find('.error-message').text(Translator.trans('The panel name is required'));
			panelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(panelName)) {
			panelContainer.find('.error-message').text(Translator.trans('Incorrect panel name'));
			panelContainer.find('.alert').show();
			return false;
		}
		var stepId = panelContainer.find('.panel-container').attr('data-step');
		var id = panelContainer.find('.panel-container').attr('data-id');
		var exists = false;
		var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			$.each(step.panels, function(p, panel) {
			if (panel.id != id && panel.name == panelName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			panelContainer.find('.error-message').text(Translator.trans('This panel name already exists'));
			panelContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addPanel = function(stepContainerGroup) {
		try {
			var stepContainer = stepContainerGroup.find('.step-container');
			var stepId = stepContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var id = 0;
			if (step.panels) {
				$.each(step.panels, function (p, panel) {
					if (panel.id > id) {
						id = panel.id;
					}
				});
			}
			var panel = {
				stepId: stepId,
				id: parseInt(id) + 1, 
				name: '',
				label: '',
				blocks: []
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var panelPanelContainer = Simulators.drawPanelForInput(panel);
			panelPanelContainer.find('button.cancel-edit-panel').addClass('cancel-add-panel').removeClass('cancel-edit-panel');
			panelPanelContainer.find('button.validate-edit-panel').addClass('validate-add-panel').removeClass('validate-edit-panel');
			var panelsPanel;
			var parentId = stepContainerGroup.attr('id');
			if (parentId === 'panels') {
				panelsPanel = $("#collapsepanels").find("> div.sortable");
			} else {
				panelsPanel = stepContainerGroup.find(".panels-panel > div.sortable");
			}
			panelsPanel.append(panelPanelContainer);
			Simulators.bindPanel(panelPanelContainer);
			$("#collapse" + stepContainerGroup.attr('id')).collapse('show');
			panelPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: panelPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editPanel = function(panelContainerGroup) {
		try {
			var panelContainer = panelContainerGroup.find('.panel-container');
			var stepId = panelContainer.attr('data-step');
			var id = panelContainer.attr('data-id');
			var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: id } ]);
			panel['stepId'] = stepId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var panelPanelContainer = Simulators.drawPanelForInput(panel);
			Simulators.panelBackup = panelContainer.replaceWith(panelPanelContainer.find('.panel-container'));
			Simulators.bindPanel(panelContainerGroup);
			$("#collapse" + panelContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: panelContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deletePanel = function(panelContainerGroup) {
		try {
			var panelContainer = panelContainerGroup.find('.panel-container');
			var stepId = panelContainer.attr('data-step');
			var id = panelContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: id }]);
			var label = panel.label ? panel.label : panel.name; 
			var rule;
			if ((rule = Simulators.isPanelInRules(stepId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting panel'),
					message: Translator.trans("This panel is used in rule #%id%. You must modify this rule before you can delete this panel", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if ((actionButton = Simulators.isPanelIdInActionButtons(stepId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting panel'),
					message: Translator.trans("This panel is used in action button « %label% ». You must modify this action button before you can delete this panel", { 'label': actionButton }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting panel'),
				message: Translator.trans("Are you sure you want to delete the panel : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: id }]);
						var pparent = panelContainerGroup.parent();
						panelContainerGroup.remove();
						Simulators.deletePanelInActions(stepId, id);
						Simulators.renumberPanels(step.panels, stepId, pparent.find('> div'));
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.renumberBlocks = function(blocks, stepId, panelId, panelGroups) {
		$.each(blocks, function(index, block) {
			var oldId = block.id;
			var id = index + 1;
			if (oldId != 0 && id != oldId) {
				block.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-" + block.type + "-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-" + block.type + "-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				if (block.type == 'fieldset') {
					a.text(' ' + Translator.trans('FieldSet') + ' #' + id + ' : ' + block.legend.content + ' ');
				} else {
					a.text(' ' + Translator.trans('BlockInfo') + ' #' + id + ' : ' + block.label + ' ');
				}
				var container =  panelGroup.find('.block-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-' + block.type)) {
						$(this).attr('data-' + block.type, id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-" + block.type + "-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-" + block.type + "-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-" + block.type + "-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-" + block.type + "-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-" + block.type + "-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				if (block.type == 'fieldset') {
					Simulators.changeFieldsetIdInActionButtons(stepId, panelId, oldId, 'X' + id);
					Simulators.changeFieldSetIdInRules(stepId, panelId, oldId, 'X' + id);
				} else {
					Simulators.changeBlockinfoIdInActionButtons(stepId, panelId, oldId, 'X' + id);
					Simulators.changeBlockInfoIdInRules(stepId, panelId, oldId, 'X' + id);
				}
			}
		});
		$.each(blocks, function(index, block) {
			if (block.type == 'fieldset') {
				Simulators.changeFieldsetIdInActionButtons(stepId, panelId, 'X' + block.id, block.id);
				Simulators.changeFieldSetIdInRules(stepId, panelId, 'X' + block.id, block.id);
			} else {
				Simulators.changeBlockinfoIdInActionButtons(stepId, panelId, 'X' + block.id, block.id);
				Simulators.changeBlockInfoIdInRules(stepId, panelId, 'X' + block.id, block.id);
			}
		});
	}

	Simulators.bindSortableBlocks = function(container) {
		if (! container ) {
			container = $("#steps .blocks-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.block-container');
				var stepId = container.attr('data-step');
				var panelId = container.attr('data-panel');
				var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId } ]);
				var id = container.attr('data-id');
				if (Simulators.moveInArray(panel.blocks, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberBlocks(panel.blocks, stepId, panelId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

}(this));
