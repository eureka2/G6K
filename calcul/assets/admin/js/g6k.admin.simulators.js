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

	function Simulators() {
	};

	Simulators.dataTypes = ['date', 'boolean', 'number', 'integer', 'text', 'textarea', 'money', 'choice', 'multichoice', 'percent', 'table', 'department', 'region', 'country', 'year', 'month', 'day'];

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
		"titlecase" : {arity: 1, args: ['text'], type: 'text', label: Translator.trans('ucwords')},
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
		'd.m.Y': Translator.trans('d.m.Y') + ' (' +( new Date).format('d.m.Y') + ')', 
		'd.m.Y.': Translator.trans('d.m.Y.') + ' (' +( new Date).format('d.m.Y.') + ')', 
		'd/m Y': Translator.trans('d/m Y') + ' (' +( new Date).format('d/m Y') + ')', 
		'd. m. Y': Translator.trans('d. m. Y') + ' (' +( new Date).format('d. m. Y') + ')', 
		'Y-m-d': Translator.trans('Y-m-d') + ' (' +( new Date).format('Y-m-d') + ')',
		'Y/m/d': Translator.trans('Y/m/d') + ' (' +( new Date).format('Y/m/d') + ')',
		'Y. m. d.': Translator.trans('Y. m. d.') + ' (' +( new Date).format('Y. m. d.') + ')'
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

	Simulators.decimalPoints = {
		",": Translator.trans('Comma'),
		".": Translator.trans('Dot'),
		"٫": Translator.trans('Arabic decimal point')
	};

	Simulators.groupingSeparators = {
		"": Translator.trans('None'),
		" ": Translator.trans('Space'),
		",": Translator.trans('Comma'),
		"٬": Translator.trans('Arabic thousands separator'),
		".": Translator.trans('Dot'),
		"'": Translator.trans('Apostrophe'),
		"’": Translator.trans('Private use 2')
	};

	Simulators.optionalAttributes = {
		'default': { type : 'expression', label: Translator.trans('default'), placeholder: Translator.trans('default value')},
		'min': { type : 'expression', label: Translator.trans('min'), placeholder: Translator.trans('min value')},
		'max': { type : 'expression', label: Translator.trans('max'), placeholder: Translator.trans('max value')},
		'pattern': { type : 'text', label: Translator.trans('Pattern'), placeholder: Translator.trans('Pattern')},
		'content': { type : 'expression', label: Translator.trans('Content'), placeholder: Translator.trans('content')},
		'round': { type : 'number', label: Translator.trans('Round'), placeholder: Translator.trans('Number of decimals after the decimal point')},
		'unit': { type : 'text', label: Translator.trans('Unit'), placeholder: Translator.trans('unit text')},
		'source': { type : 'select', label: Translator.trans('Source'), placeholder: Translator.trans('source')},
		'index': { type : 'select', label: Translator.trans('Index'), placeholder: Translator.trans('Path to the data in JSONPath or XPath format')},
		'memorize': { type : 'checkbox', label: Translator.trans('Memorize'), placeholder: Translator.trans('Store into memo)')}
	};

	Simulators.expressionOptions = {
		constants: Simulators.constants,
		functions: Simulators.functions,
		operators: ['+', '-', '*', '%', '/', '&', '|'],
		onCompleted: function(type, expression) { 
			},
		onEditing: function(expression) { 
		},
		onError: function(error) { console && console.log('error : ' + error); },
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
		'inlineFilledPDF': Translator.trans('Inline pre-filled PDF form'), 
		'downloadableFilledPDF': Translator.trans('Downloadable pre-filled PDF form'), 
		'html': Translator.trans('html')
	}

	Simulators.updating = false;

	Simulators.setRegionalSettings = function() {
		var attributesPanel = $('#simulator-attributes-panel-holder');
		var settings = {
			locale: attributesPanel.find("p[data-attribute='locale']").attr('data-value'),
			dateFormat: attributesPanel.find("p[data-attribute='dateFormat']").attr('data-value'),
			timezone: attributesPanel.find("p[data-attribute='timezone']").attr('data-value'),
			decimalPoint: attributesPanel.find("p[data-attribute='decimalPoint']").attr('data-value'),
			groupingSeparator: attributesPanel.find("p[data-attribute='groupingSeparator']").attr('data-value'),
			groupingSize: attributesPanel.find("p[data-attribute='groupingSize']").attr('data-value'),
			moneySymbol: attributesPanel.find("p[data-attribute='moneySymbol']").attr('data-value'),
			symbolPosition: attributesPanel.find("p[data-attribute='symbolPosition']").attr('data-value'),
		}
		Date.setRegionalSettings(settings);
		MoneyFunction.setRegionalSettings(settings);
	}

	Simulators.init = function() {
		Admin.wysihtml5Options.toolbar.insertData = true;
		Admin.wysihtml5Options.toolbar.insertFootnoteReference = true;
		if ( $( "#simulator-attributes-panel-holder" ).length ) {
			Simulators.setRegionalSettings();
		}
		Simulators.collectDataset();
		$('.save-simulator').hide();
	}

	Simulators.changeDataIdInRichText = function(oldId, id) {
		var re1 = new RegExp('#(' + oldId + '\\b|' + oldId + '(L))', 'g');
		var re2 = new RegExp('\\<data\\s+([^\\s]*\\s*)value=\\"' + oldId + '\\"', 'g');
		$('#simulator').find('.rich-text').each(function(r) {
			var updated = false;
			var richtext = $(this).html();
			if (re1.test(richtext)) {
				richtext = richtext.replace(re1, "#" + id + '$2');
				updated = true;
			}
			if (re2.test(richtext)) {
				richtext = richtext.replace(re2, '<data $1value="' + id + '"');
				updated = true;
			}
			if (updated) {
				$(this).html(richtext);
			}
		});
	}

	Simulators.changeDataIdInExpression = function(oldId, id) {
		var re1 = new RegExp('#(' + oldId + '\\b|' + oldId + '(L))', 'g');
		$('#simulator').find('span.attribute-expression').each(function(a) {
			var val = $(this).attr('data-value');
			if (re1.test(val)) {
				$(this).attr('data-value', val.replace(re1, "#" + id + '$2'));
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

	Simulators.cleanRichtext = function(text) {
		text = text.replace(/<p>&nbsp;<\/p>/g, "\n");
		text = text.replace(/<p><br><\/p>/g, "\n");
		text = text.replace(/<br>/g, "\n");
		text = text.replace(/<\/p>/g, "\n");
		text = text.replace(/<p>/g, "");
		return text;
	}

	Simulators.paragraphs = function(str) {
		if (str.edition && str.edition != 'manual') {
			return str;
		}
		var text = typeof str.content != 'undefined' ? str.content : str;
		text = Simulators.cleanRichtext(text);
		var blocktags = ['address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];
		var paragraphs = $.trim(text).split("\n");
		var result = "";
		$.each(paragraphs, function(p, paragraph) {
			paragraph = $.trim(paragraph);
			if (paragraph.length == 0) {
				result += '<br>';
			} else {
				result += '<p>';
				result +=  paragraph;
				result += '</p>';
			}
		});
		$.each(blocktags, function(t, tag) {
			result = result.replace(new RegExp("<p>\\s*<" + tag + ">", 'g'), "<" + tag + ">");
			result = result.replace(new RegExp("<" + tag + ">\\s*<\/p>", 'g'), "<" + tag + ">");
			result = result.replace(new RegExp("<p>\\s*<\/" + tag + ">", 'g'), "</" + tag + ">");
			result = result.replace(new RegExp("<\\/" + tag + ">\\s*<\\/p>", 'g'), "</" + tag + ">");
		});
		if (typeof str.content != 'undefined') {
			str.content = result;
			return str;
		} else {
			return result;
		}
	}

	Simulators.simpleAttributeForDisplay = function(element, type, name, label, value, display, required, placeholder, options) {
		if (required || (value && value !== '')) {
			var attribute = '<div class="form-group row">';
			attribute    += '    <label class="col-sm-4 col-form-label">' + label + '</label>';
			attribute    += '    <div class="col-sm-8">';
			value = value || '';
			if (type === 'text' || type === 'number') {
				attribute    += '        <p class="form-control-plaintext simple-value" data-attribute="' + name + '" data-value="' + value + '">' + display + '</p>';
			} else if (type === 'checkbox') {
				attribute    += '        <p class="form-control-plaintext simple-value" data-attribute="' + name + '" data-value="' + (value == '1' || value == 1 ? 1 : 0) + '">' + (value == '1' || value == 1 ? Translator.trans('Yes') : Translator.trans('No')) + '</p>';
			} else if (type === 'select') {
				options = JSON.parse(options);
				$.each(options, function(ovalue, olabel) {
					if (ovalue == value) {
						attribute    += '       <p class="form-control-plaintext simple-value" data-attribute="' + name + '" data-value="' + ovalue + '">' + olabel + '</p>';
					}
				});
			}
			attribute    += '    </div>';
			attribute    += '</div>';
			return $(attribute);
		}
	}

	Simulators.simpleAttributeForInput = function(id, type, name, label, value, required, placeholder, options) {
		var attribute = '<div class="form-group row">';
		if (type === 'checkbox') {
			attribute    += '    <label for="' + id + '" class="col-sm-8 col-form-label">';
		} else {
			attribute    += '    <label for="' + id + '" class="col-sm-4 col-form-label">';
		}
		if (! required) {
			attribute    += '    <span tabindex="0" class="delete-attribute fas fa-times text-danger"></span>&nbsp;';
		}
		attribute    += '    <span>' + label + '</span></label>';
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
			options = JSON.parse(options);
			var labels = [];
			$.each(options, function(ovalue, olabel) {
				labels.push({label: olabel, value: ovalue});
			});
			labels.sort(function (a, b) {
				return a.label.localeCompare(b.label);
			});
			attribute    += '        <select name="' + id + '" id="' + id + '" data-attribute="' + name + '" class="form-control simple-value" data-placeholder="' + placeholder + '">';
			$.each(labels, function(i, option) {
				if (option.value == value) {
					attribute    += '        <option value="' + option.value + '" selected="selected">' + option.label + '</option>';
				} else {
					attribute    += '        <option value="' + option.value + '">' + option.label + '</option>';
				}
			});
			attribute    += '        </select>';
		}
		attribute    += '    </div>';
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.simpleToggleAttributeForInput = function(id, name, label, value, required, placeholder) {
		var attribute = '<div class="form-group row">';
		attribute    += '    <label class="col-form-label">';
		if (! required) {
			attribute+= '    <span tabindex="0" class="delete-attribute fas fa-times text-danger"></span>&nbsp;';
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
			var attribute = '<div class="form-group row">';
			attribute    += '    <label class="col-sm-4 col-form-label">' + label + '</label>';
			attribute    += '    <span data-attribute="' + name + '" class="attribute-expression" data-placeholder="' + placeholder + '" data-value="' + value + '">' + plainvalue + '</span>'; 
			attribute    += '</div>';
			return $(attribute);
		}
	}

	Simulators.expressionAttributeForInput = function(id, name, label, value, required, placeholder) {
		var attribute = '<div class="form-group row">';
		attribute    += '    <label for="' + id + '" class="col-sm-4 col-form-label">';
		if (! required) {
			attribute    += '    <span tabindex="0" class="delete-attribute fas fa-times text-danger"></span>&nbsp;';
		}
		attribute    += '    <span>' + label + '</span></label>';
		attribute    += '    <span id="' + id + '" data-attribute="' + name + '" class="attribute-expression" data-placeholder="' + placeholder + '"  data-value="' + value + '" />'; 
		attribute    += '</div>';
		return $(attribute);
	}

	Simulators.removeAttribute = function(attr) {
		var id =  attr.parent('label.col-form-label').attr('for');
		var input = $('#' + id);
		var ids  = input.attr('id').split('-');
		var name = ids.pop();
		var element = ids.join('-');
		var li = attr.parents('div.attributes-container').children('div.optional-attributes').children('ul').children("li[data-element='" + element +"'][data-name='" + name +"']");
		li.show().focus();
		attr.parent('label').parent('div.form-group').remove();
	}

	Simulators.dropAttribute = function(ui, target, onDelete) {
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
			attribute.find('span.delete-attribute')
				.on('click', function() {
					var attr = $(this).parent().parent().find('[data-attribute]').attr('data-attribute');
					Simulators.removeAttribute($(this));
					onDelete && onDelete(attr);
				})
				.on('keydown', function(e) {
					var key = e.keyCode || e.which || e.key;
					if (key == 13) {
						e.preventDefault();
						var attr = $(this).parent().parent().find('[data-attribute]').attr('data-attribute');
						Simulators.removeAttribute($(this));
						onDelete && onDelete(attr);
					} else if (key == 32) {
						e.preventDefault();
					}
				});
			ui.hide();
			if (expression) {
				attribute.find('.attribute-expression').focus();
			} else {
				attribute.find(':input').focus();
			}
		}
	}
	
	Simulators.openCollapsiblePanel = function(id, header, style, inClass, sortable, buttons) {
		inClass = ''; // ignore inClass for the moment
		var collapsiblePanel = $('<div>', { id: id, class: 'panel-group', role:'tablist', 'aria-multiselectable': 'true' });
		var panel = $('<div>', { class: 'card bg-' + style });
		var panelHeading = $('<div>', { id: id + '-panel', class: 'card-header', role:'tab', 'aria-multiselectable': 'true' });
		var buttonstyle = style === 'light' ? 'secondary' : style;
		$.each(buttons, function(b, butt) {
			if (butt.dropdown) {
				var btngroup = $('<div>', { class: 'btn-group float-right update-button' });
				var button = $('<button>', { class: 'btn btn-' + buttonstyle + ' dropdown-toggle', title: butt.label, 'data-toggle': 'dropdown', 'aria-haspopup': 'true', 'aria-expanded': 'false' });
				var span1 = $('<span>', { class: 'button-label' } );
				span1.append(butt.label);
				button.append(span1);
				var span2 = $('<span>', { class: 'fa ' + butt.icon } );
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
				var button = $('<button>', { class: 'btn btn-' + buttonstyle + ' float-right update-button ' + butt.class, title: butt.label });
				button.attr('data-parent', '#' + id);
				var span1 = $('<span>', { class: 'button-label' } );
				span1.append(butt.label);
				button.append(span1);
				var span2 = $('<span>', { class: 'fa ' + butt.icon } );
				button.append(' ');
				button.append(span2);
				panelHeading.append(button);
			}
		});
		if (style === 'primary') {
			var button2 = $('<button>', { class: 'btn btn-' + style + ' float-right expand-all toggle-collapse-all', title: Translator.trans('Expand all') });
			button2.attr('data-parent', '#' + id);
			var span1 = $('<span>', { class: 'button-label' } );
			span1.append(Translator.trans('Expand all'));
			button2.append(span1);
			var span2 = $('<span>', { class: 'far fa-caret-square-right' } );
			button2.append(' ');
			button2.append(span2);
			panelHeading.append(button2);
		}
		var h4 = $('<h4>', { class: 'card-title' } );
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
		var panelBody = $('<div>', { class: 'card-body ' + sortable });
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
		if ($("input[name='clone']").length > 0 || $("input[name='create']").length > 0) {
			var simulators = [];
			$('#simulators ul.nav li.nav-item a').each(function() {
				simulators.push($(this).attr('href').replace(/^.*\/([^\/]+)$/, '$1'));
			});
			if (simulators.indexOf(name) >= 0) {
				simulatorContainer.find('.error-message').text(Translator.trans("The simulator « %simulator% » already exists.", { 'simulator': name}));
				simulatorContainer.find('.alert').show();
				return false;
			}
		}
		if (name == 'all') {
			simulatorContainer.find('.error-message').text(Translator.trans("The name of the simulator can't be 'all'"));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if ($.trim($('#simulator-label').val()) === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator label is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if ($('#simulator-groupingSeparator').val() === $('#simulator-decimalPoint').val()) {
			simulatorContainer.find('.error-message').text(Translator.trans("The simulator grouping separator and the decimal point can't be the same"));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if ($('#simulator-groupingSize').val() === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator grouping size is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		if ($.trim($('#simulator-timezone').val()) === '') {
			simulatorContainer.find('.error-message').text(Translator.trans('The simulator time zone is required'));
			simulatorContainer.find('.alert').show();
			return false;
		}
		return true;
	}

	Simulators.bindSimulatorButtons = function() {
		$('#sources-panel').find('> button.add-source').on('click', function(e) {
		    e.preventDefault();
			Simulators.addSource($($(this).attr('data-parent')));
		});
		$('#datas-panel').find('> button.add-datagroup, > div > ul li a.add-datagroup').on('click', function(e) {
		    e.preventDefault();
			Simulators.addDatagroup($($(this).attr('data-parent')));
		});
		$('#datas-panel').find('> button.add-data, > div > ul li a.add-data').on('click', function(e) {
		    e.preventDefault();
			Simulators.addData($($(this).attr('data-parent')));
		});
		$('#steps-panel').find('> button.add-step').on('click', function(e) {
		    e.preventDefault();
			Simulators.addStep($($(this).attr('data-parent')));
		});
		$('#businessrules-panel').find('> button.add-rule').on('click', function(e) {
		    e.preventDefault();
			Simulators.addRule($($(this).attr('data-parent')));
		});
		$('#profiles-panel').find('> button.add-profile').on('click', function(e) {
		    e.preventDefault();
			Simulators.addProfile($($(this).attr('data-parent')));
		});
	}

	Simulators.bindSimulatorOptions = function(simulatorContainer) {
		simulatorContainer.find('textarea').wysihtml(Admin.wysihtml5Options);
		simulatorContainer.find('.sortable' ).sortable({
			cursor: "move",
			axis: "y"
		});
		$('#simulator-locale').on('change', function() {
			Simulators.getRegionalSettings($(this).val(), function(settings) {
				if (settings) {
					$('#simulator-dateFormat').val(settings.date_input_format);
					$('#simulator-decimalPoint').val(settings.currency_decimal_point);
					$('#simulator-moneySymbol').val(settings.currency_symbol);
					$('#simulator-groupingSeparator').val(settings.currency_grouping_separator);
					$('#simulator-groupingSize').val(settings.currency_grouping_size);
					var currentTimezone = $('#simulator-timezone').val();
					$('#simulator-timezone').find('option').remove();
					$.each(settings.date_timezones, function(timezone) {
						var option = $('<option>', {value: timezone, text: timezone });
						if (timezone == currentTimezone || timezone == settings.date_timezone) {
							option.attr('selected', true);
						}
						$('#simulator-timezone').append(option);
					});
					$('#simulator-symbolPosition').val(settings.currency_symbol_position);
				}
			});
		});
		simulatorContainer.find('.validate-edit-simulator').on('click', function() {
			if (Simulators.checkSimulatorOptions(simulatorContainer)) {
				simulatorContainer.find('.alert').hide();
				$('#simulator-attributes-panel-holder').find("p[data-attribute='name']").attr('data-value', $('#simulator-name').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='name']").text($('#simulator-name').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='label']").attr('data-value', $('#simulator-label').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='label']").text($('#simulator-label').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='category']").attr('data-value', $('#simulator-category').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='category']").text($('#simulator-category').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").attr('data-value', $('#simulator-referer').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").text($('#simulator-referer').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='locale']").attr('data-value', $('#simulator-locale').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='locale']").text($('#simulator-locale option:selected').text());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").attr('data-value', $('#simulator-defaultView').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").text($('#simulator-defaultView').val());
				$('#simulator-options-panel.card-header h4.card-title').text($('#simulator-label').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").attr('data-value', $('#simulator-dateFormat').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").text($('#simulator-dateFormat option:selected').text());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='timezone']").attr('data-value', $('#simulator-timezone').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='timezone']").text($('#simulator-timezone').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").attr('data-value', $('#simulator-decimalPoint').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").text($('#simulator-decimalPoint option:selected').text());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='groupingSeparator']").attr('data-value', $('#simulator-groupingSeparator').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='groupingSeparator']").text($('#simulator-groupingSeparator option:selected').text());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='groupingSize']").attr('data-value', $('#simulator-groupingSize').val());
				$('#simulator-attributes-panel-holder').find("p[data-attribute='groupingSize']").text($('#simulator-groupingSize').val());
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
				$('#simulator-description-panel-holder').find(".simulator-description").html(Admin.clearHTML($('#simulator-description')));
				$('#simulator-description-panel-holder').find(".simulator-description").attr('data-edition', 'wysihtml');
				$('#simulator-related-informations-panel-holder').find(".simulator-related-informations").html(Admin.clearHTML($('#simulator-related-informations')));
				$('#simulator-related-informations-panel-holder').find(".simulator-related-informations").attr('data-edition', 'wysihtml');
				$('#simulator-attributes-panel').remove();
				$('#simulator-description-panel').remove();
				$('#simulator-related-informations-panel').remove();
				$('#simulator-buttons-panel').remove();
				$('#simulator-attributes-panel-holder').show();
				$('#simulator-description-panel-holder').show();
				$('#simulator-related-informations-panel-holder').show();
				Simulators.setRegionalSettings();
				Admin.updated = true;
				$('.update-button').show();
				$('.toggle-collapse-all').show();
				Simulators.updating = false;
			}
		});
		simulatorContainer.find('.cancel-edit-simulator').on('click', function() {
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
		Simulators.bindOptionalAttributes(simulatorContainer);
	}

	Simulators.bindOptionalAttributes = function(container, onSelect, onDelete) {
		container.find('.delete-attribute')
			.on('click', function() {
				var attr = $(this).parent().parent().find('[data-attribute]').attr('data-attribute');
				Simulators.removeAttribute($(this));
				onDelete && onDelete(attr);
			}).on('keydown', function(e) {
				var key = e.keyCode || e.which || e.key;
				if (key == 13) {
					e.preventDefault();
					var attr = $(this).parent().parent().find('[data-attribute]').attr('data-attribute');
					Simulators.removeAttribute($(this));
					onDelete && onDelete(attr);
				} else if (key == 32) {
					e.preventDefault();
				}
			});
		container.find('.optional-attributes li' ).each(function(){
			var self = $(this);
			self.draggable({
				cursor: "move",
				revert: true,
				containment: self.closest('.attributes-container'),
				drag: function( event, ui ) { ui.helper.css('border', '1px solid lightblue'); },
				stop: function( event, ui ) { ui.helper.css('border', 'none') }
			});
		});
		container.find('.optional-attributes li' ).on("dblclick", function() {
			Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'), onDelete);
			onSelect && onSelect($(this));
		});
		container.find('.optional-attributes li' ).on("keydown", function(e) {
			var key = e.keyCode || e.which || e.key;
			switch (key) {
				case 13:
					e.preventDefault();
					e.stopPropagation();
					Simulators.dropAttribute($(this), $(this).parents('.attributes-container').children('div:first-child'), onDelete);
					onSelect && onSelect($(this));
					break;
				case 35: // end
					e.preventDefault();
					$(this).parent().children(':visible').last().focus();
					break;
				case 36: // home
					e.preventDefault();
					$(this).parent().children(':visible').first().focus();
					break;
				case 38: // arrow up
					e.preventDefault();
					var prev = $(this).prev(); 
					while (prev.length > 0 && !prev.is(':visible')) prev = prev.prev();
					if (prev.length == 0) {
						prev = $(this).parent().children(':visible').last();
					}
					prev.focus();
					break;
				case 40: // arrow down
					e.preventDefault();
					var next = $(this).next(); 
					while (next.length > 0 && !next.is(':visible')) next = next.next();
					if (next.length == 0) {
						next = $(this).parent().children(':visible').first();
					}
					next.focus();
					break;
			}
		});
		container.find('.attributes-container > div:first-child' ).droppable({
			accept: ".optional-attributes li",
			drop: function( event, ui ) {
				var target = ui.draggable.parents('.attributes-container').children('div:first-child');
				Simulators.dropAttribute(ui.draggable, target, onDelete);
				onSelect && onSelect(ui.draggable);
			}
		});
	}

	Simulators.getRegionalSettings = function(locale, callback) {
		var path = $(location).attr('pathname').replace(/\/simulators.+$/, "") + "/regional-settings/" + locale;
		$.get(path,
			function(result){
				callback(result);
			},
			"json"
		).fail(function(jqXHR, textStatus, errorThrown) {
			callback(false);
		});
	}

	Simulators.drawSimulatorOptionsForInput = function(simulator) {
		var simulatorAttributesPanel = $('<div class="card bg-light" id="simulator-attributes-panel"></div>');
		var simulatorAttributesPanelBody = $('<div class="card-body"></div>');
		var simulatorAttributesContainer = $('<div class="attributes-container droppable"></div>');
		var simulatorAttributes = $('<div></div>');
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-name', 'text', 'name', Translator.trans('Name'), simulator.name, true, Translator.trans('Simulator name without spaces or special characters')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-label', 'text', 'label', Translator.trans('Label'), simulator.label, true, Translator.trans('Simulator label')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-category', 'text', 'category', Translator.trans('Category'), simulator.category, true, Translator.trans('Simulator category')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-defaultView', 'select', 'defaultView', Translator.trans('Default view'), simulator.defaultView, true, Translator.trans('Default view'), JSON.stringify(views)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-referer', 'text', 'referer', Translator.trans('Main referer'), simulator.referer, false, Translator.trans('referer URL')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-locale', 'select', 'locale', Translator.trans('Locale'), simulator.locale, true, Translator.trans('Locale'), JSON.stringify(languages)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-dateFormat', 'select', 'dateFormat', Translator.trans('Date format'), simulator.dateFormat, true, Translator.trans('Select a format'), JSON.stringify(Simulators.dateFormats)));
		var timezones = {};
		timezones[simulator.timezone] = simulator.timezone;
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-timezone', 'select', 'timezone', Translator.trans('Time zone'), simulator.timezone, true, Translator.trans('Time zone'), JSON.stringify(timezones)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-decimalPoint', 'select', 'decimalPoint', Translator.trans('Decimal point'), simulator.decimalPoint, true, Translator.trans('Decimal point'), JSON.stringify(Simulators.decimalPoints)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-groupingSeparator', 'select', 'groupingSeparator', Translator.trans('Grouping separator'), simulator.groupingSeparator, true, Translator.trans('Grouping separator'), JSON.stringify(Simulators.groupingSeparators)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-groupingSize', 'number', 'groupingSize', Translator.trans('Grouping size'), simulator.groupingSize, true, Translator.trans('Grouping size')));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-moneySymbol', 'select', 'moneySymbol', Translator.trans('Currency symbol'), simulator.moneySymbol, true, Translator.trans('Select a symbol'), JSON.stringify(Simulators.moneySymbols)));
		simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-symbolPosition', 'select', 'symbolPosition', Translator.trans('Symbol position'), simulator.symbolPosition, true, Translator.trans('Select a position'), JSON.stringify({ 'before': Translator.trans('before currency'), 'after': Translator.trans('after currency') })));
		if (simulator.dynamic == 1) {
			simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-dynamic', 'checkbox', 'dynamic', Translator.trans('Interactive UI'), simulator.dynamic, false, 'dynamic'));
		}
		if (simulator.memo == 1) {
			simulatorAttributes.append(Simulators.simpleAttributeForInput('simulator-memo', 'checkbox', 'memo', Translator.trans('Data memo ?'), simulator.memo, false, 'memo'));
		}
		simulatorAttributesContainer.append(simulatorAttributes);
		var optionalAttributesPanel = $('<div class="optional-attributes card bg-light"></div>');
		optionalAttributesPanel.append('<div class="card-header"><h4 class="card-title">' + Translator.trans('Optional attributes') + '</h4></div>');
		var optionalAttributes = $('<ul class="list-group"></ul>');
		optionalAttributes.append('<li class="list-group-item" tabindex="0" data-element="simulator" data-type="text" data-name="referer" data-placeholder="' + Translator.trans('Main referer value') + '">' + Translator.trans('Main referer') + '</li>');
		var dynamicAttribute = $('<li class="list-group-item" tabindex="0" data-element="simulator" data-type="checkbox" data-name="dynamic" data-placeholder="">' + Translator.trans('Interactive UI') + '</li>');
		optionalAttributes.append(dynamicAttribute);
		if (simulator.dynamic == 1) {
			dynamicAttribute.hide();
		}
		var memoAttribute = $('<li class="list-group-item" tabindex="0" data-element="simulator" data-type="checkbox" data-name="memo" data-placeholder="">' + Translator.trans('Data memo ?') + '</li>');
		optionalAttributes.append(memoAttribute);
		if (simulator.memo == 1) {
			memoAttribute.hide();
		}
		optionalAttributesPanel.append(optionalAttributes);
		simulatorAttributesContainer.append(optionalAttributesPanel);
		simulatorAttributesPanelBody.append(simulatorAttributesContainer);
		simulatorAttributesPanel.append(simulatorAttributesPanelBody);
		var simulatorDescriptionPanel = $('<div class="card bg-light" id="simulator-description-panel"></div>');
		simulatorDescriptionPanel.append('<div class="card-header">' + Translator.trans('Description') + '</div>');
		var simulatorDescriptionBody = $('<div class="card-body simulator-description rich-text"></div>');
		simulatorDescriptionBody.append('<textarea rows="10" name="simulator-description" id="simulator-description" wrap="hard" class="form-control">' + Simulators.paragraphs(simulator.description).content + '</textarea>');
		simulatorDescriptionPanel.append(simulatorDescriptionBody);
		var simulatorRelatedInformationsPanel = $('<div class="card bg-light" id="simulator-related-informations-panel"></div>');
		simulatorRelatedInformationsPanel.append('<div class="card-header">' + Translator.trans('Related informations') + '</div>');
		var simulatorRelatedInformationsBody = $('<div class="card-body simulator-related-informations"></div>');
		simulatorRelatedInformationsBody.append('<textarea rows="10" name="simulator-related-informations" id="simulator-related-informations" wrap="hard" class="form-control">' + Simulators.paragraphs(simulator.relatedInformations).content + '</textarea>');
		simulatorRelatedInformationsPanel.append(simulatorRelatedInformationsBody);
		var simulatorButtonsPanel = $('<div class="card bg-light" id="simulator-buttons-panel"></div>');
		var simulatorButtonsBody = $('<div class="card-body simulator-buttons"></div>');
		simulatorButtonsBody.append('<button class="btn btn-success float-right validate-edit-simulator">' + Translator.trans('Validate') + ' <span class="fas fa-check"></span></button>');
		simulatorButtonsBody.append('<button class="btn btn-secondary float-right cancel-edit-simulator">' + Translator.trans('Cancel') + '</span></button>');
		simulatorButtonsBody.append('<div class="alert alert-danger" role="alert"><span class="fas fa-exclamation-circle" aria-hidden="true"></span><span class="sr-only">' + Translator.trans('Error') + ':</span> <span class="error-message"></span></div>');
		simulatorButtonsPanel.append(simulatorButtonsBody);
		var simulatorOptions = $('<div class="card-body"></div>');
		simulatorOptions.append(simulatorAttributesPanel);
		simulatorOptions.append(simulatorDescriptionPanel);
		simulatorOptions.append(simulatorRelatedInformationsPanel);
		simulatorOptions.append(simulatorButtonsPanel);
		return simulatorOptions;
	}

	global.Simulators = Simulators;
}(this));

