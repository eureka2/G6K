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

namespace App\G6K\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

use App\G6K\Model\Simulator;
use App\G6K\Model\DataGroup;
use App\G6K\Model\Data;
use App\G6K\Model\FieldSet;
use App\G6K\Model\FieldRow;
use App\G6K\Model\Field;
use App\G6K\Model\BlockInfo;
use App\G6K\Model\Step;

use App\G6K\Manager\ControllersTrait;

use App\G6K\Manager\ExpressionParser\Parser;
use App\G6K\Manager\DOMClient as Client;
use App\G6K\Manager\ResultFilter;
use App\G6K\Manager\ExpressionParser\DateFunction;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 *
 * The class BaseController is the heart the simulation engine
 *
 * @author    Jacques Archimède
 *
 */
class BaseController extends AbstractController {

	protected $projectDir;
	protected $translator;
	protected $kernel;
	protected $authorizationChecker;

	public function __construct(TranslatorInterface $translator, KernelInterface $kernel, AuthorizationCheckerInterface $authorizationChecker, $projectDir) {
		$this->projectDir = $projectDir;
		$this->kernel = $kernel;
		$this->authorizationChecker = $authorizationChecker;
		$this->translator = $translator;
	}

	use ControllersTrait;

	/**
	 * @var \App\G6K\Model\Simulator $simu Simulator instance used by this controller
	 *
	 * @access  public
	 *
	 */
	public $simu;

	/**
	 * @var \App\G6K\Manager\ExpressionParser\Parser $parser Parser instance used by this controller
	 *
	 * @access  protected
	 *
	 */
	protected $parser;

	/**
	 * @var bool      $error true if an error has been detected, false otherwise
	 *
	 * @access  protected
	 *
	 */
	protected $error;

	/**
	 * @var int        $recursion
	 *
	 * @access  protected
	 *
	 */
	protected $recursion = 0;

	/**
	 * @var array      $simuWidgets array of widgets name
	 *
	 * @access  protected
	 *
	 */
	protected $simuWidgets = array('abListbox', 'abDatepicker');

	/**
	 * @var array      $simuFunctions array of functions name
	 *
	 * @access  protected
	 *
	 */
	protected $simuFunctions = array();

	/**
	 * @var array      $variables value of variables for the expression parser
	 *
	 * @access  protected
	 *
	 */
	protected $variables = array();

	/**
	 * @var array      $memo 
	 *
	 * @access  protected
	 *
	 */
	protected $memo = array();

	/**
	 * @var mixed|null $sources 
	 *
	 * @access  protected
	 *
	 */
	protected $sources = null;

	/**
	 * @var array      $log 
	 *
	 * @access  protected
	 *
	 */
	protected $log = array();

	/**
	 * @var int        $script 1: javascript is enabled, 0: javascript is disabled
	 *
	 * @access  protected
	 *
	 */
	protected $script = 0;

	/**
	 * @var array      $sequence array of previous steps number
	 *
	 * @access  protected
	 *
	 */
	protected $sequence = array();

	/**
	 * @var string     $path URL of the server
	 *
	 * @access  protected
	 *
	 */
	protected $path = "";

	/**
	 * @var array      $uricache
	 *
	 * @access  public
	 *
	 */
	public $uricache = array();

	/**
	 * @var string      $databasesDir Databases directory
	 *
	 * @access  public
	 *
	 */
	public $databasesDir;

	/**
	 * @var string      $simulatorsDir Simulators directory
	 *
	 * @access  public
	 *
	 */
	public $simulatorsDir;

	/**
	 * @var string      $publicDir public directory
	 *
	 * @access  public
	 *
	 */
	public $publicDir;

	/**
	 * @var string      $viewsDir Templates directory
	 *
	 * @access  public
	 *
	 */
	public $viewsDir;

