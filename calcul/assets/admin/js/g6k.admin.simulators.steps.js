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
		var re1 = new RegExp('#(' + id + '\\b|' + id + '(L))', 'g');
		var re2 = new RegExp('\\<data\\s+([^\\s]*\\s*)value=\\"' + id + '\\"', 'g');
		var found = false;
		$.each(steps, function(s, step) {
			if (re1.test(step.description.content)) {
				found = step.id;
				return false;
			}
			if (re2.test(step.description.content)) {
				found = step.id;
				return false;
			}
			if (step.footNotes && step.footNotes.footNotes) {
				$.each(step.footNotes.footNotes, function(fn, footnote) {
					if (re1.test(footnote.text.content)) {
						found = step.id;
						return false;
					}
					if (re2.test(footnote.text.content)) {
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
						if (re1.test(block.legend.content)) {
							found = step.id;
							return false;
						}
						if (re2.test(block.legend.content)) {
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
										if (re1.test(field.Note.text.content)) {
											found = step.id;
											return false;
										}
										if (re2.test(field.Note.text.content)) {
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
									if (re1.test(field.Note.text.content)) {
										found = step.id;
										return false;
									}
									if (re2.test(field.Note.text.content)) {
										found = step.id;
										return false;
									}
								}
							});
						}
					} else { // blockinfo
						$.each(block.chapters || [], function(c, chapter) {
							$.each(chapter.sections || [], function(sn, section) {
								if (re1.test(section.content.content)) {
									found = step.id;
									return false;
								}
								if (re2.test(section.content.content)) {
									found = step.id;
									return false;
								}
								if (re1.test(section.annotations.content)) {
									found = step.id;
									return false;
								}
								if (re2.test(section.annotations.content)) {
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
		var re1 = new RegExp('#(' + oldId + '\\b|' + oldId + '(L))', 'g');
		var re2 = new RegExp('\\<data\\s+([^\\s]*\\s*)value=\\"' + oldId + '\\"', 'g');
		$.each(steps, function(s, step) {
			if (re1.test(step.description.content)) {
				step.description.content = step.description.content.replace(re1, "#" + id + '$2');
			}
			if (re2.test(step.description.content)) {
				step.description.content = step.description.content.replace(re2, '<data $1value="' + id + '"');
			}
			if (step.footNotes && step.footNotes.footNotes) {
				$.each(step.footNotes.footNotes, function(fn, footnote) {
					if (re1.test(footnote.text.content)) {
						footnote.text.content = footnote.text.content.replace(re1, "#" + id + '$2');
					}
					if (re2.test(footnote.text.content)) {
						footnote.text.content = footnote.text.content.replace(re2, '<data $1value="' + id + '"');
					}
				});
			}
			$.each(step.panels || [], function(p, panel) {
				$.each(panel.blocks || [], function(b, block) {
					if (block.type == 'fieldset') {
						if (re1.test(block.legend.content)) {
							block.legend.content = block.legend.content.replace(re1, "#" + id + '$2');
						}
						if (re2.test(block.legend.content)) {
							block.legend.content = block.legend.content.replace(re2, '<data $1value="' + id + '"');
						}
						if (block.fieldrows) {
							$.each(block.fieldrows || [], function(fr, fieldrow) {
								$.each(fieldrow.fields, function(f, field) {
									if (field.data == oldId) {
										field.data = id;
									}
									if (field.Note && field.Note.text) {
										if (re1.test(field.Note.text.content)) {
											field.Note.text.content = field.Note.text.content.replace(re1, "#" + id + '$2');
										}
										if (re2.test(field.Note.text.content)) {
											field.Note.text.content = field.Note.text.content.replace(re2, '<data $1value="' + id + '"');
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
									if (re1.test(field.Note.text.content)) {
										field.Note.text.content = field.Note.text.content.replace(re1, "#" + id + '$2');
									}
									if (re2.test(field.Note.text.content)) {
										field.Note.text.content = field.Note.text.content.replace(re2, '<data $1value="' + id + '"');
									}
								}
							});
						}
					} else { // blockinfo
						$.each(block.chapters || [], function(c, chapter) {
							$.each(chapter.sections || [], function(sn, section) {
								if (re1.test(section.content.content)) {
									section.content.content = section.content.content.replace(re1, "#" + id + '$2');
								}
								if (re2.test(section.content.content)) {
									section.content.content = section.content.content.replace(re2, '<data $1value="' + id + '"');
								}
								if (re1.test(section.annotations.content)) {
									section.annotations.content = section.annotations.content.replace(re1, "#" + id + '$2');
								}
								if (re2.test(section.annotations.content)) {
									section.annotations.content = section.annotations.content.replace(re2, '<data $1value="' + id + '"');
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

	Simulators.isFootnoteIdReferenced = function(stepId, id) {
		var re1 = new RegExp("\\[[^\\^]+\\^" + id + '\\([^\\)]+\\)\\]', 'g');
		var re2 = new RegExp('\\<dfn\\s+([^\\s]*\\s*)data-footnote=\\"' + id + '\\"', 'g');
		var found = false;
		$('#simulator-options-panel').find('[data-attribute=label]').each(function() {
			if (re1.test($(this).text()) || re2.test($(this).text())) {
				found = Translator.trans("The label of the simulator contains a reference to this footnote");
				return false;
			}
		});
		if (found === false) {
			$('#step-' + stepId).find('.step-container').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.step-container');
					found = Translator.trans("The label of the step #%id% contains a reference to this footnote", {
						id: container.attr('data-id')
					});
					return false;
				}
			});
		}
		if (found === false) {
			$('#step-' + stepId).find('.panel-container').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.panel-container');
					found = Translator.trans("The label of the panel #%id% of step #%stepId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId: container.attr('data-step')
					});
					return false;
				}
			});
		}
		if (found === false) {
			$('#step-' + stepId).find('.field-container').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.field-container');
					if (container.attr('data-fieldrow')) {
						found = Translator.trans("The label of the field #%id% of step #%stepId% / panel %panelId% / fieldset #%fieldsetId% / fieldrow #%fieldrowId% contains a reference to this footnote", {
							id: container.attr('data-id'),
							stepId : container.attr('data-step'),
							panelId : container.attr('data-panel'),
							fieldsetId : container.attr('data-fieldset'),
							fieldrowId : container.attr('data-fieldrow')
						});
					} else {
						found = Translator.trans("The label of the field #%id% of step #%stepId% / panel #%panelId% / fieldset #%fieldsetId% contains a reference to this footnote", {
							id: container.attr('data-id'),
							stepId : container.attr('data-step'),
							panelId : container.attr('data-panel'),
							fieldsetId : container.attr('data-fieldset')
						});
					}
					return false;
				}
			});
		}
		if (found === false) {
			$('#step-' + stepId).find('.column-container').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.column-container');
					found = Translator.trans("The label of the column #%id% of step #%stepId% / panel %panelId% / fieldset #%fieldsetId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step'),
						panelId : container.attr('data-panel'),
						fieldsetId : container.attr('data-fieldset')
					});
					return false;
				}
			});
		}
		if (found === false) {
			$('#step-' + stepId).find('.block-container.blockinfo').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.block-container.blockinfo');
					found = Translator.trans("The label of the blockinfo #%id% of step #%stepId% / panel #%panelId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step'),
						panelId : container.attr('data-panel')
					});
					return false;
				}
			});
		}
		if (found === false) {
			$('#step-' + stepId).find('.chapter-container').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.chapter-container');
					found = Translator.trans("The label of the chapter #%id% of step #%stepId% / panel %panelId% / blockinfo #%blockinfoId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step'),
						panelId : container.attr('data-panel'),
						blockinfoId : container.attr('data-blockinfo')
					});
					return false;
				}
			});
		}
		if (found === false) {
			$('#step-' + stepId).find('.section-container').find('[data-attribute=label]').each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.section-container');
					found = Translator.trans("The label of the section #%id% of step #%stepId% / panel %panelId% / blockinfo #%blockinfoId% / chapter #%chapterId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step'),
						panelId : container.attr('data-panel'),
						blockinfoId : container.attr('data-blockinfo'),
						chapterId : container.attr('data-chapter')
					});
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#simulator-description-panel-holder').find('.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					found = Translator.trans("The description of the simulator contains a reference to this footnote");
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#simulator-related-informations-panel-holder').find('.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					found = Translator.trans("The related informations of the simulator contains a reference to this footnote");
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#step-' + stepId).find('.step-description.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.step-container');
					found = Translator.trans("The description of the step #%id% contains a reference to this footnote", {
						id: container.attr('data-id')
					});
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#step-' + stepId).find('.fieldset-legend.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.block-container.fieldset');
					found = Translator.trans("The legend of the fieldset #%id% of step #%stepId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step')
					});
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#step-' + stepId).find('.field-note.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parents('.field-container');
					if (container.attr('data-fieldrow')) {
						found = Translator.trans("The note of the field #%id% of step #%stepId% / panel %panelId% / fieldset #%fieldsetId% / fieldrow #%fieldrowId% contains a reference to this footnote", {
							id: container.attr('data-id'),
							stepId : container.attr('data-step'),
							panelId : container.attr('data-panel'),
							fieldsetId : container.attr('data-fieldset'),
							fieldrowId : container.attr('data-fieldrow')
						});
					} else {
						found = Translator.trans("The note of the field #%id% of step #%stepId% / panel #%panelId% / fieldset #%fieldsetId% contains a reference to this footnote", {
							id: container.attr('data-id'),
							stepId : container.attr('data-step'),
							panelId : container.attr('data-panel'),
							fieldsetId : container.attr('data-fieldset')
						});
					}
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#step-' + stepId).find('.section-content.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parent().prev();
					found = Translator.trans("The content of the section #%id% of step #%stepId% / panel %panelId% / blockinfo #%blockinfoId% / chapter #%chapterId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step'),
						panelId : container.attr('data-panel'),
						blockinfoId : container.attr('data-blockinfo'),
						chapterId : container.attr('data-chapter')
					});
					return false;
				}
			});
		}
		if (found === false) {
			var richtexts = $('#step-' + stepId).find('.section-annotations.rich-text');
			richtexts.each(function() {
				if (re1.test($(this).text()) || re2.test($(this).text())) {
					var container = $(this).parent().prev().prev();
					found = Translator.trans("The annotations of the section #%id% of step #%stepId% / panel %panelId% / blockinfo #%blockinfoId% / chapter #%chapterId% contains a reference to this footnote", {
						id: container.attr('data-id'),
						stepId : container.attr('data-step'),
						panelId : container.attr('data-panel'),
						blockinfoId : container.attr('data-blockinfo'),
						chapterId : container.attr('data-chapter')
					});
					return false;
				}
			});
		}
		return found;
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
				var a = panelGroup.find('> .card > .card-header').find('> h4 > a');
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
				Simulators.changeStepIdInActionButtons(oldId, 'X' + id);
				Simulators.changeStepIdInRules(oldId, 'X' + id)
			}
		});
		$.each(steps, function(index, step) {
			Simulators.changeStepIdInActionButtons('X' + step.id, step.id);
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
		var buttons = [{ 'class': 'delete-step', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }];
		if (! step.footNotes || step.footNotes.length == 0) {
			buttons.push({ 'label': Translator.trans('Add'), 'icon': 'fa-plus-circle', 'dropdown': [{ 'class': 'add-panel', 'label': Translator.trans('Add panel') }, { 'class': 'add-footnotes', 'label': Translator.trans('Add footnotes') }] });
		} else {
			buttons.push({ 'class': 'add-panel', 'label': Translator.trans('Add panel'), 'icon': 'fa-plus-circle' });
		}
		buttons.push({ 'class': 'edit-step', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' });
		var stepPanelContainer = Simulators.openCollapsiblePanel(stepElementId, Translator.trans('Step') + ' #' + step.id + ' : ' + step.label, 'info', inClass, '', buttons );
		var stepPanelBody = stepPanelContainer.find('.card-body');
		var stepContainer = $('<div class="card bg-light step-container" id="' + stepElementId + '-attributes-panel" data-id="' + step.id + '"></div>');
		var stepContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'text', 'name', Translator.trans('Step Name'), step.name, step.name, true, Translator.trans('Step Name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'text', 'label', Translator.trans('Step Label'), step.label, step.label, true, Translator.trans('Step Label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'text', 'template', Translator.trans('Step Template'), step.template, step.template, true, Translator.trans('Step Template')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'select', 'output', Translator.trans('Output'), step.output, step.output, false, Translator.trans('Select an output'), JSON.stringify(Simulators.outputTypes)));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'checkbox', 'pdfFooter', Translator.trans('Footer in PDF'), step.pdfFooter, step.pdfFooter, false, Translator.trans('Footer in PDF')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(stepElementId, 'checkbox', 'dynamic', Translator.trans('Interactive UI'), step.dynamic, step.dynamic, false, Translator.trans('Interactive UI')));
		attributesContainer.append(requiredAttributes);
		stepContainerBody.append(attributesContainer);
		stepContainerBody.append('<div class="card bg-light description-panel" id="' + stepElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body step-description rich-text" data-edition="' + step.description.edition + '">' + step.description.content + '</div></div>');
		stepContainer.append(stepContainerBody);
		stepPanelBody.append(stepContainer);
		return stepPanelContainer;
	}

	Simulators.drawStepForInput = function(step) {
		var stepElementId = 'step-' + step.id;
		var buttons = [{ 'class': 'delete-step', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }];
		if (! step.footNotes) {
			buttons.push({ 'label': Translator.trans('Add'), 'icon': 'fa-plus-circle', 'dropdown': [{ 'class': 'add-panel', 'label': Translator.trans('Add panel') }, { 'class': 'add-footnotes', 'label': Translator.trans('Add footnotes') }] });
		} else {
			buttons.push({ 'class': 'add-panel', 'label': Translator.trans('Add panel'), 'icon': 'fa-plus-circle' });
		}
		buttons.push({ 'class': 'edit-step', 'label': Translator.trans('Edit'), 'icon': 'fa-pencil' });
		var stepPanelContainer = Simulators.openCollapsiblePanel(stepElementId, Translator.trans('Step') + ' #' + step.id + ' : ' + step.label, 'info', '', '', buttons );
		var stepPanelBody = stepPanelContainer.find('.card-body');
		var stepContainer = $('<div class="card bg-light step-container" id="' + stepElementId + '-attributes-panel" data-id="' + step.id + '" data-name="' + step.name + '"></div>');
		var stepContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-name', 'text', 'name', Translator.trans('Step Name'), step.name, true, Translator.trans('Step Name')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-label', 'text', 'label', Translator.trans('Step Label'), step.label, true, Translator.trans('Step Label')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-template', 'text', 'template', Translator.trans('Step Template'), step.template, true, Translator.trans('Step Template')));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + stepElementId + '" data-type="select" data-name="output" data-placeholder="' + Translator.trans('Select an output') + '" data-options="' + encodeURI(JSON.stringify( Simulators.outputTypes )) + '">' + Translator.trans('Output') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (step.output) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-output', 'select', 'output', Translator.trans('Output'), step.output, false, Translator.trans('Select an output'), JSON.stringify( Simulators.outputTypes )));
			optionalAttribute.hide();
		} 
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + stepElementId + '" data-type="checkbox" data-name="pdfFooter" data-placeholder="' + Translator.trans('Footer in PDF') + '">' + Translator.trans('Footer in PDF') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (step.pdfFooter) {
			requiredAttributes.append(Simulators.simpleAttributeForInput(stepElementId + '-pdfFooter', 'checkbox', 'pdfFooter', Translator.trans('Footer in PDF'), step.pdfFooter, false, Translator.trans('Footer in PDF')));
			optionalAttribute.hide();
		}
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + stepElementId + '" data-type="checkbox" data-name="dynamic" data-placeholder="' + Translator.trans('Interactive UI') + '">' + Translator.trans('Interactive UI') + '</li>');
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
		stepContainerBody.append('<div class="card bg-light description-panel elements-container" id="' + stepElementId + '-description-panel"><div class="card-header">' + Translator.trans('Description') + '</div><div class="card-body"><textarea rows="5" name="' + stepElementId + '-description" id="' + stepElementId + '-description" wrap="hard" class="form-control step-description">' + Simulators.paragraphs(step.description).content + '</textarea></div></div>');
		var stepButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + stepElementId + '-buttons-panel"></div>');
		var stepButtonsBody = $('<div class="card-body step-buttons"></div>');
		stepButtonsBody.append('<button class="btn btn-success float-right validate-edit-step">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		stepButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-step">' + Translator.trans('Cancel') + '</span></button>');
		stepButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		stepButtonsPanel.append(stepButtonsBody);
		stepContainerBody.append(stepButtonsPanel);
		return stepPanelContainer;
	}

	Simulators.bindStepButtons = function(container) {
		if (! container ) {
			container = $("#collapsesteps");
		}
		container.find('button.edit-step').on('click', function(e) {
			e.preventDefault();
			Simulators.editStep($($(this).attr('data-parent')));
		});
		container.find('button.delete-step').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteStep($($(this).attr('data-parent')));
		});
		container.find('button.add-action-button').on('click', function(e) {
			e.preventDefault();
			Simulators.addActionButton($($(this).attr('data-parent')));
		});
		container.find('button.add-footnotes, a.add-footnotes').on('click', function(e) {
			e.preventDefault();
			Simulators.addFootNotes($($(this).attr('data-parent')));
		});
		container.find('button.add-panel, a.add-panel').on('click', function(e) {
			e.preventDefault();
			Simulators.addPanel($($(this).attr('data-parent')));
		});
	}

	Simulators.bindStep = function(stepPanelContainer) {
		stepPanelContainer.find('textarea').wysihtml(Admin.wysihtml5Options);
		stepPanelContainer.find('.cancel-edit-step').on('click', function() {
			stepPanelContainer.find('.step-container').replaceWith(Simulators.stepBackup);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		stepPanelContainer.find('.cancel-add-step').on('click', function() {
			stepPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		stepPanelContainer.find('.validate-edit-step, .validate-add-step').on('click', function() {
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
			if (step['name']) {
				step['name'] = $.trim(step['name']);
			}
			step.description = {
				content: Admin.clearHTML(stepPanelContainer.find('.step-description')),
				edition: 'wysihtml'
			};
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
					var title = stepPanelContainer.find('> .card > .card-header').find('> h4 > a');
					title.text(' ' + Translator.trans('Step') + ' #' + step.id + ' : ' + step.label);
					Simulators.changeStepLabelInActionButtons(id, step.name, step.label);
					Simulators.changeStepLabelInRules(id, step.label);
				}
				Simulators.updateInArray(steps, [{ key: 'id', val: id }], step);
				newStepPanel = stepPanelContainer;
			} else {
				var panelsPanel = $('<div class="card bg-light panels-panel" id="step-' + step.id + '-panels-panel"><div class="card-body sortable"></div></div>');
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
		Simulators.bindOptionalAttributes(stepPanelContainer);
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
				pdfFooter: '0',
				dynamic: '1',
				description: {
					content: '',
					edition: ''
				},
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
			console && console.log(e.message);
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
			console && console.log(e.message);
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
			var actionButton;
			if ((actionButton = Simulators.isStepIdInActionButtons(id)) !== false) {
				bootbox.alert({
					title: Translator.trans('Deleting step'),
					message: Translator.trans("This step is used in action button « %label% ». You must modify this action button before you can delete this step", { 'label': actionButton }) 
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
			console && console.log(e.message);
		}
	}

}(this));
