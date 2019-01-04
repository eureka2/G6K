<?php

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

namespace App\G6K\Manager\ExpressionParser;

/**
 *
 * This class allows to parse an aritmetic or a logical expression
 *
 * @copyright Jacques Archimède
 *
 */
class Parser {

/**
 * @var string     PATTERN The pattern of all operators symbols
 */
const PATTERN = '/([\s!,\+\-\*\/\^%\(\)\[\]=\<\>\~\&\^\|\?\:°])/u';

	/**
	 * @var array      $lookup Correspondence table between operator symbols and token constants
	 *
	 * @access  protected
	 *
	 */
	protected $lookup = array(
		'+' => Token::T_PLUS,
		'-' => Token::T_MINUS,
		'/' => Token::T_DIV,
		'%' => Token::T_MOD,
		'(' => Token::T_POPEN,
		')' => Token::T_PCLOSE,
		'[' => Token::T_SBOPEN,
		']' => Token::T_SBCLOSE,
		'*' => Token::T_TIMES,
		'!' => Token::T_NOT,
		',' => Token::T_COMMA,
		'=' => Token::T_EQUAL,
		'<' => Token::T_LESS_THAN,
		'>' => Token::T_GREATER_THAN,
		'~' => Token::T_CONTAINS,
		'&' => Token::T_BITWISE_AND,
		'^' => Token::T_BITWISE_XOR,
		'|' => Token::T_BITWISE_OR,
		'?' => Token::T_TERNARY,
		':' => Token::T_TERNARY_ELSE,
		'°' => Token::T_DEGRE
	);

	private $text = array();

	private function replaceText($matches) {
		$this->text[] = substr($matches[0], 1, strlen($matches[0]) - 2);
		return "¤".count($this->text);
	}

	/**
	 * Parses and converts an infixed aritmetic or logical expression string into an Expression object.
	 *
	 * @access  public
	 * @param   string $infix The infixed expression string
	 * @return  \App\G6K\Manager\ExpressionParser\Expression The Expression object
	 * @throws \Exception if an error has occurred
	 *
	 */
	public function parse ($infix) {
		$constants = array(
			'pi'	=> new Token(Token::T_NUMBER, M_PI),
			'now'	=> new Token(Token::T_DATE, new \DateTime()),
			'today'	=> new Token(Token::T_DATE, new \DateTime()),
			'true'	=> new Token(Token::T_BOOLEAN, true),
			'false'	=> new Token(Token::T_BOOLEAN, false)
		);
		$expr = new Expression();
		$infix = preg_replace_callback(
			array("|'[^']*'|", '|"[^"]*"|'),
			array($this, 'replaceText'),
			$infix
		);
		$infix = $this->maskDate($infix);
		$toks = preg_split(self::PATTERN, $infix, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_DELIM_CAPTURE);
		$prev = new Token(Token::T_NOOP, 'noop');
		foreach ($toks as $value) {
			$value = trim($value);
			if (is_numeric($value)) {
				if ($prev->type === Token::T_PCLOSE)
					$expr->push(new Token(Token::T_TIMES, '*'));
				$expr->push($prev = new Token(Token::T_NUMBER, (float) $value));
			} else if (preg_match("/^#\d+$/", $value)) {
				if ($prev->type === Token::T_PCLOSE)
					$expr->push(new Token(Token::T_TIMES, '*'));
				$expr->push($prev = new Token(Token::T_FIELD, (int)substr($value, 1)));
			} else if (preg_match("/^¤(\d+)$/", $value, $matches)) {
				if ($prev->type === Token::T_PCLOSE)
					$expr->push(new Token(Token::T_TIMES, '*'));
				$i = (int)$matches[1];
				$expr->push($prev = new Token(Token::T_TEXT, $this->text[$i - 1]));
			} else if (preg_match("/^D(\d{1,2})\.(\d{1,2})\.(\d{4})$/", $value, $matches)) {
				if ($prev->type === Token::T_PCLOSE)
					$expr->push(new Token(Token::T_TIMES, '*'));
				$date = \DateTime::createFromFormat("j/n/Y", $matches[1]."/".$matches[2]."/".$matches[3], DateFunction::$timezone);
				$error = \DateTime::getLastErrors();
				if ($error['error_count'] > 0) {
					throw new \Exception($error['errors'][0]);
				}
				$date->setTime(0, 0, 0);
				$expr->push($prev = new Token(Token::T_DATE, $date));
			} elseif (isset($constants[$value])) {
				if ($prev->type === Token::T_PCLOSE)
					$expr->push(new Token(Token::T_TIMES, '*'));
				$expr->push($prev = clone $constants[$value]);
			} else if ($value != "") {
				switch ($type = isset($this->lookup[$value]) ? $this->lookup[$value] : Token::T_IDENT) {
					case Token::T_EQUAL:
						switch ($prev->type) {
							case Token::T_NOT:
								$expr->pop();
								$type = Token::T_NOT_EQUAL;
								$value = "!=";
								break;
							case Token::T_LESS_THAN:
								$expr->pop();
								$type = Token::T_LESS_OR_EQUAL;
								$value = "<=";
								break;
							case Token::T_GREATER_THAN:
								$expr->pop();
								$type = Token::T_GREATER_OR_EQUAL;
								$value = ">=";
								break;
						}
						break;
					case Token::T_CONTAINS:
						if ($prev->type == Token::T_NOT) {
							$expr->pop();
							$type = Token::T_NOT_CONTAINS;
							$value = "!~";
							break;
						}
					case Token::T_BITWISE_AND:
						if ($prev->type === Token::T_BITWISE_AND) {
							$expr->pop();
							$type = Token::T_LOGICAL_AND;
							$value = "&&";
						}
						break;
					case Token::T_BITWISE_OR:
						if ($prev->type === Token::T_BITWISE_OR) {
							$expr->pop();
							$type = Token::T_LOGICAL_OR;
							$value = "||";
						}
						break;
					case Token::T_TIMES:
						if ($prev->type === Token::T_TIMES) {
							$expr->pop();
							$type = Token::T_POW;
							$value = "**";
						}
						break;
					case Token::T_PLUS:
						if ($prev->isOperator() || $prev->isComparator() || $prev->isBeforeFunctionArgument())
							$type = Token::T_UNARY_PLUS;
						break;

					case Token::T_MINUS:
						if ($prev->isOperator() || $prev->isComparator() || $prev->isBeforeFunctionArgument())
							$type = Token::T_UNARY_MINUS;
						break;

					case Token::T_POPEN:
						switch ($prev->type) {
							case Token::T_IDENT:
								$prev->type = Token::T_FUNCTION;
								break;

							case Token::T_NUMBER:
							case Token::T_DATE:
							case Token::T_BOOLEAN:
							case Token::T_TEXT:
							case Token::T_ARRAY:
							case Token::T_PCLOSE:
								$expr->push(new Token(Token::T_TIMES, '*'));
								break;
						}
						break;

					case Token::T_SBOPEN:
						$t = $expr->pop();
						$expr->push(new Token(Token::T_FUNCTION, 'get'));
						$expr->push(new Token(Token::T_POPEN, '('));
						$expr->push($t);
						$type = Token::T_COMMA;
						$value = ',';
						break;

					case Token::T_SBCLOSE:
						$type = Token::T_PCLOSE;
						$value = '(';
						break;

				}
				$expr->push($prev = new Token($type, $value));
			}
		}
		return $expr;
	}


