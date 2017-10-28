<?php

/*
The MIT License (MIT)

Copyright (c) 2015-2017 Jacques Archimède

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

use EUREKA\G6KBundle\Entity\Data;
use EUREKA\G6KBundle\Entity\Source;
use EUREKA\G6KBundle\Entity\Parameter;
use EUREKA\G6KBundle\Entity\ChoiceGroup;
use EUREKA\G6KBundle\Entity\Choice;
use EUREKA\G6KBundle\Entity\ChoiceSource;

use EUREKA\G6KBundle\Manager\DOMClient as Client;
use EUREKA\G6KBundle\Manager\ResultFilter;

/**
 *
 * This class implements common functions needed in G6KBundle controllers.
 *
 * @copyright Jacques Archimède
 *
 */
class ControllersHelper {

	/**
	 * @var \EUREKA\G6KBundle\Controller\BaseAdminController|\EUREKA\G6KBundle\Controller\BaseController     $controller The controller that uses this helper
	 *
	 * @access  private
	 *
	 */
	private $controller;

	/**
	 * @var \Symfony\Component\DependencyInjection\ContainerInterface      $container The service container instance
	 *
	 * @access  private
	 *
	 */
	private $container;

	/**
	 * Constructor of class ControllersHelper
	 *
	 * @access  public
	 * @param   \EUREKA\G6KBundle\Controller\BaseAdminController|\EUREKA\G6KBundle\Controller\BaseController $controller The controller that uses this helper
	 * @param   \Symfony\Component\DependencyInjection\ContainerInterface $container The service container instance
	 * @return  void
	 *
	 */
	public function __construct($controller, $container) {
		$this->controller = $controller;
		$this->container = $container;
		$resourcesDir = $this->controller->get('kernel')->locateResource('@EUREKAG6KBundle/Resources');
		$this->controller->databasesDir = $resourcesDir . '/data/databases';
		$this->controller->simulatorsDir = $resourcesDir . '/data/simulators';
		$this->controller->publicDir = $resourcesDir . '/public';
		$this->controller->viewsDir = $resourcesDir . '/views';
	}

