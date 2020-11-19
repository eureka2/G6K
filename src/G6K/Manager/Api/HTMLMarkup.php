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

use Symfony\Contracts\Translation\TranslatorInterface;
use App\G6K\Manager\ExpressionParser\Parser;
use App\G6K\Manager\ExpressionParser\DateFunction;
use App\G6K\Manager\ExpressionParser\NumberFunction;
use App\G6K\Manager\ExpressionParser\PercentFunction;
use App\G6K\Manager\ExpressionParser\MoneyFunction;

class HTMLMarkup {

	private $simulator;
	private $json;
	private $options = [];
	private $translator;
	private $projectDir;
	private $jsonDir;
	private $parser;
	private $markup;
	private $variables = [];

	const DEPARTMENTS = ['01'=>'Ain', '02'=>'Aisne', '03'=>'Allier', '04'=>'Alpes-de-Haute-Provence', '05'=>'Hautes-Alpes', '06'=>'Alpes-Maritimes', '07'=>'Ardèche', '08'=>'Ardennes', '09'=>'Ariège', '10'=>'Aube', '11'=>'Aude', '12'=>'Aveyron', '13'=>'Bouches-du-Rhône', '14'=>'Calvados', '15'=>'Cantal', '16'=>'Charente', '17'=>'Charente-Maritime', '18'=>'Cher', '19'=>'Corrèze', '21'=>'Côte-d\'Or', '22'=>'Côtes-d\'Armor', '23'=>'Creuse', '24'=>'Dordogne', '25'=>'Doubs', '26'=>'Drôme', '27'=>'Eure', '28'=>'Eure-et-Loir', '29'=>'Finistère', '2A'=>'Corse-du-Sud', '2B'=>'Haute-Corse', '30'=>'Gard', '31'=>'Haute-Garonne', '32'=>'Gers', '33'=>'Gironde', '34'=>'Hérault', '35'=>'Ille-et-Vilaine', '36'=>'Indre', '37'=>'Indre-et-Loire', '38'=>'Isère', '39'=>'Jura', '40'=>'Landes', '41'=>'Loir-et-Cher', '42'=>'Loire', '43'=>'Haute-Loire', '44'=>'Loire-Atlantique', '45'=>'Loiret', '46'=>'Lot', '47'=>'Lot-et-Garonne', '48'=>'Lozère', '49'=>'Maine-et-Loire', '50'=>'Manche', '51'=>'Marne', '52'=>'Haute-Marne', '53'=>'Mayenne', '54'=>'Meurthe-et-Moselle', '55'=>'Meuse', '56'=>'Morbihan', '57'=>'Moselle', '58'=>'Nièvre', '59'=>'Nord', '60'=>'Oise', '61'=>'Orne', '62'=>'Pas-de-Calais', '63'=>'Puy-de-Dôme', '64'=>'Pyrénées-Atlantiques', '65'=>'Hautes-Pyrénées', '66'=>'Pyrénées-Orientales', '67'=>'Bas-Rhin', '68'=>'Haut-Rhin', '69'=>'Rhône', '70'=>'Haute-Saône', '71'=>'Saône-et-Loire', '72'=>'Sarthe', '73'=>'Savoie', '74'=>'Haute-Savoie', '75'=>'Paris', '76'=>'Seine-Maritime', '77'=>'Seine-et-Marne', '78'=>'Yvelines', '79'=>'Deux-Sèvres', '80'=>'Somme', '81'=>'Tarn', '82'=>'Tarn-et-Garonne', '83'=>'Var', '84'=>'Vaucluse', '85'=>'Vendée', '86'=>'Vienne', '87'=>'Haute-Vienne', '88'=>'Vosges', '89'=>'Yonne', '90'=>'Territoire de Belfort', '91'=>'Essonne', '92'=>'Hauts-de-Seine', '93'=>'Seine-Saint-Denis', '94'=>'Val-de-Marne', '95'=>'Val-d\'Oise', '971'=>'Guadeloupe', '972'=>'Martinique', '973'=>'Guyane', '974'=>'La Réunion', '976'=>'Mayotte'];

	public function __construct(TranslatorInterface $translator, $projectDir, $jsonDir = null) {
		$this->translator = $translator;
		$this->projectDir = $projectDir;
		$this->jsonDir = $jsonDir ?? $projectDir . "/var/data/simulators/api";
		$this->parser = new Parser();
	}

	public function setSimulator($simulator) {
		$this->simulator = $simulator;
		$this->json = json_decode(file_get_contents($this->jsonDir . '/' . $this->simulator . '.json'), true);
		$this->options = $this->json['data']['attributes'];
	}

	public function run() {
		foreach ($this->json['meta'] as $name => $data) {
			$this->variables[$name] = $data['initial'];
		}
		$steps = $this->json['included']['steps'];
		$simulatorType = $this->json['data']['type'];
		$simulatorId = $this->json['data']['id'];
		$simulatorTitle = $this->json['data']['attributes']['title'];
		$simulatorDescription = $this->json['data']['attributes']['description'];
		DateFunction::$dateFormat = $this->json['data']['attributes']['dateFormat'];
		DateFunction::$timezone = $this->json['data']['attributes']['timezone'];
		MoneyFunction::$decimalPoint = $this->json['data']['attributes']['decimalPoint'];
		MoneyFunction::$groupingSeparator = $this->json['data']['attributes']['groupingSeparator'];
		MoneyFunction::$groupingSize = $this->json['data']['attributes']['groupingSize'];
		MoneyFunction::$moneySymbol = $this->json['data']['attributes']['moneySymbol'];
		MoneyFunction::$symbolPosition = $this->json['data']['attributes']['symbolPosition'];
		NumberFunction::$decimalPoint = $this->json['data']['attributes']['decimalPoint'];
		NumberFunction::$groupingSeparator = $this->json['data']['attributes']['groupingSeparator'];
		NumberFunction::$groupingSize = $this->json['data']['attributes']['groupingSize'];
		PercentFunction::$decimalPoint = $this->json['data']['attributes']['decimalPoint'];
		PercentFunction::$groupingSeparator = $this->json['data']['attributes']['groupingSeparator'];
		PercentFunction::$groupingSize = $this->json['data']['attributes']['groupingSize'];
		$this->markup = new HTMLDocument($simulatorTitle);
		$body = $this->markup->body();
		$article = $body->append('<article>', ['class' => 'article simulator-container default-style']);
		$form = $article->append('<div>', ['class' => 'outer-wrap hidden'])
			->append('<div>', ['class' => 'inner-wrap'])
			->append('<div>', ['id' => $simulatorId, 'class' => $simulatorType])
			->append('<h1>', $simulatorTitle)
			->parent()->append('<div>', $simulatorDescription, ['class' => $simulatorType . '-description'])
			->parent()->append('<form>');
		$this->breadcrumb($steps, $form);
		$this->profiles($this->json['included']['profiles'], $form);
		$this->steps($steps, $form);
		$this->hiddens($form);
	}

