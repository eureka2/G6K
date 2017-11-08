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
		"abs" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('abs') },
		"acos" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('acos')},
		"acosh" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('acosh')},
		"addMonths" : {arity: 2, args: ['number', 'date'], type: 'date', label: Translator.trans('addMonths')},
		"asin" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('asin')},
		"asinh" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('asinh')},
		"atan" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('atan')},
		"atan2" : {arity: 2, args: ['number', 'number'], type: 'number', label: Translator.trans('atan2')},
		"atanh" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('atanh')},
		"ceil" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('ceil')},
		"concat" : {arity: -1, args: ['text'], type: 'text', label: Translator.trans('concat')},
		"cos" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('cos')},
		"cosh" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('cosh')},
		"count" : {arity: -1, args: ['number'], type: 'number', label: Translator.trans('count')},
		"day" : {arity: 1, args: ['date'], type: 'number', label: Translator.trans('day')},
		"exp" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('exp')},
		"firstDayOfMonth" : {arity: 1, args: ['date'], type: 'date', label: Translator.trans('firstDayOfMonth')},
		"floor" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('floor')},
		"fullmonth" : {arity: 1, args: ['date'], type: 'text', label: Translator.trans('fullmonth')},
		"get" : {arity: 2, args: ['array', 'number'], type: 'text', label: Translator.trans('get')},
		"lastday" : {arity: 2, args: ['number', 'number'], type: 'number', label: Translator.trans('lastDay')},
		"lastDayOfMonth" : {arity: 1, args: ['date'], type: 'date', label: Translator.trans('lastDayOfMonth')},
		"lcfirst" : {arity: 1, args: ['text'], type: 'text', label: Translator.trans('lcfirst')},
		"length" : {arity: 1, args: ['text'], type: 'number', label: Translator.trans('length')},
		"log" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('log')},
		"log10" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('log10')},
		"lower" : {arity: 1, args: ['text'], type: 'text', label: Translator.trans('lower')},
		"match" : {arity: 2, args: ['text', 'text'], type: 'boolean', label: Translator.trans('match')},
		"max" : {arity: 2, args: ['number', 'number'], type: 'number', label: Translator.trans('max')},
		"min" : {arity: 2, args: ['number', 'number'], type: 'number', label: Translator.trans('min')},
		"money": {arity: 1, args: ['number'], type: 'text', label: Translator.trans('money')},
		"month" : {arity: 1, args: ['date'], type: 'number', label: Translator.trans('month')},
		"nextWorkDay": {arity: 1, args: ['date'], type: 'date', label: Translator.trans('nextWorkDay')},
		"pow" : {arity: 2, args: ['number', 'number'], type: 'number', label: Translator.trans('pow')},
		"rand" : {arity: 0, args: [], type: 'number', label: Translator.trans('rand')},
		"replace": {arity: 3, args: ['text', 'text', 'text'], type: 'text', label: Translator.trans('replace')},
		"round" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('round')},
		"sin" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('sin')},
		"sinh" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('sinh')},
		"size" : {arity: 1, args: ['array'], type: 'number', label: Translator.trans('size')},
		"split" : {arity: 2, args: ['text', 'text'], type: 'array', label: Translator.trans('split')},
		"sqrt" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('sqrt')},
		"substr": {arity: 3, args: ['text', 'number', 'number'], type: 'text', label: Translator.trans('substr')},
		"sum" : {arity: -1, args: ['number'], type: 'number', label: Translator.trans('sum')},
		"tan" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('tan')},
		"tanh" : {arity: 1, args: ['number'], type: 'number', label: Translator.trans('tanh')},
		"trim" : {arity: 1, args: ['text'], type: 'text', label: Translator.trans('trim')},
		"ucfirst" : {arity: 1, args: ['text'], type: 'text', label: Translator.trans('ucfirst')},
		"upper" : {arity: 1, args: ['text'], type: 'text', label: Translator.trans('upper')},
		"workdays" : {arity: 2, args: ['date', 'date'], type: 'number', label: Translator.trans('workdays')},
		"workdaysofmonth" : {arity: 2, args: ['number', 'number'], type: 'number', label: Translator.trans('workdaysofmonth')},
		"year" : {arity: 1, args: ['date'], type: 'number', label: Translator.trans('year')}
	};

	Simulators.constants = { 
		pi: {type : 'number', label: Translator.trans('pi')}, 
		now: {type: 'date', label: Translator.trans('now')}, 
		today: {type: 'date', label: Translator.trans('today')}, 
		'true': {type: 'boolean', label: Translator.trans('true')}, 
		'false': {type: 'boolean', label: Translator.trans('false')}
	};

	Simulators.dateFormats = { 
		'd/m/Y': Translator.trans('d/m/Y') + ' (' +( new Date).format('d/m/Y') + ')', 
		'm/d/Y': Translator.trans('m/d/Y') + ' (' +( new Date).format('m/d/Y') + ')', 
		'd-m-Y': Translator.trans('d-m-Y') + ' (' +( new Date).format('d-m-Y') + ')', 
		'm-d-Y': Translator.trans('m-d-Y') + ' (' +( new Date).format('m-d-Y') + ')', 
		'Y-m-d': Translator.trans('Y-m-d') + ' (' +( new Date).format('Y-m-d') + ')'
	};

	Simulators.parameterDateFormats = { 
		'Y-m-d': Translator.trans('Y-m-d') + ' (' +( new Date).format('Y-m-d') + ')', 
		'Y-m': Translator.trans('Y-m') + ' (' +( new Date).format('Y-m') + ')', 
		'm-d': Translator.trans('m-d') + ' (' +( new Date).format('m-d') + ')', 
		'd/m/Y': Translator.trans('d/m/Y') + ' (' +( new Date).format('d/m/Y') + ')', 
		'm/Y': Translator.trans('m/Y') + ' (' +( new Date).format('m/Y') + ')', 
		'm/d': Translator.trans('m/d') + ' (' +( new Date).format('m/d') + ')',
		'Y': Translator.trans('Y') + ' (' +( new Date).format('Y') + ')',
		'y-m-d': Translator.trans('y-m-d') + ' (' +( new Date).format('y-m-d') + ')',
		'y-m': Translator.trans('y-m') + ' (' +( new Date).format('y-m') + ')',
		'd/m/y': Translator.trans('d/m/Y') + ' (' +( new Date).format('d/m/y') + ')', 
		'm/y': Translator.trans('m/y') + ' (' +( new Date).format('m/y') + ')',
		'y': Translator.trans('y') + ' (' +( new Date).format('y') + ')',
		'm': Translator.trans('m') + ' (' +( new Date).format('m') + ')',
		'd': Translator.trans('d') + ' (' +( new Date).format('d') + ')'
	};

	Simulators.moneySymbols = {'฿':'฿', 'B/.':'B/.', '₵':'₵', '¢':'¢', '₡':'₡', 'Kč':'Kč', '$':'$', '₫':'₫', '€':'€', 'ƒ':'ƒ', 'Ft':'Ft', '₲':'₲', '₴':'₴', '₭':'₭', 'L':'L', '£ / ₤':'£ / ₤', '₺':'₺', '₥':'₥', '₦':'₦', 'S/.':'S/.', '₱':'₱', 'P':'P', 'R':'R', 'RM':'RM', '₹ / ₨':'₹ / ₨', '৲':'৲', '৳':'৳', 'R$':'R$', '₪':'₪', '₮':'₮', '₩':'₩', '¥':'¥', 'Ұ':'Ұ', 'zł':'zł' };

	Simulators.optionalAttributes = {
		'default': { type : 'expression', label: Translator.trans('default'), placeholder: Translator.trans('default value')},
		'min': { type : 'expression', label: Translator.trans('min'), placeholder: Translator.trans('min value')},
		'max': { type : 'expression', label: Translator.trans('max'), placeholder: Translator.trans('max value')},
		'content': { type : 'expression', label: Translator.trans('Content'), placeholder: Translator.trans('content')},
		'round': { type : 'number', label: Translator.trans('Round'), placeholder: Translator.trans('round')},
		'unit': { type : 'text', label: Translator.trans('Unit'), placeholder: Translator.trans('unit text')},
		'source': { type : 'select', label: Translator.trans('Source'), placeholder: Translator.trans('source')},
		'index': { type : 'select', label: Translator.trans('Index'), placeholder: Translator.trans('index name')},
		'memorize': { type : 'checkbox', label: Translator.trans('Memorize'), placeholder: Translator.trans('Store into memo)')}
	};

	Simulators.expressionOptions = {
		constants: Simulators.constants,
		functions: Simulators.functions,
		operators: ['+', '-', '*', '%', '/', '&', '|'],
		onCompleted: function(type, expression) { 
			// console.log('Expression complete, type = ' + type); 
			},
		onEditing: function(expression) { 
			// console.log('Expression being changed'); 
		},
		onError: function(error) { console.log('error : ' + error); },
		language: Admin.lang,
		operandHolder: { classes: ['button', 'button-default'] },
		operatorHolder: { classes: ['button', 'button-default'] },
		nestedExpression: { classes: ['button', 'button-default'] }
	};

	Simulators.sourceReturnTypes = { 
		'json': Translator.trans('JSON'), 
		'xml': Translator.trans('XML'), 
		'singleValue': Translator.trans('Single value'), 
		'assocArray': Translator.trans('Associative array'), 
		'html': Translator.trans('HTML'), 
		'csv': Translator.trans('Comma separated value (csv)') 
	}

	Simulators.outputTypes =  {
		'normal': Translator.trans('Normal'), 
		'inlinePDF': Translator.trans('Inline PDF'), 
		'downloadablePDF': Translator.trans('Downloadable PDF'), 
		'html': Translator.trans('html')
	}

	Simulators.updating = false;

	Simulators.init = function() {
		Admin.wysihtml5Options.toolbar.insertData = true;
		Simulators.collectDataset();
		$('.save-simulator').hide();
	}

	Simulators.changeDataIdInRichText = function(oldId, id) {
		var re1 = new RegExp("#" + oldId + '\\b', 'g');
		var re2 = new RegExp('\\<var\\s+([^\\s]*\\s*)data\\-id=\\"' + oldId + '\\"', 'g');
		$('#simulator').find('.rich-text').each(function(r) {
			var updated = false;
			var richtext = $(this).html();
			if (re1.test(richtext)) {
				richtext = richtext.replace(re1, "#" + id);
				updated = true;
			}
			if (re2.test(richtext)) {
				richtext = richtext.replace(re2, '<var $1data-id="' + id + '"');
				updated = true;
			}
			if (updated) {
				$(this).html(richtext);
			}
		});
	}

	Simulators.changeDataIdInExpression = function(oldId, id) {
		var re1 = new RegExp("#" + oldId + '\\b', 'g');
		$('#simulator').find('span.attribute-expression').each(function(a) {
			var val = $(this).attr('data-value');
			if (re1.test(val)) {
				$(this).attr('data-value', val.replace(re1, "#" + id));
			}
		});
	}

	Simulators.checkDataInExpression = function(dataId, expression) {
		var val = expression.expressionbuilder('val');
		var ids = val.match(/#\d+/g);
		var found = false;
		if (ids != null) {
			$.each(ids, function(k, v) {
				if (v == '#' + dataId) {
					found = true;
					return false;
				}
			});
		}
		return ! found;
	}

	Simulators.simpleAttributeForDisplay = function(element, type, name, label, value, display, required, placeholder, options) {
		if (required || (value && value !== '')) {
			var attribute = '<div class="form-group col-sm-12">';
			attribute    += '    <label class="col-sm-4 control-label">' + label + '</label>';
			attribute    += '    <div class="col-sm-8">';
			value = value || '';
			if (type === 'text' || type === 'number') {
				attribute    += '        <p class="form-control-static simple-value" data-attribute="' + name + '" data-value="' + value + '">' + display + '</p>';
			} else if (type === 'checkbox') {
				attribute    += '        <p class="form-control-static simple-value" data-attribute="' + name + '" data-value="' + (value == '1' || value == 1 ? 1 : 0) + '">' + (value == '1' || value == 1 ? Translator.trans('Yes') : Translator.trans('No')) + '</p>';
			} else if (type === 'select') {
				options = jQuery.parseJSON(options);
				$.each(options, function(ovalue, olabel) {
					if (ovalue == value) {
						attribute    += '       <p class="form-control-static simple-value" data-attribute="' + name + '" data-value="' + ovalue + '">' + olabel + '</p>';
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
		if (type === 'checkbox') {
			attribute    += '    <label for="' + id + '" class="col-sm-8 control-label">';
		} else {
			attribute    += '    <label for="' + id + '" class="col-sm-4 control-label">';
		}
		if (! required) {
			attribute    += '    <span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;';
		}
		attribute    += '    ' + label + '</label>';
		if (type === 'checkbox') {
			attribute    += '    <div class="col-sm-4 input-group">';
		} else {
			attribute    += '    <div class="col-sm-8 input-group">';
		}
		if (type === 'text' || type === 'number') {
			attribute    += '        <input type="' + type + '" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" placeholder="' + placeholder + '"  value="' + value + '" />';
		} else if (type === 'checkbox') {
			attribute    += '        <input type="checkbox" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" value="1"';
			if (value == '1') {
				attribute    += ' checked="checked"';
			}
			attribute    += ' />';
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

	Simulators.simpleToggleAttributeForInput = function(id, name, label, value, required, placeholder) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label class="control-label">';
		if (! required) {
			attribute+= '    <span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;';
		}
		attribute    += '    <span class="col-sm-4">' + label + '</span>';
		attribute    += '    <div style="display: inline-block;" class="col-sm-8 input-group checkbox-slider--b-flat checkbox-slider-primary">';
		attribute    += '        <input type="checkbox" name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" value="1"';
		if (value == '1') {
			attribute+= ' checked="checked"';
		}
		attribute    += ' /><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>';
		attribute    += '    </div></label>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.expressionAttributeForDisplay = function(element, name, label, value, plainvalue, required, placeholder) {
		if (required || value !== '') {
			var attribute = '<div class="form-group col-sm-12">';
			attribute    += '    <label class="col-sm-4 control-label">' + label + '</label>';
			attribute    += '    <span data-attribute="' + name + '" class="attribute-expression" data-placeholder="' + placeholder + '" data-value="' + value + '">' + plainvalue + '</span>'; 
			attribute    += '</div>';
			return $(attribute);
		}
	}

	Simulators.expressionAttributeForInput = function(id, name, label, value, required, placeholder) {
		var attribute = '<div class="form-group col-sm-12">';
		attribute    += '    <label for="' + id + '" class="col-sm-4 control-label">';
		if (! required) {
			attribute    += '    <span class="delete-attribute glyphicon glyphicon-remove text-danger"></span>&nbsp;';
		}
		attribute    += '    ' + label + '</label>';
		attribute    += '    <span id="' + id + '" data-attribute="' + name + '" class="attribute-expression" data-placeholder="' + placeholder + '"  data-value="' + value + '" />'; 
		attribute    += '</div>';
		return $(attribute);
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

	Simulators.dropAttribute = function(ui, target) {
		var element = ui.attr('data-element');
		var name = ui.attr('data-name');
		var id = element + '-' + name;
		if (! $('#' + id).length) {
			var type = ui.attr('data-type');
			var label = ui.text();
			var placeholder = ui.attr('data-placeholder');
			var expression = ui.attr('data-expression') ? ui.attr('data-expression') === 'true' : false;
			var attribute = expression ?
				Simulators.expressionAttributeForInput(id, name, label, '', false, placeholder) :
				Simulators.simpleAttributeForInput(id, type, name, label, '', false, placeholder, decodeURI(ui.attr('data-options')) );
			target.append(attribute);
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
			attribute.find('span.delete-attribute').click(function() {
				Simulators.removeAttribute($(this));
			});
			ui.hide();
		}
	}
	
	Simulators.openCollapsiblePanel = function(id, header, style, inClass, sortable, buttons) {
		inClass = ''; // ignore inClass for the moment
		var collapsiblePanel = $('<div>', { id: id, class: 'panel-group', role:'tablist', 'aria-multiselectable': 'true' });
		var panel = $('<div>', { class: 'panel panel-' + style });
		var panelHeading = $('<div>', { id: id + '-panel', class: 'panel-heading', role:'tab', 'aria-multiselectable': 'true' });
		$.each(buttons, function(b, butt) {
			if (butt.dropdown) {
				var btngroup = $('<div>', { class: 'btn-group pull-right update-button' });
				var button = $('<button>', { class: 'btn btn-' + style + ' dropdown-toggle', title: butt.label, 'data-toggle': 'dropdown', 'aria-haspopup': 'true', 'aria-expanded': 'false' });
				var span1 = $('<span>', { class: 'button-label' } );
				span1.append(butt.label);
				button.append(span1);
				var span2 = $('<span>', { class: 'glyphicon ' + butt.icon } );
				button.append(' ');
				button.append(span2);
				var ul = $('<ul>', { class: 'dropdown-menu'});
				$.each(butt.dropdown, function(d, item) {
					var li = $('<li>');
					var link = $('<a>', { class: item.class, title: item.label, });
					link.append(item.label);
					link.attr('data-parent', '#' + id);
					li.append(link);
					ul.append(li);
				});
				btngroup.append(button, ul);
				panelHeading.append(btngroup);
			} else {
				var button = $('<button>', { class: 'btn btn-' + style + ' pull-right update-button ' + butt.class, title: butt.label });
				button.attr('data-parent', '#' + id);
				var span1 = $('<span>', { class: 'button-label' } );
				span1.append(butt.label);
				button.append(span1);
				var span2 = $('<span>', { class: 'glyphicon ' + butt.icon } );
				button.append(' ');
				button.append(span2);
				panelHeading.append(button);
			}
		});
		if (style === 'primary') {
			var button2 = $('<button>', { class: 'btn btn-' + style + ' pull-right expand-all toggle-collapse-all', title: Translator.trans('Expand all') });
			button2.attr('data-parent', '#' + id);
			var span1 = $('<span>', { class: 'button-label' } );
			span1.append(Translator.trans('Expand all'));
			button2.append(span1);
			var span2 = $('<span>', { class: 'glyphicon glyphicon-expand' } );
			button2.append(' ');
			button2.append(span2);
			panelHeading.append(button2);
		}
		var h4 = $('<h4>', { class: 'panel-title' } );
		var a = $('<a>', { 'data-toggle': 'collapse', 'aria-expanded': 'true' } );
		a.attr('data-parent', '#' + id);
		a.attr('href', '#collapse' + id);
		a.attr('aria-controls', 'collapse' + id);
		a.append(header);
		h4.append(a);
		panelHeading.append(h4);
		panel.append(panelHeading);
		var panelCollapse = $('<div>', { class: 'panel-collapse collapse ' + inClass, role: 'tabpanel' });
		panelCollapse.attr('id', 'collapse' + id);
		panelCollapse.attr('aria-labelledby', id + '-panel');
		var panelBody = $('<div>', { class: 'panel-body ' + sortable });
		panelCollapse.append(panelBody);
		panel.append(panelCollapse);
		collapsiblePanel.append(panel);
		return collapsiblePanel;
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

	Simulators.toast = function(message) {
		var toast = $('<div>', { 'class' : 'toast'});
		$.each(arguments, function (k, arg) {
			toast.append($('<p>', { text: arg }));
		});
		toast.css({	display: "block", 
					opacity: 0.90, 
					position: "fixed",
					padding: "7px",
					"text-align": "center",
					width: "270px",
					left: ($(window).width() - 284)/2,
					top: $(window).height()/2 }
				)
				.appendTo( 'body' ).delay( 1500 )
				.fadeOut( 400, function(){
					$(this).remove();
				});
	}

	Simulators.checkSimulatorOptions = function(simulatorContainer) {
		var name = $.trim($('#simulator-name').val());
		if (name === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator name is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if (! /^[\w\-]+$/.test(name)) {
			simulatorContainer.find('.error-message').text(Translator.trans('Incorrect simulator name'));
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

	Simulators.bindSimulatorButtons = function() {
		$('#sources-panel').find('> button.add-source').click(function(e) {
		    e.preventDefault();
			Simulators.addSource($($(this).attr('data-parent')));
		});
		$('#datas-panel').find('> button.add-datagroup, > div > ul li a.add-datagroup').click(function(e) {
		    e.preventDefault();
			Simulators.addDatagroup($($(this).attr('data-parent')));
		});
		$('#datas-panel').find('> button.add-data, > div > ul li a.add-data').click(function(e) {
		    e.preventDefault();
			Simulators.addData($($(this).attr('data-parent')));
		});
		$('#steps-panel').find('> button.add-step').click(function(e) {
		    e.preventDefault();
			Simulators.addStep($($(this).attr('data-parent')));
		});
		$('#businessrules-panel').find('> button.add-rule').click(function(e) {
		    e.preventDefault();
			Simulators.addRule($($(this).attr('data-parent')));
		});
		$('#profiles-panel').find('> button.add-profile').click(function(e) {
		    e.preventDefault();
			Simulators.addProfile($($(this).attr('data-parent')));
		});
	}

	Simulators.bindSimulatorOptions = function(simulatorContainer) {
		simulatorContainer.find('textarea').wysihtml5(Admin.wysihtml5Options);
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
				$('#simulator-options-panel.panel-heading h4.panel-title').text($('#simulator-label').val());
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
				$('.toggle-collapse-all').show();
				Simulators.updating = false;
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
			$('.toggle-collapse-all').show();
			if (! Admin.updated) {
				$('.save-simulator').hide();
			}
			Simulators.updating = false;
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
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-name', 'text', 'name', Translator.trans('Name'), simulator.name, true, Translator.trans('Simulator name without spaces or special characters')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-label', 'text', 'label', Translator.trans('Label'), simulator.label, true, Translator.trans('Simulator label')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-defaultView', 'select', 'defaultView', Translator.trans('Default view'), simulator.defaultView, true, Translator.trans('Default view'), JSON.stringify(views)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-referer', 'text', 'referer', Translator.trans('Main referer'), simulator.referer, false, Translator.trans('referer URL')));
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
		var simulatorDescriptionBody = $('<div class="panel-body simulator-description rich-text"></div>');
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
			$('.toggle-collapse-all').hide();
			Simulators.updating = true;
		});
		Simulators.bindSimulatorButtons();
		Simulators.bindProfileDataButtons();
		Simulators.bindProfileButtons();
		Simulators.bindRuleButtons();
		Simulators.bindDataButtons();
		Simulators.bindDatagroupButtons();
		Simulators.bindSourceButtons();
		Simulators.bindFieldButtons();
		Simulators.bindFieldRowButtons();
		Simulators.bindFieldSetColumnButtons();
		Simulators.bindSectionButtons();
		Simulators.bindChapterButtons();
		Simulators.bindBlockInfoButtons();
		Simulators.bindFieldSetButtons();
		Simulators.bindPanelButtons();
		Simulators.bindFootNotesButtons();
		Simulators.bindFootNoteButtons();
		Simulators.bindActionButtonButtons();
		Simulators.bindStepButtons();
		Simulators.bindSortableSources();
		Simulators.bindSortableDatas();
		Simulators.bindSortableSteps();
		Simulators.bindSortableFootNotes();
		Simulators.bindSortableActionButtons();
		Simulators.bindSortablePanels();
		Simulators.bindSortableBlocks();
		Simulators.bindSortableFieldRows();
		Simulators.bindSortableFieldSetColumns();
		Simulators.bindSortableFields();
		Simulators.bindSortableChapters();
		Simulators.bindSortableSections();
		Simulators.bindSortableRules();
		Simulators.bindSortableProfileDatas();
		Simulators.bindSortableProfiles();
		$('#page-simulators textarea').wysihtml5(Admin.wysihtml5Options);
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
		$('#collapsedatas .choices-panel').each(function(k) {
			if ($(this).find('.choice-source-container').length > 0) {
				$(this).find('.choice-container').hide();
			}
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
		$('#page button.save-simulator').click(function(e) {
			var simulator = {
				name: $('#simulator-attributes-panel-holder').find("p[data-attribute='name']").attr('data-value'),
				label: $('#simulator-attributes-panel-holder').find("p[data-attribute='label']").attr('data-value'),
				defaultView: $('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").attr('data-value'),
				referer: $('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").attr('data-value'),
				dateFormat: $('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").attr('data-value'),
				decimalPoint: $('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").attr('data-value'),
				moneySymbol: $('#simulator-attributes-panel-holder').find("p[data-attribute='moneySymbol']").attr('data-value'),
				symbolPosition: $('#simulator-attributes-panel-holder').find("p[data-attribute='symbolPosition']").attr('data-value'),
				dynamic: $('#simulator-attributes-panel-holder').find("p[data-attribute='dynamic']").attr('data-value'),
				memo: $('#simulator-attributes-panel-holder').find("p[data-attribute='memo']").attr('data-value'),
				description: $('#simulator-description-panel-holder').find(".simulator-description").html(),
				relatedInformations: $('#simulator-related-informations-panel-holder').find('.simulator-related-informations').html()
			};
			$('input[name=simulator]').val(JSON.stringify(simulator));
			$('input[name=sources]').val(JSON.stringify(Simulators.collectSources()));
			$('input[name=datas]').val(JSON.stringify(Simulators.collectDatas()));
			$('input[name=steps]').val(JSON.stringify(Simulators.collectSteps()));
			$('input[name=rules]').val(JSON.stringify(Simulators.collectRules()));
			$('input[name=profiles]').val(JSON.stringify(Simulators.collectProfiles()));
			Admin.updated = false;
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
		$('.panel-collapse').on('hide.bs.collapse show.bs.collapse', function () {
			if (Simulators.updating) {
				Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click «Cancel» or «Validate»'));
			}
			return ! Simulators.updating;
		});
		$('button.toggle-collapse-all').on('click',function() {
			if (Simulators.updating) {
				Simulators.toast(Translator.trans('An update is in progress,'), Translator.trans('first click "Cancel" or "Validate"'));
				return false;
			}
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
		if ( $("#save-form input[name='create']" ).length) {
			$('#simulator button.edit-simulator').trigger('click');
			$('#simulator-name').val('');
		}
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