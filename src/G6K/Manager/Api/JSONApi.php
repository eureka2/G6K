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

use App\G6K\Manager\Api\JSONData;
use App\G6K\Manager\ExpressionParser\Parser;
use App\G6K\Manager\ExpressionParser\Token;

class JSONApi {

	private $simulator;
	private $projectDir;
	private $apiDirOut;
	private $parser;
	private $jsonapi;

	public function __construct($projectDir, $apiDirOut = null) {
		$this->projectDir = $projectDir;
		$this->apiDirOut = $apiDirOut ?? $projectDir . "/var/data/simulators/api";
		$this->parser = new Parser();
	}

	public function setSimulator($simulator) {
		$this->simulator = $simulator;
	}

	public function run() {
		$simulator = new \SimpleXMLElement($this->projectDir . "/var/data/simulators/" . $this->simulator . ".xml", LIBXML_NOWARNING, true);
		$datasources = new \SimpleXMLElement($this->projectDir . "/var/data/databases/DataSources.xml", LIBXML_NOWARNING, true);
		$json = new JSONData($this->projectDir, [
				'flattenChoiceGroup' => false
			],
		);
		$jsondata = $json->toJSON($simulator, $datasources);
		$profiles = (object)[];
		if (! empty($jsondata['profiles'])) {
			$profilesdesc = [
				'type' => 'profiles',
				'id' => $jsondata['profiles']['elementId'],
				'attributes' => [
					'title' => $jsondata['profiles']['label'],
				]
			];
			$sprofiles = [];
			foreach ($jsondata['profiles']['profiles'] as $profile) {
				$profiledesc = [
					'type' => 'profile',
					'id' => $profile['elementId'],
					'attributes' => [
						'name' => $profile['name'],
						'title' => $profile['label'],
						'description' => $profile['description']['content']
					]
				];
				$datas = [];
				foreach ($profile['datas'] as $data) {
					$datadesc = [
						'type' => 'profile-data',
						'id' => $data['elementId'],
						'attributes' => [
							'dataName' => $data['name'],
							'default' => $data['default']
						]
					];
					$datas[] = $datadesc;
				}
				$profiledesc['attributes']['data'] = $datas;
				$sprofiles[] = $profiledesc;
			}
			$profilesdesc['attributes']['data'] = $sprofiles;
			$profiles = $profilesdesc;
		}
		$steps = [];
		foreach ($jsondata['steps'] as $step) {
			$stepdesc = [
				'type' => 'step',
				'id' => $step['elementId'],
				'attributes' => [
					'name' => $step['name'],
					'title' => $step['label'],
					'output' => $step['output'],
					'description' => $step['description'],
					'numberOfInputFields' => $step['numberOfInputFields'],
					'numberOfRequiredInputFields' => $step['numberOfRequiredInputFields']
				]
			];
			$panels = [];
			foreach ($step['panels'] as $panel) {
				$paneldesc = [
					'type' => 'panel',
					'id' => $panel['elementId'],
					'attributes' => [
						'name' => $panel['name'],
						'title' => $panel['label']
					]
				];
				$blocks = [];
				foreach ($panel['blocks'] as $block) {
					if ($block['type'] == 'fieldset') {
						$fieldset = $block;
						$fieldsetdesc = [
							'type' => 'fieldset',
							'id' => $fieldset['elementId'],
							'attributes' => [
								'title' => $fieldset['legend']['content'],
								'disposition' => $fieldset['disposition'],
								'display' => $fieldset['display'],
								'popinLink' => $fieldset['popinLink']
							]
						];
						$fieldrows = [];
						foreach ($fieldset['columns'] as $column) {
							$columndesc = [
								'type' => 'column',
								'id' => $column['elementId'],
								'attributes' => [
									'title' => $column['label'] ?? '',
									'dataName' => $column['name'],
									'dataType' => $column['type']
								]
							];
							$fieldrows[] = $columndesc;
						}
						foreach ($fieldset['fieldrows'] as $fieldrow) {
							$fieldrowdesc = [
								'type' => 'fieldrow',
								'id' => $fieldrow['elementId'],
								'attributes' => [
									'title' => $fieldrow['label'] ?? '',
									'help' => $fieldrow['help'] ?? '0',
									'colon' => $fieldrow['colon'] ?? '0',
									'emphasize' => $fieldrow['emphasize'] ?? '0',
									'datagroup' => $fieldrow['datagroup'] ?? ''
								]
							];
							$fields = [];
							foreach ($fieldrow['fields'] as $field) {
								$fielddesc = [
									'type' => 'field',
									'id' => $field['elementId'],
									'attributes' => [
										'title' => $field['label'] ?? '',
										'usage' => $field['usage'],
										'prompt' => $field['prompt'] ?? '',
										'expanded' => $field['expanded'] ?? '0',
										'required' => $field['required'] ?? '0',
										'visibleRequired' => $field['visibleRequired'] ?? '0',
										'newline' => $field['newline'] ?? '0',
										'colon' => $field['colon'] ?? '0',
										'underlabel' => $field['underlabel'] ?? '0',
										'help' => $field['help'] ?? '0',
										'emphasize' => $field['emphasize'] ?? '0'
									]
								];
								if (isset($field['widget'])) {
									$fielddesc['attributes']['widget'] = $field['widget'];
								}
								$data = $jsondata['datas'][$field['data']];
								if (isset($data['unparsedMin'])) {
									$fielddesc['attributes']['min'] = $data['unparsedMin'];
								}
								if (isset($data['unparsedMax'])) {
									$fielddesc['attributes']['max'] = $data['unparsedMax'];
								}
								if (isset($data['round'])) {
									$fielddesc['attributes']['round'] = $data['round'];
								}
								if (isset($data['unit'])) {
									$fielddesc['attributes']['unit'] = $data['unit'];
								}
								if (isset($data['unparsedExplanation'])) {
									$fielddesc['attributes']['explanation'] = $data['unparsedExplanation'];
								}
								$fielddesc['attributes']['dataName'] = $field['data'];
								$dataType = $data['type'];
								$fielddesc['attributes']['dataType'] = $dataType;
								$fielddesc['attributes']['data'] = [];
								if ($dataType == 'choice' && isset($data['choices']) && ! isset($data['choices']['source'])) {
									$choices = [];
									$choicesId = 0;
									foreach ($data['choices'] as $choice) {
										if (isset($choice['choices'])) {
											if (!empty($choices)) {
												$choicesId++;
												$choicesdesc = [
													'type' => 'choices',
													'id' => preg_replace("/^field/", "choices", $field['elementId']) . '-' . $choicesId,
													'attributes' => [
														'title' => "",
														'choices' => $choices
													]
												];
												$fielddesc['attributes']['data'][] = $choicesdesc;
												$choices = [];
											}
											$choices2 = [];
											foreach ($choice['choices'] as $choice2) {
												foreach ($choice2 as $value => $text) {
													$choices2[$value] = $text;
													break;
												}
											}
											$choicesId++;
											$choicesdesc = [
												'type' => 'choicegroup',
												'id' => preg_replace("/^field/", "choicegroup", $field['elementId']) . '-' . $choicesId,
												'attributes' => [
													'title' => $choice['label'],
													'data' => [
														[
															'type' => 'choices',
															'id' => preg_replace("/^field/", "choices", $field['elementId']) . '-' . $choicesId,
															'attributes' => [
																'title' => "",
																'choices' => $choices2
															]
														]
													]
												]
											];
											$fielddesc['attributes']['data'][] = $choicesdesc;
										} else {
											foreach ($choice as $value => $text) {
												$choices[$value] = $text;
												break;
											}
										}
									}
									if (!empty($choices)) {
										$choicesId++;
										$choicesdesc = [
											'type' => 'choices',
											'id' => preg_replace("/^field/", "choices", $field['elementId']) . '-' . $choicesId,
											'attributes' => [
												'title' => "",
												'choices' => $choices
											]
										];
										$fielddesc['attributes']['data'][] = $choicesdesc;
									}
								}
								if (isset($field['prenote']) || isset($field['postnote'])) {
									if (isset($field['prenote'])) {
										$prenotedesc = [
											'type' => 'prenote',
											'id' => preg_replace("/^field/", "prenote", $field['elementId']),
											'attributes' => [
												'title' => $field['prenote']
											]
										];
										$fielddesc['attributes']['data'][] = $prenotedesc;
									}
									if (isset($field['postnote'])) {
										$postnotedesc = [
											'type' => 'postnote',
											'id' => preg_replace("/^field/", "postnote", $field['elementId']),
											'attributes' => [
												'title' => $field['postnote']
											]
										];
										$fielddesc['attributes']['data'][] = $postnotedesc;
									}
								}
								if (empty($fielddesc['attributes']['data'])) {
									unset($fielddesc['attributes']['data']);
								}
								$fields[] = $fielddesc;
							}
							$fieldrowdesc['attributes']['data'] = $fields;
							$fieldrows[] = $fieldrowdesc;
						}
						$fieldsetdesc['attributes']['data'] = $fieldrows;
						$blocks[] = $fieldsetdesc;
					} elseif ($block['type'] == 'blockinfo') {
						$blockinfo = $block;
						$blockinfodesc = [
							'type' => 'blockinfo',
							'id' => $blockinfo['elementId'],
							'attributes' => [
								'title' => $blockinfo['label'],
								'name' => $blockinfo['name'],
								'display' => $blockinfo['display'],
								'popinLink' => $fieldset['popinLink']
							]
						];
						$chapters = [];
						foreach ($blockinfo['chapters'] as $chapter) {
							$chapterdesc = [
								'type' => 'chapter',
								'id' => $chapter['elementId'],
								'attributes' => [
									'title' => $chapter['label'] ?? '',
									'name' => $chapter['name'] ?? '',
									'icon' => $chapter['icon'] ?? '',
									'collapsible' => $chapter['collapsible'] ?? '0'
								]
							];
							$sections = [];
							foreach ($chapter['sections'] as $section) {
								$sectiondesc = [
									'type' => 'section',
									'id' => $section['elementId'],
									'attributes' => [
										'title' => $section['label'] ?? '',
										'name' => $section['name'],
										'content' => $section['content'] ?? '',
										'annotations' => $section['annotations'] ?? '0'
									]
								];
								$sections[] = $sectiondesc;
							}
							$chapterdesc['attributes']['data'] = $sections;
							$chapters[] = $chapterdesc;
						}
						$blockinfodesc['attributes']['data'] = $chapters;
						$blocks[] = $blockinfodesc;
					}
				}
				$paneldesc['attributes']['data'] = $blocks;
				$panels[] = $paneldesc;
			}
			if (isset($step['footnotes']) && ! empty($step['footnotes'])) {
				$footnotesdesc = [
					'type' => 'footnotes',
					'id' => 'footnotes' . $step['id'],
					'attributes' => [
						'position' => $step['footnotes']['position']
					]
				];
				$footnotes = [];
				foreach ($step['footnotes']['footnotes'] as $elementId => $footnote) {
					$footnotedesc = [
						'type' => 'footnote',
						'id' => $elementId,
						'attributes' => [
							'title' => $footnote['text']
						]
					];
					$footnotes[] = $footnotedesc;
				}
				$footnotesdesc['attributes']['data'] = $footnotes;
				$panels[] = $footnotesdesc;
			}
			if (isset($step['actions']) && ! empty($step['actions'])) {
				$actionsdesc = [
					'type' => 'actionbuttons',
					'id' => 'actionbuttons' . $step['id'],
					'attributes' => [
					]
				];
				$actions = [];
				foreach ($step['actions'] as $elementId => $action) {
					$actiondesc = [
						'type' => 'action',
						'id' => $elementId,
						'attributes' => [
							'title' => $action['label'],
							"name" => $action['name'],
							"what" => $action['what'],
							"for" => $action['for'],
							"uri" => $action['uri'],
							"location" => $action['location'],
							"shape" => $action['shape'],
							"class" => $action['class']
						]
					];
					$actions[] = $actiondesc;
				}
				$actionsdesc['attributes']['data'] = $actions;
				$panels[] = $actionsdesc;
			}
			$stepdesc['attributes']['data'] = $panels;
			$steps[] = $stepdesc;
		}
		$metadatas = [];
		foreach($jsondata['datas'] as $name => $data) {
			$metadatas[$name] = [
				'elementId' => 'data' . $data['id'],
				'definition' => ($data['description'] != '' ? $data['description'] : $data['label']),
				'hidden' => (isset($data['inputField']) && $data['inputField'] != '' ? false : true) 
			];
			if ($data['type'] == 'date') {
				$metadatas[$name]['format'] = 'JJ/MM/AAAA';
			}
			$value = "";
			if (isset($data['unparsedContent'])) {
				$value = $data['unparsedContent'];
			} elseif (isset($data['unparsedDefault'])) {
				$value = $data['unparsedDefault'];
			}
			if ($value != '') {
				$expr = $this->parser->parse($value);
				$tokens = $expr->get();
				$value = "";
				if (count($tokens) == 1) {
					$token = $tokens[0];
					switch ($token->type) {
						case Token::T_DATE:
							$value = $token->value->format((string)$simulator->DataSet['dateFormat']);
							break;
						case Token::T_NUMBER:
							$value = (string)$token->value;
							break;
						case Token::T_BOOLEAN:
						case Token::T_TEXT:
							$value = $token->value;
							break;
					}
				}
			}
			$metadatas[$name]['initial'] = $value;
		}
		$id = urlencode(base64_encode( gzcompress($this->simulator)));
		$jsonapi = [
			'links' => [
				'self' => 'https://localhost/' . basename($this->projectDir) . '/calcul/' . $this->simulator . '/api',
				'related' => 'https://localhost/' . basename($this->projectDir) . '/calcul/' . $this->simulator . '/api/js'
			],
			'data' => [
				'type' => 'simulator',
				'id' => $id,
				'attributes' => [
					'title' => $jsondata['label'],
					'description' => $jsondata['description'],
					'locale' => (string)$simulator['locale'],
					'timezone' => (string)$simulator['timezone'],
					'dateFormat' => (string)$simulator->DataSet['dateFormat'],
					'decimalPoint' => (string)$simulator->DataSet['decimalPoint'],
					'moneySymbol' => (string)$simulator->DataSet['moneySymbol'],
					'symbolPosition' => (string)$simulator->DataSet['symbolPosition'],
					'groupingSeparator' => (string)$simulator->DataSet['groupingSeparator'],
					'groupingSize' => (string)$simulator->DataSet['groupingSize']
				]
			],
			'included' =>  [
				'profiles' => $profiles,
				'steps' => $steps
			],
			'meta' => $metadatas
		];
		$this->jsonapi = json_encode($jsonapi, JSON_PRETTY_PRINT);
	}

	public function get() {
		return $this->jsonapi;
	}

	public function save() {
		return file_put_contents($this->apiDirOut . '/' . $this->simulator . ".json", $this->jsonapi);
	}

}
