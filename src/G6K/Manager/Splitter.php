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

namespace App\G6K\Manager;

/**
 * Utility class for splitting terms from a string
 * 
 * @author Jacques Archimède
 */
class Splitter  {

	/**
	 * Constructor of class Splitter
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
	}

	/**
	 * Splits a statement into keywords/clauses
	 *
	 * @access public
	 * @static
	 * @param string $stmt statement
	 * @param array $keywords the list of keywords
	 * @return array the list of keywords associated with their clauses.
	 * @throws \Exception
	 */
	public static function splitKeywords($stmt, $keywords) {
		$clauses = array();
		$positions = array();
		$chunks = preg_split("/\b(" . implode("|", $keywords) . ")\b/i", $stmt, -1, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY | PREG_SPLIT_OFFSET_CAPTURE);
		$chunksCount = count($chunks);
		if ($chunksCount % 2 > 0) {
			throw new \Exception("syntax error near : " . $stmt);
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
				throw new \Exception("syntax error near : " . $keyword . ' ' . $clauses[$keyword]);
			}
		}
		return $clauses;
	}

	/**
	 * Tokenizes a list of comma separated terms excluding function arguments
	 *
	 * @access public
	 * @static
	 * @param string $list the list of comma separated terms
	 * @return array the array of terms.
	 */
	public static function splitList($list) {
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

}

?>
