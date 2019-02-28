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

	Simulators.renumberFields = function(fields, stepId, panelId, fieldsetId, fieldrowId, panelGroups) {
		$.each(fields, function(index, field) {
			var oldPosition = field.position;
			var position = index + 1;
			if (oldPosition != 0 && position != oldPosition) {
				field.position = position;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("-field-" + oldPosition, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "-field-" + position);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
				a.text(' ' + Translator.trans('Field') + ' #' + position + ' : ' + field.label + ' ');
				var container =  panelGroup.find('.field-container');
				container.attr('data-id', position);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "-field-" + position);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "-field-" + position);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "-field-" + position);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "-field-" + position);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "-field-" + position);
						$(this).attr('aria-labelledby', attr);
					}
				});
				if (!fieldrowId || fieldrowId == '') {
					Simulators.changeFieldPositionInActionButtons(stepId, panelId, fieldsetId, oldPosition, 'X' + position)
				} else {
					Simulators.changeFieldrowFieldPositionInActionButtons(stepId, panelId, fieldsetId, fieldrowId, oldPosition, 'X' + position)
				}
				Simulators.changeFieldIdInRules(stepId, panelId, fieldsetId, fieldrowId, oldPosition, 'X' + position)
			}
		});
		$.each(fields, function(index, field) {
				if (!fieldrowId || fieldrowId == '') {
					Simulators.changeFieldPositionInActionButtons(stepId, panelId, fieldsetId, 'X' + field.position, field.position);
				} else {
					Simulators.changeFieldrowFieldPositionInActionButtons(stepId, panelId, fieldsetId, fieldrowId, 'X' + field.position, field.position);
				}
			Simulators.changeFieldIdInRules(stepId, panelId, fieldsetId, fieldrowId, 'X' + field.position, field.position);
		});
	}

	Simulators.bindSortableFields = function(container) {
		if (! container ) {
			container = $("#steps .fields-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.field-container');
				var stepId = container.attr('data-step');
				var panelId = container.attr('data-panel');
				var fieldsetId = container.attr('data-fieldset');
				var fieldrowId = container.attr('data-fieldrow');
				var fields;
				if (fieldrowId == '') {
					var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId } ]);
					fields = fieldset.fields;
				} else {
					var fieldrow = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId } ]);
					fields = fieldrow.fields;
				}
				var position = container.attr('data-id');
				if (Simulators.moveInArray(fields, [{key: 'position', val: position}], ui.item.index())) {
					Simulators.renumberFields(fields, stepId, panelId, fieldsetId, fieldrowId, $(ui.item).parent().find('> div'));
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawFieldForDisplay = function(field, inClass) {
		var fieldElementId = field.fieldrowId == '' ? 
			'step-' + field.stepId + '-panel-' + field.panelId + '-fieldset-' + field.fieldsetId + '-field-' + field.position :
			'step-' + field.stepId + '-panel-' + field.panelId + '-fieldset-' + field.fieldsetId + '-fieldrow-' + field.fieldrowId + '-field-' + field.position;
		var fieldPanelContainer = Simulators.openCollapsiblePanel(fieldElementId, Translator.trans('Field') + ' #' + field.position + ' : ' + field.label, 'warning', inClass, '', [{ 'class': 'delete-field', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-field', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' } ] );
		var fieldPanelBody = fieldPanelContainer.find('.card-body');
		var fieldContainer = $('<div class="card bg-light field-container" id="' + fieldElementId + '-attributes-panel" data-step="' + field.stepId + '" data-panel="' + field.panelId + '" data-fieldset="' + field.fieldsetId + '" data-fieldrow="' + field.fieldrowId + '" data-id="' + field.position + '"></div>');
		var fieldContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'text', 'data', Translator.trans('Data'), Simulators.findDataById(field.data).label, Simulators.findDataById(field.data).label, true, Translator.trans('Field data')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'text', 'label', Translator.trans('Label'), field.label, field.label, false, Translator.trans('Field label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'select', 'usage', Translator.trans('Usage'), field.usage, field.usage, true, Translator.trans('Select an usage'), JSON.stringify( {'input': Translator.trans('input'), 'output': Translator.trans('output') } )));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'text', 'prompt', Translator.trans('Prompt'), field.prompt, field.prompt, false, Translator.trans('Field prompt')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'required', Translator.trans('Required'), field.required, field.required, false, Translator.trans('Required')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'visibleRequired', Translator.trans('Required if visible'), field.visibleRequired, field.visibleRequired, false, Translator.trans('Required if visible')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'newline', Translator.trans('Newline before field ?'), field.newline, field.newline, false, Translator.trans('Newline before field ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'colon', Translator.trans('Show colon after field label ?'), field.colon, field.colon, false, Translator.trans('Show colon after field label ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'underlabel', Translator.trans('Place the field under the label ?'), field.underlabel, field.underlabel, false, Translator.trans('Place the field under the label ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'help', Translator.trans('Show data description as help ?'), field.help, field.help, false, Translator.trans('Show data description as help ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'emphasize', Translator.trans('Emphasize the text label ?'), field.emphasize, field.emphasize, false, Translator.trans('Emphasize the text label ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'checkbox', 'expanded', Translator.trans('Show choices as radio buttons ?'), field.expanded, field.expanded, false, Translator.trans('Show choices as radio buttons ?')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'text', 'explanation', Translator.trans('Explanation'), field.explanation, field.explanation, false, Translator.trans('Explanation')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'select', 'widget', Translator.trans('Widget'), field.widget, field.widget, false, Translator.trans('Select a widget'), JSON.stringify(Simulators.makeWidgetsList(field))));
		attributesContainer.append(requiredAttributes);
		fieldContainerBody.append(attributesContainer);
		fieldContainer.append(fieldContainerBody);
		fieldPanelBody.append(fieldContainer);
		if (field.fieldrowId === '' && field.Note) {
			var position = field.Note == 'beforeField' ? Translator.trans('placed before the field') : Translator.trans('placed after the field');
			fieldContainerBody.append('<div class="card bg-light note-panel elements-container" id="' + fieldElementId + '-note-panel"><div class="card-header"><span class="note-position float-right">' + Translator.trans('Note position') + ' : ' + position + '</span>' + Translator.trans('Note') + '</div><div class="card-body field-note rich-text">' + field.Note.text.content + '</div></div>');
		}
		return fieldPanelContainer;
	}

	Simulators.getFieldInputType = function(field, data) {
		var input = 'text';
		switch (data.type) {
			case 'boolean':
			case 'multichoice':
				input = 'checkbox';
				break;
			case 'number':
			case 'integer':
				input = 'number';
				break;
			case 'textarea':
				input = 'textarea';
				break;
			case 'choice':
			case 'department':
			case 'region':
			case 'country':
			case 'year':
			case 'month':
			case 'day':
				input = (field.expanded == '1') ? 'radio' : 'select';
				break;
		}
		return input;
	}

	Simulators.makeWidgetsList = function(field) {
		var list = {};
		var data = Simulators.findDataById(field.data);
		if (data) {
			var input = Simulators.getFieldInputType(field, data);
			var widgs = typewidgets[data.type].filter(function(w) {
				return inputwidgets[input] && inputwidgets[input].indexOf(w) > -1;
			});
			for (var i = 0; i < widgs.length; i++) {
				list[widgs[i]] = widgets[widgs[i]];
			}
		}
		return list;
	}

	Simulators.checkFieldWidget = function(field) {
		var data = Simulators.findDataById(field.data);
		if (! typewidgets[data.type]) {
			return false;
		}
		if (typewidgets[data.type].indexOf(field.widget) <= -1) {
			return false;
		}
		var input = Simulators.getFieldInputType(field, data);
		return inputwidgets[input] && inputwidgets[input].indexOf(field.widget) > -1;
	}

	Simulators.drawFieldForInput = function(field) {
		var fieldElementId = field.fieldrowId == '' ? 
			'step-' + field.stepId + '-panel-' + field.panelId + '-fieldset-' + field.fieldsetId + '-field-' + field.position :
			'step-' + field.stepId + '-panel-' + field.panelId + '-fieldset-' + field.fieldsetId + '-fieldrow-' + field.fieldrowId + '-field-' + field.position;
		var fieldPanelContainer = $('<div>', { 'class': 'panel-group', id: fieldElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var fieldPanel = $('<div>', { 'class': 'card bg-warning' });
		fieldPanel.append('<div class="card-header" role="tab" id="' + fieldElementId + '-panel"><h4 class="card-title"><a data-toggle="collapse" data-parent="#' + fieldElementId + '" href="#collapse' + fieldElementId + '" aria-expanded="true" aria-controls="collapse' + fieldElementId + '">#' + field.position + ' : ' + field.label + '</a></h4></div>');
		var fieldPanelCollapse = $('<div id="collapse' + fieldElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + fieldElementId + '-panel"></div>');
		var fieldPanelBody = $('<div class="card-body"></div>');
		var fieldContainer = $('<div class="card bg-light field-container" id="' + fieldElementId + '-attributes-panel" data-step="' + field.stepId + '" data-panel="' + field.panelId + '" data-fieldset="' + field.fieldsetId + '" data-fieldrow="' + field.fieldrowId + '" data-id="' + field.position + '"></div>');
		var fieldContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		var datasList = {
			0: Translator.trans('--- Select a data ---')
		};
		if (field.fieldrowId == '') {
			$.each(Simulators.dataset, function( name, data) {
				datasList[data.id] = data.label;
			});
		} else {
			var fieldrow = Simulators.findInArray(steps, [{ key: 'id', val: field.stepId, list: 'panels' }, { key: 'id', val: field.panelId, list: 'blocks' }, { key: 'id', val: field.fieldsetId, list: 'fieldrows' }, { key: 'id', val: field.fieldrowId }]);
			$.each(Simulators.dataset, function( name, data) {
				if (data.datagroup == fieldrow.datagroup) {
					datasList[data.id] = data.label;
				}
			});
		}
		requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-data', 'select', 'data', Translator.trans('Data'), field.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
		requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-type', 'select', 'usage', 'Usage', field.usage, true, Translator.trans('Select a data type'), JSON.stringify({'input': Translator.trans('input'), 'output': Translator.trans('output') })));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Field label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-label', 'text', 'label', Translator.trans('Label'), field.label, false, Translator.trans('Field label')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="text" data-name="prompt" data-placeholder="' + Translator.trans('Field prompt') + '">' + Translator.trans('Prompt') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.prompt) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-prompt', 'text', 'prompt', Translator.trans('Prompt'), field.prompt, false, Translator.trans('Field prompt')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="newline" data-placeholder="">' + Translator.trans('Newline before field ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.newline == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-newline', 'checkbox', 'newline', Translator.trans('Newline before field ?'), field.newline, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="required" data-placeholder="">' + Translator.trans('Required') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.required == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-required', 'checkbox', 'required', Translator.trans('Required'), field.required, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="visibleRequired" data-placeholder="">' + Translator.trans('Required if visible') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.visibleRequired == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-visibleRequired', 'checkbox', 'visibleRequired', Translator.trans('Required if visible'), field.visibleRequired, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="colon" data-placeholder="">' + Translator.trans('Show colon after field label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.colon == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-colon', 'checkbox', 'colon', Translator.trans('Show colon after field label ?'), field.colon, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="underlabel" data-placeholder="">' + Translator.trans('Place the field under the label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.underlabel == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-underlabel', 'checkbox', 'underlabel', Translator.trans('Place the field under the label ?'), field.underlabel, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="help" data-placeholder="">' + Translator.trans('Show data description as help ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.help == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-help', 'checkbox', 'help', Translator.trans('Show data description as help ?'), field.help, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="emphasize" data-placeholder="">' + Translator.trans('Emphasize the text label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.emphasize == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-emphasize', 'checkbox', 'emphasize', Translator.trans('Emphasize the text label ?'), field.emphasize, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="checkbox" data-name="expanded" data-placeholder="">' + Translator.trans('Show choices as radio buttons ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.expanded == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-expanded', 'checkbox', 'expanded', Translator.trans('Show choices as radio buttons ?'), field.expanded, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="text" data-name="explanation" data-placeholder="' + Translator.trans('Explanation') + '">' + Translator.trans('Explanation') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.explanation) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-explanation', 'text', 'explanation', Translator.trans('Explanation'), field.explanation, false, Translator.trans('Explanation')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + fieldElementId + '" data-type="select" data-name="widget" data-placeholder="' + Translator.trans('Select a widget') + '" data-options="' + encodeURI(JSON.stringify(Simulators.makeWidgetsList(field))) + '">' + Translator.trans('Widget') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.widget && field.widget != '') {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-widget', 'select', 'widget', Translator.trans('Widget'), field.widget, false, Translator.trans('Select a widget'), JSON.stringify(Simulators.makeWidgetsList(field))));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		fieldContainerBody.append(attributesContainer);
		fieldContainer.append(fieldContainerBody);
		fieldPanelBody.append(fieldContainer);
		if (field.fieldrowId === '') {
			var note = { content: '', edition: '' };
			var noteBefore = '';
			var noteAfter = '';
			if (field.Note) {
				note = field.Note.text;
				if (field.Note.position == 'beforeField') {
					noteBefore = ' selected="selected"';
				} else {
					noteAfter = ' selected="selected"';
				}
			}
			fieldContainerBody.append('<div class="card bg-light note-panel elements-container" id="' + fieldElementId + '-note-panel"><div class="card-header"><span class="note-position float-right"><label for="' + fieldElementId + '-note-position">' + Translator.trans('Note position') + '</label><select id="' + fieldElementId + '-note-position"><option value="beforeField"' + noteBefore + '>' + Translator.trans('placed before the field') + '</option><option value="afterField"' + noteAfter + '>' + Translator.trans('placed after the field') + '</option></select></span>' + Translator.trans('Note') + '</div><div class="card-body"><textarea rows="5" name="' + fieldElementId + '-note" id="' + fieldElementId + '-note" wrap="hard" class="form-control field-note">' + Simulators.paragraphs(note).content + '</textarea></div></div>');
		}
		var fieldButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + fieldElementId + '-buttons-panel"></div>');
		var fieldButtonsBody = $('<div class="card-body field-buttons"></div>');
		fieldButtonsBody.append('<button class="btn btn-success float-right validate-edit-field">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		fieldButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-field">' + Translator.trans('Cancel') + '</span></button>');
		fieldButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		fieldButtonsPanel.append(fieldButtonsBody);
		fieldPanelBody.append(fieldButtonsPanel);
		fieldPanelCollapse.append(fieldPanelBody);
		fieldPanel.append(fieldPanelCollapse);
		fieldPanelContainer.append(fieldPanel);
		return fieldPanelContainer;
	}

	Simulators.bindFieldButtons = function(container) {
		if (! container ) {
			container = $("#steps .fields-panel");
		}
		container.find('button.edit-field').on('click', function(e) {
			e.preventDefault();
			Simulators.editField($($(this).attr('data-parent')));
		});
		container.find('button.delete-field').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteField($($(this).attr('data-parent')));
		});
	}

	Simulators.bindField = function(fieldPanelContainer) {
		fieldPanelContainer.find('textarea').wysihtml(Admin.wysihtml5Options);
		fieldPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		fieldPanelContainer.find('select[data-attribute=data]').on('change', function() {
			Simulators.changeFieldWidgetList(fieldPanelContainer);
		});
		fieldPanelContainer.find('.cancel-edit-field').on('click', function() {
			fieldPanelContainer.replaceWith(Simulators.fieldBackup);
			Simulators.fieldBackup.find('button.edit-field').on('click', function(e) {
				e.preventDefault();
				Simulators.editField($($(this).attr('data-parent')));
			});
			Simulators.fieldBackup.find('button.delete-field').on('click', function(e) {
				e.preventDefault();
				Simulators.deleteField($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldPanelContainer.find('.cancel-add-field').on('click', function() {
			fieldPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldPanelContainer.find('.validate-edit-field, .validate-add-field').on('click', function() {
			var fieldContainerGroup = fieldPanelContainer.parent();
			var fieldContainer = fieldPanelContainer.find('.field-container');
			if (! Simulators.checkField(fieldPanelContainer)) {
				return false;
			}
			var stepId = fieldContainer.attr('data-step');
			var panelId = fieldContainer.attr('data-panel');
			var fieldsetId = fieldContainer.attr('data-fieldset');
			var fieldrowId = fieldContainer.attr('data-fieldrow');
			var position = fieldContainer.attr('data-id');
			var field = { 
				type: 'field',
				position: position, 
				newline: '0',
				prompt: '',
				required: '0',
				visibleRequired: '0',
				colon: '0',
				underlabel: '0',
				help: '0',
				emphasize: '0',
				explanation: '',
				expanded: '0',
				widget: ''
			};
			field['stepId'] = stepId;
			field['panelId'] = panelId;
			field['fieldsetId'] = fieldsetId;
			field['fieldrowId'] = fieldrowId;
			var attributes = fieldContainer.find('.attributes-container');
			attributes.find('input.simple-value, select.simple-value').each(function (index) {
				// field[$(this).attr('data-attribute')] = $(this).val();
				if ($(this).is(':checkbox')) {
					field[$(this).attr('data-attribute')] = $(this).is(':checked') ? '1' : '0';
				} else {
					field[$(this).attr('data-attribute')] = $(this).val();
				}
			});
			if (! field.label) {
				field.label = '';
			}
			var note = Admin.clearHTML(fieldPanelContainer.find('.field-note'));
			if (fieldrowId == '' && note != '') {
				var posNote = fieldPanelContainer.find('.note-position select').val();
				field['Note'] = {
					position: posNote,
					text: {
						content: note,
						edition: 'wysihtml'
					}
				};
			} else {
				delete field['Note'];
			}
			var newFieldPanel = Simulators.drawFieldForDisplay(field);
			fieldPanelContainer.replaceWith(newFieldPanel);
			Simulators.bindFieldButtons(newFieldPanel);
			if ($(this).hasClass('validate-edit-field')) {
				var oldField = fieldrowId == '' ? 
					Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fields' }, { key: 'position', val: position }]) :
					Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId, list: 'fields' }, { key: 'position', val: position }]);
				var oldLabel = oldField.label;
				if (field.label != oldLabel) {
					if (!fieldrowId || fieldrowId == '') {
						Simulators.changeFieldLabelInActionButtons(stepId, panelId, fieldsetId, field.position, field.label);
					} else {
						Simulators.changeFieldrowFieldLabelInActionButtons(stepId, panelId, fieldsetId, fieldrowId, field.position, field.label);
					}
					Simulators.changeFieldLabelInRules(stepId, panelId, fieldsetId, fieldrowId, field.position, field.label);
				}
				delete field['stepId'];
				delete field['panelId'];
				delete field['fieldsetId'];
				delete field['fieldrowId'];
				if (fieldrowId == '') {
					Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fields' }, { key: 'position', val: position }], field);
				} else {
					Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId, list: 'fields' }, { key: 'position', val: position }], field);
				}
			} else {
				Simulators.addFieldInActions(field);
				delete field['stepId'];
				delete field['panelId'];
				delete field['fieldsetId'];
				delete field['fieldrowId'];
				if (fieldrowId == '') {
					Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fields' }], field);
				} else {
					Simulators.checkAddFieldButton(newFieldPanel);
					Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId, list: 'fields' }], field);
				}
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newFieldPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newFieldPanel.offset().top - $('#navbar').height() }, 500);
		});
		Simulators.bindOptionalAttributes(fieldPanelContainer, function(optionalAttr) {
			if (optionalAttr.attr('data-name') == 'expanded') {
				fieldPanelContainer.find('.attributes-container input[data-attribute=expanded]').on('change', function() {
					Simulators.changeFieldWidgetList(fieldPanelContainer);
				});
			}
		},
		function(optionalAttr) {
			if (optionalAttr == 'expanded') {
				Simulators.changeFieldWidgetList(fieldPanelContainer);
			}
		});
	}

	Simulators.changeFieldWidgetList = function(fieldPanelContainer) {
		var widgetsOptAttr = fieldPanelContainer.find('.optional-attributes li[data-name=widget]');
		var expandedAttr = fieldPanelContainer.find('.attributes-container input[data-attribute=expanded]:checked');
		var dataAttr = fieldPanelContainer.find('.attributes-container select[data-attribute=data] option:selected');
		var field = {
			data: dataAttr.val(),
			expanded: expandedAttr.length == 0 ? '0' : '1'
		}
		var widgetAttr = fieldPanelContainer.find('.attributes-container select[data-attribute=widget] option:selected');
		var widget = widgetAttr.length == 0 ? '' : widgetAttr.val();
		var widgetsList =  Simulators.makeWidgetsList(field);
		widgetsOptAttr.attr('data-options', JSON.stringify(widgetsList));
		var widgetsAttr = fieldPanelContainer.find('.attributes-container select[data-attribute=widget]');
		if (widgetsAttr.length) {
			widgetsAttr.empty();
			$.each(widgetsList, function(v, t) {
				var option = $('<option>', { value: v, text: t});
				if (v == widget) {
					option.attr('selected', true);
				}
				widgetsAttr.append(option);
			});
		}
	}

	Simulators.checkField = function(fieldContainer) {
		var fieldElementId = fieldContainer.attr('id');
		var data = $('#' + fieldElementId + '-data').val();
		if (data == 0) {
			fieldContainer.find('.error-message').text(Translator.trans('Please, select a data'));
			fieldContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addField = function(fieldsetContainerGroup) {
		try {
			var stepId, panelId, fieldsetId, fieldrowId;
			var fieldsetContainer = fieldsetContainerGroup.find('.block-container.fieldset');
			if (fieldsetContainer.length > 0) {
				stepId = fieldsetContainer.attr('data-step');
				panelId = fieldsetContainer.attr('data-panel');
				fieldsetId = fieldsetContainer.attr('data-id');
				fieldrowId = '';
			} else {
				var fieldrowContainer = fieldsetContainerGroup.find('.fieldrow-container');
				stepId = fieldrowContainer.attr('data-step');
				panelId = fieldrowContainer.attr('data-panel');
				fieldsetId = fieldrowContainer.attr('data-fieldset');
				fieldrowId = fieldrowContainer.attr('data-id');
			}
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var fields;
			if (fieldset.disposition === 'grid') {
				var fieldrow = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId }]);
				fields = fieldrow.fields;
			} else {
				fields = fieldset.fields;
			}
			var position = 0;
			if (fields) {
				$.each(fields, function (f, field) {
					if (field.position > position) {
						position = field.position;
					}
				});
			}
			var field = {
				stepId: stepId,
				panelId: panelId,
				fieldsetId: fieldsetId,
				fieldrowId: fieldrowId,
				position: parseInt(position) + 1, 
				data: 0,
				label: '',
				usage: 'input'
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var fieldPanelContainer = Simulators.drawFieldForInput(field);
			fieldPanelContainer.find('button.cancel-edit-field').addClass('cancel-add-field').removeClass('cancel-edit-field');
			fieldPanelContainer.find('button.validate-edit-field').addClass('validate-add-field').removeClass('validate-edit-field');
			var parentId = fieldsetContainerGroup.attr('id');
			var fieldsPanel = $("#collapse" + parentId).find("> div > div.fields-panel > div.sortable");
			fieldsPanel.append(fieldPanelContainer);
			Simulators.bindField(fieldPanelContainer);
			$("#collapse" + parentId).collapse('show');
			fieldPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: fieldPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editField = function(fieldContainerGroup) {
		try {
			var fieldContainer = fieldContainerGroup.find('.field-container');
			var stepId = fieldContainer.attr('data-step');
			var panelId = fieldContainer.attr('data-panel');
			var fieldsetId = fieldContainer.attr('data-fieldset');
			var fieldrowId = fieldContainer.attr('data-fieldrow');
			var position = fieldContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var field = fieldset.disposition === 'grid' ?
				Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId, list: 'fields' }, { key: 'position', val: position }]) :
				Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fields' }, { key: 'position', val: position }]);
			field['stepId'] = stepId;
			field['panelId'] = panelId;
			field['fieldsetId'] = fieldsetId;
			field['fieldrowId'] = fieldrowId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var fieldPanelContainer = Simulators.drawFieldForInput(field);
			Simulators.fieldBackup = fieldContainerGroup.replaceWith(fieldPanelContainer);
			Simulators.bindField(fieldPanelContainer);
			$("#collapse" + fieldPanelContainer.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: fieldPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteField = function(fieldContainerGroup, confirm) {
		if (typeof confirm === 'undefined') {
			confirm = true; 
		}
		try {
			var fieldContainer = fieldContainerGroup.find('.field-container');
			var stepId = fieldContainer.attr('data-step');
			var panelId = fieldContainer.attr('data-panel');
			var fieldsetId = fieldContainer.attr('data-fieldset');
			var fieldrowId = fieldContainer.attr('data-fieldrow');
			var position = fieldContainer.attr('data-id');
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			var field = fieldset.disposition === 'grid' ?
				Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId, list: 'fields' }, { key: 'position', val: position }]) :
				Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fields' }, { key: 'position', val: position }]);
			var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { 'id': '#' + field.position }); 
			var rule;
			if ((rule = Simulators.isFieldInRules(stepId, panelId, fieldsetId, fieldrowId, position)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting field'),
					message: Translator.trans("This field is used in rule #%id%. You must modify this rule before you can delete this field", { 'id': rule }) 
				});
				return;
			}
			var actionButton;
			if (!fieldrowId || fieldrowId == '') {
				actionButton = Simulators.isFieldPositionInActionButtons(stepId, panelId, fieldsetId, position);
			} else {
				actionButton = Simulators.isFieldrowFieldPositionInActionButtons(stepId, panelId, fieldsetId, fieldrowId, position);
			}
			if (actionButton !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting field'),
					message: Translator.trans("This field is used in action button « %label% ». You must modify this action button before you can delete this field", { 'label': actionButton }) 
				});
				return;
			}
			if (confirm) {
				bootbox.confirm({
					title: Translator.trans('Deleting field'),
					message: Translator.trans("Are you sure you want to delete the field : %label%", { 'label': label }), 
					callback: function(confirmed) {
						if (confirmed) {
							Simulators.doDeleteField(fieldContainerGroup, fieldset.disposition, stepId, panelId, fieldsetId, fieldrowId, position);
						}
					}
				});
			} else {
				Simulators.doDeleteField(fieldContainerGroup, fieldset.disposition, stepId, panelId, fieldsetId, fieldrowId, position);
			}
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.doDeleteField = function(fieldContainerGroup, disposition, stepId, panelId, fieldsetId, fieldrowId, position) {
		if (disposition === 'grid') {
			Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId, list: 'fields' }, { key: 'position', val: position }]);
		} else {
			Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fields' }, { key: 'position', val: position }]);
		}
		var fparent = fieldContainerGroup.parent();
		fieldContainerGroup.remove();
		Simulators.deleteFieldInActions(stepId, panelId, fieldsetId, fieldrowId, position);
		if (disposition === 'grid') {
			var fieldrow = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId, list: 'fieldrows' }, { key: 'id', val: fieldrowId }]);
			Simulators.renumberFields(fieldrow.fields, stepId, panelId, fieldsetId, fieldrowId, fparent.find('> div'));
			Simulators.addFieldButtonToFieldRows(fparent.parents('.fieldset-grid-panel').eq(0));
			Simulators.checkAddFieldButton(fparent);
		} else {
			var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'panels' }, { key: 'id', val: panelId, list: 'blocks' }, { key: 'id', val: fieldsetId }]);
			Simulators.renumberFields(fieldset.fields, stepId, panelId, fieldsetId, '', fparent.find('> div'));
		}
		$('.save-simulator').show();
		Admin.updated = true;
	}

}(this));
