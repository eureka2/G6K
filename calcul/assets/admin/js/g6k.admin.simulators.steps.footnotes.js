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

	Simulators.renumberFootNotes = function(footnotes, stepId, footnoteGroups) {
		$.each(footnotes, function(index, footnote) {
			var oldId = footnote.id;
			var id = index + 1;
			if (id != oldId) {
				footnote.id = id;
				var footnoteGroup = footnoteGroups.eq(index);
				var re = new RegExp("-footnote-" + oldId, 'g');
				var attr = footnoteGroup.attr('id');
				attr = attr.replace(re, "-footnote-" + id);
				footnoteGroup.attr('id', attr);
				var h4 = footnoteGroup.find('> .card-header').find('> h4');
				h4.text(' ' + Translator.trans('FootNote #%id%', {'id': id}));
				footnoteGroup.attr('data-id', id);
				var descendants = footnoteGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-footnote-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-footnote-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-footnote-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-footnote-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-footnote-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeFootNoteIdInRules(stepId, oldId, 'X' + id)
			}
		});
		$.each(footnotes, function(index, footnote) {
			Simulators.changeFootNoteIdInRules(stepId, 'X' + footnote.id, footnote.id);
		});
	}

	Simulators.bindSortableFootNotes = function(container) {
		if (! container ) {
			container = $("#steps .footnotes-panel.sortable");
		}
		container.sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var self = $(this);
				var fcontainer = $(ui.item);
				var stepId = fcontainer.attr('data-step');
				var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId } ]);
				var id = fcontainer.attr('data-id');
				if (Simulators.moveInArray(step.footNotes.footNotes, [{key: 'id', val: id}], ui.item.index())) {
					Simulators.renumberFootNotes(step.footNotes.footNotes, stepId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawFootNotesForDisplay = function(footnotes) {
		var footnotesElementId = 'step-' + footnotes.stepId + '-footnotes';
		var footnotesPanelContainer = Simulators.openCollapsiblePanel(footnotesElementId, Translator.trans('FootNotes'), 'success', 'in', '', [{ 'class': 'delete-footnotes', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'add-footnote', 'label': Translator.trans('Add footnote'), 'icon': 'fa-plus-circle' }, { 'class': 'edit-footnotes', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' }] );
		var footnotesPanelBody = footnotesPanelContainer.find('.card-body');
		var footnotesContainer = $('<div class="card bg-light footnotes-container" id="' + footnotesElementId + '-attributes-panel" data-step="' + footnotes.stepId + '"></div>');
		var footnotesContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(footnotesElementId, 'select', 'position', Translator.trans('Position'), footnotes.position, footnotes.position, true, Translator.trans('Select a position'), JSON.stringify( { 'beforeActions': Translator.trans('before action buttons'), 'afterActions': Translator.trans('after action buttons') } )));
		attributesContainer.append(requiredAttributes);
		footnotesContainerBody.append(attributesContainer);
		footnotesContainer.append(footnotesContainerBody);
		footnotesPanelBody.append(footnotesContainer);
		var footnotesPanel = $('<div class="footnotes-panel sortable"></div>');
		$.each(footnotes.footNotes, function(f, footnote) {
			footnote.stepId = footnotes.stepId;
			footnotesPanel.append(Simulators.drawFootNoteForDisplay(footnote));
		});
		footnotesPanelBody.append(footnotesPanel);
		return footnotesPanelContainer;
	}

	Simulators.drawFootNotesForInput = function(footnotes) {
		var footnotesElementId = 'step-' + footnotes.stepId + '-footnotes';
		var footnotesPanelContainer = $('<div>', { 'class': 'panel-group', id: footnotesElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var footnotesPanel = $('<div>', { 'class': 'card bg-success' });
		footnotesPanel.append('<div class="card-header" role="tab" id="' + footnotesElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + footnotesElementId + '" href="#collapse' + footnotesElementId + '" aria-expanded="true" aria-controls="collapse' + footnotesElementId + '">' + Translator.trans('FootNotes') + '</a></h4></div>');
		var footnotesPanelCollapse = $('<div id="collapse' + footnotesElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + footnotesElementId + '-panel"></div>');
		var footnotesPanelBody = $('<div class="card-body"></div>');
		var footnotesContainer = $('<div class="card bg-light footnotes-container" id="' + footnotesElementId + '-attributes-panel" data-step="' + footnotes.stepId + '"></div>');
		var footnotesContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(footnotesElementId + '-position', 'select', 'position', Translator.trans('Position'), footnotes.position, true, Translator.trans('Select a position'), JSON.stringify( { 'beforeActions': Translator.trans('before action buttons'), 'afterActions': Translator.trans('after action buttons') } )));
		attributesContainer.append(requiredAttributes);
		footnotesContainerBody.append(attributesContainer);
		footnotesContainer.append(footnotesContainerBody);
		footnotesPanelBody.append(footnotesContainer);
		var footnotesButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + footnotesElementId + '-buttons-panel"></div>');
		var footnotesButtonsBody = $('<div class="card-body footnotes-buttons"></div>');
		footnotesButtonsBody.append('<button class="btn btn-success float-right validate-edit-footnotes">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		footnotesButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-footnotes">' + Translator.trans('Cancel') + '</span></button>');
		footnotesButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		footnotesButtonsPanel.append(footnotesButtonsBody);
		footnotesContainerBody.append(footnotesButtonsPanel);
		footnotesPanelCollapse.append(footnotesPanelBody);
		footnotesPanel.append(footnotesPanelCollapse);
		footnotesPanelContainer.append(footnotesPanel);
		return footnotesPanelContainer;
	}

	Simulators.bindFootNotesButtons = function(container) {
		if (! container ) {
			container = $("#steps");
		}
		container.find('button.edit-footnotes').on('click', function(e) {
			e.preventDefault();
			Simulators.editFootNotes($($(this).attr('data-parent')));
		});
		container.find('button.delete-footnotes').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteFootNotes($($(this).attr('data-parent')));
		});
		container.find('button.add-footnote').on('click', function(e) {
			e.preventDefault();
			Simulators.addFootNote($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFootNotes = function(footnotesPanelContainer) {
		footnotesPanelContainer.find('.cancel-edit-footnotes').on('click', function() {
			footnotesPanelContainer.find('.footnotes-container').replaceWith(Simulators.footnotesBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotesPanelContainer.find('.cancel-add-footnotes').on('click', function() {
			footnotesPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotesPanelContainer.find('.validate-edit-footnotes, .validate-add-footnotes').on('click', function() {
			var footnotesContainerGroup = footnotesPanelContainer.parent();
			var footnotesContainer = footnotesPanelContainer.find('.footnotes-container');
			if (! Simulators.checkFootNotes(footnotesPanelContainer)) {
				return false;
			}
			var stepId = footnotesContainer.attr('data-step');
			var footnotes = { stepId: stepId };
			var attributes = footnotesContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				footnotes[$(this).attr('data-attribute')] = $(this).val();
			});
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			if ($(this).hasClass('validate-edit-footnotes')) {
				footnotes['footNotes'] = step.footNotes['footNotes'];
			} else {
				footnotes['footNotes'] = [];
			}
			var newFootNotesPanel = Simulators.drawFootNotesForDisplay(footnotes);
			delete footnotes['stepId'];
			if ($(this).hasClass('validate-edit-footnotes')) {
				footnotesContainer.replaceWith(newFootNotesPanel.find('.footnotes-container'));
				step.footNotes = footnotes;
				newFootNotesPanel = footnotesPanelContainer;
			} else {
				footnotesPanelContainer.replaceWith(newFootNotesPanel);
				Simulators.bindSortableFootNotes(newFootNotesPanel.find('.sortable'));
				Simulators.bindFootNotesButtons(newFootNotesPanel);
				step.footNotes = footnotes;
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newFootNotesPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newFootNotesPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(footnotesPanelContainer);
	}

	Simulators.checkFootNotes = function(footnotesContainer) {
		var footnotesElementId = footnotesContainer.attr('id');
		var footnotesPosition = $('#' + footnotesElementId + '-position').val();
		return true;
	}

	Simulators.addFootNotes = function(stepContainerGroup) {
		try {
			var stepContainer = stepContainerGroup.find('.step-container');
			var stepId = stepContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var footnotes = {
				stepId: stepId,
				position: 'beforeActions',
				footNotes: []
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var footnotesPanelContainer = Simulators.drawFootNotesForInput(footnotes);
			footnotesPanelContainer.find('button.cancel-edit-footnotes').addClass('cancel-add-footnotes').removeClass('cancel-edit-footnotes');
			footnotesPanelContainer.find('button.validate-edit-footnotes').addClass('validate-add-footnotes').removeClass('validate-edit-footnotes');
			var panels = stepContainerGroup.find('.panels-panel');
			panels.after(footnotesPanelContainer);
			Simulators.bindFootNotes(footnotesPanelContainer);
			stepContainerGroup.find('.collapse').collapse('show');
			footnotesPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: footnotesPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editFootNotes = function(footnotesContainerGroup) {
		try {
			var footnotesContainer = footnotesContainerGroup.find('.footnotes-container');
			var stepId = footnotesContainer.attr('data-step');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId } ]);
			var footnotes = step.footNotes;
			footnotes['stepId'] = stepId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var footnotesPanelContainer = Simulators.drawFootNotesForInput(footnotes);
			Simulators.footnotesBackup = footnotesContainer.replaceWith(footnotesPanelContainer.find('.footnotes-container'));
			Simulators.bindFootNotes(footnotesContainerGroup);
			$("#collapse" + footnotesContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: footnotesContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteFootNotes = function(footnotesContainerGroup) {
		try {
			var footnotesContainer = footnotesContainerGroup.find('.footnotes-container');
			var stepId = footnotesContainer.attr('data-step');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var label = step.label ? step.label : step.name;
			bootbox.confirm({
				title: Translator.trans('Deleting footnotes'),
				message: Translator.trans("Are you sure you want to delete the footnotes of step : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						delete step.footNotes;
						footnotesContainerGroup.remove();
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.drawFootNoteForDisplay = function(footnote) {
		var footnoteElementId = 'step-' + footnote.stepId + '-footnotes-footnote' + footnote.id;
		var footnoteContainer = $('<div class="card bg-light footnote-container" id="' +  footnoteElementId + '-panel" data-step="' + footnote.stepId + '" data-id="' + footnote.id + '">');
		var footnoteContainerHeading = $('<div class="card-header">');
		footnoteContainerHeading.append('<button class="btn btn-secondary float-right update-button delete-footnote" title="' + Translator.trans('Delete') + '" data-parent="#' +  footnoteElementId + '-panel"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button>');
		footnoteContainerHeading.append('<button class="btn btn-secondary float-right update-button edit-footnote" title="' + Translator.trans('Edit') + '" data-parent="#' +  footnoteElementId + '-panel"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="fas fa-pencil-alt"></span></button>');
		footnoteContainerHeading.append('<h4 class="card-title">' + Translator.trans('FootNote #%id%', { 'id': footnote.id }) + '</h4>');
		footnoteContainer.append(footnoteContainerHeading);
		var footnoteContainerBody = $('<div class="card-body step-footnote rich-text"></div>');
		footnoteContainerBody.append(footnote.text.content);
		footnoteContainer.append(footnoteContainerBody);
		return footnoteContainer;
	}

	Simulators.drawFootNoteForInput = function(footnote) {
		var footnoteElementId = 'step-' + footnote.stepId + '-footnotes-footnote' + footnote.id;
		var footnoteContainer = $('<div class="card bg-light footnote-container" id="' + footnoteElementId + '-attributes-panel" data-step="' + footnote.stepId + '" data-id="' + footnote.id + '"></div>');
		var footnoteContainerHeading = $('<div class="card-header">');
		footnoteContainerHeading.append('<h4 class="card-title">' + Translator.trans('FootNote #%id%', { 'id': footnote.id }) + '</h4>');
		footnoteContainer.append(footnoteContainerHeading);
		var footnoteContainerBody = $('<div class="card-body step-footnote"></div>');
		footnoteContainerBody.append('<textarea rows="5" name="' + footnoteElementId + '-text" id="' + footnoteElementId + '-text" wrap="hard" class="form-control footnote-text">' + Simulators.paragraphs(footnote.text).content + '</textarea>');
		var footnoteButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + footnoteElementId + '-buttons-panel"></div>');
		var footnoteButtonsBody = $('<div class="card-body footnote-buttons"></div>');
		footnoteButtonsBody.append('<button class="btn btn-success float-right validate-edit-footnote">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		footnoteButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-footnote">' + Translator.trans('Cancel') + '</span></button>');
		footnoteButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		footnoteButtonsPanel.append(footnoteButtonsBody);
		footnoteContainerBody.append(footnoteButtonsPanel);
		footnoteContainer.append(footnoteContainerBody);
		return footnoteContainer;
	}

	Simulators.bindFootNoteButtons = function(container) {
		if (! container ) {
			container = $("#steps");
		}
		container.find('button.edit-footnote').on('click', function(e) {
			e.preventDefault();
			Simulators.editFootNote($($(this).attr('data-parent')));
		});
		container.find('button.delete-footnote').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteFootNote($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFootNote = function(footnotePanelContainer) {
		footnotePanelContainer.find('textarea').wysihtml(Admin.wysihtml5Options);
		footnotePanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		footnotePanelContainer.find('.cancel-edit-footnote').on('click', function() {
			footnotePanelContainer.replaceWith(Simulators.footnoteBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotePanelContainer.find('.cancel-add-footnote').on('click', function() {
			footnotePanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotePanelContainer.find('.validate-edit-footnote').on('click', function() {
			var footnoteContainerGroup = footnotePanelContainer.parent();
			if (! Simulators.checkFootNote(footnotePanelContainer)) {
				return false;
			}
			var stepId = footnoteContainerGroup.attr('data-step');
			var id = footnoteContainerGroup.attr('data-id');
			var footnote = { id: id };
			footnote['stepId'] = stepId;
			footnote.text = {
				content: Admin.clearHTML(footnotePanelContainer.find('.footnote-text')),
				edition: 'wysihtml'
			};
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var newFootNotePanel = Simulators.drawFootNoteForDisplay(footnote);
			delete footnote['stepId'];
			footnotePanelContainer.replaceWith(newFootNotePanel.find('.step-footnote'));
			Simulators.updateInArray(step['footNotes']['footNotes'], [{ key: 'id', val: footnote.id }], footnote);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			footnoteContainerGroup.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: footnoteContainerGroup.offset().top - $('#navbar').height() }, 500);
		});
		footnotePanelContainer.find('.validate-add-footnote').on('click', function() {
			if (! Simulators.checkFootNote(footnotePanelContainer)) {
				return false;
			}
			var stepId = footnotePanelContainer.attr('data-step');
			var id = footnotePanelContainer.attr('data-id');
			var footnote = { id: id };
			footnote['stepId'] = stepId;
			footnote.text = {
				content: footnotePanelContainer.find('.footnote-text').val(),
				edition: 'wysihtml'
			};
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var newFootNotePanel = Simulators.drawFootNoteForDisplay(footnote);
			footnotePanelContainer.replaceWith(newFootNotePanel);
			Simulators.bindFootNoteButtons(newFootNotePanel);
			Simulators.addFootNoteInActions(footnote);
			delete footnote['stepId'];
			Simulators.addInArray(step['footNotes']['footNotes'], [], footnote);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newFootNotePanel.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = false;
		});
	}

	Simulators.checkFootNote = function(footnoteContainer) {
		var note = footnoteContainer.find('textarea');
		var text = $.trim(note.val());
		if (text === '') {
			footnoteContainer.find('.error-message').text(Translator.trans('Please enter a note'));
			footnoteContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addFootNote = function(footnotesContainerGroup) {
		try {
			var stepContainer = footnotesContainerGroup.parent().find('.step-container');
			var stepId = stepContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var id = 0;
			if (step.footNotes && step.footNotes.footNotes) {
				$.each(step.footNotes.footNotes, function (f, footnote) {
					if (footnote.id > id) {
						id = footnote.id;
					}
				});
			}
			var footnote = {
				stepId: stepId,
				id: parseInt(id) + 1, 
				text: {
					content: '',
					edition: ''
				}
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var footnotePanelContainer = Simulators.drawFootNoteForInput(footnote);
			footnotePanelContainer.find('button.cancel-edit-footnote').addClass('cancel-add-footnote').removeClass('cancel-edit-footnote');
			footnotePanelContainer.find('button.validate-edit-footnote').addClass('validate-add-footnote').removeClass('validate-edit-footnote');
			var footnotesPanel = $("#collapsestep-" + stepId + '-footnotes').find('> .card-body');
			footnotesPanel.append(footnotePanelContainer);
			Simulators.bindFootNote(footnotePanelContainer);
			$("#collapsestep-" + stepId + '-footnotes').collapse('show');
			$("html, body").animate({ scrollTop: footnotePanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editFootNote = function(footnoteContainer) {
		try {
			var stepId = footnoteContainer.attr('data-step');
			var id = footnoteContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var footnote = Simulators.findInArray(step['footNotes']['footNotes'], [{ key: 'id', val: id } ]);
			footnote['stepId'] = stepId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var footnotePanelContainer = Simulators.drawFootNoteForInput(footnote);
			var footnoteContainerBody = footnotePanelContainer.find('.step-footnote');
			Simulators.footnoteBackup = footnoteContainer.find('.step-footnote').replaceWith(footnoteContainerBody);
			Simulators.bindFootNote(footnoteContainerBody);
			$("html, body").animate({ scrollTop: footnoteContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteFootNote = function(footnoteContainer) {
		try {
			var stepId = footnoteContainer.attr('data-step');
			var id = footnoteContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var rule;
			if ((rule = Simulators.isFootNoteInRules(stepId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting footnote'),
					message: Translator.trans("This footnote is used in rule #%id%. You must modify this rule before you can delete this footnote", { 'id': rule } ) 
				});
				return;
			}
			var referenced;
			if ((referenced = Simulators.isFootnoteIdReferenced(stepId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting footnote'),
					message: referenced + ". " + Translator.trans("You must remove this reference before you can remove this footnote.")
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting footnote'),
				message: Translator.trans("Are you sure you want to delete the footnote : %id%", { 'id': id }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(step['footNotes']['footNotes'], [{ key: 'id', val: id }]);
						var fparent = footnoteContainer.parent();
						footnoteContainer.remove();
						Simulators.deleteFootNoteInActions(stepId, id);
						Simulators.renumberFootNotes(step.footNotes.footNotes, stepId, fparent.find('> div'));
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
