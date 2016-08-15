<?php


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

namespace EUREKA\G6KBundle\Entity;

class ResultFilter {

	private $functions = array(
		'timestamp'
	);

	private $phpfunctions = array(
		'addcslashes',
		'addslashes',
		'bin2hex',
		'chop',
		'chr',
		'chunk_​split',
		'convert_​cyr_​string',
		'convert_​uudecode',
		'convert_​uuencode',
		'count_​chars',
		'crc32',
		'crypt',
		'hebrev',
		'hebrevc',
		'hex2bin',
		'lcfirst',
		'levenshtein',
		'localeconv',
		'ltrim',
		'md5',
		'metaphone',
		'nl_​langinfo',
		'nl2br',
		'number_​format',
		'ord',
		'print',
		'quoted_​printable_​decode',
		'quoted_​printable_​encode',
		'quotemeta',
		'rtrim',
		'setlocale',
		'sha1',
		'similar_​text',
		'soundex',
		'sprintf',
		'sscanf',
		'str_​getcsv',
		'str_​ireplace',
		'str_​pad',
		'str_​repeat',
		'str_​replace',
		'str_​rot13',
		'str_​shuffle',
		'str_​split',
		'str_​word_​count',
		'strcasecmp',
		'strchr',
		'strcmp',
		'strcoll',
		'strcspn',
		'strip_​tags',
		'stripcslashes',
		'stripos',
		'stripslashes',
		'stristr',
		'strlen',
		'strnatcasecmp',
		'strnatcmp',
		'strncasecmp',
		'strncmp',
		'strpbrk',
		'strpos',
		'strrchr',
		'strrev',
		'strripos',
		'strrpos',
		'strspn',
		'strstr',
		'strtok',
		'strtolower',
		'strtoupper',
		'strtr',
		'substr_​compare',
		'substr_​count',
		'substr_​replace',
		'substr',
		'trim',
		'ucfirst',
		'ucwords',
		'wordwrap',
		'checkdate',
		'date_​default_​timezone_​get',
		'idate',
		'gmdate',
		'date',
		'gmmktime',
		'gmstrftime',
		'localtime',
		'microtime',
		'mktime',
		'strftime',
		'strtotime',
		'is_​bool',
		'is_​double',
		'is_​float',
		'is_​int',
		'is_​integer',
		'is_​long',
		'is_​null',
		'is_​numeric',
		'is_​real',
		'is_​string'
	);

	public function __construct() {
	}

	public static function filter($format, $result, $path, $namespaces = array(), $separator = ",", $delimiter = "") {
		$resultfilter = new ResultFilter();
		switch ($format) {
			case 'json':
				return $resultfilter->filterJSON($result, $path);
			case 'csv':
				return $resultfilter->filterCSV($result, $path, $separator, $delimiter);
			case 'html':
				return $resultfilter->filterHTML($result, $path, $namespaces);
			case 'xml':
				return $resultfilter->filterXML($result, $path, $namespaces);
			default:
				return null;
		}
	}

	protected function filterJSON($json, $path) {
		$result = $this->xPathFilter( "json", $json, $path);
		return $result;
	}

	protected function filterCSV($csv, $path, $separator, $delimiter) {
		$result = array();
		$lines = explode("\n", $csv);
		foreach ($lines as $line) {
			$cols = array_map(
				function($l) {
					return trim($l);
				}, 
				str_getcsv($line, $separator, $delimiter)
			);
			$result[] = $cols;
		}
		$indices = explode("/", $path);
		foreach ($indices as $index) {
			$result = $result[(int)$index - 1];
		}
		return $result;
	}

	protected function filterHTML($crawler, $path, $namespaces = array()) {
		if (strpos($path, "/") !== false) {
			$path = $this->replacePathFunctions($path);
			if (strpos($path, "php:function") !== false) {
				return $this->xPathDOMFilter($crawler->getNode(0)->ownerDocument, $path, $namespaces);
			}
		}
		foreach ($namespaces as $prefix => $nsuri) {
			$crawler->registerNamespace($prefix, $nsuri);
		}
		if (strpos($path, "/") === false) { // assumes CSS selector
			$crawler = $crawler->filter($path);
		} else {
			$crawler = $crawler->filterXPath($path);
		}
		$result = array();
		foreach ($crawler as $domElement) {
			$result[] = trim($domElement->nodeValue);
		}
		return $result;
	}

