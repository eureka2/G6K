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

	Simulators.renumberChapters = function(chapters, stepId, panelId, blockinfoId, panelGroups) {
		$.each(chapters, function(index, chapter) {
			var oldId = chapter.id;
			var id = index + 1;
			if (oldId != 0 && id != oldId) {
				chapter.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-chapter-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-chapter-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Chapter') + ' #' + id + ' : ' + chapter.label + ' ');
				var container =  panelGroup.find('.chapter-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-chapter')) {
						$(this).attr('data-chapter', id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-chapter-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-chapter-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-chapter-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-chapter-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-chapter-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeChapterIdInActionButtons(stepId, panelId, blockinfoId, oldId, 'X' + id)
				Simulators.changeChapterIdInRules(stepId, panelId, blockinfoId, oldId, 'X' + id)
			}
		});
		$.each(chapters, function(index, chapter) {
			Simulators.changeChapterIdInActionButtons(stepId, panelId, blockinfoId, 'X' + chapter.id, chapter.id);
			Simulators.changeChapterIdInRules(stepId, panelId, blockinfoId, 'X' + chapter.id, chapter.id);
		});
	}

	Simulators.bindSortableChapters = function(container) {
		if (! container ) {
			container = $("#steps .chapters-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.chapter-container');
				var stepId = container.attr('data-step');
				var panelId = container.attr('data-panel');
				var blockinfoId = container.attr('data-blockinfo');
				var blockinfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId } ]);
				var id = container.attr('data-id');
				if (Simulators.moveInArray(blockinfo.chapters, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberChapters(blockinfo.chapters, stepId, panelId, blockinfoId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawChapterForDisplay = function(chapter, inClass) {
		var chapterElementId = 'step-' + chapter.stepId + '-panel-' + chapter.panelId + '-blockinfo-' + chapter.blockinfoId + '-chapter-' + chapter.id;
		var chapterPanelContainer = Simulators.openCollapsiblePanel(chapterElementId, Translator.trans('Chapter #%id% : %label%', {'id': chapter.id, 'label': chapter.label }), 'warning', inClass, '', [{ 'class': 'delete-chapter', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'add-section', 'label': Translator.trans('Add section'), 'icon': 'fa-plus-circle' }, { 'class': 'edit-chapter', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var chapterPanelBody = chapterPanelContainer.find('.card-body');
		var chapterContainer = $('<div class="card bg-light chapter-container" id="' + chapterElementId + '-attributes-panel" data-step="' + chapter.stepId + '" data-panel="' + chapter.panelId + '" data-blockinfo="' + chapter.blockinfoId + '" data-id="' + chapter.id + '"></div>');
		var chapterContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(chapterElementId, 'text', 'name', Translator.trans('Chapter name'), chapter.name, chapter.name, true, Translator.trans('Chapter name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(chapterElementId, 'text', 'label', Translator.trans('Chapter label'), chapter.label, chapter.label, true, Translator.trans('Chapter label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(chapterElementId, 'text', 'icon', Translator.trans('Icon'), chapter.icon, chapter.icon, false, Translator.trans('Chapter icon')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(chapterElementId, 'checkbox', 'collapsible', Translator.trans('Allow collapse/expand ?'), chapter.collapsible, chapter.collapsible, false, Translator.trans('Allow collapse/expand ?')));
		attributesContainer.append(requiredAttributes);
		chapterContainerBody.append(attributesContainer);
		chapterContainer.append(chapterContainerBody);
		chapterPanelBody.append(chapterContainer);
		chapterPanelBody.append('<div class="card bg-light sections-panel" id="' + chapterElementId + '-sections-panel"><div class="card-body sortable"></div></div>');
		return chapterPanelContainer;
	}

	Simulators.drawChapterForInput = function(chapter) {
		var chapterElementId = 'step-' + chapter.stepId + '-panel-' + chapter.panelId + '-blockinfo-' + chapter.blockinfoId + '-chapter-' + chapter.id;
		var chapterPanelContainer = $('<div>', { 'class': 'panel-group', id: chapterElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var chapterPanel = $('<div>', { 'class': 'card bg-warning' });
		chapterPanel.append('<div class="card-header" role="tab" id="' + chapterElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + chapterElementId + '" href="#collapse' + chapterElementId + '" aria-expanded="true" aria-controls="collapse' + chapterElementId + '">#' + chapter.id + ' : ' + chapter.label + '</a></h4></div>');
		var chapterPanelCollapse = $('<div id="collapse' + chapterElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + chapterElementId + '-panel"></div>');
		var chapterPanelBody = $('<div class="card-body"></div>');
		var chapterContainer = $('<div class="card bg-light chapter-container" id="' + chapterElementId + '-attributes-panel" data-step="' + chapter.stepId + '" data-panel="' + chapter.panelId + '" data-blockinfo="' + chapter.blockinfoId + '" data-id="' + chapter.id + '" data-name="' + chapter.name + '"></div>');
		var chapterContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-name', 'text', 'name', Translator.trans('Name'), chapter.name, false, Translator.trans('Chapter name')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + chapterElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Chapter label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (chapter.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-label', 'text', 'label', Translator.trans('Label'), chapter.label, false, Translator.trans('Chapter label')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + chapterElementId + '" data-type="text" data-name="icon" data-placeholder="' + Translator.trans('Chapter icon') + '">' + Translator.trans('Icon') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (chapter.icon) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-icon', 'text', 'icon', Translator.trans('Icon'), chapter.icon, false, Translator.trans('Chapter icon')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + chapterElementId + '" data-type="checkbox" data-name="collapsible" data-placeholder="">' + Translator.trans('Allow collapse/expand ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (chapter.collapsible == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-collapsible', 'checkbox', 'collapsible', Translator.trans('Allow collapse/expand ?'), chapter.collapsible, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		chapterContainerBody.append(attributesContainer);
		chapterContainer.append(chapterContainerBody);
		chapterPanelBody.append(chapterContainer);
		var chapterButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + chapterElementId + '-buttons-panel"></div>');
		var chapterButtonsBody = $('<div class="card-body chapter-buttons"></div>');
		chapterButtonsBody.append('<button class="btn btn-success float-right validate-edit-chapter">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		chapterButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-chapter">' + Translator.trans('Cancel') + '</span></button>');
		chapterButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		chapterButtonsPanel.append(chapterButtonsBody);
		chapterContainerBody.append(chapterButtonsPanel);
		chapterPanelCollapse.append(chapterPanelBody);
		chapterPanel.append(chapterPanelCollapse);
		chapterPanelContainer.append(chapterPanel);
		return chapterPanelContainer;
	}

	Simulators.bindChapterButtons = function(container) {
		if (! container ) {
			container = $("#steps .chapters-panel");
		}
		container.find('button.edit-chapter').on('click', function(e) {
			e.preventDefault();
			Simulators.editChapter($($(this).attr('data-parent')));
		});
		container.find('button.delete-chapter').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteChapter($($(this).attr('data-parent')));
		});
		container.find('button.add-section').on('click', function(e) {
			e.preventDefault();
			Simulators.addSection($($(this).attr('data-parent')));
		});
	}

	Simulators.bindChapter = function(chapterPanelContainer) {
		chapterPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		chapterPanelContainer.find('.cancel-edit-chapter').on('click', function() {
			chapterPanelContainer.find('.chapter-container').replaceWith(Simulators.chapterBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		chapterPanelContainer.find('.cancel-add-chapter').on('click', function() {
			chapterPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		chapterPanelContainer.find('.validate-edit-chapter, .validate-add-chapter').on('click', function() {
			var chapterContainerGroup = chapterPanelContainer.parent();
			var chapterContainer = chapterPanelContainer.find('.chapter-container');
			if (! Simulators.checkChapter(chapterPanelContainer)) {
				return false;
			}
			var stepId = chapterContainer.attr('data-step');
			var panelId = chapterContainer.attr('data-panel');
			var blockinfoId = chapterContainer.attr('data-blockinfo');
			var id = chapterContainer.attr('data-id');
			var chapter = { 
				id: id,
				stepId: stepId,
				panelId: panelId,
				blockinfoId: blockinfoId,
				label: '',
				icon: '',
				collapsible: '0'
			};
			var attributes = chapterContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				chapter[$(this).attr('data-attribute')] = $(this).val();
			});
			if (chapter['name']) {
				chapter['name'] = $.trim(chapter['name']);
			}
			var oldLabel = '';
			if ($(this).hasClass('validate-edit-chapter')) {
				var oldChapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: id }]);
				oldLabel = oldChapter.label;
				chapter['sections'] = oldChapter['sections'];
			} else {
				chapter['sections'] = [];
			}
			var newChapterPanel = Simulators.drawChapterForDisplay(chapter, 'in');
			if ($(this).hasClass('validate-edit-chapter')) {
				chapterContainer.replaceWith(newChapterPanel.find('.chapter-container'));
				if (chapter.label != oldLabel) {
					Simulators.changeChapterLabelInActionButtons(stepId, panelId, blockinfoId, chapter.id, chapter.label);
					Simulators.changeChapterLabelInRules(stepId, panelId, blockinfoId, chapter.id, chapter.label);
				}
				delete chapter['stepId'];
				delete chapter['panelId'];
				delete chapter['blockinfoId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: id }], chapter);
				newChapterPanel = chapterPanelContainer;
			} else {
				chapterPanelContainer.replaceWith(newChapterPanel);
				Simulators.bindChapterButtons(newChapterPanel);
				Simulators.bindSortableSections(newChapterPanel.find('.sections-panel'));
				Simulators.addChapterInActions(chapter);
				delete chapter['stepId'];
				delete chapter['panelId'];
				delete chapter['blockinfoId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }], chapter);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newChapterPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newChapterPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(chapterPanelContainer);
	}

	Simulators.checkChapter = function(chapterPanelContainer) {
		var chapterElementId = chapterPanelContainer.attr('id');
		var chapterName = $.trim($('#' + chapterElementId + '-name').val());
		if (chapterName === '') {
			chapterPanelContainer.find('.error-message').text(Translator.trans('The chapter name is required'));
			chapterPanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(chapterName)) {
			chapterPanelContainer.find('.error-message').text(Translator.trans('Incorrect chapter name'));
			chapterPanelContainer.find('.alert').show();
			return false;
		}
		var stepId = chapterPanelContainer.find('.chapter-container').attr('data-step');
		var panelId = chapterPanelContainer.find('.chapter-container').attr('data-panel');
		var blockinfoId = chapterPanelContainer.find('.chapter-container').attr('data-blockinfo');
		var id = chapterPanelContainer.find('.chapter-container').attr('data-id');
		var blockinfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId }]);
		var exists = false;
		$.each(blockinfo.chapters, function(c, chapter) {
			if (chapter.id != id && chapter.name == chapterName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			chapterPanelContainer.find('.error-message').text(Translator.trans('This chapter name already exists'));
			chapterPanelContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addChapter = function(blockinfoContainerGroup) {
		try {
			var blockinfoContainer = blockinfoContainerGroup.find('.block-container.blockinfo');
			var stepId = blockinfoContainer.attr('data-step');
			var panelId = blockinfoContainer.attr('data-panel');
			var blockinfoId = blockinfoContainer.attr('data-id');
			var blockinfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId }]);
			var id = 0;
			if (blockinfo.chapters) {
				$.each(blockinfo.chapters, function (f, chapter) {
					if (chapter.id > id) {
						id = chapter.id;
					}
				});
			}
			var chapter = {
				stepId: stepId,
				panelId: panelId,
				blockinfoId: blockinfoId,
				id: parseInt(id) + 1, 
				name: '',
				label: '',
				sections: []
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var chapterPanelContainer = Simulators.drawChapterForInput(chapter);
			chapterPanelContainer.find('button.cancel-edit-chapter').addClass('cancel-add-chapter').removeClass('cancel-edit-chapter');
			chapterPanelContainer.find('button.validate-edit-chapter').addClass('validate-add-chapter').removeClass('validate-edit-chapter');
			var chaptersPanel;
			var parentId = blockinfoContainerGroup.attr('id');
			if (parentId === 'chapters') {
				chaptersPanel = $("#collapsechapters").find("> div.sortable");
			} else {
				chaptersPanel = blockinfoContainerGroup.find(".chapters-panel > div.sortable");
			}
			chaptersPanel.append(chapterPanelContainer);
			Simulators.bindChapter(chapterPanelContainer);
			$("#collapse" + parentId).collapse('show');
			chapterPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: chapterPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editChapter = function(chapterContainerGroup) {
		try {
			var chapterContainer = chapterContainerGroup.find('.chapter-container');
			var stepId = chapterContainer.attr('data-step');
			var panelId = chapterContainer.attr('data-panel');
			var blockinfoId = chapterContainer.attr('data-blockinfo');
			var id = chapterContainer.attr('data-id');
			var chapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: id }]);
			chapter['stepId'] = stepId;
			chapter['panelId'] = panelId;
			chapter['blockinfoId'] = blockinfoId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var chapterPanelContainer = Simulators.drawChapterForInput(chapter);
			Simulators.chapterBackup = chapterContainer.replaceWith(chapterPanelContainer.find('.chapter-container'));
			Simulators.bindChapter(chapterContainerGroup);
			$("#collapse" + chapterContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: chapterContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteChapter = function(chapterContainerGroup) {
		try {
			var chapterContainer = chapterContainerGroup.find('.chapter-container');
			var stepId = chapterContainer.attr('data-step');
			var panelId = chapterContainer.attr('data-panel');
			var blockinfoId = chapterContainer.attr('data-blockinfo');
			var id = chapterContainer.attr('data-id');
			var blockinfo = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId }]);
			var chapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: id }]);
			var label = chapter.label ? chapter.label : chapter.name; 
			var rule;
			if ((rule = Simulators.isChapterInRules(stepId, panelId, blockinfoId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting chapter'),
					message: Translator.trans("This chapter is used in rule #%id%. You must modify this rule before you can delete this chapter", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if ((actionButton = Simulators.isChapterIdInActionButtons(stepId, panelId, blockinfoId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting chapter'),
					message: Translator.trans("This chapter is used in action button « %label% ». You must modify this action button before you can delete this chapter", { 'label': actionButton }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting chapter'),
				message: Translator.trans("Are you sure you want to delete the chapter : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: id }]);
						var cparent = chapterContainerGroup.parent();
						chapterContainerGroup.remove();
						Simulators.deleteChapterInActions(stepId, panelId, blockinfoId, id);
						Simulators.renumberChapters(blockinfo.chapters, stepId, panelId, blockinfoId, cparent.find('> div'));
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
