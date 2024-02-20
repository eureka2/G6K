(function (global) {
	'use strict';

	function RuleEngine(rules) {
		this.rulesData = rules.rulesData || [];
		this.actionsAdapter = rules.actionsAdapter;
	}

	RuleEngine.prototype = { 
		runAll: function(conditionsAdapter, cb) {
			var self = this;
			self.rulesData.forEach( (rule, r) => {
				self.run(r, conditionsAdapter, cb);
			});
		},

		run: function(ruleIndex, conditionsAdapter, cb) {
			var self = this;
			var rule = self.rulesData[ruleIndex];
			self.ifActions = rule.ifActions || [];
			self.elseActions = rule.elseActions || [];
			self.conditions = rule.conditions || {all: []};
			var out, error;
			self.matches(conditionsAdapter, function(err, result) {
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
			var parser = new ExpressionParser();
			var expr = parser.parse(this.conditions);
			expr.postfix();
			expr.setVariables(conditionsAdapter);
			var result = expr.evaluate();
			if (result === false) {
				var e = "Syntax error";
				if (cb) {
					cb(e, result);
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

	global.RuleEngine = RuleEngine;
}(this));
