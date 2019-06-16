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

use Symfony\Component\DomCrawler\Crawler;
use Flow\JSONPath\JSONPath;
use App\G6K\Manager\ExpressionParser\DateFunction;

/**
 *
 * This class is used to filter the results of a query on a data source with the 'return path' defined in the source.
 * The return path can be a JSONPath or XPath expression, a CSS selector or a line and column number.
 *
 * @copyright Jacques Archimède
 *
 */
class ResultFilter {

	/**
	 * @var array      $functions The list of custom php functions that can be found in a 'return path' expression
	 *
	 * @access  private
	 *
	 */
	private $functions = array(
		'timestamp'
	);

	/**
	 * @var array      $phpfunctions The list of native php functions that can be found in a 'return path' expression
	 *
	 * @access  private
	 *
	 */
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

	/**
	 * Constructor of class ResultFilter
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct() {
	}

	/**
	 * Filters the results of a query on a data source with the 'return path' defined in the source.
	 *
	 * @access  public
	 * @static 
	 * @param   string $format The result type (json, csv, html or xml)
	 * @param   mixed $result The results of a query
	 * @param   string $path The return path defined in the source.
	 * @param   array $namespaces (default: array() The list of namespaces if the result is in xml or html format
	 * @param   string $separator The field separator if the result is in csv format
	 * @param   string $delimiter The field delimiter if the result is in csv format
	 * @return  mixed|null The filtered result
	 *
	 */
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

	/**
	 * Filters the JSON results of a query on a data source with the 'return path' defined in the source.
	 * The return path is a JSONPath or a XPath expression
	 *
	 * @access  protected
	 * @param   mixed $json The JSON results
	 * @param   string $path The return path defined in the source.
	 * @return  array The filtered result
	 *
	 */
	protected function filterJSON($json, $path) {
		if ($json instanceof Crawler) {
			$json = $this->createArray( $json->getNode(0) );
		}
		if ($path == '') {
			$result = $json;
		} elseif (preg_match("/^\\$/", $path)) { // jsonpath
			$store = new JSONPath($json);
			$result = $store->find($path)->data();
		} else { // xpath
			$result = $this->xPathFilter( "json", $json, $path);
		}
		return $result;
	}

	/**
	 * Filters the CSV results of a query on a data source with the 'return path' defined in the source.
	 * The return path is in the form "line number/column number"
	 *
	 * @access  protected
	 * @param   string $csv The CSV results 
	 * @param   string $path The return path defined in the source.
	 * @param   string $separator The field separator
	 * @param   string $delimiter The field delimiter
	 * @return  mixed The filtered result
	 *
	 */
	protected function filterCSV($csv, $path, $separator, $delimiter) {
		$result = array();
		$lines = explode("\n", $csv);
		foreach ($lines as $line) {
			if (trim($line) != '') {
				$cols = array_map(
					function($l) {
						return trim($l);
					}, 
					str_getcsv($line, $separator, $delimiter)
				);
				$result[] = $cols;
			}
		}
		if ($path !== null && $path != '') {
			$indices = explode("/", $path);
			foreach ($indices as $index) {
				$result = $result[(int)$index - 1];
			}
		}
		return $result;
	}

	/**
	 * Filters the HTML results of a query on a data source with the 'return path' defined in the source.
	 * The return path is a XPath expression or a CSS selector
	 *
	 * @access  protected
	 * @param   \Symfony\Component\DomCrawler\Crawler $crawler The HTML results
	 * @param   string $path The return path defined in the source.
	 * @param   array $namespaces (default: array() The list of namespaces
	 * @return  array The filtered result
	 *
	 */
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

	/**
	 * Filters the XML results of a query on a data source with the 'return path' defined in the source.
	 * The return path is a XPath expression
	 *
	 * @access  protected
	 * @param   \Symfony\Component\DomCrawler\Crawler $crawler The XML results
	 * @param   string $path The return path defined in the source.
	 * @param   array $namespaces (default: array() The list of namespaces
	 * @return  array  The filtered result
	 *
	 */
	protected function filterXML(Crawler $crawler, $path, $namespaces = array()) {
		$result = $crawler->getNode(0)->ownerDocument->saveXML();
		$xml = new \SimpleXMLElement($result);
		foreach ($namespaces as $prefix => $nsuri) {
			$xml->registerXPathNamespace ($prefix, $nsuri);
		}
		$xml = $xml->xpath($path);
		return $xml;
	}