$(function(){
	if ( $( "#page-simulators" ).length ) {
		$(Simulators.init);
		$('button.edit-simulator').on('click', function(e) {
			var attributesPanel = $('#simulator-attributes-panel-holder');
			var descriptionPanel = $('#simulator-description-panel-holder');
			var relatedInformationsPanel = $('#simulator-related-informations-panel-holder');
			var simulator = {
				name: attributesPanel.find("p[data-attribute='name']").attr('data-value'),
				label: attributesPanel.find("p[data-attribute='label']").attr('data-value'),
				category: attributesPanel.find("p[data-attribute='category']").attr('data-value'),
				defaultView: attributesPanel.find("p[data-attribute='defaultView']").attr('data-value'),
				referer: attributesPanel.find("p[data-attribute='referer']").attr('data-value'),
				locale: attributesPanel.find("p[data-attribute='locale']").attr('data-value'),
				dateFormat: attributesPanel.find("p[data-attribute='dateFormat']").attr('data-value'),
				timezone: attributesPanel.find("p[data-attribute='timezone']").attr('data-value'),
				decimalPoint: attributesPanel.find("p[data-attribute='decimalPoint']").attr('data-value'),
				groupingSeparator: attributesPanel.find("p[data-attribute='groupingSeparator']").attr('data-value'),
				groupingSize: attributesPanel.find("p[data-attribute='groupingSize']").attr('data-value'),
				moneySymbol: attributesPanel.find("p[data-attribute='moneySymbol']").attr('data-value'),
				symbolPosition: attributesPanel.find("p[data-attribute='symbolPosition']").attr('data-value'),
				dynamic: attributesPanel.find("p[data-attribute='dynamic']").attr('data-value'),
				memo: attributesPanel.find("p[data-attribute='memo']").attr('data-value'),
				description: {
					content: descriptionPanel.find('.simulator-description').html(),
					edition: descriptionPanel.find('.simulator-description').attr('data-edition')
				},
				relatedInformations: {
					content: relatedInformationsPanel.find('.simulator-related-informations').html(),
					edition: relatedInformationsPanel.find('.simulator-related-informations').attr('data-edition')
				}
			};
			attributesPanel.hide();
			descriptionPanel.hide();
			relatedInformationsPanel.hide();
			descriptionPanel.after(Simulators.drawSimulatorOptionsForInput(simulator).children());
			var categoriesSugg = new Bloodhound({
				datumTokenizer: Bloodhound.tokenizers.whitespace,
				queryTokenizer: Bloodhound.tokenizers.whitespace,
				local: categories
			});
			$('#simulator-category').typeahead({
				minLength: 0,
				hint: true,
				highlight: true
			},
			{
				name: 'categories-list',
				source: function (q, sync, async) {
					if (q === '') {
						sync(categories);
					} else {
						categoriesSugg.search(q, sync, async);
					}
				}
			});
			$('#simulator-groupingSize').attr('min', '2');
			$('#simulator-groupingSize').attr('max', '4');
			descriptionPanel.after(relatedInformationsPanel);
			Simulators.bindSimulatorOptions(attributesPanel.parent());
			$('.update-button').hide();
			$('.toggle-collapse-all').hide();
			Simulators.updating = true;
		});
		$('label.tree-toggler').click(function () {
			$(this).parent().toggleClass("closed");
			if ($(this).parent().hasClass("closed")) {
				$(this).attr('aria-expanded', 'false');
			} else {
				$(this).attr('aria-expanded', 'true');
			}
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
		$('#page-simulators textarea').wysihtml(Admin.wysihtml5Options);
		$('#collapsedatas .choices-panel').each(function(k) {
			if ($(this).find('.choice-source-container').length > 0) {
				$(this).find('.choice-container').hide();
			}
		});

		Simulators.bindOptionalAttributes($('#page-simulators'));
		$('#page button.save-simulator').on('click', function(e) {
			var simulator = {
				name: $('#simulator-attributes-panel-holder').find("p[data-attribute='name']").attr('data-value'),
				label: $('#simulator-attributes-panel-holder').find("p[data-attribute='label']").attr('data-value'),
				category: $('#simulator-attributes-panel-holder').find("p[data-attribute='category']").attr('data-value'),
				defaultView: $('#simulator-attributes-panel-holder').find("p[data-attribute='defaultView']").attr('data-value'),
				referer: $('#simulator-attributes-panel-holder').find("p[data-attribute='referer']").attr('data-value'),
				locale: $('#simulator-attributes-panel-holder').find("p[data-attribute='locale']").attr('data-value'),
				dateFormat: $('#simulator-attributes-panel-holder').find("p[data-attribute='dateFormat']").attr('data-value'),
				timezone: $('#simulator-attributes-panel-holder').find("p[data-attribute='timezone']").attr('data-value'),
				decimalPoint: $('#simulator-attributes-panel-holder').find("p[data-attribute='decimalPoint']").attr('data-value'),
				groupingSeparator: $('#simulator-attributes-panel-holder').find("p[data-attribute='groupingSeparator']").attr('data-value'),
				groupingSize: $('#simulator-attributes-panel-holder').find("p[data-attribute='groupingSize']").attr('data-value'),
				moneySymbol: $('#simulator-attributes-panel-holder').find("p[data-attribute='moneySymbol']").attr('data-value'),
				symbolPosition: $('#simulator-attributes-panel-holder').find("p[data-attribute='symbolPosition']").attr('data-value'),
				dynamic: $('#simulator-attributes-panel-holder').find("p[data-attribute='dynamic']").attr('data-value'),
				memo: $('#simulator-attributes-panel-holder').find("p[data-attribute='memo']").attr('data-value'),
				description: {
					content: $('#simulator-description-panel-holder').find(".simulator-description").html(),
					edition: $('#simulator-description-panel-holder').find(".simulator-description").attr('data-edition')
				},
				relatedInformations: {
					content: $('#simulator-related-informations-panel-holder').find('.simulator-related-informations').html(),
					edition: $('#simulator-related-informations-panel-holder').find('.simulator-related-informations').attr('data-edition')
				}
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
			butt.html(Translator.trans('Expand all') + ' <span class="far fa-caret-square-right"></span>');
			butt.addClass('expand-all').removeClass('collapse-all');
		});
		$('.panel-collapse').on('shown.bs.collapse', function () {
			var butt = $(this).parent().find('button.toggle-collapse-all');
			butt.html(Translator.trans('Collapse all') + ' <span class="far fa-caret-square-up"></span>');
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
				$(this).html(Translator.trans('Collapse all') + ' <span class="far fa-caret-square-up"></span>');
				$(this).addClass('collapse-all').removeClass('expand-all');
			} else if ($(this).hasClass('collapse-all')) {
				$(this).parent().find('a[data-toggle="collapse"]').each(function(){
					var objectID=$(this).attr('href');
					$(objectID).collapse('hide');
				});
				$(this).html(Translator.trans('Expand all') + ' <span class="far fa-caret-square-right"></span>');
				$(this).addClass('expand-all').removeClass('collapse-all');
			}
		});
		if ( $("#save-form input[name='create']" ).length || $("#save-form input[name='clone']" ).length) {
			$('#simulator button.edit-simulator').trigger('click');
			$('#simulator-name').val('');
		}
		if ( $("#simulator-import-form" ).length) {
			$( "#simulator-import-form" ).find('input, textarea').on("change propertychange", function (e) {
				Admin.updated = true;
			});
			$("#simulator-import-form input[name='simulator-file'], #simulator-import-form input[name='simulator-stylesheet']").on('change', function (e) {
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
			$("#btnDoImportSimulator").on('click', function (e) {
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
				var pdfforminput = $("#simulator-import-form input[name='simulator-pdfform']");
				var pdfformfile = pdfforminput.val();
				if (pdfformfile != '' && ! /\.pdf$/.test(pdfformfile)) {
					errors.push(Translator.trans("The file extension of the PDF Form must be '.pdf'"));
				}
				var pdfinfoinput = $("#simulator-import-form input[name='simulator-pdfinfo']");
				var pdfinfofile = pdfinfoinput.val();
				if (pdfinfofile != '' && ! /\.info$/.test(pdfinfofile)) {
					errors.push(Translator.trans("The file extension of the PDF Form infos must be '.info'"));
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