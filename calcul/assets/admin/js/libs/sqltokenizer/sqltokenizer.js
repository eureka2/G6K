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

(function (global) {
	"use strict";

	function SQLSelectTokenizer(tables, functions) {
		this.setTables(tables);
		this.setFunctions(functions);
	};

	SQLSelectTokenizer.JOIN = {
		CROSS				: 0,
		INNER				: 1,
		LEFT				: 2,
		RIGHT				: 3
	};

	SQLSelectTokenizer.synonyms = {
		'power': 'pow',
		'random': 'rand',
	};

	SQLSelectTokenizer.prototype = {

		setTables: function(tables){
			this.tables = tables;
		},

		setFunctions: function(functions){
			this.functions = functions;
		},

		replaceSynonyms: function(expr){
			var synonyms = [];
			for (var key in SQLSelectTokenizer.synonyms) {
				if (Object.prototype.hasOwnProperty.call(SQLSelectTokenizer.synonyms, key)) {
					synonyms.push(SQLSelectTokenizer.synonyms[key]);
				}
			}
			var re = new RegExp('(\\w*)(' + Object.keys(SQLSelectTokenizer.synonyms).join('|') + '|' + synonyms.join('|') + ')\\s*\\(', 'ig');
			var result = expr.replace(
				re,
				function (match, m1, m2, offs, str) {
					var func = m2.toLowerCase();
					return SQLSelectTokenizer.synonyms[func] ? m1 + SQLSelectTokenizer.synonyms[func] + '(' : m1 + func + '(';
				}
			);
			return result;
		},

		checkSafety: function(expression){
			var m;
			if (m = expression.match(/\b(\w+)\s*\(/)) {
				if ($.inArray(m[1], Object.keys(this.functions)) == -1 && m[1].toLowerCase() !== 'and' && m[1].toLowerCase() !== 'or') {
					// A not allowed function is found
					throw new SQLSelectTokenizerException("syntax error near : " + m[1]);
				}
			}
			if (expression.indexOf(String.fromCharCode(10)) != -1) {
				// newline is forbidden
				throw new SQLSelectTokenizerException("syntax error");
			}
			if (m = expression.match(/[`\{\}\[\]\;]/)) {
				// metacharacters are forbidden
				throw new SQLSelectTokenizerException("syntax error near : " + m[1]);
			}
			if (m = expression.match(/\$\$([^\s]+)/)) {
				// $$ is forbidden
				throw new SQLSelectTokenizerException("syntax error near : " + m[1]);
			}
		},

		isExpression: function(string){
			if (/^\d{4}\-\d{1,2}\-\d{1,2}( \d{1,2}\:\d{1,2}:\d{1,2})?$/.test(string)) { // date
				return false;
			}
			return /[\(\+\-\/\*\%]/.test(string);
		},

		parseExpression: function(expression){
			var find =    ['\\{',   '\\}',   '\\[',    '\\]',  '`',    ';'];
			var replace = ['&#123', '&#125', '&#91',   '&#93', '&#96', '&#59'];
			var re; 
			for (var i = 0; i < find.length; i++) {
				re = new RegExp(find[i], "g");
				expression = expression.replace(re, replace[i]);
			}
			if (this.isExpression(expression)) {
				this.checkSafety(expression);
			}
			return expression;
		},

		parseConditions: function(conditions){
			var find =    ['\\{',   '\\}',   '\\[',    '\\]',  '`',    ';'];
			var replace = ['&#123', '&#125', '&#91',   '&#93', '&#96', '&#59'];
			var re; 
			for (var i = 0; i < find.length; i++) {
				re = new RegExp(find[i], "g");
				conditions = conditions.replace(re, replace[i]);
			}
			this.checkSafety(conditions);
			return conditions;
		},

		addTokenInCondition: function(condition, token){
			var value;
			if (token.isBinaryOperator() && token.type != Token.TYPE.T_MOD) {
				value = ' ' + token.value + ' ';
			} else if (token.type == Token.TYPE.T_TEXT) {
				value = "'" + token.value + "'";
			} else {
				value = '' + token.value;
			}
			if (condition.inoperand) {
				condition.operand += value;
			} else if (condition.invalue) {
				condition.value += value;
			} else {
				condition.operand += value;
				condition.inoperand = true;
			}
		},

		resetCondition: function(condition){
			condition.operand = '';
			condition.operator = '';
			condition.value = '';
			condition.datatype = '';
			condition.inoperand = false;
			condition.invalue = false;
			condition.infunction = false;
		},

		insertCondition: function(conditions, condition){
			var found = 0;
			var matches;
			if (matches = condition.operand.match(/(!)?defined\(([^\)]+)\)/)) {
				condition.operand = matches[2];
				condition.operator = matches[1] == '!' ? 'blank' : 'present';
			}
			if (/^'%.+%'$/.test(condition.value)) {
				if (condition.operator == '=') {
					condition.operator = '~';
					condition.value = "'" + condition.value.substr(2, value.length - 4) + "'";
				} else if (condition.operator == '!=') {
					condition.operator = '!~';
					condition.value = "'" + condition.value.substr(2, value.length - 4) + "'";
				}
			}
			$.each(conditions, function(c, cond) {
				if (cond.operand == condition.operand &&
					cond.operator == condition.operator && 
					cond.value == condition.value) {
					found = c + 1;
					return false;
				}
			});
			if (found > 0) {
				return found;
			}
			conditions.push({
				'operand': condition.operand,
				'operator':  condition.operator,
				'value': condition.value,
				'datatype': condition.datatype
			});
			return conditions.length;
		},

		parseWhere: function(where, table){
			var self = this;
			var columns = table ? this.tables[table.toLowerCase()].columns : {};
			var parser = new ExpressionParser();
			where = where.replace(/([\w\.]+)\s+between\s+([^\s]+)\s+and\s+([^\s\(\)]+)/ig, "$1 >= $2 and $1 <= $3");
			where = where.replace(/([\w\.]+)\s+not\s+like\s+([^\s\(\)]+)/ig, "$1 != $2");
			where = where.replace(/([\w\.]+)\s+like\s+([^\s\(\)]+)/ig, "$1 = $2");
			where = where.replace(/([\w\.]+)\s+is\s+not\s+null\b/ig, "defined($1)");
			where = where.replace(/([\w\.]+)\s+is\s+null\b/ig, "!defined($1)");
			var expr = where.replace(/ and /ig, ' && ').replace(/ or /ig, ' || ');
			expr = parser.parse(expr);
			var tokens = expr.get();
			var conditions = [];
			var expression = [];
			var npar = 0;
			var condition = {
				'operand': '',
				'operator': '',
				'value': '',
				'datatype': '',
				'inoperand': false,
				'invalue': false,
				'infunction': false
			};
			$.each(tokens, function(t, token) {
				if (condition.infunction) {
					if (token.type == Token.TYPE.T_POPEN) {
						npar++;
					} else if (token.type == Token.TYPE.T_PCLOSE) {
						npar--;
						if (npar == 0) {
							condition.infunction = false;
						}
					}
					if (columns.hasOwnProperty(token.toString().toLowerCase())) {
						token.value = token.toString().toLowerCase();
					}
					self.addTokenInCondition(condition, token);
				} else if (token.type == Token.TYPE.T_FUNCTION) {
					condition.infunction = true;
					self.addTokenInCondition(condition, token);
				} else if (token.isComparator()) {
					condition.operator = token.value;
					condition.inoperand = false;
					condition.invalue = true;
				} else if (token.type == Token.TYPE.T_POPEN) {
					if (condition.inoperand) {
						condition.operand += token.value;
						condition.infunction = true;
						npar = 1;
					} else if (condition.invalue) {
						condition.value += token.value;
						condition.infunction = true;
						npar = 1;
					} else {
						expression.push(token.value);
					}
				} else if (token.type == Token.TYPE.T_PCLOSE) {
					if (condition.inoperand || condition.invalue) {
						expression.push(self.insertCondition(conditions, condition));
					}
					expression.push(token.value);
					self.resetCondition(condition);
				} else if (token.type == Token.TYPE.T_LOGICAL_AND || token.type == Token.TYPE.T_LOGICAL_OR) {
					if (condition.inoperand || condition.invalue) {
						expression.push(self.insertCondition(conditions, condition));
					}
					expression.push(token.type == Token.TYPE.T_LOGICAL_AND ? 'and' : 'or');
					self.resetCondition(condition);
				} else {
					if (columns.hasOwnProperty(token.toString().toLowerCase())) {
						token.value = token.toString().toLowerCase();
					}
					self.addTokenInCondition(condition, token);
				}
			});
			if (condition.inoperand || condition.invalue) {
				expression.push(self.insertCondition(conditions, condition));
			}
			return {
				'conditions': conditions,
				'expression': expression
			};
		},

		splitKeywords: function(stmt, keywords){
			var clauses = {};
			var positions = {};
			var re = new RegExp("\\b(" + keywords.join("|") + ")\\b", "i");
			var chunks = stmt.split(re).filter(function(el) {return el && el.length != 0});
			if (chunks.length % 2 > 0) {
				throw new SQLSelectTokenizerException("syntax error near : " + stmt);
			}
			for (var i = 0; i < chunks.length; i += 2) {
				var keyword = chunks[i].replace(/\s+/g, '').toLowerCase();
				var value = $.trim(chunks[i + 1]);
				if (clauses[keyword]) {
					if ($.isArray(clauses[keyword])) {
						clauses[keyword].push(value);
					} else {
						clauses[keyword] = array(clauses[keyword], value);
					}
				} else {
					clauses[keyword] = value;
				}
				positions[keyword] = i;
			}
			$.each (keywords, function(i, keyword) {
				if (i > 0 && positions[keyword] && positions[keywords[i -1]] && positions[keyword] < positions[keywords[i -1]]) {
					throw new SQLSelectTokenizerException("syntax error near : " + keyword + ' ' + clauses[keyword]);
				}
			});
			return clauses;
		},

		splitList: function(list){
			var chunks = list.split(/([,'\(\)])/i).filter(function(el) {return el && el.length != 0});
			var items = [];
			var i = 0;
			var l = chunks.length;
			var token = "";
			while (i < l) {
				var chunk = chunks[i];
				switch (chunk) {
					case "'":
						token += chunk;
						i++;
						while (i < l && chunks[i] != "'") {
							token += chunks[i];
							i++;
						}
						token += "'";
						break;
					case "(":
						token += chunk;
						i++;
						var depth = 0;
						while (i < l) {
							if (chunks[i] == ")") {
								if (depth == 0) {
									break;
								} else {
									depth--;
								}
							}
							if (chunks[i] == "(") {
								depth++;
							}
							token += chunks[i];
							i++;
						}
						token += ")";
						break;
					case ",":
						if (token != '') {
							items.push($.trim(token));
							token = "";
						}
						break;
					default:
						token += chunk;
				}
				i++;
			}
			if (token != '') {
				items.push($.trim(token));
			}
			return items;
		},

		parseSelect: function(sql){
			var self = this;
			var clauses = self.splitKeywords(sql, ["select", "distinct", "all", "from", "where", "group\\s+by", "having", "order\\s+by", "limit", "offset"]);
			if (clauses['distinct'] && clauses['all']) {
				throw new SQLSelectTokenizerException("syntax error : distinct and all keywords are mutually exclusive");
			}
			if (! clauses['from']) {
				throw new SQLSelectTokenizerException("syntax error : missing from clause");
			}
			var distinct = false;
			if (clauses['distinct']) {
				if (clauses['select'] != '') {
					throw new SQLSelectTokenizerException("syntax error near distinct");
				}
				clauses['select'] = clauses['distinct'];
				distinct = true;
			}
			if (clauses['all']) {
				if (clauses['select'] != '') {
					throw new SQLSelectTokenizerException("syntax error near all");
				}
				clauses['select'] = clauses['all'];
			}
			var fromclauses = self.splitKeywords("from " + clauses['from'], ["from", "cross\\s+join", "inner\\s+join", "left\\s+(outer\\s+)?join", "right\\s+(outer\\s+)?join", "full\\s+(outer\\s+)?join", "join"]);
			if (fromclauses['join']) {
				fromclauses['innerjoin'] = fromclauses['join'];
			}
			if (fromclauses['leftouterjoin']) {
				fromclauses['leftjoin'] = fromclauses['leftouterjoin'];
			}
			if (fromclauses['rightouterjoin']) {
				fromclauses['rightjoin'] = fromclauses['rightouterjoin'];
			}
			if (fromclauses['fullouterjoin'] || fromclauses['fulljoin']) {
					throw new SQLSelectTokenizerException("full outer join isn't currently supported");
			}
			var ops = {
				'statement': 'select',
				'select':    self.splitList(clauses['select']),
				'distinct':  distinct,
				'from':      self.splitList(fromclauses['from']),
				'where':     !clauses['where'] ? "true" : clauses['where'],
				'groupby':   !clauses['groupby'] ? [] : self.splitList(clauses['groupby']),
				'having':    !clauses['having'] ? "true" : clauses['having'],
				'orderby':   !clauses['orderby'] ? [] : self.splitList(clauses['orderby']),
				'limit':     !clauses['limit'] ? [] : clauses['limit'].replace(/\s+/, '').split(','),
				'offset':    !clauses['offset'] ? 0 : parseInt($.trim(clauses['offset']), 10) - 1
			};
			delete fromclauses['from'];
			var request = $.extend({ 'select':  ['*'], 'distinct':  false, 'from':  ['json'], 'where':  "true", 'groupby':  [], 'having':  "true", 'orderby':  [], 'limit':  [] }, ops);
			var tables = [];
			$.each (request.from, function(f, from) {
				var matches, table, alias;
				if (matches = from.match(/^([^\s]+)\s+as\s+([^\s]+)/i)) {
					table = matches[1].replace(/^`/, '').replace(/`/, '');
					alias = matches[2];
				} else if (matches = from.match(/^([^\s]+)\s+(\w+)/i)) {
					table = matches[1].replace(/^`/, '').replace(/`/, '');
					alias = matches[2];
				} else if (/^`?\w+`?/.test(from)) {
					table = alias = from.replace(/^`/, '').replace(/`/, '');
				} else {
					throw new SQLSelectTokenizerException("syntax error near : " + from);
				}
				tables.push({
					'table': table,
					'alias': alias,
					'join' : SQLSelectTokenizer.JOIN.CROSS,
					'on'   : 'true'
				});
			});
			$.each(fromclauses, function(join, jclause) {
				var jclauses = $.isArray(jclause) ? jclause : [jclause];
				$.each(jclauses, function(c, clause) {
					var joinclauses = self.splitKeywords("from " . clause, ["from", "as", "on"]);
					if (join == 'crossjoin') {
						if (joinclauses['on']) {
							throw new SQLSelectTokenizerException("syntax error near : on " + joinclauses['on']);
						}
						tables.push({
							'table': joinclauses['from'].replace(/^`/, '').replace(/`/, ''),
							'alias': joinclauses['as'] ? joinclauses['as'] : joinclauses['from'],
							'join' : SQLSelectTokenizer.JOIN.CROSS,
							'on'   : 'true'
						});
					} else if (join == 'innerjoin') {
						if (!joinclauses['on']) {
							throw new SQLSelectTokenizerException("syntax error : missing 'on' clause for inner join");
						}
						tables.push({
							'table': joinclauses['from'].replace(/^`/, '').replace(/`/, ''),
							'alias': joinclauses['as'] ? joinclauses['as'] : joinclauses['from'],
							'join' : SQLSelectTokenizer.JOIN.INNER,
							'on'   : joinclauses['on']
						});
					} else if (join == 'leftjoin') {
						if (!joinclauses['on']) {
							throw new SQLSelectTokenizerException("syntax error : missing 'on' clause for left join");
						}
						table.push({
							'table': joinclauses['from'].replace(/^`/, '').replace(/`/, ''),
							'alias': joinclauses['as'] ? joinclauses['as'] : joinclauses['from'],
							'join' : SQLSelectTokenizer.JOIN.LEFT,
							'on'   : joinclauses['on']
						});
					} else if (join == 'rightjoin') {
						if (!joinclauses['on']) {
							throw new SQLSelectTokenizerException("syntax error : missing 'on' clause for right join");
						}
						tables.push({
							'table': joinclauses['from'].replace(/^`/, '').replace(/`/, ''),
							'alias': joinclauses['as'] ? joinclauses['as'] : joinclauses['from'],
							'join' : SQLSelectTokenizer.JOIN.RIGHT,
							'on'   : joinclauses['on']
						});
					}
				});
			});
			request.from = tables;
			request.columns = [];
			$.each(request.from, function(f, from) {
				$.each(self.tables[from.table.toLowerCase()]['columns'], function(name, column) {
					request.columns.push(name.toLowerCase());
					request.columns.push(from.alias.toLowerCase() + "." + name.toLowerCase());
				});
			});
			var selectList = {};
			var columnsAliases = {};
			$.each(request.select, function(f, field) {
				var matches, column, alias;
				if (matches = field.match(/^(.+)\s+as\s+([^\s]+)/i)) {
					column = matches[1];
					alias = matches[2];
				} else {
					column = alias = field;
				}
				column = self.parseExpression(column);
				selectList[column] = alias;
				columnsAliases[alias] = column;
			});
			request.select = [];
			$.each(selectList, function(column, alias) {
				if ($.inArray(column.toLowerCase(), request.columns) >= 0) {
					column = column.toLowerCase();
				}
				request.select.push({
					'column':  column,
					'alias':  alias
				});
			});
			request.where = self.parseConditions(request.where);
			request.having = self.parseConditions(request.having);
			$.each(request.from, function(f, from) {
				request.from[f].on = self.parseConditions(from.on);
			});
			var sortkeys = {};
			$.each(request.orderby, function(s, sortkey) {
				var matches, key, order;
				if (matches = sortkey.match(/^(.+)\s+(asc|desc)/i)) {
					key = matches[1];
					order = matches[2].toLowerCase();
				} else {
					key = sortkey;
					order = "asc";
				}
				if (/^\d+$/.test(key)) {
					key = Object.keys(selectList)[parseInt(key, 10) - 1];
				} else if (columnsAliases[key]) {
					key = columnsAliases[key];
				}
				sortkeys[key] = order;
			});
			if (distinct) {
				if ($(Object.keys(sortkeys)).not(Object.keys(columnsAliases)).length > 0) {
					throw new SQLSelectTokenizerException("The columns in the ORDER BY list must be a subset of the columns in the SELECT list");
				}
				$.each(selectList, function(field, alias) {
					if (!sortkeys[alias]) {
						sortkeys[alias] = "asc";
					}
				});
			}
			request.orderby = [];
			$.each (sortkeys, function(key, order) {
				if ($.inArray(key.toLowerCase(), request.columns) >= 0) {
					key = key.toLowerCase();
				}
				request.orderby.push({
					'key': key,
					'order': order
				});
			});
			$.each (request.groupby, function(k, key) {
				if (/^\d+$/.test(key)) {
					request.groupby[k] = Object.keys(selectList)[parseInt(key, 10) - 1];
				} else if (columnsAliases[key]) {
					request.groupby[k] = columnsAliases[key];
				}
			});
			if (request.limit.length == 0) {
				request.limit = 0;
				request.offset = 0;
			} else if (request.limit.length == 1) {
				request.limit = parseInt(request.limit[0], 10);
			} else if (request.limit.length > 1) {
				request.limit = parseInt(request.limit[1], 10);
				if (!clauses['offset']) {
					request.offset = parseInt(request.limit[0], 10);
				}
			}
			if (request.where != '') {
				request.conditions = self.parseWhere(request.where);
			}
			return request;
		},

		parseSetOperations: function(sql){
			var re = new RegExp("\\b((union|union\\s+all|intersect|except|minus)\\s+select)\\b", "i");
			var usql = "union all " + sql;
			var chunks = usql.split(re).filter(function(el) {return el && el.length != 0});
			var chunksCount = chunks.length;
			if (chunksCount % 2 > 0) {
				throw new SQLSelectTokenizerException("syntax error near : " + sql);
			}
			if (chunksCount == 2) {
				return this.parseSelect(sql);
			}
			var request = {
				'statement':  'compound select',
				'selects':  []
			};
			for (i = 0; i < chunksCount; i += 2) {
				var operator = chunks[i].toLowerCase().replace(/\s+/, '').replace(/select/, '');
				var req =  this.parseSelect('select ' + $.trim(chunks[i+1]));
				if (i < chunksCount - 2) {
					if (req.orderby.length > 0) {
						throw new SQLSelectTokenizerException("only the last SELECT may have an ORDER BY clause");
					}
					if (req.limit > 0 || req.offset > 0) {
						throw new SQLSelectTokenizerException("only the last SELECT may have a LIMIT clause");
					}
				}
				request.selects.push({
					'operator':  operator,
					'request':  req
				});
			}
			return request;
		},

	};

	global.SQLSelectTokenizer = SQLSelectTokenizer;

}(this));


(function (global) {
	"use strict";

	function SQLSelectTokenizerException(message, code, previous) {
		this.message = message;
		this.code = code || 0;
		this.previous = previous || null;
	};

	SQLSelectTokenizerException.prototype = {
		toString: function(){
			return "SQLSelectTokenizerException: [" + this.code + "]: " + this.message + "\n";
		}
	};

	global.SQLSelectTokenizerException = SQLSelectTokenizerException;

}(this));
