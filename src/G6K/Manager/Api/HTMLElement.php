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

class HTMLElement {

	const BLOCKTAGS = ['address', 'applet', 'article', 'aside', 'audio', 'blockquote', 'body', 'br', 'caption', 'canvas', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'iframe', 'legend', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'p', 'pre', 'section', 'style', 'table', 'tbody', 'td', 'th', 'thead', 'title', 'tr', 'tfoot', 'ul', 'video'];
	const INLINETAGS = ['a', 'abbr', 'acronym', 'b', 'bdi', 'bdo', 'big', 'br', 'button', 'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'mark', 'object', 'optgroup', 'option', 'picture', 'progress', 'q', 'rb', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'time', 'tt', 'u', 'var'];
	const EMPTYTAGS = ['area', 'base', 'br', 'col', 'embed', 'frame', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

	private $document;
	private $element;
	private $tags;

	public function __construct($element, $document) {
		$this->element = $element;
		$this->document = $document;
		$this->tags = array_merge(self::BLOCKTAGS, self::INLINETAGS, self::EMPTYTAGS);
	}

	public function get() {
		return $this->element;
	}

	public function doc() {
		return $this->element->ownerDocument;
	}

	public function addClass(...$classes) {
		$conditionVerified = $this->checkCondition($classes);
		if ($conditionVerified) {
			if ($this->element->hasAttribute('class')) {
				$oldclasses = preg_split("/\s+/", $this->element->getAttribute('class'));
				$classes = array_merge($oldclasses, $classes);
			}
			$this->element->setAttribute('class', implode(' ', $classes));
		}
		return $this;
	}

	public function toggleClass(...$classes) {
		$conditionVerified = $this->checkCondition($classes);
		if ($conditionVerified) {
			if ($this->hasAttribute('class')) {
				foreach($classes as $class) {
					if ($this->hasClass($class)) {
						$this->removeClass($class);
					} else {
						$this->addClass($class);
					}
				}
			} else {
				$this->element->setAttribute('class', implode(' ', $classes));
			}
		}
		return $this;
	}

	public function removeClass(...$classes) {
		$conditionVerified = $this->checkCondition($classes);
		if ($conditionVerified) {
			if ($this->hasAttribute('class')) {
				$oldclasses = preg_split("/\s+/", $this->element->getAttribute('class'));
				$classes = array_diff($oldclasses, $classes);
				if (!empty($classes)) {
					$this->element->setAttribute('class', implode(' ', $classes));
				} else {
					$this->element->removeAttribute('class');
				}
			}
		}
		return $this;
	}

	public function replaceClass($classname1, $classname2, $conditionVerified = true) {
		if ($conditionVerified) {
			if ($this->hasAttribute('class')) {
				$classes = preg_split("/\s+/", $this->element->getAttribute('class'));
				if (($pos = array_search($classname1, $classes)) !== false) {
					$classes[$pos] = $classname2;
					$this->element->setAttribute('class', implode(' ', $classes));
				}
			}
		}
		return $this;
	}

	public function hasClass($classname) {
		if ($this->hasAttribute('class')) {
			$class = $this->element->getAttribute('class');
			return preg_match("/\b" . $classname . "\b/", $class);
		}
		return false;
	}

	public function attr($attributes, $value = null) {
		if (is_object($attributes)) {
			foreach($attributes as $attribute => $value) {
				$this->element->setAttribute($attribute, $value);
			}
		} else if (gettype($attributes) == 'string') {
			if (null !== $value) {
				$this->element->setAttribute($attributes, $value);
			} else {
				return $this->element->getAttribute($attributes);
			}
		}
		return $this;
	}

	public function setAttr($attribute, $value, $conditionVerified = true) {
		if ($conditionVerified) {
			$this->element->setAttribute($attribute, $value);
		}
		return $this;
	}

	public function removeAttr(...$attributes) {
		$conditionVerified = $this->checkCondition($attributes);
		if ($conditionVerified) {
			foreach($attributes as $attribute) {
				$this->element->removeAttribute($attribute);
			}
		}
		return $this;
	}

	public function hasAttribute($attribute) {
		return  $this->element->nodeType === XML_ELEMENT_NODE
		&& $this->element->hasAttribute($attribute);
	}

	public function is($tag) {
		return $this->element->nodeType === XML_ELEMENT_NODE
		&& $this->element->tagName == $tag;
	}

	public function append($tag, ...$args) {
		if ($tag instanceof HTMLElement) {
			$node = $tag;
		} else {
			[$attributes, $content] = $this->args($args);
			$node = $this->create($tag, $attributes, $content);
		}
		$this->element->appendChild($node);
		return new HTMLElement($node, $this->document);
	}

	public function prepend($tag, ...$args) {
		if ($tag instanceof HTMLElement) {
			$node = $tag;
		} else {
			[$attributes, $content] = $this->args($args);
			$node = $this->create($tag, $attributes, $content);
		}
		$firstChild = $this->element->firstChild;
		if (null !== $firstChild) {
			$this->element->insertBefore($node, $firstChild);
		} else {
			$this->element->appendChild($node);
		}
		return new HTMLElement($node, $this->document);
	}

	public function before($tag, ...$args) {
		if ($tag instanceof HTMLElement) {
			$node = $tag;
		} else {
			[$attributes, $content] = $this->args($args);
			$node = $this->create($tag, $attributes, $content);
		}
		$this->element->parentNode->insertBefore($node, $this->element);
		return new HTMLElement($node, $this->document);
	}

	public function after($tag, ...$args) {
		if ($tag instanceof HTMLElement) {
			$node = $tag;
		} else {
			[$attributes, $content] = $this->args($args);
			$node = $this->create($tag, $attributes, $content);
		}
		$nextSibling = $this->element->nextSibling;
		if (null !== $nextSibling) {
			$this->element->parentNode->insertBefore($node, $nextSibling);
		} else {
			$this->element->parentNode->appendChild($node);
		}
		return new HTMLElement($node, $this->document);
	}

	public function wrap($tag, ...$args) {
		if ($tag instanceof HTMLElement) {
			$node = $tag;
		} else {
			[$attributes, $content] = $this->args($args);
			$node = $this->create($tag, $attributes, $content);
		}
		$node->appendChild($this->element->clone(true));
		$this->parentNode->replaceChild($node, $this->element);
		return new HTMLElement($node, $this->document);
	}

	public function first() {
		$first = $this->element->firstChild;
		return $first !== null ? new HTMLElement($first, $this->document): null;
	}

	public function last() {
		$last = $this->element->lastChild;
		return $last !== null ? new HTMLElement($last, $this->document): null;
	}

	public function unwrap() {
		$parent = $this->element->parentNode;
		$parent->parentNode->replaceChild($this->element, $parent);
		return $this;
	}

	public function empty() {
		$children = $this->element->childNodes;
		foreach($children as $child) {
			$this->element->removeChild($child);
		}
		return $this;
	}

	public function remove() {
		$parent = $this->element->parentNode;
		$parent->removeChild($this->element);
	}

	public function detach() {
		$this->remove();
	}

	public function next() {
		$nextSibling = $this->element->nextSibling;
		if (null !== $nextSibling) {
			return new HTMLElement($nextSibling, $this->document);
		}
		return null;
	}

	public function prev() {
		$previousSibling = $this->$element->previousSibling;
		if (null !== $previousSibling) {
			return new HTMLElement($previousSibling, $this->document);
		}
		return null;
	}

	public function parent($level = 1) {
		$parent = $this->element->parentNode;
		for ($i = 1; $i < $level && null !== $parent; $i++) {
			$parent = $parent->parentNode;
		}
		return null !== $parent ? new HTMLElement($parent, $this->document) : null;
	}

	public function children() {
		$children = [];
		foreach($this->element->childNodes as $child) {
			if ($child->nodeType === XML_ELEMENT_NODE) {
				$children[] = new HTMLElement($child, $this->document);
			}
		}
		return $children;
	}

	public function index() {
		$index = -1;
		foreach($this->element->parentNode->childNodes as $i => $child) {
			if ($child->nodeType === XML_ELEMENT_NODE) {
				$index++;
			}
			if ($child === $this->element) {
				break;
			}
		}
		return $index;
	}

	public function traverse(callable $callback) {
		foreach($this->element->childNodes as $child) {
			$node = new HTMLElement($child, $this->document);
			call_user_func($callback, $node);
			if ($child->nodeType === XML_ELEMENT_NODE) {
				$node->traverse($callback);
			}
		}
	}

	public function find($selector) {
		$nodes = [];
		$expr = $this->document->selectorConverter->toXPath($selector);
		$entries = $this->document->xpath->evaluate($expr, $this->element);
		if ($entries !== false) {
			foreach($entries as $entry) {
				$nodes[] = new HTMLElement($entry, $this);
			}
		}
		return $nodes;
	}

	public function args($args) {
		$attributes = [];
		$content = '';
		foreach($args as $arg) {
			switch (gettype($arg)) {
				case 'array':
					$attributes = $arg;
					break;
				case 'string':
					$content = $arg;
					break;
				case 'boolean':
				case 'integer':
				case 'double':
				case 'float':
					$content = strval($arg);
					break;
			}
		}
		return [$attributes, $content];
	}

	private function checkCondition(&$args) {
		$conditionVerified = true;
		if (is_array($args) && count($args) > 0 && gettype(end($args)) == 'boolean') {
			$conditionVerified = array_pop($args);
		}
		return $conditionVerified;
	}

	private function createDocumentFragment($html) {
		if (function_exists('tidy_parse_string')) {
			$tidy = tidy_parse_string($html, [
				'logical-emphasis' => true,
				'output-html' => true,
				'show-body-only' => true,
				'show-errors' => 0,
				'show-warnings' => false,
				'char-encoding' => 'utf8'
			], 'utf8');
			$tidy->cleanRepair();
			$html = tidy_get_output($tidy);
			$html = preg_replace("/[\r]/", "", $html);
			$html = preg_replace("/[\n]/", " ", $html);
		}
		$dom = new \DOMImplementation;
		$doctype = $dom->createDocumentType('html');
		$doc = $dom->createDocument((string)null, 'html', $doctype);
		$doc->encoding='UTF-8';
		libxml_use_internal_errors(true);
		$html = $doc->loadHTML(utf8_decode($html), LIBXML_NOWARNING);
		$xml = $doc->saveXML($doc->documentElement->firstChild);
		$xml = str_replace(['<body>', '</body>'], ['<fragment>', '</fragment>'], $xml);
		$fragment = $this->doc()->createDocumentFragment();
		$fragment->appendXML($xml);
		return $fragment;
	}

	private function create($tag, $attributes, $content) {
		$node = null;
		if (preg_match("/^\<([^\>]+)\>$/", $tag, $m)) {
			if (in_array($m[1], $this->tags)) {
				$tag = $m[1];
				$node = $this->doc()->createElement($tag);
				foreach ($attributes as $name => $value) {
					$node->setAttribute($name, (string)$value);
				}
				if ($content !== '') {
					if (preg_match("/\<[^\>]+\>/", $content)) {
						$fragment = $this->createDocumentFragment($content);
						$node->appendChild($fragment);
					} else {
						$text = $this->doc()->createTextNode($content);
						$node->appendChild($text);
					}
				}
			} elseif (preg_match("/^\<!/", $tag, $m)) {
				$node = $this->doc()->createTextNode($tag);
			} else {
				$node = $this->createDocumentFragment($tag);
			}
		} else {
			$node = $this->doc()->createTextNode($tag);
		}
		return $node;
	}

}