	public function getOptions() {
		return $this->options;
	}

	public function get() {
		return $this->markup;
	}

	public function html() {
		return $this->markup->html();
	}

	public function save() {
		$html = $this->markup->html();
		return file_put_contents($this->jsonDir . '/' . $this->simulator . ".html", $html);
	}

	private function breadcrumb($steps, $form) {
		$numberOfSteps = count(array_filter($steps, function($step) {
			return $step['attributes']['output'] == ''
			|| $step['attributes']['output'] == 'normal';
		}));
		if ($numberOfSteps > 1) {
			$ol = $form->append('<div>', ['class' => 'simulator-breadcrumb'])
				->append('<h2>', $this->translator->trans('Steps of your simulation'), ['class' => 'sr-only'])
				->parent()->append('<ol>', ['class' => 'simulator-breadcrumb-' . count($steps)]);
			foreach($steps as $s => $step) {
				if ($step['attributes']['output'] == '' || $step['attributes']['output'] == 'normal') {
					if ($s == 0) {
						$ol->append('<li>', [
							'data-step' => str_replace('step', '', $step['id']), 
							'class' => 'current', 
							'title' => $this->translator->trans('Current step') . ' : ' . $this->nofnref($step['attributes']['title'])
						])
						->append('<p>')
						->append('<span>', $this->translator->trans('Current step'), ['class' => 'sr-only'])
						->parent()->append('<strong>')
						->append('<span>', (string)($s + 1))
						->parent()->append(' ')
						->parent()->append('<span>', $this->fnref($step['id'], $step['attributes']['title']));
					} else {
						$ol->append('<li>', [
							'data-step' => str_replace('step', '', $step['id']),
							'aria-hidden' => 'true'
						])
						->append('<p>')
						->append('<span>', (string)($s + 1))
						->parent()->append(' ')
						->parent()->append('<span>', $this->fnref($step['id'], $step['attributes']['title']));
					}
				}
			}
		}
	}

	private function profiles($profiles, $form) {
		if (! empty((array)$profiles)) {
			$ul = $form->append('<div>', [
				'id' => $profiles['id'],
				'class' => $profiles['type']
			])
			->append('<p>', $profiles['attributes']['title'])
			->parent()->append('<ul>', [
				'class' => $profiles['type'] . '-list'
			]);
			foreach ($profiles['attributes']['data'] as $profile) {
				$ul->append('<li>',  $profile['attributes']['title'], [
					'tabindex' => '0',
					'data-profile-id' => $profile['id']
				]);
			}
		}
	}

	private function steps($steps, $form) {
		foreach($steps as $s => $step) {
			$stepContainer = $form->append('<div>', [
				'id' => $step['id'],
				'class' => $step['type']
			]);
			if ($step['attributes']['description'] != '') {
				$stepContainer->append('<h2>', $this->fnref($step['id'], $step['attributes']['description']), [
					'class' => 'step-description'
				]);
			}
			if ($step['attributes']['numberOfRequiredInputFields'] > 0) {
				$stepContainer->append('<p>', $this->translator->trans('Fields marked with an %asterisk% are required.', [ '%asterisk%' => '<span class="asterisk">*</span>' ]), [
					'class' => 'mention-asterisk'
				]);
			}
			$this->actions($step, 'button', 'left', $stepContainer);
			$this->actions($step, 'link', 'left', $stepContainer);
			$this->actions($step, 'button', 'top', $stepContainer);
			$this->actions($step, 'link', 'top', $stepContainer);
			$panels = array_filter($step['attributes']['data'], function ($child) {
				return $child['type'] =='panel';
			});
			$numberOfPanels = count($panels);
			if ($numberOfPanels > 1) {
				$ul =$stepContainer->append('<ul>', [
					'id' => $step['id'],
					'class' => 'step-panels-list'
				]);
				foreach($panels as $panelNum => $panel) {
					$ul->append('<li>', [
					])->addClass('active', $panelNum == 0)
					->append('<a>', $panel['attributes']['title'], [
						'id' => $panel['id'] . '-item',
						'role' => 'button',
						'data-toggle' => 'tab',
						'href' => '#' . $panel['id']
					]);
				}
				$panelsContent = $ul->after('<div>', [ 'class' => 'panels-content' ]);
				$this->panels($panels, $step, $panelsContent);
			} else {
				$this->panels($panels, $step, $stepContainer);
			}
			$footnotesPosition = 'afterActions';
			foreach($step['attributes']['data'] as $child) {
				if ($child['type'] == 'footnotes') {
					$footnotesPosition = $child['attributes']['position'];
				}
			}
			if ($footnotesPosition == 'beforeActions') {
				$this->footnotes($step, $stepContainer);
			}
			$this->actions($step, 'button', 'right', $stepContainer);
			$this->actions($step, 'link', 'right', $stepContainer);
			$this->actions($step, 'button', 'bottom', $stepContainer);
			$this->actions($step, 'link', 'bottom', $stepContainer);
			if ($footnotesPosition == 'afterActions') {
				$this->footnotes($step, $stepContainer);
			}
		}
		$form->append('<div>', [
			'id' => 'global-alert',
			'class' => 'global-alert',
			'aria-live' => 'assertive'
		]);
	}

