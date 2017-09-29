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
use EUREKA\G6KBundle\Entity\Step;

use EUREKA\G6KBundle\Manager\ExpressionParser\Parser;
use EUREKA\G6KBundle\Manager\DOMClient as Client;
use EUREKA\G6KBundle\Manager\ResultFilter;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Cookie;

class BaseController extends Controller {

	public $helper;

	public $simu;
	protected $parser;
	protected $error;
	protected $recursion = 0;
	protected $simuWidgets = array('abListbox', 'abDatepicker');
	protected $variables = array();
	protected $memo = array();
	protected $sources = null;
	protected $log = array();
	protected $script = 0;
	protected $sequence = array();
	protected $path = "";
	public $uricache = array();
	public $databasesDir;
	public $simulatorsDir;
	public $publicDir;
	public $viewsDir;


	protected function runStep(Request $request, $form, $simu, &$view, $test)
	{
		$no_js = $request->query->get('no-js') || 0;
		$this->parser = new Parser();
		$this->uricache = array();
		try {
			$this->simu = new Simulator($this);
			$this->simu->load($this->getSimuPath($simu, $test));
		} catch (\Exception $e) {
			if ($this->container->hasParameter('page404')) {
				$page404Url = $request->getScheme() . '://' . $request->getHttpHost() . $this->container->getParameter('page404');
				try {
					$client = Client::createClient();
					$page404 = $client->get($page404Url);
					if ($page404 == '') {
						$page404 = FALSE;
					}
				} catch (\Exception $e) {
					$page404 = FALSE;
				}
				if ($page404 !== FALSE) {
					return new Response($page404, 404, array('Content-Type', 'text/html')); 
				} else {
					throw $this->createNotFoundException($this->get('translator')->trans("This simulator does not exist"));
				}
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
						$fieldset->setLegend($this->helper->replaceVariables($fieldset->getLegend()));
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
								$section->setContent($this->helper->replaceVariables($section->getContent()));
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
						$footnote->setText($this->helper->replaceVariables($footnote->getText()));
						$disp = true;
					}
				}
				$footnotes->setDisplayable($disp);
			}
			$istep += $direction;
		} while (!$stepDisplayable && $istep > 0 && $istep <= $stepCount);
		$step->setDescription($this->helper->replaceVariables($step->getDescription()));
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
		$fields = $this->simu->toJSON($this->getSimuPath($simu, $test), $form['stepId']);
		$response = new Response();
		$response->setContent($fields);
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function runSource(Request $request, $simu, $test = false)
	{
		$form = $request->request->all();
		$this->simu = new Simulator($this);
		$this->simu->loadForSource($this->getSimuPath($simu, $test));
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
		$result = $this->helper->processSource($source);
		if ($source->getReturnType() == 'xml') {
			$result =  ResultFilter::xml2array($result);
			if (count($result) == 1 && is_array($result[0])) {
				$result = $result[0];
			}
		}
		$response = new Response();
		if ($this->helper->isDevelopmentEnvironment() && ! version_compare(phpversion(), '5.4.0', '<')) {
			$response->setContent(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES | JSON_HEX_APOS | JSON_HEX_QUOT));
		} else {
			$response->setContent(json_encode($result));
		}
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	protected function getSimuPath($simu, $test = false) {
		$path = null;
		if ($test) {
			try {
				$path = $this->simulatorsDir. '/work/'.$simu.'.xml';
				if (! file_exists($path)) {
					$path = null;
				}
			} catch (\Exception $e) {
				$path = null;
			}
		} 
		if ($path === null) {
			$path = $this->simulatorsDir. '/'.$simu.'.xml';
		}
		return $path;
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
				if ($field->isRequired() && $value ==  '') {
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
			$this->helper->populateChoiceWithSource($data);
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
			$this->helper->populateChoiceWithSource($data);
			$this->replaceFieldNotes($field);
		}
	}

	protected function replaceFieldNotes($field) 
	{
		if ($field->getPreNote() !== null) {
			$note = $field->getPreNote();
			$note->setText($this->helper->replaceVariables($note->getText()));
		}
		if ($field->getPostNote() !== null) {
			$note = $field->getPostNote();
			$note->setText($this->helper->replaceVariables($note->getText()));
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
								$data->addErrorMessage($this->helper->replaceVariables($action->getValue()));
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
								$datagroup->addErrorMessage($this->helper->replaceVariables($action->getValue()));
								$this->error = true;
							}
							break;
						case 'dataset':
							$$this->simu->setError(true);
							$$this->simu->addErrorMessage($this->helper->replaceVariables($action->getValue()));
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
								$data->addWarningMessage($this->helper->replaceVariables($action->getValue()));
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
								$datagroup->addWarningMessage($this->helper->replaceVariables($action->getValue()));
							}
							break;
						case 'dataset':
							$$this->simu->setWarning(true);
							$$this->simu->addWarningMessage($this->helper->replaceVariables($action->getValue()));
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
							$prenote = $field->getPreNote();
							$prenote->setDisplayable($action->getName() == 'showObject');
							break;
						case 'postnote':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$field = $fieldset->getFieldByPosition($action->getField());
							$postnote = $field->getPostNote();
							$postnote->setDisplayable($action->getName() == 'showObject');
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
			$this->processRule($businessrule, $istep) ;
		}
	}

	protected function processDatas($istep) 
	{
		$this->sources = array();
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				foreach ($data->getDatas() as $gdata) {
					$this->processData($gdata, $istep);
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
					$result = $this->helper->processSource($source);
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
								$value = $this->helper->parseDate("Y-m-d", $value)->format("d/m/Y");
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

}

?>
