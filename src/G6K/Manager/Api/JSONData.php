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

use App\G6K\Model\RichText;;
use Symfony\Component\Yaml\Yaml;

/**
 *
 * This class allows the storage and retrieval of the attributes of a simulator.
 *
 * @author    Jacques Archimède
 *
 */
class JSONData {

	private $projectDir;

	private $options = [];

	/**
	 * @var string|int     $name The name of this simulator. It will be part of the URL (* .../calcul/simulator-name *) and the name of the XML definition file 
	 *
	 * @access  private
	 *
	 */
	private $name = "";

	/**
	 * @var array      $datas The list of data used by this simulator.
	 *
	 * @access  private
	 *
	 */
	private $datas = [];

	/**
	 * @var array      $datagroups The list of datagroup used by this simulator.
	 *
	 * @access  private
	 *
	 */
	private $datagroups = [];

	/**
	 * @var string     $dependencies The name of a data dependency
	 *
	 * @access  private
	 *
	 */
	private $dependencies = "";

	private $allowedWidgets = [];
	private $widgets = [];
	private $widgetDependencies = [];

	private $allowedFunctions = [];
	private $functions = [];
	private $functionDependencies = [];

	/**
	 * Constructor of class JSONData
	 *
	 * @access  public
	 * @return  void
	 *
	 */
	public function __construct($projectDir, $options = []) {
		$this->projectDir = $projectDir;
		$this->options = array_merge(
			[
				'flattenChoiceGroup' => true
			],
			$options
		);
		$this->allowedWidgets = $this->allowedWidgets();
		$this->allowedFunctions = $this->allowedFunctions();
	}

	/**
	 * Adds a dependency for the data item whose ID is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches The given array
	 * @return  string The name of the data item
	 *
	 */
	private function addDependency ($matches) {
		$id = $matches[1];
		$dependency = $this->name;
		if (! isset($this->datas[$id][$this->dependencies])) {
				$this->datas[$id][$this->dependencies] = [];
		}
		foreach ($this->datas[$id][$this->dependencies] as $d) {
			if ($d == $dependency) {
				return $this->datas[$id]['name'];
			}
		}
		$this->datas[$id][$this->dependencies][] = $dependency;
		return $this->datas[$id]['name'];
	}

	/**
	 * Adds a note (field pre-note, field post-note, footnote) dependency for the data item is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches <parameter description>
	 * @return  string The name of the data surrounded by '#(' and ')'
	 *
	 */
	private function addNoteDependency ($matches) {
		return "#(".$this->addDependency ($matches).")";
	}

	/**
	 * Returns the name surrounded by '#(' and ')' of the data item whose ID is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches The given array
	 * @return  string The name of the data surrounded by '#(' and ')'
	 *
	 */
	private function replaceDataIdByName($matches) {
		$id = $matches[1];
		return $this->datas[$id] ? "#(" . $this->datas[$id]['name'] . ")" : "#" . $id;
	}

	/**
	 * Replaces, into the given text, the ID (prefixed with # or inside a HTML data) of all data by their name surrounded by '#(' and ')'.
	 *
	 * @access  private
	 * @param   string $target The initial text
	 * @return  string The replaced text with data names
	 *
	 */
	private function replaceIdByName($target) {
		$result = preg_replace_callback(
			'/\<data\s+[^\s]*\s*value="(\d+)"[^\>]*\>[^\<]+\<\/data\>/',
			[$this, 'replaceDataIdByName'],
			$target
		);
		return preg_replace_callback(
			"/#(\d+)/", 
			[$this, 'replaceDataIdByName'],
			$result
		);
	}

	/**
	 * Returns the name of the data item whose ID is in the first element of the given array
	 *
	 * @access  private
	 * @param   array $matches Tha given array
	 * @return  string the name of the data item
	 *
	 */
	private function replaceIdByDataName($matches) {
		$id = $matches[1];
		return $this->datas[$id] ? $this->datas[$id]['name']: "#" . $id;
	}

	/**
	 * Replaces, into the given text, the ID (prefixed with # or inside a HTML data) of all data by their name.
	 *
	 * @access  private
	 * @param   string $target The initial text
	 * @return  string The replaced text with data names
	 *
	 */
	private function replaceByDataName($target) {
		return preg_replace_callback(
			"/#(\d+)/", 
			[$this, 'replaceIdByDataName'],
			$target
		);
	}

