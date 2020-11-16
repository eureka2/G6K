<?php declare(strict_types = 1);

/*
The MIT License (MIT)

Copyright (c) 2020 Jacques Archimède

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

namespace App\G6K\Manager\Api;

use Peast\Peast;
use Peast\Renderer;
use Peast\Formatter\PrettyPrint;
use Peast\Formatter\Compact;
use Peast\Syntax\Exception;
use Peast\Syntax\Node\Node;

class Obfuscator {

	const KEYWORDS = [
		'true','false','null',
		'break','case','class','catch','const','continue','debugger',
		'default','delete','do','else','export','extends','finally',
		'for','function','if','import','in','instanceof','new','return',
		'super','switch','this','throw','try','typeof',
		'var','void','while','with','yield',
		'document', 'window',
		'enum',
		'implements','package','protected','static','let','interface','private','public',
		'await',
		'abstract','boolean','byte','char','double','final','float','goto','int','long',
		'native','short','synchronized','throws','transient','volatile',
		'NaN','Infinity','undefined',
		'eval','parseInt','parseFloat','isNaN','isFinite','decodeURI',
		'decodeURIComponent','encodeURI','encodeURIComponent','escape','unescape',
		'Object','Function','Array','ArrayBuffer','String','Boolean','Number',
		'DataView','Date','Promise','RegExp','Map','WeakMap','Set','WeakSet',
		'SharedArrayBuffer','Symbol','Error','EvalError','RangeError',
		'ReferenceError','SyntaxError','TypeError','URIErro',
		'Atomics','Math','JSON','Reflect','Proxy',
	];

	private $source = "";
	private $ast = null;
	private $keywords;
	private $strings = [];
	private $closures = [];
	private $topClosures = [];

	public function __construct(string $source) {
		$this->keywords = array_flip(self::KEYWORDS); 
		$this->source = $source;
		$this->ast = Peast::latest($source, [
			'sourceType' => Peast::SOURCE_TYPE_SCRIPT
		])->parse();
	}

	public function obfuscate() : string {
		$this->ast->traverse([$this, 'traverse']);
		$this->saveStrings();
		$this->splitClosures($this->source, 0);
		$this->saveTopClosures();
		$this->replaceVariables();
		$this->replaceClosures();
		$this->regroupVarDeclarations();
		$this->restoreStrings();
		$this->reduceSomeTexts($this->source);
		$this->suppressPropertiesDelimiters();
		return $this->source;
	}

	public function compact(string $source = null) : string {
		$source = $source ?? $this->source;
		$source = preg_replace_callback("/`[^`]+`/", function($str) {
			$str = preg_replace("/^\s+|\s+$/m", "", $str[0]);
			return preg_replace("/[\r\n]/", "", $str);
		}, $source);
		$ast = Peast::latest($source, [
			'sourceType' => Peast::SOURCE_TYPE_SCRIPT
		])->parse();
		$renderer = new Renderer();
		$renderer->setFormatter(new Compact());
		return $renderer->render($ast);
	}

	public function traverse(Node $node) : void {
		$type = $node->getType();
		switch ($type) {
			case "Literal":
				$this->addLiteral($node);
				break;
			case "Property":
				$this->addProperty($node);
				break;
			case "RegExpLiteral":
				$this->addRegExp($node);
				break;
			case "Comment":
				echo "Comment : " . $node->getText() . "\n";
				break;
		}
	}

	private function saveStrings() : void {
		$olds = [];
		$news = [];
		usort($this->strings, function($a, $b) {
			if ($a['start'] == $b['start']) {
				return 0;
			}
			return ($a['start'] > $b['start']) ? -1 : 1;
		});
		foreach($this->strings as $string) {
			$start = $string['start'];
			$len = mb_strlen($string['old']);
			$rempl = $string['new'];
			if ($string['type'] == 'self-property') {
				$end = mb_substr ($this->source, $start);
				if (!preg_match(
					"/^" . $string['old'] . "\s*\:/",
					$end)
				) {
					$rempl .= ': ' . $string['old'];
				}
			}
			$this->source =
				mb_substr ($this->source, 0, $start)
				. $rempl
				. mb_substr ($this->source, $start + $len)
			;
			$olds[] = $string['new'];
			$news[] = $string['old'];
		}
		$nvar = count($this->strings);
		$this->source = preg_replace_callback(
			"/`[^`]+`/",
			function($m) use(&$nvar, &$olds, &$news) {
				$old = $m[0];
				$new = '¤' . (++$nvar) . '¤';
				$olds[] = $new;
				$news[] = $old;
				return $new;
			},
			$this->source
		);
		$this->strings = [
			'olds' => $olds,
			'news' => $news
		];
	}

	private function addProperty(Node $property) : void {
		$value = $property->getValue();
		$property = $property->getKey();
		$propertyType = $property->getType();
		$valueType = $value->getType();
		$start = $property->getLocation()->getStart()->getIndex();
		$end = $property->getLocation()->getEnd()->getIndex();
		$property = $property->render(new PrettyPrint());
		$value = $value->render(new PrettyPrint());
		$type = 'property';
		if ($propertyType == "Identifier"
			&& $valueType == "Identifier"
			&& $propertyType == $valueType
		) {
			$type = 'self-property';
		}
		if (!preg_match("/^('|\").*('|\")$/", $property)) {
			$new = '¤' . (count($this->strings) + 1) . '¤';
			$this->strings[] = [
				'old' => $property,
				'type' => $type,
				'new' => $new,
				'start' => $start,
				'end' => $end
			];
		}
	}

	private function addRegExp(Node $regexp) : void {
		$start = $regexp->getLocation()->getStart()->getIndex();
		$end = $regexp->getLocation()->getEnd()->getIndex();
		$regexp = $regexp->getRaw();
		$new = '¤' . (count($this->strings) + 1) . '¤';
		$this->strings[] = [
			'old' => $regexp,
			'type' => 'regexp',
			'new' => $new,
			'start' => $start,
			'end' => $end
		];
	}

	private function addLiteral(Node $literal) : void {
		$start = $literal->getLocation()->getStart()->getIndex();
		$end = $literal->getLocation()->getEnd()->getIndex();
		$literal = $literal->getRaw();
		$new = '¤' . (count($this->strings) + 1) . '¤';
		$this->strings[] = [
			'old' => $literal,
			'type' => 'literal',
			'new' => $new,
			'start' => $start,
			'end' => $end
		];
	}

	private function splitClosures(string $string, int $layer) : void {
		if (preg_match_all(
			"/\{(([^\{\}]*|(?R))*)\}/",
			$string,
			$matches) > 0
		) {
			for ($i = 0; $i < count($matches[1]); $i++) {
				if (is_string($matches[1][$i])) {
					if (strlen($matches[1][$i]) > 0) {
						if (!isset($this->closures[$layer])) {
							$this->closures[$layer] = [];
						}
						$closure = $matches[1][$i];
						$this->closures[$layer][] = $closure;
						$this->splitClosures($matches[1][$i], $layer + 1);
					}
				}
			}
		}
	}

	private function saveTopClosures() : void {
		if (count($this->closures) > 0) {
			$this->topClosures = $this->closures[0];
		}
	}

	private function replaceClosures() : void {
		if (count($this->closures) > 0) {
			foreach($this->closures[0] as $c => $closure) {
				$this->source = str_replace($this->topClosures[$c], $closure, $this->source);
			}
		}
	}

	private function extractNamedFunctionDeclarations(string $code) : array {
		$functions = [];
		if (preg_match_all(
			"/(\bfunction\b\s+(\w+)\s*\(|\bvar\s*(\w+)\s*=\s*function\s*\()\s*([^\)]*)\)/",
			$code,
			$matches,
			PREG_SET_ORDER
		) > 0) {
			foreach ($matches as $match) {
				$function = '';
				if (isset($match[2]) && $match[2] != '') {
					$function = $match[2];
				} elseif (isset($match[3]) && $match[3] != '') {
					$function = $match[3];
				}
				if ($function != '') {
					$functions[$function] = [
						'closure' => preg_match(
							"/\breturn\s+(function\s+)?" . $function . "\b\s*[^\(]/",
							$code
						),
						'arguments' => $match[4] != ''
							? preg_split("/\s*,\s*/" ,$match[4])
							: []
					];
				}
			}
		}
		return $functions;
	}

	private function extractAnonymousFunctionDeclarations(string $code) : array {
		$functions = [];
		if (preg_match_all(
			"/(\bvar\s*(\w+)\s*=\s*)?\bfunction\s*\(\s*([^\)]*)\)\s*\{/",
			$code,
			$matches,
			PREG_SET_ORDER|PREG_OFFSET_CAPTURE
		) > 0) {
			foreach ($matches as $match) {
				if (!isset($match[2][0]) || $match[2][0] == '') {
					if (isset($match[3][0]) && $match[3][0] != '') {
						$functions[] = [
							'arguments' => preg_split(
								"/\s*,\s*/",
								$match[3][0]
							),
							'position' => $match[0][1]
						];
					}
				}
			}
		}
		if (preg_match_all(
			"/[\(,]\s*\(?([\w,.\s]*)\)?\s*=\>\s*\{/",
			$code, 
			$matches,
			PREG_SET_ORDER|PREG_OFFSET_CAPTURE
		) > 0) {
			foreach ($matches as $match) {
				if (isset($match[1][0]) && $match[1][0] != '') {
					$arguments = array_map(function($a) {
							return trim($a);
						},
						preg_split("/\s*,\s*/" ,$match[1][0])
					);
					$functions[] = [
						'arguments' => $arguments,
						'position' => $match[0][1]
					];
				}
			}
		}
		return $functions;
	}

	private function splitCommaSeparatedVars(string $code) : array {
		$chunks = [];
		$len = strlen($code);
		$open = '';
		$nopen = 0;
		$close = [ '[' => ']', '(' => ')', '{' => '}' ];
		$chunk = '';
		$prevchar = '';
		for ($i = 0; $i < $len; $i++) {
			$char = $code[$i];
			if ($open != '') {
				$chunk .= $char;
				if ($char == $close[$open]) {
					$nopen--;
					if ($nopen == 0) {
						$open = '';
					}
				} elseif ($char == $open) {
					$nopen++;
				}
			} elseif (in_array($char, ['[', '{', '('])) {
				$chunk .= $char;
				$open = $char;
				$nopen = 1;
			} elseif ($char == ',') {
				if ($chunk != '') {
					$chunks[] = $chunk;
					$chunk = '';
				}
			} elseif ($char == '/') {
				$chunk .= $char;
				if ($prevchar == '/') {
					do {
						$i++;
						if ($i < $len) {
							$char = $code[$i];
							$chunk .= $char;
						}
					} while($i < $len && $code[$i] != "\n");
				}
			} elseif ($char == '*') {
				$chunk .= $char;
				if ($prevchar == '/') {
					do {
						$i++;
						if ($i < $len) {
							$char = $code[$i];
							$chunk .= $char;
						}
					} while($i < $len - 1 && ($code[$i] != "*" || $code[$i + 1] != "/"));
					if ($i < $len - 1) {
						$i++;
						$char = $code[$i];
						$chunk .= $char;
					}
				}
			} else {
				$chunk .= $char;
			}
			$prevchar = $char;
		}
		if ($chunk != '') {
			$chunks[] = $chunk;
		}
		return $chunks;
	}

	private function splitVarDeclarations(string &$code) : void {
		$code = preg_replace_callback(
			"/(\n\s+)?\b(var|const|let)\s+([^;]+);/s",
			function($decl) {
				$margin = $decl[1];
				$keyword = $decl[2];
				$vars = $decl[3];
				$vars = $this->splitCommaSeparatedVars($vars);
				$n = 0;
				$vars = array_map(function($var) use ($margin, $keyword, &$n) {
					if (!preg_match("/^¤\d+¤\s*:/", trim($var))) {
						$sep = $n > 0 ? '; ' : '';
						$ret = $sep . $margin . $keyword . ' ' . trim($var);
					} else {
						$sep = $n > 0 ? ', ' : '';
						$ret = $sep . $var;
					}
					$n++;
					return $ret;
				}, $vars);
				return implode("", $vars) . ';';
			}, 
			$code
		);
	}

	private function replaceWithinBalancedParentheses(string &$code, string $pattern) : void {
		if (preg_match_all(
			"/". $pattern . "\s*\(([^()]|(?R))*\)/",
			$code,
			$matches,
			PREG_SET_ORDER|PREG_OFFSET_CAPTURE
		) > 0) {
			$matches = array_reverse($matches[0]);
			foreach($matches as $match) {
				$part1 = substr($code, 0, $match[1]);
				$part2 = substr($code, $match[1]);
				$part2 = preg_replace("/" . $pattern . "\s*\((.*)\)/", '[$1]', $part2);
				$code = $part1 . $part2;
			}
		}
	}

	private function suppressPropertiesDelimiters() : void {
		$this->source = preg_replace('/([\{,]\s*)"(\w+)":/', "$1$2:", $this->source);
	}

	private function reduceSomeTexts(string &$code) : void {
		$code = preg_replace("/\breturn\s+false\b/", 'return!1', $code);
		$code = preg_replace("/\breturn\s+true\b/", 'return!0', $code);
		$code = preg_replace_callback(
			"/(.)\bfalse\b(.)/",
			function($b) {
				if ($b[1] != '"' && $b[1] != "'" && $b[2] != '"' && $b[2] != "'") {
					return $b[1] . '!1' . $b[2];
				} else {
					return $b[0];
				}
			}, 
			$code
		);
		$code = preg_replace_callback(
			"/(.)\btrue\b(.)/",
			function($b) {
				if ($b[1] != '"' && $b[1] != "'" && $b[2] != '"' && $b[2] != "'") {
					return $b[1] . '!0' . $b[2];
				} else {
					return $b[0];
				}
			}, 
			$code
		);
		$this->replaceWithinBalancedParentheses($code, "new\s+Array");
		$this->replaceWithinBalancedParentheses($code, "new\s+Object");
	}

	private function replaceVariable(string $var, string &$code, int &$nvar) {
		if ($var !== ''
			&& !isset($this->keywords[$var])
			&& !preg_match("/^_\d+$/", $var)
			&& !preg_match("/^¤\d+¤$/", $var)
		) {
			$nvar++;
			foreach (range(0, 1) as $r) {
				$code = preg_replace_callback(
					"/(..)?(.)\b" . $var . "(\b\s*)(.)/",
					function($vr) use (&$nvar, $var) {
						if (($vr[2] == '.' && $vr[1] != '..')) {
							return $vr[0];
						} else {
							if (strlen($vr[3]) == 0 && strlen($vr[4]) > 0) {
								if (ctype_alnum($vr[4])) {
									$vr[3] = ' ';
								}
							}
							return $vr[1] . $vr[2] . '_' . $nvar . $vr[3] . $vr[4] ;
						}
					},
					$code
				);
			}
		}
	}

	private function replaceVariables() : void {
		$nvar = 0;
		$n = count($this->closures);
		for ($l = $n - 1; $l >= 0; $l--) {
			$codes = $this->closures[$l];
			$c = count($codes);
			for ($i = 0; $i < $c; $i++) {
				$ncode = $code = $codes[$i];
				$this->splitVarDeclarations($ncode);
				if (preg_match_all("/\b(var|let|const)\s+(\w+)/", $ncode, $m) > 0) {
					$vars = $m[2];
					foreach($vars as $var) {
						$this->replaceVariable($var, $ncode, $nvar);
					}
				}
				$functions = $this->extractNamedFunctionDeclarations($ncode);
				foreach ($functions as $function => $declaration) {
					foreach ($declaration['arguments'] as $argument) {
						if (preg_match("/^\.\.\./", $argument)) {
							$argument = substr($argument, 3);
						}
						$this->replaceVariable($argument, $ncode, $nvar);
					}
					if (!$declaration['closure']) {
						$this->replaceVariable($function, $ncode, $nvar);
					}
				}
				$functions = $this->extractAnonymousFunctionDeclarations($ncode);
				usort($functions, function($a, $b) {
					if ($a['position'] == $b['position']) {
						return 0;
					}
					return ($a['position'] > $b['position']) ? -1 : 1;
				});
				foreach ($functions as $function => $declaration) {
					$position = $declaration['position'];
					foreach ($declaration['arguments'] as $argument) {
						if (preg_match("/^\.\.\./", $argument)) {
							$argument = substr($argument, 3);
						}
						$part1 = substr($ncode, 0, $position);
						$part2 = substr($ncode, $position);
						$this->replaceVariable($argument, $part2, $nvar);
						$ncode = $part1 . $part2;
					}
				}
				$this->reduceSomeTexts($ncode);
				$this->closures[$l][$i] = $ncode;
				for ($j = $l - 1; $j >= 0; $j--) {
					$codes = $this->closures[$j];
					$c = count($codes);
					for ($k = 0; $k < $c; $k++) {
						$this->closures[$j][$k] = str_replace($code, $ncode, $this->closures[$j][$k]);
					}
				}
			}
		}
	}

	private function doRegroupVars(array &$vars, string &$margin, int &$start, array &$lines) : bool {
		$n = count($vars);
		if ($n > 1) {
			$lines[$start] = $margin . 'var ' . implode(', ', array_reverse($vars)) . ';';
			array_splice($lines, $start + 1, $n - 1);
			$vars = [];
			$prevkeyword = '';
			$margin = '';
			$start = -1;
			return true;
		}
		$vars = [];
		return false;
	}

	private function regroupVarDeclarations() : void {
		$vars = [];
		$prevkeyword = '';
		$margin = '';
		$start = -1;
		$regrouped = false;
		foreach(['var', 'const', 'let'] as $keyword) {
			if (preg_match_all(
				"/\b" . $keyword . "\s+.+\)/m",
				$this->source,
				$matches,
				PREG_OFFSET_CAPTURE) > 0
			) {
				$match = $matches[0];
				$len = count($match);
				for ($i = $len - 1; $i >= 0; $i--) {
					$m = $match[$i];
					if (preg_match("/;\s*" . $keyword . "\b/", $m[0])) {
						$before = $m[0];
						$position = $m[1];
						$after = preg_replace("/;\s*" . $keyword . " /", ", ", $before);
						$this->source = substr($this->source, 0, $position) . $after . substr($this->source, $position + strlen($before));
					}
				}
			}
		}
		$lines = explode("\n", $this->source);
		$i = count($lines) - 1;
		while ($i >= 0) {
			$line = $lines[$i];
			if (preg_match("/^(\s*)(var|const|let)\s+([\w\._]+)\s*([^;]*);\s*$/", $line, $matches)) {
				$margin = $matches[1];
				$keyword = $matches[2];
				$var = $matches[3];
				$decl = $matches[4];
				if ($keyword == $prevkeyword) {
					$start = $i;
					$vars[] = $var . ($decl != '' ? ' ' . $decl : '');
				} else {
					$regrouped = $this->doRegroupVars($vars, $margin, $start, $lines) || $regrouped;
				}
				$prevkeyword = $keyword;
			} else {
					$regrouped = $this->doRegroupVars($vars, $margin, $start, $lines) || $regrouped;
			}
			$i--;
		}
		$regrouped = $this->doRegroupVars($vars, $margin, $start, $lines) || $regrouped;
		if ($regrouped) {
			$this->source = implode("\n", $lines);
		}
	}

	private function restoreStrings() : void {
		$this->source = str_replace($this->strings['olds'], $this->strings['news'], $this->source);
	}

}