	/**
	 * Replaces the php functions in an XPath expression with the syntax required for their executions
	 *
	 * @access  protected
	 * @param   string $path The XPath expression
	 * @return  string The new XPath expression
	 *
	 */
	protected function replacePathFunctions($path) {
		foreach ($this->phpfunctions as $func) {
			$path = preg_replace("/". $func . "\s*\(/", "php:functionString('" . $func . "', ", $path);
		}
		foreach ($this->functions as $func) {
			$path = preg_replace("/". $func . "\s*\(/", "php:function('App\G6K\Manager\ResultFilter::" . $func . "', ", $path);
		}
		return $path;
	}

	/**
	 * Converts an array to a XML DOM document
	 *
	 * @access  protected
	 * @param   string $node_name The root of the XML DOM document
	 * @param   array $arr (default: array() The array to be converted
	 * @return  \DomDocument The new XML DOM document
	 *
	 */
	protected function createXML($node_name, $arr=array()) {
		$xml = new \DomDocument('1.0', 'UTF-8');
		$xml->formatOutput = true;
		$xml->appendChild($this->convertToXML($xml, $node_name, $arr));
		$result = $xml;
		return $result;
	}

	/**
	 * Converts a true/false (boolean) value to a string
	 *
	 * @access  protected
	 * @param   bool $v The boolean value
	 * @return  string The result of the conversion
	 *
	 */
	protected function bool2str($v) {
		$v = $v === true ? 'true' : $v;
		$v = $v === false ? 'false' : $v;
		return $v;
	}

	/**
	 * Determines whether the given tag name is valid or not.
	 *
	 * @access  protected
	 * @param   string $tag The tag name
	 * @return  bool true if the tag name is valid, false otherwise
	 *
	 */
	protected function isValidTagName($tag) {
		$pattern = '/^[a-z_]+[a-z0-9\:\-\.\_]*[^:]*$/i';
		return preg_match($pattern, $tag, $matches) && $matches[0] == $tag;
	}

	/**
	 * Converts an array to a XML DOM node of a DOM document
	 *
	 * @access  protected
	 * @param   \DOMDocument &$dom The DOM document
	 * @param   string $node_name The name of the node
	 * @param   array $arr (default: array()) The array to be converted
	 * @return  \DOMNode The new DOM node
	 * @throws \Exception
	 *
	 */
	protected function &convertToXML(\DomDocument &$dom, $node_name, $arr=array()) {
		$node = $dom->createElement($node_name);
		if(is_array($arr)){
			if(isset($arr['@attributes'])) {
				foreach($arr['@attributes'] as $key => $value) {
					if(!$this->isValidTagName($key)) {
						throw new \Exception('[Array2XML] Illegal character in attribute name. attribute: '.$key.' in node: '.$node_name);
					}
					$node->setAttribute($key, $this->bool2str($value));
				}
				unset($arr['@attributes']); 
			}
			if(isset($arr['@value'])) {
				$node->appendChild($dom->createTextNode($this->bool2str($arr['@value'])));
				unset($arr['@value']);
				return $node;
			} else if(isset($arr['@cdata'])) {
				$node->appendChild($dom->createCDATASection($this->bool2str($arr['@cdata'])));
				unset($arr['@cdata']);
				return $node;
			}
		}
		if(is_array($arr)){
			foreach($arr as $key=>$value){
				$attr = false;
				if (preg_match("/^@(.+)$/", $key, $matches) && !is_array($value)) {
					$key = $matches[1];
					$attr = true;
				}
				if(!$this->isValidTagName($key)) {
					throw new \Exception('[Array2XML] Illegal character in tag name. tag: '.$key.' in node: '.$node_name);
				}
				if ($attr) {
					$node->setAttribute($key, $this->bool2str($value));
				} elseif (is_array($value) && is_numeric(key($value))) {
					foreach($value as $k=>$v){
						if (is_array($v) && is_numeric(key($v))) {
							$subnode = $dom->createElement($key);
							foreach($v as $k1=>$v1){
								$subnode->appendChild($this->convertToXML($dom, 'sub-'.$key, $v1));
							}
							$node->appendChild($subnode);
						} else {
							$node->appendChild($this->convertToXML($dom, $key, $v));
						}
					}
				} else {
					$node->appendChild($this->convertToXML($dom, $key, $value));
				}
				unset($arr[$key]);
			}
		}
		if(!is_array($arr)) {
			$node->appendChild($dom->createTextNode($this->bool2str($arr)));
		}
		return $node;
	}

