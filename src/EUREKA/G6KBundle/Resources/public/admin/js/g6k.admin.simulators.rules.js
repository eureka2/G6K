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

	Simulators.isStepInRules = function(id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rstep = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
			if (rstep) {
				found = rule.id;
				return false;
			}
			rstep = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
			if (rstep) {
				found = rule.id;
				return false;
			}
			rstep = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
			if (rstep) {
				found = rule.id;
				return false;
			}
			rstep = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
			if (rstep) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeStepIdInRules = function(oldId, id) {
		var objects = ['step', 'action', 'footnote', 'panel', 'fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var astep = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: oldId }]);
			if (astep) {
				astep.name = id;
			}
			astep = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: oldId }]);
			if (astep) {
				astep.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-step') && $(this).attr('data-step') == oldId) {
				$(this).attr('data-step', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rstep = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
			if (rstep) {
				rstep.value = id;
			}
			rstep = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
			if (rstep) {
				rstep.value = id;
			}
			rstep = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
			if (rstep) {
				rstep.value = id;
			}
			rstep = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
			if (rstep) {
				rstep.value = id;
			}
		});
	}

	Simulators.changeStepLabelInRules = function(id, label) {
		if (! label) {
			label = Translator.trans('Step %id% (nolabel)', { id: id });
		}
		var objects = ['step', 'action', 'footnote', 'panel', 'fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var astep = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: id }]);
			if (astep) {
				astep.label = label;
			}
			astep = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: id }]);
			if (astep) {
				astep.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-step') && $(this).attr('data-step') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-step');
				if (target == 'step') {
					action.text(' «' + label + '»');
				} else {
					action.text(' ' + Translator.trans('of step «%label%»', {'label': label } ));
				}
			}
		});
	}

	Simulators.addStepInActions = function(step) {
		var ractions = ['hideObject', 'showObject'];
		var astep = {
			label: step.label ? step.label : Translator.trans('Step %id% (nolabel)', { id: step.id }), 
			name: step.id
		};
		var istep = {
			label: Translator.trans("Is step %id% interactive ?", { id: step.id}),
			name: "step" + step.id + ".dynamic",
			fields: [
				{
					label: Translator.trans("whose label is"),
					name: "choiceId",
					fieldType: "select",
					options: [
						{
							label: Translator.trans("No"),
							name: 0
						},
						{
							label: Translator.trans("Yes"),
							name: 1
						}
					]
				}
			]
		};
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			if (objs.options.length == 0) {
				objs.options.push({
					"label": Translator.trans("step"),
					"name": "step",
					"fields": [
						{
							"label": "",
							"name": "stepId",
							"fieldType": "select",
							"options": [
								astep
							]
						}
					]
				});
				objs.options.push({
					"label": Translator.trans("choice"),
					"name": "choice",
					"fields": [
						{
							"label": Translator.trans("of data"),
							"name": "fieldName",
							"fieldType": "select",
							"options": [
								istep
							]
						}
					]
				});
			} else {
				Simulators.addInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' } ], astep);
				Simulators.addInArray(objs.options, [{ key: 'name', val: 'choice', list: 'fields' }, { key: 'name', val: 'fieldName', list: 'options' } ], istep);
			}
		});
	}

	Simulators.deleteStepInActions = function(id) {
		var objects = ['step', 'action', 'footnote', 'panel', 'fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFootNoteInRules = function(stepId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rfootnote = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
			if (rfootnote) {
				found = rule.id;
				return false;
			}
			rfootnote = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id } ]);
			if (rfootnote) {
				found = rule.id;
				return false;
			}
			rfootnote = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
			if (rfootnote) {
				found = rule.id;
				return false;
			}
			rfootnote = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
			if (rfootnote) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeFootNoteIdInRules = function(stepId, oldId, id) {
		var objects = ['footnote'];
		$.each(objects, function (k, obj) {
			var afootnote = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'footnoteId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afootnote) {
				afootnote.name = id;
			}
			afootnote = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'footnoteId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afootnote) {
				afootnote.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-footnote') && $(this).attr('data-step') == stepId && $(this).attr('data-footnote') == oldId) {
				$(this).attr('data-footnote', id);
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-footnote');
				if (target == 'footnote') {
					action.text(' «' + Translator.trans("FootNote %id%", { id: id }) + '»');
				}
			}
		});
		$.each(rules, function(r, rule) {
			var rfootnote = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
			if (rfootnote) {
				rfootnote.value = id;
			}
			rfootnote = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId } ]);
			if (rfootnote) {
				rfootnote.value = id;
			}
			rfootnote = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
			if (rfootnote) {
				rfootnote.value = id;
			}
			rfootnote = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
			if (rfootnote) {
				rfootnote.value = id;
			}
		});
	}

	Simulators.addFootNoteInActions = function(footnote) {
		var ractions = ['hideObject', 'showObject'];
		var afootnote = {
			label: Translator.trans("FootNote %id%", { id: footnote.id}), 
			name: footnote.id
		};
		var stepId = footnote.stepId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var ofootnote = Simulators.findInArray(objs.options, [{ key: 'name', val: 'footnote' }]);
			if (ofootnote) {
				var ostepfootnote = Simulators.findInArray(ofootnote.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'footnoteId' } ]);
				if (ostepfootnote) {
					ostepfootnote.options.push(afootnote);
				} else {
					Simulators.addInArray(ofootnote.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
					{
						"label": step.label,
						"name": step.name,
						"fields": [
							{
								"label": Translator.trans("whose label is"),
								"name": "footnoteId",
								"fieldType": "select",
								"options": [
									afootnote
								]
							}
						]
					});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("footnote"),
					"name": "footnote",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("whose label is"),
											"name": "footnoteId",
											"fieldType": "select",
											"options": [
												afootnote
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteFootNoteInActions = function(stepId, id) {
		var objects = ['footnote'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'footnoteId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'footnoteId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.changeActionButtonNameInRules = function(stepId, oldName, name) {
		var objects = ['action'];
		$.each(objects, function (k, obj) {
			var aaction = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId', list: 'options' }, { key: 'name', val: oldName }]);
			if (aaction) {
				aaction.name = name;
			}
			aaction = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId', list: 'options' }, { key: 'name', val: oldName }]);
			if (aaction) {
				aaction.name = name;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-action') && $(this).attr('data-step') == stepId && $(this).attr('data-action') == oldName) {
				$(this).attr('data-action', name);
			}
		});
		$.each(rules, function(r, rule) {
			var raction = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName }]);
			if (raction) {
				raction.value = name;
			}
			raction = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName } ]);
			if (raction) {
				raction.value = name;
			}
			rfootnote = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName }]);
			if (raction) {
				raction.value = name;
			}
			raction = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName }]);
			if (raction) {
				raction.value = name;
			}
		});
	}

	Simulators.changeActionButtonLabelInRules = function(stepId, name, label) {
		if (! label) {
			label = name;
		}
		var objects = ['action'];
		$.each(objects, function (k, obj) {
			var aaction = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId', list: 'options' }, { key: 'name', val: name }]);
			if (aaction) {
				aaction.label = label;
			}
			aaction = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId', list: 'options' }, { key: 'name', val: name }]);
			if (aaction) {
				aaction.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-action') && $(this).attr('data-step') == stepId && $(this).attr('data-action') == name) {
				var target = $(this).attr('data-target');
				if (target == 'action') {
					var action = $(this).find('span.action-action');
					action.text(' «' + label + '»');
				}
			}
		});
	}

	Simulators.addActionButtonInActions = function(actionbutton) {
		var ractions = ['hideObject', 'showObject'];
		var abutton = {
			label: actionbutton.label, 
			name: actionbutton.name
		};
		var stepId = actionbutton.stepId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var oaction = Simulators.findInArray(objs.options, [{ key: 'name', val: 'action' }]);
			if (oaction) {
				var ostepaction = Simulators.findInArray(oaction.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId' } ]);
				if (ostepaction) {
					ostepaction.options.push(abutton);
				} else {
					Simulators.addInArray(oaction.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
					{
						"label": step.label,
						"name": step.name,
						"fields": [
							{
								"label": Translator.trans("whose label is"),
								"name": "actionId",
								"fieldType": "select",
								"options": [
									abutton
								]
							}
						]
					});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("actionbutton"),
					"name": "action",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("whose label is"),
											"name": "actionId",
											"fieldType": "select",
											"options": [
												abutton
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteActionButtonInActions = function(stepId, name) {
		var objects = ['action'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId', list: 'options' }, { key: 'name', val: name }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'actionId', list: 'options' }, { key: 'name', val: name }]);
		});
	}

	Simulators.isActionButtonInRules = function(stepId, name) {
		var found = false;
		$.each(rules, function(r, rule) {
			var ractionbutton = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name }]);
			if (ractionbutton) {
				found = rule.id;
				return false;
			}
			ractionbutton = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name } ]);
			if (ractionbutton) {
				found = rule.id;
				return false;
			}
			ractionbutton = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name }]);
			if (ractionbutton) {
				found = rule.id;
				return false;
			}
			ractionbutton = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name }]);
			if (ractionbutton) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.isPanelInRules = function(stepId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rpanel = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
			if (rpanel) {
				found = rule.id;
				return false;
			}
			rpanel = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id } ]);
			if (rpanel) {
				found = rule.id;
				return false;
			}
			rpanel = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
			if (rpanel) {
				found = rule.id;
				return false;
			}
			rpanel = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
			if (rpanel) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changePanelIdInRules = function(stepId, oldId, id) {
		var objects = ['panel', 'fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var apanel = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: oldId }]);
			if (apanel) {
				apanel.name = id;
			}
			apanel = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: oldId }]);
			if (apanel) {
				apanel.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-panel') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == oldId) {
				$(this).attr('data-panel', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rpanel = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
			if (rpanel) {
				rpanel.value = id;
			}
			rpanel = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId } ]);
			if (rpanel) {
				rpanel.value = id;
			}
			rpanel = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
			if (rpanel) {
				rpanel.value = id;
			}
			rpanel = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
			if (rpanel) {
				rpanel.value = id;
			}
		});
	}

	Simulators.changePanelLabelInRules = function(stepId, id, label) {
		if (! label) {
			label = Translator.trans('Panel %id% (nolabel)', { id: id });
		}
		var objects = ['panel', 'fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var apanel = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: id }]);
			if (apanel) {
				apanel.label = label;
			}
			apanel = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: id }]);
			if (apanel) {
				apanel.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-panel') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-panel');
				switch (target) {
					case 'panel':
						action.text(' «' + label + '»');
						break;
					case 'fieldset':
					case 'blockinfo':
						action.text(' ' + Translator.trans('in panel «%panel%»', {'panel': label}));
						break;
					case 'chapter':
					case 'section':
					case 'field':
					case 'prenote':
					case 'postnote':
						action.text(' ' + Translator.trans('of panel «%panel%»', {'panel': label}));
						break;
				}
			}
		});
	}

	Simulators.addPanelInActions = function(panel) {
		var ractions = ['hideObject', 'showObject'];
		var apanel = {
			label: panel.label != '' ? panel.label : Translator.trans("Panel %id% (nolabel)", { id: panel.id}), 
			name: panel.id
		};
		var stepId = panel.stepId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var opanel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel' }]);
			if (opanel) {
				var osteppanel = Simulators.findInArray(opanel.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId' } ]);
				if (osteppanel) {
					osteppanel.options.push(apanel);
				} else {
					Simulators.addInArray(opanel.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
					{
						"label": step.label,
						"name": step.name,
						"fields": [
							{
								"label": Translator.trans("whose label is"),
								"name": "panelId",
								"fieldType": "select",
								"options": [
									apanel
								]
							}
						]
					});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("panel"),
					"name": "panel",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("whose label is"),
											"name": "panelId",
											"fieldType": "select",
											"options": [
												apanel
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deletePanelInActions = function(stepId, id) {
		var objects = ['panel', 'fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFieldSetInRules = function(stepId, panelId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rfieldset = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
			if (rfieldset && rfieldset.value == id) {
				found = rule.id;
				return false;
			}
			rfieldset = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
			if (rfieldset && rfieldset.value == id) {
				found = rule.id;
				return false;
			}
			rfieldset = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
			if (rfieldset && rfieldset.value == id) {
				found = rule.id;
				return false;
			}
			rfieldset = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
			if (rfieldset && rfieldset.value == id) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldSetIdInRules = function(stepId, panelId, oldId, id) {
		var objects = ['fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var afieldset = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afieldset) {
				afieldset.name = id;
			}
			afieldset = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afieldset) {
				afieldset.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-fieldset') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == oldId) {
				$(this).attr('data-fieldset', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rfieldset = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
			if (rfieldset && rfieldset.value == oldId) {
				rfieldset.value = id;
			}
			rfieldset = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
			if (rfieldset && rfieldset.value == oldId) {
				rfieldset.value = id;
			}
			rfieldset = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
			if (rfieldset && rfieldset.value == oldId) {
				rfieldset.value = id;
			}
			rfieldset = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
			if (rfieldset && rfieldset.value == oldId) {
				rfieldset.value = id;
			}
		});
	}

	Simulators.changeFieldSetLegendInRules = function(stepId, panelId, id, legend) {
		if (! legend) {
			legend = Translator.trans('Fieldset %id% (nolegend)', { id: id });
		}
		var objects = ['fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var afieldset = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: id }]);
			if (afieldset) {
				afieldset.label = legend;
			}
			afieldset = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: id }]);
			if (afieldset) {
				afieldset.label = legend;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-fieldset') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-fieldset');
				switch (target) {
					case 'fieldset':
						action.text(' «' + legend + '»');
						break;
					case 'field':
					case 'prenote':
					case 'postnote':
						action.text(' ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': legend}));
						break;
				}
			}
		});
	}

	Simulators.addFieldSetInActions = function(fieldset) {
		var ractions = ['hideObject', 'showObject'];
		var afieldset = {
			label: fieldset.legend != '' ? fieldset.legend.trim() : Translator.trans("Fieldset %id% (nolegend)", { id: fieldset.id}), 
			name: fieldset.id
		};
		var stepId = fieldset.stepId;
		var panelId = fieldset.panelId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var ofieldset = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldset' }]);
			if (ofieldset) {
				var opanelfieldset = Simulators.findInArray(ofieldset.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
				if (opanelfieldset) {
					opanelfieldset.options.push(afieldset);
				} else {
					Simulators.addInArray(ofieldset.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
						{
							"label": step.label,
							"name": step.name,
							"fields": [
								{
									"label": Translator.trans("of panel"),
									"name": "panelId",
									"fieldType": "select",
									"options": [
										{
											"label": panel.label,
											"name": panel.name,
											"fields": [
												{
													"label": Translator.trans("whose label is"),
													"name": "fieldsetId",
													"fieldType": "select",
													"options": [
														afieldset
													]
												}
											]
										}
									]
								}
							]
						});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("fieldset"),
					"name": "fieldset",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("of panel"),
											"name": "panelId",
											"fieldType": "select",
											"options": [
												{
													"label": panel.label,
													"name": panel.name,
													"fields": [
														{
															"label": Translator.trans("whose label is"),
															"name": "fieldsetId",
															"fieldType": "select",
															"options": [
																afieldset
															]
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteFieldSetInActions = function(stepId, panelId, id) {
		var objects = ['fieldset', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFieldInRules = function(stepId, panelId, fieldsetId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rfield = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
			if (rfield && rfield.value == id) {
				found = rule.id;
				return false;
			}
			rfield = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' } ]);
			if (rfield && rfield.value == id) {
				found = rule.id;
				return false;
			}
			rfield = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
			if (rfield && rfield.value == id) {
				found = rule.id;
				return false;
			}
			rfield = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
			if (rfield && rfield.value == id) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldIdInRules = function(stepId, panelId, fieldsetId, oldId, id) {
		var objects = ['field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			var afield = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afield) {
				afield.name = id;
			}
			afield = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afield) {
				afield.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-field') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-field') == oldId) {
				$(this).attr('data-field', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rfield = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
			if (rfield && rfield.value == oldId) {
				rfield.value = id;
			}
			rfield = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' } ]);
			if (rfield && rfield.value == oldId) {
				rfield.value = id;
			}
			rfield = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
			if (rfield && rfield.value == oldId) {
				rfield.value = id;
			}
			rfield = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
			if (rfield && rfield.value == oldId) {
				rfield.value = id;
			}
		});
	}

	Simulators.changeFieldLabelInRules = function(stepId, panelId, fieldsetId, position, label) {
		if (! label) {
			label = Translator.trans('Field %id% (nolabel)', { id: position });
		}
		var objects = ['field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			var afield = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			if (afield) {
				afield.label = label;
			}
			afield = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			if (afield) {
				afield.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-field') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-field') == position) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-field');
				switch (target) {
					case 'field':
						var action = $(this).find('span.action-field');
						action.text(' «' + label + '»');
						break;
					case 'prenote':
						var action = $(this).find('span.action-prenote');
						action.text(' ' + Translator.trans('of field «%label%»', {'label': label}));
						break;
					case 'postnote':
						var action = $(this).find('span.action-postnote');
						action.text(' ' + Translator.trans('of field «%label%»', {'label': label}));
						break;
				}
			}
		});
	}

	Simulators.addFieldInActions = function(field) {
		var ractions = ['hideObject', 'showObject'];
		var afield = {
			label: field.label != '' ? field.label : Translator.trans("Field %id% (nolabel)", { id: field.position}), 
			name: field.position
		};
		var stepId = field.stepId;
		var panelId = field.panelId;
		var fieldsetId = field.fieldsetId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var fieldset = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldset', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId } ]);
			var ofield = Simulators.findInArray(objs.options, [{ key: 'name', val: 'field' }]);
			if (ofield) {
				var ofieldsetfield = Simulators.findInArray(ofield.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' } ]);
				if (ofieldsetfield) {
					ofieldsetfield.options.push(afield);
				} else {
					Simulators.addInArray(ofield.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
						{
							"label": step.label,
							"name": step.name,
							"fields": [
								{
									"label": Translator.trans("of panel"),
									"name": "panelId",
									"fieldType": "select",
									"options": [
										{
											"label": panel.label,
											"name": panel.name,
											"fields": [
												{
													"label": Translator.trans("of fieldset"),
													"name": "fieldsetId",
													"fieldType": "select",
													"options": [
														{
															"label": fieldset.label,
															"name": fieldset.name,
															"fields": [
																{
																	"label": Translator.trans("whose label is"),
																	"name": "fieldId",
																	"fieldType": "select",
																	"options": [
																		afield
																	]
																}
															]
														}
													]
												}
											]
										}
									]
								}
							]
						});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("field"),
					"name": "field",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("of panel"),
											"name": "panelId",
											"fieldType": "select",
											"options": [
												{
													"label": panel.label,
													"name": panel.name,
													"fields": [
														{
															"label": Translator.trans("of fieldset"),
															"name": "fieldsetId",
															"fieldType": "select",
															"options": [
																{
																	"label": fieldset.label,
																	"name": fieldset.name,
																	"fields": [
																		{
																			"label": Translator.trans("whose label is"),
																			"name": "fieldId",
																			"fieldType": "select",
																			"options": [
																				afield
																			]
																		}
																	]
																}
															]
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteFieldInActions = function(stepId, panelId, fieldsetId, position) {
		var objects = ['field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
		});
	}

	Simulators.isBlockInfoInRules = function(stepId, panelId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rblockinfo = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
			if (rblockinfo && rblockinfo.value == id) {
				found = rule.id;
				return false;
			}
			rblockinfo = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' } ]);
			if (rblockinfo && rblockinfo.value == id) {
				found = rule.id;
				return false;
			}
			rblockinfo = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
			if (rblockinfo && rblockinfo.value == id) {
				found = rule.id;
				return false;
			}
			rblockinfo = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
			if (rblockinfo && rblockinfo.value == id) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeBlockInfoIdInRules = function(stepId, panelId, oldId, id) {
		var objects = ['blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var ablockinfo = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: oldId }]);
			if (ablockinfo) {
				ablockinfo.name = id;
			}
			ablockinfo = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: oldId }]);
			if (ablockinfo) {
				ablockinfo.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-blockinfo') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-blockinfo') == oldId) {
				$(this).attr('data-blockinfo', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rblockinfo = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
			if (rblockinfo && rblockinfo.value == oldId) {
				rblockinfo.value = id;
			}
			rblockinfo = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' } ]);
			if (rblockinfo && rblockinfo.value == oldId) {
				rblockinfo.value = id;
			}
			rblockinfo = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
			if (rblockinfo && rblockinfo.value == oldId) {
				rblockinfo.value = id;
			}
			rblockinfo = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
			if (rblockinfo && rblockinfo.value == oldId) {
				rblockinfo.value = id;
			}
		});
	}

	Simulators.changeBlockInfoLabelInRules = function(stepId, panelId, id, label) {
		if (! label) {
			label = Translator.trans('Blockinfo %id% (nolabel)', { id: id });
		}
		var objects = ['blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			var ablockinfo = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: id }]);
			if (ablockinfo) {
				ablockinfo.label = label;
			}
			ablockinfo = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: id }]);
			if (ablockinfo) {
				ablockinfo.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-blockinfo') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-blockinfo') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-blockinfo');
				switch (target) {
					case 'blockinfo':
						action.text(' «' + label + '»');
						break;
					case 'chapter':
						action.text(' ' + Translator.trans('in blockinfo «%blockinfo%»', {'blockinfo': label}));
						break;
					case 'section':
						action.text(' ' + Translator.trans('of blockinfo «%blockinfo%»', {'blockinfo': label}));
						break;
				}
			}
		});
	}

	Simulators.addBlockInfoInActions = function(blockinfo) {
		var ractions = ['hideObject', 'showObject'];
		var ablockinfo = {
			label: blockinfo.label != '' ? blockinfo.label : Translator.trans("Blockinfo %id% (nolabel)", { id: blockinfo.id}), 
			name: blockinfo.id
		};
		var stepId = blockinfo.stepId;
		var panelId = blockinfo.panelId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var oblockinfo = Simulators.findInArray(objs.options, [{ key: 'name', val: 'blockinfo' }]);
			if (oblockinfo) {
				var opanelblockinfo = Simulators.findInArray(oblockinfo.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' } ]);
				if (opanelblockinfo) {
					opanelblockinfo.options.push(ablockinfo);
				} else {
					Simulators.addInArray(oblockinfo.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
						{
							"label": step.label,
							"name": step.name,
							"fields": [
								{
									"label": Translator.trans("of panel"),
									"name": "panelId",
									"fieldType": "select",
									"options": [
										{
											"label": panel.label,
											"name": panel.name,
											"fields": [
												{
													"label": Translator.trans("whose label is"),
													"name": "blockinfoId",
													"fieldType": "select",
													"options": [
														ablockinfo
													]
												}
											]
										}
									]
								}
							]
						});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("blockinfo"),
					"name": "blockinfo",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("of panel"),
											"name": "panelId",
											"fieldType": "select",
											"options": [
												{
													"label": panel.label,
													"name": panel.name,
													"fields": [
														{
															"label": Translator.trans("whose label is"),
															"name": "blockinfoId",
															"fieldType": "select",
															"options": [
																ablockinfo
															]
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteBlockInfoInActions = function(stepId, panelId, id) {
		var objects = ['blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isChapterInRules = function(stepId, panelId, blockinfoId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rchapter = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
			if (rchapter && rchapter.value == id) {
				found = rule.id;
				return false;
			}
			rchapter = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' } ]);
			if (rchapter && rchapter.value == id) {
				found = rule.id;
				return false;
			}
			rchapter = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
			if (rchapter && rchapter.value == id) {
				found = rule.id;
				return false;
			}
			rchapter = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
			if (rchapter && rchapter.value == id) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeChapterIdInRules = function(stepId, panelId, blockinfoId, oldId, id) {
		var objects = ['chapter', 'section'];
		$.each(objects, function (k, obj) {
			var achapter = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: oldId }]);
			if (achapter) {
				achapter.name = id;
			}
			achapter = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: oldId }]);
			if (achapter) {
				achapter.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-chapter') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-blockinfo') == blockinfoId && $(this).attr('data-chapter') == oldId) {
				$(this).attr('data-chapter', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rchapter = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
			if (rchapter && rchapter.value == oldId) {
				rchapter.value = id;
			}
			rchapter = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' } ]);
			if (rchapter && rchapter.value == oldId) {
				rchapter.value = id;
			}
			rchapter = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
			if (rchapter && rchapter.value == oldId) {
				rchapter.value = id;
			}
			rchapter = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
			if (rchapter && rchapter.value == oldId) {
				rchapter.value = id;
			}
		});
	}

	Simulators.changeChapterLabelInRules = function(stepId, panelId, blockinfoId, id, label) {
		if (! label) {
			label = Translator.trans('Chapter %id% (nolabel)', { id: id });
		}
		var objects = ['chapter', 'section'];
		$.each(objects, function (k, obj) {
			var achapter = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: id }]);
			if (achapter) {
				achapter.label = label;
			}
			achapter = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: id }]);
			if (achapter) {
				achapter.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-chapter') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-blockinfo') == blockinfoId && $(this).attr('data-chapter') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-chapter');
				switch (target) {
					case 'chapter':
						action.text(' «' + label + '»');
						break;
					case 'section':
						action.text(' ' + Translator.trans('in') + ' ' + label);
						break;
				}
			}
		});
	}

	Simulators.addChapterInActions = function(chapter) {
		var ractions = ['hideObject', 'showObject'];
		var achapter = {
			label: chapter.label != '' ? chapter.label : Translator.trans("Chapter %id% (nolabel)", { id: chapter.id}), 
			name: chapter.id
		};
		var stepId = chapter.stepId;
		var panelId = chapter.panelId;
		var blockinfoId = chapter.blockinfoId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var blockinfo = Simulators.findInArray(objs.options, [{ key: 'name', val: 'blockinfo', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId } ]);
			var ochapter = Simulators.findInArray(objs.options, [{ key: 'name', val: 'chapter' }]);
			if (ochapter) {
				var oblockinfochapter = Simulators.findInArray(ochapter.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' } ]);
				if (oblockinfochapter) {
					oblockinfochapter.options.push(achapter);
				} else {
					Simulators.addInArray(ochapter.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
						{
							"label": step.label,
							"name": step.name,
							"fields": [
								{
									"label": Translator.trans("of panel"),
									"name": "panelId",
									"fieldType": "select",
									"options": [
										{
											"label": panel.label,
											"name": panel.name,
											"fields": [
												{
													"label": Translator.trans("of blockinfo"),
													"name": "blockinfoId",
													"fieldType": "select",
													"options": [
														{
															"label": blockinfo.label,
															"name": blockinfo.name,
															"fields": [
																{
																	"label": Translator.trans("whose label is"),
																	"name": "chapterId",
																	"fieldType": "select",
																	"options": [
																		achapter
																	]
																}
															]
														}
													]
												}
											]
										}
									]
								}
							]
						});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("chapter"),
					"name": "chapter",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("of panel"),
											"name": "panelId",
											"fieldType": "select",
											"options": [
												{
													"label": panel.label,
													"name": panel.name,
													"fields": [
														{
															"label": Translator.trans("of blockinfo"),
															"name": "blockinfoId",
															"fieldType": "select",
															"options": [
																{
																	"label": blockinfo.label,
																	"name": blockinfo.name,
																	"fields": [
																		{
																			"label": Translator.trans("whose label is"),
																			"name": "chapterId",
																			"fieldType": "select",
																			"options": [
																				achapter
																			]
																		}
																	]
																}
															]
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteChapterInActions = function(stepId, panelId, blockinfoId, id) {
		var objects = ['chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isSectionInRules = function(stepId, panelId, blockinfoId, chapterId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rsection = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
			if (rsection && rsection.value == id) {
				found = rule.id;
				return false;
			}
			rsection = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' } ]);
			if (rsection && rsection.value == id) {
				found = rule.id;
				return false;
			}
			rsection = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
			if (rsection && rsection.value == id) {
				found = rule.id;
				return false;
			}
			rsection = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
			if (rsection && rsection.value == id) {
				found = rule.id;
				return false;
			}
		});
		return found;
	}

	Simulators.changeSectionIdInRules = function(stepId, panelId, blockinfoId, chapterId, oldId, id) {
		var objects = ['section'];
		$.each(objects, function (k, obj) {
			var asection = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId', list: 'options' }, { key: 'name', val: oldId }]);
			if (asection) {
				asection.name = id;
			}
			asection = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId', list: 'options' }, { key: 'name', val: oldId }]);
			if (asection) {
				asection.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-section') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-blockinfo') == blockinfoId && $(this).attr('data-chapter') == chapterId && $(this).attr('data-section') == oldId) {
				$(this).attr('data-section', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rsection = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
			if (rsection && rsection.value == oldId) {
				rsection.value = id;
			}
			rsection = Simulators.findInArray(rule.ifdata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' } ]);
			if (rsection && rsection.value == oldId) {
				rsection.value = id;
			}
			rsection = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
			if (rsection && rsection.value == oldId) {
				rsection.value = id;
			}
			rsection = Simulators.findInArray(rule.elsedata, [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
			if (rsection && rsection.value == oldId) {
				rsection.value = id;
			}
		});
	}

	Simulators.changeSectionLabelInRules = function(stepId, panelId, blockinfoId, chapterId, id, label) {
		if (! label) {
			label = Translator.trans('Section %id% (nolabel)', { id: id });
		}
		var objects = ['section'];
		$.each(objects, function (k, obj) {
			var asection = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId', list: 'options' }, { key: 'name', val: id }]);
			if (asection) {
				asection.label = label;
			}
			asection = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId', list: 'options' }, { key: 'name', val: id }]);
			if (asection) {
				asection.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-section') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-blockinfo') == blockinfoId && $(this).attr('data-chapter') == chapterId && $(this).attr('data-section') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-section');
				if (target == 'section') {
					action.text(' ' + label);
				}
			}
		});
	}

	Simulators.addSectionInActions = function(section) {
		var ractions = ['hideObject', 'showObject'];
		var asection = {
			label: section.label != '' ? section.label : Translator.trans("Section %id% (nolabel)", { id: section.id}), 
			name: section.id
		};
		var stepId = section.stepId;
		var panelId = section.panelId;
		var blockinfoId = section.blockinfoId;
		var chapterId = section.chapterId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var blockinfo = Simulators.findInArray(objs.options, [{ key: 'name', val: 'blockinfo', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId } ]);
			var chapter = Simulators.findInArray(objs.options, [{ key: 'name', val: 'chapter', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId } ]);
			var osection = Simulators.findInArray(objs.options, [{ key: 'name', val: 'section' }]);
			if (osection) {
				var ochaptersection = Simulators.findInArray(osection.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' } ]);
				if (ochaptersection) {
					ochaptersection.options.push(asection);
				} else {
					Simulators.addInArray(osection.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
						{
							"label": step.label,
							"name": step.name,
							"fields": [
								{
									"label": Translator.trans("of panel"),
									"name": "panelId",
									"fieldType": "select",
									"options": [
										{
											"label": panel.label,
											"name": panel.name,
											"fields": [
												{
													"label": Translator.trans("of blockinfo"),
													"name": "blockinfoId",
													"fieldType": "select",
													"options": [
														{
															"label": blockinfo.label,
															"name": blockinfo.name,
															"fields": [
																{
																	"label": Translator.trans("of chapter"),
																	"name": "chapterId",
																	"fieldType": "select",
																	"options": [
																		{
																			"label": chapter.label,
																			"name": chapter.name,
																			"fields": [
																				{
																					"label": Translator.trans("whose label is"),
																					"name": "sectionId",
																					"fieldType": "select",
																					"options": [
																						asection
																					]
																				}
																			]
																		}
																	]
																}
															]
														}
													]
												}
											]
										}
									]
								}
							]
						});
				}
			} else {
				objs.options.push({
					"label": Translator.trans("chapter"),
					"name": "chapter",
					"fields": [
						{
							"label": Translator.trans("of step"),
							"name": "stepId",
							"fieldType": "select",
							"options": [
								{
									"label": step.label,
									"name": step.name,
									"fields": [
										{
											"label": Translator.trans("of panel"),
											"name": "panelId",
											"fieldType": "select",
											"options": [
												{
													"label": panel.label,
													"name": panel.name,
													"fields": [
														{
															"label": Translator.trans("of blockinfo"),
															"name": "blockinfoId",
															"fieldType": "select",
															"options": [
																{
																	"label": blockinfo.label,
																	"name": blockinfo.name,
																	"fields": [
																		{
																			"label": Translator.trans("of chapter"),
																			"name": "chapterId",
																			"fieldType": "select",
																			"options": [
																				{
																					"label": chapter.label,
																					"name": chapter.name,
																					"fields": [
																						{
																							"label": Translator.trans("whose label is"),
																							"name": "sectionId",
																							"fieldType": "select",
																							"options": [
																								asection
																							]
																						}
																					]
																				}
																			]
																		}
																	]
																}
															]
														}
													]
												}
											]
										}
									]
								}
							]
						}
					]
				});
			}
		});
	}

	Simulators.deleteSectionInActions = function(stepId, panelId, blockinfoId, chapterId, id) {
		var objects = ['section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId', list: 'options' }, { key: 'name', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId', list: 'options' }, { key: 'name', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.collectRuleConnector = function(conditionsPanel) {
		var conditions = conditionsPanel.find('.rule-conditions');
		var ruleId = conditions.attr('data-rule-id');
		var connector = null;
		$.each(rules, function(k, rule) {
			if (rule.id == ruleId) {
				connector = rule.connector || null;
				return false;
			}
		});
		return connector;
	}

	Simulators.collectRuleActions = function(actionsPanel) {
		var actions = [];
		actionsPanel.find('.rule-action').each(function(k, actionContainer) {
			var target = $(this).attr('data-target');
			var clause;
			switch ($(this).attr('data-name')) {
				case 'notifyError':
				case 'notifyWarning':
					clause = {
						name: 'action-select',
						value: $(this).attr('data-name'),
						fields: [
							{
								name: 'message', 
								value: $(this).attr('data-value')
							},
							{
								name: 'target', 
								value: target, 
								fields: []
							}
						]
					};
					switch (target) {
						case 'data':
							clause.fields[1].fields.push({
								name: 'fieldName',
								value: Simulators.findDataNameById($(this).attr('data-data'))
							});
							break;
						case 'datagroup':
							clause.fields[1].fields.push({
								name: 'datagroupName',
								value: $(this).attr('data-datagroup')
							});
							break;
						case 'datset':
							break;
					}
					break;
				case 'hideObject':
				case 'showObject':
					switch (target) {
						case 'field':
						case 'prenote':
						case 'postnote':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId',
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'panelId', 
														value: $(this).attr('data-panel'), 
														fields: [
															{
																name: 'fieldsetId', 
																value: $(this).attr('data-fieldset'),
																fields: [
																	{
																		name: 'fieldId',
																		value: $(this).attr('data-field')
																	}
																]
															}
														]
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'section':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId',
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'panelId', 
														value: $(this).attr('data-panel'), 
														fields: [
															{
																name: 'blockinfoId', 
																value: $(this).attr('data-blockinfo'), 
																fields: [
																	{
																		name: 'chapterId', 
																		value: $(this).attr('data-chapter'),
																		fields: [
																			{
																				name: 'sectionId',
																				value: $(this).attr('data-section')
																			}
																		]
																	}
																]
															}
														]
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'chapter':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId',
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'panelId', 
														value: $(this).attr('data-panel'), 
														fields: [
															{
																name: 'blockinfoId', 
																value: $(this).attr('data-blockinfo'), 
																fields: [
																	{
																		name: 'chapterId', 
																		value: $(this).attr('data-chapter')
																	}
																]
															}
														]
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'fieldset':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'panelId', 
														value: $(this).attr('data-panel'), 
														fields: [
															{
																name: 'fieldsetId', 
																value: $(this).attr('data-fieldset')
															}
														]
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'blockinfo':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'panelId', 
														value: $(this).attr('data-panel'), 
														fields: [
															{
																name: 'blockinfoId', 
																value: $(this).attr('data-blockinfo')
															}
														]
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'panel':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'panelId', 
														value: $(this).attr('data-panel') 
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'step':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step')
											}
										]
									}
								]
							};
							break;
						case 'footnote':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'footnoteId', 
														value: $(this).attr('data-footnote')
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'action':
							clause = {
								name: 'action-select', 
								value: $(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{
												name: 'stepId', 
												value: $(this).attr('data-step'), 
												fields: [
													{
														name: 'actionId', 
														value: $(this).attr('data-action')
													}
												]
											}
										]
									}
								]
							};
							break;
						case 'choice':
							clause = {
								name: 'action-select', 
								value:	$(this).attr('data-name'), 
								fields: [
									{
										name: 'objectId', 
										value: target, 
										fields: [
											{	name: 'fieldName', 
												value: Simulators.findDataNameById($(this).attr('data-data')),
												fields: [
													{
														name: 'choiceId', 
														value: $(this).attr('data-choice')
													}
												]
											}
										]
									}
								]
							};
							break;
					}
					break;
				case 'setAttribute':
					clause = {
						name: 'action-select', 
						value: 'setAttribute', 
						fields: [
							{
								name: 'attributeId', 
								value: target, 
								fields: [
									{
										name: 'fieldName', 
										value: Simulators.findDataNameById($(this).attr('data-data')), 
										fields: [
											{
												name: 'newValue', 
												value: $(this).attr('data-value')
											}
										]
									}
								]
							}
						]
					};
					break;
			}
			actions.push(clause);
		}); 
		return actions;
	}

	Simulators.findRuleIndexByName = function(name) {
		var ruleIndex = -1;
		$.each(rules, function(index, rule) {
			if (rule.name == name) {
				ruleIndex = index;
				return false;
			}
		});
		return ruleIndex;
	}

	Simulators.renumberRules = function() {
		$.each(rules, function(index, rule) {
			rule.id = index + 1;
			$('#' + rule.elementId).find('span.rule-id').html(rule.id);
		});
	}

	Simulators.sortRulesFromUI = function() {
		var newRules = [];
		$("#business-rules").children('div.rule-container').each(function(index) {
			var name = $(this).find('.input-rule-name').val()
			if (rules[index].name == name) {
				newRules.push(rules[index]);
			} else {
				var i = Simulators.findRuleIndexByName(name);
				rules[i].id = index + 1;
				$(this).find('span.rule-id').html(rules[i].id);
				newRules.push(rules[i]);
			}
		});
		rules = newRules;
	}

	Simulators.bindSortableRules = function() {
		$("#business-rules").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				Simulators.sortRulesFromUI();
			}
		});
	}

	Simulators.maxRuleId = function() {
		var maxId = 0;
		$.each(rules, function(k, rule) {
			if (rule.id > maxId) {
				maxId = rule.id;
			}
		});
		return maxId;
	}

	Simulators.bindRuleButtons = function(container) {
		if (! container ) {
			container = $("#simulator");
		}
		container.find('button.edit-rule').click(function(e) {
		    e.preventDefault();
			Simulators.editRule($($(this).attr('data-parent')));
		});
		container.find('button.delete-rule').click(function(e) {
		    e.preventDefault();
			Simulators.deleteRule($($(this).attr('data-parent')));
		});
	}

	Simulators.bindRule = function(rule) {
		var ruleContainer = $('#' + rule.elementId);
		ruleContainer.find('.conditions').conditionsBuilder({
			fields: Simulators.dataset,
			expressionOptions: Simulators.expressionOptions,
			conditions: rule.conditions,
			connector: rule.connector
		});
		ruleContainer.find('.add-if-action').removeClass('update-button').show();
		ruleContainer.find('.if-actions').actionsBuilder({
			fields: Simulators.dataset,
			expressionOptions: Simulators.expressionOptions,
			addButton: ruleContainer.find('.add-if-action'),
			actions: actions,
			data: rule.ifdata
		});
		ruleContainer.find('.add-else-action').removeClass('update-button').show();
		ruleContainer.find('.else-actions').actionsBuilder({
			fields: Simulators.dataset,
			expressionOptions: Simulators.expressionOptions,
			addButton: ruleContainer.find('.add-else-action'),
			actions: actions,
		    data: rule.elsedata
		});
		ruleContainer.find("> div > button.delete-rule").click(function(e) {
		    e.preventDefault();
			var r = Simulators.findRuleIndexByName(rule.name);
			$(this).parents('div.rule-container').remove();
			rules.splice(r, 1);
			Simulators.renumberRules();
		});
		ruleContainer.find('.input-rule-name').bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				$(this).trigger("change");
			}
		});
		ruleContainer.find('.input-rule-name').bind('input propertychange', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
			}, 0);
		});
		ruleContainer.find('.input-rule-name').bind('paste', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
				$(this).focusNextInputField();
			}, 0);
		});
		ruleContainer.find('.input-rule-name').change(function () {
			ruleContainer.find('.rule-name').text($(this).val());
		});

		ruleContainer.find('.input-rule-label').bind("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				$(this).trigger("change");
			}
		});
		ruleContainer.find('.input-rule-label').bind('input propertychange', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
			}, 0);
		});
		ruleContainer.find('.input-rule-label').bind('paste', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
				$(this).focusNextInputField();
			}, 0);
		});
		ruleContainer.find('.input-rule-label').change(function () {
			ruleContainer.find('.rule-label').text($(this).val());
		});
		ruleContainer.find('.cancel-edit-rule').click(function() {
			ruleContainer.replaceWith(Simulators.ruleBackup);
			Simulators.ruleBackup.find('button.edit-rule').click(function(e) {
				e.preventDefault();
				Simulators.editRule($($(this).attr('data-parent')));
			});
			Simulators.ruleBackup.find('button.delete-rule').click(function(e) {
				e.preventDefault();
				Simulators.deleteRule($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		ruleContainer.find('.cancel-add-rule').click(function() {
			ruleContainer.remove();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		ruleContainer.find('.validate-add-rule, .validate-edit-rule').click(function() {
			var conditions = ruleContainer.find('.conditions').conditionsBuilder("conditions");
			var editedrule = {
				id: ruleContainer.find('.rule-id').text(),
				name: ruleContainer.find('.input-rule-name').val(),
				label: ruleContainer.find('.input-rule-label').val(),
				conditions: conditions,
				connector: conditions,
				ifdata: ruleContainer.find('.if-actions').actionsBuilder("actions"),
				elsedata:ruleContainer.find('.else-actions').actionsBuilder("actions")
			};
			if (editedrule.conditions.all && editedrule.conditions.all.length == 1) {
				editedrule.conditions = editedrule.conditions.all[0];
			} else if (editedrule.conditions.any && editedrule.conditions.any.length == 1) {
				editedrule.conditions = editedrule.conditions.any[0];
			}
			if (editedrule.connector.all && editedrule.connector.all.length == 1) {
				editedrule.connector = editedrule.connector.all[0];
			} else if (editedrule.connector.any && editedrule.connector.any.length == 1) {
				editedrule.connector = editedrule.connector.any[0];
			}
			$.each(rules, function(k, rule) {
				if (rule.id == editedrule.id) {
					rules[k] = editedrule;
					return false;
				}
			});
			var newContainer = Simulators.drawRuleForDisplay(editedrule);
			ruleContainer.replaceWith(newContainer);
			Simulators.bindRuleButtons(newContainer);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newContainer.offset().top }, 500);
			Simulators.updating = false;
		});
	}

	Simulators.drawRuleForDisplay = function(rule) {
		var ruleElementId = 'rule-' + Math.floor(Math.random() * 100000);
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'panel panel-info sortable rule-container' });
		ruleContainer.append('<div class="panel-heading" role="tab"><button class="btn btn-info pull-right update-button delete-rule">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-info pull-right update-button edit-rule">' + Translator.trans('Edit') + ' <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">#<span class="rule-id">' + rule.id + '</span> Rule <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'panel-body panel-collapse collapse in', role: 'tabpanel' });
		var conditionsPanel = $('<div class="panel panel-default conditions-panel"></div>');
		conditionsPanel.append('<div class="panel-heading"><h4>' + Translator.trans('When ...') + '</h4></div>');
		var conditionsPanelBody = $('<div class="panel-body"></div>');
		var conditions = jQuery.extend(true, {}, rule.connector)
		Simulators.plainConditions(conditions);
		conditionsPanelBody.append('<ul class="rule-conditions" data-value="' + conditions + '" data-rule-element-id="' + ruleElementId + '" data-rule-id="' + rule.id + '">' + Simulators.drawConditionForDisplay(conditions) + '</ul>');
		conditionsPanel.append(conditionsPanelBody);
		ruleBody.append(conditionsPanel);
		if (rule.ifdata.length > 0) {
			var actionsPanel = $('<div class="panel panel-default if-actions-panel"></div>');
			actionsPanel.append('<div class="panel-heading"><h4>' + Translator.trans('then do ...') + '</h4></div>');
			var actionsPanelBody = $('<div class="panel-body"></div>');
			$.each(rule.ifdata, function(a, action) {
				var actionContainer = Simulators.drawRuleActionForDisplay(action);
				actionsPanelBody.append(actionContainer);
			});
			actionsPanel.append(actionsPanelBody);
			ruleBody.append(actionsPanel);
		}
		if (rule.elsedata.length > 0) {
			var actionsPanel = $('<div class="panel panel-default else-actions-panel"></div>');
			actionsPanel.append('<div class="panel-heading"><h4>' + Translator.trans('else do ...') + '</h4></div>');
			var actionsPanelBody = $('<div class="panel-body"></div>');
			$.each(rule.elsedata, function(a, action) {
				var actionContainer = Simulators.drawRuleActionForDisplay(action);
				actionsPanelBody.append(actionContainer);
			});
			actionsPanel.append(actionsPanelBody);
			ruleBody.append(actionsPanel);
		}
		ruleContainer.append(ruleBody);
		return ruleContainer;
	}

	Simulators.drawConditionsForDisplay = function(conditions) {
		var conditionContainers = [];
		$.each(conditions, function(c, condition) {
			conditionContainers.push(Simulators.drawConditionForDisplay(condition));
		});
		return conditionContainers.join('');
	}

	Simulators.drawConditionForDisplay = function(condition) {
		var conditionContainer = "";
		if (condition.all) {
			conditionContainer = '<li class="condition">' + Translator.trans('All of the following conditions are met') + ' :<ul>' + Simulators.drawConditionsForDisplay(condition.all) + '</ul></li>';
		} else if (condition.any) {
			conditionContainer = '<li class="condition">' + Translator.trans('Any of the following conditions is met') + ' :<ul>' + Simulators.drawConditionsForDisplay(condition.any) + '</ul></li>';
		} else if (condition.none) {
			conditionContainer = '<li class="condition">' + Translator.trans('None of the following conditions is met') + ' :<ul>' + Simulators.drawConditionsForDisplay(condition.none) + '</ul></li>';
		} else {
			conditionContainer = '<li class="condition">«' + condition.name + '» ' + condition.operator + ' ' + condition.value + '</li>';
		}
		return conditionContainer;
	}

	Simulators.getPlainOperator = function(operator, type) {
		var operators = {
			'=': Translator.trans('is equal to'),
			'!=': Translator.trans('is not equal to'),
			'>': Translator.trans('is greater than'),
			'>=': Translator.trans('is greater than or equal to'),
			'<': Translator.trans('is less than'),
			'<=': Translator.trans('is less than or equal to'),
			'isTrue': Translator.trans('is true'),
			'isFalse': Translator.trans('is false'),
			'~': Translator.trans('contains'),
			'!~': Translator.trans('not contains'),
			'matches': Translator.trans('matches'),
			'present': Translator.trans('is present'),
			'blank': Translator.trans('is not present')
		};
		var dateOperators = {
			'=': Translator.trans('is'),
			'!=': Translator.trans('is not'),
			'>': Translator.trans('is after'),
			'>=': Translator.trans('is not before'),
			'<': Translator.trans('is before'),
			'<=': Translator.trans('is not after'),
			'~': Translator.trans('contains'),
			'!~': Translator.trans('not contains'),
			'present': Translator.trans('is present'),
			'blank': Translator.trans('is not present')
		};
		if (type == 'date' || type == 'day' || type == 'month' || type == 'year') {
			return dateOperators[operator] ? dateOperators[operator] : operator;
		} else {
			return operators[operator] ? operators[operator] : operator;
		}
	}

	Simulators.plainConditions = function(ruleData) {
		if (! $.isArray(ruleData)) {
			if (ruleData.name) {
				var matches;
				var type = 'boolean';
				if (ruleData.name === 'script') {
					ruleData["name"] = Translator.trans('Javascript');
					ruleData["operator"] = Translator.trans('is');
					ruleData["value"] = ruleData.value == 1 ? Translator.trans('enabled') : Translator.trans('disabled');
				} else if (ruleData.name === 'dynamic') {
					ruleData["name"] = Translator.trans('User Interface');
					ruleData["operator"] =  ruleData.value == 1 ? Translator.trans('is') : Translator.trans('is not');
					ruleData["value"] = Translator.trans('interactive');
				} else if (matches = ruleData.name.match(/step(\d+)\.dynamic$/)) {
					ruleData["name"] = Translator.trans('User Interface for step %id%', { 'id': matches[1] });
					ruleData["operator"] =  ruleData.value == 1 ? Translator.trans('is') : Translator.trans('is not');
					ruleData["value"] = Translator.trans('interactive');
				} else if (matches = ruleData.name.match(/^#(\d+)$/)) {
					var data = Simulators.findDataById(matches[1]);
					type = data.type;
					ruleData["name"] = data.label;
					if (data.type === 'choice') {
						var label = Simulators.getChoiceLabel(data, ruleData.value);
						if (label != "") {
							ruleData["value"] = '«' + label + '»';
						}
					}
				} else {
					var data = Simulators.dataset[ruleData.name];
					type = data.type;
					ruleData["name"] = data.label;
					if (data.type === 'choice') {
						var label = Simulators.getChoiceLabel(data, ruleData.value);
						if (label != "") {
							ruleData["value"] = '«' + label + '»';
						}
					}
				}
				if (ruleData.operator) {
					ruleData["operator"] = Simulators.getPlainOperator(ruleData.operator, type);
				}
				if (ruleData.value) {
					ruleData["value"] = Simulators.replaceByDataLabel(ruleData.value);
				}
			} else if (ruleData.all) {
				Simulators.plainConditions(ruleData.all);
			} else if (ruleData.any) {
				Simulators.plainConditions(ruleData.any);
			} else if (ruleData.none) {
				Simulators.plainConditions(ruleData.none);
			}
		} else {
			$.each(ruleData, function(i, cond) {
				Simulators.plainConditions(ruleData[i]);
			});
		}
	}

	Simulators.drawRuleActionForDisplay = function(ruleAction) {
		var name = ruleAction.value;
		var target = "";
		var data = null;
		var datagroup = null;
		var step = "";
		var panel = "";
		var fieldset = "";
		var blockinfo = "";
		var field = "";
		var chapter = "";
		var section = "";
		var prenote = "";
		var postnote = "";
		var footnote = "";
		var action = "";
		var choice = "";
		var value = "";
		switch (name) {
			case 'notifyError':
			case 'notifyWarning':
				target = ruleAction.fields[1].value;
				value = ruleAction.fields[0].value;
				switch (target) {
					case 'data':
						data = Simulators.dataset[ruleAction.fields[1].fields[0].value];
						break;
					case 'datagroup':
						datagroup = Simulators.datagroups[ruleAction.fields[1].fields[0].value];
						break;
					case 'dataset':
						break;
				}
				break;
			case 'setAttribute':
				target = ruleAction.fields[0].value;
				value = ruleAction.fields[0].fields[0].fields[0].value;
				data = Simulators.dataset[ruleAction.fields[0].fields[0].value];
				break;
			case 'hideObject':
			case 'showObject':
				target = ruleAction.fields[0].value;
				step = ruleAction.fields[0].fields[0].value;
				switch (target) {
					case 'field':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						field = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'prenote':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						prenote = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'postnote':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						postnote = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'section':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						blockinfo = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						chapter = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						section = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'chapter':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						blockinfo = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						chapter = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'fieldset':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'blockinfo':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						blockinfo = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'panel':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						break;
					case 'footnote':
						footnote = ruleAction.fields[0].fields[0].fields[0].value;
						break;
					case 'action':
						action = ruleAction.fields[0].fields[0].fields[0].value;
						break;
					case 'choice':
						choice = ruleAction.fields[0].fields[0].fields[0].value;
						data = ruleAction.fields[0].fields[0].value;
						break;
				}
				break;
		}
		var actionContainer = $('<div>', { 'class': 'rule-action', 'data-id': '', 'data-name': name, 'data-target': target, 'data-data': data, 'data-datagroup': datagroup, 'data-step': step, 'data-panel': panel, 'data-fieldset': fieldset, 'data-field': field, 'data-blockinfo': blockinfo, 'data-chapter': chapter, 'data-section': section, 'data-prenote': prenote, 'data-postnote': postnote, 'data-action': action, 'data-footnote': footnote, 'data-choice': choice, 'data-value': value });
		if (name === 'notifyError' || name === 'notifyWarning') {
			var actionName = name === 'notifyError' ? Translator.trans('notify Error') : Translator.trans('notify Warning');
			actionContainer.append('<span class="action-name">' + actionName + ' : </span> <span class="action-value">«' + Simulators.replaceByDataLabel(value) + '»</span> <span class="action-target"> ' + Translator.trans('on') + ' ' + Translator.trans(target) + ' </span>');
			if (target === 'data') {
				actionContainer.append('<span class="action-data">«' + data.label + '»</span>');
			} else if (target === 'datagroup') {
				actionContainer.append('<span class="action-datagroup">«' + datagroup.label + '»</span>');
			}
		} else if (name === 'hideObject' || name === 'showObject') {
			var actionNode = Simulators.findAction(name, actions);
			actionContainer.append('<span class="action-name">' + (name === 'hideObject' ? Translator.trans('hide') : Translator.trans('show')) + '</span>');
			var optionNode = Simulators.findActionOption('objectId', target, actionNode);;
			actionContainer.append('<span class="action-target"> ' + Translator.trans(target) + '</span>');
			switch (target) {
				case 'step':
					actionContainer.append('<span class="action-step"> «' + Simulators.findActionField([{stepId: step}], optionNode).label + '»</span>');
					break;
				case 'panel':
					actionContainer.append('<span class="action-panel"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'fieldset':
					actionContainer.append('<span class="action-fieldset"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('in panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'blockinfo':
					actionContainer.append('<span class="action-blockinfo"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {blockinfoId: blockinfo}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('in panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'chapter':
					actionContainer.append('<span class="action-chapter"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {blockinfoId: blockinfo}, {chapterId: chapter}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-blockinfo"> ' + Translator.trans('in blockinfo «%blockinfo%»', {'blockinfo': Simulators.findActionField([{stepId: step}, {panelId: panel}, {blockinfoId: blockinfo}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'section':
					actionContainer.append('<span class="action-section"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {blockinfoId: blockinfo}, {chapterId: chapter}, {sectionId: section}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-chapter"> ' + Translator.trans('in') + ' ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {blockinfoId: blockinfo}, {chapterId: chapter}], optionNode).label + '</span>');
					actionContainer.append('<span class="action-blockinfo"> ' + Translator.trans('of blockinfo «%blockinfo%»', {'blockinfo': Simulators.findActionField([{stepId: step}, {panelId: panel}, {blockinfoId: blockinfo}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'field':
					actionContainer.append('<span class="action-field"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: field}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'prenote':
					actionContainer.append('<span class="action-prenote"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: field}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'postnote':
					actionContainer.append('<span class="action-postnote"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: field}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'footnote':
					actionContainer.append('<span class="action-footnote"> «' + Simulators.findActionField([{stepId: step}, {footnoteId: footnote}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'action':
					actionContainer.append('<span class="action-action"> «' + Simulators.findActionField([{stepId: step}, {actionId: action}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'choice':
					actionContainer.append('<span class="action-choice"> «' + Simulators.findActionField([data, choice], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-data"> ' + Translator.trans('of data «%label%»', {'label': Simulators.dataset[data].label}) + '</span>');
					break;
			}
		} else if (name === 'setAttribute') {
			actionContainer.append('<span class="action-name">' + Translator.trans('set') + '</span> <span class="action-target">' + Translator.trans(target) + '</span> <span class="action-data"> '+ Translator.trans('of «%label%»', {'label': data.label }) + '</span> <span class="action-value"> ' + Translator.trans('to') + ' ' + Translator.trans(Simulators.replaceByDataLabel(value)) + '</span>');
		}
		return actionContainer;
	}

	Simulators.findAction = function(name, fromNode) {
		for (var i=0; i < fromNode.length; i++) {
			var action = fromNode[i];
			if (action.name == name) {
				return action;
			}
		}
		return null;
	}

	Simulators.findActionField = function(fields, currentNode) {
		for (var f = 0; f < fields.length; f++) {
			var name = Object.keys(fields[f])[0];
			var value = fields[f][name];
			currentNode = Simulators.findActionOption(name, value, currentNode);
			if (!currentNode) { 
				return null; 
			}
		}
		return currentNode;
	}

	Simulators.findActionOption = function(name, value, node) {
		var fields = node.fields || [];
		for (var f = 0; f < fields.length; f++) {
			var field = fields[f];
			if (field.name == name) {
				var options = field.options || [];
				for (var i = 0; i < options.length; i++) {
					var option = options[i];
					if (option.name == value) {
						return option;
					}
				}
			}
		}
		return null;
	}

	Simulators.drawRuleForInput = function(rule) {
		var ruleElementId = 'rule-' + Math.floor(Math.random() * 100000);
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'panel panel-info sortable rule-container' });
		ruleContainer.append('<div class="panel-heading" role="tab"><button class="btn btn-info pull-right update-button delete-rule">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">#<span class="rule-id">' + rule.id + '</span> ' + Translator.trans('Rule') + ' <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'panel-body panel-collapse collapse', role: 'tabpanel' });
		ruleContainer.append(ruleBody);
		ruleBody.append('<div class="panel panel-default"><div class="panel-body form-inline"><div class="form-group"><label>' + Translator.trans('Name') + '</label><input type="text" class="input-rule-name" value="' + rule.name + '" /></div><div class="form-group"><label>' + Translator.trans('Label') + '</label><input type="text" class="input-rule-label" value="' + rule.label + '" /></div></div></div>');
		ruleBody.append('<div class="panel panel-default"><div class="panel-heading"><h4>' + Translator.trans('When ...') + '</h4></div><div class="panel-body"><div class="conditions"></div></div></div>');
		ruleBody.append('<div class="panel panel-default"><div class="panel-heading"><button class="btn btn-info pull-right update-button add-if-action">' + Translator.trans('Add Action') + ' <span class="glyphicon glyphicon-plus-sign"></span></button><h4>' + Translator.trans('then do ...') + '</h4></div><div class="panel-body"><div class="if-actions"></div></div></div>');
		ruleBody.append('<div class="panel panel-default"><div class="panel-heading"><button class="btn btn-info pull-right update-button add-else-action">' + Translator.trans('Add Action') + ' <span class="glyphicon glyphicon-plus-sign"></span></button><h4>' + Translator.trans('else do ...') + '</h4></div><div class="panel-body"><div class="else-actions"></div></div></div>');
		var ruleButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + ruleElementId + '-buttons-panel"></div>');
		var ruleButtonsBody = $('<div class="panel-body rule-buttons"></div>');
		ruleButtonsBody.append('<button class="btn btn-success pull-right validate-edit-rule">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		ruleButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-rule">' + Translator.trans('Cancel') + '</span></button>');
		ruleButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		ruleButtonsPanel.append(ruleButtonsBody);
		ruleBody.append(ruleButtonsPanel);
		return ruleContainer;
	}

	Simulators.addRule = function(ruleContainerGroup) {
		var id = Simulators.maxRuleId()+ 1;
		var rule = {
			id: id,
			name: 'R' + id,
			label: '',
			conditions: '',
			connector: null,
			ifdata: [],
			elsedata: []
		};
		rules.push(rule);
		var ruleContainer = Simulators.drawRuleForInput(rule);
		ruleContainer.find('button.cancel-edit-rule').addClass('cancel-add-rule').removeClass('cancel-edit-rule');
		ruleContainer.find('button.validate-edit-rule').addClass('validate-add-rule').removeClass('validate-edit-rule');
		$("#business-rules").append(ruleContainer);
		rule.elementId = ruleContainer.attr('id');
		Simulators.bindRule(rule);
		ruleContainerGroup.find('a[data-toggle="collapse"]').each(function() {
			var objectID=$(this).attr('href');
			if($(objectID).hasClass('in')===false) {
				$(objectID).collapse('show');
			}
		});
		$("html, body").animate({ scrollTop: ruleContainer.offset().top }, 500);
		$('.update-button').hide();
		$('.toggle-collapse-all').hide();
		Simulators.updating = true;
	}

	Simulators.editRule = function(ruleDisplayContainer) {
		var	rule = {
			id: ruleDisplayContainer.find('.rule-id').text(),
			name: ruleDisplayContainer.find('.rule-name').text(),
			label: ruleDisplayContainer.find('.rule-label').text(),
			conditions: ruleDisplayContainer.find('.rule-conditions').attr("data-value"),
			connector: Simulators.collectRuleConnector(ruleDisplayContainer.find('.conditions-panel')),
			ifdata: Simulators.collectRuleActions(ruleDisplayContainer.find('.if-actions-panel')),
			elsedata: Simulators.collectRuleActions(ruleDisplayContainer.find('.else-actions-panel'))
		};
		var ruleInputContainer = Simulators.drawRuleForInput(rule);
		rule.elementId = ruleInputContainer.attr('id');
		ruleDisplayContainer.after(ruleInputContainer);
		Simulators.ruleBackup = ruleDisplayContainer.detach();
		Simulators.bindRule(rule);
		ruleInputContainer.find('> .panel-heading a').click();
		$("html, body").animate({ scrollTop: ruleInputContainer.offset().top }, 500);
		$('.update-button').hide();
		$('.toggle-collapse-all').hide();
		Simulators.updating = true;
	}

	Simulators.deleteRule = function(ruleContainer) {
		var ruleLabel = ruleContainer.find('.rule-label').text();
		bootbox.confirm({
			title: Translator.trans('Deleting rule'),
			message: Translator.trans("Are you sure you want to delete the rule : %label% ?", { 'label': ruleLabel }), 
			callback: function(confirmed) {
				if (confirmed) {
					ruleContainer.remove();
					$('.save-simulator').show();
					Admin.updated = true;
				}
			}
		}); 
	}

	Simulators.collectRules = function() {
		var rulesData = [];
		$('#business-rules .rule-container').each(function(r) {
			var ruleId =  $(this).find('.rule-conditions').attr('data-rule-id');
			$.each(rules, function(k, rule) {
				if (rule.id == ruleId) {
					rulesData.push(rule);
					return false;
				}
			});
		});
		return rulesData;
	}

}(this));

