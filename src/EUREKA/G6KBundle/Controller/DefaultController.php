<?php

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use EUREKA\G6KBundle\Entity\Simulator;
use EUREKA\G6KBundle\Entity\ExpressionParser;
use EUREKA\G6KBundle\Entity\Source;
use EUREKA\G6KBundle\Entity\Choice;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class DefaultController extends Controller {

	protected $simu;
	protected $parser;
	protected $error;
	protected $recursion = 0;
	protected $variables = array();
	protected $sources = null;
	protected $uricache = array();
	protected $log = array();

	public function calculAction(Request $request, $simu, $view = null)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$this->simu = new Simulator($this);
		$this->parser = new ExpressionParser();
		$this->uricache = array();
		if (! $view) {
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
		try {
			$this->simu->load(dirname(dirname(__FILE__)).'/Resources/data/simulators/'.$simu.'.xml');
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
		$istep = -1;
		$this->error = false;
		$sequence = array();
		$script = $no_js == 1 ? 0 : 1;
		$dates = array();
		
		$this->evaluateDefaults();
		$this->evaluateMinMax();
		foreach ($form as $name => $value) {
			if ($name == 'step') {
				$istep = (int)$value;
			} elseif ($name == 'sequence') {
				$sequence = explode('|', $value);;
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
					($istep < 0 || $script = 1);
		$this->simu->setDynamic($dynamic);
		$this->variables['script'] = $script;
		$this->variables['dynamic'] = $dynamic;
		
		$steps = array();
		foreach ($this->simu->getSteps() as $s) {
			$steps[] = array('id' => $s->getId(), 'name' => $s->getName(), 'label' => $s->getLabel());
			foreach ($s->getFieldSets() as $fieldset) {
				foreach ($fieldset->getFields() as $field) {
					if ($field->getUsage() == "input") {
						$id = $field->getData();
						$data = $this->simu->getDataById($id);
						$data->setInputStepId($s->getId());
					}
				}
			}
			$this->variables['step'.$s->getId().'.dynamic'] = $s->isDynamic() ? 1 : 0;
			$this->variables['step'.$s->getId().'.output'] = $s->getOutput();
		}
		foreach ($this->simu->getDatas() as $data) {
			if ($data->getInputStepId() < 0 && ($data->getContent() != "" || $data->getSource() != "")) {
				$data->setValue("");
			}			
		}
		$direction = 0;
		if ($istep >= 0) {
			$skipValidation = false;
			$step = $this->simu->getStepById($istep);
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
			foreach ($step->getFieldSets() as $fieldset) {
				foreach ($fieldset->getFields() as $field) {
					$this->checkField($field);
				}
				foreach ($fieldset->getFieldRows() as $fieldrow) {
					foreach ($fieldrow->getFields() as $field) {
						$this->checkField($field);
					}
				}
			}
			$this->processDatas($istep);
			if (! $this->error) {
				foreach ($step->getActions() as $action) {
					if (isset($form[$action->getName()])) {
						if ($action->getFor() == 'priorStep') {
							if (count($sequence) > 0 && (! $this->simu->isDynamic() ||  $istep != 0)) {
								$istep = array_pop($sequence);
								$direction = -1;
							}
						} elseif ($action->getFor() == 'nextStep') {
							if (! $this->simu->isDynamic() || $istep != 0) {
								array_push($sequence, $istep);
								$istep++;
								$direction = 1;
							}
						} elseif ($action->getFor() == 'jumpToStep') {
							$toStep = $action->getUri();
							$direction = ($toStep - $istep) / abs($toStep - $istep);
							array_push($sequence, $istep);
							$istep = $toStep;
						}
						break;
					}
				}
			}
		} else {
			$istep = $this->simu->isDynamic() ? 0 : 1;
		}
		$stepCount = count($steps);
		do {
			$step = $this->simu->getStepById($istep);
			$displayable = false;
			foreach ($step->getFieldSets() as $fieldset) {
				$condition = $fieldset->getCondition();
				if ($condition != "" && $istep > 0) {
					if ($this->evaluate($condition) == 'false') {
						$fieldset->setDisplayable(false);
					}
				}
				foreach ($fieldset->getFields() as $field) {
					$field->setDisplayable($fieldset->isDisplayable());
					$this->processField($field, $istep, $displayable); 
				}
				foreach ($fieldset->getFieldRows() as $fieldrow) {
					foreach ($fieldrow->getFields() as $field) {
						$field->setDisplayable($fieldset->isDisplayable());
						$this->processField($field, $istep, $displayable); 
					}
				}
				$fieldset->setLegend($this->replaceVariables($fieldset->getLegend()));
			}
			$footnotes = $step->getFootNotes();
			if ($footnotes !== null) {
				$disp = false;
				foreach ($footnotes->getFootNotes() as $footnote) {
					$condition = $footnote->getCondition();
					if ($condition != "" && $istep > 0) {
						if ($this->evaluate($condition) == 'false') {
							$footnote->setDisplayable(false);
						}
					}
					if ($footnote->isDisplayable()) {
						$footnote->setText($this->replaceVariables($footnote->getText()));
						$disp = true;
					}
				}
				$footnotes->setDisplayable($disp);
			}
			$istep += $direction;
		} while (!$displayable && $istep > 0 && $istep <= $stepCount);
		$step->setDescription($this->replaceVariables($step->getDescription()));
		
		$datas = array();
		foreach ($this->simu->getDatas() as $data) {
			foreach ($data->getChoices() as $choice) {
				$condition = $choice->getCondition();
				if ($condition != "") {
					if ($this->evaluate($condition) == 'false') {
						$choice->setSelected(false);
					}
				}
			}
			$datas[$data->getName()] = $data->getValue();
		}
		foreach ($this->simu->getSteps() as $s) {
			$condition = $s->getCondition();
			if ($condition != "") {
				if ($this->evaluate($condition) == 'false') {
					$s->setDisplayable(false);
				}
			}
		}			
		if ( ! $this->error && ($step->getOutput() == 'inlinePDF' || $step->getOutput() == 'downloadablePDF')) {
			return $this->pdfOutput($request, $step, $datas, $view);
		}
 		$hiddens = array();		
		$hiddens['step'] = $step->getId();
		$hiddens['sequence'] = implode('|', $sequence);
		$hiddens['script'] = $script;
		$hiddens['view'] = $view;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:'.$view.'/'.$step->getTemplate(),
				array(
					'view' => $view,
					'script' => $script,
					'ua' => $silex["mobile_detect"],
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'log' => $this->log,
					'step' => $step,
					'data' => $datas,
					'hiddens' => $hiddens
				)
		);
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}
	
	public function fieldsAction(Request $request, $simu)
	{
		$form = $request->request->all();
		$this->simu = new Simulator($this);
		$fields = $this->simu->toJSON(dirname(dirname(__FILE__)).'/Resources/data/simulators/'.$simu.'.xml', $form['stepId']);
		$response = new Response();
		$response->setContent($fields);
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}
	
	public function sourceAction(Request $request, $simu)
	{
		$form = $request->request->all();
		$this->simu = new Simulator($this);
		$this->simu->loadForSource(dirname(dirname(__FILE__)).'/Resources/data/simulators/'.$simu.'.xml');
		$source = $this->simu->getSourceById((int)$form['source']);
		$params = $source->getParameters();
		foreach ($params as $param) {
			$name = $param->getName();
			$value = $form[$name];
			$data = $this->simu->getDataById($param->getData());
			if ($data !== null) {
				$data->setValue($value);
			}
		}
		$result = $this->processSource($source);
		$response = new Response();
		$response->setContent(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE |  JSON_UNESCAPED_SLASHES | JSON_HEX_APOS | JSON_HEX_QUOT));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}
	
	protected function checkField($field) 
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
						$data->setErrorMessage($this->get('translator')->trans("The '%field%' field is required", array('%field%' => $field->getLabel())));
					} else {
						$data->setErrorMessage($this->get('translator')->trans("This field is required"));
					}
					$this->error = true;
				} elseif (! $data->check()) {
					$data->setError(true);
					switch ($data->getType()) {
						case 'date':
							$data->setErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'jj/mm/aaaa')));
							break;
						case 'number': 
							$data->setErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'chiffres seulement')));
							break;
						case 'integer': 
							$data->setErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'chiffres seulement')));
							break;
						case 'money': 
							$data->setErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'montant')));
							break;
						case 'percent':
							$data->setErrorMessage($this->get('translator')->trans("This value is not in the expected format (%format%)", array('%format%' => 'pourcentage')));
							break;
						default:
							$data->setErrorMessage($this->get('translator')->trans("This value is not in the expected format"));
					}
					$this->error = true;
					unset($this->variables[''.$data->getId()]);
					unset($this->variables[$data->getName()]);
				}
			}
		}
	}
	
	protected function processField($field, $istep, &$displayable) 
	{
		$id = $field->getData();
		$data = $this->simu->getDataById($id);
		$data->setUsed(false);
		$condition = $field->getCondition();
		if ($condition != "" && $istep > 0) {
			if ($this->evaluate($condition) == 'false') {
				$field->setDisplayable(false);
			}
		}
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
			}
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
								$id = $choiceSource->getIdColumn() != '' ? $row[$choiceSource->getIdColumn()] : ++$n;
								$choice = new Choice($data, $id, $row[$choiceSource->getValueColumn()], $row[$choiceSource->getLabelColumn()]);
								$data->addChoice($choice);
							}
						}
					}
				}
			}
			$field->setPreNote($this->replaceVariables($field->getPreNote()));
			$field->setPostNote($this->replaceVariables($field->getPostNote()));
		}
	}
	
	protected function evaluate($condition) 
	{
		$expr = $this->parser->parse($condition);
		$expr->postfix();
		$expr->setVariables($this->variables);
		return $expr->evaluate();
	}
	
	protected function evaluateDefaults() 
	{
		foreach ($this->simu->getDatas() as $data) {
			$default = $data->getUnparsedDefault();
			if ($default != "" && ! $data->isError()) {
				$value = $this->evaluate($default);
				if ($value !== false) {
					$data->setDefault($value);
					$data->setUnparsedDefault("");
				}
			}
		}
	}
	
	protected function evaluateMinMax() 
	{
		foreach ($this->simu->getDatas() as $data) {
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
	}

    protected function processDatas($istep) 
	{
		// if (++$this->recursion > 100) {
			// return;
		// }
		$this->sources = array();
		foreach ($this->simu->getDatas() as $data) {
			if (! $data->isError()) {
				$default = $data->getUnparsedDefault();
				if ($default != "") {
					$value = $this->evaluate($default);
					if ($value !== false) {
						$data->setDefault($value);
						$data->setUnparsedDefault("");
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
							$this->processDatas($istep);						}
					} catch (\Exception $e) {
						if ($istep == 0 || $data->getInputStepId() == $istep) {
							$data->setError(true);
							$data->setErrorMessage($e->getMessage());
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
							if (($istep == 0 || $data->getInputStepId() == $istep) && $data->getValue() < $result) {
								$data->setError(true);
								$data->setErrorMessage($this->get('translator')->trans("This value can not be less than %min%", array('%min%' => $result)));
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
							if (($istep == 0 || $data->getInputStepId() == $istep) && $data->getValue() > $result) {
								$data->setError(true);
								$data->setErrorMessage($this->get('translator')->trans("This value can not be greater than %max%", array('%max%' => $result)));
								$this->error = true;
							}
						}
					} catch (\Exception $e) {
					}
				}
				$constraint = $data->getConstraint();
				if ($constraint != "") {
					try {
						$result = $this->evaluate($constraint);
						if ($result !== false) {
							if ($result == 'false' && ($istep == 0 || $data->getInputStepId() == $istep)) {
								$data->setError(true);
								$data->setErrorMessage($data->getConstraintMessage());
								$this->error = true;
							}
						}
					} catch (\Exception $e) {
					}
				}
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
											$value = $result[$index];
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
							$d->setValue($value);
							$d->setSource("");
							$this->variables[''.$d->getId()] = $d->getValue();
							$this->variables[$d->getName()] = $d->getValue();
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
		if ($value == "") {
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

    protected function processSource(Source $source) 
	{
		$params = $source->getParameters();
		switch ($source->getType()) {
			case 'uri':
				$query = "";
				$path = "";
				foreach ($params as $param) {
					$value = $this->formatParamValue($param);
					if ($value === null) {
						return null;
					}
					if ($param->getType() == 'path') {
						$path .= "/".$value;
					} else {
						$query .= "&".$param->getName()."=".$value;
					}
				}
				$uri = $source->getUri();
				if ($path != "") {
					$uri .= $path;
				} 
				if ($query != "") {
					$uri .= "?".substr($query, 1);
				}
				if (isset($this->uricache[$uri])) {
					$result = $this->uricache[$uri];
				} else {
					$result = file_get_contents($uri);
					$this->uricache[$uri] = $result;
				}
				break;				
			case 'database':
				$args = array();
				$args[] = $source->getRequest();
				foreach ($params as $param) {
					$value = $this->formatParamValue($param);
					if ($value === null) {
						return null;
					}
					$args[] = $value;
				}
				$query = call_user_func_array('sprintf', $args);
				$database = $this->simu->getDatabaseById($source->getDatabase());
				$database->connect();
				$result = $database->query($query);
				break;				
		}
		switch ($source->getReturnType()) {
			case 'singleValue':
				return $result;
			case 'json':
				$json = json_decode($result, true);
				$returnPath = $source->getReturnPath();
				$keys = explode("/", $returnPath);
				foreach ($keys as $key) {
					if (ctype_digit($key)) {
						$key = (int)$key;
					}
					if (! isset($json[$key])) {
						break;
					}
					$json = $json[$key];
				}
				return $json;
			case 'assocArray':
				$returnPath = $source->getReturnPath();
				$keys = explode("/", $returnPath);
				foreach ($keys as $key) {
					if (ctype_digit($key)) {
						$key = (int)$key;
					}
					if (! isset($result[$key])) {
						break;
					}
					$result = $result[$key];
				}
				return $result;
			case 'xml':
				$xml = new SimpleXMLElement($result);
				return $xml->xpath($source->getReturnPath());
		}
		return null;
	}
	
    protected function pdfOutput(Request $request, $step, $datas, $view = "Default")
    {
 		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
        $page = $this->render(
			'EUREKAG6KBundle:'.$view.'/'.$step->getTemplate(),
			array(
				'view' => $view,
				'ua' => $silex["mobile_detect"],
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'log' => $this->log,
				'step' => $step,
				'data' => $datas
			)
		);
		
		$mpdfService = $this->get('tfox.mpdfport');
		$mpdf = $mpdfService->getMpdf();
		$mpdf->PDFA = true;
		$mpdf->PDFAauto = true;
		$mpdf->ignore_invalid_utf8 = true;
  
		$mpdf->SetDisplayMode('fullpage');
		$footer = '<table class="pdf-footer"><tr><td>';
		$footer .= $this->get('translator')->trans("Simulation performed on %host% on %date%", array('%host%' => $request->getHttpHost(), '%date%' => '{DATE j-m-Y}'));
		$footer .= '</td><td>';
		$footer .= $this->get('translator')->trans("Page %pageno% of %numberofpages%", array('%pageno%' => '{PAGENO}', '%numberofpages%' => '{nbpg}'));
		$footer .= '</td></tr></table>';
		$mpdf->SetHTMLFooter ( $footer, 'BLANK', true);
		$mpdf->WriteHTML($page);

		$mpdf->Output($this->simu->getName().".pdf", $step->getOutput() == 'inlinePDF' ? 'I' : 'D'); // I = inline, D = download
		return false;
	}
	
	private function replaceVariable($matches) {
		$id = (int)$matches[1];
		$data = $this->simu->getDataById($id);
		if ($data === null) {
			return $matches[0];
		}
		if ($matches[2] == 'L') { 
			return $data->getChoiceLabel();
		} else {
			$value = $data->getValue();	
			switch ($data->getType()) {
				case 'money': 
					$value = number_format ( (float)$value , 2 , "." , " "); 
				case 'percent':
				case 'number': 
					$value = str_replace('.', ',', $value);
					break;
			}
			return $value;
		}
	}
	
	private function replaceVariables($target) {
		$result = preg_replace_callback(
			"|#(\d+)(L?)|",
			array($this, 'replaceVariable'),
			$target
		);
		return $result;
	}
	
	private function parseDate($format, $dateStr) {
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

	public function isDevelopmentEnvironment() {
		return in_array($this->get('kernel')->getEnvironment(), array('test', 'dev'));
	}
	
}
