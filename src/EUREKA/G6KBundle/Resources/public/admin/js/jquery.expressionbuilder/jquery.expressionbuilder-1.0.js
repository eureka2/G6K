if (typeof jQuery === 'undefined') {
  throw new Error('jquery.expressionbuilder requires jQuery library.');
}

(function( $ ){
	"use strict";
  
	var methods = {
		init : function( options ) {
		
			var settings = {
				fields: {},
				functions: {},
				onCompleted: function(type) {},
				onEditing: function() {},
				constant: { label: 'Constant', placeholder: 'Enter a value'},
				miscellaneous : {label: 'Miscellaneous'},
				operandHolder: {tip: 'Click to change this operand', classes: ['label', 'label-primary'] },
				operatorHolder: {tip: 'Click to change this operator', classes: ['label', 'label-primary'] },
				nestedExpression: {label: 'Nested expression', deleteTip: 'Click to delete this nested expression', classes: ['label', 'label-primary'] }
			};
		     
	
			return this.each(function() { 
			
				var expression = $(this);
				
				var lastevent = 0; // 0 = none, 1 = editing, 2 = completion
				
				var holderCSS;

				if ( options ) { 
					$.extend( settings, options );
				}
			
				expression.data('settings', settings);
				
				createOperand();
				
				function createOperand() {
					var operandWrapper = jQuery('<span class="operand-wrapper"></span>');
					expression.append(operandWrapper);
					var holder = addOperand(operandWrapper);
					holder.data('right-operator', addOperator());
					return operandWrapper;
				}
				
				function addOperand(operandWrapper) {
					var choices = jQuery('<select class="form-control"></select>');
					choices.append('<option operand-type="none" value=""></option>');					
					var gMiscellaneous = jQuery('<optgroup label="' + settings.miscellaneous.label + '"></optgroup>');
					gMiscellaneous.append('<option operand-type="const" value="' + settings.constant.label + '">' + settings.constant.label + '</option>');
					gMiscellaneous.append('<option operand-type="nested" value="nested">' + settings.nestedExpression.label + '</option>');
					choices.append(gMiscellaneous);
					var gfields = jQuery('<optgroup label="Fields">');
					jQuery.each(settings.fields, function(name, field) {
						gfields.append('<option operand-type="field" value="' + name + '">' + field.label + '</option>');
					});
					choices.append(gfields);
					
					var gfunctions = jQuery('<optgroup label="Functions">');
					jQuery.each(settings.functions, function(name, funct) {
						gfunctions.append('<option operand-type="func" value="' + name + '">' + name + '</option>');
					});
					choices.append(gfunctions);
					
					// Create Input Element
					var input = jQuery('<input class="form-control"></input>');
					
					// Create operand holder Element
					var holder = jQuery('<span class="operand-holder form-control-static"></span>');
					jQuery.each(settings.operandHolder.classes, function(c, clazz) {
						holder.addClass(clazz);
					});
					
					// put holder, input and select element in wrapper element
					operandWrapper.append(holder).append(input).append(choices);
					
					input.css({
						position : "relative",
						'margin-top': '-4px',
						display : "none"
					}).attr('placeholder', settings.constant.placeholder);
										
					choices.css({
						'margin-top': '-4px'
					});
					if (! holderCSS) {
						holderCSS = {
							"font-family": input.css('font-family'),
							"font-size": input.css('font-size'),
							border: "1px solid #CCC",
							position : "relative",
							height: input.css('height'),
							'line-height': input.css('height'),
							'min-height': input.css('height'),
							cursor: "pointer",
							margin: "0 1px 0 0",
							padding: "0 2px 0 2px",
							"min-width": "20px"
						};
					}
					
					holder.attr('title', settings.operandHolder.tip).css(jQuery.extend( {}, holderCSS, { display : "none" } ));
			  
					resizeOperand(operandWrapper);
					
					holder.on ('click', function(e) {						
						e.preventDefault();
						showOperandChoices($(this).parent('span'));
						resizeOperand($(this).parent('span'));
					});
			  
					choices.on ('keydown', function(e){
						if (e.keyCode >= 37 && e.keyCode <=40  || e.keyCode == 13) // arrow buttons or enter button
							return ;
							
						var chosen = $(this).val();
						
						if (e.keyCode == "46"){ // del-button
							if(chosen != settings.constant.label){
								$(this).children("option:selected").remove();
							}
							return;
						}
						
						if ( chosen == settings.constant.label ) {
							var text = $(this).find("option[operand-type='const']").text();
							var val = text != settings.constant.label ? text : '';
							constantOperand($(this).parent('span'), val);
						}
					});
						
					choices.on ('change blur', function(e){
						var chosen = $(this).val();
						var text = $(this).find('option:selected').text();
						var type = $(this).find('option:selected').attr('operand-type');
						var constant = $(this).find("option[operand-type='const']").text();
						var val = constant != settings.constant.label ? constant : '';
						if (type === 'const'){
							constantOperand($(this).parent('span'), val);
						} else if (type === 'func') {
							functionExpression($(this).parent('span'), chosen);
						} else if (type === 'nested') {
							nestedExpression($(this).parent('span'));
						} else if (type === 'field') {
							fieldOperand($(this).parent('span'), chosen, text);
						} else if (type === 'none') {
							noneOperand($(this).parent('span'));
						}
					});
					
					choices.find('option').on('click', function(e){
						if ($(this).val() == $(this).parent().parent().val()) {
							$(this).parent().parent().trigger('change');
						}
					});
					
					input.autoGrowInput({ maxWidth: 500, minWidth: choices.width(), comfortZone: 1 });
					
					input.on ('keyup', function(e){
						if (e.keyCode == 13) { //enter
							e.stopPropagation();
							e.preventDefault();
							if ($(this).val() === '') {
								showOperandChoices($(this).parent('span'));
								$(this).parent('span').find('select option:eq(0)').prop('selected', true);
							} else {
								showHolder($(this).parent('span'), $(this).val(), $(this).val(), 'const');
							}
							resizeOperand($(this).parent('span'));
							return false;
						}
					});
					
					input.on ('blur', function(e){
						if ($(this).val() === '') {
							showOperandChoices($(this).parent('span'));
							$(this).parent('span').find('select option:eq(0)').prop('selected', true);
						} else {
							showHolder($(this).parent('span'), $(this).val(), $(this).val(), 'const');
						}
						resizeOperand($(this).parent('span'));
					});
					
					holder.data('operand-type', 'none');
					holder.data('operand-value', '');
					holder.data('operand-completed', false);
					checkState();
					return holder;
				}
				
				function addOperator() {
					var operatorWrapper = jQuery('<span class="operator-wrapper"></span>');
					var choices = jQuery('<select class="form-control"></select>');  
					choices.append('<option value=""></option>');
					choices.append('<option value="plus">+</option>');
					choices.append('<option value="minus">-</option>');
					choices.append('<option value="multiply">*</option>');
					choices.append('<option value="divide">/</option>');
					choices.append('<option value="modulo">%</option>');
					var holder = jQuery('<span class="operator-holder form-control-static"></span>');
					jQuery.each(settings.operatorHolder.classes, function(c, clazz) {
						holder.addClass(clazz);
					});
					operatorWrapper.append(holder).append(choices);
					expression.append(operatorWrapper);
										
					choices.css({
						width: '43px',
						'margin-top': '-4px'
					});
					
					holder.attr('title', settings.operatorHolder.tip).css(jQuery.extend( {}, holderCSS, { display : "none", 'text-align': 'center' } ));
					operatorWrapper.css({
						display : "none",
					});
					
					holder.on ('click', function(e) {
						e.preventDefault();
						showOperatorChoices($(this).parent('span'));
					});
					choices.on ('change', function(e){
						if ($(this).val() !== '') {
							var holder = $(this).parent('span').children('span');
							holder.data('operand-value', $(this).val()).text($(this).find('option:selected').text()).css({"display":"inline-block"});
							$(this).hide();
							if ($(this).parent('span').is(':last-child')) {
								var operand = createOperand();
								operand.children('span.operand-holder').data('left-operator', operatorWrapper);
							}
						}
					});
					return operatorWrapper;
				}
				
				function showHolder(wrapper, val, label, operandType) {
					var holder = wrapper.children('span.operand-holder');
					var choices = wrapper.children('select');
					var input = wrapper.children('input');
					input.hide();
					choices.hide();
					holder.data('operand-type', operandType);
					holder.data('operand-value', val);
					holder.data('right-operator').css({"display":"inline"});
					holder.text(label).css({"display":"inline-block"}).focus();
					holder.data('operand-completed', true);
					checkState();
				}
				
				function showInput(wrapper, val) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					var holder = wrapper.children('span.operand-holder');
					var choices = wrapper.children('select');
					var input = wrapper.children('input');
					holder.hide();
					choices.hide();
					input.val(val).css({"display":"inline"}).focus();
				}

				function showOperandChoices(wrapper) {
					var choices = wrapper.children('select');
					var input = wrapper.children('input');
					var holder = wrapper.children('span.operand-holder');
					var chosen = choices.val();
					if (chosen == settings.constant.label ){
						if ( input.val() !== "" ){
							choices.find("option[operand-type='const']").text(jQuery.trim(input.val()));
							choices.val(chosen);
						}
					} else {
						if ( input.val() === "" ) {
							choices.children('option:selected').remove();
						} else {
							choices.children('option:selected').text(input.val());
						}
					}
					holder.hide();
					input.hide();
					choices.css({"display":"inline"}).focus();
				}

				function showOperatorChoices(wrapper) {
					var choices = wrapper.children('select');
					var holder = wrapper.children('span.operator-holder');
					holder.hide();
					choices.css({"display":"inline"}).focus();
				}
				
				function resizeOperand(wrapper){
					var width = wrapper.children('select').outerWidth();
					var input = wrapper.children('input');
					var holder = wrapper.children('span.operand-holder');
					wrapper.css({
						"width" : width
					});
					input.css({
						"width" : width
					});
				 
				}
				
				function noneOperand(wrapper) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					var holder = wrapper.children('span.operand-holder');
					holder.data('operand-value', '');
					if (holder.data('right-operator').is(':last-child')) {
						holder.data('right-operator').hide();
					}
					holder.data('operand-completed', false);
					checkState();
				}
				
				function constantOperand(wrapper, constant) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					showInput(wrapper, constant);
				}
				
				function fieldOperand(wrapper, fieldName, fieldLabel) {
					if (wrapper.hasClass('function-operand-wrapper')) {
						wrapper.removeClass('function-operand-wrapper').addClass('operand-wrapper');
						wrapper.children('span.function-wrapper').remove();
					}
					showHolder(wrapper, fieldName, fieldLabel, 'field');
				}
				
				function functionExpression(wrapper, funcName) {
					var holder = wrapper.children('span.operand-holder');
					if (wrapper.hasClass('function-operand-wrapper')) {
						if (holder.data('operand-value') == funcName) {
							return;
						} else {
							wrapper.children('span.function-wrapper').remove();
						}
					}
					var func = settings.functions[funcName];
					showHolder(wrapper, funcName, funcName, 'func');
					wrapper.removeClass('operand-wrapper').removeClass('nested-operand-wrapper').addClass('function-operand-wrapper');
					var functionWrapper = jQuery('<span class="function-wrapper"></span>');
					wrapper.append(functionWrapper);
					var leftParenthesis = jQuery('<span class="left-parenthesis-holder form-control-static">(</span>');
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						leftParenthesis.addClass(clazz);
					});
					functionWrapper.append(leftParenthesis);
					var nested = jQuery('<span class="nested-expression"></span>');
					functionWrapper.append(nested);
					nested.expressionbuilder(
						jQuery.extend({}, settings, {
							onCompleted: function(type) { checkState(); },
							onEditing: function() { checkState(); }	
						})
					);
					for (var i = 1; i < func.arity; i++) {
						var comma = jQuery('<span class="comma-holder form-control-static">,</span>');
						comma.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
						jQuery.each(settings.operatorHolder.classes, function(c, clazz) {
							comma.addClass(clazz);
						});
						functionWrapper.append(comma);
						var nested = jQuery('<span class="nested-expression"></span>');
						functionWrapper.append(nested);
						nested.expressionbuilder(
							jQuery.extend({}, settings, {
								onCompleted: function(type) { checkState(); },
								onEditing: function() { checkState(); }	
							})
						);
					}
					var rightParenthesis = jQuery('<span class="right-parenthesis-holder form-control-static">)</span>');
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						rightParenthesis.addClass(clazz);
					});
					functionWrapper.append(rightParenthesis);
					leftParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
					rightParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
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
				
				function nestedExpression(wrapper) {
					var holder = wrapper.children('span.operand-holder');
					var rightOperator = holder.data('right-operator');
					rightOperator.css({"display":"inline"});
					wrapper.empty();
					wrapper.removeClass('operand-wrapper').addClass('nested-operand-wrapper');
					var leftParenthesis = jQuery('<span class="left-parenthesis-holder operand-holder form-control-static">(</span>');
					leftParenthesis.data('operand-type', 'nested');
					leftParenthesis.data('operand-value', '');
					leftParenthesis.data('operand-completed', false);
					leftParenthesis.data('right-operator', rightOperator);
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						leftParenthesis.addClass(clazz);
					});
					wrapper.append(leftParenthesis);
					var nested = jQuery('<span class="nested-expression"></span>');
					wrapper.append(nested);
					var rightParenthesis = jQuery('<span class="right-parenthesis-holder form-control-static">)<sub class="glyphicon glyphicon-remove"></sub></span>');
					jQuery.each(settings.nestedExpression.classes, function(c, clazz) {
						rightParenthesis.addClass(clazz);
					});
					wrapper.append(rightParenthesis);
					nested.expressionbuilder(
						jQuery.extend({}, settings, {
							onCompleted: function(type) { checkState(); },
							onEditing: function() { checkState(); }	
						})
					);
					leftParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } ));
					rightParenthesis.css(jQuery.extend( {}, holderCSS, { "cursor": "default", 'text-align': 'center' } )
					).find('sub').attr('title', settings.nestedExpression.deleteTip).css({
						"margin-left": "2px",
						"cursor": "pointer"
					}).on('click', function(e) {
						removeNestedExpression(wrapper);
					});
					checkState();
				}

				function checkState() {
					var completed = expression.expressionbuilder('completed');
					if (completed) {
						if (lastevent != 2) {
							settings.onCompleted('text'); // TODO : calculate type
							lastevent = 2;
						}
					} else {
						if (lastevent != 1) {
							settings.onEditing();
							lastevent = 1;
						}
					}
				}
			  
			}); // END RETURN 
		},
		destroy : function() {
			$(this).remove();
		},
		completed: function() {
			var expression = $(this);
			var settings = expression.data('settings');
			var isCompleted = true;
			expression.children().each(function(o) {
				var wrapper = $(this);
				if (wrapper.hasClass('nested-operand-wrapper')) {
					var nested = wrapper.children('span.nested-expression');
					if (! nested.expressionbuilder('completed')) {
						isCompleted = false;
					}
				} else if (wrapper.hasClass('function-operand-wrapper')) {
					var holder = wrapper.children('span.operand-holder');
					var funcName = holder.data('operand-value');
					var func = settings.functions[funcName];
					var functionWrapper = wrapper.children('span.function-wrapper');
					var args = functionWrapper.children('span.nested-expression');
					for (var i = 0; i < func.arity; i++) {
						if (! args.eq(i).expressionbuilder('completed')) {
							isCompleted = false;
							break;
						}
					}
				} else if (wrapper.hasClass('operand-wrapper')) {
					var holder = wrapper.children('span.operand-holder');
					if (! holder.data('operand-completed')) {
						isCompleted = false;
					}
				}
			});
			return isCompleted;
		},
		result : function() {
			var settings = $(this).data('settings');
			var expr = function (container) {
				var expression = "";
				container.children().each(function() {
					var self = $(this);
					if (self.hasClass('operand-wrapper')) {
						var holder = self.children('span.operand-holder');
						var value = holder.data('operand-value');
						if (settings.fields[value]) {
							expression += '#' + settings.fields[value].id;
						} else {
							expression += holder.data('operand-value');
						}
					} else if (self.hasClass('function-operand-wrapper')) {
						var holder = self.children('span.operand-holder');
						var funcName = holder.data('operand-value');
						var func = settings.functions[funcName];
						var functionWrapper = self.children('span.function-wrapper');
						var args = functionWrapper.children('span.nested-expression');
						expression += funcName + '(' + args.eq(0).expressionbuilder('result');
						for (var i = 1; i < func.arity; i++) {
							expression += ', ' + args.eq(i).expressionbuilder('result');
						}
						expression += ')';
					} else if (self.hasClass('operator-wrapper')) {
						var holder = self.children('span.operator-holder');
						expression += ' ' + holder.text() + ' ';
					} else if (self.hasClass('nested-operand-wrapper')) {
						var nested = self.children('span.nested-expression');
						expression += '(' + nested.expressionbuilder('result') + ')';
					}
				});
				return expression;
			};
			
			return expr($(this));
		}
	};

	$.fn.expressionbuilder = function( method ) {    
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.eComboBox' );
		}    
	};

})( jQuery );