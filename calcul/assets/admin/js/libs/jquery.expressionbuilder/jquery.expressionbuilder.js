/*
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


if (typeof jQuery === 'undefined') {
  throw new Error('jquery.expressionbuilder requires jQuery library.');
}

var ExpressionBuilder_I18N = {
	en: {
		'menu-action-change': 'Change this operand',
		'menu-action-add': 'Add operand after',
		'menu-action-insert': 'Insert operand before',
		'menu-action-nested': 'Change to nested expression',
		'menu-action-delete': 'Delete this operand',
		'menu-action-add-argument': 'Add an argument to this function',
		'literal-label': 'Literal',
		'literal-placeholder': 'Enter a value',
		'fields-label': 'Fields',
		'constants-label': 'Constants',
		'functions-label': 'Functions',
		'parameters-label': 'Parameters',
		'miscellaneous-label': 'Miscellaneous',
		'nested-expression-label': 'Nested expression',
		'operand-holder-tip': 'Click to change this operand or right-click for more actions',
		'operator-holder-tip': 'Click to change this operator',
		'nested-expression-delete-tip': 'Click to change this this nested expression',
		'missing-left-parenthesis': 'Missing left parenthesis',
		'missing-right-parenthesis': 'Missing right parenthesis'
	}
};

(function( jQuery ){
	"use strict";

	var methods = {
		init : function( options ) {

			var settings = {
				fields: {},
				constants: {},
				functions: {},
				parameters: {},
				operators: ['+', '-', '*', '%', '/', '&', '|'],
				initial: null,
				onCompleted: function(type, expression) {},
				onEditing: function(expression) {},
				onError: function(error) {},
				language: 'en',
				operandHolder: { classes: ['label', 'label-primary'] },
				operatorHolder: { classes: ['label', 'label-primary'] },
				nestedExpression: { classes: ['label', 'label-primary'] }
			};

			return this.each(function() { 

				var expression = jQuery(this);
				var expressionId = Math.floor(Math.random() * 100000);
				var lastevent = 0; // 0 = none, 1 = editing, 2 = completion

				var holderCSS;

				if ( options ) { 
					jQuery.extend( settings, options );
				}

				expression.data('settings', settings);

				var i18n = jQuery.extend(
					{}, 
					ExpressionBuilder_I18N['en'], 
					ExpressionBuilder_I18N[settings.language]
				);
				if (typeof i18n === 'undefined') {
					throw new Error("jquery.expressionbuilder requires a script file for '" + settings.language + "' language");
				}

				expression.append(createHolderContextMenu());

				if (settings.initial && ! jQuery.isArray(settings.initial)) {
					settings.initial = parse(settings.initial);
				}

				initialize();

				function createHolderContextMenu() {
					var contextMenu = jQuery('<div id="holder-menu' + expressionId + '" class="context-menu-holder"></div>');
					var items = jQuery('<ul class="dropdown-menu" role="menu"></ul>');
					contextMenu.append(items);
					items.append('<li><a class="dropdown-item" tabindex="-1" menu-action="change"><span class="float-right">Ctrl+C</span>' + i18n['menu-action-change'] + '</a></li>');
					items.append('<li class="dropdown-divider"></li>');
					items.append('<li><a class="dropdown-item" tabindex="-1" menu-action="add"><span class="float-right">Ctrl+Insert</span>' + i18n['menu-action-add'] + '</a></li>');
					items.append('<li><a class="dropdown-item" tabindex="-1" menu-action="insert"><span class="float-right">Insert</span>' + i18n['menu-action-insert'] + '</a></li>');
					items.append('<li class="dropdown-divider"></li>');
					items.append('<li><a class="dropdown-item" tabindex="-1" menu-action="nested"><span class="float-right">Ctrl+N</span>' + i18n['menu-action-nested'] + '</a></li>');
					items.append('<li class="dropdown-divider"></li>');
					items.append('<li><a class="dropdown-item" tabindex="-1" menu-action="delete"><span class="float-right">del</span>' + i18n['menu-action-delete'] + '</a></li>');
					return contextMenu;
				}

				function createOperand() {
					var operandWrapper = jQuery('<span class="operand-wrapper"></span>');
					expression.append(operandWrapper);
					addOperand(operandWrapper);
					return operandWrapper;
				}

				function makeOperandChoices(operandWrapper) {

					var select = jQuery('<select></select>');
					select.append('<option operand-type="none" value=""></option>');
					var gMiscellaneous = jQuery('<optgroup label="' + i18n['miscellaneous-label'] + '"></optgroup>');
					gMiscellaneous.append('<option operand-type="literal" value="' + i18n['literal-label'] + '">' + i18n['literal-label'] + '</option>');
					gMiscellaneous.append('<option operand-type="nested" value="nested">' + i18n['nested-expression-label'] + '</option>');
					select.append(gMiscellaneous);

					if (Object.keys(settings.fields).length > 0) {
						var labels = [];
						$.each(settings.fields, function(name, field) {
							labels.push({label: field.label, name: name});
						});
						labels.sort(function (a, b) {
							return a.label.localeCompare(b.label);
						});
						var gfields = jQuery('<optgroup label="' + i18n['fields-label'] + '">');
						jQuery.each(labels, function(i, field) {
							gfields.append('<option operand-type="field" value="' + field.name + '">' + field.label + '</option>');
						});
						select.append(gfields);
					}

					if (Object.keys(settings.constants).length > 0) {
						var gconstants = jQuery('<optgroup label="' + i18n['constants-label'] + '">');
						jQuery.each(settings.constants, function(name, funct) {
							gconstants.append('<option operand-type="constant" value="' + name + '">' + name + '</option>');
						});
						select.append(gconstants);
					}

					if (Object.keys(settings.parameters).length > 0) {
						var gparameters = jQuery('<optgroup label="' + i18n['parameters-label'] + '">');
						jQuery.each(settings.parameters, function(name, parameter) {
							gparameters.append('<option operand-type="parameter" value="' + name + '">' + parameter.name + '</option>');
						});
						select.append(gparameters);
					}

					if (Object.keys(settings.functions).length > 0) {
						var gfunctions = jQuery('<optgroup label="' + i18n['functions-label'] + '">');
						jQuery.each(settings.functions, function(name, funct) {
							gfunctions.append('<option operand-type="function" value="' + name + '">' + name + '</option>');
						});
						select.append(gfunctions);
					}

					var choices = new Choices({
						source: select,
						onChoose: chooseOperandChoice, 
						attributes: {
							type: 'operand-type',
							value: 'operand-value'
						},
						classes: {
							container: 'expression-operand-choices-container',
							button: 'expression-operand-choices-button',
							buttonText: 'expression-operand-choice',
							buttonIcon: 'fas fa-angle-down',
							choices: 'expression-operand-choices',
							itemGroup: 'expression-operand-choices-group'
						}
					});

					operandWrapper.append(choices.get());
					operandWrapper.data('operand-choices', choices);
				}

				function chooseOperandChoice(choices, item) {
					var chosen = item.attr('operand-value');
					var text = item.text();
					var type = item.attr('operand-type');
					var literal = choices.getList().find("li[operand-type='literal']").text();
					var val = literal != i18n['literal-label'] ? literal : '';
					if (type === 'literal'){
						literalOperand(choices.get().parent('span'), val);
					} else if (type === 'constant') {
						constantOperand(choices.get().parent('span'), chosen);
					} else if (type === 'function') {
						functionExpression(choices.get().parent('span'), chosen);
					} else if (type === 'nested') {
						nestedExpression(choices.get().parent('span'));
					} else if (type === 'field') {
						fieldOperand(choices.get().parent('span'), chosen, text);
					} else if (type === 'parameter') {
						parameterOperand(choices.get().parent('span'), chosen, text);
					} else if (type === 'none') {
						noneOperand(choices.get().parent('span'));
					}
				}

				function addOperand(operandWrapper) {

					// Create operand holder Element
					var holder = jQuery('<button class="operand-holder"></button>');
					jQuery.each(settings.operandHolder.classes, function(c, clazz) {
						holder.addClass(clazz);
					});
					// put holder in wrapper element
					operandWrapper.append(holder);

					// Create Input Element
					var inputContainer = jQuery('<div>', { 'class': 'expression-input-container' } );
					var input = jQuery('<input>', { 'class': 'expression-input-field' } );
					inputContainer.append(input);

					var inputOk = jQuery('<button>', { 'class': 'expression-input-ok btn text-success'});
					inputOk.append(jQuery('<span>', { 'class': 'fas fa-check'}));
					inputContainer.append(inputOk);
					// put inputContainer in wrapper element
					operandWrapper.append(inputContainer);

					makeOperandChoices(operandWrapper);

					inputContainer.attr('placeholder', i18n['literal-placeholder']);
					input.attr('placeholder', i18n['literal-placeholder']);

					if (! holderCSS) {
						holderCSS = {
							"border": "none",
							"border-bottom": "thin dotted",
							"position" : "relative",
							"cursor": "pointer",
							"border-radius": 0,
							"margin": 0,
							"padding": 0,
							"background": "#fff",
							"min-width": "20px"
						};
					}

					holder.attr('title', i18n['operand-holder-tip']).css(jQuery.extend( {}, holderCSS, { display : "none" } ));
					holder.contextmenu({
						target: '#holder-menu' + expressionId,
						before: function(e, context) {
							if (!context || !context[0] || !context[0].firstChild) {
								return true;
							}
							var items = jQuery('#holder-menu' + expressionId + ' > ul'); 
							var addarg = items.find("[menu-action='add-argument']");
							var name = context[0].firstChild.textContent;
							if (settings.functions[name] && settings.functions[name].arity == -1) {
								if (addarg.length == 0) {
									items.append('<li class="dropdown-divider"></li>');
									items.append('<li><a class="dropdown-item" tabindex="-1" menu-action="add-argument"><span class="float-right">Ctrl+Shift+A</span>' + i18n['menu-action-add-argument'] + '</a></li>');
								}
							} else {
								if (addarg.length) {
									addarg.parent('li').prev().remove();
									addarg.parent('li').remove();
								}
							}
							return true;
						},
						onItem: function (context, e) {
							var action = jQuery(e.target).attr('menu-action');
							var wrapper = jQuery(context).parent('span');
							switch (action) {
								case 'change':
									jQuery(context).trigger('click');
									break;
								case 'add':
									addOperandAfter(wrapper);
									break;
								case 'insert':
									insertOperandBefore(wrapper);
									break;
								case 'nested':
									nestedExpression(wrapper);
									break;
								case 'delete':
									deleteOperand(wrapper);
									break;
								case 'add-argument':
									var functionWrapper = wrapper.children('span.function-wrapper');
									var funcName = wrapper.find("> button.operand-holder").text();
									var argsCount = functionWrapper.find('.nested-expression').length;
									var type = settings.functions[funcName].arity == -1 ? 
												settings.functions[funcName].args[0] :
												settings.functions[funcName].args[argsCount];
									addFunctionArgument(functionWrapper, type);
									break;
							}
						}
					});

					resizeOperand(operandWrapper);

					holder.on ('click', function(e) {
						e.preventDefault();
						showOperandList(jQuery(this).parent('span'));
						resizeOperand(jQuery(this).parent('span'));
					});

					holder.on('keydown',null, 'Ctrl+c', function (e) {
						var holder = jQuery(this);
						setTimeout(function() {
							holder.trigger('click');
						}, 0);
						return false;
					});

					holder.on('keydown',null, 'Ctrl+insert', function (e) {
						var wrapper = jQuery(this).parent('span');
						setTimeout(function() {
							addOperandAfter(wrapper);
						}, 0);
						return false;
					});

					holder.on('keydown',null, 'insert', function (e) {
						var wrapper = jQuery(this).parent('span');
						setTimeout(function() {
							insertOperandBefore(wrapper);
						}, 0);
						return false;
					});

					holder.on('keydown', null, 'Ctrl+n', function (e) {
						var wrapper = jQuery(this).parent('span');
						setTimeout(function() {
							nestedExpression(wrapper);
						}, 0);
						return false;
					});

					holder.on('keydown', null, 'del', function (e) {
						var wrapper = jQuery(this).parent('span');
						setTimeout(function() {
							deleteOperand(wrapper);
						}, 0);
						return false;
					});

					holder.on('keydown', null, 'Ctrl+Shift+A', function (e) {
						var wrapper = jQuery(this).parents('span.function-operand-wrapper');
						var functionWrapper = wrapper.children('span.function-wrapper')
						setTimeout(function() {
							var funcName = wrapper.find("> button.operand-holder").text();
							var argsCount = functionWrapper.find('.nested-expression').length;
							var type = settings.functions[funcName].arity == -1 ? 
										settings.functions[funcName].args[0] :
										settings.functions[funcName].args[argsCount];
							addFunctionArgument(functionWrapper, type);
						}, 0);
						return false;
					});

					input.autoGrowInput({ maxWidth: 500, minWidth: operandWrapper.data('operand-choices').width(), comfortZone: 1 });

					input.on ('keydown', function(e){
						var key = e.keyCode || e.which || e.key;;
						if (key == 13) { //enter
							e.preventDefault();
							e.stopPropagation();
							if (jQuery(this).val() === '') {
								showOperandList(jQuery(this).parent('span'));
								jQuery(this).parent().parent('span').find('select option:eq(0)').prop('selected', true);
							} else {
								showHolder(jQuery(this).parent().parent('span'), jQuery(this).val(), jQuery(this).val(), 'literal');
							}
							resizeOperand(jQuery(this).parent().parent('span'));
							var functionw = jQuery(this).parent().parent('span').parents('.function-operand-wrapper');
							if (functionw.length > 0) {
								functionw.parent().expressionbuilder('state');
							}
							return false;
						}
					});

					input.on ('blur', function(e){
						if (jQuery(this).val() === '') {
							showOperandList(jQuery(this).parent('span'));
							jQuery(this).parent('span').find('select option:eq(0)').prop('selected', true);
						} else {
							showHolder(jQuery(this).parent().parent('span'), jQuery(this).val(), jQuery(this).val(), 'literal');
						}
						resizeOperand(jQuery(this).parent().parent('span'));
						var functionw = jQuery(this).parent().parent('span').parents('.function-operand-wrapper');
						if (functionw.length > 0) {
							functionw.parent().expressionbuilder('state');
						}
					});
					holder.data('operand-type', 'none');
					holder.data('operand-value', '');
					holder.data('operand-completed', false);
					checkState();

					// test click outside
					$(document).on('click', function(e) {
						if (e.target !== input[0] && input.is(':visible') && $(e.target).parents('.action').length == 0) {
							setTimeout(function() {
								input.trigger('blur');
							},0);
						}
					});
					operandWrapper.data('operand-choices').focus();

					return holder;
				}

				function addOperandAfter(wrapper) {
					var holder = wrapper.children('button.operand-holder');
					var operator = addOperator();
					wrapper.after(operator);
					holder.data('right-operator', operator);
					operator.css({"display":"inline"});
					if (! operator.is(':last-child')) {
						var operandWrapper = jQuery('<span class="operand-wrapper"></span>');
						operator.after(operandWrapper);
						addOperand(operandWrapper);
					}
					operator.children('select').focus();
				}

				function insertOperandBefore(wrapper) {
					var holder = wrapper.children('button.operand-holder');
					var operator = addOperator();
					wrapper.before(operator);
					holder.data('left-operator', operator);
					operator.css({"display":"inline"});
					var operandWrapper = jQuery('<span class="operand-wrapper"></span>');
					operator.before(operandWrapper);
					addOperand(operandWrapper);
					operandWrapper.data('operand-choices').focus();
				}

				function deleteOperand(wrapper) {
					var holder = wrapper.children('button.operand-holder');
					if (wrapper.is(':nth-child(2)')) { //first child is context-menu
						if (wrapper.is(':last-child')) {
							var deletearg = false;
							var functionw = holder.parent().parents('.function-operand-wrapper');
							if (functionw.length > 0) {
								var holderw = functionw.eq(0).children('button.operand-holder');
								var funcName = holderw.data('operand-value');
								if (funcName && settings.functions[funcName].arity == -1) {
									var args = functionw.eq(0).find('> span.function-wrapper > span.nested-expression');
									if (args.length > 2) {
										deletearg = true;
									}
								}
							}
							if (deletearg) {
								var nestedExpr = wrapper.parent('.nested-expression');
								if (nestedExpr.prev().hasClass('comma-holder')) {
									nestedExpr.prev().remove();
								} else if (nestedExpr.next().hasClass('comma-holder')) {
									nestedExpr.next().remove();
								}
								var functionExpr = nestedExpr.parents('.function-operand-wrapper').parent();
								nestedExpr.expressionbuilder('destroy');
								functionExpr.expressionbuilder('state');
							} else {
								showOperandList(wrapper);
								wrapper.data('operand-choices').val('');
							}
						} else {
							if (holder.data('right-operator')) {
								holder.data('right-operator').remove();
								wrapper.remove();
							}
						}
					} else {
						if (holder.data('left-operator')) {
							holder.data('left-operator').remove();
							wrapper.remove();
						}
					}
					lastevent = 0;
					checkState();
				}

				function createOperator() {
					var operatorWrapper = addOperator();
					expression.append(operatorWrapper);
					return operatorWrapper;
				}

				function addOperator() {
					var operatorWrapper = jQuery('<span class="operator-wrapper"></span>');
					var choices = jQuery('<select></select>');  
					choices.append('<option value=""></option>');
					jQuery.each(settings.operators, function(o, operator) {
						choices.append('<option value="' + operator + '">' + operator + '</option>');
					});
					var holder = jQuery('<button class="operator-holder"></button>');
					jQuery.each(settings.operatorHolder.classes, function(c, clazz) {
						holder.addClass(clazz);
					});
					operatorWrapper.append(holder).append(choices);

					choices.css({
						width: '43px'
					});

					holder.attr('title', i18n['operator-holder-tip']).css(jQuery.extend( {}, holderCSS, { display : "none", 'text-align': 'center' } ));
					operatorWrapper.css({
						display : "none",
					});

					holder.on ('click', function(e) {
						e.preventDefault();
						showOperatorList(jQuery(this).parent('span'));
					});
					choices.on ('change blur', function(e){
						if (jQuery(this).val() !== '') {
							showOperatorHolder(jQuery(this).parent('span'), jQuery(this).val());
						}
					});
					return operatorWrapper;
				}

				function guessType(value) {
					if (/^\d+$/.test(value)) {
						return 'integer'
					} else if (jQuery.isNumeric(value)) {
						return 'number';
					} else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(value)) {
						return 'date';
					} else if (value === 'true' || value === 'false') {
						return 'boolean';
					} else {
						return 'text';
					}
				}

				function showHolder(wrapper, val, label, operandType) {
					var holder = wrapper.children('button.operand-holder');
					var inputContainer = wrapper.children('.expression-input-container');
					inputContainer.hide();
					wrapper.data('operand-choices').hide();
					holder.data('operand-type', operandType);
					if (holder.data('right-operator')) {
						holder.data('right-operator').css({"display":"inline"});
					}
					switch  (operandType) {
						case 'literal':
							var type = guessType(val);
							var expr = holder.parents('.nested-expression');
							if (expr.length > 0 && expr.eq(0).attr('data-type')) {
								type = expr.eq(0).attr('data-type');
							}
							if (type === 'text' && ! /^'.*'$/.test(label)) {
								label = "'" + label.replace(/'/g, "\\'") + "'";
							}
							holder.data('data-type', type);
							break;
						case 'constant':
							holder.data('data-type', settings.constants[val].type);
							break;
						case 'field':
							holder.data('data-type', settings.fields[val].type);
							break;
						case 'function':
							holder.data('data-type', settings.functions[val].type);
							break;
						case 'parameter':
							holder.data('data-type', settings.parameters[val].type);
							break;
						case 'nested':
							break;
						default:
							holder.data('data-type', 'unknown');
					}
					holder.data('operand-value', val);
					holder.text(label).css({"display":"inline-block"});
					holder.data('operand-completed', true);
					lastevent = 0;
					checkState();
					return holder.focus();
				}

				function showInput(wrapper, val) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					var holder = wrapper.children('button.operand-holder');
					var inputContainer = wrapper.children('.expression-input-container');
					var input = inputContainer.children('input');
					holder.hide();
					wrapper.data('operand-choices').hide();
					inputContainer.css({"display":"inline-block"});
					input.val(val).focus();
					return input;
				}

				function showOperandList(wrapper) {
					var choices = wrapper.data('operand-choices');
					var inputContainer = wrapper.children('.expression-input-container');
					var input = inputContainer.children('input');
					var holder = wrapper.children('button.operand-holder');
					var chosen = choices.val();
					if (chosen == i18n['literal-label'] ) {
						if ( input.val() !== "" ){
							choices.getList().find("li[operand-type='literal']").text(jQuery.trim(input.val()));
							wrapper.data('operand-choices').val(chosen);
						}
					} else {
						if ( input.val() === "" ) {
							choices.getList().find("li[operand-type='literal']").text(i18n['literal-label']);
						} else {
							choices.getList().find("li[operand-type='literal']").text(input.val());
						}
					}
					input.val("");
					holder.hide();
					inputContainer.hide();
					choices.show();
				}

				function showOperatorList(wrapper) {
					var choices = wrapper.children('select');
					var holder = wrapper.children('button.operator-holder');
					holder.hide();
					choices.css({"display":"inline"}).focus();
					return choices;
				}

				function showOperatorHolder(wrapper, val) {
					var holder = wrapper.children('button.operator-holder');
					var choices = wrapper.children('select');
					choices.val(val);
					holder.data('operator-value', val).text(choices.find('option:selected').text()).css({"display":"inline-block"});
					choices.hide();
					if (wrapper.is(':last-child')) {
						var operand = createOperand();
						operand.children('button.operand-holder').data('left-operator', wrapper);
						operand.data('operand-choices').focus();
					}
				}

				function resizeOperand(wrapper){
					var width = wrapper.data('operand-choices').outerWidth();
					wrapper.css({
						"width" : width
					});
				}

				function noneOperand(wrapper) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					var holder = wrapper.children('button.operand-holder');
					holder.data('operand-value', '');
					if (holder.data('right-operator') && holder.data('right-operator').is(':last-child')) {
						holder.data('right-operator').remove();
						holder.data('right-operator', null);
					}
					holder.data('operand-completed', false);
					checkState();
				}

				function literalOperand(wrapper, literal) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					showInput(wrapper, literal);
				}

				function fieldOperand(wrapper, fieldName, fieldLabel) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					showHolder(wrapper, fieldName, fieldLabel, 'field');
				}

				function constantOperand(wrapper, constant) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					showHolder(wrapper, constant, constant, 'constant');
				}

				function parameterOperand(wrapper, parameter, parameterLabel) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					showHolder(wrapper, parameter, parameterLabel, 'parameter');
				}

				function addFunctionArgument(functionWrapper, type, initial) {
					var rightParenthesis = functionWrapper.children('.right-parenthesis-holder');
					var nesteds = functionWrapper.children('.nested-expression');
					if (nesteds.length > 0) {
						var comma = jQuery('<button class="comma-holder">,</button>');
						comma.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
						jQuery.each(settings.operatorHolder.classes, function(c, clazz) {
							comma.addClass(clazz);
						});
						rightParenthesis.before(comma);
					}
					var nested = jQuery('<span class="nested-expression"></span>');
					rightParenthesis.before(nested);
					var initargs = null;
					if (initial) {
						initargs = [];
						var npar = 0;
						while (initial.length > 0) {
							var op = initial.shift();
							if (op === ',' && npar == 0) {
								break;
							}
							if (op === '(') {
								npar++;
							} else if (op === ')') {
								npar--;
							}
							initargs.push(op);
						}
					}
					nested.attr('data-type', type);
					nested.expressionbuilder(
						jQuery.extend({}, settings, {
							onCompleted: function(type, expression) { checkState(); },
							onEditing: function(expression) { checkState(); },
							initial: initargs
						})
					);
					return nested;
				}

				function argumentsCount(args) {
					var par = 0;
					var len = args.length;
					var count = len > 0 ? 1 : 0;
					for (var i = 0; i < len; i++) {
						if (args[i] == '(') {
							par++;
						} else if (args[i] == ')') {
							par--;
						} else if (par == 0 && args[i] == ',') {
							count++;
						}
					}
					return count;
				}
				
				function functionExpression(wrapper, funcName, initial) {
					var holder = wrapper.children('button.operand-holder');
					if (wrapper.hasClass('function-operand-wrapper')) {
						if (holder.data('operand-value') == funcName) {
							return;
						} else {
							wrapper.children('span.function-wrapper').remove();
						}
					}
					wrapper.removeClass('operand-wrapper').removeClass('nested-operand-wrapper').addClass('function-operand-wrapper');
					var func = settings.functions[funcName];
					var arity = func.arity;
					if (arity == -1) {
						arity = initial ? argumentsCount(initial) : 2;
					}
					showHolder(wrapper, funcName, funcName, 'function');
					var functionWrapper = jQuery('<span class="function-wrapper"></span>');
					wrapper.append(functionWrapper);
					var leftParenthesis = jQuery('<button class="left-parenthesis-holder">(</button>');
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						leftParenthesis.addClass(clazz);
					});
					functionWrapper.append(leftParenthesis);
					var rightParenthesis = jQuery('<button class="right-parenthesis-holder">)</button>');
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						rightParenthesis.addClass(clazz);
					});
					functionWrapper.append(rightParenthesis);
					leftParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
					rightParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
					for (var i = 0; i < arity; i++) {
						var type = (func.arity == -1) ? func.args[0] : func.args[i];
						addFunctionArgument(functionWrapper, type, initial);
					}
					holder.data('operand-completed', false);
					checkState();
				}

				function removeNestedExpression(wrapper) {
					wrapper.children('span.nested-expression').expressionbuilder('destroy');
					wrapper.empty();
					wrapper.removeClass('nested-operand-wrapper').addClass('operand-wrapper');
					var holder = addOperand(wrapper);
					var rightOperator = wrapper.next();
					if (rightOperator && rightOperator.hasClass('operator-wrapper')) {
						holder.data('right-operator', rightOperator);
						if (rightOperator.is(':last-child')) {
							rightOperator.hide();
						}
					} else {
						holder.data('right-operator', addOperator());
					}
					var leftOperator = wrapper.prev();
					if (leftOperator && leftOperator.hasClass('operator-wrapper')) {
						holder.data('left-operator', leftOperator);
					}
					checkState();
				}

				function nestedExpression(wrapper, initial) {
					var holder = wrapper.children('button.operand-holder');
					var leftOperator = holder.data('left-operator');
					var rightOperator = holder.data('right-operator');
					if (rightOperator) {
						rightOperator.css({"display":"inline"});
					}
					wrapper.empty();
					wrapper.removeClass('operand-wrapper').addClass('nested-operand-wrapper');
					var leftParenthesis = jQuery('<button class="left-parenthesis-holder operand-holder">(</button>');
					leftParenthesis.data('operand-type', 'nested');
					leftParenthesis.data('operand-value', '');
					leftParenthesis.data('data-type', 'unknown');
					leftParenthesis.data('operand-completed', false);
					if (leftOperator) {
						leftParenthesis.data('left-operator', leftOperator);
					}
					if (rightOperator) {
						leftParenthesis.data('right-operator', rightOperator);
					}
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						leftParenthesis.addClass(clazz);
					});
					wrapper.append(leftParenthesis);
					leftParenthesis.contextmenu({
						target: '#holder-menu' + expressionId,
						onItem: function (context, e) {
							var action = jQuery(e.target).attr('menu-action');
							var holder = jQuery(context);
							var wrapper = holder.parent('span');
							switch (action) {
								case 'change':
									break;
								case 'add':
									var operator = addOperator();
									wrapper.after(operator);
									holder.data('right-operator', operator);
									operator.css({"display":"inline"});
									if (! operator.is(':last-child')) {
										var operandWrapper = jQuery('<span class="operand-wrapper"></span>');
										operator.after(operandWrapper);
										addOperand(operandWrapper);
									}
									break;
								case 'insert':
									break;
								case 'nested':
									break;
								case 'delete':
									removeNestedExpression(wrapper);
									break;
							}
						}
					});
					var nested = jQuery('<span class="nested-expression"></span>');
					wrapper.append(nested);
					var rightParenthesis = jQuery('<button class="right-parenthesis-holder">)</button>');
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						rightParenthesis.addClass(clazz);
					});
					wrapper.append(rightParenthesis);
					nested.expressionbuilder(
						jQuery.extend({}, settings, {
							onCompleted: function(type, expression) { leftParenthesis.data('data-type', type); checkState(); },
							onEditing: function(expression) { checkState(); },
							initial: initial
						})
					);
					leftParenthesis.css(jQuery.extend( {}, holderCSS, { 'text-align': 'center' } ));
					rightParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
					checkState();
				}

				function checkState() {
					var completed = expression.expressionbuilder('completed');
					if (completed) {
						if (lastevent != 2) {
							var type = expression.expressionbuilder('type');
							settings.onCompleted(type, expression); 
							lastevent = 2;
						}
					} else {
						if (lastevent != 1) {
							settings.onEditing(expression);
							lastevent = 1;
						}
					}
				}

				function notifyError(error) {
					if (i18n[error]) {
						error = i18n[error];
					}
					settings.onError(error);
					throw new Error(error);;
				}

				function findFieldName (id) {
					var fieldName = 'unknown';
					jQuery.each(settings.fields, function( name, field ) {
						if ( field.id == id) {
							fieldName = name;
							return false; // break;
						}
					});
					return fieldName;
				}

				function findParameterName (num) {
					var parameterName = 'unknown';
					jQuery.each(settings.parameters, function( name, parameter ) {
						if ( parameter.num == num) {
							parameterName = name;
							return false; // break;
						}
					});
					return parameterName;
				}

				function parse(expr) {

					var result = [];
					var text = [];

					var PATTERN = new RegExp('([\\s!,\\(\\)\\' + settings.operators.join('\\') + '])', 'g');

					expr = expr.replace(/'\$(\d+)\$(s|d|f)'/g, function (match, m1, m2, str) {
						return "$" + m1 + "$" + m2;
					});
					expr = expr.replace(/\\\'/g, '`');
					expr = expr.replace(/('[^']*')/g, function (match, m1, str) {
						text.push(m1.substr(1, m1.length - 2).replace(/`/g, "\'"));
						return "¤" + text.length;
					});
					expr = expr.replace(/\\\"/g, '`');
					expr = expr.replace(/("[^"]*")/g, function (match, m1, str) {
						text.push(m1.substr(1, m1.length - 2).replace(/`/g, '\"'));
						return "¤" + text.length;
					});
					expr = expr.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, "D$1.$2.$3");
					var toks = expr.split(PATTERN);
					var prev = '';
					var unarySign = '';
					jQuery.each(toks, function( t, value ) {
						value = value.replace(/^\s+|\s+$/g, '');
						if (value !== '') {
							var matches;
							if (jQuery.isNumeric(value)) {
								result.push(prev = parseFloat(unarySign + value));
							} else if (value.match(/^#\d+/)) {
								var id = parseInt(value.substr(1));
								result.push(prev = unarySign + findFieldName (id));
							} else if (matches = value.match(/^\$(\d+)\$/)) {
								var num = parseInt(matches[1]);
								result.push(prev = unarySign + findParameterName (num));
							} else if (matches = value.match(/^¤(\d+)/)) {
								var i = parseInt(matches[1]);
								result.push(prev = "'" + text[i - 1] + "'");
							} else if (matches = value.match(/^D(\d{1,2})\.(\d{1,2})\.(\d{4})/)) {
								result.push(prev = unarySign + matches[1] + "/" + matches[2] + "/" + matches[3]);
							} else if (value ==='+' || value === '-') {
								if (jQuery.inArray(prev, settings.operators) >= 0 || prev === '(' || prev === ',' || prev === '') {
									unarySign = value;
									return true; // continue
								} else {
									result.push(prev = unarySign + value);
								}
							} else if (jQuery.inArray(value, settings.operators) >= 0 || value === '(' || value === ',' || value === ')' ) {
								result.push(prev = value);
							} else {
								result.push(prev = unarySign + value);
							}
							unarySign = '';
						}
					});
					return result;
				}

				function getInitialSubExpression(from, initial) {
					var i = from;
					var n = settings.initial.length;
					var value = settings.initial[i];
					if (value === '(') {
						var npar = 1;
						i++;
						while ( i < n ) {
							value = settings.initial[i];
							if (value === ')') {
								npar--;
								if (npar == 0) {
									break;;
								}
							}
							initial.push(value);
							if (value === '(') {
								npar++;
							}
							i++;
						}
						if (value !== ')') {
							notifyError("missing-right-parenthesis");
						}
					}
					return i;
				}

				function initialize() {
					if (settings.initial) {
						var n = settings.initial.length;
						var i = 0;
						var operandWrapper = null;
						var operatorWrapper = null;
						while ( i < n ) {
							var value = settings.initial[i];
							if (value === '(') {
								var initial = [];
								i = getInitialSubExpression(i, initial);
								operandWrapper = createOperand();
								nestedExpression(operandWrapper, initial);
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							} else if (value === ')') {
								notifyError("missing-left-parenthesis");
								return;
							} else if (jQuery.inArray(value, settings.operators) >= 0) {
								operatorWrapper = createOperator();
								operatorWrapper.css({"display":"inline"});
								var holder = operatorWrapper.children('button.operator-holder');
								var choices = operatorWrapper.children('select');
								choices.find("option[value='"+value+"']").prop('selected', true);
								choices.val(value);
								holder.data('operator-value', value).text(value).css({"display":"inline-block"});
								choices.hide();
								if (operandWrapper) {
									operandWrapper.children('button.operand-holder').data('right-operator', operatorWrapper);
								}
							} else if (settings.constants[value]) {
								operandWrapper = createOperand();
								showHolder(operandWrapper, value, value, 'constant');
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							} else if (settings.fields[value]) {
								operandWrapper = createOperand();
								operandWrapper.data('operand-choices').val(value);
								showHolder(operandWrapper, value, settings.fields[value].label, 'field');
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							} else if (typeof value == 'string' && settings.fields[value.toLowerCase()]) {
								value = value.toLowerCase();
								operandWrapper = createOperand();
								operandWrapper.data('operand-choices').val(value);
								showHolder(operandWrapper, value, settings.fields[value].label, 'field');
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							} else if (settings.parameters[value]) {
								operandWrapper = createOperand();
								operandWrapper.data('operand-choices').val(value);
								showHolder(operandWrapper, value, settings.parameters[value].name, 'parameter');
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							} else if (settings.functions[value]) {
								var funcName = value;
								i++;
								if (settings.initial[i] !== '(') {
									notifyError("missing-left-parenthesis");
								}
								var initial = [];
								i = getInitialSubExpression(i, initial);
								operandWrapper = createOperand();
								operandWrapper.data('operand-choices').val(funcName);
								functionExpression(operandWrapper, funcName, initial);
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							} else {
								operandWrapper = createOperand();
								var inputContainer = operandWrapper.children('.expression-input-container');
								var input = inputContainer.children('input');
								if (typeof value == 'string') {
									value = value.replace(/^'(.+)'$/, '$1');
								}
								input.val(value).trigger('blur');
								operandWrapper.children('button.operand-holder').data('left-operator', operatorWrapper);
							}
							i++;
						}
					} else {
						operandWrapper = createOperand();
						operandWrapper.data('operand-choices').focus();
					}
				}

			}); 
		},

		settings: function() {
			jQuery(this).data('settings');
		},

		destroy: function() {
			jQuery(this).remove();
		},

		completed: function() {
			var expression = jQuery(this);
			var settings = expression.data('settings');
			var isCompleted = true;

			expression.children('span').each(function(o) {
				var wrapper = jQuery(this);
				if (wrapper.hasClass('nested-operand-wrapper')) {
					var nested = wrapper.children('span.nested-expression');
					if (! nested.expressionbuilder('completed')) {
						isCompleted = false;
					}
				} else if (wrapper.hasClass('function-operand-wrapper')) {
					var holder = wrapper.children('button.operand-holder');
					var funcName = holder.data('operand-value');
					var func = settings.functions[funcName];
					var functionWrapper = wrapper.children('span.function-wrapper');
					var args = functionWrapper.children('span.nested-expression');
					var arity = func.arity;
					if (arity == -1) {
						arity = Math.max(2, args.length);
					}
					for (var i = 0; i < arity; i++) {
						if (! args.eq(i).expressionbuilder('completed')) {
							isCompleted = false;
							break;
						}
					}
				} else if (wrapper.hasClass('operand-wrapper')) {
					var holder = wrapper.children('button.operand-holder');
					if (! holder.data('operand-completed')) {
						isCompleted = false;
					}
				}
			});
			return isCompleted;
		},

		type : function() {
			var expression = jQuery(this);
			var operandType = '';
			expression.children('span').each(function(o) {
				if (! jQuery(this).hasClass('operator-wrapper')) {
					var wrapper = jQuery(this);
					var holder = wrapper.children('button.operand-holder');
					var dataType = holder.data('data-type');
					var op =  holder.data('left-operator') ? holder.data('left-operator').children('button.operator-holder').data('operator-value') : '';
					operandType = combineTypes(operandType, op, dataType);
				}
			});
			return operandType;
		},

		val : function(value) {
			var settings = jQuery(this).data('settings');
			if (value) {
				settings.initial = value;
				jQuery(this).empty();
				jQuery(this).expressionbuilder(settings);
			} else {
				var expr = function (container) {
					var expression = "";
					container.children('span').each(function() {
						var self = jQuery(this);
						if (self.hasClass('operand-wrapper')) {
							var holder = self.children('button.operand-holder');
							var operandValue = holder.data('operand-value');
							if (settings.fields[operandValue]) {
								expression += '#' + settings.fields[operandValue].id;
							} else if (settings.parameters[operandValue]) {
								var type = settings.parameters[operandValue].type;
								var param = '$' + settings.parameters[operandValue].num + '$';
								switch (type) {
									case 'integer':
										param += 'd';
										break;
									case 'number':
									case 'money':
									case 'percent':
										param += 'f';
										break;
									default:
										param = "'" + param + "s'";
								}
								expression += param;
							} else if (holder.data('operand-type') === 'literal' && (holder.data('data-type') === 'text' || ! jQuery.isNumeric(holder.data('operand-value')))) {
								expression += "'" + operandValue.replace(/'/g, "\\'") + "'";
							} else {
								expression += operandValue;
							}
						} else if (self.hasClass('function-operand-wrapper')) {
							var holder = self.children('button.operand-holder');
							var funcName = holder.data('operand-value');
							var func = settings.functions[funcName];
							var functionWrapper = self.children('span.function-wrapper');
							var args = functionWrapper.children('span.nested-expression');
							expression += funcName + '(' + args.eq(0).expressionbuilder('val');
							var arity = func.arity;
							if (arity == -1) {
								arity = Math.max(2, args.length);
							}
							for (var i = 1; i < arity; i++) {
								expression += ', ' + args.eq(i).expressionbuilder('val');
							}
							expression += ')';
						} else if (self.hasClass('operator-wrapper')) {
							var holder = self.children('button.operator-holder');
							expression += ' ' + holder.text() + ' ';
						} else if (self.hasClass('nested-operand-wrapper')) {
							var nested = self.children('span.nested-expression');
							expression += '(' + nested.expressionbuilder('val') + ')';
						}
					});
					return expression;
				};
				return expr(jQuery(this));
			}
		},

		state: function() {
			var expression = jQuery(this);
			var settings = expression.data('settings');
			var completed = expression.expressionbuilder('completed');
			if (completed) {
				var type = expression.expressionbuilder('type');
				settings.onCompleted(type, expression); 
			} else {
				settings.onEditing(expression);
			}
		},

		getVersion: function() {
			return "1.1.0";
		}

	};

	function combineTypes(type1, op, type2) {
		var type;
		switch (type1) {
			case '':
				type = type2;
				break;
			case 'text':
				if (op === '+') {
					type = 'text';
				} else {
					type = 'unknown';
				}
				break;
			case 'integer':
				if (op === '+') {
					if (type2 === 'text') {
						type = 'text';
					} else if (type2 === 'integer') {
						type = 'integer';
					} else if (type2 === 'number') {
						type = 'number';
					} else if (type2 === 'date') {
						type = 'date';
					} else {
						type = 'unknown';
					}
				} else {
					if (type2 === 'integer') {
						type = 'integer';
					} else if (type2 === 'number') {
						type = 'number';
					} else {
						type = 'unknown';
					}
				}
				break;
			case 'number':
			case 'money':
			case 'percent':
				if (op === '+') {
					if (type2 === 'text') {
						type = 'text';
					} else if (type2 === 'integer') {
						type = 'number';
					} else if (type2 === 'number') {
						type = 'number';
					} else if (type1 === 'number' && type2 === 'date') {
						type = 'date';
					} else {
						type = 'unknown';
					}
				} else {
					if (type2 === 'integer') {
						type = 'number';
					} else if (type2 === 'number') {
						type = 'number';
					} else {
						type = 'unknown';
					}
				}
				break;
			case 'day':
			case 'month':
			case 'year':
				if (op === '+') {
					if (type2 === 'text') {
						type = 'text';
					} else if (type2 === 'integer') {
						type = 'integer';
					} else {
						type = 'unknown';
					}
				} else {
					if (type2 === 'integer') {
						type = 'integer';
					} else {
						type = 'unknown';
					}
				}
				break;
			case 'date':
				if (op === '+') {
					if (type2 === 'text') {
						type = 'text';
					} else if (type2 === 'integer') {
						type = 'date';
					} else {
						type = 'unknown';
					}
				} else if (op === '-') {
					if (type2 === 'integer') {
						type = 'date';
					} else if (type2 === 'date') {
						type = 'integer';
					} else {
						type = 'unknown';
					}
				}
				break;
			default:
				type = 'unknown';
		}
		return type;
	}

	jQuery.fn.expressionbuilder = function( method ) {    
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			jQuery.error( 'Method ' +  method + ' does not exist on jQuery.expressionbuilder' );
		}    
	};

})( jQuery );