<?php

/*
The MIT License (MIT)

Copyright (c) 2017-2020 Jacques Archimède

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

use App\G6K\Model\DatasetChild;
use App\G6K\Model\DataGroup;
use App\G6K\Model\Data;
use App\G6K\Model\FieldSet;
use App\G6K\Model\FieldRow;
use App\G6K\Model\Field;
use App\G6K\Model\Step;

use App\G6K\Manager\Api\HTMLMarkup;
use App\G6K\Manager\Api\Bootstrapifier;

use App\G6K\Manager\ControllersTrait;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

/**
 *
 * This class deals with the API function of the simulation engine.
 *
 * For a simulator to accept an API request, the following parameters must be defined in the "config/packages/g6k.yaml" file:
 * <pre>
 *    api:
 *         &lt;simulator name&gt;:
 *          step: &lt;step number&gt;
 *          action: &lt;action button name&gt;
 * </pre>
 *
 * the API conforms to the JSON API
 *
 * @see    http://jsonapi.org/
 * @author Jacques Archimède
 *
 */
class APIController extends BaseController {

	use ControllersTrait;

	/**
	 * @var array      $datas API response datas
	 *
	 * @access  private
	 *
	 */
	private $datas = array();

	/**
	 * @var array      $metas API response metas
	 *
	 * @access  private
	 *
	 */
	private $metas = array();

	/**
	 * @var array      $errors API response errors, if any
	 *
	 * @access  private
	 *
	 */
	private $errors = array();

	/**
	 * The entry point of the API request step by step
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response|\App\G6K\Model\Step The simulation step object or the API response object in JSON format
	 *
	 */
	public function calcul(Request $request, $simu)
	{
		return $this->runCalcul($request, $simu);
	}

	/**
	 * The entry point of the API request all steps
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @param   string $target The target file ('json', 'markup' or 'js'), default 'json'
	 * @return  \Symfony\Component\HttpFoundation\Response The API response object
	 *
	 */
	public function api(Request $request, $simu, $target)
	{
		return $this->runApi($request, $simu, $target);
	}

	/**
	 * The entry point of the API request in test mode
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response|\App\G6K\Model\Step The simulation step object or the API response object in JSON format
	 *
	 */
	public function tryIt(Request $request, $simu)
	{
		return $this->runCalcul($request, $simu, true);
	}

