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

	Simulators.isDataIdInRules = function(id) {
		var inRules = false;
		var re = new RegExp('#(' + id + '\\b|' + id + '(L))', 'g');
		$.each(rules, function(r, rule) {
			if (re.test(rule.conditions)) {
				inRules = rule.id;
				return false;
			}
			if (rule.connector && Simulators.isDataIdInConnector(rule.connector, id)) {
				inRules = rule.id;
				return false;
			}
			$.each(rule.ifdata, function(a, action) {
				if (action.value == "setAttribute") {
					var val = action.fields[0].fields[0].fields[0].value;
					if (re.test(val)) {
						inRules = rule.id;
						return false;
					}
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (action.value == "setAttribute") {
					var val = action.fields[0].fields[0].fields[0].value;
					if (re.test(val)) {
						inRules = rule.id;
						return false;
					}
				}
			});
		});
		return inRules;
	}

	Simulators.changeDataIdInRules = function(oldId, id) {
		var re = new RegExp('#(' + oldId + '\\b|' + oldId + '(L))', 'g');
		var ruleConditions = $('#business-rules').find('.rule-conditions');
		ruleConditions.each(function(r) {
			if (re.test($(this).attr('data-value'))) {
				var val = $(this).attr('data-value');
				val = val.replace(re, "#" + id);
				$(this).attr('data-value', val);
			}
			var datas = $(this).find('data.data');
			datas.each(function(d) {
				if ($(this).attr('value') == oldId) {
					$(this).attr('value', id);
				}
			});
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-data') && $(this).attr('data-data') == oldId) {
				$(this).attr('data-data', id);
			}
			if (this.hasAttribute('data-name') && ($(this).attr('data-name') == "setAttribute" || $(this).attr('data-name') == "unsetAttribute") && re.test($(this).attr('data-value'))) {
				var val = $(this).attr('data-value');
				val = val.replace(re, "#" + id + '$2');
				$(this).attr('data-value', val);
			}
			var datas = $(this).find('data.data');
			datas.each(function(d) {
				if ($(this).attr('value') == oldId) {
					$(this).attr('value', id);
				}
			});
		});
		$.each(rules, function(r, rule) {
			if (re.test(rule.conditions)) {
				rule.conditions = rule.conditions.replace(re, "#" + id + '$2');
			}
			if (rule.connector) {
				Simulators.changeDataIdInConnector(rule.connector, oldId, id);
			}
			$.each(rule.ifdata, function(a, action) {
				if (action.value == "setAttribute") {
					var val = action.fields[0].fields[0].fields[0].value;
					if (re.test(val)) {
						val = val.replace(re, "#" + id);
						action.fields[0].fields[0].fields[0].value = val;
					}
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (action.value == "setAttribute") {
					var val = action.fields[0].fields[0].fields[0].value;
					if (re.test(val)) {
						val = val.replace(re, "#" + id);
						action.fields[0].fields[0].fields[0].value = val;
					}
				}
			});
		});
	}

	Simulators.isDataNameInRules = function(name) {
		var inRules = false;
		$.each(rules, function(r, rule) {
			if (rule.connector && Simulators.isDataNameInConnector(rule.connector, name)) {
				inRules = rule.id;
				return false;
			}
			$.each(rule.ifdata, function(a, action) {
				if (action.value == "setAttribute" || action.value == "unsetAttribute") {
					if (action.fields[0].fields[0].value == name) {
						inRules = rule.id;
						return false;
					}
				} else if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'data' && action.fields[1].fields[0].value == name) {
						inRules = rule.id;
						return false;
					}
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (action.value == "setAttribute" || action.value == "unsetAttribute") {
					if (action.fields[0].fields[0].value == name) {
						inRules = rule.id;
						return false;
					}
				} else if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'data' && action.fields[1].fields[0].value == name) {
						inRules = rule.id;
						return false;
					}
				}
			});
		});
		return inRules;
	}

	Simulators.changeDataNameInRules = function(oldName, name) {
		$.each(rules, function(r, rule) {
			if (rule.connector) {
				Simulators.changeDataNameInConnector(rule.connector, oldName, name);
			}
			$.each(rule.ifdata, function(a, action) {
				if (action.value == "setAttribute" || action.value == "unsetAttribute") {
					if (action.fields[0].fields[0].value == oldName) {
						action.fields[0].fields[0].value = name;
					}
				} else if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'data' && action.fields[1].fields[0].value == oldName) {
						action.fields[1].fields[0].value == name;
					}
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (action.value == "setAttribute" || action.value == "unsetAttribute") {
					if (action.fields[0].fields[0].value == oldName) {
						action.fields[0].fields[0].value = name;
					}
				} else if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'data' && action.fields[1].fields[0].value == oldName) {
						action.fields[1].fields[0].value == name;
					}
				}
			});
		});
	}

	Simulators.changeDataLabelInRules = function(id, label) {
		var rulesObj= $('#business-rules').find('.rule-conditions, .rule-action');
		rulesObj.each(function(r) {
			var datas = $(this).find('data.data');
			datas.each(function(d) {
				if ($(this).attr('value') == id) {
					$(this).text('«' + label + '»');
				}
			});
		});
	}

	Simulators.isDataIdInConnector = function(connector, id) {
		var inConnector = false;
		if (connector.all) {
			$.each(connector.all, function(c, conn) {
				if (Simulators.isDataIdInConnector(conn, id)) {
					inConnector = true;
					return false;
				}
			});
		} else if (connector.any) {
			$.each(connector.any, function(c, conn) {
				if (Simulators.isDataIdInConnector(conn, id)) {
					inConnector = true;
					return false;
				}
			});
		} else if (connector.none) {
			$.each(connector.none, function(c, conn) {
				if (Simulators.isDataIdInConnector(conn, id)) {
					inConnector = true;
					return false;
				}
			});
		} else {
			var re = new RegExp('#(' + id + '\\b|' + id + '(L))', 'g');
			if (connector.value && re.test(connector.value)) {
				inConnector = true;
			}
		}
		return inConnector;
	}

	Simulators.changeDataIdInConnector = function(connector, oldId, id) {
		if (connector.all) {
			$.each(connector.all, function(c, conn) {
				Simulators.changeDataIdInConnector(conn, oldId, id);
			});
		} else if (connector.any) {
			$.each(connector.any, function(c, conn) {
				Simulators.changeDataIdInConnector(conn, oldId, id);
			});
		} else if (connector.none) {
			$.each(connector.none, function(c, conn) {
				Simulators.changeDataIdInConnector(conn, oldId, id);
			});
		} else {
			var re = new RegExp('#(' + oldId + '\\b|' + oldId + '(L))', 'g');
			if (connector.value && re.test(connector.value)) {
				connector.value = connector.value.replace(re, "#" + id + '$2');
			}
		}
	}

	Simulators.isDataNameInConnector = function(connector, name) {
		var inConnector = false;
		if (connector.all) {
			$.each(connector.all, function(c, conn) {
				if (Simulators.isDataNameInConnector(conn, name)) {
					inConnector = true;
					return false;
				}
			});
		} else if (connector.any) {
			$.each(connector.any, function(c, conn) {
				if (Simulators.isDataNameInConnector(conn, name)) {
					inConnector = true;
					return false;
				}
			});
		} else if (connector.none) {
			$.each(connector.none, function(c, conn) {
				if (Simulators.isDataNameInConnector(conn, name)) {
					inConnector = true;
					return false;
				}
			});
		} else if (connector.name == name) {
			inConnector = true;
			return false;
		}
		return inConnector;
	}

	Simulators.changeDataNameInConnector = function(connector, oldName, name) {
		if (connector.all) {
			$.each(connector.all, function(c, conn) {
				Simulators.changeDataNameInConnector(conn, oldName, name);
			});
		} else if (connector.any) {
			$.each(connector.any, function(c, conn) {
				Simulators.changeDataNameInConnector(conn, oldName, name);
			});
		} else if (connector.none) {
			$.each(connector.none, function(c, conn) {
				Simulators.changeDataNameInConnector(conn, oldName, name);
			});
		} else if (connector.name == oldName) {
			connector.name = name;
		}
	}

	Simulators.isDatagroupNameInRules = function(name) {
		var inRules = false;
		$.each(rules, function(r, rule) {
			$.each(rule.ifdata, function(a, action) {
				if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'datagroup' && action.fields[1].fields[0].value == name) {
						inRules = rule.id;
						return false;
					}
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'datagroup' && action.fields[1].fields[0].value == name) {
						inRules = rule.id;
						return false;
					}
				}
			});
		});
		return inRules;
	}

	Simulators.changeDatagroupNameInRules = function(oldName, name) {
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-datagroup') && $(this).attr('data-datagroup') == oldName) {
				$(this).attr('data-datagroup', name);
			}
			var datas = $(this).find('data.datagroup');
			datas.each(function(d) {
				if ($(this).attr('value') == oldName) {
					$(this).attr('value', name);
				}
			});
		});
		$.each(actions, function(a, action) {
			if (action.name == "notifyError" || action.name == "notifyWarning") {
				$.each(action.fields[1].options, function(o, option) {
					if (option.name == 'datagroup') {
						$.each(option.fields, function(f, field) {
							$.each(field.options, function(o2, option2) {
								if (option2.name == oldName) {
									option2.name = name;
									return false;
								}
							});
						});
					}
				});
			}
		});
		$.each(rules, function(r, rule) {
			$.each(rule.ifdata, function(a, action) {
				if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'datagroup' && action.fields[1].fields[0].value == oldName) {
						action.fields[1].fields[0].value == name;
					}
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (action.value == "notifyError" || action.value == "notifyWarning") {
					if (action.fields[1].value == 'datagroup' && action.fields[1].fields[0].value == oldName) {
						action.fields[1].fields[0].value == name;
					}
				}
			});
		});
	}

	Simulators.changeDatagroupLabelInRules = function(name, label) {
		var rulesObj= $('#business-rules').find('.rule-action');
		rulesObj.each(function(r) {
			var datas = $(this).find('data.datagroup');
			datas.each(function(d) {
				if ($(this).attr('value') == name) {
					$(this).text('«' + label + '»');
				}
			});
		});
		$.each(actions, function(a, action) {
			if (action.name == "notifyError" || action.name == "notifyWarning") {
				$.each(action.fields[1].options, function(o, option) {
					if (option.name == 'datagroup') {
						$.each(option.fields, function(f, field) {
							$.each(field.options, function(o2, option2) {
								if (option2.name == name) {
									option2.label = label;
									return false;
								}
							});
						});
					}
				});
			}
		});
	}

	Simulators.deleteDatagroupInActions = function(name) {
		Simulators.deleteInArray(actions, [{ key: 'name', val: 'notifyError', list: 'fields' }, { key: 'name', val: 'target', list: 'options' }, { key: 'name', val: 'datagroup', list: 'fields' }, { key: 'name', val: 'datagroupName', list: 'options' }, { key: 'name', val: name }]);
		Simulators.deleteInArray(actions, [{ key: 'name', val: 'notifyWarning', list: 'fields' }, { key: 'name', val: 'target', list: 'options' }, { key: 'name', val: 'datagroup', list: 'fields' }, { key: 'name', val: 'datagroupName', list: 'options' }, { key: 'name', val: name }]);
	}

	Simulators.isStepInRules = function(id) {
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(rule.ifdata, function(a, action) {
				var rstep = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
				if (rstep) {
					found = rule.id;
					return false;
				}
				rstep = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
				if (rstep) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
			$.each(rule.elsedata, function(a, action) {
				var rstep = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
				if (rstep) {
					found = rule.id;
					return false;
				}
				rstep = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: id }]);
				if (rstep) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeStepIdInRules = function(oldId, id) {
		var objects = ['step', 'action', 'footnote', 'panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
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
			$.each(rule.ifdata, function(a, action) {
				var rstep = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
				if (rstep) {
					rstep.value = id;
				}
				rstep = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
				if (rstep) {
					rstep.value = id;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				var rstep = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
				if (rstep) {
					rstep.value = id;
				}
				rstep = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: oldId }]);
				if (rstep) {
					rstep.value = id;
				}
			});
		});
	}

	Simulators.changeStepLabelInRules = function(id, label) {
		if (! label) {
			label = Translator.trans('Step %id% (nolabel)', { id: id });
		}
		var objects = ['step', 'action', 'footnote', 'panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
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
		var objects = ['step', 'action', 'footnote', 'panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: id }]);
		});
	}


	Simulators.isFootNoteInRules = function(stepId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(rule.ifdata, function(a, action) {
				var rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
				if (rfootnote) {
					found = rule.id;
					return false;
				}
				rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id } ]);
				if (rfootnote) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
			$.each(rule.elsedata, function(a, action) {
				var rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
				if (rfootnote) {
					found = rule.id;
					return false;
				}
				rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
				if (rfootnote) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
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
			$.each(rule.ifdata, function(a, action) {
				var rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
				if (rfootnote) {
					rfootnote.value = id;
				}
				rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId } ]);
				if (rfootnote) {
					rfootnote.value = id;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				var rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
				if (rfootnote) {
					rfootnote.value = id;
				}
				rfootnote = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'footnote', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
				if (rfootnote) {
					rfootnote.value = id;
				}
			});
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
			$.each(rule.ifdata, function(a, action) {
				var raction = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName }]);
				if (raction) {
					raction.value = name;
				}
				raction = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName } ]);
				if (raction) {
					raction.value = name;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				var raction = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName }]);
				if (raction) {
					raction.value = name;
				}
				raction = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldName }]);
				if (raction) {
					raction.value = name;
				}
			});
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
			$.each(rule.ifdata, function(a, action) {
				var ractionbutton = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name }]);
				if (ractionbutton) {
					found = rule.id;
					return false;
				}
				ractionbutton = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name } ]);
				if (ractionbutton) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
			$.each(rule.elsedata, function(a, action) {
				var ractionbutton = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name }]);
				if (ractionbutton) {
					found = rule.id;
					return false;
				}
				ractionbutton = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'action', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: name }]);
				if (ractionbutton) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.isPanelInRules = function(stepId, id) {
		var objects = ['panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(objects, function(o, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
					if (rpanel) {
						found = rule.id;
						return false;
					}
					rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, {  key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id } ]);
					if (rpanel) {
						found = rule.id;
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
				$.each(rule.elsedata, function(a, action) {
					var rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, {  key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
					if (rpanel) {
						found = rule.id;
						return false;
					}
					rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, {  key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: id }]);
					if (rpanel) {
						found = rule.id;
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

	Simulators.changePanelIdInRules = function(stepId, oldId, id) {
		var objects = ['panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
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
			$.each(objects, function(o, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
					if (rpanel) {
						rpanel.value = id;
					}
					rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId } ]);
					if (rpanel) {
						rpanel.value = id;
					}
				});
				$.each(rule.elsedata, function(a, action) {
					var rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
					if (rpanel) {
						rpanel.value = id;
					}
					rpanel = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: oldId }]);
					if (rpanel) {
						rpanel.value = id;
					}
				});
			});
		});
	}

	Simulators.changePanelLabelInRules = function(stepId, id, label) {
		if (! label) {
			label = Translator.trans('Panel %id% (nolabel)', { id: id });
		}
		var objects = ['panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
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
					case 'choice':
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
		var objects = ['panel', 'fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFieldSetInRules = function(stepId, panelId, id) {
		var objects = ['fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote'];
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(objects, function(o, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
					if (rfieldset && rfieldset.value == id) {
						found = rule.id;
						return false;
					}
					rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
					if (rfieldset && rfieldset.value == id) {
						found = rule.id;
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
				$.each(rule.elsedata, function(a, action) {
					var rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
					if (rfieldset && rfieldset.value == id) {
						found = rule.id;
						return false;
					}
					rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' }]);
					if (rfieldset && rfieldset.value == id) {
						found = rule.id;
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

	Simulators.changeFieldSetIdInRules = function(stepId, panelId, oldId, id) {
		var objects = ['fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote'];
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
			$.each(objects, function(o, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
					if (rfieldset && rfieldset.value == oldId) {
						rfieldset.value = id;
					}
					rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
					if (rfieldset && rfieldset.value == oldId) {
						rfieldset.value = id;
					}
				});
				$.each(rule.elsedata, function(a, action) {
					var rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
					if (rfieldset && rfieldset.value == oldId) {
						rfieldset.value = id;
					}
					rfieldset = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId' } ]);
					if (rfieldset && rfieldset.value == oldId) {
						rfieldset.value = id;
					}
				});
			});
		});
	}

	Simulators.changeFieldSetLegendInRules = function(stepId, panelId, id, legend) {
		if (! legend) {
			legend = Translator.trans('Fieldset %id% (nolegend)', { id: id });
		}
		var objects = ['fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
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
					case 'choice':
						action.text(' ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': legend}));
						break;
				}
			}
		});
	}

	Simulators.addFieldSetInActions = function(fieldset) {
		var ractions = ['hideObject', 'showObject'];
		var afieldset = {
			label: fieldset.legend.content != '' ? fieldset.legend.content.trim() : Translator.trans("Fieldset %id% (nolegend)", { id: fieldset.id}), 
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
		var objects = ['fieldset', 'column', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFieldSetColumnInRules = function(stepId, panelId, fieldsetId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(rule.ifdata, function(a, action) {
				var rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' }]);
				if (rcolumn && rcolumn.value == id) {
					found = rule.id;
					return false;
				}
				rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' } ]);
				if (rcolumn && rcolumn.value == id) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
			$.each(rule.elsedata, function(a, action) {
				var rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' }]);
				if (rcolumn && rcolumn.value == id) {
					found = rule.id;
					return false;
				}
				rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' }]);
				if (rcolumn && rcolumn.value == id) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldSetColumnIdInRules = function(stepId, panelId, fieldsetId, oldId, id) {
		var objects = ['column'];
		$.each(objects, function (k, obj) {
			var acolumn = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId', list: 'options' }, { key: 'name', val: oldId }]);
			if (acolumn) {
				acolumn.name = id;
			}
			acolumn = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId', list: 'options' }, { key: 'name', val: oldId }]);
			if (acolumn) {
				acolumn.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-column') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-column') == oldId) {
				$(this).attr('data-column', id);
			}
		});
		$.each(rules, function(r, rule) {
			$.each(rule.ifdata, function(a, action) {
				var rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' }]);
				if (rcolumn && rcolumn.value == oldId) {
					rcolumn.value = id;
				}
				rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' } ]);
				if (rcolumn && rcolumn.value == oldId) {
					rcolumn.value = id;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				var rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' }]);
				if (rcolumn && rcolumn.value == oldId) {
					rcolumn.value = id;
				}
				rcolumn = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'column', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' }]);
				if (rcolumn && rcolumn.value == oldId) {
					rcolumn.value = id;
				}
			});
		});
	}

	Simulators.changeFieldSetColumnLabelInRules = function(stepId, panelId, fieldsetId, id, label) {
		if (! label) {
			label = Translator.trans('Column %id% (nolabel)', { id: id });
		}
		var objects = ['column', 'field'];
		$.each(objects, function (k, obj) {
			var acolumn = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId', list: 'options' }, { key: 'name', val: id }]);
			if (acolumn) {
				acolumn.label = label;
			}
			acolumn = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId', list: 'options' }, { key: 'name', val: id }]);
			if (acolumn) {
				acolumn.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-column') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-column') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-column');
				switch (target) {
					case 'column':
						action.text(' «' + label + '»');
						break;
					case 'field':
						action.text(' ' + Translator.trans('in') + ' ' + label);
						break;
				}
			}
		});
	}

	Simulators.addFieldSetColumnInActions = function(column) {
		var ractions = ['hideObject', 'showObject'];
		var acolumn = {
			label: column.label != '' ? column.label : Translator.trans("Column %id% (nolabel)", { id: column.id}), 
			name: column.id
		};
		var stepId = column.stepId;
		var panelId = column.panelId;
		var fieldsetId = column.fieldsetId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var fieldset = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldset', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId } ]);
			var ocolumn = Simulators.findInArray(objs.options, [{ key: 'name', val: 'column' }]);
			if (ocolumn) {
				var ofieldsetcolumn = Simulators.findInArray(ocolumn.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId' } ]);
				if (ofieldsetcolumn) {
					ofieldsetcolumn.options.push(acolumn);
				} else {
					Simulators.addInArray(ocolumn.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
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
																	"name": "columnId",
																	"fieldType": "select",
																	"options": [
																		acolumn
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
					"label": Translator.trans("column"),
					"name": "column",
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
																			"name": "columnId",
																			"fieldType": "select",
																			"options": [
																				acolumn
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

	Simulators.deleteFieldSetColumnInActions = function(stepId, panelId, fieldsetId, id) {
		var objects = ['column'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'columnId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFieldRowInRules = function(stepId, panelId, fieldsetId, id) {
		var objects = ['fieldrow', 'field', 'prenote', 'postnote'];
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(objects, function(o, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' }]);
					if (rfieldrow && rfieldrow.value == id) {
						found = rule.id;
						return false;
					}
					rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' } ]);
					if (rfieldrow && rfieldrow.value == id) {
						found = rule.id;
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
				$.each(rule.elsedata, function(a, action) {
					var rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' }]);
					if (rfieldrow && rfieldrow.value == id) {
						found = rule.id;
						return false;
					}
					rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' }]);
					if (rfieldrow && rfieldrow.value == id) {
						found = rule.id;
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

	Simulators.changeFieldRowIdInRules = function(stepId, panelId, fieldsetId, oldId, id) {
		var objects = ['fieldrow', 'field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			var afieldrow = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afieldrow) {
				afieldrow.name = id;
			}
			afieldrow = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: oldId }]);
			if (afieldrow) {
				afieldrow.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-fieldrow') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-fieldrow') == oldId) {
				$(this).attr('data-fieldrow', id);
			}
		});
		$.each(rules, function(r, rule) {
			$.each(objects, function(o, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' }]);
					if (rfieldrow && rfieldrow.value == oldId) {
						rfieldrow.value = id;
					}
					rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' } ]);
					if (rfieldrow && rfieldrow.value == oldId) {
						rfieldrow.value = id;
					}
				});
				$.each(rule.elsedata, function(a, action) {
					var rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' }]);
					if (rfieldrow && rfieldrow.value == oldId) {
						rfieldrow.value = id;
					}
					rfieldrow = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' }]);
					if (rfieldrow && rfieldrow.value == oldId) {
						rfieldrow.value = id;
					}
				});
			});
		});
	}

	Simulators.changeFieldRowLabelInRules = function(stepId, panelId, fieldsetId, id, label) {
		if (! label) {
			label = Translator.trans('FieldRow %id% (nolabel)', { id: id });
		}
		var objects = ['fieldrow', 'field'];
		$.each(objects, function (k, obj) {
			var afieldrow = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: id }]);
			if (afieldrow) {
				afieldrow.label = label;
			}
			afieldrow = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: id }]);
			if (afieldrow) {
				afieldrow.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-fieldrow') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-fieldrow') == id) {
				var target = $(this).attr('data-target');
				var action = $(this).find('span.action-fieldrow');
				switch (target) {
					case 'fieldrow':
						action.text(' «' + label + '»');
						break;
					case 'field':
						action.text(' ' + Translator.trans('in') + ' ' + label);
						break;
				}
			}
		});
	}

	Simulators.addFieldRowInActions = function(fieldrow) {
		var ractions = ['hideObject', 'showObject'];
		var afieldrow = {
			label: fieldrow.label != '' ? fieldrow.label : Translator.trans("FieldRow %id% (nolabel)", { id: fieldrow.id}), 
			name: fieldrow.id
		};
		var stepId = fieldrow.stepId;
		var panelId = fieldrow.panelId;
		var fieldsetId = fieldrow.fieldsetId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var fieldset = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldset', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId } ]);
			var ofieldrow = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldrow' }]);
			if (ofieldrow) {
				var ofieldsetfieldrow = Simulators.findInArray(ofieldrow.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId' } ]);
				if (ofieldsetfieldrow) {
					ofieldsetfieldrow.options.push(afieldrow);
				} else {
					Simulators.addInArray(ofieldrow.fields, [{ key: 'name', val: 'stepId', list: 'options' }], 
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
																	"name": "fieldrowId",
																	"fieldType": "select",
																	"options": [
																		afieldrow
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
					"label": Translator.trans("fieldrow"),
					"name": "fieldrow",
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
																			"name": "fieldrowId",
																			"fieldType": "select",
																			"options": [
																				afieldrow
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

	Simulators.deleteFieldRowInActions = function(stepId, panelId, fieldsetId, id) {
		var objects = ['fieldrow', 'field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: id }]);
			Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: id }]);
		});
	}

	Simulators.isFieldInRules = function(stepId, panelId, fieldsetId, fieldrowId, id) {
		var found = false;
		$.each(rules, function(r, rule) {
			var rfield;
			$.each(rule.ifdata, function(a, action) {
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == id) {
					found = rule.id;
					return false;
				}
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == id) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
			$.each(rule.elsedata, function(a, action) {
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == id) {
					found = rule.id;
					return false;
				}
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == id) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
		});
		return found;
	}

	Simulators.changeFieldIdInRules = function(stepId, panelId, fieldsetId, fieldrowId, oldId, id) {
		var objects = ['field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			var afield;
			if (fieldrowId === '') {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: oldId }]);
			} else {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: oldId }]);
			}
			if (afield) {
				afield.name = id;
			}
			if (fieldrowId === '') {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: oldId }]);
			} else {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: oldId }]);
			}
			if (afield) {
				afield.name = id;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-field') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-fieldrow') == fieldrowId && $(this).attr('data-field') == oldId) {
				$(this).attr('data-field', id);
			}
		});
		$.each(rules, function(r, rule) {
			var rfield;
			$.each(rule.ifdata, function(a, action) {
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == oldId) {
					rfield.value = id;
				}
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == oldId) {
					rfield.value = id;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == oldId) {
					rfield.value = id;
				}
				if (fieldrowId === '') {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				} else {
					rfield = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'field', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: fieldsetId, list: 'fields' }, { key: 'value', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' }]);
				}
				if (rfield && rfield.value == oldId) {
					rfield.value = id;
				}
			});
		});
	}

	Simulators.changeFieldLabelInRules = function(stepId, panelId, fieldsetId, fieldrowId, position, label) {
		if (! label) {
			label = Translator.trans('Field %id% (nolabel)', { id: position });
		}
		var objects = ['field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			var afield;
			if (fieldrowId === '') {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			} else {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			}
			if (afield) {
				afield.label = label;
			}
			if (fieldrowId === '') {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			} else {
				afield = Simulators.findInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			}
			if (afield) {
				afield.label = label;
			}
		});
		var ruleActions = $('#business-rules').find('.rule-action');
		ruleActions.each(function(r) {
			if (this.hasAttribute('data-field') && $(this).attr('data-step') == stepId && $(this).attr('data-panel') == panelId && $(this).attr('data-fieldset') == fieldsetId && $(this).attr('data-fieldrow') == fieldrowId && $(this).attr('data-field') == position) {
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
		var fieldrowId = field.fieldrowId;
		$.each(ractions, function(a, action) {
			var objs = Simulators.findInArray(actions, [{ key: 'name', val: action, list: 'fields' }, { key: 'name', val: 'objectId' } ]);
			var step  = Simulators.findInArray(objs.options, [{ key: 'name', val: 'step', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId } ]);
			var panel = Simulators.findInArray(objs.options, [{ key: 'name', val: 'panel', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId } ]);
			var fieldset = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldset', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId } ]);
			if (fieldset.disposition === 'grid') {
				var fieldrow = Simulators.findInArray(objs.options, [{ key: 'name', val: 'fieldrow', list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId } ]);
				var ofield = Simulators.findInArray(objs.options, [{ key: 'name', val: 'field' }]);
				if (ofield) {
					var ofieldrowfield = Simulators.findInArray(ofield.fields, [{ key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId' } ]);
					if (ofieldrowfield) {
						ofieldrowfield.options.push(afield);
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
																		"label": Translator.trans("of fieldrow"),
																		"name": "fieldrowId",
																		"fieldType": "select",
																		"options": [
																			{
																				"label": fieldrow.label,
																				"name": fieldrow.name,
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
																				"label": Translator.trans("of fieldrow"),
																				"name": "fieldrowId",
																				"fieldType": "select",
																				"options": [
																					{
																						"label": fieldrow.label,
																						"name": fieldrow.name,
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
									}
								]
							}
						]
					});
				}
			} else {
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
			}
		});
	}

	Simulators.deleteFieldInActions = function(stepId, panelId, fieldsetId, fieldrowId, position) {
		var objects = ['field', 'prenote', 'postnote'];
		$.each(objects, function (k, obj) {
			if (fieldrowId === '') {
				Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			} else {
				Simulators.deleteInArray(actions, [{ key: 'name', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			}
			if (fieldrowId === '') {
				Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			} else {
				Simulators.deleteInArray(actions, [{ key: 'name', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'options' }, { key: 'name', val: obj, list: 'fields' }, { key: 'name', val: 'stepId', list: 'options' }, { key: 'name', val: stepId, list: 'fields' }, { key: 'name', val: 'panelId', list: 'options' }, { key: 'name', val: panelId, list: 'fields' }, { key: 'name', val: 'fieldsetId', list: 'options' }, { key: 'name', val: fieldsetId, list: 'fields' }, { key: 'name', val: 'fieldrowId', list: 'options' }, { key: 'name', val: fieldrowId, list: 'fields' }, { key: 'name', val: 'fieldId', list: 'options' }, { key: 'name', val: position }]);
			}
		});
	}

	Simulators.isBlockInfoInRules = function(stepId, panelId, id) {
		var objects = ['blockinfo', 'chapter', 'section'];
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(objects, function (k, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
					if (rblockinfo && rblockinfo.value == id) {
						found = rule.id;
						return false;
					}
					rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' } ]);
					if (rblockinfo && rblockinfo.value == id) {
						found = rule.id;
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
				$.each(rule.elsedata, function(a, action) {
					var rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
					if (rblockinfo && rblockinfo.value == id) {
						found = rule.id;
						return false;
					}
					rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
					if (rblockinfo && rblockinfo.value == id) {
						found = rule.id;
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
			$.each(objects, function (k, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
					if (rblockinfo && rblockinfo.value == oldId) {
						rblockinfo.value = id;
					}
					rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' } ]);
					if (rblockinfo && rblockinfo.value == oldId) {
						rblockinfo.value = id;
					}
				});
				$.each(rule.elsedata, function(a, action) {
					var rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
					if (rblockinfo && rblockinfo.value == oldId) {
						rblockinfo.value = id;
					}
					rblockinfo = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'name', val: 'blockinfoId' }]);
					if (rblockinfo && rblockinfo.value == oldId) {
						rblockinfo.value = id;
					}
				});
			});
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
		var objects = ['chapter', 'section'];
		var found = false;
		$.each(rules, function(r, rule) {
			$.each(objects, function (k, obj) {
				$.each(rule.ifdata, function(a, action) {
					var rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
					if (rchapter && rchapter.value == id) {
						found = rule.id;
						return false;
					}
					rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' } ]);
					if (rchapter && rchapter.value == id) {
						found = rule.id;
						return false;
					}
				});
				if (found !== false) {
					return false;
				}
				$.each(rule.elsedata, function(a, action) {
					var rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
					if (rchapter && rchapter.value == id) {
						found = rule.id;
						return false;
					}
					rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: obj, list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
					if (rchapter && rchapter.value == id) {
						found = rule.id;
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
			$.each(rule.ifdata, function(a, action) {
				var rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
				if (rchapter && rchapter.value == oldId) {
					rchapter.value = id;
				}
				rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' } ]);
				if (rchapter && rchapter.value == oldId) {
					rchapter.value = id;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				var rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
				if (rchapter && rchapter.value == oldId) {
					rchapter.value = id;
				}
				rchapter = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'name', val: 'objectId', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'name', val: 'chapterId' }]);
				if (rchapter && rchapter.value == oldId) {
					rchapter.value = id;
				}
			});
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
			$.each(rule.ifdata, function(a, action) {
				var rsection = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
				if (rsection && rsection.value == id) {
					found = rule.id;
					return false;
				}
				rsection = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' } ]);
				if (rsection && rsection.value == id) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
				return false;
			}
			$.each(rule.elsedata, function(a, action) {
				var rsection = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
				if (rsection && rsection.value == id) {
					found = rule.id;
					return false;
				}
				rsection = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
				if (rsection && rsection.value == id) {
					found = rule.id;
					return false;
				}
			});
			if (found !== false) {
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
			$.each(rule.ifdata, function(a, action) {
				var rsection = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
				if (rsection && rsection.value == oldId) {
					rsection.value = id;
				}
				rsection = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' } ]);
				if (rsection && rsection.value == oldId) {
					rsection.value = id;
				}
			});
			$.each(rule.elsedata, function(a, action) {
				var rsection = Simulators.findInArray([action], [{ key: 'value', val: 'hideObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
				if (rsection && rsection.value == oldId) {
					rsection.value = id;
				}
				rsection = Simulators.findInArray([action], [{ key: 'value', val: 'showObject', list: 'fields' }, { key: 'value', val: 'section', list: 'fields' }, { key: 'value', val: stepId, list: 'fields' }, { key: 'value', val: panelId, list: 'fields' }, { key: 'value', val: blockinfoId, list: 'fields' }, { key: 'value', val: chapterId, list: 'fields' }, { key: 'name', val: 'sectionId' }]);
				if (rsection && rsection.value == oldId) {
					rsection.value = id;
				}
			});
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
							var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: $(this).attr('data-step'), list: 'panels' }, { key: 'id', val: $(this).attr('data-panel'), list: 'blocks' }, { key: 'id', val: $(this).attr('data-fieldset') }]);
							if (fieldset.disposition === 'grid') {
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
																			name: 'fieldrowId', 
																			value: $(this).attr('data-fieldrow'),
																			fields: [
																				{
																					name: 'fieldId',
																					value: $(this).attr('data-' + target)
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
							} else {
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
																			value: $(this).attr('data-' + target)
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
							}
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
						case 'column':
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
																		name: 'columnId', 
																		value: $(this).attr('data-column')
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
						case 'fieldrow':
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
																		name: 'fieldrowId', 
																		value: $(this).attr('data-fieldrow')
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
							var fieldset = Simulators.findInArray(steps, [{ key: 'id', val: $(this).attr('data-step'), list: 'panels' }, { key: 'id', val: $(this).attr('data-panel'), list: 'blocks' }, { key: 'id', val: $(this).attr('data-fieldset') }]);
							if (fieldset.disposition === 'grid') {
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
																			name: 'fieldrowId', 
																			value: $(this).attr('data-fieldrow'),
																			fields: [
																				{
																					name: 'fieldId',
																					value: $(this).attr('data-field'),
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
																}
															]
														}
													]
												}
											]
										}
									]
								};
							} else {
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
																			value: $(this).attr('data-field'),
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
														}
													]
												}
											]
										}
									]
								};
							}
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
				case 'unsetAttribute':
					clause = {
						name: 'action-select', 
						value: 'unsetAttribute', 
						fields: [
							{
								name: 'attributeId', 
								value: target, 
								fields: [
									{
										name: 'fieldName', 
										value: Simulators.findDataNameById($(this).attr('data-data')) 
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
			var id = index + 1;
			if (rule.name == 'R' + rule.id) {
				rule.name = 'R' + id;
				$('#' + rule.elementId).find('span.rule-name').html(rule.name);
			}
			if (rule.label == 'R' + rule.id) {
				rule.label = 'R' + id;
				$('#' + rule.elementId).find('span.rule-label').html(rule.label);
			}
			rule.id = id;
			$('#' + rule.elementId).find('span.rule-id').html(rule.id);
			$('#' + rule.elementId).find('ul.rule-conditions').attr('data-rule-id', rule.id);
		});
	}

	Simulators.sortRulesFromUI = function() {
		var newRules = [];
		$("#business-rules").children('div.rule-container').each(function(index) {
			var name = $.trim($(this).find('span.rule-name').text());
			var i = Simulators.findRuleIndexByName(name);
			newRules.push(rules[i]);
		});
		rules = newRules.slice(0);
		Simulators.renumberRules();
	}

	Simulators.bindSortableRules = function() {
		$("#business-rules").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			sort: function(event, ui) {
				if (Simulators.updating) {
					Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
					setTimeout(function() {
						$("#business-rules").sortable('cancel');
					}, 0);
				}
			},
			update: function( e, ui ) {
				if (!Simulators.updating) {
					Simulators.sortRulesFromUI();
					$('.update-button').show();
					$('.toggle-collapse-all').show();
					Admin.updated = true;
				}
			}
		});
	}

	Simulators.maxRuleId = function() {
		var maxId = 0;
		$.each(rules, function(k, rule) {
			var id = parseInt(rule.id);
			if (id > maxId) {
				maxId = id;
			}
		});
		return maxId;
	}

	Simulators.bindRuleButtons = function(container) {
		if (! container ) {
			container = $("#businessrules");
		}
		container.find('button.edit-rule').on('click', function(e) {
		    e.preventDefault();
			Simulators.editRule($($(this).attr('data-parent')));
		});
		container.find('button.delete-rule').on('click', function(e) {
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
		ruleContainer.find("> div > button.delete-rule").on('click', function(e) {
		    e.preventDefault();
			var r = Simulators.findRuleIndexByName(rule.name);
			$(this).parents('div.rule-container').remove();
			rules.splice(r, 1);
			Simulators.renumberRules();
		});
		ruleContainer.find('.input-rule-name').on("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				$(this).trigger("change");
			}
		});
		ruleContainer.find('.input-rule-name').on('input propertychange', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
			}, 0);
		});
		ruleContainer.find('.input-rule-name').on('paste', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
				$(this).focusNextInputField();
			}, 0);
		});
		ruleContainer.find('.input-rule-name').on('change', function () {
			ruleContainer.find('.rule-name').text($(this).val());
		});

		ruleContainer.find('.input-rule-label').on("keypress", function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
				$(this).trigger("change");
			}
		});
		ruleContainer.find('.input-rule-label').on('input propertychange', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
			}, 0);
		});
		ruleContainer.find('.input-rule-label').on('paste', function(event) {
			var elt = this;
			setTimeout(function () {
				$(elt).trigger("change");
				$(this).focusNextInputField();
			}, 0);
		});
		ruleContainer.find('.input-rule-label').on('change', function () {
			ruleContainer.find('.rule-label').text($(this).val());
		});
		ruleContainer.find('.cancel-edit-rule').on('click', function() {
			ruleContainer.replaceWith(Simulators.ruleBackup);
			Simulators.ruleBackup.find('button.edit-rule').on('click', function(e) {
				e.preventDefault();
				Simulators.editRule($($(this).attr('data-parent')));
			});
			Simulators.ruleBackup.find('button.delete-rule').on('click', function(e) {
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
		ruleContainer.find('.cancel-add-rule').on('click', function() {
			ruleContainer.remove();
			rules.pop();
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
		});
		ruleContainer.find('.validate-add-rule, .validate-edit-rule').on('click', function() {
			if (! Simulators.checkRule(ruleContainer)) {
				return false;
			}
			var conditions = ruleContainer.find('.conditions').conditionsBuilder("conditions");
			var editedrule = {
				elementId: '',
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
			var newContainer = Simulators.drawRuleForDisplay(editedrule);
			editedrule.elementId = newContainer.attr('id');
			$.each(rules, function(k, rule) {
				if (rule.id == editedrule.id) {
					rules[k] = editedrule;
					return false;
				}
			});
			ruleContainer.replaceWith(newContainer);
			Simulators.bindRuleButtons(newContainer);
			$('.update-button').show();
			$('.toggle-collapse-all').show();
			Admin.updated = true;
			Simulators.updating = false;
			newContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID = $(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: newContainer.offset().top - $('#navbar').height() }, 500);
		});
	}

	Simulators.drawRuleForDisplay = function(rule) {
		var ruleElementId = 'rule-' + Math.floor(Math.random() * 100000);
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'card bg-info sortable rule-container' });
		ruleContainer.append('<div class="card-header" role="tab"><button class="btn btn-info float-right update-button delete-rule" title="' + Translator.trans('Delete') + '" data-parent="#' + ruleElementId + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button><button class="btn btn-info float-right update-button edit-rule" title="' + Translator.trans('Edit') + '" data-parent="#' + ruleElementId + '"><span class="button-label">' + Translator.trans('Edit') + '</span> <span class="fas fa-pencil-alt"></span></button><h4 class="card-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">' + Translator.trans('Rule') + ' #<span class="rule-id">' + rule.id + '</span> <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'card-body panel-collapse collapse in', role: 'tabpanel' });
		var conditionsPanel = $('<div class="card bg-light conditions-panel"></div>');
		conditionsPanel.append('<div class="card-header"><h4>' + Translator.trans('When ...') + '</h4></div>');
		var conditionsPanelBody = $('<div class="card-body"></div>');
		var conditions = jQuery.extend(true, {}, rule.connector)
		Simulators.plainConditions(conditions);
		conditionsPanelBody.append('<ul class="rule-conditions" data-value="' + conditions + '" data-rule-element-id="' + ruleElementId + '" data-rule-id="' + rule.id + '">' + Simulators.drawConditionForDisplay(conditions) + '</ul>');
		conditionsPanel.append(conditionsPanelBody);
		ruleBody.append(conditionsPanel);
		if (rule.ifdata.length > 0) {
			var actionsPanel = $('<div class="card bg-light if-actions-panel"></div>');
			actionsPanel.append('<div class="card-header"><h4>' + Translator.trans('then do ...') + '</h4></div>');
			var actionsPanelBody = $('<div class="card-body"></div>');
			$.each(rule.ifdata, function(a, action) {
				var actionContainer = Simulators.drawRuleActionForDisplay(a + 1, action);
				actionsPanelBody.append(actionContainer);
			});
			actionsPanel.append(actionsPanelBody);
			ruleBody.append(actionsPanel);
		}
		if (rule.elsedata.length > 0) {
			var actionsPanel = $('<div class="card bg-light else-actions-panel"></div>');
			actionsPanel.append('<div class="card-header"><h4>' + Translator.trans('else do ...') + '</h4></div>');
			var actionsPanelBody = $('<div class="card-body"></div>');
			$.each(rule.elsedata, function(a, action) {
				var actionContainer = Simulators.drawRuleActionForDisplay(a + 1, action);
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
			conditionContainer = '<li class="condition"><data class="data" value="' + condition.id + '">«' + condition.name + '»</data> ' + condition.operator + ' ' + condition.value + '</li>';
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
					var data = Simulators.dataset[ruleData.name];
					ruleData["id"] = data.id;
					ruleData["name"] = Translator.trans('Javascript');
					ruleData["operator"] = Translator.trans('is');
					ruleData["value"] = ruleData.value == 1 ? Translator.trans('enabled') : Translator.trans('disabled');
				} else if (ruleData.name === 'dynamic') {
					var data = Simulators.dataset[ruleData.name];
					ruleData["id"] = data.id;
					ruleData["name"] = Translator.trans('User Interface');
					ruleData["operator"] =  ruleData.value == 1 ? Translator.trans('is') : Translator.trans('is not');
					ruleData["value"] = Translator.trans('interactive');
				} else if (matches = ruleData.name.match(/step(\d+)\.dynamic$/)) {
					var data = Simulators.dataset[ruleData.name];
					ruleData["id"] = data.id;
					ruleData["name"] = Translator.trans('User Interface for step %id%', { 'id': matches[1] });
					ruleData["operator"] =  ruleData.value == 1 ? Translator.trans('is') : Translator.trans('is not');
					ruleData["value"] = Translator.trans('interactive');
				} else if (matches = ruleData.name.match(/^#(\d+)$/)) {
					var data = Simulators.findDataById(matches[1]);
					type = data.type;
					ruleData["id"] = data.id;
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
					ruleData["id"] = data.id;
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

	Simulators.drawRuleActionForDisplay = function(id, ruleAction) {
		var name = ruleAction.value;
		var target = "";
		var dataObj = null;
		var datagroupObj = null;
		var data = "";
		var datagroup = "";
		var step = "";
		var panel = "";
		var fieldset = "";
		var blockinfo = "";
		var column = "";
		var fieldrow = "";
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
						dataObj = Simulators.dataset[ruleAction.fields[1].fields[0].value];
						data = dataObj.id;
						break;
					case 'datagroup':
						datagroupObj = Simulators.datagroups[ruleAction.fields[1].fields[0].value];
						datagroup = datagroupObj.name;
						break;
					case 'dataset':
						break;
				}
				break;
			case 'setAttribute':
				target = ruleAction.fields[0].value;
				value = ruleAction.fields[0].fields[0].fields[0].value;
				dataObj = Simulators.dataset[ruleAction.fields[0].fields[0].value];
				data = dataObj.id;
				break;
			case 'unsetAttribute':
				target = ruleAction.fields[0].value;
				dataObj = Simulators.dataset[ruleAction.fields[0].fields[0].value];
				data = dataObj.id;
				break;
			case 'hideObject':
			case 'showObject':
				target = ruleAction.fields[0].value;
				step = ruleAction.fields[0].fields[0].value;
				switch (target) {
					case 'field':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						var fieldsetObj = Simulators.findInArray(steps, [{ key: 'id', val: step, list: 'panels' }, { key: 'id', val: panel, list: 'blocks' }, { key: 'id', val: fieldset }]);
						if (fieldsetObj.disposition === 'grid') {
							fieldrow = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
							field = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
						} else {
							field = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						}
						break;
					case 'prenote':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						var fieldsetObj = Simulators.findInArray(steps, [{ key: 'id', val: step, list: 'panels' }, { key: 'id', val: panel, list: 'blocks' }, { key: 'id', val: fieldset }]);
						if (fieldsetObj.disposition === 'grid') {
							fieldrow = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
							prenote = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
						} else {
							prenote = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						}
						break;
					case 'postnote':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						var fieldsetObj = Simulators.findInArray(steps, [{ key: 'id', val: step, list: 'panels' }, { key: 'id', val: panel, list: 'blocks' }, { key: 'id', val: fieldset }]);
						if (fieldsetObj.disposition === 'grid') {
							fieldrow = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
							postnote = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
						} else {
							postnote = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						}
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
					case 'fieldrow':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						fieldrow = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
						break;
					case 'column':
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						column = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
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
						panel = ruleAction.fields[0].fields[0].fields[0].value;
						fieldset = ruleAction.fields[0].fields[0].fields[0].fields[0].value;
						var fieldsetObj = Simulators.findInArray(steps, [{ key: 'id', val: step, list: 'panels' }, { key: 'id', val: panel, list: 'blocks' }, { key: 'id', val: fieldset }]);
						if (fieldsetObj.disposition === 'grid') {
							fieldrow = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
							field = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
							choice = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
						} else {
							field = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].value;
							choice = ruleAction.fields[0].fields[0].fields[0].fields[0].fields[0].fields[0].value;
						}
						break;
				}
				break;
		}
		var actionContainer = $('<div>', { 'class': 'rule-action', 'data-id': id, 'data-name': name, 'data-target': target, 'data-data': data, 'data-datagroup': datagroup, 'data-step': step, 'data-panel': panel, 'data-fieldset': fieldset, 'data-column': column, 'data-fieldrow': fieldrow, 'data-field': field, 'data-blockinfo': blockinfo, 'data-chapter': chapter, 'data-section': section, 'data-prenote': prenote, 'data-postnote': postnote, 'data-action': action, 'data-footnote': footnote, 'data-choice': choice, 'data-value': value });
		if (name === 'notifyError' || name === 'notifyWarning') {
			var actionName = name === 'notifyError' ? Translator.trans('notify Error') : Translator.trans('notify Warning');
			actionContainer.append('<span class="action-name">' + actionName + ' : </span> <span class="action-value">' + Simulators.replaceByDataLabel(value) + '</span> <span class="action-target"> ' + Translator.trans('on') + ' ' + Translator.trans('the ' + target) + ' </span>');
			if (target === 'data') {
				actionContainer.append('<span class="action-data"><data class="data" value="' + dataObj.id + '">«' + dataObj.label + '»</data></span>');
			} else if (target === 'datagroup') {
				actionContainer.append('<span class="action-datagroup"><data class="datagroup" value="' + datagroupObj.name + '">«' + datagroupObj.label + '»</data></span>');
			}
		} else if (name === 'hideObject' || name === 'showObject') {
			var actionNode = Simulators.findAction(name, actions);
			actionContainer.append('<span class="action-name">' + (name === 'hideObject' ? Translator.trans('hide') : Translator.trans('show')) + '</span>');
			var optionNode = Simulators.findActionOption('objectId', target, actionNode);
			actionContainer.append('<span class="action-target"> ' + Translator.trans('the ' + target) + '</span>');
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
				case 'column':
					actionContainer.append('<span class="action-column"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {columnId: column}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'fieldrow':
					actionContainer.append('<span class="action-fieldrow"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}], optionNode).label + '»</span>');
					actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
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
					if (fieldsetObj.disposition === 'grid') {
						actionContainer.append('<span class="action-field"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}, {fieldId: field}], optionNode).label + '»</span>');
						actionContainer.append('<span class="action-fieldrow"> ' + Translator.trans('in') + ' ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}], optionNode).label + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('of fieldset «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					} else {
						actionContainer.append('<span class="action-field"> «' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: field}], optionNode).label + '»</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					}
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'prenote':
					if (fieldsetObj.disposition === 'grid') {
						actionContainer.append('<span class="action-prenote"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}, {fieldId: prenote}], optionNode).label}) + '</span>');
						actionContainer.append('<span class="action-fieldrow"> ' + Translator.trans('in') + ' ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}], optionNode).label + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('of fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					} else {
						actionContainer.append('<span class="action-prenote"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: prenote}], optionNode).label}) + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					}
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
				case 'postnote':
					if (fieldsetObj.disposition === 'grid') {
						actionContainer.append('<span class="action-postnote"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}, {fieldId: postnote}], optionNode).label}) + '</span>');
						actionContainer.append('<span class="action-fieldrow"> ' + Translator.trans('in') + ' ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}], optionNode).label + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('of fieldset «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					} else {
						actionContainer.append('<span class="action-postnote"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: postnote}], optionNode).label}) + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					}
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
					if (fieldsetObj.disposition === 'grid') {
						actionContainer.append('<span class="action-choice"> ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}, {fieldId: field}, {choiceId: choice}], optionNode).label + '</span>');
						actionContainer.append('<span class="action-field"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}, {fieldId: field}], optionNode).label}) + '</span>');
						actionContainer.append('<span class="action-fieldrow"> ' + Translator.trans('in') + ' ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldrowId: fieldrow}], optionNode).label + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('of fieldset «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					} else {
						actionContainer.append('<span class="action-choice"> ' + Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: field}, {choiceId: choice}], optionNode).label + '</span>');
						actionContainer.append('<span class="action-field"> ' + Translator.trans('of field «%label%»', {'label': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}, {fieldId: field}], optionNode).label}) + '</span>');
						actionContainer.append('<span class="action-fieldset"> ' + Translator.trans('in fieldset «%fieldset%»', {'fieldset': Simulators.findActionField([{stepId: step}, {panelId: panel}, {fieldsetId: fieldset}], optionNode).label})+ '</span>');
					}
					actionContainer.append('<span class="action-panel"> ' + Translator.trans('of panel «%panel%»', {'panel': Simulators.findActionField([{stepId: step}, {panelId: panel}], optionNode).label}) + '</span>');
					actionContainer.append('<span class="action-step"> ' + Translator.trans('of step «%label%»', {'label': Simulators.findActionField([{stepId: step}], optionNode).label}) + '</span>');
					break;
			}
		} else if (name === 'setAttribute') {
			actionContainer.append('<span class="action-name">' + Translator.trans('set') + '</span> <span class="action-target">' + Translator.trans('the ' + target) + '</span> <span class="action-data"> '+ Translator.trans('of «%label%»', {'label': dataObj.label }) + '</span> <span class="action-value"> ' + Translator.trans('to') + ' ' + Translator.trans(Simulators.replaceByValueLabel(dataObj, value)) + '</span>');
		} else if (name === 'unsetAttribute') {
			actionContainer.append('<span class="action-name">' + Translator.trans('unset') + '</span> <span class="action-target">' + Translator.trans('the ' + target) + '</span> <span class="action-data"> '+ Translator.trans('of «%label%»', {'label': dataObj.label }) + '</span>');
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
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'card bg-info sortable rule-container' });
		ruleContainer.append('<div class="card-header" role="tab"><button class="btn btn-info float-right update-button delete-rule" title="' + Translator.trans('Delete') + '"><span class="button-label">' + Translator.trans('Delete') + '</span> <span class="fas fa-minus-circle"></span></button><h4 class="card-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">#<span class="rule-id">' + rule.id + '</span> ' + Translator.trans('Rule') + ' <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'card-body panel-collapse collapse', role: 'tabpanel' });
		ruleContainer.append(ruleBody);
		ruleBody.append('<div class="card bg-light"><div class="card-body form-inline"><div class="form-group"><label>' + Translator.trans('Name') + '</label><input type="text" class="input-rule-name" value="' + rule.name + '" /></div><div class="form-group"><label>' + Translator.trans('Label') + '</label><input type="text" class="input-rule-label" value="' + rule.label + '" /></div></div></div>');
		ruleBody.append('<div class="card bg-light"><div class="card-header"><h4>' + Translator.trans('When ...') + '</h4></div><div class="card-body"><div class="conditions"></div></div></div>');
		ruleBody.append('<div class="card bg-light"><div class="card-header"><button class="btn btn-info float-right update-button add-if-action" title="' + Translator.trans('Add Action') + '"><span class="button-label">' + Translator.trans('Add Action') + '</span> <span class="fas fa-plus-circle"></span></button><h4>' + Translator.trans('then do ...') + '</h4></div><div class="card-body"><div class="if-actions"></div></div></div>');
		ruleBody.append('<div class="card bg-light"><div class="card-header"><button class="btn btn-info float-right update-button add-else-action" title="' + Translator.trans('Add Action') + '"><span class="button-label">' + Translator.trans('Add Action') + '</span> <span class="fas fa-plus-circle"></span></button><h4>' + Translator.trans('else do ...') + '</h4></div><div class="card-body"><div class="else-actions"></div></div></div>');
		var ruleButtonsPanel = $('<div class="card bg-light buttons-panel" id="' + ruleElementId + '-buttons-panel"></div>');
		var ruleButtonsBody = $('<div class="card-body rule-buttons"></div>');
		ruleButtonsBody.append('<button class="btn btn-success float-right validate-edit-rule">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		ruleButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-rule">' + Translator.trans('Cancel') + '</span></button>');
		ruleButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		ruleButtonsPanel.append(ruleButtonsBody);
		ruleBody.append(ruleButtonsPanel);
		return ruleContainer;
	}

	Simulators.checkRule = function(ruleContainer) {
		var ruleName = ruleContainer.find('input.input-rule-name').val();
		if (ruleName === '') {
			ruleContainer.find('.error-message').text(Translator.trans('The rule name is required'));
			ruleContainer.find('.alert').show();
			return false;
		}
		if (! /^\w+$/.test(ruleName)) {
			ruleContainer.find('.error-message').text(Translator.trans('Incorrect rule name'));
			ruleContainer.find('.alert').show();
			return false;
		}
		var ruleLabel = ruleContainer.find('input.input-rule-label').val();
		if (ruleLabel === '') {
			ruleContainer.find('.error-message').text(Translator.trans('The rule label is required'));
			ruleContainer.find('.alert').show();
			return false;
		}
		var conditions = ruleContainer.find('.conditions');
		if (conditions.find('.rule').length == 0) {
			ruleContainer.find('.error-message').text(Translator.trans('Please enter at least one condition'));
			ruleContainer.find('.alert').show();
			return false;
		}
		var incompleteConditions = false;
		conditions.find('.editable-select').each(function(c) {
			if ($(this).attr('data-value') == '') {
				incompleteConditions = true;
				return false;
			}
		});
		conditions.find('.expression').each(function(c) {
			if (! $(this).expressionbuilder('completed')) {
				incompleteConditions = true;
				return false;
			}
			$(this).expressionbuilder('state');
		});
		if (incompleteConditions) {
			ruleContainer.find('.error-message').text(Translator.trans('Please, complete the input of the rule conditions'));
			ruleContainer.find('.alert').show();
			return false;
		}
		var actions = ruleContainer.find('.actions');
		if (actions.find('.action').length == 0) {
			ruleContainer.find('.error-message').text(Translator.trans('Please enter at least one action'));
			ruleContainer.find('.alert').show();
			return false;
		}
		var incompleteActions = false;
		actions.find('.editable-select, .editable-textarea, .editable-text').each(function(c) {
			if ($(this).attr('data-value') == '') {
				incompleteActions = true;
				return false;
			}
		});
		actions.find('.expression').each(function(c) {
			if (! $(this).expressionbuilder('completed')) {
				incompleteActions = true;
				return false;
			}
			$(this).expressionbuilder('state');
		});
		if (incompleteActions) {
			ruleContainer.find('.error-message').text(Translator.trans('Please, complete the input of the rule actions'));
			ruleContainer.find('.alert').show();
			return false;
		}
		var circularReference = false;
		actions.find('.editable-select[data-value=setAttribute]').each(function(s) {
			$(this).next().find('.editable-select[name=attributeId]').each(function(a) {
				if ($(this).attr('data-value') == 'content' || $(this).attr('data-value') == 'default') {
					var fieldName = $(this).next().find('.editable-select[name=fieldName]').attr('data-value');
					conditions.find('.editable-select.field').each(function(c) {
						if ($(this).attr('data-value') == fieldName) {
							circularReference = true;
							return false;
						}
					});
					if (circularReference) {
						return false;
					}
					var dataId = Simulators.dataset[fieldName].id;
					conditions.find('.value.expression').each(function(v) {
						if (! Simulators.checkDataInExpression(dataId, $(this))) {
							circularReference = true;
							return false;
						}
					});
					if (circularReference) {
						return false;
					}
					$(this).next().find('.editable-select[name=fieldName]').next().find('.expression').each(function(v) {
						if (! Simulators.checkDataInExpression(dataId, $(this))) {
							circularReference = true;
							return false;
						}
					});
					if (circularReference) {
						return false;
					}
				}
			});
			if (circularReference) {
				return false;
			}
		});
		if (circularReference) {
			ruleContainer.find('.error-message').text(Translator.trans('You can not change the content or the default value of a data when it is used in a condition'));
			ruleContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.addRule = function(ruleContainerGroup) {
		try {
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
			$('.toggle-collapse-all').hide();
			$('.update-button').hide();
			var ruleContainer = Simulators.drawRuleForInput(rule);
			ruleContainer.find('button.cancel-edit-rule').addClass('cancel-add-rule').removeClass('cancel-edit-rule');
			ruleContainer.find('button.validate-edit-rule').addClass('validate-add-rule').removeClass('validate-edit-rule');
			$("#business-rules").append(ruleContainer);
			rule.elementId = ruleContainer.attr('id');
			Simulators.bindRule(rule);
			$("#collapsebusinessrules").collapse('show');
			ruleContainer.find('a[data-toggle="collapse"]').each(function() {
				var objectID=$(this).attr('href');
				$(objectID).collapse('show');
			});
			$("html, body").animate({ scrollTop: ruleContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.editRule = function(ruleDisplayContainer) {
		try {
			var	rule = {
				id: ruleDisplayContainer.find('.rule-id').text(),
				name: ruleDisplayContainer.find('.rule-name').text(),
				label: ruleDisplayContainer.find('.rule-label').text(),
				conditions: ruleDisplayContainer.find('.rule-conditions').attr("data-value"),
				connector: Simulators.collectRuleConnector(ruleDisplayContainer.find('.conditions-panel')),
				ifdata: Simulators.collectRuleActions(ruleDisplayContainer.find('.if-actions-panel')),
				elsedata: Simulators.collectRuleActions(ruleDisplayContainer.find('.else-actions-panel'))
			};
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			var ruleInputContainer = Simulators.drawRuleForInput(rule);
			rule.elementId = ruleInputContainer.attr('id');
			Simulators.ruleBackup = ruleDisplayContainer.replaceWith(ruleInputContainer);
			Simulators.bindRule(rule);
			$("#collapse" + ruleInputContainer.attr('id')).collapse('show');
			$("html, body").animate({ scrollTop: ruleInputContainer.offset().top - $('#navbar').height() }, 500);
			Simulators.updating = true;
		} catch (e) {
			console && console.log(e.message);
		}
	}

	Simulators.deleteRule = function(ruleContainer) {
		try {
			var ruleId =  ruleContainer.find('.rule-id').text();
			var ruleLabel = ruleContainer.find('.rule-label').text();
			bootbox.confirm({
				title: Translator.trans('Deleting rule'),
				message: Translator.trans("Are you sure you want to delete the rule : %label% ?", { 'label': ruleLabel }), 
				callback: function(confirmed) {
					if (confirmed) {
						ruleContainer.remove();
						Simulators.sortRulesFromUI();
						$('.save-simulator').show();
						Admin.updated = true;
					}
				}
			}); 
		} catch (e) {
			console && console.log(e.message);
		}
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