	private function panels($panels, $step, $container) {
		$numberOfPanels = count($panels);
		foreach($panels as $panelNum => $panel) {
			$panelContainer = $container->append('<div>', '', [
				'id' => $panel['id'],
				'class' => $panel['type']
			]);
			if ($numberOfPanels > 1) {
				$panelContainer->addClass('tab-pane')->addClass('active', $panelNum == 0);
				$panelContainer->append('<h2>', $this->fnref($step['id'], $panel['attributes']['title']), [
					'tabindex' => '-1',
					'class' => 'sr-only'
				]);
			}
			$previousDisplay = 'inline';
			$blockContainer = $panelContainer;
			$groupId = 0;
			foreach($panel['attributes']['data'] as $block) {
				$display = isset($block['attributes']['display']) ? $block['attributes']['display'] : 'inline';
				if ($display != $previousDisplay) {
					$previousDisplay = $display;
					if ($display != 'inline') {
						$groupId++;
						$blockContainer = $panelContainer->append('<div>', [
							'class' => 'panel-group ' . $display,
							'id' => $panel['id'] . '-' .$display . '-' . $groupId,
							'role' => 'tablist',
							'aria-multiselectable' => 'true'
						]);
					} else {
						$blockContainer = $panelContainer;
					}
				}
				if ($block['type'] == 'fieldset') {
					$fieldset = $block;
					$disposition = 'classic';
					if ($fieldset['attributes']['disposition'] !== '') {
						$disposition = $fieldset['attributes']['disposition'];
					}
					$hasInputFields = false;
					foreach($fieldset['attributes']['data'] as $fieldrow) {
						if ($fieldrow['type'] == 'fieldrow') {
							foreach($fieldrow['attributes']['data'] as $field) {
								if ($field['attributes']['usage'] == 'input') {
									$hasInputFields = true;
									break;
								}
							}
						}
					}
					$accordion = '';
					if ($display == 'accordion') {
						$accordion = ' panel panel-default accordion-section';
					}
					$fieldsetTag =  $hasInputFields ? '<fieldset>' : '<div>'; 
					$fieldsetContainer = $blockContainer->append($fieldsetTag, [
						'id' => $fieldset['id'],
						'class' => $fieldset['type'] . ' disposition-' . $disposition . $accordion
					]);
					if ($display == 'pop-in') {
						$this->popinheader($step, $fieldset, $this->fnref($step['id'], $fieldset['attributes']['title']), $fieldsetContainer);
					}
					if ($display == 'accordion') {
						$accordionId = 'accordion' . $step['id'] . '-' . $panel['id'] . '-' . $groupId;
						$this->accordionheader($fieldset['id'], $this->fnref($step['id'], $fieldset['attributes']['title']), $accordionId, $fieldsetContainer);
					} else {
						if ($hasInputFields) {
							if ($fieldset['attributes']['title'] != '') {
								$fieldsetContainer->append('<legend>', $this->fnref($step['id'], $fieldset['attributes']['title']));
							}
						} else {
							if ($fieldset['attributes']['title'] != '') {
								$fieldsetContainer->append('<h3>', $this->fnref($step['id'], $fieldset['attributes']['title']), [ 'class' => 'legend' ]);
							}
						}
					}
					if ($disposition == "grid") {
						$this->grid($step['id'], $fieldset, $fieldsetContainer);
					} elseif ($disposition == "inline") {
						$this->inline($step['id'], $fieldset, $fieldsetContainer);
					} else {
						$this->classic($step['id'], $fieldset, $fieldsetContainer);
					}
					if ($display == 'pop-in') {
						$this->popinfooter($fieldsetContainer);
					}
				} elseif ($block['type'] == 'blockinfo') {
					$blockinfo = $block;
					$blockinfoContainer = $blockContainer->append('<div>', '', [
						'id' => $blockinfo['id'],
						'class' => $blockinfo['type']
					]);
					if ($display == 'pop-in') {
						$blockinfoContainer = $this->popinheader($step, $blockinfo, $this->fnref($step['id'], $blockinfo['attributes']['title']), $blockinfoContainer);
					} else if ($display == 'accordion') {
						$accordionId = 'accordion' . $step['id'] . '-' . $panel['id'] . '-' . $groupId;
						$blockinfoContainer = $this->accordionheader($blockinfo['id'], $this->nofnref($blockinfo['attributes']['title']), $accordionId, $blockinfoContainer);
					}
					$this->blockinfo($step['id'], $blockinfo, $blockinfoContainer);
					if ($display == 'pop-in') {
						$this->popinfooter($blockinfoContainer);
					}
				}
			}
		}
	}

	private function grid($stepId, $fieldset, $container) {
		$table = $container->append('<table>', [
			'class' => 'grid',
			'id' => $fieldset['id']
		]);
		$tr = $table->append('<thead>', [
			'class' => 'grid-header'
		])->append('<tr>');
		$tr->append('<th>', html_entity_decode("&nbsp;"), [
			'scope' => 'col',
			'id' => str_replace('fieldset', 'column', $fieldset['id']) . '-0'
		]);
		$labels =[];
		foreach($fieldset['attributes']['data'] as $column) {
			if ($column['type'] == 'column') {
				$labels[] = $this->nofnref($column['attributes']['title']);
				$tr->append('<th>', $this->fnref($stepId, $column['attributes']['title']), [
					'scope' => 'col',
					'id' => $column['id']
				]);
			}
		}
		$tbody = $table->append('<tbody>');
		foreach($fieldset['attributes']['data'] as $row) {
			if ($row['type'] == 'fieldrow') {
				$datagroup = $row['attributes']['datagroup'];
				$tr = $tbody->append('<tr>', [ 'id' => $row['id'] ] );
				$tr->addClass('emphasize', $row['attributes']['emphasize'] == '1');
				$tr->append('<th>', $this->fnref($stepId, $row['attributes']['title']), [
					'scope' => 'row',
					'rowspan' => '2',
					'id' => str_replace('fieldrow', 'head', $row['id']),
					'data-label' => $this->nofnref($row['attributes']['title'])
				]);
				foreach ($row['attributes']['data'] as $f => $field) {
					$td = $tr->append('<td>', [
						'headers' => str_replace('fieldrow', 'head', $row['id']),
						'data-label' => $labels[$f]
					]);
					$this->field($stepId, $field, $td);
				}
				$tbody->append('<tr>')
				->append('<td>', [
					'colspan' => (count($row['attributes']['data']) + 1),
					'headers' => str_replace('fieldrow', 'head', $row['id'])
				])->append('<div>', [
					'aria-live' => 'polite',
					'id' => $datagroup . '-alert',
					'class' => 'group-alert hidden'
				]);
			}
		}
	}

	private function inline($stepId, $fieldset, $container) {
		foreach($fieldset['attributes']['data'] as $fieldrow) {
			foreach($fieldrow['attributes']['data'] as $position => $field) {
				$this->field($stepId, $field, $container);
			}
		}
	}

	private function classic($stepId, $fieldset, $container) {
		foreach($fieldset['attributes']['data'] as $fieldrow) {
			foreach($fieldrow['attributes']['data'] as $position => $field) {
				$this->field($stepId, $field, $container);
			}
		}
	}

