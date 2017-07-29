<?php
/**
The MIT License (MIT)

Copyright (c) 2016 Jacques Archimède

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

namespace EUREKA\G6KBundle\Manager;

/**
 * @package EUREKA\G6KBundle\Entity
 * @version 1.0
 * @author Jacques Archimède
 */
class SQLSelectTokenizer  {

	/**
	 * Types of JOINS :
	 * CROSS_JOIN: Returns the Cartesian product of the sets of rows from the joined tables
	 * @const integer
	 */
	const CROSS_JOIN = 0;

	/**
	 * INNER_JOIN: Returns all rows when there is at least one match in BOTH tables
	 * 
	 * @const integer
	 */
	const INNER_JOIN = 1;

	/**
	 * LEFT_JOIN: Return all rows from the left table, and the matched rows from the right table
	 * 
	 * @const integer
	 */
	const LEFT_JOIN = 2;

	/**
	 * RIGHT_JOIN: Return all rows from the right table, and the matched rows from the left table
	 * 
	 * @const integer
	 */
	const RIGHT_JOIN = 3;

	/**
	 * Conversion table of SQL functions in PHP functions
	 *
	 * @var array
	 * @access private
	 */
	private $synonyms = array(
		'power' => 'pow',
		'random' => 'rand',
	);

	/**
	 * Allowed PHP functions in conditions
	 *
	 * @var array
	 * @access private
	 */
	private $allowed = array(
		"abs" => 1,
		"acos" => 1,
		"adddate" => 2,
		"ascii" => 1,
		"asin" => 1,
		"atan" => 1,
		"atan2" => 1, 
		"cbrt" => 1,
		"ceil" => 1,
		"ceiling" => 1,
		"char_length" => 1,
		"char" => 1,
		"character_length" => 1,
		"cos" => 1,
		"cot" => 1,
		"date_format" => 2,
		"date_part" => 2,
		"date_trunc" => 2,
		"datediff" => 2,
		"dayname" => 1,
		"dayofmonth" => 1,
		"dayofweek" => 1,
		"dayofyear" => 1,
		"degrees" => 1,
		"elt" => 1,
		"exp" => 1,
		"floor" => 1,
		"format" => 2,
		"from_days" => 1,
		"ifnull " => 2,
		"initcap" => 1,
		"insert" => 4,
		"instr" => 2,
		"last_day" => 1,
		"left" => 2,
		"length " => 1,
		"like " => 2,
		"ln" => 1,
		"ln" => 1,
		"locate" => 3,
		"log" => 1,
		"log10" => 1,
		"log2" => 1,
		"lower" => 1,
		"lpad" => 3,
		"ltrim" => 2,
		"makedate" => 3,
		"max " => -1,
		"mid" => 3,
		"min" => -1,
		"mod" => 2,
		"month" => 1,
		"monthname" => 1,
		"now" => 0,
		"nullif" => 2,
		"position" => 3,
		"power" => 2,
		"quarter" => 1,
		"quote " => 1,
		"quote" => 1,
		"radians" => 1,
		"rand" => 1,
		"random" => 0,
		"repeat" => 2,
		"replace" => 3,
		"reverse" => 1,
		"right" => 2,
		"round " => 2,
		"rpad" => 3,
		"rpad" => 3,
		"rtrim " => 1,
		"sin" => 1,
		"soundex " => 1,
		"space" => 1,
		"split_part" => 3,
		"sqrt" => 1,
		"str_to_date" => 1,
		"strcmp" => 1,
		"strftime" => 2,
		"strpos" => 2,
		"subdate" => 2,
		"substr" => 3,
		"substring_index" => 3,
		"substring" => 3,
		"tan" => 1,
		"to_days" => 1,
		"translate" => 3,
		"trim" => 1,
		"trunc" => 2,
		"truncate" => 2,
		"upper" => 1,
		"week" => 2,
		"weekday" => 1,
		"weekofyear" => 1,
		"year" => 1,
		"yearweek" => 2,
		'count' => 1,
		'sum' => 1,
		'avg' => 1
	);

	private $tables = null;

	public function __construct($tables = null) {
		$this->setTables($tables);
	}

