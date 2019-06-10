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

(function($) {

	var functions = {
		"abs" : {arity: 1, args: ['number'], type: 'number'},
		"acos" : {arity: 1, args: ['number'], type: 'number'},
		"acosh" : {arity: 1, args: ['number'], type: 'number'},
		"addMonths" : {arity: 2, args: ['number', 'date'], type: 'date'},
		"asin" : {arity: 1, args: ['number'], type: 'number'},
		"asinh" : {arity: 1, args: ['number'], type: 'number'},
		"atan" : {arity: 1, args: ['number'], type: 'number'},
		"atan2" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"atanh" : {arity: 1, args: ['number'], type: 'number'},
		"ceil" : {arity: 1, args: ['number'], type: 'number'},
		"concat" : {arity: -1, args: ['text'], type: 'text'},
		"cos" : {arity: 1, args: ['number'], type: 'number'},
		"cosh" : {arity: 1, args: ['number'], type: 'number'},
		"count" : {arity: -1, args: ['number'], type: 'number'},
		"day" : {arity: 1, args: ['date'], type: 'number'},
		"exp" : {arity: 1, args: ['number'], type: 'number'},
		"firstDayOfMonth" : {arity: 1, args: ['date'], type: 'date'},
		"floor" : {arity: 1, args: ['number'], type: 'number'},
		"fullmonth" : {arity: 1, args: ['date'], type: 'text'},
		"get" : {arity: 2, args: ['array', 'number'], type: 'text'},
		"lastday" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"lastDayOfMonth" : {arity: 1, args: ['date'], type: 'date'},
		"lcfirst" : {arity: 1, args: ['text'], type: 'text'},
		"length" : {arity: 1, args: ['text'], type: 'number'},
		"log" : {arity: 1, args: ['number'], type: 'number'},
		"log10" : {arity: 1, args: ['number'], type: 'number'},
		"lower" : {arity: 1, args: ['text'], type: 'text'},
		"match" : {arity: 2, args: ['text', 'text'], type: 'boolean'},
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
		"substr": {arity: 3, args: ['text', 'number', 'number'], type: 'text'},
		"sum" : {arity: -1, args: ['number'], type: 'number'},
		"tan" : {arity: 1, args: ['number'], type: 'number'},
		"tanh" : {arity: 1, args: ['number'], type: 'number'},
		"titlecase" : {arity: 1, args: ['text'], type: 'text'},
		"trim" : {arity: 1, args: ['text'], type: 'text'},
		"ucfirst" : {arity: 1, args: ['text'], type: 'text'},
		"upper" : {arity: 1, args: ['text'], type: 'text'},
		"workdays" : {arity: 2, args: ['date', 'date'], type: 'number'},
		"workdaysofmonth" : {arity: 2, args: ['number', 'number'], type: 'number'},
		"year" : {arity: 1, args: ['date'], type: 'number'}
	};
	
	var constants = { 
		pi: {type : 'number'}, 
		now: {type: 'date'}, 
		today: {type: 'date'}, 
		'true': {type: 'boolean'}, 
		'false': {type: 'boolean'}
	};
	
	var expressionOptions = {
		constants: constants,
		functions: functions,
		operators: ['+', '-', '*', '%', '/', '&', '|'],
		onCompleted: function(type, expression) { 
			// console.log('Expression complete, type = ' + type); 
		},
		onEditing: function(expression) { 
			// console.log('Expression being changed'); 
		},
		onError: function(error) { console.log('error : ' + error); },
		language: 'en',
		operandHolder: { classes: ['button', 'button-secondary'] },
		operatorHolder: { classes: ['button', 'button-secondary'] },
		nestedExpression: { classes: ['button', 'button-secondary'] }
	};
	
	function findRuleIndexByName(name) {
		var ruleIndex = -1;
		$.each(rules, function(index, rule) {
			if (rule.name == name) {
				ruleIndex = index;
				return false;
			}
		});
		return ruleIndex;
	}
	
	function renumberRules() {
		$.each(rules, function(index, rule) {
			rule.id = index + 1;
			$('#' + rule.elementId).find('span.rule-id').html(rule.id);
		});
	}

	function sortRulesFromUI() {
		var newRules = [];
		$("#business-rules").children('div.rule-container').each(function(index) {
			var name = $(this).find('.input-rule-name').val()
			if (rules[index].name == name) {
				newRules.push(rules[index]);
			} else {
				var i = findRuleIndexByName(name);
				rules[i].id = index + 1;
				$(this).find('span.rule-id').html(rules[i].id);
				newRules.push(rules[i]);
			}
		});
		rules = newRules;
	}
	
	function bindRule(rule) {
		var ruleContainer = $('#' + rule.elementId);
		ruleContainer.find('.conditions').conditionsBuilder({
			fields: dataset,
			expressionOptions: expressionOptions,
			conditions: rule.conditions
		});
		ruleContainer.find('.if-actions').actionsBuilder({
			fields: dataset,
			expressionOptions: expressionOptions,
		    actions: actions,
		    data: rule.ifdata
		});
		ruleContainer.find('.else-actions').actionsBuilder({
			fields: dataset,
			expressionOptions: expressionOptions,
			actions: actions,
		    data: rule.elsedata
		});
		ruleContainer.find("> div > button.delete-rule").click(function(e) {
		    e.preventDefault();
			var r = findRuleIndexByName(rule.name);
			$(this).parents('div.rule-container').remove();
			rules.splice(r, 1);
			renumberRules();
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
		ruleContainer.find('.input-rule-name').change(function () {
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
		ruleContainer.find('.input-rule-label').change(function () {
			ruleContainer.find('.rule-label').text($(this).val());
		});
	}
	
	function drawRule(rule) {
		var businessRules = $("#business-rules");
		var ruleElementId = 'rule-' + Math.floor(Math.random() * 100000);
		var ruleContainer = $('<div>', { id: ruleElementId,  'class': 'card card-info sortable rule-container' });
		ruleContainer.append('<div class="card-header" role="tab"><button class="btn btn-info float-right delete-rule">' + Translator.trans('Delete') + ' <span class="fas fa-minus-circle"></span></button><h4 class="card-title"><a data-toggle="collapse" data-parent="#business-rules" href="#collapse' + ruleElementId + '" aria-expanded="true" aria-controls="collapse' + ruleElementId + '">#<span class="rule-id">' + rule.id + '</span> ' + Translator.trans('Rule') + ' <span class="rule-name">' + rule.name + '</span> : <span class="rule-label">' + rule.label + '</span></a></h4></div>');
		var ruleBody = $('<div>', {id: 'collapse' + ruleElementId, 'class': 'card-body panel-collapse collapse', role: 'tabpanel' });
		ruleContainer.append(ruleBody);
		ruleBody.append('<div class="card bg-light"><div class="card-body text-white form-inline"><div class="form-group"><label>' + Translator.trans('Name') + '</label><input type="text" class="input-rule-name" value="' + rule.name + '" /></div><div class="form-group"><label>' + Translator.trans('Label') + '</label><input type="text" class="input-rule-label" value="' + rule.label + '" /></div></div></div>');
		ruleBody.append('<div class="card bg-light"><div class="card-header"><h4>' + Translator.trans('When ...') + '</h4></div><div class="card-body text-white"><div class="conditions"></div></div></div>');
		ruleBody.append('<div class="card bg-light"><div class="card-header"><h4>' + Translator.trans('then do ...') + '</h4></div><div class="card-body text-white"><div class="if-actions"></div></div></div>');
		ruleBody.append('<div class="card bg-light"><div class="card-header"><h4>' + Translator.trans('else do ...') + '</h4></div><div class="card-body text-white"><div class="else-actions"></div></div></div>');		
		businessRules.append(ruleContainer);
		return ruleContainer;
	}
	
	function onReady() {
		$.each(rules, function(r, rule) {
			bindRule(rule);
		});
		
		$('button.add-rule').click(function(e) {
		    e.preventDefault();
			var rule = {
				id: rules.length + 1,
				name: 'R' + (rules.length + 1),
				label: '',
				conditions: '',
				ifdata: [],
				elsedata: []
			};
			rules.push(rule);
			var ruleContainer = drawRule(rule);
			rule.elementId = ruleContainer.attr('id');
			bindRule(rule);
			ruleContainer.find('> .card-header a').click();
			// ruleContainer[0].scrollIntoView(true);
			$("html, body").animate({ scrollTop: ruleContainer.offset().top }, 500);
		});
		$("#business-rules").sortable({
			cursor: "move",
			containment: "parent",
			axis: "y",
			update: function( e, ui ) {
				sortRulesFromUI();
			}	
		});

	}
	$(onReady);
})(jQuery);