	private function blockinfo($stepId, $blockinfo, $container) {
		$hasCollapsible = false;
		foreach($blockinfo['attributes']['data'] as $chapter) {
			if ($chapter['attributes']['collapsible'] == '1') {
				$hasCollapsible = true;
				break;
			}
		}
		if ($hasCollapsible) {
			$container->append('<p>', [
				'class' => 'collapse-expand-all-tools'
			])->append('<button>', 'Tout replier')
			->parent()->append('<button>', 'Tout déplier');
		}
		if ($blockinfo['attributes']['title'] != '') {
			$container->append('<div>', [
				'class' => 'blockinfo-label'
			])->append('<h2>', $this->fnref($stepId, $blockinfo['attributes']['title']));
		}
		$blockinfoChapters = $container->append('<div>', [
			'class' => 'blockinfo-chapters'
		]);
		foreach($blockinfo['attributes']['data'] as $chapter) {
			$chapterContainer = $blockinfoChapters->append('<div>', [
				'id' => $chapter['id'],
				'class' => $chapter['type']
			]);
			if ($chapter['attributes']['title'] != '') {
				$h3 = $chapterContainer->append('<div>', [
					'class' => 'chapter-label'
				])->append('<h3>');
				if ($chapter['attributes']['collapsible'] == '1') {
					$h3->append('<button>', [
						'id' => 'ui-expand-' .  $chapter['id'],
						'role' => 'button',
						'type' => 'button',
						'aria-expanded' => 'false',
						'data-toggle' => 'expand',
						'data-target' => '#' . $chapter['id'] . '-sections'
					])->append('<span>')->append($this->nofnref($chapter['attributes']['title']));
				} else {
					$h3->append($this->nofnref($chapter['attributes']['title']));
				}
			}
			$chaptersSsections = $chapterContainer->append('<div>', [
				'id' => $chapter['id'] . '-sections',
				'class' => 'chapters-sections'
			]);
			foreach($chapter['attributes']['data'] as $section) {
				$sectionContainer = $chaptersSsections->append('<div>', [
					'id' => $section['id'],
					'class' => $section['type']
				]);
				if ($section['attributes']['title'] != '') {
					$sectionContainer->append('<div>', [
						'class' => 'section-label'
					])->append('<h2>', $this->fnref($stepId, $section['attributes']['title']));
				}
				$sectionBody = $sectionContainer->append('<div>', [
					'class' => 'section-body'
				]);
				if ($section['attributes']['annotations'] != '') {
					$sectionBody->append('<div>', $this->fnref($stepId, $section['attributes']['annotations']), [
						'id' => $section['id'] . '-annotations',
						'class' => 'section-annotations'
					]);
				}
				$sectionBody->append('<div>', $this->fnref($stepId, $section['attributes']['content']), [
					'id' => $section['id'] . '-content',
					'class' => 'section-content'
				])->addClass('with-annotations', $section['attributes']['annotations'] != '');
			}
		}
	}

	private function hiddens($form) {
		foreach ($this->json['meta'] as $name => $data) {
			if ($data['hidden']) {
				$form->append('<input>', [ 
					'type' => "hidden" ,
					'id' => $data['elementId'], 
					'name' => $name,
					'class' => 'resettable',
					'value' => $this->value($name)
				]);
			}
		}
		$form->append('<input>', [ 
			'type' => "hidden" ,
			'id' => $this->simulator . '-view', 
			'name' => 'view',
			'value' => 'api'
		]);
		$form->append('<input>', [ 
			'type' => "hidden" ,
			'id' => $this->simulator . '-recaptcha', 
			'name' => 'recaptcha',
			'value' => ''
		]);
		$form->append('<input>', [ 
			'type' => "hidden" ,
			'id' => $this->simulator . '-csrf_token', 
			'name' => '_csrf_token',
			'value' => ''
		]);
	}

	private function actions($step, $shape, $location, $container) {
		foreach($step['attributes']['data'] as $child) {
			if ($child['type'] == 'actionbuttons') {
				$actions = array_filter($child['attributes']['data'], function ($action) use ($shape, $location) {
					return $action['attributes']['shape'] == $shape && $action['attributes']['location'] == $location;
				});
				if (count($actions) > 0) {
					$actionsContainer = $container->append('<div>', [ 
						'id' => $child['id'], 
						'class' => $child['type'] . ' ' . $shape . ' ' . $location
					]);
					$actions = $child['attributes']['data'];
					foreach($actions as $action) {
						if ($action['attributes']['shape'] == $shape && $action['attributes']['location'] == $location) {
							$attr = $action['attributes'];
							if ($shape == 'button') {
								$buttontype = $attr['what'] == 'execute' ? 'button' : $attr['what'];
								$actionContainer = $actionsContainer->append('<button>', $attr['title'], [ 
									'id' => $action['id'], 
									'type' => $buttontype,
									'class' => $attr['class'],
									'name' => $attr['name']
								]);
								if ($attr['for'] == 'priorStep') {
									$actionContainer->prepend('<span>', ' ', [ 'class' => 'icon icon-chevron-back' ]);
								}
								if ($attr['for'] == 'nextStep') {
									$actionContainer->append('<span>', ' ', [ 'class' => 'icon icon-chevron' ]);
								}
							} else {
								$actionContainer = $actionsContainer->append('<a>', $attr['title'], [ 
									'id' => $action['id'], 
									'name' => $attr['name']
								]);
							}
							if ($attr['for'] == 'externalPage') {
								$actionContainer->attr('formaction', $attr['uri']);
							} elseif ($attr['for'] == 'function') {
								$actionContainer->attr('data-function', $attr['uri']);
							}
						}
					}
				}
			}
		}
	}

	private function footnotes($step, $container) {
		foreach($step['attributes']['data'] as $child) {
			if ($child['type'] == 'footnotes') {
				$footnotesContainer = $container->append('<div>', [
					'id' => $child['id'],
					'class' => $child['type']
				]);
				$footnotes = $child['attributes']['data'];
				foreach($footnotes as $footnote) {
					$footnotesContainer->append('<div>', $footnote['attributes']['title'], [
						'id' => $footnote['id'],
						'class' => $footnote['type']
					]);
				}
			}
		}
	}