	/**
	 * Run the simulation engine for a step
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request the active request
	 * @param   array $form The form fields
	 * @param   string $simu The simulator name
	 * @param   string &$view The view name
	 * @param   bool $test true if it is a test from the administration module, false otherwise 
	 * @return  \Symfony\Component\HttpFoundation\Response|\App\G6K\Model\Step|null
	 *
	 */
	protected function runStep(Request $request, $form, $simu, &$view, $test)
	{
		$no_js = $request->query->get('no-js') || 0;
		$this->parser = new Parser();
		$this->uricache = array();
		try {
			$this->simu = new Simulator($this);
			$this->simu->load($this->getSimuPath($simu, $test));
		} catch (\Exception $e) {
			if ($this->hasParameter('page404')) {
				$page404Url = $request->getScheme() . '://' . $request->getHttpHost() . $this->getParameter('page404');
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
					throw $this->createNotFoundException($this->translator->trans("This simulator does not exist"));
				}
			} else {
				throw $this->createNotFoundException($this->translator->trans("This simulator does not exist"));
			}
		}
		if (! $view) {
			$view = $this->simu->getDefaultView();
			if ($view == '') {
				$domain = $request->getHost();
				$domainview = $this->getParameter('domainview');
				$view = "Default";
				foreach ($domainview as $d => $v) {
					if (preg_match("/".$d."$/", $domain)) {
						$view = $v;
						break;
					}
				}
			}
		}
		$viewpath = $this->getParameter('viewpath');
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
				try {
					$data = $this->simu->getDataByName($name);
					if ($data !== null) {
						$data->setValue($value);
						$this->variables[''.$data->getId()] = $data->getValue();
						$this->variables[$name] = $data->getValue();
					}
				} catch (\Exception $e) {
				}
			}
		}
		foreach ($dates as $name => $date) {
			try {
				$data = $this->simu->getDataByName($name);
				if ($data !== null) {
					$value = $this->makeDateString($date);
					$data->setValue($value);
					$this->variables[''.$data->getId()] = $data->getValue();
					$this->variables[$name] = $data->getValue();
					$form[$name] = $data->getValue();
				}
			} catch (\Exception $e) {
			}
		}
		$dynamic = $this->simu->isDynamic() && 
					($no_js == 0) &&
					($istep < 0 || $this->script == 1);
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
									if ($field->isRequired() || $field->isVisibleRequired()) {
										$fieldset->setRequiredFields(true);
									}
									if ($data->getType() == 'boolean' && $s->getId() == $istep && !isset($form[$data->getName()])) {
										$data->setValue('false');
										$this->variables[''.$data->getId()] = $data->getValue();
										$this->variables[$name] = $data->getValue();
									}
								}
							} elseif ($child instanceof FieldRow) {
								$fieldrow = $child;
								foreach ($fieldrow->getFields() as $rfield) {
									if ($rfield->getUsage() == "input") {
										$id = $rfield->getData();
										$data = $this->simu->getDataById($id);
										$data->setInputStepId($s->getId());
										$fieldset->setInputFields(true);
										if ($rfield->isRequired() || $rfield->isVisibleRequired()) {
											$fieldset->setRequiredFields(true);
										}
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
							if ($route == 'eureka_g6k_calcul_view' || $route == 'eureka_g6k_calcul_view_try' || $route == 'eureka_g6k_admin_simulator_calcul') {
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
		foreach ($step->getActions() as $action) {
			if ($action->getFor() == 'function') {
				$function = str_replace("'", '"', $action->getUri());
				$function = json_decode($function);
				$this->addFunction($function->function);
			}
		}
		return $step;
	}

	/**
	 * Adds a widget to the list of widgets
	 *
	 * @access  protected
	 * @param   string $widget The widget name
	 * @return  void
	 *
	 */
	protected function addWidget($widget) {
		if (! in_array($widget, $this->simuWidgets)) {
			$this->simuWidgets[] = $widget;
		}
	}

	/**
	 * Adds widgets that depend on a widget in the list of widgets
	 *
	 * @access  protected
	 * @param   string $widget The widget name
	 * @param   array &$widgets the list of widgets
	 * @param   array &$availWidgets the list of available widgets
	 * @return  void
	 *
	 */
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

	/**
	 * Adds a function to the list of functions
	 *
	 * @access  protected
	 * @param   string $function The function name
	 * @return  void
	 *
	 */
	protected function addFunction($function) {
		if (! in_array($function, $this->simuFunctions)) {
			$this->simuFunctions[] = $function;
		}
	}

	/**
	 * Adds functions that depend on a function in the list of functions
	 *
	 * @access  protected
	 * @param   string $function The function name
	 * @param   array &$functions the list of functions
	 * @param   array &$availFunctions the list of available functions
	 * @return  void
	 *
	 */
	protected function functionDeps($function, &$functions, &$availFunctions) {
		if (isset($availFunctions[$function]['deps'])) {
			foreach ($availFunctions[$function]['deps'] as $dep) {
				if (isset($availFunctions[$dep]) && ! isset($functions[$dep])) {
					$this->functionDeps($dep, $functions, $availFunctions);
					$functions[$dep] = $availFunctions[$dep];
				}
			}
		}
	}

	/**
	 * Returns the simulators attributes in JSON response format
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request the active request
	 * @param   string $simu The simulator name
	 * @param   bool $test (default: false) true if it is a test from the administration module, false otherwise 
	 * @return  \Symfony\Component\HttpFoundation\Response 
	 *
	 */
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

	/**
	 * Returns the requested source attributes in JSON response format
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request the active request
	 * @param   string $simu The simulator name
	 * @param   bool $test (default: false) true if it is a test from the administration module, false otherwise 
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
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
		$result = $this->processSource($source);
		if ($source->getReturnType() == 'xml') {
			$result =  ResultFilter::xml2array($result);
			if (count($result) == 1 && is_array($result[0])) {
				$result = $result[0];
			}
		}
		$response = new Response();
		$response->setContent(json_encode($result));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	/**
	 * Get the simulators directory
	 *
	 * @access  protected
	 * @param   string $simu The simulator name
	 * @param   bool $test (default: false) true if it is a test from the administration module, false otherwise 
	 * @return  string the simulators directory
	 *
	 */
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

	/**
	 * Checks the given field
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Field $field
	 * @param   array $form The form fields
	 * @param   bool $skipValidation
	 * @return  void
	 *
	 */
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
						$data->addErrorMessage($this->translator->trans("The '%field%' field is required", array('%field%' => $field->getLabel())));
					} else {
						$data->addErrorMessage($this->translator->trans("This field is required"));
					}
					$this->error = true;
				} elseif (! $data->check()) {
					$data->setError(true);
					switch ($data->getType()) {
						case 'date':
							$data->addErrorMessage($this->translator->trans("This value is not in the expected format (%format%)", array('%format%' => $this->translator->trans($this->simu->getDateFormat()))));
							break;
						case 'number': 
							$data->addErrorMessage($this->translator->trans("This value is not in the expected format (%format%)", array('%format%' => $this->translator->trans('numbers only'))));
							break;
						case 'integer': 
							$data->addErrorMessage($this->translator->trans("This value is not in the expected format (%format%)", array('%format%' => $this->translator->trans('numbers only'))));
							break;
						case 'money': 
							$data->addErrorMessage($this->translator->trans("This value is not in the expected format (%format%)", array('%format%' => $this->translator->trans('amount'))));
							break;
						case 'percent':
							$data->addErrorMessage($this->translator->trans("This value is not in the expected format (%format%)", array('%format%' => $this->translator->trans('percentage'))));
							break;
						default:
							$data->addErrorMessage($this->translator->trans("This value is not in the expected format"));
					}
					$this->error = true;
					unset($this->variables[''.$data->getId()]);
					unset($this->variables[$data->getName()]);
				}
			}
		}
	}

	/**
	 * Processes the given field for the step
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Field $field
	 * @param   \App\G6K\Model\Step $step
	 * @param   bool &$displayable
	 * @return  void
	 *
	 */
	protected function processField(Field $field, Step $step, &$displayable) 
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
				}
			}
			$this->populateChoiceWithSource($data);
			$this->replaceFieldNotes($field);
		} elseif ($step->getId() == 0 || $step->isDynamic()) {
			if ($field->getUsage() == 'input') {
				$data->setUsed(true);
				if ($field->getWidget() != '') {
					$this->addWidget($field->getWidget());
				}
			}
			$this->populateChoiceWithSource($data);
			$this->replaceFieldNotes($field);
		}
	}

	/**
	 * Replaces data values in the notes of a field
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Field $field
	 * @return  void
	 *
	 */
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

	/**
	 * Evaluates a condition with the expression parser
	 *
	 * @access  protected
	 * @param   string $condition The condition to evaluate
	 * @return  string|false Result of the evaluation
	 *
	 */
	protected function evaluate($condition) 
	{
		$expr = $this->parser->parse($condition);
		$expr->postfix();
		$expr->setVariables($this->variables);
		return $expr->evaluate();
	}

	/**
	 * Evaluates the default value of the given data
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Data $data
	 * @return  void
	 *
	 */
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

	/**
	 * Evaluates the default value of all data
	 *
	 * @access  protected
	 * @return  void
	 *
	 */
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

	/**
	 * Evaluates the minimum value of the given data
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Data $data
	 * @return  void
	 *
	 */
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

	/**
	 * Evaluates the maximum value of the given data
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Data $data
	 * @return  void
	 *
	 */
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

	/**
	 * Evaluates the minimum and the maximum value of all data
	 *
	 * @access  protected
	 * @return  void
	 *
	 */
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

	/**
	 * Processes the given data for the step
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\Data $data
	 * @param   int $istep The step number
	 * @return  void
	 *
	 */
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
						if (($istep == 0 || $data->getInputStepId() == $istep) && $data->getValue() != '') {
							if ($data->getType() == 'text' || $data->getType() == 'textarea') {
								if (strlen($data->getValue()) < $result) {
									$data->setError(true);
									$data->addErrorMessage($this->translator->trans("The length of this value can not be less than %min%", array('%min%' => $result)));
									$this->error = true;
								}
							} elseif ($data->getType() == 'date') {
								$min = DateFunction::makeDate($result);
								$value = DateFunction::makeDate($data->getValue());
								if ($value < $min) {
									$data->setError(true);
									$data->addErrorMessage($this->translator->trans("This value can not be less than %min%", array('%min%' => $min)));
									$this->error = true;
								}
							} elseif ($data->getValue() < $result) {
								$data->setError(true);
								$data->addErrorMessage($this->translator->trans("This value can not be less than %min%", array('%min%' => $result)));
								$this->error = true;
							}
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
						if (($istep == 0 || $data->getInputStepId() == $istep) && $data->getValue() != '') {
							if ($data->getType() == 'text' || $data->getType() == 'textarea') {
								if (strlen($data->getValue()) > $result) {
									$data->setError(true);
									$data->addErrorMessage($this->translator->trans("The length of this value can not be greater than %max%", array('%max%' => $result)));
									$this->error = true;
								}
							} elseif ($data->getType() == 'date') {
								$max = DateFunction::makeDate($result);
								$value = DateFunction::makeDate($data->getValue());
								if ($value > $max) {
									$data->setError(true);
									$data->addErrorMessage($this->translator->trans("This value can not be greater than %max%", array('%max%' => $max)));
									$this->error = true;
								}
							} elseif ($data->getValue() > $result) {
								$data->setError(true);
								$data->addErrorMessage($this->translator->trans("This value can not be greater than %max%", array('%max%' => $result)));
								$this->error = true;
							}
						}
					}
				} catch (\Exception $e) {
				}
			}
		}
	}

	/**
	 * Executes all the actions of a business rule of the step
	 *
	 * @access  protected
	 * @param   array $actions Actions of the business rule
	 * @param   int $istep The step number
	 * @return  void
	 *
	 */
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
							$this->simu->setError(true);
							$this->simu->addErrorMessage($this->replaceVariables($action->getValue()));
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
							$this->simu->setWarning(true);
							$this->simu->addWarningMessage($this->replaceVariables($action->getValue()));
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
							if ($fieldset->getDisposition() == 'grid') {
								$fieldrow = $fieldset->getFieldRowById($action->getFieldrow());
								$field = $fieldrow->getFieldByPosition($action->getField());
							} else {
								$field = $fieldset->getFieldByPosition($action->getField());
							}
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
							$field = $fieldset->getFieldByPosition($action->getPreNote());
							$prenote = $field->getPreNote();
							$prenote->setDisplayable($action->getName() == 'showObject');
							break;
						case 'postnote':
							$panel = $step->getPanelById($action->getpanel());
							$fieldset = $panel->getFieldSetById($action->getFieldset());
							$field = $fieldset->getFieldByPosition($action->getPostNote());
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
							if ($fieldset->getDisposition() == 'grid') {
								$fieldrow = $fieldset->getFieldRowById($action->getFieldrow());
								$field = $fieldrow->getFieldByPosition($action->getField());
							} else {
								$field = $fieldset->getFieldByPosition($action->getField());
							}
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

	/**
	 * Evaluates the conditions of a business rule an executes the suitable actions
	 *
	 * @access  protected
	 * @param   \App\G6K\Model\BusinessRule $businessrule The rule to be processed
	 * @param   int $istep The step number
	 * @return  void
	 *
	 */
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

	/**
	 * Evaluates the conditions of all business rules an executes the suitable actions
	 *
	 * @access  protected
	 * @param   int $istep The step number
	 * @return  void
	 *
	 */
	protected function processRules($istep) 
	{
		$businessrules = $this->simu->getBusinessRules();
		foreach ($businessrules as $businessrule) {
			$this->processRule($businessrule, $istep) ;
		}
	}

	/**
	 * Processes all data for the step
	 *
	 * @access  protected
	 * @param   int $istep The step number
	 * @return  void
	 *
	 */
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
										$index = $d->getUnparsedIndex();
										if ($index != "") {
											$index = preg_replace("/^'/", "", $index);
											$index = preg_replace("/'$/", "", $index);
											$index = $this->replaceVariables($index);
											$datasource = $this->getDatasource($source);
											switch ($source->getReturnType()) {
												case 'json':
													$value = ResultFilter::filter("json", $result, $index);
													break;
												case 'html':
													$value = ResultFilter::filter("html", $result, $index, $datasource->getNamespaces());
													break;
												case 'xml':
													$value = ResultFilter::filter("xml", $result, $index, $datasource->getNamespaces());
													break;
												case 'csv':
													$value = ResultFilter::filter("csv", $result, $index, array(), $source->getSeparator(), $source->getDelimiter());
													break;
												default:
													$value = isset($result[$index]) ? $result[$index] : $result[strtolower($index)];
											}
											if (is_array($value)) {
												$keys = array_keys($value);
												$value = count($keys) > 0 ? $value[$keys[0]] : "";
											}
										} else {
											$value = "";
										}
								}
							} else {
								$value = $result;
							}
							if ($d->getType() == "date" && preg_match("/^\d\d\d\d-\d{1,2}-\d{1,2}$/", $value)) {
								$value = DateFunction::parseDate("Y-m-d", $value)->format($this->simu->getDateFormat());
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
