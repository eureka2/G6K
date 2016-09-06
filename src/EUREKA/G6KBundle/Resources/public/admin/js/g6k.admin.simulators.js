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

	function Simulators() {
	};

	Simulators.functions = {
		"abs" : {arity: 1, args: ['number'], type: 'number'},
		"acos" : {arity: 1, args: ['number'], type: 'number'},
		"acosh" : {arity: 1, args: ['number'], type: 'number'},
		"asin" : {arity: 1, args: ['number'], type: 'number'},
		"asinh" : {arity: 1, args: ['number'], type: 'number'},
		"atan" : {arity: 1, args: ['number'], type: 'number'},
		"atan2" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"atanh" : {arity: 1, args: ['number'], type: 'number'},
		"ceil" : {arity: 1, args: ['number'], type: 'number'},
		"cos" : {arity: 1, args: ['number'], type: 'number'},
		"cosh" : {arity: 1, args: ['number'], type: 'number'},
		"count" : {arity: -1, args: ['number'], type: 'number'},
		"day" : {arity: 1, args: ['date'], type: 'number'},
		"exp" : {arity: 1, args: ['number'], type: 'number'},
		"floor" : {arity: 1, args: ['number'], type: 'number'},
		"fullmonth" : {arity: 1, args: ['date'], type: 'text'},
		"get" : {arity: 2, args: ['array', 'number'], type: 'text'},
		"lastday" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"log" : {arity: 1, args: ['number'], type: 'number'},
		"log10" : {arity: 1, args: ['number'], type: 'number'},
		"max" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"min" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"money": {arity: 1, args: ['number'], type: 'text'},
		"month" : {arity: 1, args: ['date'], type: 'number'},
		"nextWorkDay": {arity: 1, args: ['date'], type: 'date'},
		"pow" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"rand" : {arity: 0, args: [], type: 'number'},
		"replace": {arity: 3, args: ['text', 'text', 'text'], type: 'text'},
		"round" : {arity: 1, args: ['number'], type: 'number'},
		"sin" : {arity: 1, args: ['number'], type: 'number'},
		"sinh" : {arity: 1, args: ['number'], type: 'number'},
		"size" : {arity: 1, args: ['array'], type: 'number'},
		"split" : {arity: 2, args: ['text', 'text'], type: 'array'},
		"sqrt" : {arity: 1, args: ['number'], type: 'number'},
		"sum" : {arity: -1, args: ['number'], type: 'number'},
		"tan" : {arity: 1, args: ['number'], type: 'number'},
		"tanh" : {arity: 1, args: ['number'], type: 'number'},
		"workdays" : {arity: 2, args: ['date', 'date'], type: 'number'},
		"workdaysofmonth" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"year" : {arity: 1, args: ['date'], type: 'number'}
	};

	Simulators.constants = { 
		pi: {type : 'number'}, 
		now: {type: 'date'}, 
		today: {type: 'date'}, 
		'true': {type: 'boolean'}, 
		'false': {type: 'boolean'}
	};

	Simulators.dateFormats = { 'd/m/Y':'d/m/Y', 'm/d/Y':'m/d/Y', 'd-m-Y':'d-m-Y', 'm-d-Y':'m-d-Y', 'Y-m-d':'Y-m-d' };

	Simulators.moneySymbols = {'฿':'฿', 'B/.':'B/.', '₵':'₵', '¢':'¢', '₡':'₡', 'Kč':'Kč', '$':'$', '₫':'₫', '€':'€', 'ƒ':'ƒ', 'Ft':'Ft', '₲':'₲', '₴':'₴', '₭':'₭', 'L':'L', '£ / ₤':'£ / ₤', '₺':'₺', '₥':'₥', '₦':'₦', 'S/.':'S/.', '₱':'₱', 'P':'P', 'R':'R', 'RM':'RM', '₹ / ₨':'₹ / ₨', '৲':'৲', '৳':'৳', 'R$':'R$', '₪':'₪', '₮':'₮', '₩':'₩', '¥':'¥', 'Ұ':'Ұ', 'zł':'zł' };

	Simulators.optionalAttributes = {
		'default': { type : 'expression', label: Translator.trans('default'), placeholder: Translator.trans('default value')},
		'min': { type : 'expression', label: Translator.trans('min'), placeholder: Translator.trans('min value')},
		'max': { type : 'expression', label: Translator.trans('max'), placeholder: Translator.trans('max value')},
		'content': { type : 'expression', label: Translator.trans('Content'), placeholder: Translator.trans('content')},
		'round': { type : 'number', label: Translator.trans('Round'), placeholder: Translator.trans('round')},
		'unit': { type : 'text', label: Translator.trans('Unit'), placeholder: Translator.trans('unit text')},
		'source': { type : 'expression', label: Translator.trans('Source'), placeholder: Translator.trans('source')},
		'index': { type : 'expression', label: Translator.trans('Index'), placeholder: Translator.trans('index name')},
		'memorize': { type : 'checkbox', label: Translator.trans('Memorize'), placeholder: Translator.trans('Store into memo)')}
	};

	Simulators.expressionOptions = {
		constants: Simulators.constants,
		functions: Simulators.functions,
		operators: ['+', '-', '*', '%', '/', '&', '|'],
		onCompleted: function(type) { 
			// console.log('Expression complete, type = ' + type); 
			},
		onEditing: function() { 
			// console.log('Expression being changed'); 
		},
		onError: function(error) { console.log('error : ' + error); },
		language: Admin.lang,
		operandHolder: { classes: ['button', 'button-default'] },
		operatorHolder: { classes: ['button', 'button-default'] },
		nestedExpression: { classes: ['button', 'button-default'] }
	};

	Simulators.dataBackup = null;
	Simulators.datagroupBackup = null;
	Simulators.dataChoicesBackup = null;
	Simulators.ruleBackup = null;
	Simulators.dataset = {};
	Simulators.datagroups = {};

	Simulators.init = function() {
		Simulators.collectDataset();
		$('.save-simulator').hide();
	}

	Simulators.collectDataset = function() {
		$('#datas .data-container').each(function(d) {
			if ($(this).hasClass('datagroup')) {
				var name = $(this).find(".attributes-container p[data-attribute='name']").attr('data-value');
				var datagroup = {
					id:  $(this).attr('data-id'),
					label: $(this).find(".attributes-container p[data-attribute='label']").attr('data-value'),
					description: $(this).parent().find(".datagroup-description").html()
				};
				Simulators.datagroups[name] = datagroup;
				$(this).parent().find('.datagroup-data-container').each(function(d) {
					var choices = [];
					$(this).parent().find('.choice-container').each(function(d) {
						choices.push({
							id:  $(this).attr('data-id'),
							name: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
						});
					});
					var name = $(this).find("p[data-attribute='name']").attr('data-value');
					var data = {
						id:  $(this).attr('data-id'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						type: $(this).find("p[data-attribute='type']").attr('data-value'),
						description: $(this).parent().find(".data-description").html()
					};
					if (choices.length > 0) {
						data['options'] = choices;
					}
					Simulators.dataset[name] = data;
				});
			} else {
				var choices = [];
				$(this).parent().find('.choice-container').each(function(d) {
					choices.push({
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='value']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
					});
				});
				var name = $(this).find("p[data-attribute='name']").attr('data-value');
				var data = {
					id:  $(this).attr('data-id'),
					label: $(this).find("p[data-attribute='label']").attr('data-value'),
					type: $(this).find("p[data-attribute='type']").attr('data-value'),
					description: $(this).parent().find(".data-description").html()
				};
				if (choices.length > 0) {
					data['options'] = choices;
				}
				Simulators.dataset[name] = data;
			}
		});
		Simulators.dataset['script'] = {
			'id': 20000, 
			'label': Translator.trans('Script'),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('Disabled'),
					'name': 0
				},
				{
					'label': Translator.trans('Enabled'),
					'name': 1
				}
			]
		};
		Simulators.dataset['dynamic'] = {
			'id': 20001, 
			'label': Translator.trans('Interactive UI'),
			'type': 'choice',
			'options': [
				{
					'label': Translator.trans('No'),
					'name': 0
				},
				{
					'label': Translator.trans('Yes'),
					'name': 1
				}
			]
		};
		$('#steps .step-container').each(function() {
			Simulators.dataset['step' + $(this).attr('data-id') + '.dynamic'] = {
				'id': 10000 + $(this).attr('data-id'), 
				'label': Translator.trans('Is step %id% interactive ?', { 'id': $(this).attr('data-id') }),
				'type': 'choice',
				'options': [
					{
						'label': Translator.trans('No'),
						'name': 0
					},
					{
						'label': Translator.trans('Yes'),
						'name': 1
					}
				]
			};

		});
	}

	Simulators.findDatagroupNameById = function(id) {
		var result = null;
		$.each(Simulators.datagroups, function(name, datagroup) {
			if (datagroup.id == id) {
				result = name;
				return false;
			}
		});
		return result;
	}

	Simulators.findDataById = function(id) {
		var result = null;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id == id) {
				result = data;
				return false;
			}
		});
		return result;
	}

	Simulators.findDataNameById = function(id) {
		var result = null;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id == id) {
				result = name;
				return false;
			}
		});
		return result;
	}

	Simulators.replaceByDataLabel = function(target) {
		return target.replace(
			/#(\d+)/g, 
			function(match, p1) {
				var data = Simulators.findDataById(p1);
				return data != null ? '«' + data.label + '»' : "#" + p1;
			}
		);
	}

	Simulators.getChoiceLabel = function(data, name) {
		var result = "";
		$.each(data.options, function(o, option) {
			if (option.name == name) {
				result = option.label;
				return false;
			}
		});
		return result;
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

	Simulators.maxDatasetId = function() {
		var maxId = 0;
		$.each(Simulators.dataset, function(name, data) {
			if (data.id > maxId && ! /(dynamic|script)$/.test(name)) {
				maxId = data.id;
			}
		});
		return maxId;
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

	Simulators.bindRule = function(rule) {
		var ruleContainer = $('#' + rule.elementId);
		ruleContainer.find('.conditions').conditionsBuilder({
			fields: Simulators.dataset,
			expressionOptions: Simulators.expressionOptions,
			conditions: rule.conditions
		});
		ruleContainer.find('.if-actions').actionsBuilder({
			fields: Simulators.dataset,
			expressionOptions: Simulators.expressionOptions,
		    actions: actions,
		    data: rule.ifdata
		});
		ruleContainer.find('.else-actions').actionsBuilder({
			fields: Simulators.dataset,
			expressionOptions: Simulators.expressionOptions,
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
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
		});
		ruleContainer.find('.validate-add-rule, .validate-edit-rule').click(function() {
			var rule = {
				id: ruleContainer.find('.rule-id').text(),
				name: ruleContainer.find('.input-rule-name').val(),
				label: ruleContainer.find('.input-rule-label').val(),
				conditions: ruleContainer.find('.conditions').conditionsBuilder("conditions"),
				ifActions: ruleContainer.find('.if-actions').actionsBuilder("actions"),
				elseActions:ruleContainer.find('.else-actions').actionsBuilder("actions")

			};
			var newContainer = Simulators.drawRuleForDisplay(rule);
			ruleContainer.replaceWith(newContainer);
			newContainer.find('button.edit-rule').click(function(e) {
				e.preventDefault();
				Simulators.editRule($($(this).attr('data-parent')));
			});
			newContainer.find('button.delete-rule').click(function(e) {
				e.preventDefault();
				Simulators.deleteRule($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newContainer.offset().top }, 500);
		});
	}

	Simulators.drawRuleForDisplay = function(rule) {
		console.log(rule);
		var ruleElementId = 'rule-' + Math.floor(Math.random() * 100000);
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'panel panel-info sortable rule-container' });
		ruleContainer.append('<div class="panel-heading" role="tab"><button class="btn btn-info pull-right update-button delete-rule">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-info pull-right update-button edit-rule">' + Translator.trans('Edit') + ' <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">#<span class="rule-id">' + rule.id + '</span> Rule <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'panel-body panel-collapse collapse in', role: 'tabpanel' });
		var conditionsPanel = $('<div class="panel panel-default if-actions-panel"></div>');
		conditionsPanel.append('<div class="panel-heading"><h4>' + Translator.trans('When ...') + '</h4></div>');
		var conditionsPanelBody = $('<div class="panel-body"></div>');
		if (rule.conditions.all && rule.conditions.all.length == 1) {
			rule.conditions = rule.conditions.all[0];
		} else if (rule.conditions.any && rule.conditions.any.length == 1) {
			rule.conditions = rule.conditions.any[0];
		}
		Simulators.plainConditions(rule.conditions);
		conditionsPanelBody.append('<ul class="rule-conditions" data-value="' + rule.conditions + '">' + Simulators.drawConditionForDisplay(rule.conditions) + '</ul>');
		conditionsPanel.append(conditionsPanelBody);
		ruleBody.append(conditionsPanel);
		if (rule.ifActions.length > 0) {
			var actionsPanel = $('<div class="panel panel-default conditions-panel"></div>');
			actionsPanel.append('<div class="panel-heading"><h4>' + Translator.trans('then do ...') + '</h4></div>');
			var actionsPanelBody = $('<div class="panel-body"></div>');
			$.each(rule.ifActions, function(a, action) {
				var actionContainer = Simulators.drawRuleActionForDisplay(action);
				actionsPanelBody.append(actionContainer);
			});
			actionsPanel.append(actionsPanelBody);
			ruleBody.append(actionsPanel);
		}
		if (rule.elseActions.length > 0) {
			var actionsPanel = $('<div class="panel panel-default else-actions-panel"></div>');
			actionsPanel.append('<div class="panel-heading"><h4>' + Translator.trans('else do ...') + '</h4></div>');
			var actionsPanelBody = $('<div class="panel-body"></div>');
			$.each(rule.elseActions, function(a, action) {
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
						data = Simulators.dataset[ruleAction.fields[0].fields[0].value];
						break;
				}
				break;
		}
		var actionContainer = $('<div>', { 'class': 'rule-action', 'data-id': '', 'data-name': name, 'data-target': target, 'data-data': data, 'data-datagroup': datagroup, 'data-step': step, 'data-panel': panel, 'data-fieldset': fieldset, 'data-field': field, 'data-blockinfo': blockinfo, 'data-chapter': chapter, 'data-section': section, 'data-prenote': prenote, 'data-postnote': postnote, 'data-action': action, 'data-footnote': footnote, 'data-choice': choice, 'data-value': value });
		if (name === 'notifyError') {
			actionContainer.append('<span class="action-name">' + Translator.trans('notify Error') + ' : </span> <span class="action-value">' + Simulators.replaceByDataLabel(value) + '</span> <span class="action-target"> ' + Translator.trans('for') + ' ' + Translator.trans(target) + ' </span>');
			if (target === 'data') {
				actionContainer.append('<span class="action-data">«' + data.label + '»</span>');
			} else if (target === 'datagroup') {
				actionContainer.append('<span class="action-datagroup">«' + datagroup.label + '»</span>');
			}
		} else if (name === 'notifyWarning') {
			actionContainer.append('<span class="action-name">' + Translator.trans('notify Warning') + ' : </span> <span class="action-value">' + Simulators.replaceByDataLabel(value) + '</span> <span class="action-target"> ' + Translator.trans('for') + ' ' + Translator.trans(target) + ' </span>');
			if (target === 'data') {
				actionContainer.append('<span class="action-data">«' + data.label + '»</span>');
			} else if (target === 'datagroup') {
				actionContainer.append('<span class="action-datagroup">«' + datagroup.label + '»</span>');
			}
		} else if (name === 'hideObject' || name === 'showObject') {
			switch (target) {
				case 'step':
					actionContainer.append('<span class="action-step">«»</span>');
					break;
				case 'panel':
					actionContainer.append('<span class="action-panel">«»</span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'fieldset':
					actionContainer.append('<span class="action-fieldset">«»</span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'blockinfo':
					actionContainer.append('<span class="action-blockinfo">«»</span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'field':
					actionContainer.append('<span class="action-field">«»</span>');
					actionContainer.append('<span class="action-fieldset"> </span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'chapter':
					actionContainer.append('<span class="action-chapter">«»</span>');
					actionContainer.append('<span class="action-blockinfo"> </span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'section':
					actionContainer.append('<span class="action-section">«»</span>');
					actionContainer.append('<span class="action-chapter">«»</span>');
					actionContainer.append('<span class="action-blockinfo"> </span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'prenote':
					actionContainer.append('<span class="action-prenote"></span>');
					actionContainer.append('<span class="action-fieldset"> </span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'postnote':
					actionContainer.append('<span class="action-postnote"></span>');
					actionContainer.append('<span class="action-fieldset"> </span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'footnote':
					actionContainer.append('<span class="action-footnote">«»</span>')
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'action':
					actionContainer.append('<span class="action-action">«»</span>');
					actionContainer.append('<span class="action-panel"> </span>');
					actionContainer.append('<span class="action-step"> </span>');
					break;
				case 'choice':
					actionContainer.append('<span class="action-choice">«»</span>');
					actionContainer.append('<span class="action-data"> </span>');
					break;
			}
		} else if (target === 'setAttribute') {
			actionContainer.append('<span class="action-name">' + Translator.trans('set') + '</span> <span class="action-target">' + Translator.trans(target) + '</span> <span class="action-data"> '+ Translator.trans('of «%label%»', {'label': data.label }) + '</span> <span class="action-value"> ' + Translator.trans('to') + ' ' + Translator.trans(Simulators.replaceByDataLabel(value)) + '</span>');
		}
		return actionContainer;
	}

	Simulators.drawRuleForInput = function(rule) {
		var ruleElementId = 'rule-' + Math.floor(Math.random() * 100000);
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'panel panel-info sortable rule-container' });
		ruleContainer.append('<div class="panel-heading" role="tab"><button class="btn btn-info pull-right update-button delete-rule">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">#<span class="rule-id">' + rule.id + '</span> ' + Translator.trans('Rule') + ' <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'panel-body panel-collapse collapse', role: 'tabpanel' });
		ruleContainer.append(ruleBody);
		ruleBody.append('<div class="panel panel-default"><div class="panel-body form-inline"><div class="form-group"><label>' + Translator.trans('Name') + '</label><input type="text" class="input-rule-name" value="' + rule.name + '" /></div><div class="form-group"><label>' + Translator.trans('Label') + '</label><input type="text" class="input-rule-label" value="' + rule.label + '" /></div></div></div>');
		ruleBody.append('<div class="panel panel-default"><div class="panel-heading"><h4>' + Translator.trans('When ...') + '</h4></div><div class="panel-body"><div class="conditions"></div></div></div>');
		ruleBody.append('<div class="panel panel-default"><div class="panel-heading"><h4>' + Translator.trans('then do ...') + '</h4></div><div class="panel-body"><div class="if-actions"></div></div></div>');
		ruleBody.append('<div class="panel panel-default"><div class="panel-heading"><h4>' + Translator.trans('else do ...') + '</h4></div><div class="panel-body"><div class="else-actions"></div></div></div>');
		var ruleButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + ruleElementId + '-buttons-panel"></div>');
		var ruleButtonsBody = $('<div class="panel-body rule-buttons"></div>');
		ruleButtonsBody.append('<button class="btn btn-success pull-right validate-edit-rule">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		ruleButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-rule">' + Translator.trans('Cancel') + '</span></button>');
		ruleButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		ruleButtonsPanel.append(ruleButtonsBody);
		ruleBody.append(ruleButtonsPanel);
		return ruleContainer;
	}

	Simulators.addRule = function() {
		var rule = {
			id: rules.length + 1,
			name: 'R' + (rules.length + 1),
			label: '',
			conditions: '',
			ifdata: [],
			elsedata: []
		};
		rules.push(rule);
		var ruleContainer = Simulators.drawRuleForInput(rule);
		$("#business-rules").append(ruleContainer);
		rule.elementId = ruleContainer.attr('id');
		Simulators.bindRule(rule);
		ruleContainer.find('> .panel-heading a').click();
		$("html, body").animate({ scrollTop: ruleContainer.offset().top }, 500);
		$('.update-button').hide();
	}

	Simulators.editRule = function(ruleDisplayContainer) {
		var	rule = {
			id: ruleDisplayContainer.find('.rule-id').text(),
			name: ruleDisplayContainer.find('.rule-name').text(),
			label: ruleDisplayContainer.find('.rule-label').text(),
			conditions: ruleDisplayContainer.find('.rule-conditions').attr("data-value"),
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

	Simulators.checkSimulatorOptions = function(simulatorContainer) {
		if ($.trim($('#simulator-name').val()) === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator name is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if ($.trim($('#simulator-label').val()) === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator label is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if ($.trim($('#simulator-decimalPoint').val()) === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator decimal point is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.bindSimulatorOptions = function(simulatorContainer) {
		simulatorContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		simulatorContainer.find('select[data-attribute=dateFormat], select[data-attribute=moneySymbol], select[data-attribute=symbolPosition]').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		simulatorContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		simulatorContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		simulatorContainer.find('.validate-edit-simulator').click(function() {
			if (Simulators.checkSimulatorOptions(simulatorContainer)) {
				simulatorContainer.find('.alert').hide();
				$('#simulator-attributes-panel-holder').find("p[data-attribute='name']").attr('data-value', $('#simulator-name').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='name']").text($('#simulator-name').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='label']").attr('data-value', $('#simulator-label').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='label']").text($('#simulator-label').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").attr('data-value', $('#simulator-referer').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").text($('#simulator-referer').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").attr('data-value', $('#simulator-defaultView').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").text($('#simulator-defaultView').val());
				$('#simulator').find('.panel-heading h4.panel-title').text($('#simulator-label').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").attr('data-value', $('#simulator-dateFormat').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").text($('#simulator-dateFormat option:selected').text());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").attr('data-value', $('#simulator-decimalPoint').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").text($('#simulator-decimalPoint').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='moneySymbol']").attr('data-value', $('#simulator-moneySymbol').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='moneySymbol']").text($('#simulator-moneySymbol option:selected').text());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='symbolPosition']").attr('data-value', $('#simulator-symbolPosition').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='symbolPosition']").text($('#simulator-symbolPosition option:selected').text());
				if ($('#simulator-dynamic').is(':checked')) {
					$('#simulator-attributes-panel-holder').find("p[data-attribute='dynamic']").attr('data-value', '1');
					$('#simulator-attributes-panel-holder').find("p[data-attribute='dynamic']").text(Translator.trans('Yes'));
				} else {
					$('#simulator-attributes-panel-holder').find("p[data-attribute='dynamic']").attr('data-value', '0');
					$('#simulator-attributes-panel-holder').find("p[data-attribute='dynamic']").text(Translator.trans('No'));
				}
				if ($('#simulator-memo').is(':checked')) {
					$('#simulator-attributes-panel-holder').find("p[data-attribute='memo']").attr('data-value', '1');
					$('#simulator-attributes-panel-holder').find("p[data-attribute='memo']").text(Translator.trans('Yes'));
				} else {
					$('#simulator-attributes-panel-holder').find("p[data-attribute='memo']").attr('data-value', '0');
					$('#simulator-attributes-panel-holder').find("p[data-attribute='memo']").text(Translator.trans('No'));
				}
				$('#simulator-description-panel-holder').find(".simulator-description").html($('#simulator-description').val());
				$('#simulator-related-informations-panel-holder').find(".simulator-related-informations").html($('#simulator-related-informations').val());
				$('#simulator-attributes-panel').remove();
				$('#simulator-description-panel').remove();
				$('#simulator-related-informations-panel').remove();
				$('#simulator-buttons-panel').remove();
				$('#simulator-attributes-panel-holder').show();
				$('#simulator-description-panel-holder').show();
				$('#simulator-related-informations-panel-holder').show();
				Admin.updated = true;
				$('.update-button').show();
			}
		});
		simulatorContainer.find('.cancel-edit-simulator').click(function() {
			$('#simulator-attributes-panel').remove();
			$('#simulator-description-panel').remove();
			$('#simulator-related-informations-panel').remove();
			$('#simulator-buttons-panel').remove();
			$('#simulator-attributes-panel-holder').show();
			$('#simulator-description-panel-holder').show();
			$('#simulator-related-informations-panel-holder').show();
			$('.update-button').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
		});
		simulatorContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		simulatorContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		simulatorContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}

	Simulators.drawSimulatorOptionsForInput = function(simulator) {
		var simulatorAttributesPanel = $('<div class="panel panel-default" id="simulator-attributes-panel"></div>');
		var simulatorAttributesPanelBody = $('<div class="panel-body"></div>');
		var simulatorAttributesContainer = $('<div class="attributes-container droppable"></div>');
		var simulatorAttributes = $('<div></div>');
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-name', 'text', 'name', Translator.trans('Name'), simulator.name, true, 'name'));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-label', 'text', 'label', Translator.trans('Label'), simulator.label, true, 'label'));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-defaultView', 'text', 'defaultView', Translator.trans('Default view'), simulator.defaultView, false, 'defaultView'));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-referer', 'text', 'referer', Translator.trans('Main referer'), simulator.referer, false, 'referer'));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-dateFormat', 'select', 'dateFormat', Translator.trans('Date format'), simulator.dateFormat, true, Translator.trans('Select a format'), JSON.stringify(Simulators.dateFormats)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-decimalPoint', 'text', 'decimalPoint', Translator.trans('Decimal point'), simulator.decimalPoint, true, Translator.trans('Decimal point')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-moneySymbol', 'select', 'moneySymbol', Translator.trans('Currency symbol'), simulator.moneySymbol, true, Translator.trans('Select a symbol'), JSON.stringify(Simulators.moneySymbols)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-symbolPosition', 'select', 'symbolPosition', Translator.trans('Symbol position'), simulator.symbolPosition, true, Translator.trans('Select a position'), JSON.stringify({ 'before': Translator.trans('before currency'), 'after': Translator.trans('after currency') })));
		if (simulator.dynamic == 1) {
			simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-dynamic', 'checkbox', 'dynamic', Translator.trans('Interactive UI'), simulator.dynamic, false, 'dynamic'));
		}
		if (simulator.memo == 1) {
			simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-memo', 'checkbox', 'memo', Translator.trans('Data memo ?'), simulator.memo, false, 'memo'));
		}
		simulatorAttributesContainer.append(simulatorAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		optionalAttributes.append('<li class="list-group-item" data-element="simulator" data-type="text" data-name="defaultView" data-placeholder="' + Translator.trans('Default View value') + '">' + Translator.trans('Default view') + '</li>');
		optionalAttributes.append('<li class="list-group-item" data-element="simulator" data-type="text" data-name="referer" data-placeholder="' + Translator.trans('Main referer value') + '">' + Translator.trans('Main referer') + '</li>');
		var dynamicAttribute = $('<li class="list-group-item" data-element="simulator" data-type="checkbox" data-name="dynamic" data-placeholder="">' + Translator.trans('Interactive UI') + '</li>');
		optionalAttributes.append(dynamicAttribute);
		if (simulator.dynamic == 1) {
			dynamicAttribute.hide();
		}
		var memoAttribute = $('<li class="list-group-item" data-element="simulator" data-type="checkbox" data-name="memo" data-placeholder="">' + Translator.trans('Data memo ?') + '</li>');
		optionalAttributes.append(memoAttribute);
		if (simulator.memo == 1) {
			memoAttribute.hide();
		}
		optionalAttributesPanel.append(optionalAttributes);
		simulatorAttributesContainer.append(optionalAttributesPanel);
		simulatorAttributesPanelBody.append(simulatorAttributesContainer);
		simulatorAttributesPanel.append(simulatorAttributesPanelBody);
		var simulatorDescriptionPanel = $('<div class="panel panel-default" id="simulator-description-panel"></div>');
		simulatorDescriptionPanel.append('<div class="panel-heading">' + Translator.trans('Description') + '</div>');
		var simulatorDescriptionBody = $('<div class="panel-body simulator-description"></div>');
		simulatorDescriptionBody.append('<textarea rows="10" name="simulator-description" id="simulator-description" wrap="hard" class="form-control">' + simulator.description + '</textarea>');
		simulatorDescriptionPanel.append(simulatorDescriptionBody);
		var simulatorRelatedInformationsPanel = $('<div class="panel panel-default" id="simulator-related-informations-panel"></div>');
		simulatorRelatedInformationsPanel.append('<div class="panel-heading">' + Translator.trans('Related informations') + '</div>');
		var simulatorRelatedInformationsBody = $('<div class="panel-body simulator-related-informations"></div>');
		simulatorRelatedInformationsBody.append('<textarea rows="10" name="simulator-related-informations" id="simulator-related-informations" wrap="hard" class="form-control">' + simulator.relatedInformations + '</textarea>');
		simulatorRelatedInformationsPanel.append(simulatorRelatedInformationsBody);
		var simulatorButtonsPanel = $('<div class="panel panel-default" id="simulator-buttons-panel"></div>');
		var simulatorButtonsBody = $('<div class="panel-body simulator-buttons"></div>');
		simulatorButtonsBody.append('<button class="btn btn-success pull-right validate-edit-simulator">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		simulatorButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-simulator">' + Translator.trans('Cancel') + '</span></button>');
		simulatorButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		simulatorButtonsPanel.append(simulatorButtonsBody);
		var simulatorOptions = $('<div class="panel-body"></div>');
		simulatorOptions.append(simulatorAttributesPanel);
		simulatorOptions.append(simulatorDescriptionPanel);
		simulatorOptions.append(simulatorRelatedInformationsPanel);
		simulatorOptions.append(simulatorButtonsPanel);
		return simulatorOptions;
	}

	Simulators.bindData = function(dataPanelContainer) {
		dataPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		dataPanelContainer.find('select[data-attribute=type]').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		dataPanelContainer.find('.cancel-edit-data').click(function() {
			dataPanelContainer.replaceWith(Simulators.dataBackup);
			Simulators.dataBackup.find('button.edit-data').click(function(e) {
				e.preventDefault();
				Simulators.editData($($(this).attr('data-parent')));
			});
			Simulators.dataBackup.find('button.delete-data').click(function(e) {
				e.preventDefault();
				Simulators.deleteData($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
		});
		dataPanelContainer.find('.cancel-add-data').click(function() {
			dataPanelContainer.remove();
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
		});
		dataPanelContainer.find('.validate-edit-data, .validate-add-data').click(function() {
			var dataContainerGroup = dataPanelContainer.parent();
			var dataContainer = dataPanelContainer.find('.data-container');
			var attributes = dataContainer.find('.attributes-container');
			var data = { id: dataContainer.attr('data-id') };
			attributes.find('input.simple-value, select.simple-value, span.attribute-expression').each(function (index) {
				var value;
				if ($(this).hasClass('attribute-expression')) {
					value = $(this).expressionbuilder('val');
				} else {
					value = $(this).val();
				}
				data[$(this).attr('data-attribute')] = value;
			});
			data['description'] =  dataPanelContainer.find('.data-description').val();
			var newDataPanel = Simulators.drawDataForDisplay(data);
			var choices = [];
			if (data.type == 'choice') {
				var choicesPanel = Simulators.drawChoicesForDisplay(data.id);
				var choicesContainer = choicesPanel.find('> .panel-body');
				var id = 0;
				dataPanelContainer.find('.choice-panel').each(function (index) {
					var values = $(this).find('input');
					choices.push({
						id:  ++id,
						name: values.eq(0).val(),
						label: values.eq(1).val()
					});
					choicesContainer.append(Simulators.drawChoiceForDisplay({
						id: id,
						value: values.eq(0).val(),
						label: values.eq(1).val()
					}));
				});
				dataPanelContainer.find('.choice-source-container').each(function (index) {
					var values = $(this).find('input');
					var choiceSource = {
						id: $(this).attr('data-id'),
						valueColumn: values.eq(0).val(),
						labelColumn: values.eq(1).val(),
						idColumn: ''
					};
					if (values.length > 2) {
						choiceSource.idColumn = values.eq(2).val();
					}
					choicesContainer.append(Simulators.drawChoiceSourceForDisplay(choiceSource));
				});
				newDataPanel.find('.collapse').find('> .panel-body').append(choicesPanel);
			}
			dataPanelContainer.replaceWith(newDataPanel);
			newDataPanel.find('button.edit-data').click(function(e) {
				e.preventDefault();
				Simulators.editData($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.delete-data').click(function(e) {
				e.preventDefault();
				Simulators.deleteData($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			if ($(this).hasClass('validate-edit-data')) {
				var name = Simulators.dataBackup.find("p[data-attribute='name']").attr('data-value');
				delete Simulators.dataset[name];
			}
			Simulators.dataset[data.name] = {
				id: data.id,
				label: data.label,
				type: data.type,
				description: data.description
			}
			if (choices.length > 0) {
				Simulators.dataset[data.name].options = choices;
			}
			$('.update-button').show();
			Admin.updated = true;
			$("html, body").animate({ scrollTop: newDataPanel.offset().top }, 500);
		});
		dataPanelContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		dataPanelContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		dataPanelContainer.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
		dataPanelContainer.find('select[data-attribute=type]').change(function(e) {
			var type = $(this).val();
			if (type === 'choice') {
				var choicesPanel;
				if (Simulators.dataChoicesBackup) {
					choicesPanel = Simulators.dataChoicesBackup;
				} else {
					var typeId = $(this).attr('id');
					var id = typeId.match(/^data-(\d+)-type/)[1];
					choicesPanel = Simulators.drawChoicesForInput(id);
					choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
					choicesPanel.find('.edit-choice-source').removeClass('update-button').hide();
				}
				dataPanelContainer.find('.description-panel').after(choicesPanel);
				Simulators.bindChoices(choicesPanel);
			} else {
				Simulators.dataChoicesBackup = dataPanelContainer.find('.choices-panel').detach();
			}
		});
		dataPanelContainer.find('.attribute-expression').each(function( index ) {
			var expression = $( this );
			expression.expressionbuilder({
				fields: Simulators.dataset,
				constants: Simulators.expressionOptions.constants,
				functions: Simulators.expressionOptions.functions,
				operators: Simulators.expressionOptions.operators,
				initial: expression.attr('data-value'),
				onCompleted: Simulators.expressionOptions.onCompleted,
				onEditing: Simulators.expressionOptions.onEditing,
				onError: Simulators.expressionOptions.onError,
				language: Simulators.expressionOptions.language,
				operandHolder: Simulators.expressionOptions.operandHolder,
				operatorHolder: Simulators.expressionOptions.operatorHolder,
				nestedExpression: Simulators.expressionOptions.nestedExpression
			});
		});
	}

	Simulators.bindDatagroup = function(dataPanelContainer) {
		dataPanelContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
		dataPanelContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		dataPanelContainer.find('.cancel-edit-datagroup').click(function() {
			dataPanelContainer.replaceWith(Simulators.datagroupBackup);
			Simulators.datagroupBackup.find('button.edit-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.editDatagroup($($(this).attr('data-parent')));
			});
			Simulators.datagroupBackup.find('button.add-data').click(function(e) {
				e.preventDefault();
				Simulators.addData($($(this).attr('data-parent')));
			});
			Simulators.datagroupBackup.find('button.delete-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.deleteDatagroup($($(this).attr('data-parent')));
			});
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
		});
		dataPanelContainer.find('.cancel-add-datagroup').click(function() {
			dataPanelContainer.remove();
			Simulators.dataChoicesBackup = null;
			$('.update-button').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
		});
		dataPanelContainer.find('.validate-edit-datagroup, .validate-add-datagroup').click(function() {
			var dataContainerGroup = dataPanelContainer.parent();
			var dataContainer = dataPanelContainer.find('.data-container');
			var attributes = dataContainer.find('.attributes-container');
			var datagroup = { id: dataContainer.attr('data-id') };
			attributes.find('input.simple-value').each(function (index) {
				var value = $(this).val();
				datagroup[$(this).attr('data-attribute')] = value;
			});
			datagroup['description'] =  dataPanelContainer.find('.datagroup-description').val();
			var newDataPanel = Simulators.drawDatagroupForDisplay(datagroup);
			newDataPanel.find('.description-panel').after(dataPanelContainer.find('.datas-panel'));
			dataPanelContainer.replaceWith(newDataPanel);
			newDataPanel.find('button.edit-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.editDatagroup($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.add-data').click(function(e) {
				e.preventDefault();
				Simulators.addData($($(this).attr('data-parent')));
			});
			newDataPanel.find('button.delete-datagroup').click(function(e) {
				e.preventDefault();
				Simulators.deleteDatagroup($($(this).attr('data-parent')));
			});
			$('.update-button').show();
			Admin.updated = true;
		});
	}

	Simulators.bindChoices = function(choicesPanel) {
		choicesPanel.find('button.add-choice').click(function(e) {
			var choicesContainer = choicesPanel.find('> .panel-body');
			var id = choicesContainer.children('div.panel').length + 1;
			var dataId = choicesPanel.attr('id').match(/^data-(\d+)/)[1];
			var choice = {
				id: id,
				dataId: dataId,
				value: '',
				label: ''
			};
			var choicePanel = Simulators.drawChoiceForInput(choice);
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesContainer.append(choicePanel);
			Simulators.bindChoice(choicePanel);
		});
		choicesPanel.find('button.add-choice-source').click(function(e) {
			var choicesContainer = choicesPanel.find('> .panel-body');
			var dataId = choicesPanel.attr('id').match(/^data-(\d+)/)[1];
			var choiceSource = {
				id: 1,
				dataId: dataId,
				idColumn: '',
				valueColumn: '',
				labelColumn: ''
			};
			var choicePanel = Simulators.drawChoiceSourceForInput(choiceSource);
			choicesPanel.find('button.add-choice').removeClass('update-button').hide();
			choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
			choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
			choicesContainer.append(choicePanel);
			Simulators.bindChoiceSource(choicePanel);
		});
		choicesPanel.find('button.delete-choice-source').click(function(e) {
			var choicesContainer = choicesPanel.find('> .panel-body');
			choicesContainer.find('.attributes-container').remove();
			choicesPanel.find('button.add-choice').addClass('update-button').show();
			choicesPanel.find('button.add-choice-source').addClass('update-button').show();
			choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
		});
	}

	Simulators.drawChoicesForDisplay = function(dataId) {
		var choicesPanel = $('<div>', { 'class': 'panel panel-default choices-panel', id: 'data-' + dataId + '-choices-panel' });
		choicesPanel.append('<div class="panel-heading">' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="panel-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Simulators.drawChoicesForInput = function(dataId) {
		var choicesPanel = $('<div>', { 'class': 'panel panel-default choices-panel', id: 'data-' + dataId + '-choices-panel' });
		choicesPanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-choice-source">' + Translator.trans('Delete source') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-default pull-right update-button add-choice-source">' + Translator.trans('Add source') + ' <span class="glyphicon glyphicon-plus-sign"></span></button><button class="btn btn-default pull-right update-button add-choice">' + Translator.trans('Add choice') + ' <span class="glyphicon glyphicon-plus-sign"></span></button>' + Translator.trans('Choices') + '</div>');
		var choicesPanelBody = $('<div class="panel-body"></div>');
		choicesPanel.append(choicesPanelBody);
		return choicesPanel;
	}

	Simulators.bindChoice = function(choicePanel) {
		choicePanel.find('button.delete-choice').click(function(e) {
			var choicesPanel = choicePanel.parents('.choices-panel');
			choicePanel.remove();
			if (choicesPanel.find('> .panel-body').children().length == 0) {
				var choicesPanelHeading = choicesPanel.find('> .panel-heading');
				choicesPanelHeading.find('button.add-choice-source').addClass('update-button').show();
			}
		});
	}

	Simulators.drawChoiceForDisplay = function(choice) {
		var choicePanel = $('<div>', { 'class': 'panel panel-default choice-container',  'data-id': choice.id });
		choicePanel.append('<div class="panel-heading">' + Translator.trans('Choice %id%', { 'id': choice.id }) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'panel-body', id: 'data-' + choice.dataId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choice.dataId + '-choice-' + choice.id, 'text', 'value', Translator.trans('Value'), choice.value, true, Translator.trans('Choice value')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choice.dataId + '-choice-' + choice.id, 'text', 'label', Translator.trans('Label'), choice.label, true, Translator.trans('Choice label')));
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Simulators.drawChoiceForInput = function(choice) {
		var choicePanel = $('<div>', { 'class': 'panel panel-default choice-panel',  'data-id': choice.id  });
		choicePanel.append('<div class="panel-heading"><button class="btn btn-default pull-right update-button delete-choice">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button>' + Translator.trans('Choice %id%', {'id': choice.id}) + '</div>');
		var choicePanelBody = $('<div>', { 'class': 'panel-body', id: 'data-' + choice.dataId + '-choice-' + choice.id + '-panel' });
		var attributesContainer = $('<div class="attributes-container"></div>');
		var attributes = $('<div></div>');
		attributes.append('<div class="form-group col-sm-12"><label for="data-' + choice.dataId + '-choice-' + choice.id + '-value" class="col-sm-4 control-label">' + Translator.trans('Value') + '</label><div class="col-sm-8"><input type="text" name="data-' + choice.dataId + '-choice-' + choice.id + '-value" id="data-' + choice.dataId + '-choice-' + choice.id + '-value" class="form-control simple-value" placeholder="' + Translator.trans('Choice value') + '"  value="' + choice.value + '" /></div></div>');
		attributes.append('<div class="form-group col-sm-12"><label for="data-' + choice.dataId + '-choice-' + choice.id + '-label" class="col-sm-4 control-label">' + Translator.trans('Label') + '</label><div class="col-sm-8"><input type="text" name="data-' + choice.dataId + '-choice-' + choice.id + '-label" id="data-' + choice.dataId + '-choice-' + choice.id + '-label" class="form-control simple-value" placeholder="' + Translator.trans('Choice label') + '"  value="' + choice.label + '" /></div></div>');
		attributesContainer.append(attributes);
		choicePanelBody.append(attributesContainer);
		choicePanel.append(choicePanelBody);
		return choicePanel;
	}

	Simulators.bindChoiceSource = function(choiceSourceContainer) {
		choiceSourceContainer.find('.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		choiceSourceContainer.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		choiceSourceContainer.find('.optional-attributes li' ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		choiceSourceContainer.find('> div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
	}

	Simulators.drawChoiceSourceForDisplay = function(choiceSource) {
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, false, Translator.trans('Source column id')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, true, Translator.trans('Source column value')));
		attributes.append(Simulators.simpleAttributeForDisplay('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id, 'text', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, true, Translator.trans('Source column label')));
		attributesContainer.append(attributes);
		return attributesContainer;
	}

	Simulators.drawChoiceSourceForInput = function(choiceSource) {
		var attributesContainer = $('<div class="attributes-container choice-source-container" data-id="' + choiceSource.id + '"></div>');
		var attributes = $('<div></div>');
		attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-valueColumn', 'text', 'valueColumn', Translator.trans('Source column value'), choiceSource.valueColumn, true, Translator.trans('Source column value')));
		attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-labelColumn', 'text', 'labelColumn', Translator.trans('Source column label'), choiceSource.labelColumn, true, Translator.trans('Source column label')));
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		var optionalAttribute = $('<li class="list-group-item" data-element="data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '" data-type="text" data-name="idColumn" data-placeholder="' + Translator.trans('Source column id value') + '">' + Translator.trans('Source column id') + '</li>');
		optionalAttributes.append(optionalAttribute);
		optionalAttributesPanel.append(optionalAttributes);
		if (choiceSource.idColumn) {
			attributes.append(Simulators.simpleAttributeForInput('data-' + choiceSource.dataId + '-choicesource-' + choiceSource.id + '-idColumn', 'text', 'idColumn', Translator.trans('Source column id'), choiceSource.idColumn, false, Translator.trans('Source column id')));
			optionalAttribute.hide();
		}
		attributesContainer.append(attributes);
		attributesContainer.append(optionalAttributesPanel);
		return attributesContainer;
	}

	Simulators.drawDataForDisplay = function(data) {
		var dataElementId = 'data-' + data.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-info' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><button class="btn btn-info pull-right update-button delete-data" data-parent="#' + dataElementId + '">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-info pull-right update-button edit-data" data-parent="#' + dataElementId + '">' + Translator.trans('Edit') + ' <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">#' + data.id + ' : ' + data.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container" id="' + dataElementId + '-attributes-panel" data-id="' + data.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'name', Translator.trans('Name'), data.name, true, Translator.trans('Data name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'label', Translator.trans('Label'), data.label, true, Translator.trans('Data label')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'select', 'type', Translator.trans('Type'), data.type, true, Translator.trans('Select a data type'), JSON.stringify(Admin.types)));
		$.each(Simulators.optionalAttributes, function (name, attr) {
			if (data[name]) {
				var attribute = attr.type === 'expression' ?
					Simulators.expressionAttributeForDisplay(dataElementId, name, attr.label, data[name], false, attr.placeholder) :
					Simulators.simpleAttributeForDisplay(dataElementId, attr.type, name, attr.label, data[name], false, attr.placeholder);
				requiredAttributes.append(attribute);
			} 
		});
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body data-description">' + data.description + '</div></div>');
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDataForInput = function(data) {
		var dataElementId = 'data-' + data.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-info' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">#' + data.id + ' : ' + data.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container" id="' + dataElementId + '-attributes-panel" data-id="' + data.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-name" class="col-sm-2 control-label">' + Translator.trans('Name') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-name" id="' + dataElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="Data name" value="' + data.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-label" class="col-sm-2 control-label">' + Translator.trans('Label') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-label" id="' + dataElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="Data label" value="' + data.label + '" /></div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForInput(dataElementId + '-type', 'select', 'type', 'Type', data.type, true, Translator.trans('Select a data type'), JSON.stringify(Admin.types)));
		attributesContainer.append(requiredAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes panel panel-default"></div>');
		optionalAttributesPanel.append('<div class="panel-heading"><h4 class="panel-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		$.each(Simulators.optionalAttributes, function (name, attr) {
			var optionalAttribute = attr.type === 'expression' ?
				$('<li class="list-group-item" data-element="' + dataElementId + '" data-type="text" data-name="' + name + '" data-expression="true" data-placeholder="' + attr.placeholder + ' value">' + attr.label + '</li>') :
				$('<li class="list-group-item" data-element="' + dataElementId + '" data-type="' + attr.type + '" data-name="' + name + '" data-placeholder="' + attr.placeholder + ' value">' + attr.label + '</li>');
			optionalAttributes.append(optionalAttribute);
			if (data[name]) {
				var attribute = attr.type === 'expression' ?
					Simulators.expressionAttributeForInput(dataElementId + '-' + name, name, attr.label, data[name], false, attr.placeholder) :
					Simulators.simpleAttributeForInput(dataElementId + '-' + name, attr.type, name, attr.label, data[name], false, attr.placeholder);
				requiredAttributes.append(attribute);
				optionalAttribute.hide();
			} 
		});
		optionalAttributesPanel.append(optionalAttributes);
		attributesContainer.append(optionalAttributesPanel);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default description-panel" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body"><textarea rows="5" name="' + dataElementId + '-description" id="' + dataElementId + '-description" wrap="hard" class="form-control data-description">' + data.description + '</textarea></div></div>');
		var dataButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + dataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="panel-body data-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success pull-right validate-edit-data">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		dataButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-data">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataPanelBody.append(dataButtonsPanel);
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDatagroupForDisplay = function(datagroup) {
		var dataElementId = 'datagroup-' + datagroup.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-success' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><button class="btn btn-success pull-right update-button delete-datagroup" data-parent="#' + dataElementId + '">' + Translator.trans('Delete') + ' <span class="glyphicon glyphicon-minus-sign"></span></button><button class="btn btn-success pull-right update-button add-data" data-parent="#' + dataElementId + '">' + Translator.trans('Add data') + ' <span class="glyphicon glyphicon-plus-sign"></span></button><button class="btn btn-success pull-right update-button edit-datagroup" data-parent="#' + dataElementId + '">' + Translator.trans('Edit datagroup') + ' <span class="glyphicon glyphicon-pencil"></span></button><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">' + Translator.trans('Group') + ' ' + datagroup.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container datagroup" id="' + dataElementId + '-attributes-panel" data-id="' + datagroup.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'name', Translator.trans('Group Name'), datagroup.name, true, Translator.trans('Group Name')));
		requiredAttributes.append(Simulators.simpleAttributeForDisplay(dataElementId, 'text', 'label', Translator.trans('Group Label'), datagroup.label, true, Translator.trans('Group Label')));
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default description-panel" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body datagroup-description">' + datagroup.description + '</div></div>');
		dataPanelBody.append('<div class="panel panel-default datas-panel" id="' + dataElementId + '-datas-panel"><div class="panel-body sortable"></div></div>');
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.drawDatagroupForInput = function(datagroup) {
		var dataElementId = 'datagroup-' + datagroup.id;
		var dataPanelContainer = $('<div>', { 'class': 'panel-group', id: dataElementId, role: 'tablist', 'aria-multiselectable': 'true' });
		var dataPanel = $('<div>', { 'class': 'panel panel-success' });
		dataPanel.append('<div class="panel-heading" role="tab" id="' + dataElementId + '-panel"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#' + dataElementId + '" href="#collapse' + dataElementId + '" aria-expanded="true" aria-controls="collapse' + dataElementId + '">' + Translator.trans('Group') + ' ' + datagroup.label + '</a></h4></div>');
		var dataPanelCollapse = $('<div id="collapse' + dataElementId + '" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="' + dataElementId + '-panel"></div>');
		var dataPanelBody = $('<div class="panel-body"></div>');
		var dataContainer = $('<div class="panel panel-default data-container datagroup" id="' + dataElementId + '-attributes-panel" data-id="' + datagroup.id + '"></div>');
		var dataContainerBody = $('<div class="panel-body"></div>');
		var attributesContainer = $('<div class="attributes-container"></div>');
		var requiredAttributes = $('<div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-name" class="col-sm-2 control-label">' + Translator.trans('Group Name') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-name" id="' + dataElementId + '-name" data-attribute="name" class="form-control simple-value" placeholder="' + Translator.trans('Group name') + '" value="' + datagroup.name + '" /></div></div>');
		requiredAttributes.append('<div class="form-group col-sm-12"><label for="' + dataElementId + '-label" class="col-sm-2 control-label">' + Translator.trans('Group Label') + '</label><div class="col-sm-10"><input type="text" name="' + dataElementId + '-label" id="' + dataElementId + '-label" data-attribute="label" class="form-control simple-value" placeholder="' + Translator.trans('Group label') + '" value="' + datagroup.label + '" /></div></div>');
		attributesContainer.append(requiredAttributes);
		dataContainerBody.append(attributesContainer);
		dataContainer.append(dataContainerBody);
		dataPanelBody.append(dataContainer);
		dataPanelBody.append('<div class="panel panel-default description-panel" id="' + dataElementId + '-description-panel"><div class="panel-heading">' + Translator.trans('Description') + '</div><div class="panel-body"><textarea rows="5" name="' + dataElementId + '-description" id="' + dataElementId + '-description" wrap="hard" class="form-control datagroup-description">' + datagroup.description + '</textarea></div></div>');
		var dataButtonsPanel = $('<div class="panel panel-default buttons-panel" id="' + dataElementId + '-buttons-panel"></div>');
		var dataButtonsBody = $('<div class="panel-body datagroup-buttons"></div>');
		dataButtonsBody.append('<button class="btn btn-success pull-right validate-edit-datagroup">' + Translator.trans('Validate') + ' <span class="glyphicon glyphicon-ok"></span></button>');
		dataButtonsBody.append('<button class="btn btn-default pull-right cancel-edit-datagroup">' + Translator.trans('Cancel') + '</span></button>');
		dataButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		dataButtonsPanel.append(dataButtonsBody);
		dataPanelBody.append(dataButtonsPanel);
		dataPanelCollapse.append(dataPanelBody);
		dataPanel.append(dataPanelCollapse);
		dataPanelContainer.append(dataPanel);
		return dataPanelContainer;
	}

	Simulators.removeAttribute = function(attr) {
		var id =  attr.parent('label.control-label').attr('for');
		var input = $('#' + id);
		var ids  = input.attr('id').split('-');
		var name = ids.pop();
		var element = ids.join('-');
		var li = attr.parents('div.attributes-container').children('div.optional-attributes').children('ul').children("li[data-element='" + element +"'][data-name='" + name +"']");
		li.show();
		attr.parent('label').parent('div.form-group').remove();
	}

	Simulators.addData = function(dataContainerGroup) {
		$('.update-button').hide();
		var data = {
			id: Simulators.maxDatasetId() + 1, 
			name: '',
			label: '',
			description: ''
		};
		var dataPanelContainer = Simulators.drawDataForInput(data);
		dataPanelContainer.find('button.cancel-edit-data').addClass('cancel-add-data').removeClass('cancel-edit-data');
		dataPanelContainer.find('button.validate-edit-data').addClass('validate-add-data').removeClass('validate-edit-data');
		var datasPanel;
		var parentId = dataContainerGroup.attr('id');
		if (parentId === 'datas') {
			datasPanel = $("#collapsedatas").find("> div.sortable");
		} else {
			datasPanel = dataContainerGroup.find(".datas-panel > div.sortable");
		}
		datasPanel.append(dataPanelContainer);
		Simulators.bindData(dataPanelContainer);
		dataContainerGroup.find('a[data-toggle="collapse"]').each(function() {
			var objectID=$(this).attr('href');
			if($(objectID).hasClass('in')===false) {
				$(objectID).collapse('show');
			}
		});
		$("html, body").animate({ scrollTop: dataPanelContainer.offset().top }, 500);
	}

	Simulators.editData = function(dataContainerGroup) {
		$('.update-button').hide();
		var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
		var attributesContainer = dataContainer.find('.attributes-container');
		var data = {
			id: dataContainer.attr('data-id'), 
			name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
			label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
			type: attributesContainer.find("p[data-attribute='type']").attr('data-value'),
			description: dataContainerGroup.find('.data-description').html()
		};
		$.each(Simulators.optionalAttributes, function (name, attr) {
			var oattr = attributesContainer.find("p[data-attribute='" + name + "'], span[data-attribute='" + name + "']");
			if (oattr.length > 0) {
				data[name] = oattr.attr('data-value');
			}
		});
		var dataPanelContainer = Simulators.drawDataForInput(data);
		if (data.type === 'choice') {
			var choicesPanel = Simulators.drawChoicesForInput(data.id);
			var choiceContainers = dataContainerGroup.find('div.choice-container');
			if (choiceContainers.length > 0) {
				choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
				choicesPanel.find('button.delete-choice-source').removeClass('update-button').hide();
				choiceContainers.each(function(c) {
					var choice = {
						id : $(this).attr('data-id'),
						dataId: data.id,
						value: $(this).find("p[data-attribute='value']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value')
					};
					var choicePanel = Simulators.drawChoiceForInput(choice);
					choicesPanel.find('> .panel-body').append(choicePanel);
					Simulators.bindChoice(choicePanel);
				});
			} else {
				var choiceSourceContainers = dataContainerGroup.find('div.choice-source-container');
				if (choiceSourceContainers.length > 0) {
					choicesPanel.find('button.delete-choice-source').addClass('update-button').show();
					choicesPanel.find('button.add-choice').removeClass('update-button').hide();
					choicesPanel.find('button.add-choice-source').removeClass('update-button').hide();
					var choiceSource = {
						id : choiceSourceContainers.eq(0).attr('data-id'),
						dataId: data.id,
						valueColumn: choiceSourceContainers.eq(0).find("p[data-attribute='valueColumn']").attr('data-value'),
						labelColumn: choiceSourceContainers.eq(0).find("p[data-attribute='labelColumn']").attr('data-value'),
						idColumn: choiceSourceContainers.eq(0).find("p[data-attribute='idColumn']").attr('data-value')
					};
					var choicePanel = Simulators.drawChoiceSourceForInput(choiceSource);
					choicesPanel.find('> .panel-body').append(choicePanel);
					Simulators.bindChoiceSource(choicePanel);
				}
			}
			dataPanelContainer.find('.description-panel').after(choicesPanel);
			Simulators.bindChoices(choicesPanel);
		}
		Simulators.dataBackup = dataContainerGroup.replaceWith(dataPanelContainer);
		Simulators.bindData(dataPanelContainer);
		dataPanelContainer.find('> .panel-heading a').click();
		$("html, body").animate({ scrollTop: dataPanelContainer.offset().top }, 500);
	}

	Simulators.deleteData = function(dataContainerGroup) {
		var dataContainer = dataContainerGroup.find('.data-container, .datagroup-data-container');
		var attributesContainer = dataContainer.find('.attributes-container');
		var dataLabel = attributesContainer.find("p[data-attribute='label']").attr('data-value');
		bootbox.confirm({
			title: Translator.trans('Deleting data'),
		message: Translator.trans("Are you sure you want to delete the data : %label%", { 'label': dataLabel }), 
			callback: function(confirmed) {
				if (confirmed) {
					var name = attributesContainer.find("p[data-attribute='name']").attr('data-value');
					delete Simulators.dataset[name];
					dataContainerGroup.remove();
					$('.save-simulator').show();
					Admin.updated = true;
				}
			}
		}); 
	}

	Simulators.addDatagroup = function(dataContainerGroup) {
		$('.update-button').hide();
		var datagroup = {
			id: Simulators.maxDatasetId() + 1, 
			name: '',
			label: '',
			description: ''
		};
		var dataPanelContainer = Simulators.drawDatagroupForInput(datagroup);
		dataPanelContainer.find('button.cancel-edit-datagroup').addClass('cancel-add-datagroup').removeClass('cancel-edit-datagroup');
		dataPanelContainer.find('button.validate-edit-datagroup').addClass('validate-add-datagroup').removeClass('validate-edit-datagroup');
		var datasPanel;
		var parentId = dataContainerGroup.attr('id');
		if (parentId === 'datas') {
			datasPanel = $("#collapsedatas").find("> div.sortable");
		} else {
			datasPanel = dataContainerGroup.find(".datas-panel > div.sortable");
		}

		datasPanel.append(dataPanelContainer);
		Simulators.bindDatagroup(dataPanelContainer);
		dataContainerGroup.find('a[data-toggle="collapse"]').each(function() {
			var objectID=$(this).attr('href');
			if($(objectID).hasClass('in')===false) {
				$(objectID).collapse('show');
			}
		});
		$("html, body").animate({ scrollTop: dataPanelContainer.offset().top }, 500);
	}

	Simulators.editDatagroup = function(dataContainerGroup) {
		$('.update-button').hide();
		var dataContainer = dataContainerGroup.find('.data-container.datagroup');
		var attributesContainer = dataContainer.find('.attributes-container');
		var datagroup = {
			id: dataContainer.attr('data-id'), 
			name: attributesContainer.find("p[data-attribute='name']").attr('data-value'),
			label: attributesContainer.find("p[data-attribute='label']").attr('data-value'),
			description: dataContainerGroup.find('.datagroup-description').html()
		};
		var dataPanelContainer = Simulators.drawDatagroupForInput(datagroup);
		Simulators.datagroupBackup = dataContainerGroup.clone();
		dataContainer.replaceWith(dataPanelContainer.find('.data-container.datagroup'));
		dataContainerGroup.find('.description-panel').eq(0).replaceWith(dataPanelContainer.find('.description-panel').eq(0));
		dataContainerGroup.find('.description-panel').eq(0).after(dataPanelContainer.find('.buttons-panel'));
		Simulators.bindDatagroup(dataContainerGroup);
		dataContainerGroup.find('> .panel-heading a').click();
		$("html, body").animate({ scrollTop: dataContainerGroup.offset().top }, 500);
	}

	Simulators.deleteDatagroup = function(dataContainerGroup) {
		var dataContainer = dataContainerGroup.find('.data-container.datagroup');
		var attributesContainer = dataContainer.find('.attributes-container');
		var dataLabel = attributesContainer.find("p[data-attribute='label']").attr('data-value');
		bootbox.confirm({
			title: Translator.trans('Deleting datagroup'),
			message: Translator.trans("Are you sure you want to delete the data group : %label% ?", { 'label': dataLabel }), 
			callback: function(confirmed) {
				if (confirmed) {
					// TODO : update dataset to delete all data in this datagroup
					dataContainerGroup.remove();
					$('.save-simulator').show();
					Admin.updated = true;
				}
			}
		}); 
	}

	Simulators.simpleAttributeForDisplay = function(element, type, name, label, value, required, placeholder, options) {
		if (required || value !== '') {
			var attribute = '<div class="form-group col-sm-12">';
			attribute    += '    <label class="col-sm-2 control-label">' + label + '</label>';
			attribute    += '    <div class="col-sm-10">';
			if (type === 'text' || type === 'number') {
				attribute    += '        <p data-attribute="' + name + '" data-value="' + value + '" class="form-control-static simple-value">' + value + '</p>';
			} else if (type === 'checkbox') {
				attribute    += '        <p data-attribute="' + name + '" class="form-control-static simple-value" data-value="' + (value !== '' ? 1 : 0) + '">' + (value !== '' ? Translator.trans('Yes') : Translator.trans('No')) + '</p>';
			} else if (type === 'select') {
				options = jQuery.parseJSON(options);
				$.each(options, function(ovalue, olabel) {
					if (ovalue == value) {
						attribute    += '       <p data-attribute="' + name + '" data-value="' + ovalue + '" class="form-control-static simple-value">' + olabel + '</p>';
					}
				});
			}
			attribute    += '    </div>';
			attribute    += '</div>';
			return $(attribute);
		}
	}

	Simulators.simpleAttributeForInput = function(id, type, name, label, value, required, placeholder, options) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label for="' + id + '" class="col-sm-2 control-label">';
		if (! required) {
			attribute    += '    <span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;';
		}
		attribute    += '    ' + label + '</label>';
		attribute    += '    <div class="col-sm-10">';
		if (type === 'text' || type === 'number') {
			attribute    += '        <input type="' + type + '" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" placeholder="' + placeholder + '"  value="' + value + '" />';
		} else if (type === 'checkbox') {
			attribute    += '        <input type="checkbox" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" value="1" checked="checked" />';
		} else if (type === 'select') {
			options = jQuery.parseJSON(options);
			attribute    += '        <select name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" data-placeholder="' + placeholder + '">';
			$.each(options, function(ovalue, olabel) {
				if (ovalue == value) {
					attribute    += '        <option value="' + ovalue + '" selected="selected">' + olabel + '</option>';
				} else {
					attribute    += '        <option value="' + ovalue + '">' + olabel + '</option>';
				}
			});
			attribute    += '        </select>';
		}
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.expressionAttributeForDisplay = function(element, name, label, value, plainvalue, required, placeholder) {
		if (required || value !== '') {
			var attribute = '<div class="form-group col-sm-12">';
			attribute    += '    <label class="col-sm-2 control-label">' + label + '</label>';
			attribute    += '    <span data-attribute="' + name + '" class="attribute-expression" data-placeholder="' + placeholder + '" data-value="' + value + '">' + plainvalue + '</span>'; 
			attribute    += '</div>';
			return $(attribute);
		}
	}

	Simulators.expressionAttributeForInput = function(id, name, label, value, required, placeholder) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label for="' + id + '" class="col-sm-2 control-label">';
		if (! required) {
			attribute    += '    <span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;';
		}
		attribute    += '    ' + label + '</label>';
		attribute    += '    <span id="' + id + '" data-attribute="' + name + '" class="attribute-expression" data-placeholder="' + placeholder + '"  data-value="' + value + '" />'; 
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.dropAttribute = function(ui, target) {
		var element = ui.attr('data-element');
		var name = ui.attr('data-name');
		var type = ui.attr('data-type');
		var label = ui.text();
		var placeholder = ui.attr('data-placeholder');
		var id = element + '-' + name;
		var expression = ui.attr('data-expression') ? ui.attr('data-expression') === 'true' : false;
		var attribute = expression ?
			Simulators.expressionAttributeForInput(id, name, label, '', false, placeholder) :
			Simulators.simpleAttributeForInput(id, type, name, label, '', false, placeholder, ui.attr('data-options') );
		target.append(attribute);
		var expression = $( attribute ).find(".attribute-expression");
		$( attribute ).find(".attribute-expression").expressionbuilder({
			fields: Simulators.dataset,
			constants: Simulators.expressionOptions.constants,
			functions: Simulators.expressionOptions.functions,
			operators: Simulators.expressionOptions.operators,
			onCompleted: Simulators.expressionOptions.onCompleted,
			onEditing: Simulators.expressionOptions.onEditing,
			onError: Simulators.expressionOptions.onError,
			language: Simulators.expressionOptions.language,
			operandHolder: Simulators.expressionOptions.operandHolder,
			operatorHolder: Simulators.expressionOptions.operatorHolder,
			nestedExpression: Simulators.expressionOptions.nestedExpression
		});
		attribute.find('select.simple-value').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		attribute.find('span.delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});
		ui.hide();
	}

	Simulators.showErrors = function(errors, message) {
		if (message) {
			$('.alert .error-message').text(message);
		}
		var mess = $('.alert ul');
		mess.empty();
		$.each(errors, function( index, value ) {
			mess.append('<li>' + value + '</li>');
		});
		$('.alert').show();
	}

	Simulators.hideErrors = function() {
		$('.alert .error-message').empty();
		$('.alert ul').empty();
		$('.alert').hide();
	}

	global.Simulators = Simulators;
}(this));

$(document).ready(function() {
	if ( $( "#page-simulators" ).length ) {
		$(Simulators.init);
		$('button.edit-simulator').click(function(e) {
			var attributesPanel = $('#simulator-attributes-panel-holder');
			var descriptionPanel = $('#simulator-description-panel-holder');
			var relatedInformationsPanel = $('#simulator-related-informations-panel-holder');
			var simulator = {
				name: attributesPanel.find("p[data-attribute='name']").attr('data-value'),
				label: attributesPanel.find("p[data-attribute='label']").attr('data-value'),
				defaultView: attributesPanel.find("p[data-attribute='defaultView']").attr('data-value'),
				referer: attributesPanel.find("p[data-attribute='referer']").attr('data-value'),
				dateFormat: attributesPanel.find("p[data-attribute='dateFormat']").attr('data-value'),
				decimalPoint: attributesPanel.find("p[data-attribute='decimalPoint']").attr('data-value'),
				moneySymbol: attributesPanel.find("p[data-attribute='moneySymbol']").attr('data-value'),
				symbolPosition: attributesPanel.find("p[data-attribute='symbolPosition']").attr('data-value'),
				dynamic: attributesPanel.find("p[data-attribute='dynamic']").attr('data-value'),
				memo: attributesPanel.find("p[data-attribute='memo']").attr('data-value'),
				description: descriptionPanel.find('.simulator-description').html(),
				relatedInformations: relatedInformationsPanel.find('.simulator-related-informations').html()
			};
			attributesPanel.hide();
			descriptionPanel.hide();
			relatedInformationsPanel.hide();
			descriptionPanel.after(Simulators.drawSimulatorOptionsForInput(simulator).children());
			descriptionPanel.after(relatedInformationsPanel);
			Simulators.bindSimulatorOptions(attributesPanel.parent());
			$('.update-button').hide();
		});
		$('button.add-rule').click(function(e) {
		    e.preventDefault();
			Simulators.addRule();
		});
		$('button.edit-rule').click(function(e) {
		    e.preventDefault();
			Simulators.editRule($($(this).attr('data-parent')));
		});
		$('button.delete-rule').click(function(e) {
		    e.preventDefault();
			Simulators.deleteRule($($(this).attr('data-parent')));
		});
		$('button.add-data').click(function(e) {
		    e.preventDefault();
			Simulators.addData($($(this).attr('data-parent')));
		});
		$('button.edit-data').click(function(e) {
		    e.preventDefault();
			Simulators.editData($($(this).attr('data-parent')));
		});
		$('button.add-datagroup').click(function(e) {
		    e.preventDefault();
			Simulators.addDatagroup($($(this).attr('data-parent')));
		});
		$('button.edit-datagroup').click(function(e) {
		    e.preventDefault();
			Simulators.editDatagroup($($(this).attr('data-parent')));
		});
		$('button.delete-data').click(function(e) {
		    e.preventDefault();
			Simulators.deleteData($($(this).attr('data-parent')));
		});
		$('button.delete-datagroup').click(function(e) {
		    e.preventDefault();
			Simulators.deleteDatagroup($($(this).attr('data-parent')));
		});
		$("#business-rules").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				Simulators.sortRulesFromUI();
			}
		});

		$('#page-simulators textarea').wysihtml5(Admin.wysihtml5Options);
		$('#page-simulators select').select2({
			language: Admin.lang,
			minimumResultsForSearch: 50
		});
		$( '#page-simulators #datas .sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		$('#page-simulators .delete-attribute').click(function() {
			Simulators.removeAttribute($(this));
		});

		$( "#page-simulators .optional-attributes li" ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});

		$( "#page-simulators .optional-attributes li" ).dblclick(function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'));
		});
		$( "#page-simulators .attributes-container > div:first-child" ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target);
			}
		});
		$('#page-simulators button.save-simulator').click(function(e) {
			var simulator = {
				name: $('#simulator-attributes-panel-holder').find("p[data-attribute='name']").attr('data-value'),
				label: $('#simulator-attributes-panel-holder').find("p[data-attribute='label']").attr('data-value'),
				defaultView: $('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").attr('data-value'),
				referer: $('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").attr('data-value'),
				dateFormat: $('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").attr('data-value'),
				decimalPoint: $('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").attr('data-value'),
				moneySymbol: $('#simulator-attributes-panel-holder').find("p[data-attribute='moneySymbol']").attr('data-value'),
				symbolPosition: $('#simulator-attributes-panel-holder').find("p[data-attribute='symbolPosition']").attr('data-value'),
				dynamic: $('#simulator-attributes-panel-holder').find("input[data-attribute='dynamic']").is(':checked') ? 1 : 0,
				memo: $('#simulator-attributes-panel-holder').find("input[data-attribute='memo']").is(':checked') ? 1 : 0,
				description: $('#simulator-description-panel-holder').find(".simulator-description").html(),
				relatedInformations: $('#simulator-related-informations-panel-holder').find('.simulator-related-informations').html()
			};
			$('input[name=simulator]').val(JSON.stringify(simulator));
			var datas = [];
			$('#datas .data-container').each(function(d) {
				if ($(this).hasClass('datagroup')) {
					var gdatas = [];
					$(this).parent().find('.datagroup-data-container').each(function(d) {
						var choices = [];
						$(this).parent().find('.choice-container').each(function(d) {
							choices.push({
								id:  $(this).attr('data-id'),
								value: $(this).find("p[data-attribute='value']").attr('data-value'),
								label: $(this).find("p[data-attribute='label']").attr('data-value'),
							});
						});
						var choicesource = {};
						$(this).parent().find('.choice-source-container').each(function(d) {
							choicesource = {
								id:  $(this).attr('data-id'),
								idColumn: $(this).find("p[data-attribute='idColumn']").attr('data-value'),
								valueColumn: $(this).find("p[data-attribute='valueColumn']").attr('data-value'),
								labelColumn: $(this).find("p[data-attribute='labelColumn']").attr('data-value')
							};
						});
						gdatas.push({
							element: 'data',
							id:  $(this).attr('data-id'),
							name: $(this).find("p[data-attribute='name']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
							type: $(this).find("p[data-attribute='type']").attr('data-value'),
							'default': $(this).find("span[data-attribute='default']").attr('data-value'),
							min: $(this).find("span[data-attribute='min']").attr('data-value'),
							max: $(this).find("span[data-attribute='max']").attr('data-value'),
							content: $(this).find("span[data-attribute='content']").attr('data-value'),
							round: $(this).find("p[data-attribute='round']").attr('data-value'),
							unit: $(this).find("p[data-attribute='unit']").attr('data-value'),
							source: $(this).find("span[data-attribute='source']").attr('data-value'),
							index: $(this).find("span[data-attribute='index']").attr('data-value'),
							memorize: $(this).find("input[data-attribute='memorize']").is(':checked') ? 1 : 0,
							description: $(this).parent().find(".data-description").html(),
							choices: choices,
							choicesource: choicesource
						});
					});
					datas.push({
						element: 'datagroup',
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='name']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						description: $(this).parent().find(".datagroup-description").html(),
						datas: gdatas
					});
				} else {
					var choices = [];
					$(this).parent().find('.choice-container').each(function(d) {
						choices.push({
							id:  $(this).attr('data-id'),
							value: $(this).find("p[data-attribute='value']").attr('data-value'),
							label: $(this).find("p[data-attribute='label']").attr('data-value'),
						});
					});
					var choicesource = {};
					$(this).parent().find('.choice-source-container').each(function(d) {
						choicesource = {
							id:  $(this).attr('data-id'),
							idColumn: $(this).find("p[data-attribute='idColumn']").attr('data-value'),
							valueColumn: $(this).find("p[data-attribute='valueColumn']").attr('data-value'),
							labelColumn: $(this).find("p[data-attribute='labelColumn']").attr('data-value')
						};
					});
					datas.push({
						element: 'data',
						id:  $(this).attr('data-id'),
						name: $(this).find("p[data-attribute='name']").attr('data-value'),
						label: $(this).find("p[data-attribute='label']").attr('data-value'),
						type: $(this).find("p[data-attribute='type']").attr('data-value'),
						'default': $(this).find("span[data-attribute='default']").attr('data-value'),
						min: $(this).find("span[data-attribute='min']").attr('data-value'),
						max: $(this).find("span[data-attribute='max']").attr('data-value'),
						content: $(this).find("span[data-attribute='content']").attr('data-value'),
						round: $(this).find("p[data-attribute='round']").attr('data-value'),
						unit: $(this).find("p[data-attribute='unit']").attr('data-value'),
						source: $(this).find("span[data-attribute='source']").attr('data-value'),
						index: $(this).find("span[data-attribute='index']").attr('data-value'),
						memorize: $(this).find("input[data-attribute='memorize']").is(':checked') ? 1 : 0,
						description: $(this).parent().find(".data-description").html(),
						choices: choices,
						choicesource: choicesource
					});
				}
			});
			$('input[name=datas]').val(JSON.stringify(datas));
			var rulesData = [];
			$('#business-rules .rule-container').each(function(r) {
				rulesData.push({
					id: $(this).find('.rule-id').text(),
					name: $(this).find('.rule-name').text(),
					label: $(this).find('.rule-label').text(),
					conditions: $(this).find('.rule-conditions').attr("data-value"),
					ifActions: Simulators.collectRuleActions($(this).find('.if-actions-panel')),
					elseActions: Simulators.collectRuleActions($(this).find('.else-actions-panel'))
				});
			});
			$('input[name=rules]').val(JSON.stringify(rulesData));
			$('#save-form').submit();
		});
		$('.panel-collapse').on('hidden.bs.collapse', function () {
			var butt = $(this).parent().find('button.toggle-collapse-all');
			butt.html(Translator.trans('Expand all') + ' <span class="glyphicon glyphicon-expand"></span>');
			butt.addClass('expand-all').removeClass('collapse-all');
		});
		$('.panel-collapse').on('shown.bs.collapse', function () {
			var butt = $(this).parent().find('button.toggle-collapse-all');
			butt.html(Translator.trans('Collapse all') + ' <span class="glyphicon glyphicon-collapse-up"></span>');
			butt.addClass('collapse-all').removeClass('expand-all');
		});
		$('button.toggle-collapse-all').on('click',function() {
			if ($(this).hasClass('expand-all')) {
				$(this).parent().find('a[data-toggle="collapse"]').each(function() {
					var objectID=$(this).attr('href');
					if($(objectID).hasClass('in')===false) {
						$(objectID).collapse('show');
					}
				});
				$(this).html(Translator.trans('Collapse all') + ' <span class="glyphicon glyphicon-collapse-up"></span>');
				$(this).addClass('collapse-all').removeClass('expand-all');
			} else if ($(this).hasClass('collapse-all')) {
				$(this).parent().find('a[data-toggle="collapse"]').each(function(){
					var objectID=$(this).attr('href');
					$(objectID).collapse('hide');
				});
				$(this).html(Translator.trans('Expand all') + ' <span class="glyphicon glyphicon-expand"></span>');
				$(this).addClass('expand-all').removeClass('collapse-all');
			}
		});
		if ( $("#simulator-import-form" ).length) {
			$( "#simulator-import-form" ).find('input, textarea').on("change propertychange", function (e) {
				Admin.updated = true;
			});
			$("#simulator-import-form input[name='simulator-file'], #simulator-import-form input[name='simulator-stylesheet']").change(function (e) {
				Simulators.hideErrors();
				var files = e.target.files;
				var $file = $(this);
				var reader = new FileReader();
				reader.onload = function(e) {
					$file.data('content', e.target.result);
				};
				reader.onerror  = function(e) {
					$file.data('error', e.target.error.name);
				};
				reader.readAsText(files[0], "UTF-8");
			});
			$("#btnDoImportSimulator").click(function (e) {
				e.preventDefault();
				var errors = [];
				var simulatorinput = $("#simulator-import-form input[name='simulator-file']");
				var simulatorfile = simulatorinput.val();
				if (simulatorfile == '') {
					errors.push(Translator.trans("Please, choose a simulator file"));
				} else if (! /\.xml$/.test(simulatorfile)) {
					errors.push(Translator.trans("The file extension of the simulator file must be '.xml'"));
				}
				var stylesheetinput = $("#simulator-import-form input[name='simulator-stylesheet']");
				var stylesheetfile = stylesheetinput.val();
				if (stylesheetfile != '' && ! /\.css$/.test(stylesheetfile)) {
					errors.push(Translator.trans("The file extension of the stylesheet must be '.css'"));
				}
				if (errors.length > 0) {
					Simulators.showErrors(errors);
					return false;
				}
				if (stylesheetfile != '') {
					var css = stylesheetinput.data('content');
					if (typeof CSSLint != "undefined") {
						results = CSSLint.verify(css, {});
						messages = results.messages;
						$.each(results.messages, function (i, error) {
							if (error.type == 'error') {
								errors.push(stylesheetfile + ' => Line ' + error.line + ' Column ' + error.col + ' : ' + error.message);
							}
						});
					}
					if (errors.length > 0) {
						Simulators.showErrors(errors, Translator.trans("CSS Validation errors") + " : ");
						return false;
					}
				}
				$.post( 
					'../../validate', 
					{ xml : simulatorinput.data('content') }, 
					function(data) {
						if(data.status == 'Error') {
							$.each(data.errors, function(index, error) {
								errors.push(simulatorfile + ' => ' + error);
							});
						}
					}, 
					'json'
				).fail(function() {
					errors.push( Translator.trans("XML Validation against schema fail" ) );
					Simulators.showErrors(errors);
				}).done(function() {
					if (errors.length > 0) {
						Simulators.showErrors(errors, Translator.trans("XML Validation errors") + " : ");
					} else {
						Simulators.hideErrors();
						Admin.updated = false;
						$("#simulator-import-form" ).submit();
						return true;
					}
				});
				return false;
			});
		}
	}
});