	private function field($stepId, $field, $container) {
		$fieldContainer = $container->append('<div>', [ 
			'id' => $field['id'] . '-container', 
			'class' => $field['type'] . '-container ' . $field['attributes']['dataType']
		])->addClass('underlabel', $field['attributes']['underlabel'] == '1')->addClass('newline', $field['attributes']['newline'] == '1');
		if ($field['attributes']['dataType'] == 'choice' && $field['attributes']['usage'] == 'input' && $field['attributes']['expanded'] == '1') {
			$fieldContainer->attr('data-expanded', 'true');
		}
		if (isset($field['attributes']['data'])) {
			foreach ($field['attributes']['data'] as $data) {
				if ($data['type'] == 'prenote') {
					$fieldContainer->append('<div>', $this->fnref($stepId, $data['attributes']['title']), [ 
						'class' => 'prenote'
					]);
					break;
				}
			}
		}
		if ($field['attributes']['usage'] == 'output') {
			$this->outputField($stepId, $field, $fieldContainer);
		} else {
			$this->inputField($stepId, $field, $fieldContainer);
		}
		if ($field['attributes']['help'] == '1') {
			$fieldContainer->append('<button>', [ 
				'type' => 'button', 
				'href' => '#help-' . $field['id'],
				'data-toggle' => 'expand',
				'data-target' => '#help-' . $field['id'],
				'aria-controls' => 'help-' . $field['id'],
				'class' => 'btn-help',
				'title' => 'aide sur ' . $this->nofnref($field['attributes']['title'])
			])->append('<span>', [
				'class' => 'icon icon-help',
				'aria-hidden' => 'true'
			])->parent()->append('<span>', 'Aide', [
				'class' => 'sr-only'
			]);
		}
		if ($field['attributes']['usage'] == 'input') {
			$fieldContainer->append('<div>', [ 
				'id' => $field['id'] . '-alert', 
				'class' => $field['type'] . '-alert'
			]);
		}
		if (isset($field['attributes']['explanation']) && $field['attributes']['explanation'] != '') {
			$id = str_replace('field', 'explanation', $field['id']);
			$fieldContainer->append('<span>', $field['attributes']['explanation'], [ 
				'id' => $id, 
				'data-name' => $field['attributes']['dataName'], 
				'class' => 'explanation'
			]);
		}
		if (isset($field['attributes']['data'])) {
			foreach ($field['attributes']['data'] as $data) {
				if ($data['type'] == 'postnote') {
					$fieldContainer->append('<div>', $this->fnref($stepId, $data['attributes']['title']), [ 
						'class' => 'postnote'
					]);
					break;
				}
			}
		}
		if ($field['attributes']['help'] == '1') {
			$fieldContainer->append('<div>', [ 
				'class' => 'expand help-panel',
				'id' => 'help-' . $field['id']
			])->append('<dl>')->append('<dt>', $this->fnref($stepId, $field['attributes']['title']), [
				'class' => 'only',
				'aria-hidden' => 'true'
			])->parent()->append('<dd>', $this->fnref($stepId, $this->json['meta'][$field['attributes']['dataName']]['definition']));
		}
	}

