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

use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\Request;

use App\G6K\Model\Data;
use App\G6K\Model\Source;
use App\G6K\Model\Parameter;
use App\G6K\Model\ChoiceGroup;
use App\G6K\Model\Choice;
use App\G6K\Model\ChoiceSource;
use App\G6K\Model\RichText;

use App\G6K\Manager\DOMClient as Client;
use App\G6K\Manager\ResultFilter;
use App\G6K\Manager\StreamedOutput;
use App\G6K\Manager\ExpressionParser\DateFunction;
use App\G6K\Manager\ExpressionParser\NumberFunction;

/**
 *
 * This class implements common functions needed in G6KBundle controllers.
 *
 * @copyright Jacques Archimède
 *
 */
trait ControllersTrait {

	/**
	 * Initialization of common directories
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	protected function initialize() {
		$this->databasesDir = $this->projectDir . '/var/data/databases';
		$this->simulatorsDir = $this->projectDir . '/var/data/simulators';
		$this->publicDir = $this->projectDir . '/' . ($this->getParameter('public_dir') ?? 'public');
		$this->viewsDir = $this->projectDir . '/templates';
		$this->pdfFormsDir = $this->projectDir . '/var/data/pdfforms';
	}

	/**
	 * Returns the Symfony kernel
	 *
	 * @access  public
	 * @return   \Symfony\Component\HttpKernel\KernelInterface $kernel The Symfony kernel
	 *
	 */
	public function getKernel() {
		return $this->kernel;
	}

	/**
	 * Returns the translator interface
	 *
	 * @access  public
	 * @return  \Symfony\Contracts\Translation\TranslatorInterface The translator interface
	 *
	 */
	public function getTranslator() {
		return $this->translator;
	}

	/**
	 * Checks if a parameter exists or not
	 *
	 * @access  public
	 * @return  bool true the parameter exists, false otherwise
	 *
	 */
	public function hasParameter($parameters) {
		try {
			$value = $this->getParameter($parameters);
		} catch (\Exception $e) {
			$value = null;
		}
		return isset($value);
	}

	/**
	 * Returns the 'locale' from config parameters
	 *
	 * @access  public
	 * @return  string The locale
	 *
	 */
	public function getLocale() {
		return $this->getParameter('app_locale');
	}

	/**
	 * Returns the 'app_language' from config parameters
	 *
	 * @access  public
	 * @return  string The app_language
	 *
	 */
	public function getLanguage() {
		return $this->getParameter('app_language');
	}

	/**
	 * Returns the browser engine from the user agent
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request the active request
	 * @return  string The browser engine
	 *
	 */
	protected function getBrowserEngine(Request $request) {
		$engine = "";
		$useragent = ' ' . $request->headers->get('User-Agent');
		if (stripos($useragent, "trident")) {
			$engine = "trident";
		} elseif (stripos($useragent, "applewebkit")) {
			if (stripos($useragent, "edge")) {
				$engine = "edgehtml";
			} elseif (stripos($useragent, "opr")) {
				$engine = "blink";
			} elseif (stripos($useragent, "chrome")) {
				$engine = "blink";
			} else {
				$engine = "webkit";
			}
		} elseif (stripos($useragent, "presto")) {
			$engine = "presto";
		} elseif (stripos($useragent, "gecko")) {
			$engine = "gecko";
		} elseif (stripos($useragent, "robot")) {
			$engine = "robots";
		} elseif (stripos($useragent, "spider")) {
			$engine = "robots";
		} elseif (stripos($useragent, "bot")) {
			$engine = "robots";
		} elseif (stripos($useragent, "crawl")) {
			$engine = "robots";
		} elseif (stripos($useragent, "search")) {
			$engine = "robots";
		} elseif (stripos($useragent, "w3c_validator")) { 
			$engine = "validator";
		} elseif (stripos($useragent, "jigsaw")) {
			$engine = "validator";
		}
		return $engine;
	}