	/**
	 * Converts the lines of the given text into HTML paragraphs
	 *
	 * @access  public
	 * @param   \App\G6K\Model\RichText|string $string <parameter description>
	 * @return  \App\G6K\Model\RichText|string <description of the return value>
	 *
	 */
	public function paragraphs ($string) {
		if (trim($string) == ''){
			return '';
		}
		if ($string instanceof RichText && ! $string->isManual()) {
			$result = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '<a href="#foot-note-$2" title="$3">$1</a>', $string->getContent());
			$result = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#foot-note-$2" title="' . sprintf("Reference to the footnote %s", '$2') . ' ">$1</a>', $result);
			$string->setContent($result);
			return $string;
		}
		$text = $string instanceof RichText ? $string->getContent() : $string;
		$blocktags = ['address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'output', 'pre', 'section', 'table', 'tfoot', 'ul', 'video'];
		$paragraphs = explode("\n", trim($text));
		$result = '';
		foreach($paragraphs as $paragraph) {
			$paragraph = trim($paragraph);
			if ($paragraph == '') {
				$result .= '<br>';
			} else {
				$result .= '<p>' . $paragraph . '</p>';
			}
		}
		foreach($blocktags as $tag) {
			$result = preg_replace("|<p>\s*<" . $tag . ">|", "<" . $tag . ">", $result);
			$result = preg_replace("|<" . $tag . ">\s*<\/p>|", "<" . $tag . ">", $result);
			$result = preg_replace("|<p>\s*<\/" . $tag . ">|", "</" . $tag . ">", $result);
			$result = preg_replace("|<\/" . $tag . ">\s*<\/p>|", "</" . $tag . ">", $result);
		}
		$result = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '<a href="#foot-note-$2" title="$3">$1</a>', $result);
		$result = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#foot-note-$2" title="' . sprintf("Reference to the footnote %s", '$2') . ' ">$1</a>', $result);
		return $result;
	}

	/**
	 * Converts a field extracted from the XML file of this simulator into an associative array for encoding in JSON format.
	 * Also completes the list of data dependencies
	 *
	 * @access  private
	 * @param   \SimpleXMLElement $field <parameter description>
	 * @return  array <description of the return value>
	 *
	 */
	private function fieldProperties ($field, $dataName, $stepId, $panelId, $fieldsetId, $fieldrowId) {
		$id = (int)$field['data'];
		$nfield = [
			'id' => (int)$field['position'],
			'elementId' => 'field'.$stepId.'-'.$panelId.'-'.$fieldsetId.'-'.$fieldrowId.'-'.$field['position'],
			'data' => $dataName,
			'label' => (string)$field['label'],
			'usage' => (string)$field['usage']
		];
		if ((string)$field['expanded'] == '1') {
			$nfield['expanded'] = '1';
		}
		if (trim((string)$field['prompt']) != "") {
			$nfield['prompt'] = (string)$field['prompt'];
		}
		if ((string)$field['required'] == '1') {
			$nfield['required'] = '1';
		}
		if ((string)$field['visibleRequired'] == '1') {
			$nfield['visibleRequired'] = '1';
		}
		if ((string)$field['newline'] == '1') {
			$nfield['newline'] = '1';
		}
		if ((string)$field['colon'] == '1') {
			$nfield['colon'] = '1';
		}
		if ((string)$field['underlabel'] == '1') {
			$nfield['underlabel'] = '1';
		}
		if ((string)$field['help'] == '1') {
			$nfield['help'] = '1';
		}
		if ((string)$field['emphasize'] == '1') {
			$nfield['emphasize'] = '1';
		}
		$widget = trim((string)$field['widget']);
		if ($widget != "" && in_array($widget, $this->allowedWidgets)) {
			$this->widgets[] = $widget;
			$nfield['widget'] = $widget;
		}
		$this->name = 'explanation'.$stepId.'-'.$panelId.'-'.$fieldsetId.'-'.$fieldrowId.'-'.$field['position'];
		$this->dependencies = 'fieldDependencies';
		if ((string)$field['explanation'] != "") {
			$this->datas[$id]['unparsedExplanation'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$field['explanation']
			);
		}
		$this->name = 'prenote'.$stepId.'-'.$panelId.'-'.$fieldsetId.'-'.$fieldrowId.'-'.$field['position'];
		$this->dependencies = 'noteDependencies';
		if ($field->PreNote) {
			$nfield['prenote'] = $this->paragraphs(preg_replace_callback(
				'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
				[$this, 'addNoteDependency'], 
				(string)$field->PreNote
			));
		}
		$this->name = 'postnote'.$stepId.'-'.$panelId.'-'.$fieldsetId.'-'.$fieldrowId.'-'.$field['position'];
		if ($field->PostNote) {
			$nfield['postnote'] = $this->paragraphs(preg_replace_callback(
				'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
				[$this, 'addNoteDependency'],
				(string)$field->PostNote
			));
		}
		return $nfield;
	}

	/**
	 * Converts a data item extracted from the XML file of this simulator into an associative array for encoding in JSON format.
	 * Also completes the list of sources dependencies
	 *
	 * @access  protected
	 * @param   \SimpleXMLElement $data The data item
	 * @param   array &$sources The list of sources dependencies
	 * @return  void
	 *
	 */
	protected function toJSONData($data, &$sources) {
		$id = (int)$data['id'];
		$this->datas[$id]['type'] = (string)$data['type'];
		if ((string)$data['round'] != "" && in_array((string)$data['type'], ['number', 'money', 'percent'])) {
			$this->datas[$id]['round'] = (int)$data['round'];
		}
		if ((string)$data['unit'] != "") {
			$this->datas[$id]['unit'] = (string)$data['unit'];
		}
		if ((string)$data['memorize'] != "") {
			$this->datas[$id]['memorize'] = (string)$data['memorize'];
		}
		if ((string)$data['pattern'] != "") {
			$this->datas[$id]['pattern'] = (string)$data['pattern'];
		}
		$this->name = $this->datas[$id]['name'];
		$this->dependencies = 'defaultDependencies';
		if ((string)$data['default'] != "") {
			$this->datas[$id]['unparsedDefault'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$data['default']
			);
		}
		$this->dependencies = 'minDependencies';
		if ((string)$data['min'] != "") {
			$this->datas[$id]['unparsedMin'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$data['min']
			);
		}
		$this->dependencies = 'maxDependencies';
		if ((string)$data['max'] != "") {
			$this->datas[$id]['unparsedMax'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$data['max']
			);
		}
		$this->dependencies = 'contentDependencies';
		if ((string)$data['content'] != "") {
			$this->datas[$id]['unparsedContent'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$data['content']
			);
		}
		$this->dependencies = 'usedSourceDependencies';
		if ((string)$data['source'] != "") {
			$this->datas[$id]['unparsedSource'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$data['source']
			);
		}
		$this->dependencies = 'indexDependencies';
		if ((string)$data['index'] != "") {
			$this->datas[$id]['unparsedIndex'] = preg_replace_callback(
				"/#(\d+)/", 
				[$this, 'addDependency'],
				(string)$data['index']
			);
		}
		if ($data->Choices) {
			$choices = [];
			foreach ($data->Choices->children() as $child) {
				if ($child->getName() == "ChoiceGroup") {
					$choicegroup = $child;
					if (! $this->options['flattenChoiceGroup']) {
						$choicegroupdesc = [
							'label' => (string)$choicegroup['label'],
							'choices' => []
						];
						foreach ($choicegroup->Choice as $choice) {
							$choicegroupdesc['choices'][] = [
								(string)$choice['value'] => (string)$choice['label']
							];
						}
						$choices[] = $choicegroupdesc;
					} else {
						foreach ($choicegroup->Choice as $choice) {
							$choices[] = [
								(string)$choice['value'] => (string)$choice['label']
							];
						}
					}
					if ($choicegroup->Source) {
						$source = $choicegroup->Source;
						$sid = (int)$source['id'];
						$this->datas[$id]['choices']['source'] = [
							'id' => $sid,
							'valueColumn' => (string)$source['valueColumn'],
							'labelColumn' => (string)$source['labelColumn']
						];
						if (! isset($sources[$sid]['choiceDependencies'])) {
							$sources[$sid]['choiceDependencies'] = [];
						}
						$sources[$sid]['choiceDependencies'][] = $this->datas[$id]['name'];
					}
				} elseif ($child->getName() == "Choice") {
					$choice = $child;
					$choices[] = [
						(string)$choice['value'] => (string)$choice['label']
					];
				} elseif ($child->getName() == "Source") {
					$source = $child;
					$sid = (int)$source['id'];
					$this->datas[$id]['choices']['source'] = [
						'id' => $sid,
						'valueColumn' => (string)$source['valueColumn'],
						'labelColumn' => (string)$source['labelColumn']
					];
					if (! isset($sources[$sid]['choiceDependencies'])) {
						$sources[$sid]['choiceDependencies'] = [];
					}
					$sources[$sid]['choiceDependencies'][] = $this->datas[$id]['name'];
					break; // only one source
				}
			}
			if (! empty($choices)) {
				$this->datas[$id]['choices'] = $choices;
			}
		}
	}

	/**
	 * Converts to an associative array representing one action (in the "then" part or the the "else" part) of a business rule extracted from the XML file.
	 * Also completes the list of data dependencies
	 *
	 * @access  private
	 * @param   int $ruleID The ID of the rule
	 * @param   \SimpleXMLElement $action The action
	 * @param   array &$dataset The list of data dependencies
	 * @return  array The associative array
	 *
	 */
	private function actionData($ruleID, \SimpleXMLElement $action, &$dataset) {
		$target = (string)$action['target'];
		switch ((string)$action['name']) {
			case 'notifyWarning':
				$clause = [
					'name' => 'action-select',
					'value' => 'notifyWarning',
					'fields' => [
						['name' => 'message', 'value' => $this->replaceIdByName((string)$action['value'])],
						['name' => 'target', 'value' => $target]
					]
				];
				switch ($target) {
					case 'data':
						$clause['fields'][1]['fields'] = [
							['name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name']]
						];
						break;
					case 'datagroup':
						$clause['fields'][1]['fields'] = [
							['name' => 'datagroupName', 'value' => (string)$action['datagroup']]
						];
						break;
					case 'dataset':
						break;
				}
				break;
			case 'notifyError':
				$clause = [
					'name' => 'action-select',
					'value' => 'notifyError',
					'fields' => [
						['name' => 'message', 'value' => $this->replaceIdByName((string)$action['value'])],
						['name' => 'target', 'value' => $target]
					]
				];
				switch ($target) {
					case 'data':
						$clause['fields'][1]['fields'] = [
							['name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name']]
						];
						break;
					case 'datagroup':
						$clause['fields'][1]['fields'] = [
							['name' => 'datagroupName', 'value' => (string)$action['datagroup']]
						];
						break;
					case 'dataset':
						break;
				}
				break;
			case 'hideObject':
			case 'showObject':
				switch ($target) {
					case 'field':
					case 'prenote':
					case 'postnote':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => [
																['name' => 'fieldrowId', 'value' => ((string)$action['fieldrow'] != '' ? (string)$action['fieldrow'] : '0'), 'fields' => [
																		['name' => 'fieldId', 'value' => (string)$action[$target]]
																	]
																]
															]
														]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
					case 'section':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'blockinfoId', 'value' => (string)$action['blockinfo'], 'fields' => [
																['name' => 'chapterId', 'value' => (string)$action['chapter'], 'fields' => [
																		['name' => 'sectionId', 'value' => (string)$action[$target]]
																	]
																]
															]
														]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
					case 'chapter':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'blockinfoId', 'value' => (string)$action['blockinfo'], 'fields' => [
																['name' => 'chapterId', 'value' => (string)$action[$target]]
															]
														]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
					case 'fieldset':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'fieldsetId', 'value' => (string)$action[$target]]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
					case 'fieldrow':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId',	'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => [
																['name' => 'fieldrowId', 'value' => (string)$action[$target]]
															]
														]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
					case 'blockinfo':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'blockinfoId', 'value' => (string)$action[$target]]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
					case 'panel':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action[$target]]
											]
										]
									]
								]
							]
						];
						break;
					case 'step':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action[$target]]
									]
								]
							]
						];
						break;
					case 'footnote':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'footnoteId', 'value' => (string)$action[$target]]
											]
										]
									]
								]
							]
						];
						break;
					case 'action':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'actionId', 'value' => (string)$action[$target]]
											]
										]
									]
								]
							]
						];
						break;
					case 'choice':
						$clause = ['name' => 'action-select', 'value' => (string)$action['name'], 'fields' => [
								['name' => 'objectId', 'value' => $target, 'fields' => [
										['name' => 'stepId', 'value' => (string)$action['step'], 'fields' => [
												['name' => 'panelId', 'value' => (string)$action['panel'], 'fields' => [
														['name' => 'fieldsetId', 'value' => (string)$action['fieldset'], 'fields' => [
																['name' => 'fieldrowId', 'value' => ((string)$action['fieldrow'] != '' ? (string)$action['fieldrow'] : '0'), 'fields' => [
																		['name' => 'fieldId', 'value' => (string)$action['field'], 'fields' => [
																				['name' => 'choiceId', 'value' => (string)$action[$target]]
																			]
																		]
																	]
																]
															]
														]
													]
												]
											]
										]
									]
								]
							]
						];
						break;
				}
				break;
			case 'setAttribute':
				$clause = ['name' => 'action-select', 'value' => 'setAttribute', 'fields' => [
						['name' => 'attributeId', 'value' => $target, 'fields' => [
								['name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name'], 'fields' => [
										['name' => 'newValue', 'value' => $this->replaceByDataName((string)$action['value'])]
									]
								]
							]
						]
					]
				];
				if (preg_match_all("/#(\d+)/", (string)$action['value'], $matches)) {
					foreach($matches[1] as $id) {
						$name = $this->datas[$id]['name'];
						if (! isset($dataset[$name]['rulesActionsDependency'])) {
							$dataset[$name]['rulesActionsDependency'] = [];
						}
						$dataset[$name]['rulesActionsDependency'][] = $ruleID;
					}
				}
				break;
			case 'unsetAttribute':
				$clause = ['name' => 'action-select', 'value' => 'unsetAttribute', 'fields' => [
						['name' => 'attributeId', 'value' => $target, 'fields' => [
								['name' => 'fieldName', 'value' => $this->datas[(int)$action['data']]['name']]
							]
						]
					]
				];
				break;
		}
		return $clause;
	}

	private function loadStep($step, &$nextStepsId) {
		$panels = [];
		$actions = [];
		$footnotes = [];
		$usages = [];
		$numberOfInputFields = 0;
		$numberOfRequiredInputFields = 0;
		$nstep = [
			'id' => (int)$step['id'],
			'elementId' => 'step' . $step['id'],
			'name' => (string)$step['name'],
			'label' => (string)$step['label'],
			'output' => (string)$step['output'],
			'description' =>  $this->paragraphs((string)$step->Description)
		];
		foreach ($step->Panels->Panel as $panel) {
			$blocks = [];
			$npanel = [
				'id' => (int)$panel['id'],
				'elementId' => 'panel' . $step['id'] . "-" . $panel['id'],
				'name' => (string)$panel['name'],
				'label' => (string)$panel['label']
			];
			foreach ($panel->children() as $block) {
				if ($block->getName() == "FieldSet") {
					$fieldset = $block;
					$fieldrows = [];
					$columns = [];
					$nofieldrow = true;
					$nfieldrow = [];
					$fields = [];
					foreach ($fieldset->children() as $child) {
						if ($child->getName() == "Columns") {
							foreach ($child->Column as $column) {
								$columns[] = [
									'id' => (int)$column['id'],
									'elementId' => 'column' . $step['id'] . "-" . $panel['id'] . "-" . $fieldset['id'] . "-" . $column['id'],
									'type' => (string)$column['type'],
									'name' => (string)$column['name'],
									'label' => (string)$column['label']
								];
							}
						} elseif ($child->getName() == "FieldRow") {
							if (!$nofieldrow) {
								if (!empty($fields)) {
									$nfieldrow['fields'] = $fields;
									$fieldrows[] = $nfieldrow;
								}
								$nofieldrow = true;
							}
							$fieldrow = $child;
							$nfieldrow = [
								'id' => (int)$fieldrow['id'],
								'elementId' => 'fieldrow' . $step['id'] . "-" . $panel['id'] . "-" . $fieldset['id'] . "-" . $fieldrow['id'],
								'label' => (string)$fieldrow['label'],
								'help' => (bool)$fieldrow['help'],
								'colon' => (bool)$fieldrow['colon'],
								'emphasize' => (bool)$fieldrow['emphasize'],
								'datagroup' => $this->datagroups[(int)$fieldrow['datagroup']]
							];
							$fields = [];
							foreach ($fieldrow->Field as $field) {
								$id = (int)$field['data'];
								$data = $this->datas[$id];
								if (!isset($usages[$data['name']])) {
									$usages[$data['name']] = (string)$field['usage'];
									if ((string)$field['usage'] == 'input') {
										$this->datas[$id]['inputField'] = 'field'.$step['id']."-".$panel['id']."-".$fieldset['id']."-".$fieldrow['id']."-".$field['position'];
									}
									if ((string)$field['usage'] == 'input') {
										$numberOfInputFields++;
									}
									if ((string)$field['required'] == '1' || (string)$field['visibleRequired'] == '1') {
										$numberOfRequiredInputFields++;
									}
									$fields[] = $this->fieldProperties($field, $data['name'], (int)$step['id'], (int)$panel['id'], (int)$fieldset['id'], $fieldrow['id']);
								}
							}
							$nfieldrow['fields'] = $fields;
							$fieldrows[] = $nfieldrow;
						} elseif ($child->getName() == "Field") {
							if ($nofieldrow) {
								$nfieldrow = [
									'id' => 0,
									'elementId' => 'fieldrow' . $step['id'] . "-" . $panel['id'] . "-" . $fieldset['id'] . "-0",
								];
								$fields = [];
								$nofieldrow = false;
							}
							$field = $child;
							$id = (int)$field['data'];
							$data = $this->datas[$id];
							if (!isset($usages[$data['name']])) {
								$usages[$data['name']] = (string)$field['usage'];
								if ((string)$field['usage'] == 'input') {
									$this->datas[$id]['inputField'] = 'field'.$step['id']."-".$panel['id']."-".$fieldset['id']."-0-".$field['position'];
								}
								if ((string)$field['usage'] == 'input') {
									$numberOfInputFields++;
								}
								if ((string)$field['required'] == '1' || (string)$field['visibleRequired'] == '1') {
									$numberOfRequiredInputFields++;
								}
								$fields[] = $this->fieldProperties($field, $data['name'], (int)$step['id'], (int)$panel['id'], (int)$fieldset['id'], 0);
							}
						}
					}
					if (!$nofieldrow) {
						if (!empty($fields)) {
							$nfieldrow['fields'] = $fields;
							$fieldrows[] = $nfieldrow;
						}
					}
					$nblock = [
						'type' => 'fieldset',
						'id' => (int)$fieldset['id'],
						'elementId' => 'fieldset'.$step['id']."-".$panel['id']."-".$fieldset['id'],
						'legend' => [
							'content' => trim((string)$fieldset->Legend),
							'edition' => (string)$fieldset->Legend['edition']
						],
						'disposition' => (string)$fieldset['disposition'],
						'display' => (string)$fieldset['display'],
						'popinLink' => (string)$fieldset['popinLink'],
						'columns' => $columns,
						'fieldrows' => $fieldrows
					];
					$this->name = 'fieldset'.$step['id']."-".$panel['id']."-".$fieldset['id'];
					$blocks[] = $nblock;
				} elseif ($block->getName() == "BlockInfo") {
					$blockinfo = $block;
					$chapters = [];
					foreach ($blockinfo->Chapter as $chapter) {
						$sections = [];
						$this->dependencies = 'sectionContentDependencies';
						foreach ($chapter->Section as $section) {
							$this->name = 'section'.$step['id']."-".$panel['id']."-".$blockinfo['id']."-".$chapter['id']."-".$section['id'];
							$content = preg_replace_callback(
								'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
								[$this, 'addNoteDependency'], 
								 $this->paragraphs((string)$section->Content)
							);
							$sections[] = [
								'id'	 => (int)$section['id'],
								'elementId' => 'section'.$step['id']."-".$panel['id']."-".$blockinfo['id']."-".$chapter['id']."-".$section['id'],
								'name' => (string)$section['name'],
								'label' => (string)$section['label'],
								'content' => trim($content),
								'annotations' =>  $this->paragraphs((string)$section->Annotations)
							]; 
						}
						$chapters[] = [
							'id'	 => (int)$chapter['id'],
							'elementId' => 'chapter'.$step['id']."-".$panel['id']."-".$blockinfo['id']."-".$chapter['id'],
							'name' => (string)$chapter['name'],
							'label' => (string)$chapter['label'],
							'icon' => (string)$chapter['icon'],
							'collapsible' => (string)$chapter['collapsible'],
							'sections' => $sections
						]; 
					}
					$nblock = [
						'type' => 'blockinfo',
						'id' => (int)$blockinfo['id'],
						'elementId' => 'blockinfo'.$step['id']."-".$panel['id']."-".$blockinfo['id'],
						'name' => (string)$blockinfo['name'],
						'label' => (string)$blockinfo['label'],
						'display' => (string)$blockinfo['display'],
						'popinLink' => (string)$blockinfo['popinLink'],
						'chapters' => $chapters
					];
					$blocks[] = $nblock;
				}
				$npanel['blocks'] = $blocks;
			}
			$panels[] = $npanel;
		}
		$nstep["numberOfInputFields"] = $numberOfInputFields;
		$nstep["numberOfRequiredInputFields"] = $numberOfRequiredInputFields;
		$nstep["panels"] = $panels;
		foreach ($step->ActionList as $actionList) {
			foreach ($actionList as $action) {
				$this->name = 'action'.$step['id']."-".$action['name'];
				$this->dependencies = 'actionDependencies';
				$for = (string)$action['for'];
				$uri = (string)$action['uri'];
				$naction = [
					'name'		 => (string)$action['name'],
					'label'		 => (string)$action['label'],
					'what'		 => (string)$action['what'],
					'for'		 => $for,
					'uri'		 => (string)$action['uri'],
					'location'	 => (string)$action['location'],
					'shape'		 => (string)$action['shape'],
					'class'		 => (string)$action['class']
				];
				$actions[$this->name] = $naction;
				if ($for === "nextStep") {
					$nextStepsId[] = $nstep['id'] + 1;
				} elseif ($for === "jumpToStep") {
					$nextStepsId[] = (int)$uri;
				}
			}
		}
		foreach ($step->FootNotes as $footnoteList) {
			$notes = [];
			foreach ($footnoteList as $footnote) {
				$this->name = 'footnote'.$step['id']."-".$footnote['id'];
				$this->dependencies = 'footNoteDependencies';
				$footnotedesc = [
					'id' => $this->name,
					'text'	=> $this->paragraphs(preg_replace_callback(
						'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
						[$this, 'addNoteDependency'], 
						$footnote
					))
				];
				$notes[$this->name] = [
					'text'	=> $this->paragraphs(preg_replace_callback(
						'/#(\d+)|\<data\s+class="data"\s+value="(\d+)L?"\>[^\<]+\<\/data\>/', 
						[$this, 'addNoteDependency'], 
						$footnote
					))
				];
			}
			$footnotes = [
				'position' => (string)$footnoteList['position'],
				'footnotes' => $notes
			];
		}
		$nstep["actions"] = $actions;
		$nstep["footnotes"] = $footnotes;
		return $nstep;
	}

	/**
	 * Converts the XML definition file of this simulator to JSON for use in Javascript for the given step.
	 *
	 * @access  public
	 * @param   string $url The path of the XML definition file
	 * @param   int $stepId (default: 0) The simulation step
	 * @return  string The definition of this simulator in JSON format
	 *
	 */
	public function toJSON($simulator, $datasources) {
		$json = [];
		$datas = [];
		$steps = [];
		$profiles = [];
		$sources = [];
		$rules = [];
		$dataIdMax = 0;
		if ($simulator->DataSet) {
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					$this->datagroups[(int)$child['id']] = (string)$child['name'];
					foreach ($child->Data as $data) {
						$id = (int)$data['id'];
						$this->datas[$id]['id'] = $id;
						$this->datas[$id]['name'] = (string)$data['name'];
						$this->datas[$id]['label'] = (string)$data['label'];
						$this->datas[$id]["description"] = $this->paragraphs((string)$data->Description);
						$this->datas[$id]['datagroup'] = (string)$child['name'];
						if ((int)$data['id'] > $dataIdMax) {
							$dataIdMax = (int)$data['id'];
						}
					}
				} elseif ($child->getName() == "Data") {
					$id = (int)$child['id'];
					$this->datas[$id]['id'] = $id;
					$this->datas[$id]['name'] = (string)$child['name'];
					$this->datas[$id]['label'] = (string)$child['label'];
					$this->datas[$id]["description"] = $this->paragraphs((string)$child->Description);
					if ((int)$child['id'] > $dataIdMax) {
						$dataIdMax = (int)$child['id'];
					}
				}
			}
			foreach ($simulator->DataSet->children() as $child) {
				if ($child->getName() == "DataGroup") {
					foreach ($child->Data as $data) {
						$this->toJSONData($data, $sources);
					}
				} elseif ($child->getName() == "Data") {
					$this->toJSONData($child, $sources);
				}
			}
		}
		$json["name"] = (string)$simulator["name"];
		$json["label"] = (string)$simulator["label"];
		$json["category"] = (string)$simulator["category"];
		$json["defaultView"] = (string)$simulator["defaultView"];
		$json["referer"] = (string)$simulator["referer"];
		if ((string)$simulator["memo"] != "") {
			$json["memo"] = (string)$simulator["memo"];
		}
		$json["description"] = $this->paragraphs((string)$simulator->Description);
		if ($simulator->Profiles) {
			$profiles['elementId'] = 'profiles';
			$profiles['label'] = (string)$simulator->Profiles['label'];
			$profs = [];
			foreach ($simulator->Profiles->Profile as $profile) {
				$pdatas = [];
				foreach ($profile->Data as $data) {
					$id = (int)$data['id'];
					$pdatas[] = [
						'id' => $id,
						'elementId' => 'profile-data' . $profile['id'] . '-' . $id,
						'name' => $this->datas[$id]['name'],
						'default' => (string)$data['default']
					];
				}
				$profs[] = [
					'id' => (int)$profile['id'],
					'elementId' => 'profile' . $profile['id'],
					'name' => (string)$profile['name'],
					'label' => (string)$profile['label'],
					'description' => [
						'content' => $this->paragraphs((string)$profile->Description),
						'edition' => (string)$profile->Description['edition']
					],
					'datas' => $pdatas
				];
			}
			$profiles['profiles'] = $profs;
		}
		if ($simulator->Steps) {
			$nextStepsId = [];
			$stepsProcessed = [];
			do {
				foreach ($simulator->Steps->Step as $step) {
					$id = (int)$step['id'];
					if (empty($stepsProcessed) || (in_array($id, $nextStepsId) && !in_array($id, $stepsProcessed))) {
						for ($i = 0; $i < count($nextStepsId); $i++) {
							if ($nextStepsId[$i] == $id) {
								array_splice($nextStepsId, $i, 1);
								break;
							}
						}
						$stepsProcessed[] = $id;
						$steps[] = $this->loadStep($step, $nextStepsId);
					}
				}
			} while (!empty($nextStepsId));
		}
		if ($simulator->Sources) {
			foreach ($simulator->Sources->Source as $source) {
				$id = (int)$source['id'];
				$datasource =(string)$source['datasource'];
				if (is_numeric($datasource)) {
					$dss = $datasources->xpath("/DataSources/DataSource[@id='".$datasource."']");
				} else {
					$dss = $datasources->xpath("/DataSources/DataSource[@name='".$datasource."']");
				}
				$datasource = $dss[0];
				$sources[$id]['datasource']['type'] = (string)$datasource['type'];
				if ((string)$datasource['type'] == 'uri') {
					$sources[$id]['datasource']['uri'] = (string)$datasource['uri'];
					$sources[$id]['datasource']['method'] = (string)$datasource['method'] != '' ? (string)$datasource['method'] : 'get';
				}
				$this->name = $id;
				$this->dependencies = 'sourceDependencies';
				$parameters = [];
				foreach ($source->Parameter as $param) {
					$parameter = [
						'name' => (string)$param['name'],
						'type' => (string)$param['type'] != '' ? (string)$param['type'] : 'queryString',
						'format' => (string)$param['format'],
						'origin' => (string)$param['origin'] != '' ? (string)$param['origin'] : 'data',
						'optional' => (string)$param['optional'] != '' ? (string)$param['optional'] : '0'
					];
					if ((string)$param['origin'] == 'constant') {
						$parameter['constant'] = (string)$param['constant'];
					} else {
						$data = $this->datas[(int)$param['data']];
						$parameter['data'] = $data['name'];
						$this->addDependency([null, (int)$param['data']]);
					}
					$parameters[] = $parameter;
				}
				$sources[$id]['label'] = (string)$source['label'];
				$sources[$id]['separator'] = (string)$source['separator'];
				$sources[$id]['delimiter'] = (string)$source['delimiter'];
				$sources[$id]['parameters'] = $parameters;
				$sources[$id]['returnType'] = (string)$source['returnType'];
				$sources[$id]['returnPath'] = $this->replaceIdByName((string)$source['returnPath']);
			}
		}
		foreach ($this->datas as $id => $odata) {
			$name = $odata['name'];
			unset($odata['name']);
			foreach($odata as $key => $value) {
				$datas[$name][$key] = $value;
			}
		}
		if ($simulator->BusinessRules) {
			$ruleID = 0;
			foreach ($simulator->BusinessRules->BusinessRule as $brule) {
				$conditions = $this->replaceByDataName((string)$brule->Conditions['value']);
				$names = [];
				if (preg_match_all("/#(\d+)/", (string)$brule->Conditions['value'], $matches)) {
					foreach($matches[1] as $id) {
						$name = $this->datas[$id]['name'];
						if (! isset($datas[$name]['rulesConditionsDependency'])) {
							$datas[$name]['rulesConditionsDependency'] = [];
						}
						$names[] = $name;
					}
				}
				if ($brule->IfActions && $brule->IfActions->Action && $brule->IfActions->Action->count() == 1 &&
					$brule->ElseActions && $brule->ElseActions->Action && $brule->ElseActions->Action->count() == 1) {
					$rule = [
						'id' => ++$ruleID,
						'name' => (string)$brule['name'],
						'conditions' => $conditions,
						'ifdata' => [ $this->actionData($ruleID, $brule->IfActions->Action[0], $datas) ],
						'elsedata' => [ $this->actionData($ruleID, $brule->ElseActions->Action[0], $datas) ]
					];
					foreach($names as $name) {
						$datas[$name]['rulesConditionsDependency'][] = $ruleID;
					}
					$rules[] = $rule;
				} else {
					if ($brule->IfActions && $brule->IfActions->Action) {
						foreach ($brule->IfActions->Action as $ifAction) {
							$rule = [
								'id' => ++$ruleID,
								'name' => (string)$brule['name'],
								'conditions' => $conditions,
								'ifdata' => [ $this->actionData($ruleID, $ifAction, $datas) ],
								'elsedata' => []
							];
							foreach($names as $name) {
								$datas[$name]['rulesConditionsDependency'][] = $ruleID;
							}
							$rules[] = $rule;
						}
					}
					if ($brule->ElseActions && $brule->ElseActions->Action) {
						foreach ($brule->ElseActions->Action as $elseAction) {
							$rule = [
								'id' => ++$ruleID,
								'name' => (string)$brule['name'],
								'conditions' => $conditions,
								'ifdata' =>  [],
								'elsedata' => [ $this->actionData($ruleID, $elseAction, $datas) ]
							];
							foreach($names as $name) {
								$datas[$name]['rulesConditionsDependency'][] = $ruleID;
							}
							$rules[] = $rule;
						}
					}
				}
			}
			foreach ($datas as $name => $data) {
				if (isset($data['rulesConditionsDependency'])) {
					$datas[$name]['rulesConditionsDependency'] = array_keys(array_flip($data['rulesConditionsDependency']));
				}
			 	if (isset($data['rulesActionsDependency'])) {
					$datas[$name]['rulesActionsDependency'] = array_keys(array_flip($data['rulesActionsDependency']));
				}
			 
			}
		}
		$widgets = array_unique($this->widgets);
		$nwidgets = count($widgets);
		for ($i = 0; $i < $nwidgets; $i++) {
			$widget = $widgets[$i];
			if (isset($this->widgetDependencies[$widget])) {
				foreach($this->widgetDependencies[$widget] as $name) {
					$widgets[] = $name;
				}
			}
		}
		$widgets = array_unique($widgets);
		$functions = array_unique($this->functions);
		$nfunctions = count($functions);
		for ($i = 0; $i < $nfunctions; $i++) {
			$function = $functions[$i];
			if (isset($this->functionDependencies[$function])) {
				foreach($this->functionDependencies[$function] as $name) {
					$functions[] = $name;
				}
			}
		}
		$functions = array_unique($functions);
		$json["datas"] = $datas;
		$json["profiles"] = $profiles;
		$json["steps"] = $steps;
		$json["sources"] = $sources;
		$json["rules"] = $rules;
		$json["widgets"] = array_reverse($widgets);
		$json["functions"] = array_reverse($functions);
		return $json;
	}

	private function widgetdep($widget, &$widgetsconf, &$widgets) {
		$deps = isset($widgetsconf[$widget]['deps']) ? $widgetsconf[$widget]['deps'] : [];
		foreach($deps as $widget) {
			if (!in_array($widget, $widgets) && file_exists('scripts/widgets/' . $widget)) {
				if (! isset($widgetsconf[$widget]['deps'])) {
					array_push($widgets, $widget);
				} else {
					$deps = [];
					$this->widgetdep($widget, $widgetsconf, $deps);
					if (!empty($deps)) {
						$widgets = array_merge($widgets, $deps);
						array_push($widgets, $widget);
					}
				}
			}
		}
	}

	private function allowedWidgets() {
		$widgets = [];
		$conf = Yaml::parseFile($this->projectDir . '/config/packages/g6k.yaml');
		$widgetsconf = $conf['parameters']['widgets'] ?? [];
		foreach ($widgetsconf as $name => $widget) {
			if (file_exists('scripts/widgets/' . $name)) {
				if (! isset($widget['deps'])) {
					array_push($widgets, $name);
				} else {
					$deps = [];
					$this->widgetdep($name, $widgetsconf, $deps);
					if (!empty($deps)) {
						$widgets = array_merge($widgets, $deps);
						array_push($widgets, $name);
						$this->widgetDependencies[$name] = $deps;
					}
				}
			}
		}
		$widgets = array_unique($widgets);
		return $widgets;
	}

	private function functiondep($function, &$functionsconf, &$functions) {
		$deps = isset($functionsconf[$function]['deps']) ? $functionsconf[$function]['deps'] : [];
		foreach($deps as $function) {
			if (!in_array($function, $functions) && file_exists('scripts/functions/' . $function)) {
				if (! isset($functionsconf[$function]['deps'])) {
					array_push($functions, $function);
				} else {
					$deps = [];
					$this->functiondep($function, $functionsconf, $deps);
					if (!empty($deps)) {
						$functions = array_merge($functions, $deps);
						array_push($functions, $function);
					}
				}
			}
		}
	}

	private function allowedFunctions() {
		$functions = [];
		$conf = Yaml::parseFile($this->projectDir . '/config/packages/g6k.yaml');
		$functionsconf = $conf['parameters']['functions'] ?? [];
		foreach ($functionsconf as $name => $function) {
			if (file_exists('scripts/functions/' . $name)) {
				if (! isset($function['deps'])) {
					array_push($functions, $name);
				} else {
					$deps = [];
					$this->functiondep($name, $functionsconf, $deps);
					if (!empty($deps)) {
						$functions = array_merge($functions, $deps);
						array_push($functions, $name);
						$this->functionDependencies[$name] = $deps;
					}
				}
			}
		}
		$functions = array_unique($functions);
		return $functions;
	}

}

?>