	private function inputField($stepId, $field, $container) {
		$id = $field['id'];
		$attributes = $field['attributes'];
		$name = $attributes['dataName'];
		$widget = isset($attributes['widget']) ? $attributes['widget'] : '';
		$value = $plainvalue = $this->value($name, $attributes['dataType']);
		if ($value != '') {
			$round = 2;
			if (isset($attributes['round']) && $attributes['round'] != '') {
				$round = (int)$attributes['round'];
			}
			$plainvalue = $this->plainvalue($value, $attributes['dataType'], $round);
		}
		$required = $attributes['required'] == '1' || $attributes['visibleRequired'] == '1';
		$asterisk = $required ? '<span class="asterisk"> * </span>' : '';
		$colon = $attributes['colon'] == '1' ? ' : ' : '';
		if ($attributes['title'] == '') {
			$container->append('<span>', $asterisk, [ 'class' => 'label' ]);
		} elseif (($attributes['dataType'] == 'choice' && $attributes['expanded'] == '1') || $attributes['dataType'] == 'multichoice') {
			$container->append('<label>', $asterisk . $this->fnref($stepId,  $attributes['title']) . $asterisk . $colon, [
				'id' => $id . '-label' 
			]);
		} else {
			$container->append('<label>', $asterisk . $this->fnref($stepId,  $attributes['title']) . $asterisk . $colon, [
				'id' => $id . '-label',
				'for' => $id 
			]);
		}
		$fieldGroup = $container->append('<div>', [ 'class' => 'field-group' ]);
		if ($attributes['dataType'] == 'money' && $this->options['symbolPosition'] == 'before') {
			$fieldGroup->append('<span>', $this->options['moneySymbol'] . '&#xA0;', [
				'id' => $id . '-money-symbol',
				'class' => 'money-symbol before'
			])->addClass('emphasized', $attributes['emphasize'] == '1');
		}
		switch ($attributes['dataType']) {
			case 'choice':
				if ($attributes['expanded'] == '1') {
					$quantity = 0;
					$length = 0;
					if (isset($attributes['data'])) {
						foreach ($attributes['data'] as $data) {
							if ($data['type'] == 'choices') {
								foreach ($data['attributes']['choices'] as $choicevalue => $text) {
									$quantity++;
									$length += strlen(trim($text));
								}
								break;
							} elseif ($data['type'] == 'choicegroup') {
								foreach ($data['attributes']['data'] as $choices) {
									foreach ($choices['attributes']['choices'] as $choicevalue => $text) {
										$quantity++;
										$length += strlen(trim($text));
									}
								}
							}
						}
					}
					$quantity = $quantity > 3 ? ' numerous' : '';
					$fieldset = $fieldGroup->append('<fieldset>', [
						'id' => $id . '-choices',
						'class' => 'choices'
					])->addClass('numerous', $quantity > 3)->addClass('long', $length > 200);
					$fieldset->append('<legend>', $this->fnref($stepId, $attributes['title']), [
						'class' => 'sr-only'
					]);
					if (isset($attributes['data'])) {
						foreach ($attributes['data'] as $data) {
							if ($data['type'] == 'choices') {
								foreach ($data['attributes']['choices'] as $choicevalue => $text) {
									$fieldset->append('<label>', [
										'for' => $id . '-' . $choicevalue,
										'class' => 'choice'
									])->addClass('checked', $choicevalue == $value)
									->append('<input>', [
										'type' => 'radio',
										'class' => $field['type'],
										'id' => $id . '-' . $choicevalue,
										'name' => $name,
										'value' => $choicevalue
									])->setAttr('checked', 'checked', $choicevalue == $value)
									->setAttr('aria-required', 'true', $required)
									->setAttr('data-widget', $widget, $widget != '')
									->parent()->append($text);
								}
								break;
							} elseif ($data['type'] == 'choicegroup') {
								$choicegroup = $fieldset->append('<div>', [
									'id' => $data['id'],
									'class' =>  $data['type']
								]);
								$choicegroup->append('<div>', $this->fnref($stepId, $data['attributes']['title']));
								foreach ($data['attributes']['data'] as $choices) {
									foreach ($choices['attributes']['choices'] as $choicevalue => $text) {
										$choicegroup->append('<label>', [
											'for' => $id . '-' . $choicevalue,
											'class' => 'choice'
										])->addClass('checked', $choicevalue == $value)
										->append('<input>', [
											'type' => 'radio',
											'class' => $field['type'],
											'id' => $id . '-' . $choicevalue,
											'name' => $name,
											'value' => $choicevalue
										])->setAttr('checked', 'checked', $choicevalue == $value)
										->setAttr('aria-required', 'true', $required)
										->setAttr('data-widget', $widget, $widget != '')
										->parent()->append($text);
									}
								}
							}
						}
					}
				} else {
					$select = $fieldGroup->addClass('native')->append('<select>', [
						'class' => $field['type'],
						'id' => $id,
						'name' => $name
					])->setAttr('aria-required', 'true', $required)->setAttr('data-widget', $widget, $widget != '');
					if ($value == '' || $attributes['prompt'] != '') {
						$select->append('<option>', $attributes['prompt'], [ 'value' => '' ]);
					}
					if (isset($attributes['data'])) {
						foreach ($attributes['data'] as $data) {
							if ($data['type'] == 'choices') {
								foreach ($data['attributes']['choices'] as $choicevalue => $text) {
									$select->append('<option>', $text, [ 'value' => $choicevalue ])->setAttr('selected', 'selected', $choicevalue == $value);
								}
								break;
							} elseif ($data['type'] == 'choicegroup') {
								$choicegroup = $select->append('<optgroup>', [
									'label' => $this->nofnref($data['attributes']['title'])
								]);
								foreach ($data['attributes']['data'] as $choices) {
									foreach ($choices['attributes']['choices'] as $choicevalue => $text) {
										$choicegroup->append('<option>', $text, [ 'value' => $choicevalue ])->setAttr('selected', 'selected', $choicevalue == $value);
									}
								}
							}
						}
					}
				}
				break;
			case 'multichoice':
				$fieldset = $fieldGroup->append('<fieldset>', [
					'id' => $id . '-choices',
					'class' => 'choices'
				]);
				$fieldset->append('<legend>', $this->fnref($stepId, $attributes['title']), [
					'class' => 'sr-only'
				]);
				if (isset($attributes['data'])) {
					foreach ($attributes['data'] as $data) {
						if ($data['type'] == 'choices') {
							foreach ($data['attributes']['choices'] as $choicevalue => $text) {
								$fieldset->append('<label>', $this->fnref($stepId, $attributes['title']), [
									'for' => $id . '-' . $choicevalue,
									'class' => 'choice'
								])->addClass('checked', $choicevalue == $value)
								->append('<input>', [
									'type' => 'checkbox',
									'class' => $field['type'],
									'id' => $id . '-' . $choicevalue,
									'name' => $name,
									'value' => $choicevalue
								])->setAttr('checked', 'checked', $choicevalue == $value)
								->setAttr('aria-required', 'true', $required)
								->setAttr('data-widget', $widget, $widget != '')
								->parent()->append($text);
							}
							break;
						} elseif ($data['type'] == 'choicegroup') {
							$choicegroup = $fieldset->append('<div>', [
								'id' => $data['id'],
								'class' =>  $data['type']
							]);
							$choicegroup->append('<div>', $this->fnref($stepId, $data['attributes']['title']));
							foreach ($data['attributes']['data'] as $choices) {
								foreach ($choices['attributes']['choices'] as $choicevalue => $text) {
									$choicegroup->append('<label>', [
										'for' => $id . '-' . $choicevalue,
										'class' => 'choice'
									])->addClass('checked', $choicevalue == $value)
									->append('<input>', [
										'type' => 'checkbox',
										'class' => $field['type'],
										'id' => $id . '-' . $choicevalue,
										'name' => $name,
										'value' => $choicevalue
									])->setAttr('checked', 'checked', $choicevalue == $value)
									->setAttr('aria-required', 'true', $required)
									->setAttr('data-widget', $widget, $widget != '')
									->parent()->append($text);
								}
							}
						}
					}
				}
				break;
			case 'array':
				$fieldGroup->append($plainvalue);
				break;
			case 'department':
				$select = $fieldGroup->addClass('native')->append('<select>', [
					'class' => $field['type'],
					'id' => $id,
					'name' => $name
				])->setAttr('aria-required', 'true', $required)->setAttr('data-widget', $widget, $widget != '');
				if ($value == '' || $attributes['prompt'] != '') {
					$select->append('<option>', $attributes['prompt'], [ 'value' => '' ]);
				}
				foreach (self::DEPARTMENTS as $optvalue => $text) {
					$select->append('<option>', $optvalue . ' - ' . $text, [ 'value' => $optvalue ])->setAttr('selected', 'selected', $optvalue == $value);
				}
				break;
			case 'day':
				$min = 1;
				if (isset($attributes['min'])) {
					$min = $this->evaluate($attributes['min'], 1);
				}
				$max = 31;
				if (isset($attributes['max'])) {
					$max = $this->evaluate($attributes['max'], 31);
				}
				$select = $fieldGroup->addClass('native')->append('<select>', [
					'class' => $field['type'],
					'id' => $id,
					'name' => $name
				])->setAttr('aria-required', 'true', $required)->setAttr('data-widget', $widget, $widget != '');
				if ($value == '' || $attributes['prompt'] != '') {
					$select->append('<option>', $attributes['prompt'], [ 'value' => '' ]);
				}
				foreach (range($min, $max) as $day) {
					$select->append('<option>', $day, [ 'value' => $day ])->setAttr('selected', 'selected', $day == $value);
				}
				break;
			case 'month':
				$min = 1;
				if (isset($attributes['min'])) {
					$min = $this->evaluate($attributes['min'], 1);
				}
				$max = 12;
				if (isset($attributes['max'])) {
					$max = $this->evaluate($attributes['max'], 12);
				}
				$select = $fieldGroup->addClass('native')->append('<select>', [
					'class' => $field['type'],
					'id' => $id,
					'name' => $name
				])->setAttr('aria-required', 'true', $required)->setAttr('data-widget', $widget, $widget != '');
				if ($value == '' || $attributes['prompt'] != '') {
					$select->append('<option>', $attributes['prompt'], [ 'value' => '' ]);
				}
				foreach (range($min, $max) as $month) {
					$select->append('<option>', $this->monthname($month), [ 'value' => $month ])->setAttr('selected', 'selected', $month == $value);
				}
				break;
			case 'year':
				$min = 1964;
				if (isset($attributes['min'])) {
					$min = $this->evaluate($attributes['min'], 1964);
				}
				$max = $min + 100;
				if (isset($attributes['max'])) {
					$max = $this->evaluate($attributes['max'], $min + 100);
				}
				$select = $fieldGroup->addClass('native')->append('<select>', [
					'class' => $field['type'],
					'id' => $id,
					'name' => $name
				])->setAttr('aria-required', 'true', $required)->setAttr('data-widget', $widget, $widget != '');
				if ($value == '' || $attributes['prompt'] != '') {
					$select->append('<option>', $attributes['prompt'], [ 'value' => '' ]);
				}
				foreach (range($min, $max) as $year) {
					$select->append('<option>', $year, [ 'value' => $year ])->setAttr('selected', 'selected', $year == $value);
				}
				break;
			case 'boolean':
				$fieldGroup->append('<input>', [
					'type' => 'checkbox',
					'class' => $field['type'],
					'id' => $id,
					'name' => $name,
					'value' => 'true'
				])->setAttr('checked', 'checked', $value == 'true')
				->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
				break;
			case 'integer':
			case 'number':
				$min = '';
				if (isset($attributes['min'])) {
					$min = $this->evaluate($attributes['min'], '');
				}
				$max = '';
				if (isset($attributes['max'])) {
					$max = $this->evaluate($attributes['max'], '');
				}
				$fieldGroup->append('<input>', [
					'type' => 'number',
					'class' => $field['type'],
					'id' => $id,
					'name' => $name,
					'value' => $value,
					'step' => 'any'
				])->setAttr('min', $min, $min !== '')->setAttr('max', $max, $max !== '')
				->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
				break;
			case 'date':
				$fieldGroup->append('<input>', [
					'type' => 'date',
					'class' => 'date ' . $field['type'],
					'id' => $id,
					'name' => $name,
					'value' => $value,
					'placeholder' => $this->json['meta'][$name]['format']
				])->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
				break;
			case 'money':
				$fieldGroup->append('<input>', [
					'type' => 'text',
					'class' => $field['type'],
					'id' => $id,
					'name' => $name,
					'value' => str_replace(".", MoneyFunction::$decimalPoint, $value),
					'aria-describedby' => $id  . '-money-symbol'
				])->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
				break;
			case 'percent':
				$min = '';
				if (isset($attributes['min'])) {
					$min = $this->evaluate($attributes['min'], '');
				}
				$max = '';
				if (isset($attributes['max'])) {
					$max = $this->evaluate($attributes['max'], '');
				}
				$fieldGroup->append('<input>', [
					'type' => 'text',
					'class' => $field['type'],
					'id' => $id,
					'name' => $name,
					'value' => str_replace(".", PercentFunction::$decimalPoint, $value),
					'aria-describedby' => $id  . '-percent-symbol'
				])->setAttr('min', $min, $min !== '')->setAttr('max', $max, $max !== '')
				->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
				break;
			case 'textarea':
				$min = '';
				if (isset($attributes['min'])) {
					$min = $this->evaluate($attributes['min'], '');
				}
				$max = '';
				if (isset($attributes['max'])) {
					$max = $this->evaluate($attributes['max'], '');
				}
				$fieldGroup->append('<textarea>', $value, [
					'class' => $field['type'],
					'id' => $id,
					'name' => $name
				])->setAttr('minlength', $min, $min !== '')->setAttr('maxlength', $max, $max !== '')
				->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
				break;
			default:
				$fieldGroup->append('<input>', $value, [
					'type' => 'text',
					'class' => $field['type'],
					'id' => $id,
					'name' => $name,
					'value' => $value
				])->setAttr('aria-required', 'true', $required)
				->setAttr('data-widget', $widget, $widget != '');
		}
	}

