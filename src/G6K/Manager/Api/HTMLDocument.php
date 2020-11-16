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

use Symfony\Component\CssSelector\CssSelectorConverter;

class HTMLDocument {

	private $doc;
	public $xpath;
	public $selectorConverter;
	private $root;
	private $head;
	private $body;

	public function __construct($title, $lang = 'fr') {
		$dom = new \DOMImplementation;
		$doctype = $dom->createDocumentType('html');
		$this->doc = $dom->createDocument((string)null, 'html', $doctype);
		$dom->preserveWhiteSpace  = false;
		$this->doc->formatOutput = true;
		$this->doc->encoding='UTF-8';
		$this->selectorConverter = new CssSelectorConverter();
		if (preg_match("/\.html$/", $title) && file_exists($title)) {
			libxml_use_internal_errors(true);
			$this->doc->loadHTMLFile($title);
			$this->xpath = new \DOMXPath($this->doc);
			$this->root = new HTMLElement($this->doc->documentElement, $this);
			$this->current = $this->doc->documentElement;
			$this->current->setAttribute('lang', substr($lang, 0, 2));
			$this->head = $this->find('head')[0];
			$this->body = $this->find('body')[0];
		} else {
			$this->xpath = new \DOMXPath($this->doc);
			$this->root = new HTMLElement($this->doc->documentElement, $this);
			$this->current = $this->doc->documentElement;
			$this->current->setAttribute('lang', substr($lang, 0, 2));
			$this->head = $this->root->append('<head>');
			$this->head->append('<title>', $title);
			$this->head->append('<meta>', ['charset'=>'utf-8']);
			$this->head->append('<meta>', ['http-equiv'=>'Content-Type', 'content'=>'text/html; charset=UTF-8']);
			$this->head->append('<meta>', ['http-equiv'=>'X-UA-Compatible', 'content'=>'IE=Edge']);
			$this->head->append('<meta>', ['name'=>'viewport', 'content'=>'width=device-width, initial-scale=1.0']);
			$this->body = $this->root->append('<body>');
			$this->body->append('<noscript>')->append('<p>', ['class'=>'text-center text-danger'], 'Javascript est desactivé dans votre navigateur.');
		}
	}

	public function root() {
		return $this->root;
	}

	public function head() {
		return $this->head;
	}

	public function body() {
		return $this->body;
	}

	public function find($selector) {
		return $this->root->find($selector);
	}

	public function traverse(callable $callback) {
		$this->root->traverse($callback);
	}

	public function html($element = null) {
		if (null !== $element) {
			$element = $element->get();
		}
		$xml = $this->doc->saveXML($element, LIBXML_NOEMPTYTAG|LIBXML_NOXMLDECL );
		$html = preg_replace('/\<\?xml version="1.0" encoding="UTF-8"( standalone="yes")?\?\\r?>\n/', '', $xml);
		if  (!preg_match('/class="browsehappy"/', $html)) {
			$html = preg_replace('/\<\/noscript\>/', "</noscript>\n  " . implode("\n  ", [
				'  <!--[if lt IE 8]>',
				'  <div class="browsehappy">',
				'    <div class="container">',
				'      <p>Savez-vous que votre navigateur est obsolète ?</p>',
				'      <p>Pour naviguer de la manière la plus satisfaisante sur le Web, nous vous recommandons de procéder à une <a href="http://windows.microsoft.com/fr-fr/internet-explorer/download-ie">mise à jour de votre navigateur</a>.<br>Vous pouvez aussi <a href="http://browsehappy.com/">essayer d’autres navigateurs web populaires</a>.</p>',
				'    </div>',
				'  </div>',
				'  <![endif]-->'
			]), $html);
		}
		foreach(HTMLElement::EMPTYTAGS as $tag) {
			$html = str_replace('</' . $tag . '>', '', $html);
		}
		$html = str_replace('&amp;', '&', $html);
		$html = preg_replace('/\/\>/', '>', $html);
		$html = preg_replace("/\<fragment\>\n?/", '', $html);
		$html = preg_replace("/\<\/fragment\>/", '', $html);
		$html = preg_replace("/\<p\>\s+\<br\>\s+\<br\>\s+\<\/p\>/", '<br><br>', $html);
		$html = preg_replace("/\<p\>\s+\<br\>\s+\<\/p\>/", '<br>', $html);
		$html = preg_replace('/^(\s+)(\<meta http-equiv="X-UA-Compatible" content="IE=Edge")\>/m', "$1<!--[if IE]>\n$1$2\n$1<![endif]-->", $html);
		$html = preg_replace('/\<html lang="([^\"]+)"\>/m', implode("\n", [
			'<!-- paulirish.com/2008/conditional-stylesheets-vs-css-hacks-answer-neither/ -->',
			'<!--[if lt IE 7 ]> <html lang="fr" class="no-js ie ie6" dir="ltr"> <![endif]-->',
			'<!--[if IE 7 ]>    <html lang="fr" class="no-js ie ie7" dir="ltr"> <![endif]-->',
			'<!--[if IE 8 ]>    <html lang="fr" class="no-js ie ie8" dir="ltr"> <![endif]-->',
			'<!--[if IE 9 ]>    <html lang="fr" class="no-js ie ie9" dir="ltr"> <![endif]-->',
			'<!--[if (gt IE 9)|!(IE)]><!-->',
		]) . "\n<html lang=\"$1\"><!--<![endif]-->", $html);
		$html = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $html);
		return $html;
	}

}
