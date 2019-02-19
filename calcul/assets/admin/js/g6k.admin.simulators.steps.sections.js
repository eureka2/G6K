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

	Simulators.renumberSections = function(sections, stepId, panelId, blockinfoId, chapterId, panelGroups) {
		$.each(sections, function(index, section) {
			var oldId = section.id;
			var id = index + 1;
			if (oldId != 0 && id != oldId) {
				section.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-section-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-section-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Section') + ' #' + id + ' : ' + section.label + ' ');
				var container =  panelGroup.find('.section-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-section-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-section-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-section-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-section-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-section-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeSectionIdInActionButtons(stepId, panelId, blockinfoId, chapterId, oldId, 'X' + id)
				Simulators.changeSectionIdInRules(stepId, panelId, blockinfoId, chapterId, oldId, 'X' + id)
			}
		});
		$.each(sections, function(index, section) {
			Simulators.changeSectionIdInActionButtons(stepId, panelId, blockinfoId, chapterId, 'X' + section.id, section.id);
			Simulators.changeSectionIdInRules(stepId, panelId, blockinfoId, chapterId, 'X' + section.id, section.id);
		});
	}

	Simulators.bindSortableSections = function(container) {
		if (! container ) {
			container = $("#steps .sections-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.section-container');
				var stepId = container.attr('data-step');
				var panelId = container.attr('data-panel');
				var blockinfoId = container.attr('data-blockinfo');
				var chapterId = container.attr('data-chapter');
				var chapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId } ]);
				var id = container.attr('data-id');
				if (Simulators.moveInArray(chapter.sections, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberSections(chapter.sections, stepId, panelId, blockinfoId, chapterId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawSectionForDisplay = function(section, inClass) {
		var sectionElementId = 'step-' + section.stepId + '-panel-' + section.panelId + '-blockinfo-' + section.blockinfoId + '-chapter-' + section.chapterId + '-section-' + section.id;
		var sectionPanelContainer = Simulators.openCollapsiblePanel(sectionElementId, Translator.trans('Section #%id% : %label%', { 'id': section.id,  'label': section.label }), 'info', inClass, '', [{ 'class': 'delete-section', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-section', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var sectionPanelBody = sectionPanelContainer.find('.card-body');
		var sectionContainer = $('<div class="card bg-light section-container" id="' + sectionElementId + '-attributes-panel" data-step="' + section.stepId + '" data-panel="' + section.panelId + '" data-blockinfo="' + section.blockinfoId + '" data-chapter="' + section.chapterId + '" data-id="' + section.id + '"></div>');
		var sectionContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(sectionElementId, 'text', 'name', Translator.trans('Name'), section.name, section.name, true, Translator.trans('Section name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(sectionElementId, 'text', 'label', Translator.trans('Label'), section.label, section.label, false, Translator.trans('Section label')));
		attributesContainer.append(requiredAttributes);
		sectionContainerBody.append(attributesContainer);
		sectionContainer.append(sectionContainerBody);
		sectionPanelBody.append(sectionContainer);
		sectionPanelBody.append('<div class="card bg-light content-panel" id="' + sectionElementId + '-content-panel"><div class="card-header">' + Translator.trans('Content') + '</div><div class="card-body section-content rich-text" data-edition="' + section.content.edition + '">' + section.content.content + '</div></div>');
		if (section.annotations) {
			sectionPanelBody.append('<div class="card bg-light annotations-panel" id="' + sectionElementId + '-annotations-panel"><div class="card-header">' + Translator.trans('Annotations') + '</div><div class="card-body section-annotations rich-text" data-edition="' + section.annotations.edition + '">' + section.annotations.content + '</div></div>');
		}
		return sectionPanelContainer;
	}

	Simulators.drawSectionForInput = function(section) {
		var sectionElementId = 'step-' + section.stepId + '-panel-' + section.panelId + '-blockinfo-' + section.blockinfoId + '-chapter-' + section.chapterId + '-section-' + section.id;
		var sectionPanelContainer = $('<div>', { 'class': 'panel-group', id: sectionElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var sectionPanel = $('<div>', { 'class': 'card bg-info' });
		sectionPanel.append('<div class="card-header" role="tab" id="' + sectionElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + sectionElementId + '" href="#collapse' + sectionElementId + '" aria-expanded="true" aria-controls="collapse' + sectionElementId + '">#' + section.id + ' : ' + section.label + '</a></h4></div>');
		var sectionPanelCollapse = $('<div id="collapse' + sectionElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + sectionElementId + '-panel"></div>');
		var sectionPanelBody = $('<div class="card-body"></div>');
		var sectionContainer = $('<div class="card bg-light section-container" id="' + sectionElementId + '-attributes-panel" data-step="' + section.stepId + '" data-panel="' + section.panelId + '" data-blockinfo="' + section.blockinfoId + '" data-chapter="' + section.chapterId + '" data-id="' + section.id + '" data-name="' + section.name + '"></div>');
		var sectionContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(sectionElementId + '-name', 'text', 'name', Translator.trans('Name'), section.name, false, Translator.trans('Section name')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + sectionElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Section label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (section.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(sectionElementId + '-label', 'text', 'label', Translator.trans('Label'), section.label, false, Translator.trans('Section label')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		sectionContainerBody.append(attributesContainer);
		sectionContainer.append(sectionContainerBody);
		sectionPanelBody.append(sectionContainer);
		sectionPanelBody.append('<div class="card bg-light content-panel" id="' + sectionElementId + '-content-panel"><div class="card-header">' + Translator.trans('Content') + '</div><div class="card-body"><textarea rows="5" name="' + sectionElementId + '-content" id="' + sectionElementId + '-content" wrap="hard" class="form-control section-content">' + Simulators.paragraphs(section.content).content + '</textarea></div></div>');
		sectionPanelBody.append('<div class="card bg-light annotations-panel" id="' + sectionElementId + '-annotations-panel"><div class="card-header">' + Translator.trans('Annotations') + '</div><div class="card-body"><textarea rows="5" name="' + sectionElementId + '-annotations" id="' + sectionElementId + '-annotations" wrap="hard" class="form-control section-annotations">' + Simulators.paragraphs(section.annotations).content + '</textarea></div></div>');
		var sectionButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + sectionElementId + '-buttons-panel"></div>');
		var sectionButtonsBody = $('<div class="card-body section-buttons"></div>');
		sectionButtonsBody.append('<button class="btn btn-success float-right validate-edit-section">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		sectionButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-section">' + Translator.trans('Cancel') + '</span></button>');
		sectionButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		sectionButtonsPanel.append(sectionButtonsBody);
		sectionPanelBody.append(sectionButtonsPanel);
		sectionPanelCollapse.append(sectionPanelBody);
		sectionPanel.append(sectionPanelCollapse);
		sectionPanelContainer.append(sectionPanel);
		return sectionPanelContainer;
	}

	Simulators.bindSectionButtons = function(container) {
		if (! container ) {
			container = $("#steps .sections-panel");
		}
		container.find('button.edit-section').on('click', function(e) {
			e.preventDefault();
			Simulators.editSection($($(this).attr('data-parent')));
		});
		container.find('button.delete-section').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteSection($($(this).attr('data-parent')));
		});
	}

	Simulators.bindSection = function(sectionPanelContainer) {
		sectionPanelContainer.find('textarea').wysihtml(Admin.wysihtml5Options);
		sectionPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		sectionPanelContainer.find('.cancel-edit-section').on('click', function() {
			sectionPanelContainer.replaceWith(Simulators.sectionBackup);
			Simulators.sectionBackup.find('button.edit-section').on('click', function(e) {
				e.preventDefault();
				Simulators.editSection($($(this).attr('data-parent')));
			});
			Simulators.sectionBackup.find('button.delete-section').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteSection($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		sectionPanelContainer.find('.cancel-add-section').on('click', function() {
			sectionPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		sectionPanelContainer.find('.validate-edit-section, .validate-add-section').on('click', function() {
			var sectionContainerGroup = sectionPanelContainer.parent();
			var sectionContainer = sectionPanelContainer.find('.section-container');
			if (! Simulators.checkSection(sectionPanelContainer)) {
				return false;
			}
			var stepId = sectionContainer.attr('data-step');
			var panelId = sectionContainer.attr('data-panel');
			var blockinfoId = sectionContainer.attr('data-blockinfo');
			var chapterId = sectionContainer.attr('data-chapter');
			var id = sectionContainer.attr('data-id');
			var section = {
				id: id,
				stepId: stepId,
				panelId: panelId,
				blockinfoId: blockinfoId,
				chapterId: chapterId,
				label: '',
				content: {
					content: '',
					edition: ''
				},
				annotations: {
					content: '',
					edition: ''
				}
			};
			var attributes = sectionContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				section[$(this).attr('data-attribute')] = $(this).val();
			});
			if (section['name']) {
				section['name'] = $.trim(section['name']);
			}
			section.content = {
				content: Admin.clearHTML(sectionPanelContainer.find('.section-content')),
				edition: 'wysihtml'
			};
			var annotations = Admin.clearHTML(sectionPanelContainer.find('.section-annotations'));
			if (annotations != '') {
				section.annotations = {
					content: annotations,
					edition: 'wysihtml'
				};
			} else {
				delete section['annotations'];
			}
			var newSectionPanel = Simulators.drawSectionForDisplay(section, 'in');
			delete section['stepId'];
			delete section['panelId'];
			delete section['blockinfoId'];
			delete section['chapterId'];
			sectionPanelContainer.replaceWith(newSectionPanel);
			Simulators.bindSectionButtons(newSectionPanel);
			if ($(this).hasClass('validate-edit-section')) {
				var oldSection = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId, list: 'sections' }, { key: 'id', val: section.id }]);
				if (section.label != oldSection.label) {
					Simulators.changeSectionLabelInActionButtons(stepId, panelId, blockinfoId, chapterId, section.id, section.label);
					Simulators.changeSectionLabelInRules(stepId, panelId, blockinfoId, chapterId, section.id, section.label);
				}
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId, list: 'sections' }, { key: 'id', val: section.id }], section);
			} else {
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId, list: 'sections' }], section);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newSectionPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newSectionPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(sectionPanelContainer);
	}

	Simulators.checkSection = function(sectionPanelContainer) {
		var sectionElementId = sectionPanelContainer.attr('id');
		var sectionName = $.trim($('#' + sectionElementId + '-name').val());
		if (sectionName === '') {
			sectionPanelContainer.find('.error-message').text(Translator.trans('The section name is required'));
			sectionPanelContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(sectionName)) {
			sectionPanelContainer.find('.error-message').text(Translator.trans('Incorrect section name'));
			sectionPanelContainer.find('.alert').show();
			return false;
		}
		var sectionContent = $.trim($('#' + sectionElementId + '-content').val());
		if (sectionContent === '') {
			sectionPanelContainer.find('.error-message').text(Translator.trans('The section content is required'));
			sectionPanelContainer.find('.alert').show();
			return false;
		}
		var stepId = sectionPanelContainer.find('.section-container').attr('data-step');
		var panelId = sectionPanelContainer.find('.section-container').attr('data-panel');
		var blockinfoId = sectionPanelContainer.find('.section-container').attr('data-blockinfo');
		var chapterId = sectionPanelContainer.find('.section-container').attr('data-chapter');
		var id = sectionPanelContainer.find('.section-container').attr('data-id');
		var chapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId }]);
		var exists = false;
		$.each(chapter.sections, function(s, section) {
			if (section.id != id && section.name == sectionName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			sectionPanelContainer.find('.error-message').text(Translator.trans('This section name already exists'));
			sectionPanelContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addSection = function(chapterContainerGroup) {
		try {
			var chapterContainer = chapterContainerGroup.find('.chapter-container');
			var stepId = chapterContainer.attr('data-step');
			var panelId = chapterContainer.attr('data-panel');
			var blockinfoId = chapterContainer.attr('data-blockinfo');
			var chapterId = chapterContainer.attr('data-id');
			var chapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId }]);
			var id = 0;
			if (chapter.sections) {
				$.each(chapter.sections, function (f, section) {
					if (section.id > id) {
						id = section.id;
					}
				});
			}
			var section = {
				stepId: stepId,
				panelId: panelId,
				blockinfoId: blockinfoId,
				chapterId: chapterId,
				id: parseInt(id) + 1, 
				name: '',
				label: '',
				content: {
					content: '',
					edition: ''
				},
				annotations: {
					content: '',
					edition: ''
				}
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var sectionPanelContainer = Simulators.drawSectionForInput(section);
			sectionPanelContainer.find('button.cancel-edit-section').addClass('cancel-add-section').removeClass('cancel-edit-section');
			sectionPanelContainer.find('button.validate-edit-section').addClass('validate-add-section').removeClass('validate-edit-section');
			var sectionsPanel;
			var parentId = chapterContainerGroup.attr('id');
			if (parentId === 'sections') {
				sectionsPanel = $("#collapsesections").find("> div.sortable");
			} else {
				sectionsPanel = chapterContainerGroup.find(".sections-panel > div.sortable");
			}
			sectionsPanel.append(sectionPanelContainer);
			Simulators.bindSection(sectionPanelContainer);
			$("#collapse" + parentId).collapse('show');
			sectionPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: sectionPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editSection = function(sectionContainerGroup) {
		try {
			var sectionContainer = sectionContainerGroup.find('.section-container');
			var stepId = sectionContainer.attr('data-step');
			var panelId = sectionContainer.attr('data-panel');
			var blockinfoId = sectionContainer.attr('data-blockinfo');
			var chapterId = sectionContainer.attr('data-chapter');
			var id = sectionContainer.attr('data-id');
			var section = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId, list: 'sections' }, { key: 'id', val: id }]);
			section['stepId'] = stepId;
			section['panelId'] = panelId;
			section['blockinfoId'] = blockinfoId;
			section['chapterId'] = chapterId;
			if (! section['annotations']) {
				section['annotations'] = {
					content: '',
					edition: ''
				};
			}
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var sectionPanelContainer = Simulators.drawSectionForInput(section);
			Simulators.sectionBackup = sectionContainerGroup.replaceWith(sectionPanelContainer);
			Simulators.bindSection(sectionPanelContainer);
			$("#collapse" + sectionPanelContainer.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: sectionPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteSection = function(sectionContainerGroup) {
		try {
			var sectionContainer = sectionContainerGroup.find('.section-container');
			var stepId = sectionContainer.attr('data-step');
			var panelId = sectionContainer.attr('data-panel');
			var blockinfoId = sectionContainer.attr('data-blockinfo');
			var chapterId = sectionContainer.attr('data-chapter');
			var id = sectionContainer.attr('data-id');
			var chapter = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId }]);
			var section = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId, list: 'sections' }, { key: 'id', val: id }]);
			var label = section.label !== '' ? section.label : section.name; 
			var rule;
			if ((rule = Simulators.isSectionInRules(stepId, panelId, blockinfoId, chapterId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting section'),
					message: Translator.trans("This section is used in rule #%id%. You must modify this rule before you can delete this section", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if ((actionButton = Simulators.isSectionIdInActionButtons(stepId, panelId, blockinfoId, chapterId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting section'),
					message: Translator.trans("This section is used in action button « %label% ». You must modify this action button before you can delete this section", { 'label': actionButton }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting section'),
				message: Translator.trans("Are you sure you want to delete the section : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: blockinfoId, list: 'chapters' }, { key: 'id', val: chapterId, list: 'sections' }, { key: 'id', val: id }]);
						var sparent = sectionContainerGroup.parent();
						sectionContainerGroup.remove();
						Simulators.deleteSectionInActions(stepId, panelId, blockinfoId, chapterId, id);
						Simulators.renumberSections(chapter.sections, stepId, panelId, blockinfoId, chapterId, sparent.find('> div'));
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