	protected function filterXML($crawler, $path, $namespaces = array()) {
		$result = $crawler->getNode(0)->ownerDocument->saveXML();
		$xml = new \SimpleXMLElement($result);
		foreach ($namespaces as $prefix => $nsuri) {
			$xml->registerXPathNamespace ($prefix, $nsuri);
		}
		$xml = $xml->xpath($path);
		return $xml;
	}

	protected function replacePathFunctions($path) {
		foreach ($this->phpfunctions as $func) {
			$path = preg_replace("/". $func . "\s*\(/", "php:functionString('" . $func . "', ", $path);
		}
		foreach ($this->functions as $func) {
			$path = preg_replace("/". $func . "\s*\(/", "php:function('EUREKA\G6KBundle\Entity\ResultFilter::" . $func . "', ", $path);
		}
		return $path;
	}

	protected function createXML($node_name, $arr=array()) {
		$xml = new \DomDocument('1.0', 'UTF-8');
		$xml->formatOutput = true;
		$xml->appendChild($this->convertToXML($node_name, $arr));
		$result = $xml;
		return $result;
	}

	protected function bool2str($v) {
		$v = $v === true ? 'true' : $v;
		$v = $v === false ? 'false' : $v;
		return $v;
	}

	protected function isValidTagName($tag) {
		$pattern = '/^[a-z_]+[a-z0-9\:\-\.\_]*[^:]*$/i';
		return preg_match($pattern, $tag, $matches) && $matches[0] == $tag;
	}

	protected function createArray($xml) {
		$result = $this->convertToArray($xml);
		$this->replaceTextKeys($result);
		return $result;
	}

	protected function replaceTextKeys(&$array) {
		if (count($array) == 1) {
			$key = array_keys($array)[0];
			if ($key == '#text') {
				$array = $array[$key];
			} elseif ($key == 0 && is_array($array[0])) {
				$array = $array[0];
				$this->replaceTextKeys($array);
			}
		} else {
			foreach ($array as $i => $value) {
				if (is_array($value)) {
					if (count($value) == 1) {
						$key = array_keys($value)[0];
						if ($key == '#text') {
							$array[$i] = $value[$key];
						}
					} else {
						$this->replaceTextKeys($array[$i]);
					}
				}
			}
		}
	}
	
	protected function nodeHasChild( $node ) {
		if ( $node->hasChildNodes() ) {
			foreach ( $node->childNodes as $child ) {
				if ( $child->nodeType == XML_ELEMENT_NODE ) {
					return true;
				}
			}
		}
		return false;
	}

	protected function &convertToArray( $xml ) {
		if ( $xml instanceOf \DOMNodeList ) {
			$items = array();
			foreach ( $xml as $item ) {
				$items[] = $this->convertToArray( $item );
			}
			return $items;
		}
		$itemData = array();
		foreach ( $xml->childNodes as $node ) {
			if ( $this->nodeHasChild( $node ) ) {
				$itemData[$node->nodeName] = $this->convertToArray( $node );
			} else{
				$itemData[$node->nodeName] = trim($node->nodeValue);
			}
		}
		return $itemData;
	}

	protected function &xPathFilter( $root, $array, $path ) {
		$doc = $this->createXML($root, $array);
		return $this->xPathDOMFilter( $doc, $path );
	}

	protected function xPathDOMFilter( $doc, $path, $namespaces = array() ) {
		$xPath = new \DOMXPath($doc);
		foreach ($namespaces as $prefix => $nsuri) {
			$xPath->registerNamespace($prefix, $nsuri);
		}
		$xPath->registerNamespace("php", "http://php.net/xpath");
		$xPath->registerPHPFunctions();
		$filtered = $xPath->query($path);
		$result = $this->createArray($filtered);
		return $result;
	}

	static function xml2array($xml) {
		$result = array();
		if (is_array($xml)) {
			foreach ($xml as $key => $item) {
				$key = (string)$key;
				if (is_object($item) && get_class($item) == 'SimpleXMLElement') {
					$result[$key] = self::xml2array((array)$item);
				} elseif ($key == '@attributes') {
					$key = array_keys($item)[0];
					$item = $item[$key];
					$result[$key] = $item;
				} else {
					$result[$key] = $item;
				}
			}
		}
		return $result;
	}

	static function timestamp($format, $dateStr) {
		$result = null;
		$dateStr = trim($dateStr);
		if ($dateStr != '') {
			$date = \DateTime::createFromFormat($format, $dateStr);
			$errors = \DateTime::getLastErrors();
			if ($errors['error_count'] > 0) {
				throw new \Exception($errors['errors'][0]);
			}
			$result = $date->getTimestamp();
		}
		return $result;
	}

}

?>