(function (global) {
	'use strict';

	function Token(type, value) {
		this.type  = type;
		this.arity = 0;
		this.value = value;
	};

	Token.TYPE = {
		T_UNDEFINED			: 0,
		T_NUMBER	  		: 1,  
		T_DATE				: 2, 
		T_BOOLEAN			: 3, 
		T_TEXT				: 4, 
		T_ANY				: 5, 
		T_IDENT				: 6,  
		T_FUNCTION			: 7,  
		T_ARRAY				: 8,  
		T_POPEN				: 9,  
		T_PCLOSE			: 10, 
		T_SBOPEN			: 11,  
		T_SBCLOSE			: 12, 
		T_COMMA				: 13, 
		T_NOOP				: 14, 
		T_PLUS				: 15, 
		T_MINUS				: 16, 
		T_TIMES				: 17, 
		T_DIV				: 18, 
		T_MOD				: 19, 
		T_POW				: 20, 
		T_UNARY_PLUS		: 21, 
		T_UNARY_MINUS		: 22, 
		T_NOT				: 23, 
		T_FIELD				: 24, 
		T_EQUAL				: 25,
		T_NOT_EQUAL			: 26,
		T_LESS_THAN			: 27,
		T_LESS_OR_EQUAL		: 28,
		T_GREATER_THAN		: 29,
		T_GREATER_OR_EQUAL	: 30,
		T_CONTAINS			: 31,
		T_NOT_CONTAINS		: 32,
		T_BITWISE_AND		: 33,
		T_BITWISE_OR		: 34,
		T_BITWISE_XOR		: 35,
		T_LOGICAL_AND		: 36,
		T_LOGICAL_OR		: 37,
		T_TERNARY			: 38,
		T_TERNARY_ELSE		: 39,
		T_DEGRE				: 40,

		A_NONE				: 0,
		A_LEFT				: 1,
		A_RIGHT				: 2
	};

	Token.prototype = {
		isUnaryOperator: function (){
			switch (this.type) {
				case Token.TYPE.T_NOT:
				case Token.TYPE.T_UNARY_PLUS:
				case Token.TYPE.T_UNARY_MINUS:
				case Token.TYPE.T_TERNARY_ELSE:
				case Token.TYPE.T_DEGRE:
					return true;
			}
			return false;
		},

		isBinaryOperator: function (){
			switch (this.type) {
				case Token.TYPE.T_POW:
				case Token.TYPE.T_TIMES:
				case Token.TYPE.T_DIV:
				case Token.TYPE.T_MOD:
				case Token.TYPE.T_PLUS:
				case Token.TYPE.T_MINUS:
				case Token.TYPE.T_BITWISE_AND:
				case Token.TYPE.T_BITWISE_OR:
				case Token.TYPE.T_BITWISE_XOR:
				case Token.TYPE.T_LOGICAL_AND:
				case Token.TYPE.T_LOGICAL_OR:
					return true;
			}
			return false;
		},

		isTernaryOperator: function (){
			switch (this.type) {
				case Token.TYPE.T_TERNARY:
					return true;
			}
			return false;
		},

		isOperator: function (){
			return this.isUnaryOperator() 
				|| this.isBinaryOperator() 
				|| this.isTernaryOperator();
		},

		isComparator: function (){
			switch (this.type) {
				case Token.TYPE.T_EQUAL:
				case Token.TYPE.T_NOT_EQUAL:
				case Token.TYPE.T_LESS_THAN:
				case Token.TYPE.T_LESS_OR_EQUAL:
				case Token.TYPE.T_GREATER_THAN:
				case Token.TYPE.T_GREATER_OR_EQUAL:
				case Token.TYPE.T_CONTAINS:
				case Token.TYPE.T_NOT_CONTAINS:
					return true;
			}
			return false;
		},

		isVariable: function(){
			switch (this.type) {
				case Token.TYPE.T_IDENT:
				case Token.TYPE.T_FIELD:
				case Token.TYPE.T_UNDEFINED:
					return true;
			}
			return false;
		},

		isUndefined: function(){
			return this.type == Token.TYPE.T_UNDEFINED;
		},

		isBeforeFunctionArgument: function (){
			switch (this.type) {
				case Token.TYPE.T_POPEN:
				case Token.TYPE.T_COMMA:
				case Token.TYPE.T_NOOP:
					return true;
			}
			return false;
		},

		precedence: function (){
			switch (this.type) {
				case Token.TYPE.T_POPEN:
				case Token.TYPE.T_PCLOSE:
				case Token.TYPE.T_POW:
					return 1;
				case Token.TYPE.T_NOT:
				case Token.TYPE.T_UNARY_PLUS:
				case Token.TYPE.T_UNARY_MINUS:
				case Token.TYPE.T_DEGRE:
					return 2;
				case Token.TYPE.T_TIMES:
				case Token.TYPE.T_DIV:
				case Token.TYPE.T_MOD:
					return 3;
				case Token.TYPE.T_PLUS:
				case Token.TYPE.T_MINUS:
					return 4;
				case Token.TYPE.T_LESS_THAN:
				case Token.TYPE.T_LESS_OR_EQUAL:
				case Token.TYPE.T_GREATER_THAN:
				case Token.TYPE.T_GREATER_OR_EQUAL:
					return 6;
				case Token.TYPE.T_EQUAL:
				case Token.TYPE.T_NOT_EQUAL:
				case Token.TYPE.T_CONTAINS:
				case Token.TYPE.T_NOT_CONTAINS:
					return 7;
				case Token.TYPE.T_BITWISE_AND:
					return 8;
				case Token.TYPE.T_BITWISE_XOR:
					return 9;
				case Token.TYPE.T_BITWISE_OR:
					return 10;
				case Token.TYPE.T_LOGICAL_AND:
					return 11;
				case Token.TYPE.T_LOGICAL_OR:
					return 12;
				case Token.TYPE.T_TERNARY_ELSE:
					return 13;
				case Token.TYPE.T_TERNARY:
					return 14;
				case Token.TYPE.T_COMMA:
					return 15;
			}
			return 16;
		},

		associativity: function (){
			switch (this.type) {
				case Token.TYPE.T_POW:
				case Token.TYPE.T_NOT:
				case Token.TYPE.T_UNARY_PLUS:
				case Token.TYPE.T_UNARY_MINUS:
					return Token.TYPE.A_RIGHT;
				case Token.TYPE.T_DEGRE:
				case Token.TYPE.T_TIMES:
				case Token.TYPE.T_DIV:
				case Token.TYPE.T_MOD:
				case Token.TYPE.T_PLUS:
				case Token.TYPE.T_MINUS:
				case Token.TYPE.T_LESS_THAN:
				case Token.TYPE.T_LESS_OR_EQUAL:
				case Token.TYPE.T_GREATER_THAN:
				case Token.TYPE.T_GREATER_OR_EQUAL:
				case Token.TYPE.T_EQUAL:
				case Token.TYPE.T_NOT_EQUAL:
				case Token.TYPE.T_CONTAINS:
				case Token.TYPE.T_NOT_CONTAINS:
				case Token.TYPE.T_BITWISE_AND:
				case Token.TYPE.T_BITWISE_XOR:
				case Token.TYPE.T_BITWISE_OR:
				case Token.TYPE.T_LOGICAL_AND:
				case Token.TYPE.T_LOGICAL_OR:
				case Token.TYPE.T_TERNARY:
					return Token.TYPE.A_LEFT;
				case Token.TYPE.T_TERNARY_ELSE:
					return Token.TYPE.A_RIGHT;
				case Token.TYPE.T_COMMA:
					return Token.TYPE.A_LEFT;
			}
			return Token.TYPE.A_NONE;
		},

		toString: function () {
			switch (this.type) {
				case Token.TYPE.T_DATE:
					return this.value.format(Date.format);
					break;
				case Token.TYPE.T_BOOLEAN:
					return this.value ? 'true' : 'false';
					break;
				case Token.TYPE.T_FUNCTION:
					return this.value;
					break;
				case Token.TYPE.T_ARRAY:
					return JSON.stringify(this.value);
					break;
				default:
					return this.value.toString();
			}
		}
	};

	global.Token = Token;

}(this));