	public function setTables($tables) {
		$this->tables = $tables;
	}

	/**
	 * Replaces into an expression, the SQL functions by their PHP equivalents
	 *
	 * @access private
	 * @param string $expr the SQL expression
	 * @return string the new expression with PHP functions.
	 */
	private function replaceSynonyms($expr) {
		return preg_replace_callback(
			'/(\W*)('.implode('|', array_keys($this->synonyms)).'|'.implode('|', array_values($this->synonyms)).')\s*\(/i', 
			function ($matches) {
				$func = strtolower($matches[2]);
				return isset($this->synonyms[$func]) ? $matches[1].$this->synonyms[$func].'(' : $matches[1].$func.'(';
			}, 
			$expr
		);
	}

	/**
	 * Verifies that an php expression is sufficiently secured 
	 * before being evaluated by the eval function
	 *
	 * @access public
	 * @param string $expression php expression to check
	 * @return void
	 * @throws SQLSelectTokenizerException
	 */
	public function checkSafety($expression) {
		if (preg_match('/\b(\w+)\s*\(/', $expression, $m)) {
			if (!in_array($m[1], array_keys($this->allowed)) && ! strcasecmp($m[1], 'and')  && ! strcasecmp($m[1], 'or')) {
				// A not allowed function is found
				throw new SQLSelectTokenizerException("syntax error near : ".$m[1]);
			}
		}
		if (strpos($expression, chr(10))) {
			// newline is forbidden
			throw new SQLSelectTokenizerException("syntax error");
		}
		if (preg_match('/[`\{\}\[\]\;]/', $expression, $m)) {
			// metacharacters are forbidden
			throw new SQLSelectTokenizerException("syntax error near : ".$m[1]);
		}
		if (preg_match('/\$\$([^\s]+)/', $expression, $m)) {
			// $$ is forbidden
			throw new SQLSelectTokenizerException("syntax error near : ".$m[1]);
		}
	}

	/**
	 * Checks if a string contains an expression.
	 *
	 * @access protected
	 * @param string $string the string to check
	 * @return bool TRUE if the string contains an expression, and FALSE if not.
	 */
	protected function isExpression($string) {
		if (preg_match("/^\d{4}\-\d{1,2}\-\d{1,2}( \d{1,2}\:\d{1,2}:\d{1,2})?$/", $string)) { // date
			return false;
		}
		return preg_match('/[\(\+\-\/\*\%]/', $string);
	}

	/**
	 * Parses and converts a sql expression into a php one
	 *
	 * @access protected
	 * @param string $expression the expression to parse
	 * @return string the parsed expression
	 */
	protected function parseExpression($expression) {
		$expression = str_replace(
			array('{',     '}',     '[',      ']',    '`',    ';'),
			array('&#123', '&#125', '&#91',   '&#93', '&#96', '&#59'),
			$expression
		);
		if ($this->isExpression($expression)) {
			$this->checkSafety($expression);
		}
		return $expression;
	}

	/**
	 * Parses and converts sql conditions into a php one
	 *
	 * @access protected
	 * @param string $conditions the conditions to parse
	 * @return string the converted conditions
	 */
	protected function parseConditions($conditions) {
		$conditions = preg_replace("/([\w\.]+)\s+between\s+([^\s]+)\s+and\s+([^\s\(\)]+)/i", "$1 >= $2 and $1 <= $3", $conditions);
		$conditions = str_replace(
			array('{',     '}',     '[',     ']',     '`',    ';'),
			array('&#123', '&#125', '&#91',   '&#93', '&#96', '&#59'),
			$conditions
		);
		$this->checkSafety($conditions);
		return $conditions;
	}

	protected function addTokenInCondition(&$condition, $token) {
		if ($token->isBinaryOperator() && $token->type != Token::T_MOD) {
			$value = ' ' . $token->value . ' ';
		} else if ($token->type == Token::T_TEXT) {
			$value = "'" . $token->value . "'";
		} else {
			$value = $token->value;
		}
		if ($condition->inoperand) {
			$condition->operand .= $value;
		} else if ($condition->invalue) {
			$condition->value .= $value;
		} else {
			$condition->operand .= $value;
			$condition->inoperand = true;
		}
	}

