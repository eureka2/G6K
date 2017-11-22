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

	Simulators.stepBackup = null;
	Simulators.footnotesBackup = null;
	Simulators.footnoteBackup = null;
	Simulators.actionButtonBackup = null;
	Simulators.panelBackup = null;
	Simulators.fieldsetBackup = null;
	Simulators.fieldrowBackup = null;
	Simulators.columnBackup = null;
	Simulators.fieldBackup = null;
	Simulators.blockinfoBackup = null;
	Simulators.chapterBackup = null;
	Simulators.sectionBackup = null;

	Simulators.findInArray = function(array, path) {
		if (array) {
			var obj = path.shift();
			for (var i = 0; i < array.length; i++) {
				if (array[i][obj.key] != undefined && array[i][obj.key] == obj.val) {
					return obj.list ? Simulators.findInArray(array[i][obj.list], path) : array[i];
				}
			}
		}
		return null;
	}

	Simulators.updateInArray = function(array, path, newObj) {
		if (array) {
			var obj = path.shift();
			for (var i = 0; i < array.length; i++) {
				if (array[i][obj.key] != undefined && array[i][obj.key] == obj.val) {
					if (obj.list) {
						return Simulators.updateInArray(array[i][obj.list], path, newObj);
					} else {
						array[i] = newObj;
						return true;
					}
				}
			}
		}
		return false;
	}

	Simulators.addInArray = function(array, path, newObj) {
		if (array) {
			if (path.length == 0) {
				array.push(newObj);
				return true;
			}
			var obj = path.shift();
			for (var i = 0; i < array.length; i++) {
				if (array[i][obj.key] != undefined && array[i][obj.key] == obj.val) {
					return Simulators.addInArray(array[i][obj.list], path, newObj);
				}
			}
		}
		return false;
	}

	Simulators.deleteInArray = function(array, path) {
		if (array) {
			var obj = path.shift();
			for (var i = 0; i < array.length; i++) {
				if (array[i][obj.key] != undefined && array[i][obj.key] == obj.val) {
					if (obj.list) {
						return Simulators.deleteInArray(array[i][obj.list], path);
					} else {
						array.splice(i, 1);
						return true;
					}
				}
			}
		}
		return false;
	}

	Simulators.moveInArray = function(array, path, toIndex) {
		if (array) {
			var obj = path.shift();
			for (var i = 0; i < array.length; i++) {
				if (array[i][obj.key] != undefined && array[i][obj.key] == obj.val) {
					if (obj.list) {
						return Simulators.moveInArray(array[i][obj.list], path, toIndex);
					} else {
						if (i == toIndex) {
							return false;
						}
						var removed = array.splice(i, 1);
						array.splice(toIndex, 0, removed[0]);
						return true;
					}
				}
			}
		}
		return false;
	}

	Simulators.collectSteps = function() {
		return steps;
	}

	Simulators.isDataIdInSteps = function(id) {
		var re1 = new RegExp("#" + id + '\\b', 'g');
		var re2 = new RegExp('\\<var\\s+([^\\s]*\\s*)data\\-id=\\"' + id + '\\"', 'g');
		var found = false;
		$.each(steps, function(s, step) {
			if (re1.test(step.description)) {
				found = step.id;
				return false;
			}
			if (re2.test(step.description)) {
				found = step.id;
				return false;
			}
			if (step.footNotes && step.footNotes.footNotes) {
				$.each(step.footNotes.footNotes, function(fn, footnote) {
					if (re1.test(footnote.text)) {
						found = step.id;
						return false;
					}
					if (re2.test(footnote.text)) {
						found = step.id;
						return false;
					}
				});
			}
			if (found !== false) {
				return false;
			}
			$.each(step.panels || [], function(p, panel) {
				$.each(panel.blocks || [], function(b, block) {
					if (block.type == 'fieldset') {
						if (re1.test(block.legend)) {
							found = step.id;
							return false;
						}
						if (re2.test(block.legend)) {
							found = step.id;
							return false;
						}
						if (block.fieldrows) {
							$.each(block.fieldrows || [], function(fr, fieldrow) {
								$.each(fieldrow.fields, function(f, field) {
									if (field.data == id) {
										found = step.id;
										return false;
									}
									if (field.Note && field.Note.text) {
										if (re1.test(field.Note.text)) {
											found = step.id;
											return false;
										}
										if (re2.test(field.Note.text)) {
											found = step.id;
											return false;
										}
									}
								});
								if (found !== false) {
									return false;
								}
							});
						} else if (block.fields) {
							$.each(block.fields, function(f, field) {
								if (field.data == id) {
									found = step.id;
									return false;
								}
								if (field.Note && field.Note.text) {
									if (re1.test(field.Note.text)) {
										found = step.id;
										return false;
									}
									if (re2.test(field.Note.text)) {
										found = step.id;
										return false;
									}
								}
							});
						}
					} else { // blockinfo
						$.each(block.chapters || [], function(c, chapter) {
							$.each(chapter.sections || [], function(sn, section) {
								if (re1.test(section.content)) {
									found = step.id;
									return false;
								}
								if (re2.test(section.content)) {
									found = step.id;
									return false;
								}
								if (re1.test(section.annotations)) {
									found = step.id;
									return false;
								}
								if (re2.test(section.content)) {
									found = step.id;
									return false;
								}
							});
							if (found !== false) {
								return false;
							}
						});
					}
					if (found !== false) {
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeDataIdInSteps = function(oldId, id) {
		var re1 = new RegExp("#" + oldId + '\\b', 'g');
		var re2 = new RegExp('\\<var\\s+([^\\s]*\\s*)data\\-id=\\"' + oldId + '\\"', 'g');
		$.each(steps, function(s, step) {
			if (re1.test(step.description)) {
				step.description = step.description.replace(re1, "#" + id);
			}
			if (re2.test(step.description)) {
				step.description = step.description.replace(re2, '<var $1data-id="' + id + '"');
			}
			if (step.footNotes && step.footNotes.footNotes) {
				$.each(step.footNotes.footNotes, function(fn, footnote) {
					if (re1.test(footnote.text)) {
						footnote.text = footnote.text.replace(re1, "#" + id);
					}
					if (re2.test(footnote.text)) {
						footnote.text = footnote.text.replace(re2, '<var $1data-id="' + id + '"');
					}
				});
			}
			$.each(step.panels || [], function(p, panel) {
				$.each(panel.blocks || [], function(b, block) {
					if (block.type == 'fieldset') {
						if (re1.test(block.legend)) {
							block.legend = block.legend.replace(re1, "#" + id);
						}
						if (re2.test(block.legend)) {
							block.legend = block.legend.replace(re2, '<var $1data-id="' + id + '"');
						}
						if (block.fieldrows) {
							$.each(block.fieldrows || [], function(fr, fieldrow) {
								$.each(fieldrow.fields, function(f, field) {
									if (field.data == oldId) {
										field.data = id;
									}
									if (field.Note && field.Note.text) {
										if (re1.test(field.Note.text)) {
											field.Note.text = field.Note.text.replace(re1, "#" + id);
										}
										if (re2.test(field.Note.text)) {
											field.Note.text = field.Note.text.replace(re2, '<var $1data-id="' + id + '"');
										}
									}
								});
							});
						} else if (block.fields) {
							$.each(block.fields, function(f, field) {
								if (field.data == oldId) {
									field.data = id;
								}
								if (field.Note && field.Note.text) {
									if (re1.test(field.Note.text)) {
										field.Note.text = field.Note.text.replace(re1, "#" + id);
									}
									if (re2.test(field.Note.text)) {
										field.Note.text = field.Note.text.replace(re2, '<var $1data-id="' + id + '"');
									}
								}
							});
						}
					} else { // blockinfo
						$.each(block.chapters || [], function(c, chapter) {
							$.each(chapter.sections || [], function(sn, section) {
								if (re1.test(section.content)) {
									section.content = section.content.replace(re1, "#" + id);
								}
								if (re2.test(section.content)) {
									section.content = section.content.replace(re2, '<var $1data-id="' + id + '"');
								}
								if (re1.test(section.annotations)) {
									section.annotations = section.annotations.replace(re1, "#" + id);
								}
								if (re2.test(section.content)) {
									section.annotations = section.annotations.replace(re2, '<var $1data-id="' + id + '"');
								}
							});
						});
					}
				});
			});
		});
	}

	Simulators.isDatagroupIdInSteps = function(id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.panels || [], function(p, panel) {
				$.each(panel.blocks || [], function(b, block) {
					if (block.type == 'fieldset') {
						if (block.fieldrows) {
							$.each(block.fieldrows || [], function(fr, fieldrow) {
								if (fieldrow.datagroup == id) {
									found = step.id;
									return false;
								}
							});
						}
					}
					if (found !== false) {
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeDatagroupIdInSteps = function(oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.panels || [], function(p, panel) {
				$.each(panel.blocks || [], function(b, block) {
					if (block.type == 'fieldset') {
						if (block.fieldrows) {
							$.each(block.fieldrows || [], function(fr, fieldrow) {
								if (fieldrow.datagroup == oldId) {
									fieldrow.datagroup = id;
								}
							});
						}
					}
				});
			});
		});
	}

	Simulators.changeDataLabelInSteps = function(id, oldLabel, label) {
		var fields = $("#steps").find(".field-container p[data-attribute='data']");
		fields.each(function(f) {
			if ($(this).attr('data-value') == oldLabel) {
				$(this).attr('data-value', label);
				$(this).html(label);
			}
		});
	}

	Simulators.changeDatagroupLabelInSteps = function(id, oldLabel, label) {
		var fields = $("#steps").find(".fieldrow-container p[data-attribute='datagroup']");
		fields.each(function(f) {
			if ($(this).attr('data-value') == oldLabel) {
				$(this).attr('data-value', label);
				$(this).html(label);
			}
		});
	}

	Simulators.renumberSteps = function(panelGroups) {
		var step0 = 0;
		$.each(steps, function(index, step) {
			var oldId = step.id;
			if (oldId == 0) {
				step0 = 1;
			}
			var id = index + 1 - step0;
			if (oldId != 0 && id != oldId) {
				step.id = id;
				var panelGroup = panelGroups.eq(index);
				var re = new RegExp("step-" + oldId, 'g');
				var attr = panelGroup.attr('id');
				attr = attr.replace(re, "step-" + id);
				panelGroup.attr('id', attr);
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
				a.text(' ' + Translator.trans('Step') + ' #' + id + ' : ' + step.label + ' ');
				var container =  panelGroup.find('.step-container');
				container.attr('data-id', id);
				var descendants = panelGroup.find('*');
				descendants.each(function(d) {
					if (this.hasAttribute('data-step')) {
						$(this).attr('data-step', id);
					}
					if (this.hasAttribute('id')) {
						var attr = $(this).attr('id');
						attr = attr.replace(re, "step-" + id);
						$(this).attr('id', attr);
					}
					if (this.hasAttribute('data-parent')) {
						var attr = $(this).attr('data-parent');
						attr = attr.replace(re, "step-" + id);
						$(this).attr('data-parent', attr);
					}
					if (this.hasAttribute('href')) {
						var attr = $(this).attr('href');
						attr = attr.replace(re, "step-" + id);
						$(this).attr('href', attr);
					}
					if (this.hasAttribute('aria-controls')) {
						var attr = $(this).attr('aria-controls');
						attr = attr.replace(re, "step-" + id);
						$(this).attr('aria-controls', attr);
					}
					if (this.hasAttribute('aria-labelledby')) {
						var attr = $(this).attr('aria-labelledby');
						attr = attr.replace(re, "step-" + id);
						$(this).attr('aria-labelledby', attr);
					}
				});
				Simulators.changeStepIdInRules(oldId, 'X' + id)
			}
		});
		$.each(steps, function(index, step) {
			Simulators.changeStepIdInRules('X' + step.id, step.id);
		});
	}

	Simulators.bindSortableSteps = function(container) {
		if (! container ) {
			container = $("#collapsesteps");
		}
		container.find("> .sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			sort: function(event, ui) {
				if (Simulators.updating) {
					Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
					setTimeout(function() {
						container.find("> .sortable").sortable('cancel');
					}, 0);
				}
			},
			update: function( e, ui ) {
				if (!Simulators.updating) {
					var self = $(this);
					var container = $(ui.item).find('.step-container');
					var id = container.attr('data-id');
					if (id == 0 || steps[ui.item.index()].id == 0) { // step 0 cannot be moved
						self.sortable('cancel');
						Simulators.toast(Translator.trans('step 0 cannot be moved'));
					} else {
						if (Simulators.moveInArray(steps, [{key: 'id', val: id}], ui.item.index())) {
							Simulators.renumberSteps($(ui.item).parent().find('> div'));
							$('.update-button').show();
							$('.toggle-collapse-all').show();
							Admin.updated = true;
						}
					}
				}
			}
		});
	}

	Simulators.drawStepForDisplay = function(step, inClass) {
		var stepElementId = 'step-' + step.id;
		var buttons = [{ 'class': 'delete-step', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }];
		if (! step.footNotes || step.footNotes.length == 0) {
			buttons.push({ 'label': Translator.trans('Add'), 'icon': 'glyphicon-plus-sign', 'dropdown': [{ 'class': 'add-panel', 'label': Translator.trans('Add panel') }, { 'class': 'add-footnotes', 'label': Translator.trans('Add footnotes') }] });
		} else {
			buttons.push({ 'class': 'add-panel', 'label': Translator.trans('Add panel'), 'icon': 'glyphicon-plus-sign' });
		}
		buttons.push({ 'class': 'edit-step', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' });
		var stepPanelContainer = Simulators.openCollapsiblePanel(stepElementId, Translator.trans('Step') + ' #' + step.id + ' : ' + step.label, 'info', inClass, '', buttons );
		var stepPanelBody = stepPanelContainer.find('.panel-body');
		var stepContainer = $('<div class="panel panel-default step-container" id="' + stepElementId + '-attributes-panel" data-id="' + step.id + '"></div>');
		var stepContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'text', 'name', Translator.trans('Step Name'), step.name, step.name, true, Translator.trans('Step Name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'text', 'label', Translator.trans('Step Label'), step.label, step.label, true, Translator.trans('Step Label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'text', 'template', Translator.trans('Step Template'), step.template, step.template, true, Translator.trans('Step Template')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'select', 'output', Translator.trans('Output'), step.output, step.output, false, Translator.trans('Select an output'), JSON.stringify(Simulators.outputTypes)));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'checkbox', 'dynamic', Translator.trans('Interactive UI'), step.dynamic, step.dynamic, false, Translator.trans('Interactive UI')));
		attributesContainer.append(requiredAttributes);
		stepContainerBody.append(attributesContainer);
		stepContainerBody.append('<div class="panel panel-default description-panel" id="' + stepElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body step-description rich-text">' + step.description + '</div></div>');
		stepContainer.append(stepContainerBody);
		stepPanelBody.append(stepContainer);
		return stepPanelContainer;
	}

	Simulators.drawStepForInput = function(step) {
		var stepElementId = 'step-' + step.id;
		var buttons = [{ 'class': 'delete-step', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }];
		if (! step.footNotes) {
			buttons.push({ 'label': Translator.trans('Add'), 'icon': 'glyphicon-plus-sign', 'dropdown': [{ 'class': 'add-panel', 'label': Translator.trans('Add panel') }, { 'class': 'add-footnotes', 'label': Translator.trans('Add footnotes') }] });
		} else {
			buttons.push({ 'class': 'add-panel', 'label': Translator.trans('Add panel'), 'icon': 'glyphicon-plus-sign' });
		}
		buttons.push({ 'class': 'edit-step', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' });
		var stepPanelContainer = Simulators.openCollapsiblePanel(stepElementId, Translator.trans('Step') + ' #' + step.id + ' : ' + step.label, 'info', '', '', buttons );
		var stepPanelBody = stepPanelContainer.find('.panel-body');
		var stepContainer = $('<div class="panel panel-default step-container" id="' + stepElementId + '-attributes-panel" data-id="' + step.id + '" data-name="' + step.name + '"></div>');
		var stepContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-name', 'text', 'name', Translator.trans('Step Name'), step.name, true, Translator.trans('Step Name')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-label', 'text', 'label', Translator.trans('Step Label'), step.label, true, Translator.trans('Step Label')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-template', 'text', 'template', Translator.trans('Step Template'), step.template, true, Translator.trans('Step Template')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + stepElementId + '" data-type="select" data-name="output" data-placeholder="' + Translator.trans('Select an output') + '" data-options="' + encodeURI(JSON.stringify( Simulators.outputTypes )) + '">' + Translator.trans('Output') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (step.output) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-output', 'select', 'output', Translator.trans('Output'), step.output, false, Translator.trans('Select an output'), JSON.stringify( Simulators.outputTypes )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + stepElementId + '" data-type="checkbox" data-name="dynamic" data-placeholder="' + Translator.trans('Interactive UI') + '">' + Translator.trans('Interactive UI') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (step.dynamic) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-dynamic', 'checkbox', 'dynamic', Translator.trans('Interactive UI'), step.dynamic, false, Translator.trans('Interactive UI')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		stepContainerBody.append(attributesContainer);
		stepContainer.append(stepContainerBody);
		stepPanelBody.append(stepContainer);
		stepContainerBody.append('<div class="panel panel-default description-panel elements-container" id="' + stepElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body"><textarea rows="5" name="' + stepElementId + '-description" id="' + stepElementId + '-description" wrap="hard" class="form-control step-description">' + step.description + '</textarea></div></div>');
		var stepButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + stepElementId + '-buttons-panel"></div>');
		var stepButtonsBody = $('<div class="panel-body step-buttons"></div>');
		stepButtonsBody.append('<button class="btn btn-success pull-right validate-edit-step">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		stepButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-step">' + Translator.trans('Cancel') + '</span></button>');
		stepButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		stepButtonsPanel.append(stepButtonsBody);
		stepContainerBody.append(stepButtonsPanel);
		return stepPanelContainer;
	}

	Simulators.bindStepButtons = function(container) {
		if (! container ) {
			container = $("#collapsesteps");
		}
		container.find('button.edit-step').click(function(e) {
			e.preventDefault();
			Simulators.editStep($($(this).attr('data-parent')));
		});
		container.find('button.delete-step').click(function(e) {
			e.preventDefault();
			Simulators.deleteStep($($(this).attr('data-parent')));
		});
		container.find('button.add-action-button').click(function(e) {
			e.preventDefault();
			Simulators.addActionButton($($(this).attr('data-parent')));
		});
		container.find('button.add-footnotes, a.add-footnotes').click(function(e) {
			e.preventDefault();
			Simulators.addFootNotes($($(this).attr('data-parent')));
		});
		container.find('button.add-panel, a.add-panel').click(function(e) {
			e.preventDefault();
			Simulators.addPanel($($(this).attr('data-parent')));
		});
	}

	Simulators.bindStep = function(stepPanelContainer) {
		stepPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		stepPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		stepPanelContainer.find('.cancel-edit-step').click(function() {
			stepPanelContainer.find('.step-container').replaceWith(Simulators.stepBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		stepPanelContainer.find('.cancel-add-step').click(function() {
			stepPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		stepPanelContainer.find('.validate-edit-step, .validate-add-step').click(function() {
			var stepContainerGroup = stepPanelContainer.parent();
			var stepContainer = stepPanelContainer.find('.step-container');
			if (! Simulators.checkStep(stepPanelContainer)) {
				return false;
			}
			var id = stepContainer.attr('data-id');
			var step = { 
				id: id,
				output: '',
				dynamic: '0'
			};
			var attributes = stepContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				if ($(this).is(':checkbox')) {
					step[$(this).attr('data-attribute')] = $(this).is(':checked') ? 1 : 0;
				} else {
					step[$(this).attr('data-attribute')] = $(this).val();
				}
			});
			step['description'] =  stepPanelContainer.find('.step-description').val();
			var oldLabel = '';
			if ($(this).hasClass('validate-edit-step')) {
				var oldStep = Simulators.findInArray(steps, [{ key: 'id', val: id }]);
				oldLabel = oldStep.label;
				step['panels'] = oldStep['panels'];
				step['actions'] = oldStep['actions'];
				step['footNotes'] = oldStep['footNotes'];
			} else {
				step['panels'] = [];
				step['actions'] = [];
				step['footNotes'] = [];
			}
			var newStepPanel = Simulators.drawStepForDisplay(step, 'in');
			if ($(this).hasClass('validate-edit-step')) {
				stepContainer.replaceWith(newStepPanel.find('.step-container'));
				if (step.label != oldLabel) {
					var title = stepPanelContainer.find('> .panel > .panel-heading').find('> h4 > a');
					title.text(' ' + Translator.trans('Step') + ' #' + step.id + ' : ' + step.label);
					Simulators.changeStepLabelInRules(id, step.label);
				}
				Simulators.updateInArray(steps, [{ key: 'id', val: id }], step);
				newStepPanel = stepPanelContainer;
			} else {
				var panelsPanel = $('<div class="panel panel-default panels-panel" id="step-' + step.id + '-panels-panel"><div class="panel-body sortable"></div></div>');
				newStepPanel.find('.step-container').after(panelsPanel);
				Simulators.bindSortablePanels(panelsPanel);
				var actionButtonsPanel = $('<div class="actions-buttons-panel"></div>');
				actionButtonsPanel.append(Simulators.drawActionButtonsForDisplay(step));
				panelsPanel.after(actionButtonsPanel);
				Simulators.bindSortableActionButtons(actionButtonsPanel);
				stepPanelContainer.replaceWith(newStepPanel);
				Simulators.bindStepButtons(newStepPanel);
				Simulators.addInArray(steps, [], step);
				Simulators.addStepToDataset(step.id);
				Simulators.addStepInActions(step);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newStepPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newStepPanel.offset().top - $('#navbar').height() }, 500);
		});
		stepPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		stepPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		stepPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}

	Simulators.checkStep = function(stepContainer) {
		var stepElementId = stepContainer.attr('id');
		var stepName = $.trim($('#' + stepElementId + '-name').val());
		if (stepName === '') {
			stepContainer.find('.error-message').text(Translator.trans('The step name is required'));
			stepContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(stepName)) {
			stepContainer.find('.error-message').text(Translator.trans('Incorrect step name'));
			stepContainer.find('.alert').show();
			return false;
		}
		var stepLabel = $.trim($('#' + stepElementId + '-label').val());
		if (stepLabel === '') {
			stepContainer.find('.error-message').text(Translator.trans('The step label is required'));
			stepContainer.find('.alert').show();
			return false;
		}
		var stepTemplate = $.trim($('#' + stepElementId + '-template').val());
		if (stepTemplate === '') {
			stepContainer.find('.error-message').text(Translator.trans('The step template is required'));
			stepContainer.find('.alert').show();
			return false;
		}
		var stepId = stepContainer.find('.step-container').attr('data-id');
		var exists = false;
		$.each(steps, function(s, step) {
			if (step.id != stepId && step.name == stepName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			stepContainer.find('.error-message').text(Translator.trans('This step name already exists'));
			stepContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addStep = function() {
		try {
			var id = 0;
			$.each(steps, function (s, step) {
				if (step.id > id) {
					id = step.id;
				}
			});
			var step = {
				id: parseInt(id) + 1, 
				name: '',
				label: '',
				template: 'pages:article.html.twig',
				output: 'normal',
				dynamic: '1',
				description: '',
				panels: [],
				actions: [],
				footNotes: [],
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var stepPanelContainer = Simulators.drawStepForInput(step);
			stepPanelContainer.find('button.cancel-edit-step').addClass('cancel-add-step').removeClass('cancel-edit-step');
			stepPanelContainer.find('button.validate-edit-step').addClass('validate-add-step').removeClass('validate-edit-step');
			$("#collapsesteps").find("> div.sortable").append(stepPanelContainer);
			Simulators.bindStep(stepPanelContainer);
			$("#collapsesteps").collapse('show');
			stepPanelContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: stepPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.editStep = function(stepContainerGroup) {
		try {
			var stepContainer = stepContainerGroup.find('.step-container');
			var id = stepContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [ { key: 'id', val: id } ]);
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var stepPanelContainer = Simulators.drawStepForInput(step);
			Simulators.stepBackup = stepContainer.replaceWith(stepPanelContainer.find('.step-container'));
			Simulators.bindStep(stepContainerGroup);
			$("#collapsestep-" + id).collapse('show');
			$("html, body").animate({ scrollTop: stepContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.deleteStep = function(stepContainerGroup) {
		try {
			var stepContainer = stepContainerGroup.find('.step-container');
			var id = stepContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: id }]);
			var label = step.label ? step.label : step.name;
			var rule;
			if ((rule = Simulators.isStepInRules(id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting step'),
					message: Translator.trans("This step is used in rule #%id%. You must modify this rule before you can delete this step", { 'id': rule }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting step'),
				message: Translator.trans("Are you sure you want to delete the step : %label%", { 'label': label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: id }]);
						var sparent = stepContainerGroup.parent();
						stepContainerGroup.remove();
						Simulators.deleteStepInActions(id);
						Simulators.renumberSteps(sparent.find('> div'));
						Simulators.deleteStepInDataset(steps.length + 1);
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console.log(e.message);
		}
	}

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
				var h4 = footnoteGroup.find('> .panel-heading').find('> h4');
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
		var footnotesPanelContainer = Simulators.openCollapsiblePanel(footnotesElementId, Translator.trans('FootNotes'), 'success', 'in', '', [{ 'class': 'delete-footnotes', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'add-footnote', 'label': Translator.trans('Add footnote'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'edit-footnotes', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' }] );
		var footnotesPanelBody = footnotesPanelContainer.find('.panel-body');
		var footnotesContainer = $('<div class="panel panel-default footnotes-container" id="' + footnotesElementId + '-attributes-panel" data-step="' + footnotes.stepId + '"></div>');
		var footnotesContainerBody = $('<div class="panel-body"></div>');
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
		var footnotesPanel = $('<div>', { 'class': 'panel panel-success' });
		footnotesPanel.append('<div class="panel-heading" role="tab" id="' + footnotesElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + footnotesElementId + '" href="#collapse' + footnotesElementId + '" aria-expanded="true" aria-controls="collapse' + footnotesElementId + '">' + Translator.trans('FootNotes') + '</a></h4></div>');
		var footnotesPanelCollapse = $('<div id="collapse' + footnotesElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + footnotesElementId + '-panel"></div>');
		var footnotesPanelBody = $('<div class="panel-body"></div>');
		var footnotesContainer = $('<div class="panel panel-default footnotes-container" id="' + footnotesElementId + '-attributes-panel" data-step="' + footnotes.stepId + '"></div>');
		var footnotesContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(footnotesElementId + '-position', 'select', 'position', Translator.trans('Position'), footnotes.position, true, Translator.trans('Select a position'), JSON.stringify( { 'beforeActions': Translator.trans('before action buttons'), 'afterActions': Translator.trans('after action buttons') } )));
		attributesContainer.append(requiredAttributes);
		footnotesContainerBody.append(attributesContainer);
		footnotesContainer.append(footnotesContainerBody);
		footnotesPanelBody.append(footnotesContainer);
		var footnotesButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + footnotesElementId + '-buttons-panel"></div>');
		var footnotesButtonsBody = $('<div class="panel-body footnotes-buttons"></div>');
		footnotesButtonsBody.append('<button class="btn btn-success pull-right validate-edit-footnotes">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		footnotesButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-footnotes">' + Translator.trans('Cancel') + '</span></button>');
		footnotesButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-footnotes').click(function(e) {
			e.preventDefault();
			Simulators.editFootNotes($($(this).attr('data-parent')));
		});
		container.find('button.delete-footnotes').click(function(e) {
			e.preventDefault();
			Simulators.deleteFootNotes($($(this).attr('data-parent')));
		});
		container.find('button.add-footnote').click(function(e) {
			e.preventDefault();
			Simulators.addFootNote($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFootNotes = function(footnotesPanelContainer) {
		footnotesPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		footnotesPanelContainer.find('.cancel-edit-footnotes').click(function() {
			footnotesPanelContainer.find('.footnotes-container').replaceWith(Simulators.footnotesBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotesPanelContainer.find('.cancel-add-footnotes').click(function() {
			footnotesPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotesPanelContainer.find('.validate-edit-footnotes, .validate-add-footnotes').click(function() {
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
		footnotesPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		footnotesPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		footnotesPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
		}
	}

	Simulators.drawFootNoteForDisplay = function(footnote) {
		var footnoteElementId = 'step-' + footnote.stepId + '-footnotes-footnote' + footnote.id;
		var footnoteContainer = $('<div class="panel panel-default footnote-container" id="' +  footnoteElementId + '-panel" data-step="' + footnote.stepId + '" data-id="' + footnote.id + '">');
		var footnoteContainerHeading = $('<div class="panel-heading">');
		footnoteContainerHeading.append('<button class="btn btn-default pull-right update-button delete-footnote" title="' + Translator.trans('Delete') + '" data-parent="#' +  footnoteElementId + '-panel"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="glyphicon glyphicon-minus-sign"></span></button>');
		footnoteContainerHeading.append('<button class="btn btn-default pull-right update-button edit-footnote" title="' + Translator.trans('Edit') + '" data-parent="#' +  footnoteElementId + '-panel"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="glyphicon glyphicon-pencil"></span></button>');
		footnoteContainerHeading.append('<h4 class="panel-title">' + Translator.trans('FootNote #%id%', { 'id': footnote.id }) + '</h4>');
		footnoteContainer.append(footnoteContainerHeading);
		var footnoteContainerBody = $('<div class="panel-body step-footnote rich-text"></div>');
		footnoteContainerBody.append(footnote.text);
		footnoteContainer.append(footnoteContainerBody);
		return footnoteContainer;
	}

	Simulators.drawFootNoteForInput = function(footnote) {
		var footnoteElementId = 'step-' + footnote.stepId + '-footnotes-footnote' + footnote.id;
		var footnoteContainer = $('<div class="panel panel-default footnote-container" id="' + footnoteElementId + '-attributes-panel" data-step="' + footnote.stepId + '" data-id="' + footnote.id + '"></div>');
		var footnoteContainerHeading = $('<div class="panel-heading">');
		footnoteContainerHeading.append('<h4 class="panel-title">' + Translator.trans('FootNote #%id%', { 'id': footnote.id }) + '</h4>');
		footnoteContainer.append(footnoteContainerHeading);
		var footnoteContainerBody = $('<div class="panel-body step-footnote"></div>');
		footnoteContainerBody.append('<textarea rows="5" name="' + footnoteElementId + '-text" id="' + footnoteElementId + '-text" wrap="hard" class="form-control footnote-text">' + footnote.text + '</textarea>');
		var footnoteButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + footnoteElementId + '-buttons-panel"></div>');
		var footnoteButtonsBody = $('<div class="panel-body footnote-buttons"></div>');
		footnoteButtonsBody.append('<button class="btn btn-success pull-right validate-edit-footnote">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		footnoteButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-footnote">' + Translator.trans('Cancel') + '</span></button>');
		footnoteButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		footnoteButtonsPanel.append(footnoteButtonsBody);
		footnoteContainerBody.append(footnoteButtonsPanel);
		footnoteContainer.append(footnoteContainerBody);
		return footnoteContainer;
	}

	Simulators.bindFootNoteButtons = function(container) {
		if (! container ) {
			container = $("#steps");
		}
		container.find('button.edit-footnote').click(function(e) {
			e.preventDefault();
			Simulators.editFootNote($($(this).attr('data-parent')));
		});
		container.find('button.delete-footnote').click(function(e) {
			e.preventDefault();
			Simulators.deleteFootNote($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFootNote = function(footnotePanelContainer) {
		footnotePanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		footnotePanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		footnotePanelContainer.find('.cancel-edit-footnote').click(function() {
			footnotePanelContainer.replaceWith(Simulators.footnoteBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotePanelContainer.find('.cancel-add-footnote').click(function() {
			footnotePanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		footnotePanelContainer.find('.validate-edit-footnote').click(function() {
			var footnoteContainerGroup = footnotePanelContainer.parent();
			if (! Simulators.checkFootNote(footnotePanelContainer)) {
				return false;
			}
			var stepId = footnoteContainerGroup.attr('data-step');
			var id = footnoteContainerGroup.attr('data-id');
			var footnote = { id: id };
			footnote['stepId'] = stepId;
			footnote['text'] =  footnotePanelContainer.find('.footnote-text').val();
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
		footnotePanelContainer.find('.validate-add-footnote').click(function() {
			if (! Simulators.checkFootNote(footnotePanelContainer)) {
				return false;
			}
			var stepId = footnotePanelContainer.attr('data-step');
			var id = footnotePanelContainer.attr('data-id');
			var footnote = { id: id };
			footnote['stepId'] = stepId;
			footnote['text'] =  footnotePanelContainer.find('.footnote-text').val();
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
				text: ''
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var footnotePanelContainer = Simulators.drawFootNoteForInput(footnote);
			footnotePanelContainer.find('button.cancel-edit-footnote').addClass('cancel-add-footnote').removeClass('cancel-edit-footnote');
			footnotePanelContainer.find('button.validate-edit-footnote').addClass('validate-add-footnote').removeClass('validate-edit-footnote');
			var footnotesPanel = $("#collapsestep-" + stepId + '-footnotes').find('> .panel-body');
			footnotesPanel.append(footnotePanelContainer);
			Simulators.bindFootNote(footnotePanelContainer);
			$("#collapsestep-" + stepId + '-footnotes').collapse('show');
			$("html, body").animate({ scrollTop: footnotePanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
		}
	}

	Simulators.bindSortableActionButtons = function(container) {
		if (! container ) {
			container = $("#steps .actions-buttons-panel");
		}
		container.find(".sortable").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				var container = $(ui.item).find('.action-button-container');
				var stepId = container.attr('data-step');
				var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId } ]);
				var name = container.attr('data-id');
				if (Simulators.moveInArray(step.actions, [{key: 'name', val: name}], ui.item.index())) {
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.drawActionButtonsForDisplay = function(step) {
		var actionsElementId = 'step-' + step.id + '-action-buttons';
		var actionsPanelContainer = Simulators.openCollapsiblePanel(actionsElementId, Translator.trans('Actions Buttons'), 'success', 'in', 'sortable', [{ 'class': 'add-action-button', 'label': Translator.trans('Add action button'), 'icon': 'glyphicon-plus-sign' }] );
		var actionsPanelBody = actionsPanelContainer.find('.panel-body');
		$.each(step.actions, function(f, action) {
			action.stepId = step.id;
			actionsPanelBody.append(Simulators.drawActionButtonForDisplay(action));
		});
		return actionsPanelContainer;
	}

	Simulators.drawActionButtonForDisplay = function(action) {
		var actionElementId = 'step-' + action.stepId + '-action-button-' + action.name;
		var actionPanelContainer = Simulators.openCollapsiblePanel(actionElementId, Translator.trans('Action Button') + ' : ' + action.label, 'default', 'in', 'sortable', [{ 'class': 'delete-action-button', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-action-button', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-plus-sign' }] );
		var actionPanelBody = actionPanelContainer.find('.panel-body');
		var actionContainer = $('<div class="panel panel-default action-button-container" id="' + actionElementId + '-attributes-panel" data-step="' + action.stepId + '" data-id="' + action.name + '"></div>');
		var actionContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'text', 'name', Translator.trans('Name'), action.name, action.name, true, Translator.trans('Button name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'text', 'label', Translator.trans('Label'), action.label, action.label, true, Translator.trans('Button label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'what', Translator.trans('What'), action.what, action.what, true, Translator.trans('Select an action'), JSON.stringify( { 'submit': Translator.trans('Submit'), 'reset': Translator.trans('Reset') } )));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'for', Translator.trans('For'), action.for, action.for, true, Translator.trans('Select a target step'), JSON.stringify( { 'priorStep': Translator.trans('Prior step'), 'currentStep': Translator.trans('Current step'), 'nextStep': Translator.trans('Next step'), 'jumpToStep': Translator.trans('Jump to step'), 'newSimulation': Translator.trans('New simulation'), 'externalPage': Translator.trans('External page') } )));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'text', 'uri', Translator.trans('URI / Step'), action.uri, action.uri, false, Translator.trans('Button uri')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'class', Translator.trans('Class'), action.class, action.class, false, Translator.trans('Button class'), JSON.stringify({ 'btn-primary': Translator.trans('Primary'), 'btn-default': Translator.trans('Secondary') } )));
		attributesContainer.append(requiredAttributes);
		actionContainerBody.append(attributesContainer);
		actionContainer.append(actionContainerBody);
		actionPanelBody.append(actionContainer);
		return actionPanelContainer;
	}

	Simulators.drawActionButtonForInput = function(action) {
		var actionElementId = 'step-' + action.stepId + '-action-button-' + action.name;
		var actionPanelContainer = Simulators.openCollapsiblePanel(actionElementId, Translator.trans('Action Button') + ' : ' + action.label, 'default', 'in', 'sortable', [{ 'class': 'delete-action-button', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-action-button', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-plus-sign' }] );
		var actionPanelBody = actionPanelContainer.find('.panel-body');
		var actionContainer = $('<div class="panel panel-default action-button-container" id="' + actionElementId + '-attributes-panel" data-step="' + action.stepId + '" data-id="' + action.name + '"></div>');
		var actionContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-name', 'text', 'name', Translator.trans('Name'), action.name, true, Translator.trans('Action button name without spaces or special characters')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-label', 'text', 'label', Translator.trans('Label'), action.label, true, Translator.trans('Action button label')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-what', 'select', 'what', Translator.trans('What'), action.what, true, Translator.trans('Select an action'), JSON.stringify({ 'submit': Translator.trans('Submit'), 'reset': Translator.trans('Reset') })));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-for', 'select', 'for', Translator.trans('For'), action.for, true, Translator.trans('Select a target step'), JSON.stringify({ 'priorStep': Translator.trans('Prior step'), 'currentStep': Translator.trans('Current step'), 'nextStep': Translator.trans('Next step'), 'jumpToStep': Translator.trans('Jump to step'), 'newSimulation': Translator.trans('New simulation'), 'externalPage': Translator.trans('External page') } )));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + actionElementId + '" data-type="text" data-name="uri" data-placeholder="' + Translator.trans('Button uri') + '">' + Translator.trans('URI / Step') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (action.uri) {
			var attribute = Simulators.simpleAttributeForInput(actionElementId + '-uri', 'text', 'uri', Translator.trans('URI / Step'), action.uri, false, Translator.trans('Button uri'));
			requiredAttributes.append(attribute);
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + actionElementId + '" data-type="select" data-name="class" data-placeholder="' + Translator.trans('Button class') + '" data-options="' + encodeURI(JSON.stringify( { 'btn-primary': Translator.trans('Primary'), 'btn-default': Translator.trans('Secondary') } )) + '">' + Translator.trans('Class') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (action.class) {
			var attribute = Simulators.simpleAttributeForInput(actionElementId + '-class', 'select', 'class', Translator.trans('Class'), action.class, false, Translator.trans('Button class'), JSON.stringify({ 'btn-primary': Translator.trans('Primary'), 'btn-default': Translator.trans('Secondary') } ) );
			requiredAttributes.append(attribute);
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		actionContainerBody.append(attributesContainer);
		actionContainer.append(actionContainerBody);
		actionPanelBody.append(actionContainer);
		var actionButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + actionElementId + '-buttons-panel"></div>');
		var actionButtonsBody = $('<div class="panel-body action-buttons"></div>');
		actionButtonsBody.append('<button class="btn btn-success pull-right validate-edit-action">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		actionButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-action">' + Translator.trans('Cancel') + '</span></button>');
		actionButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		actionButtonsPanel.append(actionButtonsBody);
		actionContainer.append(actionButtonsPanel);
		return actionPanelContainer;
	}

	Simulators.bindActionButtonButtons = function(container) {
		if (! container ) {
			container = $("#steps");
		}
		container.find('button.edit-action-button').click(function(e) {
			e.preventDefault();
			Simulators.editActionButton($($(this).attr('data-parent')));
		});
		container.find('button.delete-action-button').click(function(e) {
			e.preventDefault();
			Simulators.deleteActionButton($($(this).attr('data-parent')));
		});
	}

	Simulators.bindActionButton = function(actionPanelContainer) {
		actionPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		actionPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		actionPanelContainer.find('.cancel-edit-action').click(function() {
			actionPanelContainer.find('.action-button-container').replaceWith(Simulators.actionButtonBackup);
			Simulators.actionButtonBackup.find('button.edit-action-button').click(function(e) {
				e.preventDefault();
				Simulators.editActionButton($($(this).attr('data-parent')));
			});
			Simulators.actionButtonBackup.find('button.delete-action-button').click(function(e) {
				e.preventDefault();
				Simulators.deleteActionButton($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		actionPanelContainer.find('.cancel-add-action').click(function() {
			actionPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		actionPanelContainer.find('.validate-edit-action, .validate-add-action').click(function() {
			var actionContainer = actionPanelContainer.find('.action-button-container');
			if (! Simulators.checkActionButton(actionPanelContainer)) {
				return false;
			}
			var stepId = actionContainer.attr('data-step');
			var oldName = actionContainer.attr('data-id');
			var attributes = actionContainer.find('.attributes-container');
			var action = { 
				stepId: stepId,
				uri: '',
				class: ''
			};
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				action[$(this).attr('data-attribute')] = $(this).val();
			});
			var newActionButtonPanel = Simulators.drawActionButtonForDisplay(action);
			if ($(this).hasClass('validate-edit-action')) {
				actionContainer.replaceWith(newActionButtonPanel.find('.action-button-container'));
				if (oldName != action.name) {
					Simulators.changeActionButtonNameInRules(stepId, oldName, action.name);
				}
				var oldLabel = Simulators.actionButtonBackup.find("p[data-attribute='label']").attr('data-value');
				if (action.label != oldLabel) {
					var title = actionPanelContainer.find('> .panel > .panel-heading').find('> h4 > a');
					title.text('' + Translator.trans('Action Button') + ' : ' + action.label);
				}
				Simulators.changeActionButtonLabelInRules(stepId, action.name, action.label)
				delete action['stepId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'actions' }, { key: 'name', val: oldName }], action);
				newActionButtonPanel = actionPanelContainer;
			} else {
				actionPanelContainer.replaceWith(newActionButtonPanel);
				Simulators.bindActionButtonButtons(newActionButtonPanel);
				Simulators.addActionButtonInActions(action);
				delete action['stepId'];
				Simulators.addInArray(steps, [{ key: 'id', val: stepId, list: 'actions' }], action);
			}
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newActionButtonPanel.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newActionButtonPanel.offset().top - $('#navbar').height() }, 500);
		});
		actionPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		actionPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		actionPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}

	Simulators.checkActionButton = function(actionContainer) {
		var actionElementId = actionContainer.attr('id');
		var actionName = $.trim($('#' + actionElementId + '-name').val());
		if (actionName === '') {
			actionContainer.find('.error-message').text(Translator.trans('The action button name is required'));
			actionContainer.find('.alert').show();
			return false;
		}
		if (! /^[\w\-]+$/.test(actionName)) {
			actionContainer.find('.error-message').text(Translator.trans('Incorrect action button name'));
			actionContainer.find('.alert').show();
			return false;
		}
		var step = actionContainer.find('.action-button-container').attr('data-step');
		var containerElementId =  actionContainer.find('.action-button-container').attr('id');
		var exists = false;
		$('#collapsestep-' + step + '-action-buttons').find('.action-button-container').each(function(i) {
			if ($(this).attr('id') != containerElementId && $(this).attr('data-id') == actionName) {
				exists = true;
				return false;
			}
		});
		if (exists) {
			actionContainer.find('.error-message').text(Translator.trans('The action button name already exists'));
			actionContainer.find('.alert').show();
			return false;
		}
		var actionLabel = $.trim($('#' + actionElementId + '-label').val());
		if (actionLabel === '') {
			actionContainer.find('.error-message').text(Translator.trans('The action button label is required'));
			actionContainer.find('.alert').show();
			return false;
		}
		var actionFor = $('#' + actionElementId + '-for').val();
		var actionUri = $.trim($('#' + actionElementId + '-uri').val());
		if (actionFor === 'jumpToStep' || actionFor === 'externalPage') {
			if (actionUri === '') {
				actionContainer.find('.error-message').text(Translator.trans('The action button uri is required in this context'));
				actionContainer.find('.alert').show();
				return false;
			}
		}
		return true;
	}

	Simulators.addActionButton = function(stepContainerGroup) {
		try {
			var stepContainer = stepContainerGroup.parent().parent().find('.step-container');
			var stepId = stepContainer.attr('data-id');
			var step = Simulators.findInArray(steps, [{ key: 'id', val: stepId }]);
			var action = {
				stepId: stepId,
				name: '',
				label: '',
				what: 'submit',
				for: 'nextStep',
				uri: '',
				class: '',
			};
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var panelActionButtonContainer = Simulators.drawActionButtonForInput(action);
			panelActionButtonContainer.find('button.cancel-edit-action').addClass('cancel-add-action').removeClass('cancel-edit-action');
			panelActionButtonContainer.find('button.validate-edit-action').addClass('validate-add-action').removeClass('validate-edit-action');
			var actionsPanel = $('#collapsestep-' + step.id + '-action-buttons').find("> div.sortable");
			actionsPanel.append(panelActionButtonContainer);
			Simulators.bindActionButton(panelActionButtonContainer);
			$("#collapse" + stepContainerGroup.attr('id')).collapse('show');
			panelActionButtonContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: panelActionButtonContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.editActionButton = function(actionContainerGroup) {
		try {
			var actionContainer = actionContainerGroup.find('.action-button-container');
			var stepId = actionContainer.attr('data-step');
			var name = actionContainer.attr('data-id');
			var action = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'actions' }, { key: 'name', val: name } ]);
			action['stepId'] = stepId;
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var panelActionButtonContainer = Simulators.drawActionButtonForInput(action);
			Simulators.actionButtonBackup = actionContainer.replaceWith(panelActionButtonContainer.find('.action-button-container'));
			Simulators.bindActionButton(actionContainerGroup);
			$("#collapse" + actionContainerGroup.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: actionContainerGroup.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
		}
	}

	Simulators.deleteActionButton = function(actionContainerGroup) {
		try {
			var actionContainer = actionContainerGroup.find('.action-button-container');
			var stepId = actionContainer.attr('data-step');
			var name = actionContainer.attr('data-id');
			var action = Simulators.findInArray(steps, [{ key: 'id', val: stepId, list: 'actions' }, { key: 'name', val: name }]);
			var rule;
			if ((rule = Simulators.isActionButtonInRules(stepId, name)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting action button'),
					message: Translator.trans("This action button is used in rule #%id%. You must modify this rule before you can delete this action button", { 'id': rule }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting action button'),
				message: Translator.trans("Are you sure you want to delete the action button : %label%", { 'label': action.label }), 
				callback: function(confirmed) {
					if (confirmed) {
						Simulators.deleteInArray(steps, [{ key: 'id', val: stepId, list: 'actions' }, { key: 'name', val: name }]);
						actionContainerGroup.remove();
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console.log(e.message);
		}
	}

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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
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
				Simulators.changePanelIdInRules(stepId, oldId, 'X' + id)
			}
		});
		$.each(panels, function(index, panel) {
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
		var panelPanelContainer = Simulators.openCollapsiblePanel(panelElementId, Translator.trans('Panel') + ' #' + panel.id + ' : ' + panel.label, 'success', inClass, 'sortable', [{ 'class': 'delete-panel', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'add-fieldset', 'label': Translator.trans('Add fieldset'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'add-blockinfo', 'label': Translator.trans('Add blockinfo'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'edit-panel', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var panelPanelBody = panelPanelContainer.find('.panel-body');
		var panelContainer = $('<div class="panel panel-default panel-container" id="' + panelElementId + '-attributes-panel" data-step="' + panel.stepId + '" data-id="' + panel.id + '"></div>');
		var panelContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(panelElementId, 'text', 'name', Translator.trans('Name'), panel.name, panel.name, true, Translator.trans('Panel name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(panelElementId, 'text', 'label', Translator.trans('Label'), panel.label, panel.label, true, Translator.trans('Panel label')));
		attributesContainer.append(requiredAttributes);
		panelContainerBody.append(attributesContainer);
		panelContainer.append(panelContainerBody);
		panelPanelBody.append(panelContainer);
		panelPanelBody.append('<div class="panel panel-default blocks-panel" id="' + panelElementId + '-blocks-panel"><div class="panel-body sortable"></div></div>');
		return panelPanelContainer;
	}

	Simulators.drawPanelForInput = function(panel) {
		var panelElementId = 'step-' + panel.stepId + '-panel-' + panel.id;
		var panelPanelContainer = $('<div>', { 'class': 'panel-group', id: panelElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var panelPanel = $('<div>', { 'class': 'panel panel-success' });
		panelPanel.append('<div class="panel-heading" role="tab" id="' + panelElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + panelElementId + '" href="#collapse' + panelElementId + '" aria-expanded="true" aria-controls="collapse' + panelElementId + '">' + Translator.trans('Panel') + ' #' + panel.id + ' : ' + panel.label + '</a></h4></div>');
		var panelPanelCollapse = $('<div id="collapse' + panelElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + panelElementId + '-panel"></div>');
		var panelPanelBody = $('<div class="panel-body"></div>');
		var panelContainer = $('<div class="panel panel-default panel-container" id="' + panelElementId + '-attributes-panel" data-step="' + panel.stepId + '" data-id="' + panel.id + '" data-name="' + panel.name + '"></div>');
		var panelContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(panelElementId + '-name', 'text', 'name', Translator.trans('Name'), panel.name, false, Translator.trans('Panel name without spaces or special characters')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + panelElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Panel label') + '">' + Translator.trans('Label') + '</li>');
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
		var panelButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + panelElementId + '-buttons-panel"></div>');
		var panelButtonsBody = $('<div class="panel-body panel-buttons"></div>');
		panelButtonsBody.append('<button class="btn btn-success pull-right validate-edit-panel">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		panelButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-panel">' + Translator.trans('Cancel') + '</span></button>');
		panelButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-panel').click(function(e) {
			e.preventDefault();
			Simulators.editPanel($($(this).attr('data-parent')));
		});
		container.find('button.delete-panel').click(function(e) {
			e.preventDefault();
			Simulators.deletePanel($($(this).attr('data-parent')));
		});
		container.find('button.add-fieldset, a.add-fieldset').click(function(e) {
			e.preventDefault();
			Simulators.addFieldSet($($(this).attr('data-parent')));
		});
		container.find('button.add-blockinfo, a.add-blockinfo').click(function(e) {
			e.preventDefault();
			Simulators.addBlockInfo($($(this).attr('data-parent')));
		});
	}

	Simulators.bindPanel = function(panelPanelContainer) {
		panelPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		panelPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		panelPanelContainer.find('.cancel-edit-panel').click(function() {
			panelPanelContainer.find('.panel-container').replaceWith(Simulators.panelBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		panelPanelContainer.find('.cancel-add-panel').click(function() {
			panelPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		panelPanelContainer.find('.validate-edit-panel, .validate-add-panel').click(function() {
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
					panelPanelContainer.find('> div > .panel-heading > h4 a').text(' ' + Translator.trans('Panel') + ' #' + panel.id + ' : ' + panel.label + ' ');
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
		panelPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		panelPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		panelPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
				if (block.type == 'fieldset') {
					a.text(' ' + Translator.trans('FieldSet') + ' #' + id + ' : ' + block.legend + ' ');
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
					Simulators.changeFieldSetIdInRules(stepId, panelId, oldId, 'X' + id);
				} else {
					Simulators.changeBlockInfoIdInRules(stepId, panelId, oldId, 'X' + id);
				}
			}
		});
		$.each(blocks, function(index, block) {
			if (block.type == 'fieldset') {
				Simulators.changeFieldSetIdInRules(stepId, panelId, 'X' + block.id, block.id);
			} else {
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

	Simulators.drawFieldSetForDisplay = function(fieldset, inClass) {
		var fieldsetElementId = 'step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id;
		var fieldsetPanelContainer;
		if (fieldset.disposition == 'grid') {
			fieldsetPanelContainer = Simulators.openCollapsiblePanel(fieldsetElementId, Translator.trans('FieldSet') + ' #' + fieldset.id + ' : ' +  $('<span>'+fieldset.legend + '</span>').text(), 'info',inClass, 'in', [{ 'class': 'delete-fieldset', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-fieldset', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		} else {
			fieldsetPanelContainer = Simulators.openCollapsiblePanel(fieldsetElementId, Translator.trans('FieldSet') + ' #' + fieldset.id + ' : ' +  $('<span>'+fieldset.legend + '</span>').text(), 'info',inClass, 'in', [{ 'class': 'delete-fieldset', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'add-field', 'label': Translator.trans('Add field'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'edit-fieldset', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		}
		var fieldsetPanelBody = fieldsetPanelContainer.find('.panel-body');
		var fieldsetContainer = $('<div class="panel panel-default block-container fieldset" id="' + fieldsetElementId + '-attributes-panel" data-step="' + fieldset.stepId + '" data-panel="' + fieldset.panelId + '" data-id="' + fieldset.id + '"></div>');
		var fieldsetContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldsetElementId, 'select', 'disposition', Translator.trans('Disposition'), fieldset.disposition, fieldset.disposition, false, Translator.trans('Select a Disposition'), JSON.stringify({ 'classic':Translator.trans('Classic'), 'grid':Translator.trans('Grid'), 'inline':Translator.trans('Inline') })));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldsetElementId, 'select', 'display', Translator.trans('Display'), fieldset.display, fieldset.display, false, Translator.trans('Select a Display'), JSON.stringify({ 'inline':Translator.trans('Inline'), 'pop-in':Translator.trans('Pop-in') })));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldsetElementId, 'text', 'popinLink', Translator.trans('Pop-in Link'), fieldset.popinLink, fieldset.popinLink, false, Translator.trans('Pop-in Link')));
		attributesContainer.append(requiredAttributes);
		fieldsetContainerBody.append(attributesContainer);
		fieldsetContainer.append(fieldsetContainerBody);
		fieldsetPanelBody.append(fieldsetContainer);
		fieldsetContainerBody.append('<div class="panel panel-default legend-panel elements-container" id="' + fieldsetElementId + '-legend-panel"><div class="panel-heading">' + Translator.trans('Legend') + '</div><div class="panel-body fieldset-legend rich-text">' + fieldset.legend + '</div></div>');
		if (fieldset.disposition == 'grid') {
			fieldsetPanelBody.append('<div class="panel panel-default fieldset-grid-panel" id="fieldset-' + fieldset.id + '-fieldset-grid-panel"><div class="panel-heading"><button class="btn btn-default pull-right update-button add-column" data-parent="#fieldset-' + fieldset.id + '-fieldset-grid-panel" title="' + Translator.trans('Add column') + '"><span class="button-label">' + Translator.trans('Add column') + '</span> <span class="glyphicon glyphicon-plus-sign"></span></button><button class="btn btn-default pull-right update-button add-fieldrow" data-parent="#fieldset-' + fieldset.id + '-fieldset-grid-panel" title="' + Translator.trans('Add fieldrow') + '"><span class="button-label">' + Translator.trans('Add fieldrow') + '</span> <span class="glyphicon glyphicon-plus-sign"></span></button><h4 class="panel-title">' + Translator.trans('Grid') + '</h4></div><div class="panel-body"><div class="panel panel-default columns-panel" id="step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id + '-columns-panel"><div class="panel-body sortable"></div></div><div class="panel panel-default fieldrows-panel" id="step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id + '-fieldrows-panel"><div class="panel-body sortable"></div></div></div></div>');
		} else {
			fieldsetPanelBody.append('<div class="panel panel-default columns-panel" id="' + fieldsetElementId + '-columns-panel"><div class="panel-body sortable"></div></div>');
			fieldsetPanelBody.append('<div class="panel panel-default fields-panel" id="' + fieldsetElementId + '-fields-panel"><div class="panel-body sortable"></div></div>');
		}
		return fieldsetPanelContainer;
	}

	Simulators.drawFieldSetForInput = function(fieldset) {
		var fieldsetElementId = 'step-' + fieldset.stepId + '-panel-' + fieldset.panelId + '-fieldset-' + fieldset.id;
		var fieldsetPanelContainer = $('<div>', { 'class': 'panel-group', id: fieldsetElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var fieldsetPanel = $('<div>', { 'class': 'panel panel-info' });
		fieldsetPanel.append('<div class="panel-heading" role="tab" id="' + fieldsetElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + fieldsetElementId + '" href="#collapse' + fieldsetElementId + '" aria-expanded="true" aria-controls="collapse' + fieldsetElementId + '">#' + fieldset.id + ' : ' + fieldset.legend + '</a></h4></div>');
		var fieldsetPanelCollapse = $('<div id="collapse' + fieldsetElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + fieldsetElementId + '-panel"></div>');
		var fieldsetPanelBody = $('<div class="panel-body"></div>');
		var fieldsetContainer = $('<div class="panel panel-default block-container fieldset" id="' + fieldsetElementId + '-attributes-panel" data-step="' + fieldset.stepId + '" data-panel="' + fieldset.panelId + '" data-id="' + fieldset.id + '" data-name="' + fieldset.name + '"></div>');
		var fieldsetContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + fieldsetElementId + '" data-type="select" data-name="disposition" data-placeholder="' + Translator.trans('FieldSet disposition') + '" data-options="' + encodeURI(JSON.stringify( {'classic': Translator.trans('Classic'), 'grid': Translator.trans('Grid') } )) + '">' + Translator.trans('Disposition') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldset.disposition) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldsetElementId + '-disposition', 'select', 'disposition', Translator.trans('Disposition'), fieldset.disposition, false, Translator.trans('FieldSet disposition'), JSON.stringify( {'classic': Translator.trans('Classic'), 'grid': Translator.trans('Grid'), 'inline': Translator.trans('Inline') } )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldsetElementId + '" data-type="select" data-name="display" data-placeholder="' + Translator.trans('FieldSet display') + '" data-options="' + encodeURI(JSON.stringify( {'inline': Translator.trans('Inline'), 'pop-in': Translator.trans('Pop-in') } )) + '">' + Translator.trans('Display') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldset.display) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldsetElementId + '-display', 'select', 'display', Translator.trans('Display'), fieldset.display, false, Translator.trans('FieldSet display'), JSON.stringify( {'inline': Translator.trans('Inline'), 'pop-in': Translator.trans('Pop-in') } )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldsetElementId + '" data-type="text" data-name="popinLink" data-placeholder="' + Translator.trans('Pop-in Link') + '">' + Translator.trans('Pop-in Link') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldset.popinLink) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldsetElementId + '-display', 'text', 'popinLink', Translator.trans('Pop-in Link'), fieldset.popinLink, false, Translator.trans('Pop-in Link')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		fieldsetContainerBody.append(attributesContainer);
		fieldsetContainer.append(fieldsetContainerBody);
		fieldsetPanelBody.append(fieldsetContainer);
		fieldsetContainerBody.append('<div class="panel panel-default legend-panel elements-container" id="' + fieldsetElementId + '-legend-panel"><div class="panel-heading">' + Translator.trans('Legend') + '</div><div class="panel-body"><textarea rows="5" name="' + fieldsetElementId + '-legend" id="' + fieldsetElementId + '-legend" wrap="hard" class="form-control fieldset-legend">' + fieldset.legend + '</textarea></div></div>');
		var fieldsetButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + fieldsetElementId + '-buttons-panel"></div>');
		var fieldsetButtonsBody = $('<div class="panel-body fieldset-buttons"></div>');
		fieldsetButtonsBody.append('<button class="btn btn-success pull-right validate-edit-fieldset">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		fieldsetButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-fieldset">' + Translator.trans('Cancel') + '</span></button>');
		fieldsetButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-fieldset').click(function(e) {
			e.preventDefault();
			Simulators.editFieldSet($($(this).attr('data-parent')));
		});
		container.find('button.delete-fieldset').click(function(e) {
			e.preventDefault();
			Simulators.deleteFieldSet($($(this).attr('data-parent')));
		});
		container.find('button.add-field').click(function(e) {
			e.preventDefault();
			var fieldrowContainer = $($(this).attr('data-parent')).find('.fieldrow-container');
			if (fieldrowContainer.length == 0) {
				Simulators.addField($($(this).attr('data-parent')));
			}
		});
		container.find('button.add-fieldrow').click(function(e) {
			e.preventDefault();
			Simulators.addFieldRow($($(this).attr('data-parent')));
		});
		container.find('button.add-column').click(function(e) {
			e.preventDefault();
			Simulators.addFieldSetColumn($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFieldSet = function(fieldsetPanelContainer) {
		fieldsetPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		fieldsetPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		fieldsetPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		fieldsetPanelContainer.find('.cancel-edit-fieldset').click(function() {
			fieldsetPanelContainer.find('.block-container.fieldset').replaceWith(Simulators.fieldsetBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldsetPanelContainer.find('.cancel-add-fieldset').click(function() {
			fieldsetPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldsetPanelContainer.find('.validate-edit-fieldset, .validate-add-fieldset').click(function() {
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
			fieldset['legend'] =  fieldsetPanelContainer.find('.fieldset-legend').val();
			if (! fieldset.popinLink) {
				fieldset.popinLink = '';
			}
			var oldLegend = '';
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
					if (fieldset.legend != oldFieldSet.legend) {
						fieldsetPanelContainer.find('> div > .panel-heading > h4 a').text(' ' + Translator.trans('FieldSet') + ' #' + fieldset.id + ' : ' +  $('<span>'+fieldset.legend + '</span>').text() + ' ');
						Simulators.changeFieldSetLegendInRules(stepId, panelId, fieldset.id, fieldset.legend);
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
		fieldsetPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		fieldsetPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		fieldsetPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}

	Simulators.checkFieldSet = function(fieldsetContainer) {
		var fieldsetElementId = fieldsetContainer.attr('id');
		var display = $.trim($('#' + fieldsetElementId + '-display').val());
		var popinLink = $.trim($('#' + fieldsetElementId + '-popinLink').val());
		if (display == 'pop-in' && popinLink == '') {
			fieldsetContainer.find('.error-message').text(Translator.trans('Incorrect pop-in link'));
			fieldsetContainer.find('.alert').show();
			return false;
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
				legend: '',
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
			console.log(e.message);
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
			console.log(e.message);
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
			var legend = fieldset.legend !== '' ? fieldset.legend : 'fieldset #' + fieldset.id; 
			var rule;
			if ((rule = Simulators.isFieldSetInRules(stepId, panelId, id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting fieldset'),
					message: Translator.trans("This fieldset is used in rule #%id%. You must modify this rule before you can delete this fieldset", { 'id': rule }) 
				});
				return;
			}
			bootbox.confirm({
				title: Translator.trans('Deleting fieldset'),
				message: Translator.trans("Are you sure you want to delete the fieldset : %legend%", { 'legend': legend }), 
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
			console.log(e.message);
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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
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
		var columnPanelContainer = Simulators.openCollapsiblePanel(columnElementId, Translator.trans('Column #%id% : %label%', {'id': column.id, 'label': column.label }), 'warning', inClass, '', [{ 'class': 'delete-column', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-column', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var columnPanelBody = columnPanelContainer.find('.panel-body');
		var columnContainer = $('<div class="panel panel-default column-container" id="' + columnElementId + '-attributes-panel" data-step="' + column.stepId + '" data-panel="' + column.panelId + '" data-fieldset="' + column.fieldsetId + '" data-id="' + column.id + '"></div>');
		var columnContainerBody = $('<div class="panel-body"></div>');
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
		var columnPanel = $('<div>', { 'class': 'panel panel-warning' });
		columnPanel.append('<div class="panel-heading" role="tab" id="' + columnElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + columnElementId + '" href="#collapse' + columnElementId + '" aria-expanded="true" aria-controls="collapse' + columnElementId + '">' + Translator.trans('Column #%id% : %label%', {'id': column.id, 'label': column.label }) + '</a></h4></div>');
		var columnPanelCollapse = $('<div id="collapse' + columnElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + columnElementId + '-panel"></div>');
		var columnPanelBody = $('<div class="panel-body"></div>');
		var columnContainer = $('<div class="panel panel-default column-container" id="' + columnElementId + '-attributes-panel" data-step="' + column.stepId + '" data-panel="' + column.panelId + '" data-fieldset="' + column.fieldsetId + '" data-id="' + column.id + '" data-name="' + column.name + '"></div>');
		var columnContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + columnElementId + '-name" class="col-sm-4 control-label">' + Translator.trans('Name') + '</label><div class="col-sm-8"><input type="text" name="' + columnElementId + '-name" id="' + columnElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Column name without spaces or special characters') + '" value="' + column.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + columnElementId + '-label" class="col-sm-4 control-label">' + Translator.trans('Label') + '</label><div class="col-sm-8"><input type="text" name="' + columnElementId + '-label" id="' + columnElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Column label') + '" value="' + column.label + '" /></div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(columnElementId + '-type', 'select', 'type', 'Type', column.type, true, Translator.trans('Select a column type'), JSON.stringify(Admin.types)));
		attributesContainer.append(requiredAttributes);
		columnContainerBody.append(attributesContainer);
		columnContainer.append(columnContainerBody);
		columnPanelBody.append(columnContainer);
		var columnButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + columnElementId + '-buttons-panel"></div>');
		var columnButtonsBody = $('<div class="panel-body column-buttons"></div>');
		columnButtonsBody.append('<button class="btn btn-success pull-right validate-edit-column">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		columnButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-column">' + Translator.trans('Cancel') + '</span></button>');
		columnButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-column').click(function(e) {
			e.preventDefault();
			Simulators.editFieldSetColumn($($(this).attr('data-parent')));
		});
		container.find('button.delete-column').click(function(e) {
			e.preventDefault();
			Simulators.deleteFieldSetColumn($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFieldSetColumn = function(columnPanelContainer) {
		columnPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		columnPanelContainer.find('.cancel-edit-column').click(function() {
			columnPanelContainer.find('.column-container').replaceWith(Simulators.columnBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		columnPanelContainer.find('.cancel-add-column').click(function() {
			columnPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		columnPanelContainer.find('.validate-edit-column, .validate-add-column').click(function() {
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
					columnPanelContainer.find('> div > .panel-heading > h4 a').text(Translator.trans('Column #%id% : %label%', {'id': column.id, 'label': column.label }));
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
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
		}
	}

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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
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
				Simulators.changeFieldRowIdInRules(stepId, panelId, fieldsetId, oldId, 'X' + id)
			}
		});
		$.each(fieldrows, function(index, fieldrow) {
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
			Simulators.openCollapsiblePanel(fieldrowElementId, Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }), 'success', inClass, '', [{ 'class': 'delete-fieldrow', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'add-field', 'label': Translator.trans('Add field'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'edit-fieldrow', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] ) :
			Simulators.openCollapsiblePanel(fieldrowElementId, Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }), 'success', inClass, '', [{ 'class': 'delete-fieldrow', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-fieldrow', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var fieldrowPanelBody = fieldrowPanelContainer.find('.panel-body');
		var fieldrowContainer = $('<div class="panel panel-default fieldrow-container" id="' + fieldrowElementId + '-attributes-panel" data-step="' + fieldrow.stepId + '" data-panel="' + fieldrow.panelId + '" data-fieldset="' + fieldrow.fieldsetId + '" data-id="' + fieldrow.id + '"></div>');
		var fieldrowContainerBody = $('<div class="panel-body"></div>');
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
		fieldrowPanelBody.append('<div class="panel panel-default fields-panel" id="' + fieldrowElementId + '-fields-panel"><div class="panel-body sortable"></div></div>');
		return fieldrowPanelContainer;
	}

	Simulators.addFieldButtonToFieldRows = function(fieldsetGridPanel) {
		var deleteFieldrowButtons = fieldsetGridPanel.find('.delete-fieldrow');
		deleteFieldrowButtons.each(function(index) {
			if (! $(this).next().hasClass('add-field')) {
				var button = $('<button class="btn btn-success pull-right update-button add-field" title="' + Translator.trans('Add field') + '" data-parent="' +  $(this).attr('data-parent') + '"><span class="button-label">' + Translator.trans('Add field') + '</span> <span class="glyphicon glyphicon-plus-sign"></span></button>');
				$(this).after(button);
				button.click(function(e) {
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
		var fieldrowPanel = $('<div>', { 'class': 'panel panel-warning' });
		fieldrowPanel.append('<div class="panel-heading" role="tab" id="' + fieldrowElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + fieldrowElementId + '" href="#collapse' + fieldrowElementId + '" aria-expanded="true" aria-controls="collapse' + fieldrowElementId + '">' + Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }) + '</a></h4></div>');
		var fieldrowPanelCollapse = $('<div id="collapse' + fieldrowElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + fieldrowElementId + '-panel"></div>');
		var fieldrowPanelBody = $('<div class="panel-body"></div>');
		var fieldrowContainer = $('<div class="panel panel-default fieldrow-container" id="' + fieldrowElementId + '-attributes-panel" data-step="' + fieldrow.stepId + '" data-panel="' + fieldrow.panelId + '" data-fieldset="' + fieldrow.fieldsetId + '" data-id="' + fieldrow.id + '"></div>');
		var fieldrowContainerBody = $('<div class="panel-body"></div>');
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
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + fieldrowElementId + '" data-type="checkbox" data-name="colon" data-placeholder="' + Translator.trans('Show colon after field label ?') + '">' + Translator.trans('Show colon after field label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldrow.colon) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-colon', 'checkbox', 'colon', Translator.trans('Show colon after field label ?'), fieldrow.colon, false, Translator.trans('Show colon after field label ?')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldrowElementId + '" data-type="checkbox" data-name="help" data-placeholder="' + Translator.trans('Show data description as help ?') + '">' + Translator.trans('Show data description as help ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldrow.help) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-help', 'checkbox', 'help', Translator.trans('Show data description as help ?'), fieldrow.help, false, Translator.trans('Show data description as help ?')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldrowElementId + '" data-type="checkbox" data-name="emphasize" data-placeholder="' + Translator.trans('Emphasize the text label ?') + '">' + Translator.trans('Emphasize the text label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (fieldrow.emphasize) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-emphasize', 'checkbox', 'help', Translator.trans('Emphasize the text label ?'), fieldrow.emphasize, false, Translator.trans('Emphasize the text label ?')));
			optionalAttribute.hide();
		} 
		requiredAttributes.append(Simulators.simpleAttributeForInput(fieldrowElementId + '-datagroup', 'select', 'datagroup', Translator.trans('Datagroup'), fieldrow.datagroup, true, Translator.trans('Select a datagroup'), JSON.stringify(datagroupsList)));
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		fieldrowContainerBody.append(attributesContainer);
		fieldrowContainer.append(fieldrowContainerBody);
		fieldrowPanelBody.append(fieldrowContainer);
		var fieldrowButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + fieldrowElementId + '-buttons-panel"></div>');
		var fieldrowButtonsBody = $('<div class="panel-body fieldrow-buttons"></div>');
		fieldrowButtonsBody.append('<button class="btn btn-success pull-right validate-edit-fieldrow">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		fieldrowButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-fieldrow">' + Translator.trans('Cancel') + '</span></button>');
		fieldrowButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-fieldrow').click(function(e) {
			e.preventDefault();
			Simulators.editFieldRow($($(this).attr('data-parent')));
		});
		container.find('button.delete-fieldrow').click(function(e) {
			e.preventDefault();
			Simulators.deleteFieldRow($($(this).attr('data-parent')));
		});
		container.find('button.add-field').click(function(e) {
			e.preventDefault();
			Simulators.addField($($(this).attr('data-parent')));
		});
	}

	Simulators.bindFieldRow = function(fieldrowPanelContainer) {
		fieldrowPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		fieldrowPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		fieldrowPanelContainer.find('.cancel-edit-fieldrow').click(function() {
			fieldrowPanelContainer.find('.fieldrow-container').replaceWith(Simulators.fieldrowBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldrowPanelContainer.find('.cancel-add-fieldrow').click(function() {
			fieldrowPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldrowPanelContainer.find('.validate-edit-fieldrow, .validate-add-fieldrow').click(function() {
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
					fieldrowPanelContainer.find('> div > .panel-heading > h4 a').text(Translator.trans('Fieldrow #%id% : %label%', {'id': fieldrow.id, 'label': fieldrow.label }));
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
		fieldrowPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		fieldrowPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		fieldrowPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
		}
	}

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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
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
				Simulators.changeFieldIdInRules(stepId, panelId, fieldsetId, fieldrowId, oldPosition, 'X' + position)
			}
		});
		$.each(fields, function(index, field) {
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
		var fieldPanelContainer = Simulators.openCollapsiblePanel(fieldElementId, Translator.trans('Field') + ' #' + field.position + ' : ' + field.label, 'warning', inClass, '', [{ 'class': 'delete-field', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-field', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var fieldPanelBody = fieldPanelContainer.find('.panel-body');
		var fieldContainer = $('<div class="panel panel-default field-container" id="' + fieldElementId + '-attributes-panel" data-step="' + field.stepId + '" data-panel="' + field.panelId + '" data-fieldset="' + field.fieldsetId + '" data-fieldrow="' + field.fieldrowId + '" data-id="' + field.position + '"></div>');
		var fieldContainerBody = $('<div class="panel-body"></div>');
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
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(fieldElementId, 'select', 'widget', Translator.trans('Widget'), field.widget, field.widget, false, Translator.trans('Select a widget'), JSON.stringify(widgets)));
		attributesContainer.append(requiredAttributes);
		fieldContainerBody.append(attributesContainer);
		fieldContainer.append(fieldContainerBody);
		fieldPanelBody.append(fieldContainer);
		if (field.fieldrowId === '' && field.Note) {
			var position = field.Note == 'beforeField' ? Translator.trans('placed before the field') : Translator.trans('placed after the field');
			fieldContainerBody.append('<div class="panel panel-default note-panel elements-container" id="' + fieldElementId + '-note-panel"><div class="panel-heading"><span class="note-position pull-right">' + Translator.trans('Note position') + ' : ' + position + '</span>' + Translator.trans('Note') + '</div><div class="panel-body field-note rich-text">' + field.Note.text + '</div></div>');
		}
		return fieldPanelContainer;
	}

	Simulators.drawFieldForInput = function(field) {
		var fieldElementId = field.fieldrowId == '' ? 
			'step-' + field.stepId + '-panel-' + field.panelId + '-fieldset-' + field.fieldsetId + '-field-' + field.position :
			'step-' + field.stepId + '-panel-' + field.panelId + '-fieldset-' + field.fieldsetId + '-fieldrow-' + field.fieldrowId + '-field-' + field.position;
		var fieldPanelContainer = $('<div>', { 'class': 'panel-group', id: fieldElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var fieldPanel = $('<div>', { 'class': 'panel panel-warning' });
		fieldPanel.append('<div class="panel-heading" role="tab" id="' + fieldElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + fieldElementId + '" href="#collapse' + fieldElementId + '" aria-expanded="true" aria-controls="collapse' + fieldElementId + '">#' + field.position + ' : ' + field.label + '</a></h4></div>');
		var fieldPanelCollapse = $('<div id="collapse' + fieldElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + fieldElementId + '-panel"></div>');
		var fieldPanelBody = $('<div class="panel-body"></div>');
		var fieldContainer = $('<div class="panel panel-default field-container" id="' + fieldElementId + '-attributes-panel" data-step="' + field.stepId + '" data-panel="' + field.panelId + '" data-fieldset="' + field.fieldsetId + '" data-fieldrow="' + field.fieldrowId + '" data-id="' + field.position + '"></div>');
		var fieldContainerBody = $('<div class="panel-body"></div>');
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
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Field label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-label', 'text', 'label', Translator.trans('Label'), field.label, false, Translator.trans('Field label')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="text" data-name="prompt" data-placeholder="' + Translator.trans('Field prompt') + '">' + Translator.trans('Prompt') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.prompt) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-prompt', 'text', 'prompt', Translator.trans('Prompt'), field.prompt, false, Translator.trans('Field prompt')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="newline" data-placeholder="">' + Translator.trans('Newline before field ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.newline == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-newline', 'checkbox', 'newline', Translator.trans('Newline before field ?'), field.newline, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="required" data-placeholder="">' + Translator.trans('Required') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.required == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-required', 'checkbox', 'required', Translator.trans('Required'), field.required, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="visibleRequired" data-placeholder="">' + Translator.trans('Required if visible') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.visibleRequired == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-visibleRequired', 'checkbox', 'visibleRequired', Translator.trans('Required if visible'), field.visibleRequired, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="colon" data-placeholder="">' + Translator.trans('Show colon after field label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.colon == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-colon', 'checkbox', 'colon', Translator.trans('Show colon after field label ?'), field.colon, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="underlabel" data-placeholder="">' + Translator.trans('Place the field under the label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.underlabel == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-underlabel', 'checkbox', 'underlabel', Translator.trans('Place the field under the label ?'), field.underlabel, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="help" data-placeholder="">' + Translator.trans('Show data description as help ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.help == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-help', 'checkbox', 'help', Translator.trans('Show data description as help ?'), field.help, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="emphasize" data-placeholder="">' + Translator.trans('Emphasize the text label ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.emphasize == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-emphasize', 'checkbox', 'emphasize', Translator.trans('Emphasize the text label ?'), field.emphasize, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="checkbox" data-name="expanded" data-placeholder="">' + Translator.trans('Show choices as radio buttons ?') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.expanded == "1") {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-expanded', 'checkbox', 'expanded', Translator.trans('Show choices as radio buttons ?'), field.expanded, false, ''));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="text" data-name="explanation" data-placeholder="' + Translator.trans('Explanation') + '">' + Translator.trans('Explanation') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.explanation) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-explanation', 'text', 'explanation', Translator.trans('Explanation'), field.explanation, false, Translator.trans('Explanation')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + fieldElementId + '" data-type="select" data-name="widget" data-placeholder="' + Translator.trans('Select a widget') + '" data-options="' + encodeURI(JSON.stringify(widgets)) + '">' + Translator.trans('Widget') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (field.widget) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(fieldElementId + '-widget', 'select', 'widget', Translator.trans('Widget'), field.widget, false, Translator.trans('Select a widget'), JSON.stringify(widgets)));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		fieldContainerBody.append(attributesContainer);
		fieldContainer.append(fieldContainerBody);
		fieldPanelBody.append(fieldContainer);
		if (field.fieldrowId === '') {
			var note = '';
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
			fieldContainerBody.append('<div class="panel panel-default note-panel elements-container" id="' + fieldElementId + '-note-panel"><div class="panel-heading"><span class="note-position pull-right"><label for="' + fieldElementId + '-note-position">' + Translator.trans('Note position') + '</label><select id="' + fieldElementId + '-note-position"><option value="beforeField"' + noteBefore + '>' + Translator.trans('placed before the field') + '</option><option value="afterField"' + noteAfter + '>' + Translator.trans('placed after the field') + '</option></select></span>' + Translator.trans('Note') + '</div><div class="panel-body"><textarea rows="5" name="' + fieldElementId + '-note" id="' + fieldElementId + '-note" wrap="hard" class="form-control field-note">' + note + '</textarea></div></div>');
		}
		var fieldButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + fieldElementId + '-buttons-panel"></div>');
		var fieldButtonsBody = $('<div class="panel-body field-buttons"></div>');
		fieldButtonsBody.append('<button class="btn btn-success pull-right validate-edit-field">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		fieldButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-field">' + Translator.trans('Cancel') + '</span></button>');
		fieldButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-field').click(function(e) {
			e.preventDefault();
			Simulators.editField($($(this).attr('data-parent')));
		});
		container.find('button.delete-field').click(function(e) {
			e.preventDefault();
			Simulators.deleteField($($(this).attr('data-parent')));
		});
	}

	Simulators.bindField = function(fieldPanelContainer) {
		fieldPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		fieldPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		fieldPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		fieldPanelContainer.find('.cancel-edit-field').click(function() {
			fieldPanelContainer.replaceWith(Simulators.fieldBackup);
			Simulators.fieldBackup.find('button.edit-field').click(function(e) {
				e.preventDefault();
				Simulators.editField($($(this).attr('data-parent')));
			});
			Simulators.fieldBackup.find('button.delete-field').click(function(e) {
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
		fieldPanelContainer.find('.cancel-add-field').click(function() {
			fieldPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		fieldPanelContainer.find('.validate-edit-field, .validate-add-field').click(function() {
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
			var note = fieldPanelContainer.find('.field-note').val();
			if (fieldrowId == '' && note != '') {
				var posNote = fieldPanelContainer.find('.note-position select').val();
				field['Note'] = {
					position: posNote,
					text: note
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
		fieldPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		fieldPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		fieldPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
			console.log(e.message);
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
			console.log(e.message);
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
			var label = field.label ? field.label : 'field #' + field.position; 
			var rule;
			if ((rule = Simulators.isFieldInRules(stepId, panelId, fieldsetId, fieldrowId, position)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting field'),
					message: Translator.trans("This field is used in rule #%id%. You must modify this rule before you can delete this field", { 'id': rule }) 
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
			console.log(e.message);
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

	Simulators.drawBlockInfoForDisplay = function(blockinfo, inClass) {
		var blockinfoElementId = 'step-' + blockinfo.stepId + '-panel-' + blockinfo.panelId + '-blockinfo-' + blockinfo.id;
		var blockinfoPanelContainer = Simulators.openCollapsiblePanel(blockinfoElementId, Translator.trans('Blockinfo #%id% : %label%', {'id': blockinfo.id, 'label': blockinfo.label}), 'info',inClass, '', [{ 'class': 'delete-blockinfo', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'add-chapter', 'label': Translator.trans('Add chapter'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'edit-blockinfo', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var blockinfoPanelBody = blockinfoPanelContainer.find('.panel-body');
		var blockinfoContainer = $('<div class="panel panel-default block-container blockinfo" id="' + blockinfoElementId + '-attributes-panel" data-step="' + blockinfo.stepId + '" data-panel="' + blockinfo.panelId + '" data-id="' + blockinfo.id + '"></div>');
		var blockinfoContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(blockinfoElementId, 'text', 'name', Translator.trans('Name'), blockinfo.name, blockinfo.name, true, Translator.trans('Blockinfo name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(blockinfoElementId, 'text', 'label', Translator.trans('Label'), blockinfo.label, blockinfo.label, true, Translator.trans('Blockinfo label')));
		attributesContainer.append(requiredAttributes);
		blockinfoContainerBody.append(attributesContainer);
		blockinfoContainer.append(blockinfoContainerBody);
		blockinfoPanelBody.append(blockinfoContainer);
		blockinfoPanelBody.append('<div class="panel panel-default chapters-panel" id="' + blockinfoElementId + '-chapters-panel"><div class="panel-body sortable"></div></div>');
		return blockinfoPanelContainer;
	}

	Simulators.drawBlockInfoForInput = function(blockinfo) {
		var blockinfoElementId = 'step-' + blockinfo.stepId + '-panel-' + blockinfo.panelId + '-blockinfo-' + blockinfo.id;
		var blockinfoPanelContainer = $('<div>', { 'class': 'panel-group', id: blockinfoElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var blockinfoPanel = $('<div>', { 'class': 'panel panel-info' });
		blockinfoPanel.append('<div class="panel-heading" role="tab" id="' + blockinfoElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + blockinfoElementId + '" href="#collapse' + blockinfoElementId + '" aria-expanded="true" aria-controls="collapse' + blockinfoElementId + '">#' + blockinfo.id + ' : ' + blockinfo.label + '</a></h4></div>');
		var blockinfoPanelCollapse = $('<div id="collapse' + blockinfoElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + blockinfoElementId + '-panel"></div>');
		var blockinfoPanelBody = $('<div class="panel-body"></div>');
		var blockinfoContainer = $('<div class="panel panel-default block-container blockinfo" id="' + blockinfoElementId + '-attributes-panel" data-step="' + blockinfo.stepId + '" data-panel="' + blockinfo.panelId + '" data-id="' + blockinfo.id + '" data-name="' + blockinfo.name + '"></div>');
		var blockinfoContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(blockinfoElementId + '-name', 'text', 'name', Translator.trans('Name'), blockinfo.name, false, Translator.trans('BlockInfo name')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + blockinfoElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('BlockInfo label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (blockinfo.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(blockinfoElementId + '-label', 'text', 'label', Translator.trans('Label'), blockinfo.label, false, Translator.trans('BlockInfo label')));
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		blockinfoContainerBody.append(attributesContainer);
		blockinfoContainer.append(blockinfoContainerBody);
		blockinfoPanelBody.append(blockinfoContainer);
		var blockinfoButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + blockinfoElementId + '-buttons-panel"></div>');
		var blockinfoButtonsBody = $('<div class="panel-body blockinfo-buttons"></div>');
		blockinfoButtonsBody.append('<button class="btn btn-success pull-right validate-edit-blockinfo">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		blockinfoButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-blockinfo">' + Translator.trans('Cancel') + '</span></button>');
		blockinfoButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-blockinfo').click(function(e) {
			e.preventDefault();
			Simulators.editBlockInfo($($(this).attr('data-parent')));
		});
		container.find('button.delete-blockinfo').click(function(e) {
			e.preventDefault();
			Simulators.deleteBlockInfo($($(this).attr('data-parent')));
		});
		container.find('button.add-chapter').click(function(e) {
			e.preventDefault();
			Simulators.addChapter($($(this).attr('data-parent')));
		});
	}

	Simulators.bindBlockInfo = function(blockinfoPanelContainer) {
		blockinfoPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		blockinfoPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		blockinfoPanelContainer.find('.cancel-edit-blockinfo').click(function() {
			blockinfoPanelContainer.find('.block-container.blockinfo').replaceWith(Simulators.blockinfoBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		blockinfoPanelContainer.find('.cancel-add-blockinfo').click(function() {
			blockinfoPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		blockinfoPanelContainer.find('.validate-edit-blockinfo, .validate-add-blockinfo').click(function() {
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
		blockinfoPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		blockinfoPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		blockinfoPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
				sections: []
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
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
		}
	}

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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
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
				Simulators.changeChapterIdInRules(stepId, panelId, blockinfoId, oldId, 'X' + id)
			}
		});
		$.each(chapters, function(index, chapter) {
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
		var chapterPanelContainer = Simulators.openCollapsiblePanel(chapterElementId, Translator.trans('Chapter #%id% : %label%', {'id': chapter.id, 'label': chapter.label }), 'warning', inClass, '', [{ 'class': 'delete-chapter', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'add-section', 'label': Translator.trans('Add section'), 'icon': 'glyphicon-plus-sign' }, { 'class': 'edit-chapter', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var chapterPanelBody = chapterPanelContainer.find('.panel-body');
		var chapterContainer = $('<div class="panel panel-default chapter-container" id="' + chapterElementId + '-attributes-panel" data-step="' + chapter.stepId + '" data-panel="' + chapter.panelId + '" data-blockinfo="' + chapter.blockinfoId + '" data-id="' + chapter.id + '"></div>');
		var chapterContainerBody = $('<div class="panel-body"></div>');
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
		chapterPanelBody.append('<div class="panel panel-default sections-panel" id="' + chapterElementId + '-sections-panel"><div class="panel-body sortable"></div></div>');
		return chapterPanelContainer;
	}

	Simulators.drawChapterForInput = function(chapter) {
		var chapterElementId = 'step-' + chapter.stepId + '-panel-' + chapter.panelId + '-blockinfo-' + chapter.blockinfoId + '-chapter-' + chapter.id;
		var chapterPanelContainer = $('<div>', { 'class': 'panel-group', id: chapterElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var chapterPanel = $('<div>', { 'class': 'panel panel-warning' });
		chapterPanel.append('<div class="panel-heading" role="tab" id="' + chapterElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + chapterElementId + '" href="#collapse' + chapterElementId + '" aria-expanded="true" aria-controls="collapse' + chapterElementId + '">#' + chapter.id + ' : ' + chapter.label + '</a></h4></div>');
		var chapterPanelCollapse = $('<div id="collapse' + chapterElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + chapterElementId + '-panel"></div>');
		var chapterPanelBody = $('<div class="panel-body"></div>');
		var chapterContainer = $('<div class="panel panel-default chapter-container" id="' + chapterElementId + '-attributes-panel" data-step="' + chapter.stepId + '" data-panel="' + chapter.panelId + '" data-blockinfo="' + chapter.blockinfoId + '" data-id="' + chapter.id + '" data-name="' + chapter.name + '"></div>');
		var chapterContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-name', 'text', 'name', Translator.trans('Name'), chapter.name, false, Translator.trans('Chapter name')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + chapterElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Chapter label') + '">' + Translator.trans('Label') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (chapter.label) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-label', 'text', 'label', Translator.trans('Label'), chapter.label, false, Translator.trans('Chapter label')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + chapterElementId + '" data-type="text" data-name="icon" data-placeholder="' + Translator.trans('Chapter icon') + '">' + Translator.trans('Icon') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (chapter.icon) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(chapterElementId + '-icon', 'text', 'icon', Translator.trans('Icon'), chapter.icon, false, Translator.trans('Chapter icon')));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" data-element="' + chapterElementId + '" data-type="checkbox" data-name="collapsible" data-placeholder="">' + Translator.trans('Allow collapse/expand ?') + '</li>');
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
		var chapterButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + chapterElementId + '-buttons-panel"></div>');
		var chapterButtonsBody = $('<div class="panel-body chapter-buttons"></div>');
		chapterButtonsBody.append('<button class="btn btn-success pull-right validate-edit-chapter">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		chapterButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-chapter">' + Translator.trans('Cancel') + '</span></button>');
		chapterButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-chapter').click(function(e) {
			e.preventDefault();
			Simulators.editChapter($($(this).attr('data-parent')));
		});
		container.find('button.delete-chapter').click(function(e) {
			e.preventDefault();
			Simulators.deleteChapter($($(this).attr('data-parent')));
		});
		container.find('button.add-section').click(function(e) {
			e.preventDefault();
			Simulators.addSection($($(this).attr('data-parent')));
		});
	}

	Simulators.bindChapter = function(chapterPanelContainer) {
		chapterPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		chapterPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		chapterPanelContainer.find('.cancel-edit-chapter').click(function() {
			chapterPanelContainer.find('.chapter-container').replaceWith(Simulators.chapterBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		chapterPanelContainer.find('.cancel-add-chapter').click(function() {
			chapterPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		chapterPanelContainer.find('.validate-edit-chapter, .validate-add-chapter').click(function() {
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
		chapterPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		chapterPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		chapterPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
			console.log(e.message);
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
			console.log(e.message);
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
			console.log(e.message);
		}
	}

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
				var a = panelGroup.find('> .panel > .panel-heading').find('> h4 > a');
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
				Simulators.changeSectionIdInRules(stepId, panelId, blockinfoId, chapterId, oldId, 'X' + id)
			}
		});
		$.each(sections, function(index, section) {
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
		var sectionPanelContainer = Simulators.openCollapsiblePanel(sectionElementId, Translator.trans('Section #%id% : %label%', { 'id': section.id,  'label': section.label }), 'info', inClass, '', [{ 'class': 'delete-section', 'label': Translator.trans('Delete'), 'icon': 'glyphicon-minus-sign' }, { 'class': 'edit-section', 'label': Translator.trans('Edit'), 'icon': 'glyphicon-pencil' } ] );
		var sectionPanelBody = sectionPanelContainer.find('.panel-body');
		var sectionContainer = $('<div class="panel panel-default section-container" id="' + sectionElementId + '-attributes-panel" data-step="' + section.stepId + '" data-panel="' + section.panelId + '" data-blockinfo="' + section.blockinfoId + '" data-chapter="' + section.chapterId + '" data-id="' + section.id + '"></div>');
		var sectionContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(sectionElementId, 'text', 'name', Translator.trans('Name'), section.name, section.name, true, Translator.trans('Section name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(sectionElementId, 'text', 'label', Translator.trans('Label'), section.label, section.label, false, Translator.trans('Section label')));
		attributesContainer.append(requiredAttributes);
		sectionContainerBody.append(attributesContainer);
		sectionContainer.append(sectionContainerBody);
		sectionPanelBody.append(sectionContainer);
		sectionPanelBody.append('<div class="panel panel-default content-panel" id="' + sectionElementId + '-content-panel"><div class="panel-heading">' + Translator.trans('Content') + '</div><div class="panel-body section-content rich-text">' + section.content + '</div></div>');
		if (section.annotations) {
			sectionPanelBody.append('<div class="panel panel-default annotations-panel" id="' + sectionElementId + '-annotations-panel"><div class="panel-heading">' + Translator.trans('Annotations') + '</div><div class="panel-body section-annotations rich-text">' + section.annotations + '</div></div>');
		}
		return sectionPanelContainer;
	}

	Simulators.drawSectionForInput = function(section) {
		var sectionElementId = 'step-' + section.stepId + '-panel-' + section.panelId + '-blockinfo-' + section.blockinfoId + '-chapter-' + section.chapterId + '-section-' + section.id;
		var sectionPanelContainer = $('<div>', { 'class': 'panel-group', id: sectionElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var sectionPanel = $('<div>', { 'class': 'panel panel-info' });
		sectionPanel.append('<div class="panel-heading" role="tab" id="' + sectionElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + sectionElementId + '" href="#collapse' + sectionElementId + '" aria-expanded="true" aria-controls="collapse' + sectionElementId + '">#' + section.id + ' : ' + section.label + '</a></h4></div>');
		var sectionPanelCollapse = $('<div id="collapse' + sectionElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + sectionElementId + '-panel"></div>');
		var sectionPanelBody = $('<div class="panel-body"></div>');
		var sectionContainer = $('<div class="panel panel-default section-container" id="' + sectionElementId + '-attributes-panel" data-step="' + section.stepId + '" data-panel="' + section.panelId + '" data-blockinfo="' + section.blockinfoId + '" data-chapter="' + section.chapterId + '" data-id="' + section.id + '" data-name="' + section.name + '"></div>');
		var sectionContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(sectionElementId + '-name', 'text', 'name', Translator.trans('Name'), section.name, false, Translator.trans('Section name')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="' + sectionElementId + '" data-type="text" data-name="label" data-placeholder="' + Translator.trans('Section label') + '">' + Translator.trans('Label') + '</li>');
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
		sectionPanelBody.append('<div class="panel panel-default content-panel" id="' + sectionElementId + '-content-panel"><div class="panel-heading">' + Translator.trans('Content') + '</div><div class="panel-body"><textarea rows="5" name="' + sectionElementId + '-content" id="' + sectionElementId + '-content" wrap="hard" class="form-control section-content">' + section.content + '</textarea></div></div>');
		sectionPanelBody.append('<div class="panel panel-default annotations-panel" id="' + sectionElementId + '-annotations-panel"><div class="panel-heading">' + Translator.trans('Annotations') + '</div><div class="panel-body"><textarea rows="5" name="' + sectionElementId + '-annotations" id="' + sectionElementId + '-annotations" wrap="hard" class="form-control section-annotations">' + section.annotations + '</textarea></div></div>');
		var sectionButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + sectionElementId + '-buttons-panel"></div>');
		var sectionButtonsBody = $('<div class="panel-body section-buttons"></div>');
		sectionButtonsBody.append('<button class="btn btn-success pull-right validate-edit-section">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		sectionButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-section">' + Translator.trans('Cancel') + '</span></button>');
		sectionButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
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
		container.find('button.edit-section').click(function(e) {
			e.preventDefault();
			Simulators.editSection($($(this).attr('data-parent')));
		});
		container.find('button.delete-section').click(function(e) {
			e.preventDefault();
			Simulators.deleteSection($($(this).attr('data-parent')));
		});
	}

	Simulators.bindSection = function(sectionPanelContainer) {
		sectionPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		sectionPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		sectionPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		sectionPanelContainer.find('.cancel-edit-section').click(function() {
			sectionPanelContainer.replaceWith(Simulators.sectionBackup);
			Simulators.sectionBackup.find('button.edit-section').click(function(e) {
				e.preventDefault();
				Simulators.editSection($($(this).attr('data-parent')));
			});
			Simulators.sectionBackup.find('button.delete-section').click(function(e) {
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
		sectionPanelContainer.find('.cancel-add-section').click(function() {
			sectionPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		sectionPanelContainer.find('.validate-edit-section, .validate-add-section').click(function() {
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
				label: ''
			};
			var attributes = sectionContainer.find('.attributes-container');
			attributes.find('input:not(:checkbox).simple-value, input:checkbox:checked.simple-value, select.simple-value').each(function (index) {
				section[$(this).attr('data-attribute')] = $(this).val();
			});
			section['content'] = sectionPanelContainer.find('.section-content').val();
			var annotations = sectionPanelContainer.find('.section-annotations').val();
			if (annotations != '') {
				section['annotations'] = annotations;
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
		sectionPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		sectionPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		sectionPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
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
				content: '',
				annotations: '',
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
			console.log(e.message);
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
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var sectionPanelContainer = Simulators.drawSectionForInput(section);
			Simulators.sectionBackup = sectionContainerGroup.replaceWith(sectionPanelContainer);
			Simulators.bindSection(sectionPanelContainer);
			$("#collapse" + sectionPanelContainer.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: sectionPanelContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console.log(e.message);
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
			console.log(e.message);
		}
	}

}(this));