	private function maskDate($infix) {
		switch(DateFunction::$dateFormat) {
			case 'd/m/Y':
				return preg_replace("/(\d{1,2})\/(\d{1,2})\/(\d{4})/", "D$1.$2.$3", $infix);
			case 'm/d/Y':
				return preg_replace("/(\d{1,2})\/(\d{1,2})\/(\d{4})/", "D$2.$1.$3", $infix);
			case 'd-m-Y':
				return preg_replace("/(\d{1,2})-(\d{1,2})-(\d{4})/", "D$1.$2.$3", $infix);
			case 'm-d-Y':
				return preg_replace("/(\d{1,2})-(\d{1,2})-(\d{4})/", "D$2.$1.$3", $infix);
			case 'd.m.Y':
				return preg_replace("/(\d{1,2})\.(\d{1,2})\.(\d{4})/", "D$1.$2.$3", $infix);
			case 'm.d.Y':
				return preg_replace("/(\d{1,2})\.(\d{1,2})\.(\d{4})/", "D$2.$1.$3", $infix);
			case 'Y-m-d':
				return preg_replace("/(\d{4})-(\d{1,2})-(\d{1,2})/", "D$3.$2.$1", $infix);
			case 'Y.m.d':
				return preg_replace("/(\d{4})\.(\d{1,2})\.(\d{1,2})/", "D$3.$2.$1", $infix);
			case 'Y/m/d':
				return preg_replace("/(\d{4})\/(\d{1,2})\/(\d{1,2})/", "D$3.$2.$1", $infix);
			case 'Y-d-m':
				return preg_replace("/(\d{4})-(\d{1,2})-(\d{1,2})/", "D$2.$3.$1", $infix);
			case 'Y.d.m':
				return preg_replace("/(\d{4})\.(\d{1,2})\.(\d{1,2})/", "D$2.$3.$1", $infix);
			case 'Y/d/m':
				return preg_replace("/(\d{4})\/(\d{1,2})\/(\d{1,2})/", "D$2.$3.$1", $infix);
		}
		return $infix;
	}

}

?>
