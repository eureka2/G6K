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

	Simulators.changeStepIdInActionButtons = function(oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'jumpToStep') {
					if (action.uri == oldId) {
						action.uri = id;
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='uri']")
						.attr('data-value', id);
					}
				} else if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == oldId) {
						functs.arguments.step = id;
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
					}
				}
			});
		});
	}


	Simulators.isStepIdInActionButtons = function(id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'jumpToStep') {
					if (action.uri == id) {
						found = action.label;
						return false;
					}
				} else if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == id) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeStepLabelInActionButtons = function(id, name, label) {
		label = label || Translator.trans('Step %id% (nolabel)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'jumpToStep') {
					if (action.uri == id) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='uri']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.changePanelIdInActionButtons = function(stepId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == oldId) {
						functs.arguments.panel = id;
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='panel']")
						.attr('data-value', id);
					}
				}
			});
		});
	}

	Simulators.changePanelLabelInActionButtons = function(stepId, id, label) {
		label = label || Translator.trans('Panel %id% (nolabel)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == id) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='panel']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.isPanelIdInActionButtons = function(stepId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == id) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldsetIdInActionButtons = function(stepId, panelId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId) {
						if (functs.arguments.fieldset && functs.arguments.fieldset == oldId) {
							functs.arguments.fieldset = id;
							action.uri = JSON.stringify(functs).replace(/"/g, "'");
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='fieldset']")
							.attr('data-value', id);
						} else if (functs.arguments.blockgroup && functs.arguments.blockgroup == oldId) {
							functs.arguments.blockgroup = id;
							action.uri = JSON.stringify(functs).replace(/"/g, "'");
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='blockgroup']")
							.attr('data-value', id);
						}
					}
				}
			});
		});
	}

	Simulators.changeFieldsetLegendInActionButtons = function(stepId, panelId, id, legend) {
		legend = legend || Translator.trans('Fieldset %id% (nolegend)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId) {
						if (functs.arguments.fieldset && functs.arguments.fieldset == id) {
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='fieldset']")
							.text(legend);
						} else if (functs.arguments.blockgroup && functs.arguments.blockgroup == id) {
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='blockgroup']")
							.text(legend);
						}
					}
				}
			});
		});
	}

	Simulators.isFieldsetIdInActionButtons = function(stepId, panelId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId) {
						if (functs.arguments.fieldset && functs.arguments.fieldset == id) {
							found = action.label;
							return false;
						} else if (functs.arguments.blockgroup && functs.arguments.blockgroup == id) {
							found = action.label;
							return false;
						}
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldrowIdInActionButtons = function(stepId, panelId, fieldsetId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						functs.arguments.fieldrow && functs.arguments.fieldrow == oldId) {
						functs.arguments.fieldrow = id;
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='fieldrow']")
						.attr('data-value', id);
					}
				}
			});
		});
	}

	Simulators.changeFieldrowLabelInActionButtons = function(stepId, panelId, fieldsetId, id, label) {
		label = label || Translator.trans('Fieldrow %id% (nolabel)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						functs.arguments.fieldrow && functs.arguments.fieldrow == id) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='fieldrow']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.isFieldrowIdInActionButtons = function(stepId, panelId, fieldsetId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						functs.arguments.fieldrow && functs.arguments.fieldrow == id) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldrowFieldPositionInActionButtons = function(stepId, panelId, fieldsetId, fieldrowId, oldPosition, position) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						functs.arguments.fieldrow && functs.arguments.fieldrow == fieldrowId &&
						((functs.arguments.field && functs.arguments.field == oldPosition) ||
						 (functs.arguments.prenote && functs.arguments.prenote == oldPosition) ||
						 (functs.arguments.postnote && functs.arguments.postnote == oldPosition))) {
						if (functs.arguments.field) {
							functs.arguments.field = position;
						} else if (functs.arguments.prenote) {
							functs.arguments.prenote = position;
						} else if (functs.arguments.postnote) {
							functs.arguments.postnote = position;
						}
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='field']")
						.attr('data-value', position);
					}
				}
			});
		});
	}

	Simulators.changeFieldrowFieldLabelInActionButtons = function(stepId, panelId, fieldsetId, fieldrowId, position, label) {
		label = label || Translator.trans('Field %id% (nolabel)', { id: position });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						functs.arguments.fieldrow && functs.arguments.fieldrow == fieldrowId &&
						((functs.arguments.field && functs.arguments.field == position) ||
						 (functs.arguments.prenote && functs.arguments.prenote == position) ||
						 (functs.arguments.postnote && functs.arguments.postnote == position))) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='field']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.isFieldrowFieldPositionInActionButtons = function(stepId, panelId, fieldsetId, fieldrowId, position) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						functs.arguments.fieldrow && functs.arguments.fieldrow == fieldrowId &&
						((functs.arguments.field && functs.arguments.field == position) ||
						 (functs.arguments.prenote && functs.arguments.prenote == position) ||
						 (functs.arguments.postnote && functs.arguments.postnote == position))) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldPositionInActionButtons = function(stepId, panelId, fieldsetId, oldPosition, position) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						((functs.arguments.field && functs.arguments.field == oldPosition) ||
						 (functs.arguments.prenote && functs.arguments.prenote == oldPosition) ||
						 (functs.arguments.postnote && functs.arguments.postnote == oldPosition))) {
						if (functs.arguments.field) {
							functs.arguments.field = position;
						} else if (functs.arguments.prenote) {
							functs.arguments.prenote = position;
						} else if (functs.arguments.postnote) {
							functs.arguments.postnote = position;
						}
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='field']")
						.attr('data-value', position);
					}
				}
			});
		});
	}

	Simulators.changeFieldLabelInActionButtons = function(stepId, panelId, fieldsetId, position, label) {
		label = label || Translator.trans('Field %id% (nolabel)', { id: position });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						((functs.arguments.field && functs.arguments.field == position) ||
						 (functs.arguments.prenote && functs.arguments.prenote == position) ||
						 (functs.arguments.postnote && functs.arguments.postnote == position))) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='field']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.isFieldPositionInActionButtons = function(stepId, panelId, fieldsetId, position) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.fieldset && functs.arguments.fieldset == fieldsetId &&
						((functs.arguments.field && functs.arguments.field == position) ||
						 (functs.arguments.prenote && functs.arguments.prenote == position) ||
						 (functs.arguments.postnote && functs.arguments.postnote == position))) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeBlockinfoIdInActionButtons = function(stepId, panelId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId) {
						if (functs.arguments.blockinfo && functs.arguments.blockinfo == oldId) {
							functs.arguments.blockinfo = id;
							action.uri = JSON.stringify(functs).replace(/"/g, "'");
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='blockinfo']")
							.attr('data-value', id);
						} else if (functs.arguments.blockgroup && functs.arguments.blockgroup == oldId) {
							functs.arguments.blockgroup = id;
							action.uri = JSON.stringify(functs).replace(/"/g, "'");
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='blockgroup']")
							.attr('data-value', id);
						}
					}
				}
			});
		});
	}

	Simulators.changeBlockinfoLabelInActionButtons = function(stepId, panelId, id, label) {
		label = label || Translator.trans('Blockinfo %id% (nolabel)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId) {
						if (functs.arguments.blockinfo && functs.arguments.blockinfo == id) {
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='blockinfo']")
							.text(label);
						} else if (functs.arguments.blockgroup && functs.arguments.blockgroup == id) {
							$('#step-' + step.id + '-action-button-' + action.name)
							.find("p[data-attribute='blockgroup']")
							.text(label);
						}
					}
				}
			});
		});
	}

	Simulators.isBlockinfoIdInActionButtons = function(stepId, panelId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId) {
						if (functs.arguments.blockinfo && functs.arguments.blockinfo == id) {
							found = action.label;
							return false;
						} else if (functs.arguments.blockgroup && functs.arguments.blockgroup == id) {
							found = action.label;
							return false;
						}
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeChapterIdInActionButtons = function(stepId, panelId, blockinfoId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.blockinfo && functs.arguments.blockinfo == blockinfoId &&
						functs.arguments.chapter && functs.arguments.chapter == oldId) {
						functs.arguments.chapter = id;
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='chapter']")
						.attr('data-value', id);
					}
				}
			});
		});
	}

	Simulators.changeChapterLabelInActionButtons = function(stepId, panelId, blockinfoId, id, label) {
		label = label || Translator.trans('Chapter %id% (nolabel)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.blockinfo && functs.arguments.blockinfo == blockinfoId &&
						functs.arguments.chapter && functs.arguments.chapter == id) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='chapter']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.isChapterIdInActionButtons = function(stepId, panelId, blockinfoId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.blockinfo && functs.arguments.blockinfo == blockinfoId &&
						functs.arguments.chapter && functs.arguments.chapter == id) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeSectionIdInActionButtons = function(stepId, panelId, blockinfoId, chapterId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.blockinfo && functs.arguments.blockinfo == blockinfoId &&
						functs.arguments.chapter && functs.arguments.chapter == chapterId &&
						((functs.arguments.section && functs.arguments.section == oldId) ||
						 (functs.arguments.content && functs.arguments.content == oldId) ||
						 (functs.arguments.annotations && functs.arguments.annotations == oldId))) {
						if (functs.arguments.section) {
							functs.arguments.section = id;
						} else if (functs.arguments.content) {
							functs.arguments.content = id;
						} else if (functs.arguments.annotations) {
							functs.arguments.annotations = id;
						}
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='section']")
						.attr('data-value', id);
					}
				}
			});
		});
	}

	Simulators.changeSectionLabelInActionButtons = function(stepId, panelId, blockinfoId, chapterId, id, label) {
		label = label || Translator.trans('Section %id% (nolabel)', { id: id });
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.blockinfo && functs.arguments.blockinfo == blockinfoId &&
						functs.arguments.chapter && functs.arguments.chapter == chapterId &&
						((functs.arguments.section && functs.arguments.section == id) ||
						 (functs.arguments.content && functs.arguments.content == id) ||
						 (functs.arguments.annotations && functs.arguments.annotations == id))) {
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='section']")
						.text(label);
					}
				}
			});
		});
	}

	Simulators.isSectionIdInActionButtons = function(stepId, panelId, blockinfoId, chapterId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.panel && functs.arguments.panel == panelId &&
						functs.arguments.blockinfo && functs.arguments.blockinfo == blockinfoId &&
						functs.arguments.chapter && functs.arguments.chapter == chapterId &&
						((functs.arguments.section && functs.arguments.section == id) ||
						 (functs.arguments.content && functs.arguments.content == id) ||
						 (functs.arguments.annotations && functs.arguments.annotations == id))) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFootnoteIdInActionButtons = function(stepId, oldId, id) {
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.footnote && functs.arguments.footnote == oldId) {
						functs.arguments.footnote = id;
						action.uri = JSON.stringify(functs).replace(/"/g, "'");
						var label = Translator.trans('FootNote #%id%', { id: id });
						$('#step-' + step.id + '-action-button-' + action.name)
						.find("p[data-attribute='footnote']")
						.attr('data-value', id).text(label);
					}
				}
			});
		});
	}

	Simulators.isFootnoteIdInActionButtons = function(stepId, id) {
		var found = false;
		$.each(steps, function(s, step) {
			$.each(step.actions, function(a, action) {
				if (action.for == 'function') {
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					if (functs.arguments.step && functs.arguments.step == stepId &&
						functs.arguments.footnote && functs.arguments.footnote == id) {
						found = action.label;
						return false;
					}
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.drawActionButtonsForDisplay = function(step) {
		var actionsElementId = 'step-' + step.id + '-action-buttons';
		var actionsPanelContainer = Simulators.openCollapsiblePanel(actionsElementId, Translator.trans('Actions Buttons'), 'success', 'in', 'sortable', [{ 'class': 'add-action-button', 'label': Translator.trans('Add action button'), 'icon': 'fa-plus-circle' }] );
		var actionsPanelBody = actionsPanelContainer.find('.card-body');
		$.each(step.actions, function(f, action) {
			action.stepId = step.id;
			actionsPanelBody.append(Simulators.drawActionButtonForDisplay(action));
		});
		return actionsPanelContainer;
	}

	Simulators.drawActionButtonForDisplay = function(action) {
		var actionElementId = 'step-' + action.stepId + '-action-button-' + action.name;
		var actionPanelContainer = Simulators.openCollapsiblePanel(actionElementId, Translator.trans('Action Button') + ' : ' + action.label, 'light', 'in', 'sortable', [{ 'class': 'delete-action-button', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-action-button', 'label': Translator.trans('Edit'), 'icon': 'fa-plus-circle' }] );
		var actionPanelBody = actionPanelContainer.find('.card-body');
		var actionContainer = $('<div class="card bg-light action-button-container" id="' + actionElementId + '-attributes-panel" data-step="' + action.stepId + '" data-id="' + action.name + '"></div>');
		var actionContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'text', 'name', Translator.trans('Name'), action.name, action.name, true, Translator.trans('Button name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'text', 'label', Translator.trans('Label'), action.label, action.label, true, Translator.trans('Button label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'shape', Translator.trans('Action shape'), action.shape, action.shape, true, Translator.trans('Select an action shape'), JSON.stringify({ 'button': Translator.trans('Button'), 'link': Translator.trans('Text link or icon') } )));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'location', Translator.trans('Location'), action.location, action.location, true, Translator.trans('Select a location'), JSON.stringify( { 'top': Translator.trans('At the top of the simulation form'), 'right': Translator.trans('On the right of the simulation form'), 'bottom': Translator.trans('At the bottom of the simulation form'), 'left': Translator.trans('On the left of the simulation form') } )));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'what', Translator.trans('What'), action.what, action.what, true, Translator.trans('Select an action'), JSON.stringify( { 'submit': Translator.trans('Submit'), 'reset': Translator.trans('Reset'), 'execute': Translator.trans('Execute') } )));
		switch (action.what) {
			case 'submit':
				requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'for', Translator.trans('For'), action.for, action.for, true, Translator.trans('Select a target step'), JSON.stringify({ 'priorStep': Translator.trans('Prior step'), 'currentStep': Translator.trans('Current step'), 'nextStep': Translator.trans('Next step'), 'jumpToStep': Translator.trans('Jump to step'), 'newSimulation': Translator.trans('New simulation'), 'externalPage': Translator.trans('External page') } )));
				if (action.for == 'jumpToStep') {
					var targetSteps = Simulators.makeTargetSteps(action.stepId);
					requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'uri', Translator.trans('Target step'), action.uri, action.uri, true, Translator.trans('Select a target step'), JSON.stringify(targetSteps)));
				} else if (action.for == 'externalPage') {
					requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'text', 'uri', Translator.trans('External page URL'), action.uri, action.uri, true, Translator.trans('External page URL')));
				}
				break;
			case 'execute':
				requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId , 'select', 'for', Translator.trans('What?'), action.for, action.for, true, Translator.trans('Select a target step'), JSON.stringify({ 'function': Translator.trans('Function') } )));
				if (action.for == 'function') { // always true
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'function', Translator.trans('Function'), functs.function, functs.function, true, Translator.trans('Select a function'), JSON.stringify(functions.labels)));
					requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'appliedto', Translator.trans('Applied to'), functs.appliedto, functs.appliedto, true, Translator.trans('Select a target'), JSON.stringify({ 'page': Translator.trans('Full page'), 'article': Translator.trans('Simulation block'), 'data': Translator.trans('Data'), 'datagroup': Translator.trans('Datagroup'), 'step': Translator.trans('Step'), 'panel': Translator.trans('Panel'), 'blockgroup': Translator.trans('Grouping of information block/group of fields'), 'fieldset': Translator.trans('FieldSet'), 'fieldrow': Translator.trans('Fieldrow'), 'field': Translator.trans('Field'), 'prenote': Translator.trans('PreNote'), 'postnote': Translator.trans('PostNote'), 'blockinfo': Translator.trans('BlockInfo'), 'chapter': Translator.trans('Chapter'), 'section': Translator.trans('Section'), 'content': Translator.trans('Section content'), 'annotations': Translator.trans('Section annotations'), 'footnote': Translator.trans('FootNote') })));
					if (functs.arguments.data) {
						var datasList = {};
						$.each(Simulators.dataset, function( name, data) {
							datasList[data.id] = data.label;
						});
						requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'data', Translator.trans('Data'), functs.arguments.data, functs.arguments.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
					} else if (functs.arguments.datagroup) {
						var datagroupsList = {};
						$.each(Simulators.datagroups, function( name, datagroup) {
							datagroupsList[datagroup.id] = datagroup.label;
						});
						requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'datagroup', Translator.trans('Datagroup'), functs.arguments.datagroup, functs.arguments.datagroup, true, Translator.trans('Select a datagroup'), JSON.stringify(datagroupsList)));
					} else if (functs.arguments.step) {
						if (functs.arguments.footnote) {
							var targetFootnotes = Simulators.makeTargetFootnotes(functs.arguments.step);
							requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'footnote', Translator.trans('Footnote'), functs.arguments.footnote, functs.arguments.footnote, true, Translator.trans('Select a footnote'), JSON.stringify(targetFootnotes)));
						} else if (functs.arguments.panel) {
							var targetPanels = Simulators.makeTargetPanels(functs.arguments.step);
							requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'panel', Translator.trans('Panel'), functs.arguments.panel, functs.arguments.panel, true, Translator.trans('Select a panel'), JSON.stringify(targetPanels)));
							if (functs.arguments.blockgroup) {
								var targetBlockGroups = Simulators.makeTargetBlockGroups(functs.arguments.step, functs.arguments.panel);
								requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'blockgroup', Translator.trans('Block belonging to the grouping'), functs.arguments.blockgroup, functs.arguments.blockgroup, true, Translator.trans('Select a block belonging to the group'), JSON.stringify(targetBlockGroups)));
							} else if (functs.arguments.fieldset) {
								var targetFieldsets = Simulators.makeTargetFieldsets(functs.arguments.step, functs.arguments.panel);
								requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'fieldset', Translator.trans('FieldSet'), functs.arguments.fieldset, functs.arguments.fieldset, true, Translator.trans('Select a fieldset'), JSON.stringify(targetFieldsets)));
								if (functs.arguments.fieldrow) {
									var targetFieldrows = Simulators.makeTargetFieldrows(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset);
									requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'fieldrow', Translator.trans('Fieldrow'), functs.arguments.fieldrow, functs.arguments.fieldrow, true, Translator.trans('Select a fieldrow'), JSON.stringify(targetFieldrows)));
								}
								if (functs.arguments.field) {
									var targetFields = Simulators.makeTargetFields(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset, functs.arguments.fieldrow);
									requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'field', Translator.trans('Field'), functs.arguments.field, functs.arguments.field, true, Translator.trans('Select a field'), JSON.stringify(targetFields)));
								} else if (functs.arguments.prenote) {
									var targetPrenotes = Simulators.makeTargetPrenotes(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset, functs.arguments.fieldrow);
									requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'field', Translator.trans('Field'), functs.arguments.prenote, functs.arguments.prenote, true, Translator.trans('Select a field'), JSON.stringify(targetPrenotes)));
								} else  if (functs.arguments.postnote) {
									var targetPostnotes = Simulators.makeTargetPostnotes(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset, functs.arguments.fieldrow);
									requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'field', Translator.trans('Field'), functs.arguments.postnote, functs.arguments.postnote, true, Translator.trans('Select a field'), JSON.stringify(targetPostnotes)));
								}
							} else if (functs.arguments.blockinfo) {
								var targetBlockinfos = Simulators.makeTargetBlockinfos(functs.arguments.step, functs.arguments.panel);
								requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'blockinfo', Translator.trans('BlockInfo'), functs.arguments.blockinfo, functs.arguments.blockinfo, true, Translator.trans('Select a blockinfo'), JSON.stringify(targetBlockinfos)));
								if (functs.arguments.chapter) {
									var targetChapters = Simulators.makeTargetChapters(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo);
									requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'chapter', Translator.trans('Chapter'), functs.arguments.chapter, functs.arguments.chapter, true, Translator.trans('Select a chapter'), JSON.stringify(targetChapters)));
									if (functs.arguments.section) {
										var targetSections = Simulators.makeTargetSections(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo, functs.arguments.chapter);
										requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'section', Translator.trans('Section'), functs.arguments.section, functs.arguments.section, true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
									} else if (functs.arguments.content) {
										var targetSections = Simulators.makeTargetSections(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo, functs.arguments.chapter);
										requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'section', Translator.trans('Section'), functs.arguments.content, functs.arguments.content, true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
									} else if (functs.arguments.annotations) {
										var targetSections = Simulators.makeTargetSections(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo, functs.arguments.chapter);
										requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId + '-argument', 'select', 'section', Translator.trans('Section'), functs.arguments.annotations, functs.arguments.annotations, true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
									}
								}
							}
						}
					}
				}
				break;
		}
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(actionElementId, 'select', 'class', Translator.trans('Class'), action.class, action.class, false, Translator.trans('Button class'), JSON.stringify({ 'btn-primary': Translator.trans('Primary'), 'btn-secondary': Translator.trans('Secondary') } )));
		attributesContainer.append(requiredAttributes);
		actionContainerBody.append(attributesContainer);
		actionContainer.append(actionContainerBody);
		actionPanelBody.append(actionContainer);
		return actionPanelContainer;
	}

	Simulators.makeTargetSteps = function(excludeStep) {
		var targetSteps = {};
		$.each(steps, function(s, step) {
			if (step.id != excludeStep) {
				var label = step.label ? step.label : Translator.trans('Step %id% (nolabel)', { id: step.id });
				targetSteps[step.id] = label;
			}
		});
		return targetSteps;
	}

	Simulators.makeTargetFootnotes = function(stepId) {
		var targetFootnotes = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId && step.footNotes && step.footNotes.footNotes) {
				$.each(step.footNotes.footNotes, function(f, footNote) {
					var label = Translator.trans('FootNote #%id%', { id: footNote.id });
					targetFootnotes[footNote.id] = label;
				});
				return false;
			}
		});
		return targetFootnotes;
	}

	Simulators.makeTargetPanels = function(stepId) {
		var targetPanels = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					var label = panel.label ? panel.label : Translator.trans('Panel %id% (nolabel)', { id: panel.id });
					targetPanels[panel.id] = label;
				});
				return false;
			}
		});
		return targetPanels;
	}

	Simulators.makeTargetBlockGroups = function(stepId, panelId) {
		var targetBlockGroups = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.display != 'inline') {
								var label;
								if (block.type == 'fieldset') {
									label = block.legend.content ? block.legend.content : Translator.trans('Fieldset %id% (nolegend)', { id: block.id });
								} else {
									label = block.label ? block.label: Translator.trans('Blockinfo %id% (nolabel)', { id: block.id });
								}
								targetBlockGroups[block.id] = label;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetBlockGroups;
	}

	Simulators.makeTargetFieldsets = function(stepId, panelId) {
		var targetFieldsets = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'fieldset') {
								var label = block.legend.content ? block.legend.content : Translator.trans('Fieldset %id% (nolegend)', { id: block.id });
								targetFieldsets[block.id] = label;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetFieldsets;
	}

	Simulators.makeTargetFieldrows = function(stepId, panelId, fieldsetId) {
		var targetFieldrows = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'fieldset' && block.id == fieldsetId && block.fieldrows) {
								$.each(block.fieldrows, function(fr, fieldrow) {
									var label = fieldrow.label ? fieldrow.label : Translator.trans('Fieldrow %id% (nolabel)', { id: fieldrow.id });
									targetFieldrows[fieldrow.id] = label;
								});
								return false;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetFieldrows;
	}

	Simulators.makeTargetFields = function(stepId, panelId, fieldsetId, fieldrowId) {
		var targetFields = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'fieldset' && block.id == fieldsetId) {
								if (fieldrowId && fieldrowId != '') {
									if (block.fieldrows) {
										$.each(block.fieldrows, function(fr, fieldrow) {
											if (fieldrow.id == fieldrowId) {
												$.each(fieldrow.fields, function(f, field) {
													var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { id: field.position });
													targetFields[field.position] = label;
												});
												return false;
											}
										});
									}
								} else {
									$.each(block.fields, function(f, field) {
										var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { id: field.position });
										targetFields[field.position] = label;
									});
									return false;
								}
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetFields;
	}

	Simulators.makeTargetPrenotes = function(stepId, panelId, fieldsetId, fieldrowId) {
		var targetPrenotes = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'fieldset' && block.id == fieldsetId) {
								if (fieldrowId && fieldrowId != '') {
									if (block.fieldrows) {
										$.each(block.fieldrows, function(fr, fieldrow) {
											if (fieldrow.id == fieldrowId) {
												$.each(fieldrow.fields, function(f, field) {
													if (field.Note && field.Note.position == 'beforeField') {
														var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { id: field.position });
														targetPrenotes[field.position] = label;
													}
												});
												return false;
											}
										});
									}
								} else {
									$.each(block.fields, function(f, field) {
										if (field.Note && field.Note.position == 'beforeField') {
											var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { id: field.position });
											targetPrenotes[field.position] = label;
										}
									});
									return false;
								}
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetPrenotes;
	}

	Simulators.makeTargetPostnotes = function(stepId, panelId, fieldsetId, fieldrowId) {
		var targetPostnotes = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'fieldset' && block.id == fieldsetId) {
								if (fieldrowId && fieldrowId != '') {
									if (block.fieldrows) {
										$.each(block.fieldrows, function(fr, fieldrow) {
											if (fieldrow.id == fieldrowId) {
												$.each(fieldrow.fields, function(f, field) {
													if (field.Note && field.Note.position == 'afterField') {
														var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { id: field.position });
														targetPostnotes[field.position] = label;
													}
												});
												return false;
											}
										});
									}
								} else {
									$.each(block.fields, function(f, field) {
										if (field.Note && field.Note.position == 'afterField') {
											var label = field.label ? field.label : Translator.trans('Field %id% (nolabel)', { id: field.position });
											targetPostnotes[field.position] = label;
										}
									});
									return false;
								}
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetPostnotes;
	}

	Simulators.makeTargetBlockinfos = function(stepId, panelId) {
		var targetBlockinfos = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'blockinfo') {
								var label = block.label ? block.label: Translator.trans('Blockinfo %id% (nolabel)', { id: block.id });
								targetBlockinfos[block.id] = label;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetBlockinfos;
	}

	Simulators.makeTargetChapters = function(stepId, panelId, blockinfoId) {
		var targetChapters = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'blockinfo' && block.id == blockinfoId) {
								$.each(block.chapters, function(c, chapter) {
									var label = chapter.label ? chapter.label : Translator.trans('Chapter %id% (nolabel)', { id: chapter.id });
									targetChapters[chapter.id] = label;
								});
								return false;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetChapters;
	}

	Simulators.makeTargetSections = function(stepId, panelId, blockinfoId, chapterId) {
		var targetSections = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'blockinfo' && block.id == blockinfoId) {
								$.each(block.chapters, function(c, chapter) {
									if (chapter.id == chapterId) {
										$.each(chapter.sections, function(s, section) {
											var label = section.label ? section.label : Translator.trans('Section %id% (nolabel)', { id: section.id });
											targetSections[section.id] = label;
										});
										return false;
									}
								});
								return false;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetSections;
	}

	Simulators.makeTargetContents = function(stepId, panelId, blockinfoId, chapterId) {
		var targetContents = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'blockinfo' && block.id == blockinfoId) {
								$.each(block.chapters, function(c, chapter) {
									if (chapter.id == chapterId) {
										$.each(chapter.sections, function(s, section) {
											if (section.content && section.content.content != '') {
												var label = section.label ? section.label : Translator.trans('Section %id% (nolabel)', { id: section.id });
												targetContents[section.id] = label;
											}
										});
										return false;
									}
								});
								return false;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetContents;
	}

	Simulators.makeTargetAnnotations = function(stepId, panelId, blockinfoId, chapterId) {
		var targetAnnotations = {};
		$.each(steps, function(s, step) {
			if (step.id == stepId) {
				$.each(step.panels, function(p, panel) {
					if (panel.id == panelId) {
						$.each(panel.blocks, function(b, block) {
							if (block.type == 'blockinfo' && block.id == blockinfoId) {
								$.each(block.chapters, function(c, chapter) {
									if (chapter.id == chapterId) {
										$.each(chapter.sections, function(s, section) {
											if (section.annotations && section.annotations.content != '') {
												var label = section.label ? section.label : Translator.trans('Section %id% (nolabel)', { id: section.id });
												targetAnnotations[section.id] = label;
											}
										});
										return false;
									}
								});
								return false;
							}
						});
						return false;
					}
				});
				return false;
			}
		});
		return targetAnnotations;
	}

	Simulators.drawActionButtonForInput = function(action) {
		var actionElementId = 'step-' + action.stepId + '-action-button-' + action.name;
		var actionPanelContainer = Simulators.openCollapsiblePanel(actionElementId, Translator.trans('Action Button') + ' : ' + action.label, 'light', 'in', 'sortable', [{ 'class': 'delete-action-button', 'label': Translator.trans('Delete'), 'icon': 'fa-minus-circle' }, { 'class': 'edit-action-button', 'label': Translator.trans('Edit'), 'icon': 'fa-plus-circle' }] );
		var actionPanelBody = actionPanelContainer.find('.card-body');
		var actionContainer = $('<div class="card bg-light action-button-container" id="' + actionElementId + '-attributes-panel" data-step="' + action.stepId + '" data-id="' + action.name + '"></div>');
		var actionContainerBody = $('<div class="card-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-name', 'text', 'name', Translator.trans('Name'), action.name, true, Translator.trans('Action button name without spaces or special characters')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-label', 'text', 'label', Translator.trans('Label'), action.label, true, Translator.trans('Action button label')));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-shape', 'select', 'shape', Translator.trans('Action shape'), action.shape, true, Translator.trans('Select an action shape'), JSON.stringify({ 'button': Translator.trans('Button'), 'link': Translator.trans('Text link or icon') })));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-location', 'select', 'location', Translator.trans('Location'), action.location, true, Translator.trans('Select a location'), JSON.stringify({ 'top': Translator.trans('At the top of the simulation form'), 'right': Translator.trans('On the right of the simulation form'), 'bottom': Translator.trans('At the bottom of the simulation form'), 'left': Translator.trans('On the left of the simulation form') })));
		requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-what', 'select', 'what', Translator.trans('What'), action.what, true, Translator.trans('Select an action'), JSON.stringify({ 'submit': Translator.trans('Submit'), 'reset': Translator.trans('Reset'), 'execute': Translator.trans('Execute') })));
		switch (action.what) {
			case 'submit':
				requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-for', 'select', 'for', Translator.trans('For'), action.for, true, Translator.trans('Select a target step'), JSON.stringify({ 'priorStep': Translator.trans('Prior step'), 'currentStep': Translator.trans('Current step'), 'nextStep': Translator.trans('Next step'), 'jumpToStep': Translator.trans('Jump to step'), 'newSimulation': Translator.trans('New simulation'), 'externalPage': Translator.trans('External page') } )));
				if (action.for == 'jumpToStep') {
					var targetSteps = Simulators.makeTargetSteps(action.stepId);
					requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-uri', 'select', 'uri', Translator.trans('Target step'), action.uri, true, Translator.trans('Select a target step'), JSON.stringify(targetSteps)));
				} else if (action.for == 'externalPage') {
					requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-uri', 'text', 'uri', Translator.trans('External page URL'), action.uri, true, Translator.trans('External page URL')));
				}
				break;
			case 'execute':
				requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-for', 'select', 'for', Translator.trans('What?'), action.for, true, Translator.trans('Select a target step'), JSON.stringify({ 'function': Translator.trans('Function') } )));
				if (action.for == 'function') { // always true
					var functs = JSON.parse(action.uri.replace(/'/g, '"'));
					requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-function', 'select', 'function', Translator.trans('Function'), functs.function, true, Translator.trans('Select a function'), JSON.stringify(functions.labels)));
					var appliedto = { 'page': Translator.trans('Full page'), 'article': Translator.trans('Simulation block'), 'data': Translator.trans('Data'), 'datagroup': Translator.trans('Datagroup'), 'panel': Translator.trans('Panel'), 'blockgroup': Translator.trans('Grouping of information block/group of fields'), 'fieldset': Translator.trans('FieldSet'), 'fieldrow': Translator.trans('Fieldrow'), 'field': Translator.trans('Field'), 'prenote': Translator.trans('PreNote'), 'postnote': Translator.trans('PostNote'), 'blockinfo': Translator.trans('BlockInfo'), 'chapter': Translator.trans('Chapter'), 'section': Translator.trans('Section'), 'content': Translator.trans('Section content'), 'annotations': Translator.trans('Section annotations'), 'footnote': Translator.trans('FootNote') };
					$.each(appliedto, function(k, v) {
						if ($.inArray(k, functions.targets[functs.function]) < 0) delete appliedto[k];
					});
					if (Object.keys(Simulators.dataset).length == 0) {
						delete appliedto['data'];
					}
					if (Object.keys(Simulators.datagroups).length == 0) {
						delete appliedto['datagroup'];
					}
					requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-appliedto', 'select', 'appliedto', Translator.trans('Applied to'), functs.appliedto, true, Translator.trans('Select a target'), JSON.stringify(appliedto)));
					if (functs.arguments.data) {
						var datasList = {};
						$.each(Simulators.dataset, function( name, data) {
							datasList[data.id] = data.label;
						});
						requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-data', 'select', 'data', Translator.trans('Data'), functs.arguments.data, true, Translator.trans('Select a data'), JSON.stringify(datasList)));
					} else if (functs.arguments.datagroup) {
						var datagroupsList = {};
						$.each(Simulators.datagroups, function( name, datagroup) {
							datagroupsList[datagroup.id] = datagroup.label;
						});
						requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-datagroup', 'select', 'datagroup', Translator.trans('Datagroup'), functs.arguments.datagroup, true, Translator.trans('Select a datagroup'), JSON.stringify(datagroupsList)));
					} else if (functs.arguments.step) {
						if (functs.arguments.footnote) {
							var targetFootnotes = Simulators.makeTargetFootnotes(functs.arguments.step);
							requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-footnote', 'select', 'footnote', Translator.trans('Footnote'), functs.arguments.footnote, true, Translator.trans('Select a footnote'), JSON.stringify(targetFootnotes)));
						} else if (functs.arguments.panel) {
							var targetPanels = Simulators.makeTargetPanels(functs.arguments.step);
							requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-panel', 'select', 'panel', Translator.trans('Panel'), functs.arguments.panel, true, Translator.trans('Select a panel'), JSON.stringify(targetPanels)));
							if (functs.arguments.blockgroup) {
								var targetBlockGroups = Simulators.makeTargetBlockGroups(functs.arguments.step, functs.arguments.panel);
								requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-blockgroup', 'select', 'blockgroup', Translator.trans('Block belonging to the grouping'), functs.arguments.blockgroup, true, Translator.trans('Select a block belonging to the group'), JSON.stringify(targetBlockGroups)));
							} else if (functs.arguments.fieldset) {
								var targetFieldsets = Simulators.makeTargetFieldsets(functs.arguments.step, functs.arguments.panel);
								requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-fieldset', 'select', 'fieldset', Translator.trans('FieldSet'), functs.arguments.fieldset, true, Translator.trans('Select a fieldset'), JSON.stringify(targetFieldsets)));
								if (functs.arguments.fieldrow) {
									var targetFieldrows = Simulators.makeTargetFieldrows(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset);
									requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-fieldrow', 'select', 'fieldrow', Translator.trans('Fieldrow'), functs.arguments.fieldrow, true, Translator.trans('Select a fieldrow'), JSON.stringify(targetFieldrows)));
								}
								if (functs.arguments.field) {
									var targetFields = Simulators.makeTargetFields(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset, functs.arguments.fieldrow);
									requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-field', 'select', 'field', Translator.trans('Field'), functs.arguments.field, true, Translator.trans('Select a field'), JSON.stringify(targetFields)));
								} else if (functs.arguments.prenote) {
									var targetPrenotes = Simulators.makeTargetPrenotes(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset, functs.arguments.fieldrow);
									requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-field', 'select', 'field', Translator.trans('Field'), functs.arguments.prenote, true, Translator.trans('Select a field'), JSON.stringify(targetPrenotes)));
								} else  if (functs.arguments.postnote) {
									var targetPostnotes = Simulators.makeTargetPostnotes(functs.arguments.step, functs.arguments.panel, functs.arguments.fieldset, functs.arguments.fieldrow);
									requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-field', 'select', 'field', Translator.trans('Field'), functs.arguments.postnote, true, Translator.trans('Select a field'), JSON.stringify(targetPostnotes)));
								}
							} else if (functs.arguments.blockinfo) {
								var targetBlockinfos = Simulators.makeTargetBlockinfos(functs.arguments.step, functs.arguments.panel);
								requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-blockinfo', 'select', 'blockinfo', Translator.trans('BlockInfo'), functs.arguments.blockinfo, true, Translator.trans('Select a blockinfo'), JSON.stringify(targetBlockinfos)));
								if (functs.arguments.chapter) {
									var targetChapters = Simulators.makeTargetChapters(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo);
									requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-chapter', 'select', 'chapter', Translator.trans('Chapter'), functs.arguments.chapter, true, Translator.trans('Select a chapter'), JSON.stringify(targetChapters)));
									if (functs.arguments.section) {
										var targetSections = Simulators.makeTargetSections(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo, functs.arguments.chapter);
										requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-section', 'select', 'section', Translator.trans('Section'), functs.arguments.section, true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
									} else if (functs.arguments.content) {
										var targetSections = Simulators.makeTargetSections(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo, functs.arguments.chapter);
										requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-section', 'select', 'section', Translator.trans('Section'), functs.arguments.content, true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
									} else if (functs.arguments.annotations) {
										var targetSections = Simulators.makeTargetSections(functs.arguments.step, functs.arguments.panel, functs.arguments.blockinfo, functs.arguments.chapter);
										requiredAttributes.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-section', 'select', 'section', Translator.trans('Section'), functs.arguments.annotations, true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
									}
								}
							}
						}
					}
				}
				break;
		}
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + actionElementId + '" data-type="text" data-name="uri" data-placeholder="' + Translator.trans('Button uri') + '">' + Translator.trans('URI / Step') + '</li>');
		optionalAttribute = $('<li class="list-group-item" tabindex="0" data-element="' + actionElementId + '" data-type="select" data-name="class" data-placeholder="' + Translator.trans('Button class') + '" data-options="' + encodeURI(JSON.stringify( { 'btn-primary': Translator.trans('Primary'), 'btn-secondary': Translator.trans('Secondary') } )) + '">' + Translator.trans('Class') + '</li>');
		optionalAttributes.append(optionalAttribute);
		if (action.class) {
			var attribute = Simulators.simpleAttributeForInput(actionElementId + '-class', 'select', 'class', Translator.trans('Class'), action.class, false, Translator.trans('Button class'), JSON.stringify({ 'btn-primary': Translator.trans('Primary'), 'btn-secondary': Translator.trans('Secondary') } ) );
			requiredAttributes.append(attribute);
			optionalAttribute.hide();
		} 
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		actionContainerBody.append(attributesContainer);
		actionContainer.append(actionContainerBody);
		actionPanelBody.append(actionContainer);
		var actionButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + actionElementId + '-buttons-panel"></div>');
		var actionButtonsBody = $('<div class="card-body action-buttons"></div>');
		actionButtonsBody.append('<button class="btn btn-success float-right validate-edit-action">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		actionButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-action">' + Translator.trans('Cancel') + '</span></button>');
		actionButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		actionButtonsPanel.append(actionButtonsBody);
		actionContainer.append(actionButtonsPanel);
		return actionPanelContainer;
	}

	Simulators.bindActionButtonButtons = function(container) {
		if (! container ) {
			container = $("#steps");
		}
		container.find('button.edit-action-button').on('click', function(e) {
			e.preventDefault();
			Simulators.editActionButton($($(this).attr('data-parent')));
		});
		container.find('button.delete-action-button').on('click', function(e) {
			e.preventDefault();
			Simulators.deleteActionButton($($(this).attr('data-parent')));
		});
	}

	Simulators.bindActionButtonWhat = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=what]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			switch($(this).val()) {
				case 'submit':
					parent.append(Simulators.simpleAttributeForInput(actionElementId + '-for', 'select', 'for', Translator.trans('For'), '', true, Translator.trans('Select a step'), JSON.stringify({ 'priorStep': Translator.trans('Prior step'), 'currentStep': Translator.trans('Current step'), 'nextStep': Translator.trans('Next step'), 'jumpToStep': Translator.trans('Jump to step'), 'newSimulation': Translator.trans('New simulation'), 'externalPage': Translator.trans('External page') } )));
					Simulators.bindActionButtonFor(actionPanelContainer);
				case 'reset':
					actionPanelContainer.find('select[data-attribute=shape]').val('button');
					break;
				case 'execute':
					parent.append(Simulators.simpleAttributeForInput(actionElementId + '-for', 'select', 'for', Translator.trans('What?'), '', true, Translator.trans('Select a function'), JSON.stringify({ 'function': Translator.trans('Function') } )));
					Simulators.bindActionButtonFor(actionPanelContainer);
					actionPanelContainer.find('select[data-attribute=for]').trigger('change');
					break;
			}
		});
	}

	Simulators.bindActionButtonFor = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=for]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			switch($(this).val()) {
				case 'priorStep':
				case 'currentStep':
				case 'nextStep':
				case 'newSimulation':
					break;
				case 'jumpToStep':
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var targetSteps = Simulators.makeTargetSteps(stepId);
					parent.append(Simulators.simpleAttributeForInput(actionElementId + '-uri', 'select', 'uri', Translator.trans('Target step'), '', true, Translator.trans('Select a target step'), JSON.stringify(targetSteps)));
					break;
				case 'externalPage':
					parent.append(Simulators.simpleAttributeForInput(actionElementId + '-uri', 'text', 'uri', Translator.trans('External page URL'), '', true, Translator.trans('External page URL')));
					break;
				case 'function':
					parent.append(Simulators.simpleAttributeForInput(actionElementId + '-function', 'select', 'function', Translator.trans('Function'), '', true, Translator.trans('Select a function'), JSON.stringify(functions.labels)));
					Simulators.bindActionButtonFunction(actionPanelContainer);
					actionPanelContainer.find('select[data-attribute=function]').trigger('change');
					break;
			}
		});
	}

	Simulators.bindActionButtonFunction = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=function]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var funct = $(this).val();
			var parent = $(this).closest('.form-group').parent();
			var appliedto = { 'page': Translator.trans('Full page'), 'article': Translator.trans('Simulation block'), 'data': Translator.trans('Data'), 'datagroup': Translator.trans('Datagroup'), 'panel': Translator.trans('Panel'), 'blockgroup': Translator.trans('Grouping of information block/group of fields'), 'fieldset': Translator.trans('FieldSet'), 'fieldrow': Translator.trans('Fieldrow'), 'field': Translator.trans('Field'), 'prenote': Translator.trans('PreNote'), 'postnote': Translator.trans('PostNote'), 'blockinfo': Translator.trans('BlockInfo'), 'chapter': Translator.trans('Chapter'), 'section': Translator.trans('Section'), 'content': Translator.trans('Section content'), 'annotations': Translator.trans('Section annotations'), 'footnote': Translator.trans('FootNote') };
			$.each(appliedto, function(k, v) {
				if ($.inArray(k, functions.targets[funct]) < 0) delete appliedto[k];
			});
			if (Object.keys(Simulators.dataset).length == 0) {
				delete appliedto['data'];
			}
			if (Object.keys(Simulators.datagroups).length == 0) {
				delete appliedto['datagroup'];
			}
			parent.append(Simulators.simpleAttributeForInput(actionElementId + '-appliedto', 'select', 'appliedto', Translator.trans('Applied to'), '', true, Translator.trans('Select a target'), JSON.stringify(appliedto)));
			Simulators.bindActionButtonAppliedto(actionPanelContainer);
			actionPanelContainer.find('select[data-attribute=appliedto]').trigger('change');
		});
	}

	Simulators.bindActionButtonAppliedto = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=appliedto]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function', 'appliedto']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			switch($(this).val()) {
				case 'page':
				case 'article':
					break;
				case 'data':
					var datasList = {};
					$.each(Simulators.dataset, function( name, data) {
						datasList[data.id] = data.label;
					});
					if (Object.keys(datasList).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-data', 'select', 'data', Translator.trans('Data'), '', true, Translator.trans('Select a data'), JSON.stringify(datasList)));
					}
					break;
				case 'datagroup':
					var datagroupsList = {};
					$.each(Simulators.datagroups, function( name, datagroup) {
						datagroupsList[datagroup.id] = datagroup.label;
					});
					if (Object.keys(datagroupsList).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-datagroup', 'select', 'datagroup', Translator.trans('Datagroup'), '', true, Translator.trans('Select a datagroup'), JSON.stringify(datagroupsList)));
					}
					break;
				case 'footnote':
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var targetFootnotes = Simulators.makeTargetFootnotes(stepId);
					if (Object.keys(targetFootnotes).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-footnote', 'select', 'footnote', Translator.trans('Footnote'), '', true, Translator.trans('Select a footnote'), JSON.stringify(targetFootnotes)));
					}
					break;
				default:
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var targetPanels = Simulators.makeTargetPanels(stepId);
					if (Object.keys(targetPanels).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-panel', 'select', 'panel', Translator.trans('Panel'), '', true, Translator.trans('Select a panel'), JSON.stringify(targetPanels)));
						Simulators.bindActionButtonPanel(actionPanelContainer);
						actionPanelContainer.find('select[data-attribute=panel]').trigger('change');
					}
					break;
			}
		});
	}

	Simulators.bindActionButtonPanel = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=panel]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function', 'appliedto', 'step', 'panel']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			var appliedTo = actionPanelContainer.find('select[data-attribute=appliedto]').val();
			switch(appliedTo) {
				case 'step':
				case 'panel':
					break;
				case 'blockinfo':
				case 'chapter':
				case 'section':
				case 'content':
				case 'annotations':
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var targetBlockinfos = Simulators.makeTargetBlockinfos(stepId, panelId);
					if (Object.keys(targetBlockinfos).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-blockinfo', 'select', 'blockinfo', Translator.trans('BlockInfo'), '', true, Translator.trans('Select a blockinfo'), JSON.stringify(targetBlockinfos)));
						Simulators.bindActionButtonBlockinfo(actionPanelContainer);
						actionPanelContainer.find('select[data-attribute=blockinfo]').trigger('change');
					}
					break;
				case 'blockgroup':
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var targetBlockGroups = Simulators.makeTargetBlockGroups(stepId, panelId);
					if (Object.keys(targetBlockGroups).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-blockgroup', 'select', 'blockgroup', Translator.trans('Block belonging to the grouping'), '', true, Translator.trans('Select a block belonging to the group'), JSON.stringify(targetBlockGroups)));
					}
					break;
				default:
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var targetFieldsets = Simulators.makeTargetFieldsets(stepId, panelId);
					if (Object.keys(targetFieldsets).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-fieldset', 'select', 'fieldset', Translator.trans('FieldSet'), '', true, Translator.trans('Select a fieldset'), JSON.stringify(targetFieldsets)));
						Simulators.bindActionButtonFieldset(actionPanelContainer);
						actionPanelContainer.find('select[data-attribute=fieldset]').trigger('change');
					}
					break;
			}
		});
	}

	Simulators.bindActionButtonBlockinfo = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=blockinfo]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function', 'appliedto', 'step', 'panel', 'blockinfo']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			var appliedTo = actionPanelContainer.find('select[data-attribute=appliedto]').val();
			switch(appliedTo) {
				case 'step':
				case 'panel':
				case 'blockinfo':
					break;
				default:
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var blockinfoId = actionPanelContainer.find('select[data-attribute=blockinfo]').val();
					var targetChapters = Simulators.makeTargetChapters(stepId, panelId, blockinfoId);
					if (Object.keys(targetChapters).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-chapter', 'select', 'chapter', Translator.trans('Chapter'), '', true, Translator.trans('Select a chapter'), JSON.stringify(targetChapters)));
						Simulators.bindActionButtonChapter(actionPanelContainer);
						actionPanelContainer.find('select[data-attribute=chapter]').trigger('change');
					}
					break;
			}
		});
	}

	Simulators.bindActionButtonChapter = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=chapter]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function', 'appliedto', 'step', 'panel', 'blockinfo', 'chapter']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			var appliedTo = actionPanelContainer.find('select[data-attribute=appliedto]').val();
			switch(appliedTo) {
				case 'step':
				case 'panel':
				case 'blockinfo':
				case 'chapter':
					break;
				default:
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var blockinfoId = actionPanelContainer.find('select[data-attribute=blockinfo]').val();
					var chapterId = actionPanelContainer.find('select[data-attribute=chapter]').val();
					var targetSections;
					if (appliedTo == 'content') {
						targetSections = Simulators.makeTargetContents(stepId, panelId, blockinfoId, chapterId);
					} else if (appliedTo == 'annotations') {
						targetSections = Simulators.makeTargetAnnotations(stepId, panelId, blockinfoId, chapterId);
					} else {
						targetSections = Simulators.makeTargetSections(stepId, panelId, blockinfoId, chapterId);
					}
					if (Object.keys(targetSections).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-section', 'select', 'section', Translator.trans('Section'), '', true, Translator.trans('Select a section'), JSON.stringify(targetSections)));
					}
					break;
			}
		});
	}

	Simulators.bindActionButtonFieldset = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=fieldset]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function', 'appliedto', 'step', 'panel', 'fieldset']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			var appliedTo = actionPanelContainer.find('select[data-attribute=appliedto]').val();
			switch(appliedTo) {
				case 'step':
				case 'panel':
				case 'fieldset':
					break;
				default:
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var fieldsetId = actionPanelContainer.find('select[data-attribute=fieldset]').val();
					var targetFieldrows = Simulators.makeTargetFieldrows(stepId, panelId, fieldsetId);
					if (Object.keys(targetFieldrows).length > 0) {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-fieldrow', 'select', 'fieldrow', Translator.trans('Fieldrow'), '', true, Translator.trans('Select a fieldrow'), JSON.stringify(targetFieldrows)));
						Simulators.bindActionButtonFieldrow(actionPanelContainer);
						actionPanelContainer.find('select[data-attribute=fieldrow]').trigger('change');
					} else if (appliedTo == 'fieldrow') {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						var targetFields;
						if (appliedTo == 'prenote') {
							targetFields = Simulators.makeTargetPrenotes(stepId, panelId, fieldsetId);
						} else if (appliedTo == 'postnote') {
							targetFields = Simulators.makeTargetPostnotes(stepId, panelId, fieldsetId);
						} else {
							targetFields = Simulators.makeTargetFields(stepId, panelId, fieldsetId);
						}
						if (Object.keys(targetFields).length == 0) {
							Simulators.showActionButtonAppliedToError(actionPanelContainer);
						} else {
							parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-field', 'select', 'field', Translator.trans('Field'), '', true, Translator.trans('Select a field'), JSON.stringify(targetFields)));
						}
					}
					break;
			}
		});
	}

	Simulators.bindActionButtonFieldrow = function(actionPanelContainer) {
		var actionElementId = actionPanelContainer.attr('id');
		actionPanelContainer.find('select[data-attribute=fieldrow]').on('change', function() {
			Simulators.hideActionButtonError(actionPanelContainer);
			actionPanelContainer.find(':input[data-attribute]').each(function() {
				var attr = $(this).attr('data-attribute');
				if ($.inArray(attr, ['name', 'label', 'shape', 'location', 'class', 'what', 'for', 'function', 'appliedto', 'step', 'panel', 'fieldset', 'fieldrow']) < 0) {
					$(this).closest('.form-group').remove();
				}
			});
			var parent = $(this).closest('.form-group').parent();
			var appliedTo = actionPanelContainer.find('select[data-attribute=appliedto]').val();
			switch(appliedTo) {
				case 'step':
				case 'panel':
				case 'fieldset':
				case 'fieldrow':
					break;
				default:
					var stepId = actionElementId.match(/^step\-(\d+)\-/)[1];
					var panelId = actionPanelContainer.find('select[data-attribute=panel]').val();
					var fieldsetId = actionPanelContainer.find('select[data-attribute=fieldset]').val();
					var fieldrowId = actionPanelContainer.find('select[data-attribute=fieldrow]').val();
					var targetFields;
					if (appliedTo == 'prenote') {
						targetFields = Simulators.makeTargetPrenotes(stepId, panelId, fieldsetId, fieldrowId);
					} else if (appliedTo == 'postnote') {
						targetFields = Simulators.makeTargetPostnotes(stepId, panelId, fieldsetId, fieldrowId);
					} else {
						targetFields = Simulators.makeTargetFields(stepId, panelId, fieldsetId, fieldrowId);
					}
					if (Object.keys(targetFields).length == 0) {
						Simulators.showActionButtonAppliedToError(actionPanelContainer);
					} else {
						parent.append(Simulators.simpleAttributeForInput(actionElementId + '-argument-field', 'select', 'field', Translator.trans('Field'), '', true, Translator.trans('Select a field'), JSON.stringify(targetFields)));
					}
					break;
			}
		});
	}

	Simulators.bindActionButton = function(actionPanelContainer) {
		actionPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		Simulators.bindActionButtonWhat(actionPanelContainer);
		Simulators.bindActionButtonFor(actionPanelContainer);
		Simulators.bindActionButtonFunction(actionPanelContainer);
		Simulators.bindActionButtonAppliedto(actionPanelContainer);
		Simulators.bindActionButtonPanel(actionPanelContainer);
		Simulators.bindActionButtonBlockinfo(actionPanelContainer);
		Simulators.bindActionButtonChapter(actionPanelContainer);
		Simulators.bindActionButtonFieldset(actionPanelContainer);
		Simulators.bindActionButtonFieldrow(actionPanelContainer);
		actionPanelContainer.find('.cancel-edit-action').on('click', function() {
			actionPanelContainer.find('.action-button-container').replaceWith(Simulators.actionButtonBackup);
			Simulators.actionButtonBackup.find('button.edit-action-button').on('click', function(e) {
				e.preventDefault();
				Simulators.editActionButton($($(this).attr('data-parent')));
			});
			Simulators.actionButtonBackup.find('button.delete-action-button').on('click', function(e) {
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
		actionPanelContainer.find('.cancel-add-action').on('click', function() {
			actionPanelContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		actionPanelContainer.find('.validate-edit-action, .validate-add-action').on('click', function() {
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
			if (action['name']) {
				action['name'] = $.trim(action['name']);
			}
			switch(action.what) {
				case 'reset':
					action.for = 'currentStep';
					break;
				case 'submit':
					break;
				case 'execute':
					var uri = {
						'function': action.function,
						'appliedto': action.appliedto,
						'arguments': {}
					};
					delete action['function'];
					switch(action.appliedto) {
						case 'data':
							uri.arguments.data = action.data;
							delete action['data'];
							break;
						case 'datagroup':
							uri.arguments.datagroup = action.datagroup;
							delete action['datagroup'];
							break;
						case 'field':
						case 'prenote':
						case 'postnote':
							if (action.field) {
								uri.arguments[action.appliedto] = action.field;
								delete action['field'];
							}
						case 'fieldrow':
							if (action.fieldrow) {
								uri.arguments.fieldrow = action.fieldrow;
								delete action['fieldrow'];
							}
						case 'fieldset':
							if (action.fieldset) {
								uri.arguments.fieldset = action.fieldset;
								delete action['fieldset'];
							}
						case 'section':
						case 'content':
						case 'annotations':
							if (action.section) {
								uri.arguments[action.appliedto] = action.section;
								delete action['section'];
							}
						case 'chapter':
							if (action.chapter) {
								uri.arguments.chapter = action.chapter;
								delete action['chapter'];
							}
						case 'blockinfo':
							if (action.blockinfo) {
								uri.arguments.blockinfo = action.blockinfo;
								delete action['blockinfo'];
							}
						case 'blockgroup':
							if (action.blockgroup) {
								uri.arguments.blockgroup = action.blockgroup;
								delete action['blockgroup'];
							}
						case 'panel':
							if (action.panel) {
								uri.arguments.panel = action.panel;
								delete action['panel'];
							}
						case 'footnote':
							if (action.footnote) {
								uri.arguments.footnote = action.footnote;
								delete action['footnote'];
							}
						default:
							uri.arguments.step = stepId;
					}
					delete action['appliedto'];
					action.uri = JSON.stringify(uri).replace(/"/g, "'");
					break;
			}
			var newActionButtonPanel = Simulators.drawActionButtonForDisplay(action);
			if ($(this).hasClass('validate-edit-action')) {
				delete action['stepId'];
				Simulators.updateInArray(steps, [{ key: 'id', val: stepId, list: 'actions' }, { key: 'name', val: oldName }], action);
				var oldLabel = Simulators.actionButtonBackup.find("p[data-attribute='label']").attr('data-value');
				if (oldName != action.name) {
					Simulators.changeActionButtonNameInRules(stepId, oldName, action.name);
					if (action.label != oldLabel) {
						Simulators.changeActionButtonLabelInRules(stepId, action.name, action.label)
					}
					actionPanelContainer.replaceWith(newActionButtonPanel);
					Simulators.bindActionButtonButtons(newActionButtonPanel);
				} else {
					actionContainer.replaceWith(newActionButtonPanel.find('.action-button-container'));
					if (action.label != oldLabel) {
						var title = actionPanelContainer.find('> .card > .card-header').find('> h4 > a');
						title.text('' + Translator.trans('Action Button') + ' : ' + action.label);
						Simulators.changeActionButtonLabelInRules(stepId, action.name, action.label)
					}
					newActionButtonPanel = actionPanelContainer;
				}
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
		Simulators.bindOptionalAttributes(actionPanelContainer);
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
		var actionWhat = $('#' + actionElementId + '-what').val();
		switch (actionWhat) {
			case 'submit':
				var actionFor = $('#' + actionElementId + '-for').val();
				if (actionFor === 'jumpToStep' || actionFor === 'externalPage') {
					var actionUri = $.trim($('#' + actionElementId + '-uri').val());
					if (actionUri === '') {
						actionContainer.find('.error-message').text(Translator.trans('The action button uri is required in this context'));
						actionContainer.find('.alert').show();
						return false;
					}
				}
			case 'reset':
				var actionShape = $('#' + actionElementId + '-shape').val();
				if (actionShape == 'link') {
					actionContainer.find('.error-message').text(Translator.trans("The action shape 'link' is not allowed in this context"));
					actionContainer.find('.alert').show();
					return false;
				}
				break;
			case 'execute':
				var appliedto = $('#' + actionElementId + '-appliedto');
				var target = appliedto.val();
				if (target != 'page' && target != 'article') {
					if (target == 'prenote' || target == 'postnote') {
						target = 'field';
					} else if (target == 'content' || target == 'annotations') {
						target = 'section';
					}
					target = $('#' + actionElementId + '-argument-' + target);
					var targetval = target.val();
					if (! targetval) {
						Simulators.showActionButtonAppliedToError(actionContainer);
						return false;
					}
				}
				break;
		}
		return true;
	}

	Simulators.showActionButtonAppliedToError = function(actionContainer) {
		var actionElementId = actionContainer.attr('id');
		var appliedto = $('#' + actionElementId + '-appliedto');
		Simulators.showActionButtonError(
			actionContainer,
			Translator.trans('The searched element « %element% » that applies to this function does not exist.', { 'element': appliedto.find('option:selected').text() } ),
			appliedto
		);
	}

	Simulators.showActionButtonError = function(actionContainer, error, appliedto) {
		appliedto.addClass('is-invalid').addClass('form-control-danger');
		actionContainer.find('.error-message').text(error);
		actionContainer.find('.alert').show();
	}

	Simulators.hideActionButtonError = function(actionContainer) {
		actionContainer.find('.is-invalid').removeClass('is-invalid');
		actionContainer.find('.error-message').text();
		actionContainer.find('.alert').hide();
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
				shape: 'button',
				location: 'bottom',
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
			console && console.log(e.message);
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
			console && console.log(e.message);
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
			console && console.log(e.message);
		}
	}

}(this));
