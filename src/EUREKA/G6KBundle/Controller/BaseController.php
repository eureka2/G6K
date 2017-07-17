<?php

/*
The MIT License (MIT)

Copyright (c) 2015 Jacques Archimède

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

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use EUREKA\G6KBundle\Entity\Simulator;
use EUREKA\G6KBundle\Entity\ExpressionParser;
use EUREKA\G6KBundle\Entity\Source;
use EUREKA\G6KBundle\Entity\ChoiceGroup;
use EUREKA\G6KBundle\Entity\Choice;
use EUREKA\G6KBundle\Entity\DataGroup;
use EUREKA\G6KBundle\Entity\Data;
use EUREKA\G6KBundle\Entity\FieldSet;
use EUREKA\G6KBundle\Entity\FieldRow;
use EUREKA\G6KBundle\Entity\Field;
use EUREKA\G6KBundle\Entity\BlockInfo;
use EUREKA\G6KBundle\Entity\Chapter;
use EUREKA\G6KBundle\Entity\Section;
use EUREKA\G6KBundle\Entity\DOMClient as Client;
use EUREKA\G6KBundle\Entity\ResultFilter;
use EUREKA\G6KBundle\Entity\Step;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Cookie;

class BaseController extends Controller {

	protected $simu;
	protected $parser;
	protected $error;
	protected $recursion = 0;
	protected $simuWidgets = array('abListbox', 'abDatepicker');
	protected $variables = array();
	protected $memo = array();
	protected $sources = null;
	protected $uricache = array();
	protected $log = array();
	protected $script = 0;
	protected $sequence = array();
	protected $path = "";


	protected function runStep(Request $request, $form, $simu, &$view, $test)
	{
		$no_js = $request->query->get('no-js') || 0;
		$this->parser = new ExpressionParser();
		$this->uricache = array();
		try {
			$this->simu = new Simulator($this);
			if ($test && file_exists(dirname(dirname(__FILE__)).'/Resources/data/simulators/work/'.$simu.'.xml')) {
				$this->simu->load(dirname(dirname(__FILE__)).'/Resources/data/simulators/work/'.$simu.'.xml');
			} else {
				$this->simu->load(dirname(dirname(__FILE__)).'/Resources/data/simulators/'.$simu.'.xml');
			}
		} catch (\Exception $e) {
			$page404Url = $request->getScheme() . '://' . $request->getHttpHost() . $this->container->getParameter('page404');
			$page404 = @file_get_contents($page404Url);
			if ($page404 !== FALSE) {
				return new Response($page404, 404, array('Content-Type', 'text/html')); 
			} elseif ($page404Url) {
				return new RedirectResponse($page404Url);
			} else {
				throw $this->createNotFoundException($this->get('translator')->trans("This simulator does not exist"));
			}
		}
		if (! $view) {
			$view = $this->simu->getDefaultView();
			if ($view == '') {
				$domain = $request->getHost();
				$domainview = $this->container->getParameter('domainview');
				$view = "Default";
				foreach ($domainview as $d => $v) {
					if (preg_match("/".$d."$/", $domain)) {
						$view = $v;
						break;
					}
				}
			}
		}
		$viewpath = $this->container->getParameter('viewpath');
		$this->path = $request->getScheme().'://'.$request->getHttpHost();
		if (isset($viewpath[$view])) {
			$this->path = $viewpath[$view];
		}
		$istep = -1;
		$this->error = false;
		$this->sequence = array();
		$this->script = $no_js == 1 ? 0 : 1;
		$dates = array();

		$this->evaluateDefaults();
		$this->evaluateMinMax();
		foreach ($form as $name => $value) {
			if ($name == 'step') {
				$istep = (int)$value;
			} elseif ($name == 'sequence') {
				$this->sequence = explode('|', $value);;
			} elseif (preg_match("/^(.+)_g6k_(day|month|year)$/", $name, $matches)) {
				$dates[$matches[1]][$matches[2]] = $value;
			} else {
				$data = $this->simu->getDataByName($name);
				if ($data !== null) {
					$data->setValue($value);
					$this->variables[''.$data->getId()] = $data->getValue();
					$this->variables[$name] = $data->getValue();
				}
			}
		}
		foreach ($dates as $name => $date) {
			$data = $this->simu->getDataByName($name);
			if ($data !== null) {
				$value = $date['day'] . "/" . $date['month'] . "/" . $date['year'];
				$data->setValue($value);
				$this->variables[''.$data->getId()] = $data->getValue();
				$this->variables[$name] = $data->getValue();
				$form[$name] = $data->getValue();
			}
		}
		$dynamic = $this->simu->isDynamic() && 
					($no_js == 0) &&
					($istep < 0 || $this->script = 1);
		$this->simu->setDynamic($dynamic);
		$this->variables['script'] = $this->script;
		$this->variables['dynamic'] = $dynamic;

		$steps = array();
		foreach ($this->simu->getSteps() as $s) {
			$steps[] = array('id' => $s->getId(), 'name' => $s->getName(), 'label' => $s->getLabel());
			foreach ($s->getPanels() as $panel) {
				foreach ($panel->getFieldSets() as $block) {
					if ($block instanceof FieldSet) {
						$fieldset = $block;
						foreach ($fieldset->getFields() as $child) {
							if ($child instanceof Field) {
								$field = $child;
								if ($field->getUsage() == "input") {
									$id = $field->getData();
									$data = $this->simu->getDataById($id);
									$data->setInputStepId($s->getId());
									$fieldset->setInputFields(true);
									if ($data->getType() == 'boolean' && $s->getId() == $istep && !isset($form[$data->getName()])) {
										$data->setValue('false');
										$this->variables[''.$data->getId()] = $data->getValue();
										$this->variables[$name] = $data->getValue();
									}
								}
							} elseif ($child instanceof FieldRow) {
								$fieldrow = $child;
								foreach ($fieldrow->getFields() as $field) {
									if ($field->getUsage() == "input") {
										$id = $field->getData();
										$data = $this->simu->getDataById($id);
										$data->setInputStepId($s->getId());
										$fieldset->setInputFields(true);
										if ($data->getType() == 'boolean' && $s->getId() == $istep && !isset($form[$data->getName()])) {
											$data->setValue('false');
											$this->variables[''.$data->getId()] = $data->getValue();
											$this->variables[$name] = $data->getValue();
										}
									}
								}
							}
						}
					}
				}
			}
			$this->variables['step'.$s->getId().'.dynamic'] = $s->isDynamic() ? 1 : 0;
			$this->variables['step'.$s->getId().'.output'] = $s->getOutput();
		}
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				foreach ($data->getDatas() as $gdata) {
					if ($gdata->getInputStepId() < 0 && ($gdata->getContent() != "" || $gdata->getSource() != "")) {
						$gdata->setValue("");
					}
				}
			} elseif ($data instanceof Data) {
				if ($data->getInputStepId() < 0 && ($data->getContent() != "" || $data->getSource() != "")) {
					$data->setValue("");
				}
			}
		}
		$direction = 0;
		$this->processRules($istep);
		if ($istep >= 0) {
			$skipValidation = false;
			$step = $this->simu->getStepById($istep);
			if (is_null($step)) {
				return null;
			}
			foreach ($step->getActions() as $action) {
				if (isset($form[$action->getName()])) {
					if ($action->getFor() == 'priorStep') {
						$skipValidation = true;
					} elseif ($action->getFor() == 'jumpToStep') {
						$toStep = $action->getUri();
						$skipValidation = $istep > $toStep;
					}
					break;
				}
			}
			foreach ($step->getPanels() as $panel) {
				foreach ($panel->getFieldSets() as $block) {
					if ($block instanceof FieldSet) {
						$fieldset = $block;
						foreach ($fieldset->getFields() as $child) {
							if ($child instanceof Field) {
								$field = $child;
								$this->checkField($field, $form, $skipValidation);
							} elseif ($child instanceof FieldRow) {
								$fieldrow = $child;
								foreach ($fieldrow->getFields() as $field) {
									$this->checkField($field, $form, $skipValidation);
								}
							}
						}
					}
				}
			}
			$this->processDatas($istep);
			if (! $this->error) {
				foreach ($step->getActions() as $action) {
					if (isset($form[$action->getName()])) {
						if ($action->getFor() == 'priorStep') {
							if (count($this->sequence) > 0 && (! $this->simu->isDynamic() ||  $istep != 0)) {
								$istep = array_pop($this->sequence);
								$direction = -1;
							}
						} elseif ($action->getFor() == 'nextStep') {
							if (! $this->simu->isDynamic() || $istep != 0) {
								array_push($this->sequence, $istep);
								$istep++;
								$direction = 1;
							}
						} elseif ($action->getFor() == 'jumpToStep') {
							$toStep = $action->getUri();
							$direction = ($toStep - $istep) / abs($toStep - $istep);
							array_push($this->sequence, $istep);
							$istep = $toStep;
						} elseif ($action->getFor() == 'newSimulation') {
							$route = $request->get('_route');
							if ($route == 'eureka_g6k_calcul_view' || $route == 'eureka_g6k_calcul_view_try') {
								return $this->redirect($this->generateUrl($route, array('simu' => $simu, 'view' => $view)));
							} else {
								return $this->redirect($this->generateUrl($route, array('simu' => $simu)));
							}
						}
						break;
					}
				}
			}
		} else {
			$this->processDatas($istep);
			$istep = $this->simu->isDynamic() ? 0 : 1;
		}
		$stepCount = count($steps);
		do {
			$step = $this->simu->getStepById($istep);
			$stepDisplayable = false;
			foreach ($step->getPanels() as $panel) {
				$panel->setDisplayable($panel->isDisplayable() && $step->isDisplayable());
				foreach ($panel->getFieldSets() as $block) {
					if ($block instanceof FieldSet) {
						$fieldset = $block;
						$fieldset->setDisplayable($fieldset->isDisplayable() && $panel->isDisplayable());
						foreach ($fieldset->getFields() as $child) {
							if ($child instanceof Field) {
								$field = $child;
								$field->setDisplayable($field->isDisplayable() && $fieldset->isDisplayable());
								$this->processField($field, $step, $stepDisplayable); 
							} elseif ($child instanceof FieldRow) {
								$fieldrow = $child;
								foreach ($fieldrow->getFields() as $field) {
									$field->setDisplayable($field->isDisplayable() && $fieldset->isDisplayable());
									$this->processField($field, $step, $stepDisplayable); 
								}
							}
						}
						$fieldset->setLegend($this->replaceVariables($fieldset->getLegend()));
					} elseif ($block instanceof BlockInfo) {
						$blocinfo = $block;
						$blocinfo->setDisplayable($blocinfo->isDisplayable() && $panel->isDisplayable());
						$chapterDisplayables = 0;
						foreach ($blocinfo->getChapters() as $chapter) {
							$chapter->setDisplayable($chapter->isDisplayable() && $blocinfo->isDisplayable());
							$sectionDisplayables = 0;
							foreach ($chapter->getSections() as $section) {
								$section->setDisplayable($section->isDisplayable() && $chapter->isDisplayable());
								if ($section->isDisplayable()) {
									$sectionDisplayables++;
								}
								$section->setContent($this->replaceVariables($section->getContent()));
							}
							$chapter->setDisplayable($chapter->isDisplayable() && $sectionDisplayables > 0);
							if ($chapter->isDisplayable()) {
								$chapterDisplayables++;
							}
						}
						$blocinfo->setDisplayable($blocinfo->isDisplayable() && $chapterDisplayables > 0);
					}
				}
			}
			$footnotes = $step->getFootNotes();
			if ($footnotes !== null) {
				$disp = false;
				foreach ($footnotes->getFootNotes() as $footnote) {
					if ($footnote->isDisplayable()) {
						$footnote->setText($this->replaceVariables($footnote->getText()));
						$disp = true;
					}
				}
				$footnotes->setDisplayable($disp);
			}
			$istep += $direction;
		} while (!$stepDisplayable && $istep > 0 && $istep <= $stepCount);
		$step->setDescription($this->replaceVariables($step->getDescription()));
		return $step;
	}

	protected function addWidget($widget) {
		if (! in_array($widget, $this->simuWidgets)) {
			$this->simuWidgets[] = $widget;
		}
	}

	protected function widgetDeps($widget, &$widgets, &$availWidgets) {
		if (isset($availWidgets[$widget]['deps'])) {
			foreach ($availWidgets[$widget]['deps'] as $dep) {
				if (isset($availWidgets[$dep]) && ! isset($widgets[$dep])) {
					$this->widgetDeps($dep, $widgets, $availWidgets);
					$widgets[$dep] = $availWidgets[$dep];
				}
			}
		}
	}

	protected function runFields(Request $request, $simu, $test = false)
	{
		$form = $request->request->all();
		$this->simu = new Simulator($this);
		if ($test && file_exists(dirname(dirname(__FILE__)).'/Resources/data/simulators/work/'.$simu.'.xml')) {
			$fields = $this->simu->toJSON(dirname(dirname(__FILE__)).'/Resources/data/simulators/work/'.$simu.'.xml', $form['stepId']);
		} else {
			$fields = $this->simu->toJSON(dirname(dirname(__FILE__)).'/Resources/data/simulators/'.$simu.'.xml', $form['stepId']);
		}
		$response = new Response();
		$response->setContent($fields);
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function runSource(Request $request, $simu, $test = false)
	{
		$form = $request->request->all();
		$this->simu = new Simulator($this);
		if ($test && file_exists(dirname(dirname(__FILE__)).'/Resources/data/simulators/work/'.$simu.'.xml')) {
			$this->simu->loadForSource(dirname(dirname(__FILE__)).'/Resources/data/simulators/work/'.$simu.'.xml');
		} else {
			$this->simu->loadForSource(dirname(dirname(__FILE__)).'/Resources/data/simulators/'.$simu.'.xml');
		}
		$source = $this->simu->getSourceById((int)$form['source']);
		$params = $source->getParameters();
		foreach ($params as $param) {
			if ($param->getOrigin() == 'data') {
				$data = $this->simu->getDataById($param->getData());
				if ($data !== null) {
					$name = $param->getName();
					$value = isset($form[$name]) ? $form[$name] : '';
					$data->setValue($value);
				}
			}
		}
		if (isset($form['returnPath'])) {
			$source->setReturnPath($form['returnPath']);
		}
		$result = $this->processSource($source);
		if ($source->getReturnType() == 'xml') {
			$result =  ResultFilter::xml2array($result);
			if (count($result) == 1 && is_array($result[0])) {
				$result = $result[0];
			}
		}
		$response = new Response();
		if ($this->isDevelopmentEnvironment() && ! version_compare(phpversion(), '5.4.0', '<')) {
			$response->setContent(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES | JSON_HEX_APOS | JSON_HEX_QUOT));
		} else {
			$response->setContent(json_encode($result));
		}
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function checkField($field, $form, $skipValidation) 
	{
		$id = $field->getData();
		$data = $this->simu->getDataById($id);
		if ($field->getUsage() == "input") {
			if (!isset($form[$data->getName()])) {
				if ($data->getType() == 'boolean') {
					$data->setValue('false');
				}
				$this->variables[''.$data->getId()] = $data->getValue();
				$this->variables[$data->getName()] = $data->getValue();
			} elseif (! $skipValidation) {
				$value = $data->getValue();
				if ($field->isRequired() && empty($value)) {
					$data->setError(true);
					if ($field->getLabel() != "") {
						$data->addErrorMessage($this->get('translator')->trans("The '%field%' field is required", array('%field%' => $field->getLabel())));
					} else {
						$data->addErrorMessage($this->get('translator')->trans("This field is required"));
					}
					$this->error = true;
				} elseif (! $data->check()) {
					$data->setError(true);
					switch ($data->getType()) {
						case 'date':
							$data->addErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'jj/mm/aaaa')));
							break;
						case 'number': 
							$data->addErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'chiffres seulement')));
							break;
						case 'integer': 
							$data->addErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'chiffres seulement')));
							break;
						case 'money': 
							$data->addErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'montant')));
							break;
						case 'percent':
							$data->addErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'pourcentage')));
							break;
						default:
							$data->addErrorMessage($this->get('translator')->trans("This value is not in the expected format"));
					}
					$this->error = true;
					unset($this->variables[''.$data->getId()]);
					unset($this->variables[$data->getName()]);
				}
			}
		}
	}

	protected function processField($field, $step, &$displayable) 
	{
		$id = $field->getData();
		$data = $this->simu->getDataById($id);
		$data->setUsed(false);
		if ($field->isDisplayable()) {
			$displayable = true;
			$explanation = $field->getExplanation();
			if ($explanation != "") {
				$result = $this->evaluate($explanation);
				if ($result !== false) {
					$field->setExplanation($result);
				}
			}
			if ($field->getUsage() == 'input') {
				$data->setUsed(true);
				if ($field->getWidget() != '') {
					$this->addWidget($field->getWidget());
				} elseif ($data->getType() == 'date') {
					$this->addWidget('abDatepicker');
				} elseif ($data->getType() == 'choice' && ! $field->isExpanded()) {
					$this->addWidget('abListbox');
				}
			}
			$this->populateChoiceWithSource($data);
			$this->replaceFieldNotes($field);
		} elseif ($step->getId() == 0 || $step->isDynamic()) {
			if ($field->getUsage() == 'input') {
				$data->setUsed(true);
				if ($field->getWidget() != '') {
					$this->addWidget($field->getWidget());
				} elseif ($data->getType() == 'date') {
					$this->addWidget('abDatepicker');
				} elseif ($data->getType() == 'choice' && ! $field->isExpanded()) {
					$this->addWidget('abListbox');
				}
			}
			$this->populateChoiceWithSource($data);
			$this->replaceFieldNotes($field);
		}
	}

	protected function populateChoiceWithSource($data) 
	{
		$choiceSource = $data->getChoiceSource();
		if ($choiceSource != null) {
			$source = $choiceSource->getId();
			if ($source != "") {
				$source = $this->evaluate($source);
				if ($source !== false) {
					$source = $this->simu->getSourceById($source);
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
		foreach ($data->getChoices() as $choice) {
			if ($choice instanceof ChoiceGroup) {
				if ($choice->getChoiceSource() !== null) {
					$choiceSource = $choice->getChoiceSource();
					if ($choiceSource != null) {
						$source = $choiceSource->getId();
						if ($source != "") {
							$source = $this->evaluate($source);
							if ($source !== false) {
								$source = $this->simu->getSourceById($source);
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
				}
			}
		}
	}

	protected function replaceFieldNotes($field) 
	{
		if ($field->getPreNote() !== null) {
			$note = $field->getPreNote();
			$note->setText($this->replaceVariables($note->getText()));
		}
		if ($field->getPostNote() !== null) {
			$note = $field->getPostNote();
			$note->setText($this->replaceVariables($note->getText()));
		}
	}

	protected function evaluate($condition) 
	{
		$expr = $this->parser->parse($condition);
		$expr->postfix();
		$expr->setVariables($this->variables);
		return $expr->evaluate();
	}

	protected function evaluateDefault($data) 
	{
		$default = $data->getUnparsedDefault();
		if ($default != "" && ! $data->isError()) {
			$value = $this->evaluate($default);
			if ($value !== false) {
				$data->setDefault($value);
				$data->setUnparsedDefault("");
			}
		}
	}

	protected function evaluateDefaults() 
	{
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				foreach ($data->getDatas() as $gdata) {
					$this->evaluateDefault($gdata);
				}
			} else {
				$this->evaluateDefault($data);
				$this->evaluateMax($data);
			}
		}
	}

	protected function evaluateMin($data) 
	{
		$min = $data->getUnparsedMin();
		if ($min != "") {
			try {
				$result = $this->evaluate($min);
				if ($result !== false) {
					$data->setMin($result);
				}
			} catch (\Exception $e) {
			}
		}
	}

	protected function evaluateMax($data) 
	{
		$max = $data->getUnparsedMax();
		if ($max != "") {
			try {
				$result = $this->evaluate($max);
				if ($result !== false) {
					$data->setMax($result);
				}
			} catch (\Exception $e) {
			}
		}
	}

	protected function evaluateMinMax() 
	{
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				foreach ($data->getDatas() as $gdata) {
					$this->evaluateMin($gdata);
					$this->evaluateMax($gdata);
				}
			} else {
				$this->evaluateMin($data);
				$this->evaluateMax($data);
			}
		}
	}

	protected function processData($data, $istep) 
	{
		if (! $data->isError()) {
			$default = $data->getUnparsedDefault();
			if ($default != "") {
				$value = $this->evaluate($default);
				if ($value !== false) {
					$data->setDefault($value);
					$data->setUnparsedDefault("");
					foreach ($data->getRulesDependency() as $ruleId) {
						$this->processRule($this->simu->getBusinessRuleById($ruleId), $istep); 
					}
					$this->processDatas($istep);
				}
			}
			$content = $data->getContent();
			if ($content != "") {
				try {
					$value = $this->evaluate($content);
					if ($value !== false) {
						$data->setValue($value);
						$this->variables[''.$data->getId()] = $data->getValue();
						$this->variables[$data->getName()] = $data->getValue();
						$data->setContent("");
						foreach ($data->getRulesDependency() as $ruleId) {
							$this->processRule($this->simu->getBusinessRuleById($ruleId), $istep); 
						}
						$this->processDatas($istep);
					}
				} catch (\Exception $e) {
					if ($istep == 0 || $data->getInputStepId() == $istep) {
						$data->setError(true);
						$data->addErrorMessage($e->getMessage());
						$this->error = true;
					}
				}
			}
			$index = $data->getUnparsedIndex();
			if ($index != "") {
				try {
					$value = $this->evaluate($index);
					if ($value !== false) {
						$data->setIndex($value);
					}
				} catch (\Exception $e) {
				}
			}
			$source = $data->getSource();
			if ($source != "" && ($data->getInputStepId() < 0 || $data->getValue() == "")) {
				$source = $this->evaluate($source);
				if ($source !== false) {
					if (!isset($this->sources[$source])) {
						$this->sources[$source] = array();
					}
					$this->sources[$source][$data->getId()] = $data;
				}
			}
			$min = $data->getUnparsedMin();
			if ($min != "") {
				try {
					$result = $this->evaluate($min);
					if ($result !== false) {
						$data->setMin($result);
						if (($istep == 0 || $data->getInputStepId() == $istep) && $data->getValue() != '' && $data->getValue() < $result) {
							$data->setError(true);
							$data->addErrorMessage($this->get('translator')->trans("This value can not be less than %min%", array('%min%', $result)));
							$this->error = true;
						}
					}
				} catch (\Exception $e) {
				}
			}
			$max = $data->getUnparsedMax();
			if ($max != "") {
				try {
					$result = $this->evaluate($max);
					if ($result !== false) {
						$data->setMax($result);
						if (($istep == 0 || $data->getInputStepId() == $istep) && $data->getValue() != '' && $data->getValue() > $result) {
							$data->setError(true);
							$data->addErrorMessage($this->get('translator')->trans("This value can not be greater than %max%", array('%max%', $result)));
							$this->error = true;
						}
					}
				} catch (\Exception $e) {
				}
			}
		}
	}

	protected function processActions($actions, $istep) 
	{
		foreach ($actions as $action) {
			switch ($action->getName()) {
				case 'notifyError':
					switch ($action->getTarget()) {
						case 'data':
							$data =  $this->simu->getDataById($action->getData());
							if ($istep == 0 || $data->getInputStepId() == $istep) {
								$data->setError(true);
								$data->addErrorMessage($this->replaceVariables($action->getValue()));
								$this->error = true;
							}
							break;
						case 'datagroup':
							$datagroup =  $this->simu->getDataGroupById($action->getDatagroup());
							$inputStepId = false;
							foreach ($datagroup->getDatas() as $data) {
								if ($data->getInputStepId() == $istep) {
									$inputStepId = true;
								}
							}
							if ($istep == 0 || $inputStepId) {
								$datagroup->setError(true);
								$datagroup->addErrorMessage($this->replaceVariables($action->getValue()));
								$this->error = true;
							}
							break;
						case 'dataset':
							$$this->simu->setError(true);
							$$this->simu->addErrorMessage($this->replaceVariables($action->getValue()));
							$this->error = true;
							break;
					}
					break;
				case 'notifyWarning':
					switch ($action->getTarget()) {
						case 'data':
							$data =  $this->simu->getDataById($action->getData());
							if ($istep == 0 || $data->getInputStepId() == $istep) {
								$data->setWarning(true);
								$data->addWarningMessage($this->replaceVariables($action->getValue()));
							}
							break;
						case 'datagroup':
							$datagroup =  $this->simu->getDataGroupById($action->getDatagroup());
							$inputStepId = false;
							foreach ($datagroup->getDatas() as $data) {
								if ($data->getInputStepId() == $istep) {
									$inputStepId = true;
								}
							}
							if ($istep == 0 || $inputStepId) {
								$datagroup->setWarning(true);
								$datagroup->addWarningMessage($this->replaceVariables($action->getValue()));
							}
							break;
						case 'dataset':
							$$this->simu->setWarning(true);
							$$this->simu->addWarningMessage($this->replaceVariables($action->getValue()));
							break;
					}
					break;
				case 'hideObject':
				case 'showObject':
					$stepId = $action->getStep();
					$step = $this->simu->getStepById($stepId);
					switch ($action->getTarget()) {
						case 'step':
							$step->setDisplayable($action->getName() == 'showObject');
							break;
						case 'panel':
							$panel = $step->getPanelById($action->getpanel());
							$panel->setDisplayable($action->getName() == 'showObject');
							break;
						case 'fieldset':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$fieldset->setDisplayable($action->getName() == 'showObject');
							break;
						case 'field':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$field = $fieldset->getFieldByPosition($action->getField());
							$field->setDisplayable($action->getName() == 'showObject');
							break;
						case 'blocinfo':
							$panel = $step->getPanelById($action->getpanel());
							$blocinfo = $panel->getBlockInfoById($action->getBlockinfo());
							$blocinfo->setDisplayable($action->getName() == 'showObject');
							break;
						case 'chapter':
							$panel = $step->getPanelById($action->getpanel());
							$blocinfo = $panel->getBlockInfoById($action->getBlockinfo());
							$chapter = $blocinfo->getChapterById($action->getChapter());
							$chapter->setDisplayable($action->getName() == 'showObject');
							break;
						case 'section':
							$panel = $step->getPanelById($action->getpanel());
							$blocinfo = $panel->getBlockInfoById($action->getBlockinfo());
							$chapter = $blocinfo->getChapterById($action->getChapter());
							$section = $chapter->getSectionById($action->getSection());
							$section->setDisplayable($action->getName() == 'showObject');
							break;
						case 'prenote':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$field = $fieldset->getFieldByPosition($action->getField());
							// TODO : que faire ?
							break;
						case 'postnote':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$field = $fieldset->getFieldByPosition($action->getField());
							// TODO : que faire ?
							break;
						case 'footnote':
							$footnotes = $step->getFootNotes();
							$footnote = $footnotes->getFootNoteById($action->getFootnote());
							$footnote->setDisplayable($action->getName() == 'showObject');
							break;
						case 'action':
							$actionButton = $step->getActionByName($action->getAction());
							$actionButton->setDisplayable($action->getName() == 'showObject');
							break;
						case 'choice':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$field = $fieldset->getFieldByPosition($action->getField());
							$data =  $this->simu->getDataById($field->getData());
							$choice = $data->getChoiceById($action->getChoice());
							$choice->setSelected($action->getName() == 'showObject');
							break;
					}
					break;
				case 'setAttribute':
					$data =  $this->simu->getDataById($action->getData());
					switch ($action->getTarget()) {
						case 'content':
							$data->setContent($action->getValue());
							break;
						case 'default':
							$data->setUnparsedDefault($action->getValue());
							break;
						case 'explanation':
							break;
						case 'index':
							$data->setUnparsedIndex($action->getValue());
							break;
						case 'min':
							$data->setUnparsedMin($action->getValue());
							break;
						case 'max':
							$data->setUnparsedMax($action->getValue());
							break;
						case 'source':
							$data->setSource($action->getValue());
							break;
					}
					break;
				case 'unsetAttribute':
					$data =  $this->simu->getDataById($action->getData());
					switch ($action->getTarget()) {
						case 'content':
							$data->setContent('');
							break;
						case 'default':
							$data->setUnparsedDefault('');
							break;
						case 'explanation':
							break;
						case 'index':
							$data->setUnparsedIndex('');
							break;
						case 'min':
							$data->setUnparsedMin('');
							break;
						case 'max':
							$data->setUnparsedMax('');
							break;
						case 'source':
							$data->setSource('');
							break;
					}
					break;
			}
		}
	}

	protected function processRule($businessrule, $istep) 
	{
		$conditions = $businessrule->getConditions();
		$result = $this->evaluate($conditions);
		if ($result == 'true') {
			$this->processActions($businessrule->getIfActions(), $istep);
		} else if ($result == 'false') {
			$this->processActions($businessrule->getElseActions(), $istep);
		}
	}

	protected function processRules($istep) 
	{
		$businessrules = $this->simu->getBusinessRules();
		foreach ($businessrules as $businessrule) {
			$result = $this->processRule($businessrule, $istep) ;
		}
	}

	protected function processDatas($istep) 
	{
		$this->sources = array();
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				$inputStepId = false;
				foreach ($data->getDatas() as $gdata) {
					$this->processData($gdata, $istep);
					if ($gdata->getInputStepId() == $istep) {
						$inputStepId = true;
					}
				}
			} elseif ($data instanceof Data) {
				$this->processData($data, $istep);
			}
		}
		if (count($this->sources) > 0) {
			$evaluated = false;
			foreach ($this->simu->getSources() as $source) {
				$id = (string)$source->getId();
				if (isset($this->sources[$id])) {
					$result = $this->processSource($source);
					if ($result !== null) {
						$datas = $this->sources[$id];
						foreach ($datas as $d) {
							if (is_array($result)) { 
								switch (count($result)) {
									case 0:
										$value = "";
										break;
									case 1:
										$value = end($result);
										break;
									default:
										$index = $d->getIndex();
										if ($index != "") {
											$value = isset($result[$index]) ? $result[$index] : $result[strtolower($index)];
										} else {
											$value = "";
										}
								}
							} else {
								$value = $result;
							}
							if ($d->getType() == "date" && preg_match("/^\d\d\d\d-\d{1,2}-\d{1,2}$/", $value)) {
								$value = $this->parseDate("Y-m-d", $value)->format("d/m/Y");
							}
							$oValue = $d->getValue();
							$d->setValue($value);
							$d->setSource("");
							$this->variables[''.$d->getId()] = $d->getValue();
							$this->variables[$d->getName()] = $d->getValue();
							if ($d->getValue() != $oValue) {
								foreach ($d->getRulesDependency() as $ruleId) {
									$this->processRule($this->simu->getBusinessRuleById($ruleId), $istep); 
								}
							}
							$evaluated = true;
						}
					}
				}
			}
			if ($evaluated) {
				$this->processDatas($istep);
			}
		}
	}

	protected function formatParamValue($param)
	{
		$data = $this->simu->getDataById($param->getData());
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
			$datasource = $this->simu->getDatasourceById((int)$datasource);
		} else {
			$datasource = $this->simu->getDatasourceByName($datasource);
		}
		return $datasource;
	}

	protected function processSource(Source $source) 
	{
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
				if (isset($this->uricache[$uri])) {
					$result = $this->uricache[$uri];
				} else {
					$client = Client::createClient();
					if (strcasecmp($datasource->getMethod(), "GET") == 0) {
						$result = $client->get($uri, $headers);
					} else {
						$result = $client->post($uri, $headers, $datas);
					}
					$this->uricache[$uri] = $result;
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
				$database = $this->simu->getDatabaseById($datasource->getDatabase());
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

	protected function replaceVariableTag($matches)
	{
		$variable = '#' . $matches[1];
		if ($matches[2] == 'L') {
			$variable .= 'L';
		}
		return $variable;
	}

	protected function replaceVariable($matches)
	{
		if (preg_match("/^\d+$/", $matches[1])) {
			$id = (int)$matches[1];
			$data = $this->simu->getDataById($id);
		} else {
			$name = $matches[3];
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

	protected function replaceVariables($target)
	{
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

	protected function parseDate($format, $dateStr)
	{
		if (empty($dateStr)) {
			return null;
		}
		$date = \DateTime::createFromFormat($format, $dateStr);
		$errors = \DateTime::getLastErrors();
		if ($errors['error_count'] > 0) {
			throw new \Exception($errors['errors'][0]);
		}
		return $date;
	}

	public function isDevelopmentEnvironment()
	{
		return in_array($this->get('kernel')->getEnvironment(), array('test', 'dev'));
	}

}