(function (global) {
	'use strict';

	Number.isNumeric = Number.isNumeric || function(value) {
		var type = typeof value;
		return (type === "number" || type === "string") &&
				!isNaN(value - parseFloat(value));
	}

	function Expression(expression) {
		this.expression = expression;
		this.tokens = [];
		this.postfixed = false;
	};

	Expression.prototype = {
		get: function (){
			return this.tokens;
		},

		push: function (t){
			this.tokens.push(t);
		},

		pop: function (){
			return this.tokens.pop();
		},

		peek: function (){
			return this.tokens[this.tokens.length - 1];
		},

		postfix : function () {
			var stack = [];
			var rpn = [];

			for (var token of this.tokens) {
				switch (token.type) {
					case Token.TYPE.T_COMMA:
						while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
							rpn.push(stack.pop());
						}
						if (stack.length > 1
							&& stack[stack.length-2].type == Token.TYPE.T_FUNCTION) {
							stack[stack.length-2].arity++;
						}
						break;
					case Token.TYPE.T_NUMBER:
					case Token.TYPE.T_DATE:
					case Token.TYPE.T_BOOLEAN:
					case Token.TYPE.T_TEXT:
					case Token.TYPE.T_ANY:
					case Token.TYPE.T_IDENT:
					case Token.TYPE.T_FIELD:
					case Token.TYPE.T_ARRAY:
					case Token.TYPE.T_UNDEFINED:
						rpn.push(token);
						break;
					case Token.TYPE.T_PCLOSE:
						while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
							rpn.push(stack.pop());
						}
						if (stack.length == 0) {
							throw new Error("Closing parenthesis without opening parenthesis");
						}
						stack.pop();
						if (stack.length != 0
							&& stack[stack.length-1].type == Token.TYPE.T_FUNCTION) {
							stack[stack.length-1].arity++;
							rpn.push(stack.pop());
						}
						break;
					case Token.TYPE.T_POPEN:
					case Token.TYPE.T_FUNCTION:
						stack.push(token);
						break;
					default:
						if (token.isOperator() || token.isComparator()) {
							while (stack.length != 0
								&& (stack[stack.length-1].isOperator() || stack[stack.length-1].isComparator())
								&& ((token.associativity() == Token.TYPE.A_LEFT && token.precedence() >= stack[stack.length-1].precedence()) || (token.associativity() == Token.TYPE.A_RIGHT && token.precedence() > stack[stack.length-1].precedence()))) {
								rpn.push(stack.pop());
							}
							stack.push(token);
						} else {
							throw new Error("Unrecognized token " + token.value);
						}
						break;
				}
			}
			while (stack.length != 0 && stack[stack.length-1].type != Token.TYPE.T_POPEN) {
				rpn.push(stack.pop());
			}
			if (stack.length != 0) {
				throw new Error("Opening parenthesis without closing parenthesis");
			}
			this.tokens = rpn;
			this.postfixed = true;
		},

		setFields: function (fields) {
			for (var token of this.tokens) {
				if (token.type == Token.TYPE.T_FIELD && fields.length >= token.value) {
					var value = fields[token.value - 1];
					if (Array.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (Number.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			}
		},

		setNamedFields: function (fields) {
			for (var token of this.tokens) {
				if (token.type == Token.TYPE.T_IDENT && typeof fields[token.value] !== 'undefined' && fields[token.value] !== null) {
					var value = fields[token.value];
					if (Array.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (Number.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			}
		},

		setVariables: function (variables) {
			var completed = true;
			for (var token of this.tokens) {
				if (token.type == Token.TYPE.T_FIELD) {
					var value = variables['' + token.value];
					if (typeof value === 'undefined' || value === null || value.length == 0) {
						completed = false;
					} else if (Array.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (Number.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				} else if (token.type == Token.TYPE.T_IDENT) {
					var value = variables[token.value];
					if (typeof value === 'undefined' || value === null || value.length == 0) {
						completed = false;
					} else if (Array.isArray(value)) {
						token.type = Token.TYPE.T_ARRAY;
						token.value = value;
					} else if (Date.isDate(value)) {
						token.type = Token.TYPE.T_DATE;
						token.value = Date.createFromFormat(Date.inputFormat, value);
					} else if (Number.isNumeric(value)) {
						token.type = Token.TYPE.T_NUMBER;
						token.value = parseFloat(value);
					} else if (value === 'true' || value === 'false') {
						token.type = Token.TYPE.T_BOOLEAN;
						token.value = value === 'true';
					} else {
						token.type = Token.TYPE.T_TEXT;
						token.value = value;
					}
				}
			}
			return completed;
		},

		evaluate: function () {
			try {
				var ops = [];
				var self = this;
				for (var token of this.tokens) {
					if (token.isOperator()) {
						ops.push(self.operation(token, ops));
					} else if (token.isComparator()) {
						ops.push(self.comparison(token, ops));
					} else {
						switch (token.type) {
							case Token.TYPE.T_NUMBER:
							case Token.TYPE.T_DATE:
							case Token.TYPE.T_BOOLEAN:
							case Token.TYPE.T_TEXT:
							case Token.TYPE.T_ANY:
							case Token.TYPE.T_IDENT:
							case Token.TYPE.T_FIELD:
							case Token.TYPE.T_ARRAY:
							case Token.TYPE.T_UNDEFINED:
								ops.push(token);
								break;
							case Token.TYPE.T_FUNCTION:
								ops.push(self.func(token, ops));
								break;
							default:
								throw new Error("Unrecognized token " + token.value);
						}
					}
				}
				var result = ops[ops.length-1];
				return result.isVariable() ? false : '' + result;
			} catch (e) {
				return false;
			}
		},

		operation: function (op, args) {
			if (op.isUnaryOperator()) {
				if (args.length < 1) {
					throw new Error("Illegal number (" + args.length + ") of operands for " + op);
				}
				var arg1 = args.pop();
			} else if (op.isBinaryOperator()) {
				if (args.length < 2) {
					throw new Error("Illegal number (" + args.length + ") of operands for " + op);
				}
				var arg2 = args.pop();
				var arg1 = args.pop();
			} else if (op.isTernaryOperator()) {
				if (args.length < 3) {
					throw new Error("Illegal number (" + args.length + ") of operands for " + op);
				}
				var arg3 = args.pop();
				var arg2 = args.pop();
				var arg1 = args.pop();
			}
			var result = new Token(Token.TYPE.T_NUMBER, 0);
			switch (op.type) {
				case Token.TYPE.T_PLUS:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type == Token.TYPE.T_NUMBER) { 
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value + arg2.value;
						} else if (arg2.type == Token.TYPE.T_DATE) {
							var date = arg2.value;
							date.addDays(arg1.value);
							result.type = Token.TYPE.T_DATE;
							result.value = date;
						} else if (arg2.type == Token.TYPE.T_TEXT) {
							result.type = Token.TYPE.T_TEXT;
							result.value = arg1.value.toString() + arg2.value;
						} else {
							throw  new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_DATE) {
						if (arg2.type == Token.TYPE.T_NUMBER) {
							var date = arg1.value;
							date.addDays(arg2.value);
							result.type = Token.TYPE.T_DATE;
							result.value = date;
						} else if (arg2.type == Token.TYPE.T_TEXT) {
							result.type = Token.TYPE.T_TEXT;
							result.value = arg1.value.format(Date.format) + arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_TEXT) {
						result.type = Token.TYPE.T_TEXT;
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value + arg2.value.toString();
						} else if (arg2.type == Token.TYPE.T_DATE) {
							result.value = arg1.value + arg2.value.format(Date.format);
						} else if (arg2.type == Token.TYPE.T_TEXT) {
							result.value = arg1.value + arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else {
						throw new Error("Illegal argument '" + arg1 + "' for " + op);
					}
					break;
				case Token.TYPE.T_MINUS:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type == Token.TYPE.T_NUMBER) { 
						if (arg2.type == Token.TYPE.T_NUMBER) {
							result.value = arg1.value - arg2.value;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else if (arg1.type == Token.TYPE.T_DATE) {
						if (arg2.type == Token.TYPE.T_NUMBER) {
							var date = arg1.value;
							date.addDays(-arg2.value);
							result.type = Token.TYPE.T_DATE;
							result.value = date;
						} else if (arg2.type == Token.TYPE.T_DATE) {
							result.value = (arg1.value > arg2.value)
								? arg2.value.getDaysBetween(arg1.value)
								: 0;
						} else {
							throw new Error("Illegal argument '" + arg2 + "' for " + op);
						}
					} else {
						throw new Error("Illegal argument '" + arg1 + "' for " + op);
					}
					break;
				case Token.TYPE.T_TIMES:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg2 + "' : operands must be numbers for " + op);
					} else {
						result.value = arg1.value * arg2.value;
					}
					break;
				case Token.TYPE.T_DIV:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value / arg2.value;
					}
					break;
				case Token.TYPE.T_MOD:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value % arg2.value;
					}
					break;
				case Token.TYPE.T_POW:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = Math.pow(arg1.value, arg2.value);
					}
					break;
				case Token.TYPE.T_BITWISE_AND:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value & arg2.value;
					}
					break;
				case Token.TYPE.T_BITWISE_XOR:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value ^ arg2.value;
					}
					break;
				case Token.TYPE.T_BITWISE_OR:
					if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else if (arg1.type != Token.TYPE.T_NUMBER || arg2.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument : operands must be numbers for " + op);
					} else {
						result.value = arg1.value | arg2.value;
					}
					break;
				case Token.TYPE.T_LOGICAL_AND:
					result.type = Token.TYPE.T_BOOLEAN;
					if (arg1.type == Token.TYPE.T_BOOLEAN && arg2.type == Token.TYPE.T_BOOLEAN) {
						result.value = arg1.value && arg2.value;
					} else if (arg1.type == Token.TYPE.T_BOOLEAN) {
						if (! arg1.value) {
							result.value = false;
						} else if (arg2.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 2 : operand must be boolean for "+ op);
						}
					} else if (arg2.type == Token.TYPE.T_BOOLEAN) {
						if (! arg2.value) {
							result.value = false;
						} else if (arg1.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 1 : operand must be boolean for " + op);
						}
					} else if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else {
						throw new Error("Illegal argument : operands must be boolean for " + op);
					}
					break;
				case Token.TYPE.T_LOGICAL_OR:
					result.type = Token.TYPE.T_BOOLEAN;
					if (arg1.type == Token.TYPE.T_BOOLEAN && arg2.type == Token.TYPE.T_BOOLEAN) {
						result.value = arg1.value || arg2.value;
					} else if (arg1.type == Token.TYPE.T_BOOLEAN) {
						if (arg1.value) {
							result.value = true;
						} else if (arg2.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 2 : operand must be boolean for " + op);
						}
					} else if (arg2.type == Token.TYPE.T_BOOLEAN) {
						if (arg2.value) {
							result.value = true;
						} else if (arg1.isVariable()) {
							result.type = Token.TYPE.T_UNDEFINED;
							result.value = [arg1, arg2];
						} else {
							throw new Error("Illegal argument 1 : operand must be boolean for " + op);
						}
					} else if (arg1.isVariable() || arg2.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2];
					} else {
						throw new Error("Illegal argument : operands must be boolean for " + op);
					}
					break;
				case Token.TYPE.T_UNARY_PLUS:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number for " + op);
					} else {
						result.value = arg1.value;
					}
					break;
				case Token.TYPE.T_UNARY_MINUS:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number for " + op);
					} else {
						result.value = -arg1.value;
					}
					break;
				case Token.TYPE.T_NOT:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER && arg1.type != Token.TYPE.T_BOOLEAN) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number or a boolean for " + op);
					} else {
						result.type = arg1.type;
						result.value = !arg1.value;
					}
					break;
				case Token.TYPE.T_DEGRE:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1];
					} else if (arg1.type != Token.TYPE.T_NUMBER) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand must be a number for " + op);
					} else {
						result.value = arg1.value * Math.PI / 180;
					}
					break;
				case Token.TYPE.T_TERNARY_ELSE:
					result = arg1;
					break;
				case Token.TYPE.T_TERNARY:
					if (arg1.isVariable()) {
						result.type = Token.TYPE.T_UNDEFINED;
						result.value = [arg1, arg2, arg3];
					} else if (arg1.type != Token.TYPE.T_BOOLEAN) { 
						throw new Error("Illegal argument '" + arg1 + "' : operand 1 must be a condition for " + op);
					} else {
						result = arg1.value ? arg2 : arg3;
					}
					break;
			}
			this.guessType(result);
			return result;
		},

		comparison: function (op, args) {
			if (args.length < 2) {
				throw new Error("Illegal number (" + args.length + ") of operands for " + op);
			}
			var arg2 = args.pop();
			var arg1 = args.pop();
			var result;
			if (arg1.isVariable() || arg2.isVariable()) {
				result = new Token(Token.TYPE.T_UNDEFINED, [arg1, arg2]);
			} else if (op.type != Token.TYPE.T_CONTAINS && arg1.type != arg2.type) { 
				throw new Error("operand types for '" + op + "' are not identical");
			} else if (op.type == Token.TYPE.T_CONTAINS && arg1.type != Token.TYPE.T_ARRAY) { 
				throw new Error("first operand type for '" + op + "' is not an array");
			} else {
				result = new Token(Token.TYPE.T_BOOLEAN, false);
				switch (op.type) {
					case Token.TYPE.T_EQUAL:
						result.value = (arg1.value == arg2.value);
						break;
					case Token.TYPE.T_NOT_EQUAL:
						result.value = (arg1.value != arg2.value);
						break;
					case Token.TYPE.T_LESS_THAN:
						result.value = (arg1.value < arg2.value);
						break;
					case Token.TYPE.T_LESS_OR_EQUAL:
						result.value = (arg1.value <= arg2.value);
						break;
					case Token.TYPE.T_GREATER_THAN:
						result.value = (arg1.value > arg2.value);
						break;
					case Token.TYPE.T_GREATER_OR_EQUAL:
						result.value = (arg1.value >= arg2.value);
						break;
					case Token.TYPE.T_CONTAINS:
						result.value = Array.isArray(arg1.value) && arg1.value.indexOf(arg2.value.toString()) >= 0;
						break;
					case Token.TYPE.T_NOT_CONTAINS:
						result.value = ! Array.isArray(arg1.value) || arg1.value.indexOf(arg2.value.toString()) < 0;
						break;
				}
			}
			return result;
		},

		guessType : function (token) {
			if (token.type == Token.TYPE.T_TEXT) {
				if (Date.isDate(token.value)) {
					token.type = Token.TYPE.T_DATE;
					token.value = Date.createFromFormat(Date.inputFormat, token.value);
				} else if (Number.isNumeric(token.value)) {
					token.type = Token.TYPE.T_NUMBER;
					token.value = parseFloat(token.value);
				} else if (token.value === 'true' || token.value === 'false') {
					token.type = Token.TYPE.T_BOOLEAN;
					token.value = token.value === 'true';
				}
			}
		},

		func: function (func, args) {
			var functions = {
				"abs": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.abs(a); }],
				"acos": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.acos(a); }],
				"acosh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.acosh(a); }],
				"addMonths": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a, b) { return b.addMonths(a); }],
				"asin": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.asin(a); }],
				"asinh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.asinh(a); }],
				"atan": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.atan(a); }],
				"atan2": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.atan2(a, b); }],
				"atanh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.atanh(a); }],
				"ceil": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.ceil(a); }],
				"concat": [-1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) {
					var c = '';
					for (var v of a) {
						c += v !== undefined ? v : '';
					}
					return c; 
				}],
				"cos": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.cos(a); }],
				"cosh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.cosh(a); }],
				"count": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) {
					var c = 0;
					for (var v of a) {
						if (v !== undefined) {
							c += 1;
						}
					}
					return c; 
				}],
				"day": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getDate(); }],
				"exp": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.exp(a); }],
				"firstDayOfMonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a) { return a.firstDayOfMonth(); }],
				"floor": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.floor(a); }],
				"fullmonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_TEXT, function(a) { return a.getMonthName('fr') + ' ' + a.format('Y'); }],
				"get": [2, [Token.TYPE.T_ARRAY, Token.TYPE.T_NUMBER], Token.TYPE.T_TEXT, function(a, b) { return b < a.lengh + 1 ? a[b - 1] : ''; }],
				"lastday": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { var d = Date.createFromFormat('Y-n-j', a + '-' + b + '-1' );return d.lastday(false); }],
				"lastDayOfMonth": [1, [Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a) { return a.lastDayOfMonth(); }],
				"lcfirst": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.replace(/(^[A-Z])/,function (p) { return p.toLowerCase(); } ); }],
				"length": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_NUMBER, function(a) { return a.length; }],
				"log": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.log(a); }],
				"log10": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.log10(a); }],
				"lower": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.toLowerCase(); }],
				"match": [2, [Token.TYPE.T_TEXT, Token.TYPE.T_TEXT], Token.TYPE.T_BOOLEAN, function(a, b) { return b.match(a) != null; }],
				"max": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.max.apply(null, a); }],
				"min": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.min.apply(null, a); }],
				"money": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_TEXT, function(a) { 

					return new Intl.NumberFormat(Date.locale, {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
						
					}).format(a);
				}],
				"month": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getMonth() + 1; }],
				"nextWorkDay": [1, [Token.TYPE.T_DATE], Token.TYPE.T_DATE, function(a) { return a.nextWorkingDay(); }],
				"pow": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) { return Math.pow(a, b); }],
				"rand": [0, [], Token.TYPE.T_NUMBER, function() { return Math.random(); }],
				"replace": [3, [Token.TYPE.T_TEXT, Token.TYPE.T_TEXT, Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a, b, c) {
					var d = c;
					while (d.indexOf(a) >= 0){
						d = d.replace(a, b);
					}
					return d;
				}],
				"round": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.round(a); }],
				"sin": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sin(a); }],
				"sinh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sinh(a); }],
				"size": [1, [Token.TYPE.T_ARRAY], Token.TYPE.T_NUMBER, function(a) { return a.length; }],
				"split": [2, [Token.TYPE.T_TEXT, Token.TYPE.T_TEXT], Token.TYPE.T_ARRAY, function(a, b) { return b.split(a); }],
				"sqrt": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.sqrt(a); }],
				"substr": [3, [Token.TYPE.T_TEXT, Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_TEXT, function(a, b, c) {
					if (b > 0) {
						b--;
					}
					return a.substr(b, c);
				}],
				"sum": [-1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) {
					var s = 0;
					for (var v of a) {
						if (v !== undefined) {
							s += v;
						}
					}
					return s; 
				}],
				"tan": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.tan(a); }],
				"tanh": [1, [Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a) { return Math.tanh(a); }],
				"titlecase": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) {
					return a.toLowerCase().replace(/^[\u00C0-\u1FFF\u2C00-\uD7FF\w]|[-\s][\u00C0-\u1FFF\u2C00-\uD7FF\w]/g, function(letter) {
						return letter.toUpperCase();
					});
				}],
				"trim": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return trim(a); }],
				"ucfirst": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.replace(/(^[a-z])/,function (p) { return p.toUpperCase(); } ); }],
				"upper": [1, [Token.TYPE.T_TEXT], Token.TYPE.T_TEXT, function(a) { return a.toUpperCase(); }],
				"workdays": [2, [Token.TYPE.T_DATE, Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a, b) { return a.workingDaysBefore(b); }],
				"workdaysofmonth": [2, [Token.TYPE.T_NUMBER, Token.TYPE.T_NUMBER], Token.TYPE.T_NUMBER, function(a, b) {
					var d1 = Date.createFromFormat('Y-n-j', a + '-' + b + '-1' );
					var d2 = new Date(d1.getFullYear(), d1.getMonth() + 1, 0);
					return d1.workingDaysBefore(d2); 
				}],
				"year": [1, [Token.TYPE.T_DATE], Token.TYPE.T_NUMBER, function(a) { return a.getFullYear(); }]
			};
			if (func.value === "defined") {
				if (args.length < 1) { 
					throw new Error("Illegal number (" + args.length + ") of operands for function" + func);
				}
				var arg = args.pop();
				if (arg.isVariable()) {
					return new Token(Token.TYPE.T_BOOLEAN, false);
				}
				if (typeof arg.value === "undefined" || arg.value === null || arg.value === "") {
					return new Token(Token.TYPE.T_BOOLEAN, false);
				}
				return new Token(Token.TYPE.T_BOOLEAN, true);
			}
			if (typeof functions[func.value] === "undefined" || functions[func.value] === null) {
				throw new Error("Unknown function : " + func);
			}
			var argc = functions[func.value][0];
			var variableArgsCount = false;
			if (argc == -1) {
				argc = func.arity;
				variableArgsCount = true;
			}
			if (args.length < argc) {
				throw new Error("Illegal number (" + args.length + ") of operands for function" + func);
			}
			var argv = [];
			for (; argc > 0; --argc) {
				var arg = args.pop();
				if (! variableArgsCount) {
					if (arg.isVariable()) {
						return new Token(Token.TYPE.T_UNDEFINED, [arg]);
					}
					var type = functions[func.value][1][argc - 1];
					if (type == Token.TYPE.T_TEXT && (arg.type == Token.TYPE.T_NUMBER || arg.type == Token.TYPE.T_DATE)) {
						arg.value += '';
					} else if (arg.type != type) { 
						var expected = "";
						switch (type) {
							case Token.TYPE.T_NUMBER:
								expected = "number";
								break;
							case Token.TYPE.T_DATE: 
								expected = "date";
								break;
							case Token.TYPE.T_BOOLEAN:
								expected = "boolean";
								break;
							case Token.TYPE.T_TEXT: 
								expected = "text";
								break;
							case Token.TYPE.T_ARRAY: 
								expected = "array";
								break;
						}
						throw new Error("Illegal type for argument '" + arg + "' : operand must be a " + expected + " for " + func);
					}
				} else if (arg.isVariable()) {
					if (func.value == 'sum' || func.value == 'count' || func.value == 'concat') {
						arg.value = undefined;
					} else {
						return new Token(Token.TYPE.T_UNDEFINED, [arg]);
					}
				}
				argv.unshift(arg.value); 
			}
			if (variableArgsCount) {
				argv = [argv];
			}
			return new Token(functions[func.value][2], functions[func.value][3].apply(this, argv));
		}
	};

	global.Expression = Expression;

}(this));