	protected function resetCondition(&$condition) {
		$condition->operand = '';
		$condition->operator = '';
		$condition->value = '';
		$condition->inoperand = false;
		$condition->invalue = false;
		$condition->infunction = false;
	}

	protected function insertCondition(&$conditions, $condition) {
		foreach ($conditions as $c => $cond) {
			if ($cond->operand == $condition->operand &&
				$cond->operator == $condition->operator && 
				$cond->value == $condition->value) {
				return $c + 1;
			}
		}
		$conditions[] = (object)array(
			'operand' => $condition->operand,
			'operator' =>  $condition->operator,
			'value' => $condition->value
		);
		return count($conditions);
	}

	protected function parseWhere($where) {
		$parser = new ExpressionParser();
		$expr = str_replace(array(' and ', ' AND ', ' or ', ' OR '), array(' && ', ' && ', ' || ', ' || '), $where);
		$expr = $parser->parse($expr);
		$tokens = $expr->get();
		$conditions = array();
		$expression = array();
		$npar = 0;
		$condition = (object)array(
			'operand' => '',
			'operator' => '',
			'value' => '',
			'inoperand' => false,
			'invalue' => false,
			'infunction' => false
		);
		foreach ($tokens as $token) {
			if ($condition->infunction) {
				if ($token->type == Token::T_POPEN) {
					$npar++;
				} else if ($token->type == Token::T_PCLOSE) {
					$npar--;
					if ($npar == 0) {
						$condition->infunction = false;
					}
				}
				$this->addTokenInCondition($condition, $token);
			} else if ($token->type == Token::T_FUNCTION) {
				$condition->infunction = true;
				$this->addTokenInCondition($condition, $token);
			} else if ($token->isComparator()) {
				$condition->operator = $token->value;
				$condition->inoperand = false;
				$condition->invalue = true;
			} else if ($token->type == Token::T_POPEN) {
				if ($condition->inoperand) {
					$condition->operand .= $token->value;
					$condition->infunction = true;
					$npar = 1;
				} else if ($condition->invalue) {
					$condition->value .= $token->value;
					$condition->infunction = true;
					$npar = 1;
				} else {
					$expression[] = $token->value;
				}
			} else if ($token->type == Token::T_PCLOSE) {
				if ($condition->inoperand || $condition->invalue) {
					$expression[] = $this->insertCondition($conditions, $condition);
				}
				$expression[] = $token->value;
				$this->resetCondition($condition);
			} else if ($token->type == Token::T_LOGICAL_AND || $token->type == Token::T_LOGICAL_OR) {
				if ($condition->inoperand || $condition->invalue) {
					$expression[] = $this->insertCondition($conditions, $condition);
				}
				$expression[] = $token->type == Token::T_LOGICAL_AND ? 'and' : 'or';
				$this->resetCondition($condition);
			} else {
				$this->addTokenInCondition($condition, $token);
			}
		}
		if ($condition->inoperand || $condition->invalue) {
			$expression[] = $this->insertCondition($conditions, $condition);
		}
		return (object)array(
			'conditions' => $conditions,
			'expression' => $expression
		);
	}

	/**
	 * Splits a SQL statement into keywords/clauses
	 *
	 * @access private
	 * @param string $stmt SQL statement
	 * @param array $keywords the list of keywords
	 * @return array the list of keywords associated with their clauses.
	 * @throws SQLSelectTokenizerException
	 */
	private function splitKeywords($stmt, $keywords) {
		$clauses = array();
		$positions = array();
		$chunks = preg_split("/\b(" . implode("|", $keywords) . ")\b/i", $stmt, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY | PREG_SPLIT_OFFSET_CAPTURE);
		$chunksCount = count($chunks);
		if ($chunksCount % 2 > 0) {
			throw new SQLSelectTokenizerException("syntax error near : " . $stmt);
		}
		for ($i = 0; $i < $chunksCount; $i += 2) {
			$keyword = strtolower(preg_replace('/\s+/', '', $chunks[$i][0]));
			$value = trim($chunks[$i+1][0]);
			if (isset($clauses[$keyword])) {
				if (is_array($clauses[$keyword])) {
					array_push($clauses[$keyword], $value);
				} else {
					$clauses[$keyword] = array($clauses[$keyword], $value);
				}
			} else {
				$clauses[$keyword] = $value;
			}
			$positions[$keyword] = $chunks[$i][1];
		}
		foreach ($keywords as $i => $keyword) {
			if ($i > 0 && isset($positions[$keyword]) && isset($positions[$keywords[$i -1]]) && $positions[$keyword] < $positions[$keywords[$i -1]]) {
				throw new SQLSelectTokenizerException("syntax error near : " . $keyword . ' ' . $clauses[$keyword]);
			}
		}
		return $clauses;
	}

