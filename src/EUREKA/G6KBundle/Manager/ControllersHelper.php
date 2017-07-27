<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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

class ControllersHelper {

	private $controller;
	private $container;

	public function __construct($controller, $container) {
		$this->controller = $controller;
		$this->container = $container;
	}

	public function getWidgets() {
		$widgets = array();
		if ($this->container->hasParameter('widgets')) {
			foreach ($this->container->getParameter('widgets') as $name => $widget) {
				$widgets[$name] = $this->controller->get('translator')->trans($widget['label']);
			}
		}
		return $widgets;
	}

	public function getDataById($id) {
		return $this->controller->simu !== null ? $this->controller->simu->getDataById($id) : null;
	}

	public function findAction($name, $fromNode) {
		foreach ($fromNode as $action) {
			if ($action['name'] == $name) {
				return $action;
			}
		}
		return null;
	}

	public function findActionField($fields, $currentNode) {
		foreach ($fields as $field) {
			$names = array_keys($field);
			$name = $names[0];
			$value = $field[$name];
			$currentNode = $this->findActionOption($name, $value, $currentNode);
			if ($currentNode === null) { 
				return null; 
			}
		}
		return $currentNode;
	}

	public function findActionOption($name, $value, $node) {
		$fields = isset($node['fields']) ? $node['fields'] : array();
		foreach ($fields as $field) {
			if ($field['name'] == $name) {
				$options =  isset($field['options']) ? $field['options'] : array();
				foreach ($options as $option) {
					if ($option['name'] == $value) {
						return $option;
					}
				}
			}
		}
		return null;
	}

	public function isDevelopmentEnvironment() {
		return in_array($this->controller->get('kernel')->getEnvironment(), array('test', 'dev'));
	}

}

?>
