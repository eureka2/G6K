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

	Simulators.drawBlockInfoForDisplay = function(blockinfo, inClass) {
		var blockinfoElementId = 'step-' + blockinfo.stepId + '-panel-' + blockinfo.panelId + '-blockinfo-' + blockinfo.id;
		var blockinfoPanelContainer = Simulators.openCollapsiblePanel(blockinfoElementId, Translator.trans('Blockinfo #%id% : %label%', {'id': blockinfo.id, 'label': blockinfo.label}), 'info',inClass, '', [{ 'class': 'delete-blockinfo', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'add-chapter', 'label': Translator.trans('Add chapter'), 'icon': 'fa-plus-circle' }, { 'class': 'edit-blockinfo', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var blockinfoPanelBody = blockinfoPanelContainer.find('.card-body');
		var blockinfoContainer = $('<div class="card bg-light block-container blockinfo" id="' + blockinfoElementId + '-attributes-panel" data-step="' + blockinfo.stepId + '" data-panel="' + blockinfo.panelId + '" data-id="' + blockinfo.id + '"></div>');
		var blockinfoContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(blockinfoElementId, 'text', 'name', Translator.trans('Name'), blockinfo.name, blockinfo.name, true, Translator.trans('Blockinfo name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(blockinfoElementId, 'text', 'label', Translator.trans('Label'), blockinfo.label, blockinfo.label, true, Translator.trans('Blockinfo label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(blockinfoElementId, 'select', 'display', Translator.trans('Display'), blockinfo.display, blockinfo.display, false, Translator.trans('Select a Display'), JSON.stringify({ 'inline':Translator.trans('Inline'), 'grouped':Translator.trans('Grouped'), 'accordion':Translator.trans('Accordion'), 'pop-in':Translator.trans('Pop-in') })));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(blockinfoElementId, 'text', 'popinLink', Translator.trans('Pop-in Link'), blockinfo.popinLink, blockinfo.popinLink, false, Translator.trans('Pop-in Link')));
		attributesContainer.append(requiredAttributes);
		blockinfoContainerBody.append(attributesContainer);
		blockinfoContainer.append(blockinfoContainerBody);
		blockinfoPanelBody.append(blockinfoContainer);
		blockinfoPanelBody.append('<div class="card bg-light chapters-panel" id="' + blockinfoElementId + '-chapters-panel"><div class="card-body sortable"></div></div>');
		return blockinfoPanelContainer;
	}

	Simulators.drawBlockInfoForInput = function(blockinfo) {
		var blockinfoElementId = 'step-' + blockinfo.stepId + '-panel-' + blockinfo.panelId + '-blockinfo-' + blockinfo.id;
		var blockinfoPanelContainer = $('<div>', { 'class': 'panel-group', id: blockinfoElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var blockinfoPanel = $('<div>', { 'class': 'card bg-info' });
		blockinfoPanel.append('<div class="card-header" role="tab" id="' + blockinfoElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + blockinfoElementId + '" href="#collapse' + blockinfoElementId + '" aria-expanded="true" aria-controls="collapse' + blockinfoElementId + '">#' + blockinfo.id + ' : ' + blockinfo.label + '</a></h4></div>');
		var blockinfoPanelCollapse = $('<div id="collapse' + blockinfoElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + blockinfoElementId + '-panel"></div>');
		var blockinfoPanelBody = $('<div class="card-body"></div>');
		var blockinfoContainer = $('<div class="card bg-light block-container blockinfo" id="' + blockinfoElementId + '-attributes-panel" data-step="' + blockinfo.stepId + '" data-panel="' + blockinfo.panelId + '" data-id="' + blockinfo.id + '" data-name="' + blockinfo.name + '"></div>');
		var blockinfoContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(blockinfoElementId + '-name', 'text', 'name', Translator.trans('Name'), blockinfo.name, false, Translator.trans('BlockInfo name')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + blockinfoElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('BlockInfo label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (blockinfo.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(blockinfoElementId + '-label', 'text', 'label', Translator.trans('Label'), blockinfo.label, false, Translator.trans('BlockInfo label')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + blockinfoElementId + '" data-type="select" data-name="display" data-placeholder="' + Translator.trans('Blockinfo display') + '" data-options="' + encodeURI(JSON.stringify( {'inline': Translator.trans('Inline'), 'grouped':Translator.trans('Grouped'), 'accordion': Translator.trans('Accordion'), 'pop-in': Translator.trans('Pop-in') } )) + '">' + Translator.trans('Display') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (blockinfo.display) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(blockinfoElementId + '-display', 'select', 'display', Translator.trans('Display'), blockinfo.display, false, Translator.trans('Blockinfo display'), JSON.stringify( {'inline': Translator.trans('Inline'), 'grouped':Translator.trans('Grouped'), 'accordion': Translator.trans('Accordion'), 'pop-in': Translator.trans('Pop-in') } )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + blockinfoElementId + '" data-type="text" data-name="popinLink" data-placeholder="' + Translator.trans('Pop-in Link') + '">' + Translator.trans('Pop-in Link') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (blockinfo.popinLink) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(blockinfoElementId + '-popinLink', 'text', 'popinLink', Translator.trans('Pop-in Link'), blockinfo.popinLink, false, Translator.trans('Pop-in Link')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		blockinfoContainerBody.append(attributesContainer);
		blockinfoContainer.append(blockinfoContainerBody);
		blockinfoPanelBody.append(blockinfoContainer);
		var blockinfoButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + blockinfoElementId + '-buttons-panel"></div>');
		var blockinfoButtonsBody = $('<div class="card-body blockinfo-buttons"></div>');
		blockinfoButtonsBody.append('<button class="btn btn-success float-right validate-edit-blockinfo">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		blockinfoButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-blockinfo">' + Translator.trans('Cancel') + '</span></button>');
		blockinfoButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		blockinfoButtonsPanel.append(blockinfoButtonsBody);
		blockinfoContainerBody.append(blockinfoButtonsPanel);
		blockinfoPanelCollapse.append(blockinfoPanelBody);
		blockinfoPanel.append(blockinfoPanelCollapse);
		blockinfoPanelContainer.append(blockinfoPanel);
		return blockinfoPanelContainer;
	}

	Simulators.bindBlockInfoButtons = function(container) {
		if (! container ) {
			container = $("#steps .blocks-panel");
		}
		container.find('button.edit-blockinfo').on('click', function(e) {
			e.preventDefault();
			Simulators.editBlockInfo($($(this).attr('data-parent')));
		});
		container.find('button.delete-blockinfo').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteBlockInfo($($(this).attr('data-parent')));
		});
		container.find('button.add-chapter').on('click', function(e) {
			e.preventDefault();
			Simulators.addChapter($($(this).attr('data-parent')));
		});
	}

	Simulators.bindBlockInfo = function(blockinfoPanelContainer) {
		blockinfoPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		blockinfoPanelContainer.find('.cancel-edit-blockinfo').on('click', function() {
			blockinfoPanelContainer.find('.block-container.blockinfo').replaceWith(Simulators.blockinfoBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		blockinfoPanelContainer.find('.cancel-add-blockinfo').on('click', function() {
			blockinfoPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		blockinfoPanelContainer.find('.validate-edit-blockinfo, .validate-add-blockinfo').on('click', function() {
			var blockinfoContainerGroup = blockinfoPanelContainer.parent();
			var blockinfoContainer = blockinfoPanelContainer.find('.block-container.blockinfo');
			if (! Simulators.checkBlockInfo(blockinfoPanelContainer)) {
				return false;
			}
			var stepId = blockinfoContainer.attr('data-step');
			var panelId = blockinfoContainer.attr('data-panel');
			var id = blockinfoContainer.attr('data-id');
			var blockinfo = { 
				type: 'blockinfo', 
				id: id,
				stepId: stepId,
				panelId: panelId,
				label: ''
			};
			var attributes = blockinfoContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				blockinfo[$(this).attr('data-attribute')] = $(this).val();
			});
			if (blockinfo['name']) {
				blockinfo['name'] = $.trim(blockinfo['name']);
			}
			if (! blockinfo.popinLink) {
				blockinfo.popinLink = '';
			}
			var oldLabel = '';
			if ($(this).hasClass('validate-edit-blockinfo')) {
				var oldBlockInfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }]);
				oldLabel = oldBlockInfo.label;
				blockinfo['chapters'] = oldBlockInfo['chapters'];
			} else {
				blockinfo['chapters'] = [];
			}
			var newBlockInfoPanel = Simulators.drawBlockInfoForDisplay(blockinfo, 'in');
			if ($(this).hasClass('validate-edit-blockinfo')) {
				blockinfoContainer.replaceWith(newBlockInfoPanel.find('.block-container.blockinfo'));
				if (blockinfo.label != oldLabel) {
					Simulators.changeBlockinfoLabelInActionButtons(stepId, panelId, blockinfo.id, blockinfo.label);
					Simulators.changeBlockInfoLabelInRules(stepId, panelId, blockinfo.id, blockinfo.label);
				}
				delete blockinfo['stepId'];
				delete blockinfo['panelId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }], blockinfo);
				newBlockInfoPanel = blockinfoPanelContainer;
			} else {
				blockinfoPanelContainer.replaceWith(newBlockInfoPanel);
				Simulators.bindBlockInfoButtons(newBlockInfoPanel);
				Simulators.bindSortableChapters(newBlockInfoPanel.find('.chapters-panel'));
				Simulators.addBlockInfoInActions(blockinfo);
				delete blockinfo['stepId'];
				delete blockinfo['panelId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }], blockinfo);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newBlockInfoPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newBlockInfoPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(blockinfoPanelContainer);
	}

	Simulators.checkBlockInfo = function(blockinfoPanelContainer) {
		var blockinfoElementId = blockinfoPanelContainer.attr('id');
		var blockinfoName = $.trim($('#' + blockinfoElementId + '-name').val());
		if (blockinfoName === '') {
			blockinfoPanelContainer.find('.error-message').text(Translator.trans('The blockinfo name is required'));
			blockinfoPanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(blockinfoName)) {
			blockinfoPanelContainer.find('.error-message').text(Translator.trans('Incorrect blockinfo name'));
			blockinfoPanelContainer.find('.alert').show();
			return false;
		}
		var stepId = blockinfoPanelContainer.find('.block-container.blockinfo').attr('data-step');
		var panelId = blockinfoPanelContainer.find('.block-container.blockinfo').attr('data-panel');
		var id = blockinfoPanelContainer.find('.block-container.blockinfo').attr('data-id');
		var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId }]);
		var exists = false;
		$.each(panel.blocks, function(b, block) {
			if (block.type == 'blockinfo' && block.id != id && block.name == blockinfoName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			blockinfoPanelContainer.find('.error-message').text(Translator.trans('This blockinfo name already exists'));
			blockinfoPanelContainer.find('.alert').show();
			return false;
		}
		var display = $.trim($('#' + blockinfoElementId + '-display').val());
		if (display == 'pop-in') {
			var popinLink = $.trim($('#' + blockinfoElementId + '-popinLink').val());
			if (popinLink == '') {
				blockinfoPanelContainer.find('.error-message').text(Translator.trans('The pop-in link text is required when display is pop-in'));
				blockinfoPanelContainer.find('.alert').show();
				return false;
			}
		} else if (display == 'accordion') {
			var label = $.trim($('#' + blockinfoElementId + '-label').val());
			if (label == '') {
				blockinfoPanelContainer.find('.error-message').text(Translator.trans('The label is required when display is accordion'));
				blockinfoPanelContainer.find('.alert').show();
				return false;
			}
		}
		return true;
	}

	Simulators.addBlockInfo = function(panelContainerGroup) {
		try {
			var panelContainer = panelContainerGroup.find('.panel-container');
			var stepId = panelContainer.attr('data-step');
			var panelId = panelContainer.attr('data-id');
			var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId }]);
			var id = 0;
			if (panel.blocks) {
				$.each(panel.blocks, function (f, blockinfo) {
					if (blockinfo.id > id) {
						id = blockinfo.id;
					}
				});
			}
			var blockinfo = {
				type: 'blockinfo',
				stepId: stepId,
				panelId: panelId,
				id: parseInt(id) + 1, 
				name: '',
				label: '',
				display: 'inline',
				popinLink: '',
				chapters: []
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var blockinfoPanelContainer = Simulators.drawBlockInfoForInput(blockinfo, 'in');
			blockinfoPanelContainer.find('button.cancel-edit-blockinfo').addClass('cancel-add-blockinfo').removeClass('cancel-edit-blockinfo');
			blockinfoPanelContainer.find('button.validate-edit-blockinfo').addClass('validate-add-blockinfo').removeClass('validate-edit-blockinfo');
			var blocksPanel;
			var parentId = panelContainerGroup.attr('id');
			if (parentId === 'blocks') {
				blocksPanel = $("#collapseblocks").find("> div.sortable");
			} else {
				blocksPanel = panelContainerGroup.find(".blocks-panel > div.sortable");
			}
			blocksPanel.append(blockinfoPanelContainer);
			Simulators.bindBlockInfo(blockinfoPanelContainer);
			$("#collapse" + parentId).collapse('show');
			blockinfoPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: blockinfoPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editBlockInfo = function(blockinfoContainerGroup) {
		try {
			var blockinfoContainer = blockinfoContainerGroup.find('.block-container.blockinfo');
			var stepId = blockinfoContainer.attr('data-step');
			var panelId = blockinfoContainer.attr('data-panel');
			var id = blockinfoContainer.attr('data-id');
			var blockinfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id } ]);
			blockinfo['stepId'] = stepId;
			blockinfo['panelId'] = panelId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var blockinfoPanelContainer = Simulators.drawBlockInfoForInput(blockinfo);
			Simulators.blockinfoBackup = blockinfoContainer.replaceWith(blockinfoPanelContainer.find('.block-container.blockinfo'));
			Simulators.bindBlockInfo(blockinfoContainerGroup);
			$("#collapse" + blockinfoContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: blockinfoContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteBlockInfo = function(blockinfoContainerGroup) {
		try {
			var blockinfoContainer = blockinfoContainerGroup.find('.block-container.blockinfo');
			var stepId = blockinfoContainer.attr('data-step');
			var panelId = blockinfoContainer.attr('data-panel');
			var id = blockinfoContainer.attr('data-id');
			var panel = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId }]);
			var blockinfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }]);
			var label = blockinfo.label ? blockinfo.label : blockinfo.name; 
			var rule;
			if ((rule = Simulators.isBlockInfoInRules(stepId, panelId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting blockinfo'),
					message: Translator.trans("This blockinfo is used in rule #%id%. You must modify this rule before you can delete this blockinfo", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if ((actionButton = Simulators.isBlockinfoIdInActionButtons(stepId, panelId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting blockinfo'),
					message: Translator.trans("This blockinfo is used in action button « %label% ». You must modify this action button before you can delete this blockinfo", { 'label': actionButton }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting blockinfo'),
				message: Translator.trans("Are you sure you want to delete the blockinfo : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: id }]);
						var fparent = blockinfoContainerGroup.parent();
						blockinfoContainerGroup.remove();
						Simulators.deleteBlockInfoInActions(stepId, panelId, id);
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

}(this));