	/**
	 * Tokenizes a list of comma separated terms excluding function arguments
	 *
	 * @access private
	 * @param string $list the list of comma separated terms
	 * @return array the array of terms.
	 */
	private function splitList($list) {
		if (!preg_match('/[\(\)]/', $list)) { // no parenthesis
			return array_map(function ($i) { return trim($i); }, str_getcsv($list, ",", "'"));
		}
		$chunks = preg_split("/([,'\(\)])/i", $list, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
		$items = array();
		$i = 0;
		$l = count($chunks);
		$token = "";
		while ($i < $l) {
			$chunk = $chunks[$i];
			switch ($chunk) {
				case "'":
					$token .= $chunk;
					$i++;
					while ($i < $l && $chunks[$i] != "'") {
						$token .= $chunks[$i];
						$i++;
					}
					$token .= "'";
					break;
				case "(":
					$token .= $chunk;
					$i++;
					$depth = 0;
					while ($i < $l) {
						if ($chunks[$i] == ")") {
							if ($depth == 0) {
								break;
							} else {
								$depth--;
							}
						}
						if ($chunks[$i] == "(") {
							$depth++;
						}
						$token .= $chunks[$i];
						$i++;
					}
					$token .= ")";
					break;
				case ",":
					if ($token != '') {
						$items[] = trim($token);
						$token = "";
					}
					break;
				default:
					$token .= $chunk;
			}
			$i++;
		}
		if ($token != '') {
			$items[] = trim($token);
		}
		return $items;
	}

	/**
	 * Parses a sql select request according to this BNF syntax :
	 *
	 *	SELECT [ ALL | DISTINCT ] ( expression [ AS alias ] | * | table_name.* ) {',' ( expression [ AS alias ]  | * | table_name.* ) }
	 *	FROM table_name [ AS alias ] {',' table_name [ AS alias ]} { [ CROSS | INNER | LEFT [OUTER] | RIGHT [OUTER] ] JOIN table_name [ AS alias ] [ ON condition ] }
	 *	[ WHERE condition ]
	 *	[ GROUP BY expression {',' expression} ]
	 *	[ HAVING condition ]
	 *	[ ORDER BY expression [ ASC | DESC ] {',' expression [ ASC | DESC ]} ]
	 *	[LIMIT {[offset,] row_count | row_count OFFSET offset}]
	 *
	 * or eBNF syntax :
	 *
	 *	'SELECT' ( 'ALL' | 'DISTINCT' ) ? ( expression ( 'AS' ? alias ) ? | '*' | table_name '.*' ) ( ',' ( expression ( 'AS' ? alias ) ? | '*' | table_name '.*' ) ) * 
	 *	'FROM' table_name ( 'AS' ? alias ) ? ( ',' table_name ( 'AS' ? alias ) ? ) * ( ( ( 'CROSS' | 'INNER' | 'LEFT' ( 'OUTER' ) ? | 'RIGHT' ( 'OUTER' ) ? ) ? 'JOIN' table_name ( 'AS' ? alias ) ? ( 'ON' condition ) ? ) ) * 
	 *	( 'WHERE' condition ) ? 
	 *	( 'GROUP BY' expression ( ',' expression ) * ( 'HAVING' condition ) ? ) ? 
	 *	( 'ORDER BY' expression ( 'ASC' | 'DESC' ) ? ( ',' expression ( 'ASC' | 'DESC' ) ? ) * ) ? 
	 *	( 'LIMIT' ( ( offset ',' ) ? row_count | row_count 'OFFSET' offset ) ) ? 
	 *
	 * @access protected
	 * @param string $sql the select statement
	 * @return array the parsed request
	 * @throws SQLSelectTokenizerException
	 */
	public function parseSelect($sql) {
		$clauses = $this->splitKeywords($sql, array("select", "distinct", "all", "from", "where", "group\s+by", "having", "order\s+by", "limit", "offset"));
		if (isset($clauses['distinct']) && isset($clauses['all'])) {
			throw new SQLSelectTokenizerException("syntax error : distinct and all keywords are mutually exclusive");
		}
		if (!isset($clauses['from'])) {
			throw new SQLSelectTokenizerException("syntax error : missing from clause");
		}
		$distinct = false;
		if (isset($clauses['distinct'])) {
			if ($clauses['select'] != '') {
				throw new SQLSelectTokenizerException("syntax error near distinct");
			}
			$clauses['select'] = $clauses['distinct'];
			$distinct = true;
		}
		if (isset($clauses['all'])) {
			if ($clauses['select'] != '') {
				throw new SQLSelectTokenizerException("syntax error near all");
			}
			$clauses['select'] = $clauses['all'];
		}
		$fromclauses = $this->splitKeywords("fr" . "om " . $clauses['from'], array("from", "cross\s+join", "inner\s+join", "left\s+(outer\s+)?join", "right\s+(outer\s+)?join", "full\s+(outer\s+)?join", "join"));
		if (isset($fromclauses['join'])) {
			$fromclauses['innerjoin'] = $fromclauses['join'];
		}
		if (isset($fromclauses['leftouterjoin'])) {
			$fromclauses['leftjoin'] = $fromclauses['leftouterjoin'];
		}
		if (isset($fromclauses['rightouterjoin'])) {
			$fromclauses['rightjoin'] = $fromclauses['rightouterjoin'];
		}
		if (isset($fromclauses['fullouterjoin']) || isset($fromclauses['fulljoin'])) {
				throw new SQLSelectTokenizerException("full outer join isn't currently supported");
		}
		$ops = array (
			'statement' => 'select',
			'select' => $this->splitList($clauses['select']),
			'distinct' => $distinct,
			'from' => $this->splitList($fromclauses['from']),
			'where' => !isset($clauses['where']) ? "true" : $clauses['where'],
			'groupby' => !isset($clauses['groupby']) ? array() : $this->splitList($clauses['groupby']),
			'having' => !isset($clauses['having']) ? "true" : $clauses['having'],
			'orderby' => !isset($clauses['orderby']) ? array() : $this->splitList($clauses['orderby']),
			'limit' => !isset($clauses['limit']) ? array() : explode(',', preg_replace('/\s+/', '', $clauses['limit'])),
			'offset' => !isset($clauses['offset']) ? 0 : (int)trim($clauses['offset']) - 1
		);
		unset($fromclauses['from']);
		$request = (object)array_merge(array( 'select' => array('*'), 'distinct' => false, 'from' => array('json'), 'where' => "true", 'groupby' => array(), 'having' => "true", 'orderby' => array(), 'limit' => array() ), $ops);
		$tables = array();
		foreach ($request->from as $from) {
			if (preg_match('/^([^\s]+)\s+as\s+([^\s]+)$/i', $from, $matches)) {
				$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $matches[1]);
				$alias = $matches[2];
			} elseif (preg_match('/^([^\s]+)\s+(\w+)$/i', $from, $matches)) {
				$table = preg_replace(array('/^`/', '/`$/'), array('', ''), $matches[1]);
				$alias = $matches[2];
			} elseif (preg_match('/^`?\w+`?$/', $from)) {
				$table = $alias = preg_replace(array('/^`/', '/`$/'), array('', ''), $from);
			} else {
				throw new SQLSelectTokenizerException("syntax error near : " . $from);
			}
			$tables[] = (object)array(
				'table' => $table,
				'alias' => $alias,
				'join'  => self::CROSS_JOIN,
				'on'    => 'true'
			);
		}
		foreach ($fromclauses as $join => $jclause) {
			$jclauses = is_array($jclause) ? $jclause : array($jclause);
			foreach($jclauses as $clause) {
				$joinclauses = $this->splitKeywords("fr" . "om " . $clause, array("from", "as", "on"));
				if ($join == 'crossjoin') {
					if (isset($joinclauses['on'])) {
						throw new SQLSelectTokenizerException("syntax error near : on " . $joinclauses['on']);
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::CROSS_JOIN,
						'on'    => 'true'
					);
				} elseif ($join == 'innerjoin') {
					if (!isset($joinclauses['on'])) {
						throw new SQLSelectTokenizerException("syntax error : missing 'on' clause for inner join");
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::INNER_JOIN,
						'on'    => $joinclauses['on']
					);
				} elseif ($join == 'leftjoin') {
					if (!isset($joinclauses['on'])) {
						throw new SQLSelectTokenizerException("syntax error : missing 'on' clause for left join");
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::LEFT_JOIN,
						'on'    => $joinclauses['on']
					);
				} elseif ($join == 'rightjoin') {
					if (!isset($joinclauses['on'])) {
						throw new SQLSelectTokenizerException("syntax error : missing 'on' clause for right join");
					}
					$tables[] = (object)array(
						'table' => preg_replace(array('/^`/', '/`$/'), array('', ''), $joinclauses['from']),
						'alias' => isset($joinclauses['as']) ? $joinclauses['as'] : $joinclauses['from'],
						'join'  => self::RIGHT_JOIN,
						'on'    => $joinclauses['on']
					);
				}
			}
		}
		$request->from = $tables;
		$request->columns = array();
		foreach($request->from as $from) {
			foreach($this->tables[strtolower($from->table)]['columns'] as $name => $column) {
				$request->columns[] = strtolower($name);
				$request->columns[] = strtolower($from->alias . "." . $name);
			}
		}
		$selectList = array();
		$columnsAliases = array();
		foreach ($request->select as $field) {
			if (preg_match('/^(.+)\s+as\s+([^\s]+)$/i', $field, $matches)) {
				$column = $matches[1];
				$alias = $matches[2];
			} else {
				$column = $alias = $field;
			}
			// $column = preg_replace('/(\s*)count\s*\(\s*\*\s*\)/i', '$1count__all', $column);
			// $column = preg_replace('/(\s*)(count|sum|avg|min|max)\s*\(([^\)]+)\)/i', '$1$2__$3', $column);
			// $column = preg_replace("/(\w+)\.(\w+)/", "$1__$2", $column);
			$column = $this->parseExpression($column);
			$selectList[$column] = $alias;
			$columnsAliases[$alias] = $column;
		}
		$request->select = array();
		foreach ($selectList as $column => $alias) {
			if (in_array(strtolower($column), $request->columns)) {
				$column = strtolower($column);
			}
			$request->select[] = (object)array(
				'column' => $column,
				'alias' => $alias
			);
		}
		$request->where = $this->parseConditions($request->where);
		$request->having = $this->parseConditions($request->having);
		// $request->having = preg_replace('/(\s*)count\s*\(\s*\*\s*\)/i', '$1count__all', $request->having);
		// $request->having = preg_replace('/(\s*)(count|sum|avg|min|max)\s*\(([^\)]+)\)/i', '$1$2__$3', $request->having);
		foreach($request->from as &$from) {
			$from->on = $this->parseConditions($from->on);
		}
		$sortkeys = array();
		foreach ($request->orderby as $sortkey) {
			if (preg_match('/^(.+)\s+(asc|desc)$/i', $sortkey, $matches)) {
				$key = $matches[1];
				$order = strtolower($matches[2]);
			} else {
				$key = $sortkey;
				$order = "asc";
			}
			if (ctype_digit($key)) {
				$key = array_keys($selectList)[(int)$key - 1];
			} elseif (isset($columnsAliases[$key])) {
				$key = $columnsAliases[$key];
			}
			$sortkeys[$key] = $order;
		}
		if ($distinct) {
			if (count(array_diff(array_keys($sortkeys), array_values($selectList))) > 0) {
				throw new SQLSelectTokenizerException("The columns in the ORDER BY list must be a subset of the columns in the SELECT list");
			}
			foreach($selectList as $field => $alias) {
				if (!isset($sortkeys[$alias])) {
					$sortkeys[$alias] = "asc";
				}
			}
		}
		$request->orderby = array();
		foreach ($sortkeys as $key => $order) {
			if (in_array(strtolower($key), $request->columns)) {
				$key = strtolower($key);
			}
			$request->orderby[] = (object)array(
				'key' => $key,
				'order' => $order
			);
		}
		foreach ($request->groupby as &$key) {
			if (ctype_digit($key)) {
				$key = array_keys($selectList)[(int)$key - 1];
			} elseif (isset($columnsAliases[$key])) {
				$key = $columnsAliases[$key];
			}
		}
		if (count($request->limit) == 0) {
			$request->limit = 0;
			$request->offset = 0;
		} elseif (count($request->limit) == 1) {
			$request->limit = (int)$request->limit[0];
		} elseif (count($request->limit) > 1) {
			$request->limit = (int)$request->limit[1];
			if (!isset($clauses['offset'])) {
				$request->offset = (int)$request->limit[0] - 1;
			}
		}

		if ($request->where != '') {
			$request->conditions = $this->parseWhere($request->where);
		}

		return $request;
	}