	/**
	 * Creates and returns an array from a list of XML DOM node
	 *
	 * @access  protected
	 * @param   \DOMNodeList $xml The list of XML DOM node
	 * @return  array The new array
	 *
	 */
	protected function createArray($xml) {
		$result = $this->convertToArray($xml);
		$this->replaceTextKeys($result);
		return $result;
	}

	/**
	 * Replaces all '#text' keys of the given array by the corresponding text
	 *
	 * @access  protected
	 * @param   array &$array The given array
	 * @return  void
	 *
	 */
	protected function replaceTextKeys(&$array) {
		if (count($array) == 1) {
			$keys = array_keys($array);
			$key = $keys[0];
			if ($key == '#text') {
				$array = $array[$key];
				if (is_array($array)) {
					$this->replaceTextKeys($array);
				}
			} elseif ($key == 0 && is_array($array[0])) {
				$array = $array[0];
				$this->replaceTextKeys($array);
			}
		} else {
			foreach ($array as $i => $value) {
				if (is_array($value)) {
					if (count($value) == 1) {
						$keys = array_keys($value);
						$key = $keys[0];
						if ($key == '#text') {
							$array[$i] = $value[$key];
							if (is_array($array[$i])) {
								$this->replaceTextKeys($array[$i]);
							}
						}
					} else {
						$this->replaceTextKeys($array[$i]);
					}
				}
			}
		}
	}

	/**
	 * Determines whether a DOM node has at least one DOM element as child.
	 *
	 * @access  protected
	 * @param   \DOMNode $node The DOM node
	 * @return  bool true if DOM node has at least one DOM element as child, false otherwise
	 *
	 */
	protected function nodeHasChild( \DOMNode $node ) {
		if ( $node->hasChildNodes() ) {
			foreach ( $node->childNodes as $child ) {
				if ( $child->nodeType == XML_ELEMENT_NODE ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Converts a list of XML DOM node to an array
	 *
	 * @access  protected
	 * @param   \DOMNodeList|\DOMNode $xml The list of XML DOM node
	 * @return  array The new array
	 *
	 */
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
			if ($node->nodeName == "sub-" . $xml->nodeName) {
				$itemData[] = $this->convertToArray( $node );
			} else {
				if ( $this->nodeHasChild( $node ) ) {
					$itemData[$node->nodeName] = $this->convertToArray( $node );
				} else{
					$itemData[$node->nodeName] = trim($node->nodeValue);
				}
			}
		}
		return $itemData;
	}

	/**
	 * Filters an array with an XPath expression
	 *
	 * @access  protected
	 * @param   string $root A pseudo root node name for the XPath expression
	 * @param   array $array The array to be filtered
	 * @param   string $path The XPath expression
	 * @return  array The new array
	 *
	 */
	protected function xPathFilter( $root, $array, $path ) {
		$doc = $this->createXML($root, $array);
		return $this->xPathDOMFilter( $doc, $path );
	}

	/**
	 * Filters an XML DOM document with an XPath expression and converts it to an array
	 *
	 * @access  protected
	 * @param   \DOMDocument $doc The DOM document
	 * @param   string $path The XPath expression
	 * @param   array $namespaces (default: array() The list of namespaces
	 * @return  array The new array
	 *
	 */
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

	/**
	 * Converts an array of SimpleXMLElement to an associative array
	 *
	 * @access  public
	 * @static 
	 * @param   array|object $xml The array of SimpleXMLElement
	 * @return  array|string The associative array
	 *
	 */
	public static function xml2array($xml) {
		$result = (array)$xml;
		if (count($result) == 0) {
			$result = (string)$xml;  
		}
		if (is_array($result)) {
			foreach ($result as $key => $value){
				$key = (string)$key;
				if (is_object($value) && strpos(get_class($value),"SimpleXML")!==false) {
						$result[$key] = self::xml2array($value);
				} elseif ($key == '@attributes') {
					$keys = array_keys($value);
					$key = $keys[0];
					$item = $value[$key];
					$result[$key] = $item;
				} else {
					$result[$key] = self::xml2array($value);
				}
			}
		}
		return $result;
	}

	/**
	 *  Parses a date string according to the given format and returns its timestamp
	 *
	 * @access  public
	 * @static 
	 * @param   string $format The given format
	 * @param   string $dateStr The date string
	 * @return  int|null The timestamp or null if there is an error
	 * @throws \Exception
	 *
	 */
	public static function timestamp($format, $dateStr) {
		$result = null;
		$dateStr = trim($dateStr);
		if ($dateStr != '') {
			$date = \DateTime::createFromFormat($format, $dateStr, DateFunction::$timezone);
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