	/**
	 * Run the simulation engine
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @param   bool $test (default: false) if true, we are in test mode
	 * @return  \Symfony\Component\HttpFoundation\Response|\App\G6K\Model\Step The simulation step object or the API response object in JSON format
	 *
	 */
	protected function runCalcul(Request $request, $simu, $test = false)
	{
		$this->initialize();
		try {
			$api = $this->getParameter('api');
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		if (! is_array($api) || !isset($api[$simu])) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		$form = $request->query->all();
		$form['step'] = $api[$simu]['step'];
		$form[$api[$simu]['action']] = 1;
		try {
			$step = $this->runStep($request, $form, $simu, $view, $test);
		} catch (\Exception $e) {
		}
		if (!is_null($step) && ! $step instanceof Step) {
			return $step;
		}
		return $this->apiStepOutput($request, $form, $step);
	}

	/**
	 * Run the Api server
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   string $simu The simulator name
	 * @param   string $target The target file ('json', 'markup' or 'js'), default 'json'
	 * @return  \Symfony\Component\HttpFoundation\Response|\App\G6K\Model\Step The simulation step object or the API response object in JSON format
	 *
	 */
	protected function runApi(Request $request, $simu, $target)
	{
		$this->initialize();
		try {
			$api = $this->getParameter('api');
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		if (! is_array($api) || !isset($api[$simu])) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		$simufile = $this->projectDir . "/var/data/simulators/api/" . $simu;
		if (!file_exists($simufile . ".json") || !file_exists($simufile . ".js")) {
			throw $this->createNotFoundException($this->translator->trans("API for this simulator is not implemented"));
		}
		$form = $request->query->all();
		return $this->apiOutput($request, $simu, $form, $target);
	}

	/**
	 * Composes the API response
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The user request
	 * @param   array $form array of request parameters
	 * @param   \App\G6K\Model\Step $step The simulation step object
	 * @return  \Symfony\Component\HttpFoundation\Response The API response object in JSON format
	 *
	 */
	protected function apiStepOutput(Request $request, $form, Step $step)
	{
		$fields = array_fill_keys(preg_split('/\s*,\s*/', $request->query->get('fields', '')), 1);
		foreach ($fields as $field => $val) {
			if ($field != '') {
				$data = $this->simu->getDataByName($field);
				if (is_null($data)) {
					$this->addParameterError(
						$field,
						$this->translator->trans("Invalid fields parameter"), 
						$this->translator->trans("This field doesn't exists")
					);
				} else {
					$this->datas[$data->getName()] = $data->getValue();
					$this->metas[$data->getName()] = $data->getLabel();
				}
			}
		}
		$actionButton = "";
		if (! isset($form['step'])) {
			$this->addParameterError(
				'step',
				$this->translator->trans("Invalid step parameter"), 
				$this->translator->trans("The step parameter is required")
			);
		} else {
			$cstep = $this->simu->getStepById($form['step']);
			if (! is_null($cstep)) {
				foreach ($cstep->getActions() as $action) {
					$name = $action->getName();
					if (isset($form[$name]) && $action->getWhat() == 'submit') {
						$actionButton = $name;
						break;
					}
				}
				if ($actionButton == "") {
					$this->addEntityError(
						"/data/" . $this->simu->getName(),
						$this->translator->trans("Missing action parameter"), 
						$this->translator->trans("The action parameter is required")
					);
				}
			}
		}
		foreach ($form as $param => $val) {
			if ($param != 'fields' && $param != 'step' && $param != $actionButton) {
				$data = $this->simu->getDataByName($param);
				if (is_null($data)) {
					$this->addParameterError(
						$param,
						$this->translator->trans("Invalid parameter"), 
						$this->translator->trans("This parameter doesn't exists")
					);
				}
			}
		}
		if ($this->simu->isError()) {
			$this->addEntityError(
				"/data/" . $this->simu->getName(),
				$this->translator->trans("Global error"), 
				implode("\n", $this->simu->getErrorMessages())
			);
		}
		if (is_null($step)) {
			$this->addParameterError(
				'step',
				$this->translator->trans("Invalid step"), 
				$this->translator->trans("This step doesn't exists")
			);
		} else {
			foreach ($step->getPanels() as $panel) {
				if ($panel->isDisplayable()) {
					foreach ($panel->getFieldSets() as $block) {
						if ($block instanceof FieldSet) {
							$fieldset = $block;
							if ($fieldset->isDisplayable()) {
								foreach ($fieldset->getFields() as $child) {
									if ($child instanceof Field) {
										$this->processApiField($form, $child);
									} elseif ($child instanceof FieldRow) {
										$fieldrow = $child;
										foreach ($fieldrow->getFields() as $field) {
											$this->processApiField($form, $field);
										}
									}
								}
							}
						}
					}
				}
			}
		}
		$id = urlencode(base64_encode( gzcompress($request->getQueryString())));
		// steps to get the query string from the id :
		// 1. urldecode the id
		// 2. base64_decode the result
		// 3. gzuncompress the result
		// 4. urldecode the result
		$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo() . '?' . $request->getQueryString();
		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		$content = [
			'links' => [
				'self' => $self
			]
		];
		if ($this->error) {
			$content['errors'] = $this->errors;
			$response->setStatusCode(Response::HTTP_BAD_REQUEST);
		}
		$content['data'] = [
			'type' => $this->simu->getName(),
			'id' => $id,
			'attributes' => $this->datas,
			'meta' => $this->metas
		];
		$response->setContent(json_encode($content));
		return $response;
	}

	protected function apiOutput(Request $request, $simulator, $form, string $target)
	{
		$response = new Response();
		$apiDir = $this->projectDir . "/var/data/simulators/api";
		switch ($target) {
			case 'html':
				$locale = $form['locale'] ?? '';
				if ($locale !== '') {
					$this->translator->setLocale($locale);
				}
				$this->checkApiParameters($form);
				if ($this->error) {
					break;
				}
				$markup = $form['markup'] ?? 'page';
				$bootstrap = $form['bootstrap'] ?? '';
				$primaryColor = $form['primaryColor'] ?? '#0b6ba8';
				$secondaryColor = $form['secondaryColor'] ?? '#ececec';
				$breadcrumbColor = $form['breadcrumbColor'] ?? $form['primaryColor'] ?? '#0b6ba8';
				$tabColor = $form['tabColor'] ?? $form['primaryColor'] ?? '#0b6ba8';
				$globalErrorColor = $form['globalErrorColor'] ?? 'red';
				$globalWarningColor = $form['globalWarningColor'] ?? '#8a6d3b';
				$fieldErrorColor = $form['fieldErrorColor'] ?? $form['globalErrorColor'] ?? 'red';
				$fieldWarningColor = $form['fieldWarningColor'] ?? $form['globalWarningColor'] ?? '#8a6d3b';
				$htmlMarkup = new HTMLMarkup($this->translator, $this->projectDir);
				$htmlMarkup->setSimulator($simulator);
				$htmlMarkup->run();
				$document = $htmlMarkup->get();

				if ($bootstrap != '') {
					$bootstrapifier = new Bootstrapifier([
						'markup' => $markup,
						'version' => $bootstrap
					]);
					$bootstrapifier->bootstrapify($document);
				}
				$container = $document->find('article.simulator-container')[0];
				$mainContainer = $markup == 'fragment' ? $container : $document->body();
				$mainContainer->append('<style>', implode("\n", ['', 
					'.simulator-container {',
					'	--primary-color: ' . $primaryColor . ';',
					'}',
					'.simulator-container {',
					'	--secondary-color: ' . $secondaryColor . ';',
					'}',
					'.simulator-container .simulator-breadcrumb {',
					'	--color: ' . $breadcrumbColor . ';',
					'}',
					'.simulator-container .global-alert.has-error {',
					'	--color: ' . $globalErrorColor . ';',
					'}',
					'.simulator-container .global-alert.has-warning {',
					'	--color: ' . $globalWarningColor . ';',
					'}',
					'.simulator-container .field-alert.has-error {',
					'	--color: ' . $fieldErrorColor . ';',
					'}',
					'.simulator-container .field-alert.has-warning {',
					'	--color: ' . $fieldWarningColor . ';',
					'}',
					'.simulator-container .step-panels-list {',
					'	--color: ' . $tabColor . ';',
					'}',
					'    '
				]));
				$mainContainer->append('<script>', [
					'type' => "text/javascript",
					'src' => $this->generateUrl(
						'eureka_g6k_api_target',
						[
							'simu' => $simulator,
							'target' => 'js'
						],
						UrlGeneratorInterface::ABSOLUTE_URL
					)
				]); 
				if ($markup == 'fragment') {
					$html = $document->html($container);
				} else {
					$html = $document->html();
				}
				$response->headers->set('Content-Type', 'text/html');
				$response->setContent($html);
				break;
			case 'js':
				$jsfile = $apiDir . "/" . $simulator . ".min.js";
				$response->headers->set('Content-Type', 'application/javascript');
				$response->setContent(file_get_contents($jsfile));
				break;
			case 'json':
				$jsonfile = $apiDir . "/" . $simulator . ".json";
				$response->headers->set('Content-Type', 'application/json');
				$response->setContent(file_get_contents($jsonfile));
				break;
			default:
				$this->addEntityError(
					"/data/" . $simulator,
					$this->translator->trans("Invalid API request"), 
					$this->translator->trans(
						"Unrecognizable target '%target%'",
						[ '%target%' => $target ]
					)
				);
		}
		if ($this->error) {
			$id = urlencode(base64_encode( gzcompress($request->getQueryString())));
			$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo() . '?' . $request->getQueryString();
			$response->headers->set('Content-Type', 'application/json');
			$response->setStatusCode(Response::HTTP_BAD_REQUEST);
			$content = [
				'links' => [
					'self' => $self
				],
				'errors' => $this->errors,
				'data' => [
					'type' => $simulator,
					'id' => $id
				]
			];
			$response->setContent(json_encode($content));
		}
		return $response;
	}

	private function checkApiParameters($form) {
		$parameters = [
			'markup', 'locale', 'bootstrap',
			'primaryColor', 'secondaryColor',
			'breadcrumbColor', 'tabColor',
			'globalErrorColor', 'globalWarningColor',
			'fieldErrorColor', 'fieldWarningColor'
		];
		foreach($form as $param => $value) {
			if (! in_array($param, $parameters)) {
				$this->addParameterError(
					$param,
					$this->translator->trans("Invalid parameter"), 
					$this->translator->trans(
						"This parameter '%parameter%' doesn't exists",
						[ '%parameter%' => $param ]
					)
				);
			}
		}
	}

	/**
	 * Processes the API field
	 *
	 * @access  private
	 * @param   array $form array of request parameters
	 * @param   \App\G6K\Model\Field $field The field object
	 * @return  void
	 *
	 */
	private function processApiField($form, Field $field) {
		if ($field->isDisplayable()) {
			$id = $field->getData();
			$data = $this->simu->getDataById($id);
			if ($data instanceof DataGroup) {
				if ($data->isError()) {
					$this->addResponseError($form, $data);
				}
				foreach ($data->getDatas() as $gdata) {
					$this->processApiFieldData($form, $gdata);
				}
			} elseif ($data instanceof Data) {
				$this->processApiFieldData($form, $data);
			}
		}
	}

	/**
	 * Processes the API field data
	 *
	 * @access  private
	 * @param   array $form array of request parameters
	 * @param   \App\G6K\Model\Data $data The data object
	 * @return  void
	 *
	 */
	private function processApiFieldData($form, Data $data) {
		$this->datas[$data->getName()] = $data->getValue();
		$this->metas[$data->getName()] = $data->getLabel();
		if ($data->isError()) {
			$this->addResponseError($form, $data);
		}
	}

	/**
	 * Add response error
	 *
	 * @access  private
	 * @param   array $form array of request parameters
	 * @param   \App\G6K\Model\DatasetChild $data The data object
	 * @return  void
	 *
	 */
	private function addResponseError($form, DatasetChild $data) {
		$name = $data->getName();
		if (isset($form[$name])) {
			$this->addParameterError(
				$name,
				$this->translator->trans("Invalid parameter"), 
				implode("\n", $data->getErrorMessages())
			);
		} else {
			$this->addEntityError(
				"/data/attribute/" . $name,
				$this->translator->trans("Error on data"), 
				implode("\n", $data->getErrorMessages())
			);
		}
	}

	/**
	 * Composes a parameter error
	 *
	 * @access  private
	 * @param   string $parameter the parameter name
	 * @param   string $title Title of the error
	 * @param   string $detail Detail of the error
	 * @return  void
	 *
	 */
	private function addParameterError($parameter, $title, $detail) {
		$this->errors[] = array(
			'status' => "" . Response::HTTP_BAD_REQUEST,
			'title' => $title,
			'detail' => $detail,
			'source' => array(
				'parameter' => $parameter
			)
		);
		$this->error = true;
	}

	/**
	 * Composes an entity error
	 *
	 * @access  private
	 * @param   string $entity the entity name
	 * @param   string $title Title of the error
	 * @param   string $detail Detail of the error
	 * @return  void
	 *
	 */
	private function addEntityError($entity, $title, $detail) {
		$this->errors[] = array(
			'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
			'title' => $title,
			'detail' => $detail,
			'source' => array(
				'pointer' => $entity
			)
		);
		$this->error = true;
	}

}

?>
