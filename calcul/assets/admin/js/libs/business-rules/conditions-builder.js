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
	"use strict";

	$.fn.conditionsBuilder = function(options) {
		if (options == "conditions") {
			var builder = $(this).eq(0).data("conditionsBuilder");
			return builder.collectData();
		} else {
			return $(this).each(function() {
				var builder = new ConditionsBuilder(this, options);
				$(this).data("conditionsBuilder", builder);
			});
		}
	};

	var baseOperators = [
		{label: Translator.trans("is present"), name: "present", fieldType: "none"},
		{label: Translator.trans("is not present"), name: "blank", fieldType: "none"},
	];

	var textOperators = baseOperators.concat([
		{label: Translator.trans("is equal to"), name: "=", fieldType: "expression"},
		{label: Translator.trans("is not equal to"), name: "!=", fieldType: "expression"},
		{label: Translator.trans("contains"), name: "~", fieldType: "text"},
		{label: Translator.trans("not contains"), name: "!~", fieldType: "text"},
		{label: Translator.trans("matches"), name: "matches", fieldType: "text"}
	]);

	var numericOperators = baseOperators.concat([
		{label: Translator.trans("is equal to"), name: "=", fieldType: "expression"},
		{label: Translator.trans("is not equal to"), name: "!=", fieldType: "expression"},
		{label: Translator.trans("is greater than"), name: ">", fieldType: "expression"},
		{label: Translator.trans("is greater than or equal to"), name: ">=", fieldType: "expression"},
		{label: Translator.trans("is less than"), name: "<", fieldType: "expression"},
		{label: Translator.trans("is less than or equal to"), name: "<=", fieldType: "expression"},
		{label: Translator.trans("contains"), name: "~", fieldType: "expression"},
		{label: Translator.trans("not contains"), name: "!~", fieldType: "expression"},
	]);

	var dateOperators = baseOperators.concat([
		{label: Translator.trans("corresponds to"), name: "=", fieldType: "expression"},
		{label: Translator.trans("does not corresponds to"), name: "!=", fieldType: "expression"},
		{label: Translator.trans("is after"), name: ">", fieldType: "expression"},
		{label: Translator.trans("is not before"), name: ">=", fieldType: "expression"},
		{label: Translator.trans("is before"), name: "<", fieldType: "expression"},
		{label: Translator.trans("is not after"), name: "<=", fieldType: "expression"},
	]);

	var choiceOperators = baseOperators.concat([
		{label: Translator.trans("is equal to"), name: "=", fieldType: "select"},
		{label: Translator.trans("is not equal to"), name: "!=", fieldType: "select"},
	]);

	var booleanOperators = baseOperators.concat([
		{label: Translator.trans("is true"), name: "isTrue", fieldType: "checkbox"},
		{label: Translator.trans("is false"), name: "isFalse", fieldType: "checkbox"},
	]);

	var inverseOperators = {
		"present": "blank",
		"blank": "present",
		"=": "!=",
		"!=": "=",
		"~": "!~",
		"!~": "~",
		">": "<=",
		"<=": ">",
		"<": ">=",
		">=": "<",
		"isTrue": "isFalse",
		"isFalse": "isTrue"
	};

	function ConditionsBuilder(element, options) {
		this.element = $(element);
		this.options = options || {};
		this.init();
	}

	ConditionsBuilder.prototype = {
		init: function() {
			var self = this;
			self.fields = self.options.fields;
			self.expressionOptions = self.options.expressionOptions;
			$.each(self.fields, function(name, field) {
				switch(field.type) {
					case 'text': case 'textarea': case 'department': case 'country':
						self.fields[name].operators = textOperators;
						break;
					case 'integer': case 'number': case 'money': case 'percent': case 'region':
						self.fields[name].operators = numericOperators;
						break;
					case 'date': case 'day': case 'month': case 'year':
						self.fields[name].operators = dateOperators;
						break;
					case 'choice':
					case 'multichoice':
						self.fields[name].operators = choiceOperators;
						break;
					case 'boolean':
						self.fields[name].operators = booleanOperators;
						break;
					default:
						self.fields[name].operators = baseOperators;
				}
			});
			var rules;
			if (this.options.connector) {
				var connector = this.options.connector;
				this.conditions = this.infix(connector);
				if (connector.all || connector.any || connector.none) {
					rules = this.buildRules(connector);
				} else {
					rules = this.buildRules({ 'all': [connector] });
				}
			} else {
				this.conditions = this.options.conditions ? this.parse(this.options.conditions) :  {"all": []};
				this.optimize(this.conditions);
				rules = this.buildRules(this.conditions);
			}
			this.element.html(rules);
		},

		parse: function(conditions) {
			var self = this;
			var parser = new ExpressionParser();
			if (/^#\d+$/.test(conditions)) {
				conditions += ' = true';
			}
			var expr = parser.parse(conditions);
			expr.postfix();
			var ops = [];
			var stack = [];
			$.each(expr.get(), function(k, token) {
				if (token.type == Token.TYPE.T_NOT || token.type == Token.TYPE.T_LOGICAL_AND || token.type == Token.TYPE.T_LOGICAL_OR) {
					if (ops.length > 0) {
						var fieldName = ops[ops.length-1];
						var field = self.fields[fieldName];
						if (field && field.type === 'boolean') {
							stack.push({
								name: fieldName,
								operator: 'isTrue',
								value: null
							});
							ops.pop();
						}
					}
				}
				if (token.isUnaryOperator()) {
					if (token.type == Token.TYPE.T_NOT) {
						var arg = stack.pop();
						self.negate(arg);
						stack.push(arg);
					} else {
						var arg = ops.pop();
						ops.push(token.value + arg);
					}
				} else if (token.isBinaryOperator()) {
					if (token.type == Token.TYPE.T_LOGICAL_AND) {
						var arg2 = stack.pop();
						var arg1 = stack.pop();
						stack.push({
							all: [ arg1, arg2 ]
						});
					} else if (token.type == Token.TYPE.T_LOGICAL_OR) {
						var arg2 = stack.pop();
						var arg1 = stack.pop();
						stack.push({
							any: [ arg1, arg2 ]
						});
					} else {
						var arg2 = ops.pop();
						var arg1 = ops.pop();
						ops.push(arg1 + ' ' + token.value + ' ' + arg2);
					}
				} else if (token.isComparator()) {
					var arg2 = ops.pop();
					var arg1 = ops.pop();
					if ((token.type == Token.TYPE.T_EQUAL || token.type == Token.TYPE.T_NOT_EQUAL) && (arg2 === 'true' || arg2 === 'false')) {
						var operator = (token.type == Token.TYPE.T_EQUAL && arg2 === 'true') || (token.type == Token.TYPE.T_NOT_EQUAL && arg2 === 'false') ? 'isTrue' : 'isFalse';
						stack.push({
							name: arg1,
							operator: operator,
							value: null
						});
					} else {
						stack.push({
							name: arg1,
							operator: token.value,
							value: arg2
						});
					}
				} else {
					switch (token.type) {
						case Token.TYPE.T_FIELD:
							var fieldName = self.getFieldName(token.value);
							var field = self.fields[fieldName];
							ops.push(fieldName);
							break;
						case Token.TYPE.T_DATE:
							ops.push(token.value.format('d/m/Y'));
							break;
						case Token.TYPE.T_NUMBER:
							ops.push('' + token.value);
							break;
						case Token.TYPE.T_BOOLEAN:
							ops.push(token.value ? 'true' : 'false');
							break;
						case Token.TYPE.T_TEXT:
						case Token.TYPE.T_IDENT:
						case Token.TYPE.T_ARRAY:
						case Token.TYPE.T_UNDEFINED:
							ops.push(token.value);
							break;
						case Token.TYPE.T_FUNCTION:
							if (token.value === "defined") {
								var arg = ops.pop();
								stack.push({
									name: arg,
									operator: 'present',
									value: null
								});
							} else {
								var funct = self.expressionOptions.functions[token.value];
								if (! funct) {
									throw new Error("Unrecognized function " + token.value);
								}
								if (ops.length < funct.arity) {
									throw new Error("Too few arguments for function " + token.value);
								}
								var args = [];
								for (var a = 0; a < funct.arity; a++) {
									args.unshift(ops.pop());
								}
								ops.push(token.value + '(' + args.join(', ') + ')');
							}
							break;
						default:
							throw new Error("Unrecognized token " + token.value);
					}
				}
			});
			if (ops.length > 0) {
				throw new Error("Syntax error");
			}
			return stack[0].name ? {"all": [stack[0]]} : stack[0];
		},

		negate: function(ruleData) {
			var self = this;
			if ($.isPlainObject(ruleData)) {
				if (ruleData.all) {
					self.negate(ruleData.all);
					ruleData["any"] = ruleData.all;
					delete ruleData.all;
				} else if (ruleData.any) {
					ruleData["none"] = ruleData.any;
					delete ruleData.any;
				} else if (ruleData.none) {
					ruleData["any"] = ruleData.none;
					delete ruleData.none;
				} else {
					ruleData.operator = inverseOperators[ruleData.operator];
				}
			} else {
				$.each(ruleData, function (i, cond) {
					self.negate(cond);
				});
			}
		},

		optimize: function(ruleData) {
			do {
				var optimized = false;
				if (ruleData.all) {
					var conds = [];
					$.each(ruleData.all, function (i, cond) {
						if (cond.all) {
							$.each(cond.all, function (j, scond) {
								conds.push(scond);
							});
							ruleData.all.splice(i, 1, conds[0]);
							for (var j = 1; j < conds.length; j++) {
								ruleData.all.splice(i + j, 0, conds[j]);
							}
							optimized = true;
						}
					});
				} else if (ruleData.any) {
					var conds = [];
					$.each(ruleData.any, function (i, cond) {
						if (cond.any) {
							$.each(cond.any, function (j, scond) {
								conds.push(scond);
							});
							ruleData.any.splice(i, 1, conds[0]);
							for (var j = 1; j < conds.length; j++) {
								ruleData.any.splice(i + j, 0, conds[j]);
							}
							optimized = true;
						}
					});
				} else if (ruleData.none) {
					var conds = [];
					$.each(ruleData.none, function (i, cond) {
						if (cond.none) {
							$.each(cond.none, function (j, scond) {
								conds.push(scond);
							});
							ruleData.none.splice(i, 1, conds[0]);
							for (var j = 1; j < conds.length; j++) {
								ruleData.none.splice(i + j, 0, conds[j]);
							}
							optimized = true;
						}
					});
				}
			} while (optimized);
		},
		
		getFieldName: function(id) {
			var fieldName = null;
			$.each(this.fields, function(name, field) {
				if (field.id == id) {
					fieldName = name;
					return false;
				}
			});
			return fieldName;
		},
		
		collectData: function() {
			return this.collectDataFromNode(this.element.find("> .conditional"));
		},

		collectDataFromNode: function(element) {
			var kind = null;
			var self = this;
			if (element.is(".conditional")) {
				kind = element.find("> .all-any-none-wrapper > .all-any-none").attr("data-value");
			}
			if (kind) {
				var out = {};
				out[kind] = [];
				element.find("> .conditional, > .rule").each(function() {
					out[kind].push(self.collectDataFromNode($(this)));
				});
				return out;
			} else {
				var value, currentValue = element.find(".value");
				if (currentValue.hasClass('expression')) {
					value = currentValue.expressionbuilder('val');
				} else if (currentValue.hasClass('editable-select')) {
					value = currentValue.attr("data-value");
				} else if (currentValue.hasClass('editable-textarea')) {
					value = currentValue.attr("data-value");
				} else {
					value = currentValue.val();
				}
				if (value) {
					value = value.replace(
						/'(\d{1,2}\/\d{1,2}\/\d{4})'/g,
						function (match, m1, offs, str) {
							return m1;
						}
					);
				}
				return {
					name: element.find(".field").attr("data-value"),
					operator: element.find(".operator").attr("data-value"),
					value: value || ''
				};
			}
		},

		makeCond:function(val) {
			var id = "#" + this.fields[val.name].id;
			var cond = "";
			switch (val.operator) {
				case 'present':
					cond = 'defined(' + id + ')';
					break;
				case 'blank':
					cond = '!defined(' + id + ')';
					break;
				case 'isTrue':
					cond = id;
					break;
				case 'isFalse':
					cond = '!' + id;
					break;
				default:
					cond = id + val.operator + val.value;
			}
			return cond;
		},

		conjonct: function(conds) {
			var self = this;
			var et = "";
			var parenthesis = conds.length > 1;
			$.each(conds, function (key, val) {
				if (val.name) {
					et += ' && ';
					et += self.makeCond(val);
				} else {
					var cond = self.infix(val);
					if (cond) {
						et += ' && ';
						if (parenthesis) {
							et += '(';
						}
						et += cond;
						if (parenthesis) {
							et += ')';
						}
					}
				}
			});
			return et.replace(/^ \&\& /, "");;
		},

		disjonct: function(conds) {
			var self = this;
			var ou = "";
			var parenthesis = conds.length > 1;
			$.each(conds, function (key, val) {
				if (val.name) {
					ou += ' || ';
					ou += self.makeCond(val);
				} else {
					var cond = self.infix(val);
					if (cond) {
						ou += ' || ';
						if (parenthesis) {
							ou += '(';
						}
						ou += cond;
						if (parenthesis) {
							ou += ')';
						}
					}
				}
			});
			return ou.replace(/^ \|\| /, "");
		},

		infix: function(cond) {
			var self = this;
			var infixed = "";
			$.each(cond, function (key, val) {
				switch (key) {
					case 'all': 
						infixed += self.conjonct(val);
						break;
					case 'any': 
						infixed += self.disjonct(val);
						break;
					case 'none': 
						infixed += '!(' + self.disjonct(val) + ')';
						break;
				}
			});
			return infixed;
		},

		buildRules: function(ruleData) {
			return this.buildConditional(ruleData) || this.buildRule(ruleData);
		},

		buildConditional: function(ruleData) {
			var kind, text;
			if (ruleData.all) { 
				kind = "all";
				text = "  " + Translator.trans("of the following conditions are met") + " :";
			} else if (ruleData.any) {
				kind = "any"; 
				text = "  " + Translator.trans("of the following conditions is met") + " :";
			} else if (ruleData.none) {
				kind = "none"; 
				text = "  " + Translator.trans("of the following conditions is met") + " :";
			}
			if (!kind) { return; }
			var div = $("<div>", {"class": "conditional " + kind});
			var selectWrapper = $("<div>", {"class": "all-any-none-wrapper"});
			var data = {
				all: Translator.trans("all"),
				any: Translator.trans("any"),
				none: Translator.trans("none"),
				selected: kind
			};
			var select = $("<span>", {
				"name": "action-select",
				"class": "editable-select all-any-none",
				"tabindex": "0",
				"data-value": kind,
				"text": data[kind]
			});
			select.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					settings.data.selected = val;
					$(this).focus();
					return settings.data[val];
				},
				{
					data: data,
					name: "action-select",
					type: "select",
					tooltip: Translator.trans('click to change ...'),
					submit: "",
					cancel: "",
					cssclass: "action-select",
					style: "inherit"
				}
			);
			select.on("keydown", function(e) {
				var key = e.keyCode || e.which || e.key;
				if (key == 13) {
					select.trigger('click');
				} else if (key == 32) {
					e.preventDefault();
				}
			});
			selectWrapper.append(select);
			selectWrapper.append($("<span>", {text: text}));
			div.append(selectWrapper);
			select.on('change', function() {
				switch($(this).attr("data-value")) {
					case "all":
						$(this).next().text("  " + Translator.trans("of the following conditions are met") + " :");  
						break;
					case "any": case "none":
						$(this).next().text("  " + Translator.trans("of the following conditions is met") +" :");  
				}
			});
			var addRuleLink = $("<button>", {
				"class": "add-condition btn btn-primary fas fa-plus-square",
				"text": " ",
				"title": Translator.trans("Add Condition")
			});
			var self = this;
			addRuleLink.on('click', function(e) {
				e.preventDefault();
				var f = self.fields[Object.keys(self.fields)[0]];
				var newField = {name: f.value, operator: f.operators[0], value: null};
				div.append(self.buildRule(newField));
			});
			div.append(addRuleLink);

			var addConditionLink = $("<button>", {
				"class": "add-sub-condition btn btn-info fas fa-plus-circle",
				"text": " ",
				"title": Translator.trans("Add Sub-Condition")
			});
			addConditionLink.on('click', function(e) {
				e.preventDefault();
				var f = self.fields[Object.keys(self.fields)[0]];
				var newField = {"all": [{name: f.value, operator: f.operators[0], value: null}]};
				div.append(self.buildConditional(newField));
			});
			div.append(addConditionLink);

			var removeLink = $("<button>", {
				"class": "remove btn btn-danger fas fa-times",
				"text": " ",
				"title": Translator.trans("Remove this Sub-Condition")
			});
			removeLink.on('click', function(e) {
				e.preventDefault();
				div.remove();
			});
			div.append(removeLink);

			var rules = ruleData[kind];
			for (var i=0; i<rules.length; i++) {
				div.append(this.buildRules(rules[i]));
			}
			return div;
		},

		buildRule: function(ruleData) {
			var ruleDiv = $("<div>", {"class": "rule"});
			var fieldSelect = getFieldSelect(this.fields, ruleData);
			var operatorSelect = getOperatorSelect(this);

			fieldSelect.on('change', onFieldSelectChanged.call(this, ruleData));

			ruleDiv.append(fieldSelect);
			ruleDiv.append(operatorSelect);
			ruleDiv.append(removeLink());

			fieldSelect.change();
			var currentValue = ruleDiv.find("> .value");
			if (currentValue.hasClass('expression')) {
				currentValue.expressionbuilder('val', ruleData.value);
			} else if (currentValue.hasClass('editable-select')) {
				currentValue.attr("data-value", ruleData.value);
				var options = this.fields[ruleData.name] && this.fields[ruleData.name].options ? this.fields[ruleData.name].options : {};
				$.each(options, function(o, option) {
					if (option.name == ruleData.value) {
						currentValue.text(option.label);
						return false;
					}
				});
			} else if (currentValue.hasClass('editable-textarea')) {
				currentValue.attr("data-value", ruleData.value);
				currentValue.text(ruleData.value);
			} else {
				currentValue.val(ruleData.value);
			}
			return ruleDiv;
		},

		operatorsFor: function(fieldName) {
			return this.fields[fieldName].operators;
		}
	};

	function getFieldSelect(fields, ruleData) {
		var data = {};
		var options = {};
		var select = $("<span>", {
			"class": "editable-select field",
			"tabindex": "0",
			"data-value": ""
		});
		$.each(fields, function(name, field) {
			data[name] = field.label;
			if (ruleData.name == name || ! data['selected']) {
				data['selected'] = name;
				select.text(field.label);
				select.attr("data-value", name);
			}
			options[name] = field.options;
		});
		select.editable(
			function (val, settings) {
				$(this).attr("data-value", val);
				settings.data.selected = val;
				$(this).focus();
				select.trigger('change');
				return settings.data[val];
			},
			{
				data: data,
				options: options,
				name: "action-select",
				type: "choices",
				select: true,
				placeholder: Translator.trans("click to select a field ..."),
				tooltip: Translator.trans("click to change the field ..."),
				submit: "",
				cancel: "",
				cssclass: "action-select",
				style: "inherit"
			}
		);
		select.on("keydown", function(e) {
			var key = e.keyCode || e.which || e.key;
			if (key == 13) {
				select.trigger('click');
			} else if (key == 32) {
				e.preventDefault();
			}
		});
		return select;
	}

	function getOperatorSelect(builder) {
		var select = $("<span>", {
			"class": "editable-select operator",
			"tabindex": "0", 
			"data-value": ""
		});
		select.on('change', builder, onOperatorSelectChange);
		return select;
	}

	function removeLink() {
		var removeLink = $("<button>", {
			"class": "remove btn btn-danger fas fa-times",
			"text": " ",
			"title": Translator.trans("Remove this Condition")
		});
		removeLink.on('click', onRemoveLinkClicked);
		return removeLink;
	}

	function onRemoveLinkClicked(e) {
		e.preventDefault();
		$(this).parents(".rule").remove();
	}

	function onFieldSelectChanged(ruleData) {
		var builder = this;
		return function(e) {
			var $this = $(this);
			var container = $this.parents(".rule");
			var operatorSelect = container.find(".operator");
			var operators = builder.operatorsFor($this.attr("data-value"));
			var data = {};
			var select = $("<span>", {
				"class": "editable-select operator",
				"tabindex": "0",
				"data-value": ""
			});
			$.each(operators, function(o, operator) {
				data[operator.name] = operator.label || operator.name;
				if (ruleData.operator == operator.name || ! data['selected']) {
					data["selected"] = operator.name;
					select.attr("data-value", operator.name);
					select.text(data[operator.name]);
				}
			});
			select.editable(
				function (val, settings) {
					$(this).attr("data-value", val);
					settings.data.selected = val;
					$(this).focus();
					return settings.data[val];
				},
				{
					data: data,
					name: "action-select",
					type: "select",
					select: true,
					placeholder: Translator.trans("click to select an operator ..."),
					tooltip: Translator.trans("click to change this operator ..."),
					submit: "",
					cancel: "",
					cssclass: "action-select",
					style: "inherit"
				}
			);
			select.on("keydown", function(e) {
				var key = e.keyCode || e.which || e.key;
				if (key == 13) {
					select.trigger('click');
				} else if (key == 32) {
					e.preventDefault();
				}
			});
			operatorSelect.after(select);
			operatorSelect.remove();
			select.on('change', builder, onOperatorSelectChange);
			$this.on('change', onFieldSelectChanged.call(builder, ruleData));
			select.change();
		}
	}

	function onOperatorSelectChange(e) {
		var builder = e.data;
		var $this = $(this);
		var container = $this.parents(".rule");
		var fieldSelect = container.find(".field");
		var val, currentValue = container.find(".value");
		if (currentValue.hasClass('expression')) {
			val = currentValue.expressionbuilder('val');
		} else if (currentValue.hasClass('editable-select') || currentValue.hasClass('editable-textarea')) {
			val = currentValue.attr("data-value");
		} else {
			val = currentValue.val();
		}
		var fieldType = "";
		if (fieldSelect.attr("data-value")) {
			var operators = builder.operatorsFor(fieldSelect.attr("data-value"));
			$.each(operators, function(o, operator) {
				if (operator.name == $this.attr("data-value")) {
					fieldType = operator.fieldType;
					return false;
				}
			});
		}
		switch(fieldType) {
			case "none": 
				$this.after($("<input>", {"type": "hidden"}));
				break;
			case "text":
				$this.after($("<input>", {"type": "text", "class": "value form-control"}));
				break;
			case "textarea":
				$this.after($("<textarea>", {"class": "value form-control"}));
			case "select":
				var options = [];
				$.each(builder.fields, function(name, field) {
					if (name == fieldSelect.attr("data-value")) {
						options = field.options;
						return false;
					}
				});
				var select = $("<span>", {
					"class": "editable-select value",
					"tabindex": "0",
					"data-value": ""
				});
				var data = {};
				$.each(options, function(o, option) {
					data[option.name] = option.label || option.name;
					if (! data['selected']) {
						data['selected'] = option.name;
						select.attr("data-value", option.name);
						select.text(data[option.name]);
					}
				});
				select.editable(
					function (val, settings) {
						$(this).attr("data-value", val);
						settings.data.selected = val;
						$(this).focus();
						select.trigger('change');
						return settings.data[val];
					},
					{
						data: data,
						name: "action-select",
						type: "choices",
						select: true,
						placeholder: Translator.trans("click to select a value ..."),
						tooltip: Translator.trans("click to change this value ..."),
						submit: "",
						cancel: "",
						cssclass: "action-select",
						style: "inherit"
					}
				);
				select.on("keydown", function(e) {
					var key = e.keyCode || e.which || e.key;
					if (key == 13) {
						select.trigger('click');
					} else if (key == 32) {
						e.preventDefault();
					}
				});
				$this.after(select);
				break;
			case "expression":
				var expression = $("<span>", {"class": "value expression"}); 
				expression.expressionbuilder({
					fields: builder.fields,
					constants: builder.expressionOptions.constants,
					functions: builder.expressionOptions.functions,
					operators: builder.expressionOptions.operators,
					// initial: val,
					onCompleted: builder.expressionOptions.onCompleted,
					onEditing: builder.expressionOptions.onEditing,
					onError: builder.expressionOptions.onError,
					language: builder.expressionOptions.language,
					operandHolder: builder.expressionOptions.operandHolder,
					operatorHolder: builder.expressionOptions.operatorHolder,
					nestedExpression: builder.expressionOptions.nestedExpression
				});
				$this.after(expression);
				break;
		}
		currentValue.remove();
	}

})(jQuery);