	/**
	 * Formats a source parameter value
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Parameter $param The source parameter
	 * @return  string|null The formatted value
	 *
	 */
	protected function formatParamValue(Parameter $param) {
		$data = $this->simu->getDataById($param->getData());
		$value = $data->getValue();
		if (strlen($value) == 0) {
			return null;
		}
		switch ($data->getType()) {
			case "date":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$dateFormat = str_replace(['d', 'm'], ['j', 'n'], $this->simu->getDateFormat());
					$date = \DateTime::createFromFormat($dateFormat, $value, DateFunction::$timezone);
					if ($date === false) {
						return null;
					}
					$value = $date->format($format);
				}
				break;
			case "day":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", $value."/1/2015");
					if ($date === false) {
						return null;
					}
					$value = $date->format($format);
				}
				break;
			case "month":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", "1/".$value."/2015");
					if ($date === false) {
						return null;
					}
					$value = $date->format($format);
				}
				break;
			case "year":
				$format = $param->getFormat();
				if ($format != "" && $value != "") {
					$date = \DateTime::createFromFormat("j/n/Y", "1/1/".$value);
					if ($date === false) {
						return null;
					}
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
	 * @param   \App\G6K\Model\Source $source The source
	 * @return  \App\G6K\Model\DataSource The data source
	 *
	 */
	protected function getDatasource(Source $source) {
		$datasource = $source->getDatasource();
		if (is_numeric($datasource)) {
			$datasource = $this->simu->getDatasourceById((int)$datasource);
		} else {
			$datasource = $this->simu->getDatasourceByName($datasource);
		}
		return $datasource;
	}

	/**
	 * Process a source query and returns the result of that query.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Source $source The source
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
					if ($param->getType() == 'path') {
						if ($value != '' || ! $param->isOptional()) {
							$path .= "/".urlencode($value);
						}
					} elseif ($param->getType() == 'data') {
						$name = $param->getName();
						$value = urlencode($value);
						if (isset($datas[$name])) {
							$datas[$name][] = $value;
						}  else {
							$datas[$name] = array($value);
						}
					} elseif ($param->getType() == 'header') {
						if ($value != '') {
							$name = 'HTTP_' . str_replace('-', '_', strtoupper($param->getName()));
							$headers[$name] = $value;
						}
					} elseif ($value != '' || ! $param->isOptional()) {
						$query .= "&".urlencode($param->getName())."=".urlencode($value);
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
				$parameters = array();
				$query = preg_replace_callback('/(\')?%(\d+)\$([sdf])\'?/', function ($m) use ($args, &$parameters) {
					$num = $m[2];
					if ($m[1] == "'") {
						array_push($parameters, array(
							'value' => $args[$num - 1],
							'type' => 'text'
						));
					} else {
						switch($m[3]) {
							case 'd':
								array_push($parameters, array(
									'value' => $args[$num - 1],
									'type' => 'integer'
								));
								break;
							case 'f':
								array_push($parameters, array(
									'value' => $args[$num - 1],
									'type' => 'number'
								));

								break;
							default:
								array_push($parameters, array(
									'value' => $args[$num - 1],
									'type' => 'text'
								));
						}
					}
					return '?';
				}, $source->getRequest());
				$database = $this->simu->getDatabaseById($datasource->getDatabase());
				$database->connect();
				$stmt = $database->prepare($query);
				foreach ($parameters as $parameter => $param) {
					$database->bindValue($stmt, $parameter + 1, $param['value'], $param['type']);
				}
				$result = $database->execute($stmt);
				break;
		}
		switch ($source->getReturnType()) {
			case 'singleValue':
				return $result;
			case 'json':
				$returnPath = $source->getReturnPath();
				$returnPath = $this->replaceVariables($returnPath);
				$json = gettype($result) == 'string' ? json_decode($result, true) : $result;
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
				$result = ResultFilter::filter("csv", $result, $returnPath, array(), $source->getSeparator(), $source->getDelimiter());
				return $result;
		}
		return null;
	}

	/**
	 * Populates the list of values of a data item of type choice from a data source.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Data &$data The data item of type choice
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
	 * @param   \App\G6K\Model\Data &$data The data item of type choice
	 * @param   \App\G6K\Model\ChoiceSource $choiceSource The given ChoiceSource object
	 * @return  void
	 *
	 */
	protected function populateChoice(Data &$data, ChoiceSource $choiceSource) {
		$source = $choiceSource->getId();
		if ($source != "") {
			$source = $this->simu->getSourceById($source);
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
			$data = $this->simu->getDataById($id);
		} else {
			$name = $matches[1];
			$data = $this->simu->getDataByName($name);
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
					$value = NumberFunction::formatNumber((float)$value, 2, $this->simu->getDecimalPoint(), $this->simu->getGroupingSeparator(), $this->simu->getGroupingSize()); 
				case 'percent':
				case 'number': 
					$value = str_replace('.', $this->simu->getDecimalPoint(), $value);
					break;
				case 'array': 
				case 'multichoice': 
					$value = implode(',', $value);
					break;
				case 'text':
					if (preg_match('/^https?\:\/\//', $value)) {
						if (preg_match('/(jpg|jpeg|gif|png|svg)$/i', $value)) {
							$value = '<img src="'.$value.'" alt="'.$value.'">';
						} else {
							$value = '<a href="'.$value.'">'.$value.'</a>';
						}
					} elseif (preg_match('/^data\:image\//', $value)) {
						$value = '<img src="'.$value.'" alt="*">';
					}
					break;
			}
			return $value;
		}
	}

	/**
	 * Replaces all data ID by their corresponding value into the given text.
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $target The target text
	 * @return  \App\G6K\Model\RichText|string The result text
	 *
	 */
	public function replaceVariables($target) {
		$text = $target instanceof RichText ? $target->getContent(): $target;
		$result = preg_replace_callback(
			'/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>(L?)/',
			array($this, 'replaceDataTag'),
			$text
		);
		$result = preg_replace_callback(
			"/#(\d+)(L?)|#\(([^\)]+)\)(L?)/",
			array($this, 'replaceVariable'),
			$text
		);
		if ($target instanceof RichText) {
			$target->setContent($result);
			return $target;
		} else {
			return $result;
		}
	}

	/**
	 * Prefix with a # and returns the prefixed ID of the data item where the ID is in the first element of the given array.
	 *
	 * @access  protected
	 * @param   array $matches The given array
	 * @return  string The prefixed ID
	 *
	 */
	protected function replaceDataTag($matches)
	{
		$variable = '#' . $matches[1];
		if ($matches[2] == 'L') {
			$variable .= 'L';
		}
		return $variable;
	}

	/**
	 * Replaces all the html tag data containing the ID of a data item by # followed by the ID 
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $target The target text
	 * @return  \App\G6K\Model\RichText|string The result text
	 *
	 */
	public function replaceDataTagByVariable($target) {
		$text = $target instanceof RichText ? $target->getContent(): $target;
		$result = preg_replace_callback(
			'/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>(L?)/',
			array($this, 'replaceDataTag'),
			$text
		);
		if ($target instanceof RichText) {
			$target->setContent($result);
			return $target;
		} else {
			return $result;
		}
	}

	/**
	 * Composes a footnote reference string [text^ID(title)] with the elements of the given array.
	 *
	 * @access  protected
	 * @param   array $matches The given array
	 * @return  string The footnote reference string
	 *
	 */
	protected function replaceDfnTag($matches)
	{
		$txt = preg_replace("/^« /", "", $matches[3]);
		$txt = preg_replace("/ »$/", "", $txt);
		$variable = '[' . $txt . '^' . $matches[1] . '(' . $matches[2] . ')]';
		return $variable;
	}

	/**
	 * Replaces all the html tag dfn containing the ID of a footnote by [text^ID(title)]
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $target The target text
	 * @return  \App\G6K\Model\RichText|string The result text
	 *
	 */
	public function replaceDfnTagByFootnote($target) {
		$text = $target instanceof RichText ? $target->getContent(): $target;
		$result = preg_replace_callback(
			'/\<dfn\s+[^\s]*\s*data-footnote="(\d+)"\s+title="([^"]+)"[^\>]*\>([^\<]+)\<\/dfn\>/',
			array($this, 'replaceDfnTag'),
			$text
		);
		if ($target instanceof RichText) {
			$target->setContent($result);
			return $target;
		} else {
			return $result;
		}
	}

	/**
	 * Replaces all the html tag dfn and data with their text equivalent
	 *
	 * @access  public
	 * @param   string $target The target text
	 * @return  string The result text
	 *
	 */
	public function replaceSpecialTags($target) {
		$result = $this->replaceDataTagByVariable($target);
		$result = $this->replaceDfnTagByFootnote($result);
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
		if ($this->hasParameter('widgets')) {
			foreach ($this->getParameter('widgets') as $name => $widget) {
				$widgets[$name] = $this->getTranslator()->trans($widget['label']);
			}
		}
		return $widgets;
	}

	/**
	 * Returns the list of available widgets by type (g6k type).
	 *
	 * @access  public
	 * @return  array The list of available widgets
	 *
	 */
	public function getWidgetsByType() {
		$types = array();
		if ($this->hasParameter('widgets')) {
			foreach ($this->getParameter('widgets') as $name => $widget) {
				$targets = $widget['target'];
				foreach($targets as $target) {
					if ($target == 'all') {
						$list = Data::TYPES;
					} else {
						$list = [$target];
					}
					foreach ($list as $type) {
						if (! isset($types[$type])) {
							$types[$type] = array();
						}
						$types[$type][] = $name;
					}
				}
			}
		}
		return $types;
	}

	/**
	 * Returns the list of available widgets by form input type.
	 *
	 * @access  public
	 * @return  array The list of available widgets
	 *
	 */
	public function getWidgetsByInputType() {
		$types = array();
		if ($this->hasParameter('widgets')) {
			foreach ($this->getParameter('widgets') as $name => $widget) {
				$inputs = $widget['input'];
				foreach($inputs as $input) {
					if ($input == 'all') {
						$list = ['select', 'checkbox', 'color', 'date', 'datetime-local', 'email', 'file', 'hidden', 'image', 'month', 'number', 'password', 'radio', 'range', 'search', 'tel', 'text', 'time', 'url', 'week'];
					} else {
						$list = [$input];
					}
					foreach ($list as $type) {
						if (! isset($types[$type])) {
							$types[$type] = array();
						}
						$types[$type][] = $name;
					}
				}
			}
		}
		return $types;
	}

	/**
	 * Returns the label of available functions.
	 *
	 * @access  public
	 * @return  array The label of available functions
	 *
	 */
	public function getFunctions() {
		$functions = array(
			'labels' => array(),
			'targets' => array()
		);
		if ($this->hasParameter('functions')) {
			foreach ($this->getParameter('functions') as $name => $function) {
				$functions['labels'][$name] = $this->getTranslator()->trans($function['label']);
				$targetsList = $function['target'];
				if (in_array('all', $targetsList)) {
					$functions['targets'][$name] = ['data', 'datagroup', 'page', 'article', 'step', 'panel', 'blockgroup', 'fieldset', 'fieldrow', 'field', 'prenote', 'postnote', 'blockinfo', 'chapter', 'section', 'content', 'annotations', 'footnote'];
				} else {
					$functions['targets'][$name] = $targetsList;
				}
			}
		}
		return $functions;
	}

	/**
	 * Retrieves the Data object of a data item of the current simulator by its ID.
	 *
	 * @access  public
	 * @param   int $id The ID of the data item.
	 * @return  \App\G6K\Model\Data|null The Data object
	 *
	 */
	public function getDataById($id) {
		return $this->simu !== null ? $this->simu->getDataById($id) : null;
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
		throw new \Exception("Unable to find the action whose name is '" . $name . "'");
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
				throw new \Exception("Unable to find the action field node in the fields : '" . json_encode($fields) . "'");
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
	 * Makes a date string from an array [year, month, day], according to the date format.
	 *
	 * @access  protected
	 * @param   array $dateArray The given array
	 * @return  string|null The date string
	 *
	 */
	protected function makeDateString($dateArray) {
			switch ($this->simu->getDateFormat()) {
				case 'd/m/Y':
					return $dateArray['day'] . "/" . $dateArray['month'] . "/" . $dateArray['year'];
				case 'm/d/Y':
					return $dateArray['month'] . "/" . $dateArray['day'] . "/" . $dateArray['year'];
				case 'd-m-Y':
					return $dateArray['day'] . "-" . $dateArray['month'] . "-" . $dateArray['year'];
				case 'm-d-Y':
					return $dateArray['month'] . "-" . $dateArray['day'] . "-" . $dateArray['year'];
				case 'd.m.Y':
					return $dateArray['day'] . "." . $dateArray['month'] . "." . $dateArray['year'];
				case 'm.d.Y':
					return $dateArray['month'] . "." . $dateArray['day'] . "." . $dateArray['year'];
				case 'Y-m-d':
					return $dateArray['year'] . "-" . $dateArray['month'] . "-" . $dateArray['day'];
				case 'Y.m.d':
					return $dateArray['year'] . "." . $dateArray['month'] . "." . $dateArray['day'];
				case 'Y/m/d':
					return $dateArray['year'] . "/" . $dateArray['month'] . "/" . $dateArray['day'];
				case 'Y-d-m':
					return $dateArray['year'] . "-" . $dateArray['day'] . "-" . $dateArray['month'];
				case 'Y.d.m':
					return $dateArray['year'] . "." . $dateArray['day'] . "." . $dateArray['month'];
				case 'Y/d/m':
					return $dateArray['year'] . "/" . $dateArray['day'] . "/" . $dateArray['month'];
			}
			return null;
	}

	/**
	 * Return a relative path to a file or directory using base directory. 
	 * 
	 * @param   String   $base   A base path used to construct relative path. For example /website
	 * @param   String   $path   A full path to file or directory used to construct relative path. For example /website/store/library.php
	 * 
	 * @return  String
	 */
	private function getRelativePath($base, $path) {
		$base = str_replace('\\', '/', $base);
		$path = str_replace('\\', '/', $path);
		$pos = strpos($path, $base);
		if ($pos !== false && $pos == 0) {
			$path = substr($path , strlen($base) + 1);
		}
		return $path;
	}

	/**
	 * Run a console command.
	 *
	 * @param   array $command The command
	 * @param   array|null &$report An array for receiving the output of the command
	 * @return bool
	 *
	 */
	private function runConsoleCommand($command, &$report = null) {
		$application = new Application($this->getKernel());
		$application->setAutoExit(false);
		$command['--no-debug'] = true;
		$command['--no-interaction'] = true;
		if (preg_match("/^g6k:/", $command['command'])) {
			$command['--html'] = true;
		}
		$input = new ArrayInput($command);
		$output = new BufferedOutput(
			OutputInterface::VERBOSITY_NORMAL, // VERBOSITY_QUIET, VERBOSITY_NORMAL, VERBOSITY_VERBOSE, VERBOSITY_VERY_VERBOSE or VERBOSITY_DEBUG
			false // true for decorated
		);
		$returnCode = $application->run($input, $output);
		if ($report !== null) {
			$translator = $this->translator;
			$report = array_merge(
				$report, 
				array_map(
					function($elem) use ($translator) {
						return "<br> " . $translator->trans(trim($elem), array(), 'commands');
					}, 
					preg_split("/[\r\n]+/", trim($output->fetch()))
				)
			);
		}
		return $returnCode == 0;
	}

	/**
	 * Run a streamed console command.
	 *
	 * @param   array $command The command
	 * @param   callable $start a callback function to be called at the begining of the stream
	 * @param   callable $end a callback function to be called at the end of the stream
	 * @return \Symfony\Component\HttpFoundation\StreamedResponse
	 *
	 */
	private function runStreamedConsoleCommand($command, callable $start, callable $end) {
		$application = new Application($this->getKernel());
		$application->setAutoExit(false);
		$command['--no-debug'] = true;
		$command['--no-interaction'] = true;
		if (preg_match("/^g6k:/", $command['command'])) {
			$command['--html'] = true;
		}
		$input = new ArrayInput($command);
		$input->setInteractive(false);
		$output = new StreamedOutput(fopen('php://stdout', 'w'));
 		$response = new StreamedResponse(function() use ($application, $input, $output, $start, $end) {
			call_user_func($start);
			$returnCode = $application->run($input, $output);
			call_user_func($end, $returnCode == 0);
		});
		return $response;
	}

	/**
	 * Determines whether the symfony kernel is in development mode or not.
	 *
	 * @access  public
	 * @return  bool true if the symfony kernel is in development mode, false otherwise
	 *
	 */
	public function isDevelopmentEnvironment() {
		return in_array($this->getKernel()->getEnvironment(), array('test', 'dev'));
	}

	/**
	 * Returns the current environment
	 *
	 * @access  public
	 * @return  string The first letters of the current environment 
	 *
	 */
	public function getEnvironment() {
		return $this->getKernel()->getEnvironment();
	}

}

?>
