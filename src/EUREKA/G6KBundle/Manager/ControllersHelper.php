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

use EUREKA\G6KBundle\Entity\Source;

use EUREKA\G6KBundle\Manager\DOMClient as Client;
use EUREKA\G6KBundle\Manager\ResultFilter;

class ControllersHelper {

	private $controller;
	private $container;

	public function __construct($controller, $container) {
		$this->controller = $controller;
		$this->container = $container;
	}

	protected function formatParamValue($param)	{
		$data = $this->controller->simu->getDataById($param->getData());
		$value = $data->getValue();
		if (strlen($value) == 0) {
			return null;
		}
		switch ($data->getType()) {
			case "date":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", $value);
					$value = $date->format($format);
				}
				break;
			case "day":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", $value."/1/2015");
					$value = $date->format($format);
				}
				break;
			case "month":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", "1/".$value."/2015");
					$value = $date->format($format);
				}
				break;
			case "year":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", "1/1/".$value);
					$value = $date->format($format);
				}
				break;
		}
		return $value;
	}

	protected function getDatasource(Source $source) {
		$datasource = $source->getDatasource();
		if (is_numeric($datasource)) {
			$datasource = $this->controller->simu->getDatasourceById((int)$datasource);
		} else {
			$datasource = $this->controller->simu->getDatasourceByName($datasource);
		}
		return $datasource;
	}

	public function processSource(Source $source) {
		$params = $source->getParameters();
		$datasource = $this->getDatasource($source);
		switch ($datasource->getType()) {
			case 'uri':
				$query = "";
				$path = "";
				$datas = array();
				$headers = array();
				foreach ($params as $param) {
					if ($param->getOrigin() == 'data') {
						$value = $this->formatParamValue($param);
					} else {
						$value = $param->getConstant();
					}
					if ($value === null) { 
						if (! $param->isOptional()) {
							return null;
						}
						$value = '';
					}
					$value = urlencode($value);
					if ($param->getType() == 'path') {
						if ($value != '' || ! $param->isOptional()) {
							$path .= "/".$value;
						}
					} elseif ($param->getType() == 'data') {
						$name = $param->getName();
						if (isset($datas[$name])) {
							$datas[$name][] = $value;
						}  else {
							$datas[$name] = array($value);
						}
					} elseif ($param->getType() == 'header') {
						if ($value != '') {
							$name = 'HTTP_' . str_replace('-', '_', strtoupper($param->getName()));
							$headers[] = array(
								$name => $value
							);
						}
					} elseif ($value != '' || ! $param->isOptional()) {
						$query .= "&".urlencode($param->getName())."=".$value;
					}
				}
				$uri = $datasource->getUri();
				if ($path != "") {
					$uri .= $path;
				} 
				if ($query != "") {
					$uri .= "?".substr($query, 1);
				}
				if (isset($this->controller->uricache[$uri])) {
					$result = $this->controller->uricache[$uri];
				} else {
					$client = Client::createClient();
					if (strcasecmp($datasource->getMethod(), "GET") == 0) {
						$result = $client->get($uri, $headers);
					} else {
						$result = $client->post($uri, $headers, $datas);
					}
					$this->controller->uricache[$uri] = $result;
				}
				break;
			case 'database':
			case 'internal':
				$args = array();
				$args[] = $source->getRequest();
				foreach ($params as $param) {
					if ($param->getOrigin() == 'data') {
						$value = $this->formatParamValue($param);
					} else {
						$value = $param->getConstant();
					}
					if ($value === null) { 
						if (! $param->isOptional()) {
							return null;
						}
						$value = '';
					}
					$args[] = $value;
				}
				$query = call_user_func_array('sprintf', $args);
				$database = $this->controller->simu->getDatabaseById($datasource->getDatabase());
				$database->connect();
				$result = $database->query($query);
				break;
		}
		switch ($source->getReturnType()) {
			case 'singleValue':
				return $result;
			case 'json':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$json = json_decode($result, true);
				$result = ResultFilter::filter("json", $json, $returnPath);
				return $result;
			case 'assocArray':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$keys = explode("/", $returnPath);
				foreach ($keys as $key) {
					if (preg_match("/^([^\[]+)\[([^\]]+)\]$/", $key, $matches)) {
						$key1 = $matches[1];
						if (! isset($result[$key1])) {
							break;
						}
						$result = $result[$key1];
						$key = $matches[2];
					}
					if (ctype_digit($key)) {
						$key = (int)$key;
					}
					if (! isset($result[$key])) {
						break;
					}
					$result = $result[$key];
				}
				return $result;
			case 'html':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$result = ResultFilter::filter("html", $result, $returnPath, $datasource->getNamespaces());
				return $result;
			case 'xml':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$result = ResultFilter::filter("xml", $result, $returnPath, $datasource->getNamespaces());
				return $result;
			case 'csv':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$result = ResultFilter::filter("csv", $result, $returnPath, null, $source->getSeparator(), $source->getDelimiter());
				return $result;
		}
		return null;
	}

	protected function replaceVariable($matches) {
		if (preg_match("/^\d+$/", $matches[1])) {
			$id = (int)$matches[1];
			$data = $this->controller->simu->getDataById($id);
		} else {
			$name = $matches[3];
			$data = $this->controller->simu->getDataByName($name);
		}
		if ($data === null) {
			return $matches[0];
		}
		if ($matches[2] == 'L') { 
			$value = $data->getChoiceLabel();
			if ($data->getType() == 'multichoice') {
				$value = implode(',', $value);
			}
			return $value;
		} else {
			$value = $data->getValue();
			switch ($data->getType()) {
				case 'money': 
					$value = number_format ( (float)$value , 2 , "." , " "); 
				case 'percent':
				case 'number': 
					$value = str_replace('.', ',', $value);
					break;
				case 'array': 
				case 'multichoice': 
					$value = implode(',', $value);
					break;
			}
			return $value;
		}
	}

	public function replaceVariables($target) {
		$result = preg_replace_callback(
			'/\<var\s+[^\s]*\s*data-id="(\d+)(L?)"[^\>]*\>[^\<]+\<\/var\>/',
			array($this, 'replaceVariableTag'),
			$target
		);
		$result = preg_replace_callback(
			"/#(\d+)(L?)|#\(([^\)]+)\)(L?)/",
			array($this, 'replaceVariable'),
			$result
		);
		return $result;
	}

	protected function replaceVariableTag($matches)
	{
		$variable = '#' . $matches[1];
		if ($matches[2] == 'L') {
			$variable .= 'L';
		}
		return $variable;
	}

	public function replaceVarTagByVariable($target) {
		$result = preg_replace_callback(
			'/\<var\s+[^\s]*\s*data-id="(\d+)(L?)"[^\>]*\>[^\<]+\<\/var\>/',
			array($this, 'replaceVariableTag'),
			$target
		);
		return $result;
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