	/**
	 * Parses a sql compound select request containing set operations according to this BNF syntax :
	 *
	 * select_statement [ UNION | UNION ALL | INTERSECT | EXCEPT | MINUS ] select_statement 
	 * { select_statement [ UNION | UNION ALL | INTERSECT | EXCEPT | MINUS ] select_statement }
	 *
	 * or eBNF syntax :
	 *
	 * select_statement (( 'UNION' | 'UNION ALL' | 'INTERSECT' | 'EXCEPT' | 'MINUS' ) select_statement) * 
	 *
	 * if the statement contains no set operator, just parses the select request
	 *
	 * @access protected
	 * @param string $sql the select statement
	 * @return array the parsed request
	 * @throws SQLSelectTokenizerException
	 */
	public function parseSetOperations($sql) {
		$chunks = preg_split("/\b(union|union\s+all|intersect|except|minus)\s+select\b/i", "union all " . $sql, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);
		$chunksCount = count($chunks);
		if ($chunksCount % 2 > 0) {
			throw new SQLSelectTokenizerException("syntax error near : " . $sql);
		}
		if ($chunksCount == 2) {
			return $this->parseSelect($sql);
		}
		$request = (object)array(
			'statement' => 'compound select',
			'selects' => array()
		);
		for ($i = 0; $i < $chunksCount; $i += 2) {
			$operator = preg_replace(array('/\s+/', '/select$/'), array('', ''), strtolower($chunks[$i]));
			$req =  $this->parseSelect('sel' . 'ect ' . trim($chunks[$i+1]));
			if ($i < $chunksCount - 2) {
				if (count($req->orderby) > 0) {
					throw new SQLSelectTokenizerException("only the last SELECT may have an ORDER BY clause");
				}
				if ($req->limit > 0 || $req->offset > 0) {
					throw new SQLSelectTokenizerException("only the last SELECT may have a LIMIT clause");
				}
			}
			$request->selects[] = (object)array(
				'operator' => $operator,
				'request' => $req
			);
		}
		return $request;
	}

}

/**
 * This class Represents an error raised by SQLSelectTokenizer.
 *
 * @package EUREKA\G6KBundle\Entity
 * @version 1.0
 * @author Jacques Archimède
 */
class SQLSelectTokenizerException extends \Exception {

	/**
	 * Class constructor
	 *
	 * @access public
	 * @param string $message the Exception message to throw. 
	 * @param int $code the Exception code
	 * @param Exception $previous the previous exception used for the exception chaining.
	 */
	public function __construct($message, $code = 0, \Exception $previous = null) {
		parent::__construct($message, $code, $previous);
	}

	/**
	 * Returns the string representation of the exception.
	 *
	 * @access public
	 * @return string the string representation of the exception.
	 */
	public function __toString() {
		return __CLASS__ . ": [{$this->code}]: {$this->message}\n";
	}
}

?>