	private function outputField($stepId, $field, $container) {
		$id = $field['id'];
		$attributes = $field['attributes'];
		$name = $attributes['dataName'];
		$value = $plainvalue = $this->value($name, $attributes['dataType']);
		if ($value != '') {
			$round = 2;
			if (isset($attributes['round']) && $attributes['round'] != '') {
				$round = (int)$attributes['round'];
			}
			$plainvalue = $this->plainvalue($value, $attributes['dataType'], $round);
		}
		if ($attributes['title'] != '') {
			$colon = '';
			if ($attributes['colon'] == '1') {
				$colon = ' : ';
			}
			$container->append('<span>', $this->fnref($stepId, $attributes['title']) . $colon, [
				'id' => $id . '-label',
				'class' => 'label'
			])->addClass('emphasized', $attributes['emphasize'] == '1');
		}
		if ($attributes['dataType'] == 'money' && $this->options['symbolPosition'] == 'before') {
			$container->append('<span>', $this->options['moneySymbol'] . '&#xA0;', [
				'id' => $id . '-money-symbol',
				'class' => 'money-symbol before'
			])->addClass('emphasized', $attributes['emphasize'] == '1');
		}
		$fieldContainer = $container->append('<span>', [
			'id' => $id,
			'data-name' => $name,
			'class' => $field['type'] . ' output'
		])->addClass('emphasized', $attributes['emphasize'] == '1');
		switch ($attributes['dataType']) {
			case 'choice':
				if (isset($attributes['data'])) {
					foreach ($attributes['data'] as $data) {
						if ($data['type'] == 'choices') {
							if (isset($data['attributes']['choices'][$value])) {
								$fieldContainer->append($data['attributes']['choices'][$value]);
							}
							break;
						}
					}
				}
				break;
			case 'multichoice':
				if (isset($attributes['choices'])) {
					foreach ($attributes['choices'] as $choicevalue => $text) {
						if (in_array($choicevalue, $value)) {
							$fieldContainer->append('<span>', $text );
							break;
						}
					}
				}
				break;
			case 'array':
				$fieldContainer->append($plainvalue);
				break;
			case 'department':
				$fieldContainer->append($this->departmentname($value));
				break;
			case 'month':
				$fieldContainer->append(ucfirst($this->monthname($value)));
				break;
			case 'boolean':
				$fieldContainer->append($value == 'true' ? 'oui' : 'non');
				break;
			case 'integer':
			case 'number':
				$fieldContainer->append($plainvalue);
				break;
			case 'date':
				break;
			case 'money':
			case 'percent':
				$fieldContainer->append($plainvalue);
				break;
			case 'textarea':
			case 'text':
				$fieldContainer->append($this->textoutput($value));
				break;
			default:
				$fieldContainer->append($value);
		}
		if ($attributes['dataType'] == 'money' && $this->options['symbolPosition'] == 'after') {
			if ($attributes['dataType'] == 'money' && $this->options['symbolPosition'] == 'before') {
				$container->append('<span>', '&#xA0;' . $this->options['moneySymbol'], [
					'id' => $id . '-money-symbol',
					'class' => 'money-symbol after'
				])->addClass('emphasized', $attributes['emphasize'] == '1');
			}
		}
		if ($attributes['dataType'] == 'percent') {
			$container->append('<span>', '%', [
				'id' => $id . '-percent-symbol',
				'class' => 'percent-symbol'
			])->addClass('emphasized', $attributes['emphasize'] == '1');
		}
		if (isset($attributes['unit']) && $attributes['unit'] != '') {
			$container->append('<span>', $attributes['unit'], [
				'class' => 'unit'
			])->addClass('emphasized', $attributes['emphasize'] == '1');
		}
	}

