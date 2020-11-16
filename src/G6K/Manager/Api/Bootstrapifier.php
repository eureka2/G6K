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

use App\G6K\Manager\Api\HTMLDocument;

class Bootstrapifier {

	private $options;

	public function __construct(?array $options = []) {
		$this->options = (object)array_merge(
			[
				'version' => '4.5.2',
				'container' => '.simulator-container',
				'markup' => 'fragment' // 'fragment' or 'page'
			],
			$options
		);
	}

	public function bootstrapify(HTMLDocument &$document) {
		$container = $document->find($this->options->container);
		if (count($container) > 0) {
			$container[0]->addClass('container');
		}
		$document->traverse(function($node) {
			if ($node->is('input')) {
				$type = $node->attr('type');
				if ($type != 'hidden') { 
					$node->addClass('form-control');
					if ($type != 'date') {
						$node->addClass('col-sm-2');
					}
				}
			} elseif ($node->is('select')) {
				$node->addClass('form-control', 'custom-select');
			} elseif ($node->is('textarea')) {
				$node->addClass('form-control');
			} elseif ($node->is('label')) {
				$node->addClass('col-form-label');
			} elseif ($node->is('button')) {
				$node->addClass('btn');
				if ($node->hasClass('btn-default')) {
					$node->addClass('btn-secondary');
				}
			} else {
				if ($node->hasClass('field-container')) {
					$node->addClass('form-group', 'row');
				}
				if ($node->hasClass('field-group')) {
					$node->addClass('input-group');
				}
			}
		});
		if ($this->options->markup == 'page') {
			$this->addStylesheet($document, $this->options->version);
			$this->addScript($document, $this->options->version);
		}
	}

	private function addStylesheet(&$document, $version) {
		$links = $document->find('link[rel=stylesheet][href]');
		foreach ($links as $link) {
			if (preg_match("/bootstrap/", $link->attr('href'))) {
				return;
			}
		}
		$document->head()->append('<link>', [
			'type' => 'text/css',
			'rel' => 'stylesheet',
			'href' => 'https://stackpath.bootstrapcdn.com/bootstrap/' . $version . '/css/bootstrap.min.css'
		]);
	}

	private function addScript(&$document, $version) {
		$jqueryScript = null;
		$bootstrapScript = null;
		$scripts = $document->find('script[src]');
		foreach ($scripts as $script) {
			if (preg_match("/bootstrap/", $script->attr('src'))) {
				$bootstrapScript = $script;
				break;
			}
		}
		if (null === $bootstrapScript) {
			foreach ($scripts as $script) {
				if (preg_match("/jquery/", $script->attr('src'))) {
					$jqueryScript = $script;
					break;
				}
			}
			if (null === $jqueryScript) {
				$jqueryScript = $document->body()->append('<script>', [
					'type' => 'text/javascript',
					'src' => 'https://code.jquery.com/jquery-3.3.1.slim.min.js'
				]);
			} 
			$nextSibling = $jqueryScript->next();
			if (null == $nextSibling) {
				$document->body()->append('<script>', [
					'type' => 'text/javascript',
					'src' => 'https://stackpath.bootstrapcdn.com/bootstrap/' . $version . '/js/bootstrap.bundle.min.js'
				]);
			} else {
				$nextSibling->before('<script>', [
					'type' => 'text/javascript',
					'src' => 'https://stackpath.bootstrapcdn.com/bootstrap/' . $version . '/js/bootstrap.bundle.min.js'
				]);
			}
		}
	}

}