(function (global) {
	'use strict';

	var PATTERN = /([\s!,\+\-\*\/\^%\(\)\[\]=<\>\~\&\^\|\?\:°])/g;

	var lookup = {
		'+': Token.TYPE.T_PLUS,
		'-': Token.TYPE.T_MINUS,
		'/': Token.TYPE.T_DIV,
		'%': Token.TYPE.T_MOD,
		'(': Token.TYPE.T_POPEN,
		')': Token.TYPE.T_PCLOSE,
		'[': Token.TYPE.T_SBOPEN,
		']': Token.TYPE.T_SBCLOSE,
		'*': Token.TYPE.T_TIMES,
		'!': Token.TYPE.T_NOT,
		',': Token.TYPE.T_COMMA,
		'=': Token.TYPE.T_EQUAL,
		'<': Token.TYPE.T_LESS_THAN,
		'>': Token.TYPE.T_GREATER_THAN,
		'~': Token.TYPE.T_CONTAINS,
		'&': Token.TYPE.T_BITWISE_AND,
		'^': Token.TYPE.T_BITWISE_XOR,
		'|': Token.TYPE.T_BITWISE_OR,
		'?': Token.TYPE.T_TERNARY,
		':': Token.TYPE.T_TERNARY_ELSE,
		'°': Token.TYPE.T_DEGRE
	};

	function ExpressionParser() {
		this.text = [];
	};

	ExpressionParser.prototype = {
		parse: function (infix) {
			var constants = {
				'pi'	: new Token(Token.TYPE.T_NUMBER, Math.PI),
				'now'	: new Token(Token.TYPE.T_DATE, new Date()),
				'today'	: new Token(Token.TYPE.T_DATE, new Date()),
				'true'	: new Token(Token.TYPE.T_BOOLEAN, true),
				'false'	: new Token(Token.TYPE.T_BOOLEAN, false)
			};
			var expr = new Expression(infix);
			var self = this;
			infix = infix.replace(/\\\'/g, '`');
			infix = infix.replace(/('[^']*')/g, function (match, m1, str) {
				self.text.push(m1.substr(1, m1.length - 2).replace(/`/g, "\'"));
				return "¤" + self.text.length;
			});
			infix = infix.replace(/\\\"/g, '`');
			infix = infix.replace(/("[^"]*")/g, function (match, m1, str) {
				self.text.push(m1.substr(1, m1.length - 2).replace(/`/g, '\"'));
				return "¤" + self.text.length;
			});
			infix = this.maskDate(infix);
			var toks = infix.split(PATTERN);
			var prev = new Token(Token.TYPE.T_NOOP, 'noop');
			for (var value of toks) {
				value = value.replace(/^\s+|\s+$/g, '');
				var matches;
				if (Number.isNumeric(value)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					expr.push(prev = new Token(Token.TYPE.T_NUMBER, parseFloat(value)));
				} else if (value.match(/^#\d+/)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					expr.push(prev = new Token(Token.TYPE.T_FIELD, parseInt(value.substr(1), 10)));
				} else if (matches = value.match(/^¤(\d+)/)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					var i = parseInt(matches[1], 10);
					expr.push(prev = new Token(Token.TYPE.T_TEXT, self.text[i - 1]));
				} else if (matches = value.match(/^D(\d{1,2})\.(\d{1,2})\.(\d{4})/)) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					var date = Date.createFromFormat("j/n/Y", matches[1] + "/" + matches[2] + "/" + matches[3]);
					expr.push(prev = new Token(Token.TYPE.T_DATE, date));
				} else if (constants[value]) {
					if (prev.type == Token.TYPE.T_PCLOSE)
						expr.push(new Token(Token.TYPE.T_TIMES, '*'));
					expr.push(prev = constants[value]);
				} else if (value !== "") {
					var type;
					switch (type = lookup[value] ? lookup[value] : Token.TYPE.T_IDENT) {
						case Token.TYPE.T_EQUAL:
							switch (prev.type) {
								case Token.TYPE.T_NOT:
									expr.pop();
									type = Token.TYPE.T_NOT_EQUAL;
									value = "!=";
									break;
								case Token.TYPE.T_LESS_THAN:
									expr.pop();
									type = Token.TYPE.T_LESS_OR_EQUAL;
									value = "<=";
									break;
								case Token.TYPE.T_GREATER_THAN:
									expr.pop();
									type = Token.TYPE.T_GREATER_OR_EQUAL;
									value = ">=";
									break;
							}
							break;
						case Token.TYPE.T_CONTAINS:
							if (prev.type == Token.TYPE.T_NOT) {
								expr.pop();
								type = Token.TYPE.T_NOT_CONTAINS;
								value = "!~";
								break;
							}
						case Token.TYPE.T_BITWISE_AND:
							if (prev.type == Token.TYPE.T_BITWISE_AND) {
								expr.pop();
								type = Token.TYPE.T_LOGICAL_AND;
								value = "&&";
							}
							break;
						case Token.TYPE.T_BITWISE_OR:
							if (prev.type == Token.TYPE.T_BITWISE_OR) {
								expr.pop();
								type = Token.TYPE.T_LOGICAL_OR;
								value = "||";
							}
							break;
						case Token.TYPE.T_TIMES:
							if (prev.type == Token.TYPE.T_TIMES) {
								expr.pop();
								type = Token.TYPE.T_POW;
								value = "**";
							}
							break;
						case Token.TYPE.T_PLUS:
							if (prev.isOperator() || prev.isComparator() || prev.isBeforeFunctionArgument())
								type = Token.TYPE.T_UNARY_PLUS;
							break;

						case Token.TYPE.T_MINUS:
							if (prev.isOperator() || prev.isComparator() || prev.isBeforeFunctionArgument())
								type = Token.TYPE.T_UNARY_MINUS;
							break;

						case Token.TYPE.T_POPEN:
							switch (prev.type) {
								case Token.TYPE.T_IDENT:
									prev.type = Token.TYPE.T_FUNCTION;
									break;

								case Token.TYPE.T_NUMBER:
								case Token.TYPE.T_DATE:
								case Token.TYPE.T_BOOLEAN:
								case Token.TYPE.T_TEXT:
								case Token.TYPE.T_ARRAY:
								case Token.TYPE.T_PCLOSE:
									expr.push(new Token(Token.TYPE.T_TIMES, '*'));
									break;
							}
							break;

						case Token.TYPE.T_SBOPEN:
							t = expr.pop();
							expr.push(new Token(Token.TYPE.T_FUNCTION, 'get'));
							expr.push(new Token(Token.TYPE.T_POPEN, '('));
							expr.push(t);
							type = Token.TYPE.T_COMMA;
							value = ',';
							break;

						case Token.TYPE.T_SBCLOSE:
							type = Token.TYPE.T_PCLOSE;
							value = '(';
							break;

					}
					expr.push(prev = new Token(type, value));
				}
			}
			return expr;
		},

		maskDate: function (infix) {
			var re = new RegExp(Date.regexp, "g");
			return infix.replace(re, "D"+Date.replacement);
		}

	};

	global.ExpressionParser = ExpressionParser;
}(this));