	private function popinheader($step, $block, $label, $container) {
		$container->append('<a>', $block['popinLink'], [
			'data-toggle' => 'modal',
			'data-target' => '#popin-' . $step['id'] . '-' . $block['id']
		]);
		$modalbody = $container->append('<div>', [
			'class' => 'modal fade',
			'id' => 'popin-' . $step['id'] . '-' . $block['id'],
			'tabindex' => '-1',
			'role' => 'dialog',
			'aria-labelledby' => 'popin-' . $step['id'] . '-' . $block['id'] . '-label'
		])->append('<div>', [
			'class' => 'modal-dialog',
			'role' => 'document'
		])->append('<div>', [
			'class' => 'modal-content'
		])->append('<div>', [
			'class' => 'modal-header'
		])->append('<button>', [
			'type' => 'button',
			'class' => 'close',
			'data-dismiss' => 'modal',
			'aria-label' => 'Fermer',
		])->append('<span>', "&times;", [
			'aria-hidden' => 'true'
		])->parent(2)->append('<h4>', [
			'class' => 'modal-title'
		])->parent(2)->append('<div>', [
			'class' => 'modal-body'
		]);
		return $modalbody;
	}

	private function popinfooter($container) {
		$container->append('<div>', [
			'class' => 'modal-footer'
		])->append('<button>', 'Fermer', [
			'type' => 'button',
			'class' => 'btn-default',
			'data-dismiss' => 'modal'
		]);
	}

	private function accordionheader($id, $label, $accordionId, $container) {
		$panelbody = $container->append('<div>', [
			'class' => 'panel-heading',
			'role' => 'tab',
			'id' =>  $id . '-heading'
		])->append('<h4>', [
			'class' => 'panel-title'
		])->append('<a>', $label, [
			'role' => 'button',
			'data-toggle' => 'expand',
			'data-parent' => '#' . $accordionId,
			'href' => '#' . $id . '-expand',
			'aria-expanded' => 'false'
		])->parent(2)->append('<div>', [
			'id' => $id . '-expand',
			'class' => 'panel-expand expand',
			'role' => 'tabpanel',
			'aria-labelledby' => $id . '-heading'
		])->append('<div>', [
			'class' => 'panel-body'
		]);
		return $panelbody;
	}

	private function value($name, $type = null) {
		$value = "";
		if (isset($this->json['meta'][$name])) {
			$value = $this->json['meta'][$name]['initial'];
		}
		if ($value != '' && $type != null && $type != 'multichoice' && $type != 'array') {
			if ($type == 'money') {
				$value = MoneyFunction::format($value);
			} elseif ($type == 'percent') {
				$value = PercentFunction::format($value);
			} elseif ($type == 'number') {
				$value = NumberFunction::format($value);
			}
		}
		return $value;
	}

	private function plainvalue($value, $type, $round) {
		if ($value === null) {
			return '';
		} elseif ($value == '') {
			return $value;
		} elseif ($type == 'multichoice' || $type == 'array') {
			return json_encode($value);
		} else {
			if (! in_array($type, ['money', 'percent', 'number'])) {
				return $value;
			}
			$fraction =  NumberFunction::$fractionDigit;
			if ($round !== null && $round != NumberFunction::$fractionDigit) {
				NumberFunction::$fractionDigit = $round;
			}
			$value = "";
			if ($type == 'money') {
				$value = MoneyFunction::toString($value);
			} elseif ($type == 'percent') {
				$value = PercentFunction::toString($value);
			} else {
				$value = NumberFunction::toString($value);
			}
			NumberFunction::$fractionDigit = $fraction;
			return $value;
		}
	}

	private function departmentname($nodep) {
		return $nodep != '' ? self::DEPARTMENTS[(int)$nodep] : '';
	}

	private function monthname($m) {
		$months = DateFunction::getMonthNames();
		return $m > 0 ? $months[$m - 1] : '';
	}

	private function evaluate($condition, $default = '') 
	{
		$expr = $this->parser->parse($condition);
		$expr->postfix();
		$expr->setVariables($this->variables);
		$value =  $expr->evaluate();
		return $value === false ? $default : $value;
	}

	private function textoutput($text) {
		if (preg_match("/^https?\\:\\/\\//", $text)) {
			if (preg_match("/(jpg|jpeg|gif|png)$/i", $text)) {
				return '<img src="' . $text . '" alt="' . $text . '">';
			} else {
				return '<a href="' . $text . '">' . $text . '</a>';
			}
		} elseif (preg_match("/^data\\:image\\//", $text)) {
			return '<img src="' . $text . '" alt="*">';
		} else {
			return $text;
		}
	}

	private function fnref($stepId, $text) {
		$id = str_replace("step", "", $stepId);
		$text = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '<a href="#footnote$2" title="$3">$1</a>', $text);
		$text = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#footnote$2" title="' . sprintf("Reference to the footnote %s", '$2') . ' ">$1</a>', $text);
		// $text = preg_replace("/\[([^\^]+)\^(\d+)\]/", '<a href="#footnote$2" title="' . $this->translator->trans("Reference to the footnote %footnote%", array('%footnote%' => '$2')) . ' ">$1</a>', $text);
		$text = str_replace("#footnote", "#footnote" . $id . "-", $text);
		return $text;
	}

	public function nofnref($text) {
		$text = preg_replace("/\[([^\^]+)\^(\d+)\(([^\]]+)\)\]/", '$1', $text);
		$text = preg_replace("/\[([^\^]+)\^(\d+)\]/", '$1', $text);
		return $text;
	}

}