	/**
	 * Formats a source parameter value
	 *
	 * @access  protected
	 * @param   \EUREKA\G6KBundle\Entity\Parameter The source parameter
	 * @return  string|null The formatted value
	 *
	 */
	protected function formatParamValue(Parameter $param) {
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

	/**
	 * Returns the data source accessed by a source query
	 *
	 * @access  protected
	 * @param   \EUREKA\G6KBundle\Entity\Source $source The source
	 * @return  \EUREKA\G6KBundle\Entity\DataSource The data source
	 *
	 */
	protected function getDatasource(Source $source) {
		$datasource = $source->getDatasource();
		if (is_numeric($datasource)) {
			$datasource = $this->controller->simu->getDatasourceById((int)$datasource);
		} else {
			$datasource = $this->controller->simu->getDatasourceByName($datasource);
		}
		return $datasource;
	}

	/**
	 * Process a source query and returns the result of that query.
	 *
	 * @access  public
	 * @param   \EUREKA\G6KBundle\Entity\Source $source The source
	 * @return  mixed The result of the query.
	 *
	 */
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

	/**
	 * Populates the list of values of a data item of type choice from a data source.
	 *
	 * @access  public
	 * @param   \EUREKA\G6KBundle\Entity\Data &$data The data item of type choice
	 * @return  void
	 *
	 */
	public function populateChoiceWithSource(Data &$data) {
		$choiceSource = $data->getChoiceSource();
		if ($choiceSource !== null) {
			$this->populateChoice($data, $choiceSource);
		}
		foreach ($data->getChoices() as $choice) {
			if ($choice instanceof ChoiceGroup) {
				$choiceSource = $choice->getChoiceSource();
				if ($choiceSource !== null) {
					$this->populateChoice($data, $choiceSource);
				}
			}
		}
	}

	/**
	 * Populates the list of values of a data item of type choice from a data source where columns are in the given ChoiceSource object.
	 *
	 * @access  protected
	 * @param   \EUREKA\G6KBundle\Entity\Data &$data The data item of type choice
	 * @param   \EUREKA\G6KBundle\Entity\ChoiceSource $choiceSource The given ChoiceSource object
	 * @return  void
	 *
	 */
	protected function populateChoice(Data &$data, ChoiceSource $choiceSource) {
		$source = $choiceSource->getId();
		if ($source != "") {
			$source = $this->controller->simu->getSourceById($source);
			if ($source !== null) {
				$result = $this->processSource($source);
				if ($result !== null) {
					$n = 0;
					foreach ($result as $row) {
						$id = '';
						$value = '';
						$label = '';
						foreach ($row as $col => $cell) {
							if (strcasecmp($col, $choiceSource->getIdColumn()) == 0) {
								$id = $cell;
							} else if (strcasecmp($col, $choiceSource->getValueColumn()) == 0) {
								$value = $cell;
							} else if (strcasecmp($col, $choiceSource->getLabelColumn()) == 0) {
								$label = $cell;
							}
						}
						$id = $id != '' ? $id : ++$n;
						$choice = new Choice($data, $id, $value, $label);
						$data->addChoice($choice);
					}
				}
			}
		}
	}

	/**
	 * Returns the formatted value of the data item where the ID is in the first element of the given array.
	 * If the second element of the given array is 'L' and if the data item is a choice, the label is returned instead of the value.
	 *
	 * @access  protected
	 * @param   array $matches The given array
	 * @return  string The formatted value of the data item
	 *
	 */
	protected function replaceVariable($matches) {
		if (preg_match("/^\d+$/", $matches[1])) {
			$id = (int)$matches[1];
			$data = $this->controller->simu->getDataById($id);
		} else {
			$name = $matches[1];
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

	/**
	 * Replaces all data ID by their corresponding value into the given text.
	 *
	 * @access  public
	 * @param   string $target The target text
	 * @return  string The result text
	 *
	 */
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

	/**
	 * Prefix with a # and returns the prefixed ID of the data item where the ID is in the first element of the given array.
	 *
	 * @access  protected
	 * @param   array $matches The given array
	 * @return  string The prefixed ID
	 *
	 */
	protected function replaceVariableTag($matches)
	{
		$variable = '#' . $matches[1];
		if ($matches[2] == 'L') {
			$variable .= 'L';
		}
		return $variable;
	}

	/**
	 * Replaces all the html tag var containing the ID of a data item by # followed by the ID 
	 *
	 * @access  public
	 * @param   string $target The target text
	 * @return  string The result text
	 *
	 */
	public function replaceVarTagByVariable($target) {
		$result = preg_replace_callback(
			'/\<var\s+[^\s]*\s*data-id="(\d+)(L?)"[^\>]*\>[^\<]+\<\/var\>/',
			array($this, 'replaceVariableTag'),
			$target
		);
		return $result;
	}

	/**
	 * Returns the list of available widgets.
	 *
	 * @access  public
	 * @return  array The list of available widgets
	 *
	 */
	public function getWidgets() {
		$widgets = array();
		if ($this->container->hasParameter('widgets')) {
			foreach ($this->container->getParameter('widgets') as $name => $widget) {
				$widgets[$name] = $this->controller->get('translator')->trans($widget['label']);
			}
		}
		return $widgets;
	}

	/**
	 * Retrieves the Data object of a data item of the current simulator by its ID.
	 *
	 * @access  public
	 * @param   int $id The ID of the data item.
	 * @return  \EUREKA\G6KBundle\Entity\Data The Data object
	 *
	 */
	public function getDataById($id) {
		return $this->controller->simu !== null ? $this->controller->simu->getDataById($id) : null;
	}

	/**
	 * Retrieves an action node by its name in the actions tree from the supplied node
	 *
	 * @access  public
	 * @param   string $name The name of the action
	 * @param   array $fromNode The supplied node
	 * @return  array|null The action node
	 *
	 */
	public function findAction($name, $fromNode) {
		foreach ($fromNode as $action) {
			if ($action['name'] == $name) {
				return $action;
			}
		}
		return null;
	}

	/**
	 * Retrieves an action field node in the given fields list for the given current option node
	 *
	 * @access  public
	 * @param   array $fields The fields list
	 * @param   array $currentNode The current option node
	 * @return  array|null The action field node 
	 *
	 */
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

	/**
	 * Retrieves an action field option node by its value in the field list of the given action node
	 *
	 * @access  public
	 * @param   string $name The field name
	 * @param   string $value The option value
	 * @param   array $node The action node
	 * @return  array|null The action field option node
	 *
	 */
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

	/**
	 * Parses a date string to the given format and converts it to a DateTime object
	 *
	 * @access  public
	 * @param   string $format The given format
	 * @param   string $dateStr The date to be converted
	 * @return  \DateTime|null The DateTime object
	 * @throws \Exception
	 *
	 */
	public function parseDate($format, $dateStr) {
		if (empty($dateStr)) {
			return null;
		}
		$date = \DateTime::createFromFormat($format, $dateStr);
		$errors = \DateTime::getLastErrors();
		if ($errors['error_count'] > 0) {
			throw new \Exception("Error on date '$dateStr', expected format '$format' : " . implode(" ", $errors['errors']));
		}
		return $date;
	}

	/**
	 * Determines whether the symfony kernel is in development mode or not.
	 *
	 * @access  public
	 * @return  bool true if the symfony kernel is in development mode, false otherwise
	 *
	 */
	public function isDevelopmentEnvironment() {
		return in_array($this->controller->get('kernel')->getEnvironment(), array('test', 'dev'));
	}

}

?>
