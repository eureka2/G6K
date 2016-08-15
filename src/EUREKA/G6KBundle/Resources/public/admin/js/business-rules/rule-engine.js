/*
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

var global = this;

(function() {
	"use strict";

	var RuleEngine = global.RuleEngine = function RuleEngine(rules, conditionsAdapter, actionsAdapter) {
		this.dataset = rules.dataset || {};
		this.rulesData = rules.rulesData || [];
		this.conditionsAdapter = rules.conditionsAdapter;
		this.actionsAdapter = rules.actionsAdapter;
	}

	RuleEngine.prototype = {  
		runAll: function(cb) {
			var self = this;
			$.each(self.rulesData, function(r, rule) {
				self.run(r, cb);
			});
		},

		run: function(ruleIndex, cb) {
			var self = this;
			var rule = self.rulesData[ruleIndex];
			self.ifActions = rule.ifActions || [];
			self.elseActions = rule.elseActions || [];
			self.conditions = rule.conditions || {all: []};
			var out, error;
			self.matches(self.conditionsAdapter, function(err, result) {
				out = result;
				error = err;
				if (!err) {
					if (result) {
						self.runIfActions(self.actionsAdapter);
					} else {
						self.runElseActions(self.actionsAdapter);
					}
				}
				if (cb) {
					cb(err, result);
				}
			});
			if (!cb) {
				if (error) {
					throw error;
				}
				return out;
			}
		},

		matches: function(conditionsAdapter, cb) {
			var infixed = this.infix(this.conditions);
			var parser = new ExpressionParser();
			var expr = parser.parse(infixed);
			expr.postfix();
			var variables = {};
			var self = this;
			$.each(conditionsAdapter, function(name, val) {
				variables[self.dataset[name].id] = val;
			});
			expr.setVariables($.merge(variables, conditionsAdapter));
			var result = expr.evaluate();
			if (result === false) {
				var e = "Syntax error";
				if (cb) {
					cb(e, result);
				} else {
					throw e;
				}
			} else {
				if (cb) {
					cb(null, result === 'true');
				} else {
					return result === 'true';
				}
			}
		},

		runIfActions: function(actionsAdapter) {
			for (var i=0; i < this.ifActions.length; i++) {
				var actionData = this.ifActions[i];
				var actionName = actionData.value;
				var actionFunction = actionsAdapter[actionName]
				if (actionFunction) { 
					actionFunction(new Finder(actionData)); 
				}
			}
		},

		runElseActions: function(actionsAdapter) {
			for (var i=0; i < this.elseActions.length; i++) {
				var actionData = this.elseActions[i];
				var actionName = actionData.value;
				var actionFunction = actionsAdapter[actionName]
				if (actionFunction) { 
					actionFunction(new Finder(actionData)); 
				}
			}
		},

		makeCond:function(val) {
			var id = "#" + this.dataset[val.name].id;
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
		}
	 
	};

	function Finder(data) {
		this.data = data;
	}

	Finder.prototype = {
		find: function() {
		  var currentNode = this.data;
		  for (var i=0; i < arguments.length; i++) {
			var name = arguments[i];
			currentNode = findByName(name, currentNode);
			if (!currentNode) { 
				return null; 
			}
		  }
		  return currentNode.value;
		}
	};

	function findByName(name, node) {
		var fields = node.fields || [];
		for (var i=0; i < fields.length; i++) {
			var field = fields[i];
			if (field.name === name) {
				return field;
			}
		}
		return null;
	}

	if (typeof module !== "undefined") {
		module.exports = RuleEngine;
		delete global.RuleEngine;
	}
})();
