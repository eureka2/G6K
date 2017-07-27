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
use EUREKA\G6KBundle\Entity\DataGroup;
use EUREKA\G6KBundle\Entity\Data;
use EUREKA\G6KBundle\Entity\FieldSet;
use EUREKA\G6KBundle\Entity\FieldRow;
use EUREKA\G6KBundle\Entity\Field;
use EUREKA\G6KBundle\Entity\Step;

use EUREKA\G6KBundle\Manager\ControllersHelper;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Cookie;

class APIController extends BaseController {

	public function calculAction(Request $request, $simu)
	{
		return $this->runCalcul($request, $simu);
	}

	public function tryItAction(Request $request, $simu)
	{
		return $this->runCalcul($request, $simu, true);
	}

	protected function runCalcul(Request $request, $simu, $test = false)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		try {
			$api = $this->container->getParameter('api');
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->get('translator')->trans("API for this simulator is not implemented"));
		}
		if (! is_array($api) || !isset($api[$simu])) {
			throw $this->createNotFoundException($this->get('translator')->trans("API for this simulator is not implemented"));
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
		return $this->apiOutput($request, $form, $step);
	}

	protected function apiOutput(Request $request, $form, $step)
	{
		$datas = array();
		$metas = array();
		$errors = array();
		$fields = array_fill_keys(preg_split('/\s*,\s*/', $request->query->get('fields', '')), 1);
		foreach ($fields as $field => $val) {
			if ($field != '') {
				$data = $this->simu->getDataByName($field);
				if (is_null($data)) {
					$this->error = true;
					$errors[] = array(
						'status' => "" . Response::HTTP_BAD_REQUEST,
						'title' => $this->get('translator')->trans("Invalid fields parameter"),
						'detail' => $this->get('translator')->trans("This field doesn't exists"),
						'source' => array(
							'parameter' => $field
						)
					);
				} else {
					$datas[$data->getName()] = $data->getValue();
					$metas[$data->getName()] = $data->getLabel();
				}
			}
		}
		$actionButton = "";
		if (! isset($form['step'])) {
			$this->error = true;
			$errors[] = array(
				'status' => "" . Response::HTTP_BAD_REQUEST,
				'title' => $this->get('translator')->trans("Invalid step parameter"),
				'detail' => $this->get('translator')->trans("The step parameter is required"),
				'source' => array(
					'parameter' => 'step'
				)
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
					$this->error = true;
					$errors[] = array(
							'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
							'title' => $this->get('translator')->trans("Missing action parameter"),
							'detail' => $this->get('translator')->trans("The action parameter is required"),
							'source' => array(
								'pointer' => "/data/" . $this->simu->getName()
							)
					);
				}
			}
		}
		foreach ($form as $param => $val) {
			if ($param != 'fields' && $param != 'step' && $param != $actionButton) {
				$data = $this->simu->getDataByName($param);
				if (is_null($data)) {
					$this->error = true;
					$errors[] = array(
						'status' => "" . Response::HTTP_BAD_REQUEST,
						'title' => $this->get('translator')->trans("Invalid parameter"),
						'detail' => $this->get('translator')->trans("This parameter doesn't exists"),
						'source' => array(
							'parameter' => $param
						)
					);
				}
			}
		}
		if ($this->simu->isError()) {
			$errors[] = array(
				'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
				'title' => $this->get('translator')->trans("Global error"),
				'detail' => implode("\n", $this->simu->getErrorMessages()),
				'source' => array(
					'pointer' => "/data/" . $this->simu->getName()
				)
			);
		}
		if (is_null($step)) {
			$this->error = true;
			$errors[] = array(
				'status' => "" . Response::HTTP_BAD_REQUEST,
				'title' => $this->get('translator')->trans("Invalid step"),
				'detail' => $this->get('translator')->trans("This step doesn't exists"),
				'source' => array(
					'parameter' => 'step'
				)
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
										$field = $child;
										if ($field->isDisplayable()) {
											$id = $field->getData();
											$data = $this->simu->getDataById($id);
											if ($data instanceof DataGroup) {
												if ($data->isError()) {
													$errors[] = $this->makeResponseError($form, $data);
												}
												foreach ($data->getDatas() as $gdata) {
													$datas[$gdata->getName()] = $gdata->getValue();
													$metas[$gdata->getName()] = $gdata->getLabel();
													if ($gdata->isError()) {
														$errors[] = $this->makeResponseError($form, $gdata);
													}
												}
											} elseif ($data instanceof Data) {
												$datas[$data->getName()] = $data->getValue();
												$metas[$data->getName()] = $data->getLabel();
												if ($data->isError()) {
													$errors[] = $this->makeResponseError($form, $data);;
												}
											}
										}
									} elseif ($child instanceof FieldRow) {
										$fieldrow = $child;
										foreach ($fieldrow->getFields() as $field) {
											if ($field->isDisplayable()) {
												$id = $field->getData();
												$data = $this->simu->getDataById($id);
												if ($data instanceof DataGroup) {
													if ($data->isError()) {
														$errors[] = $this->makeResponseError($form, $data);
													}
													foreach ($data->getDatas() as $gdata) {
														$datas[$gdata->getName()] = $gdata->getValue();
														$metas[$gdata->getName()] = $gdata->getLabel();
														if ($gdata->isError()) {
															$errors[] = $this->makeResponseError($form, $gdata);
														}
													}
												} elseif ($data instanceof Data) {
													$datas[$data->getName()] = $data->getValue();
													$metas[$data->getName()] = $data->getLabel();
													if ($data->isError()) {
														$errors[] = $this->makeResponseError($form, $data);
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		// $id = array_shift( unpack('H*', $request->getQueryString()) );
		// $qs =  urldecode(pack('H*', $id)); // for unpack
		$id = urlencode(base64_encode( gzcompress($request->getQueryString())));
		$qs = urldecode(gzuncompress(base64_decode(urldecode($id))));
		$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo() . '?' . $request->getQueryString();
		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		if ($this->error) {
			$response->setContent(
				json_encode(array(
						'links' => array(
							'self' => $self,
						),
						'errors' => $errors,
						'data' => array(
							'type' => $this->simu->getName(),
							'id' => $id,
							'attributes' => $datas,
							'meta' => $metas
						)
					)
				)
			);
			$response->setStatusCode(Response::HTTP_BAD_REQUEST);
		} else {
			$response->setContent(
				json_encode(array(
						'links' => array(
							'self' => $self,
						),
						'data' => array(
							'type' => $this->simu->getName(),
							'id' => $id,
							'attributes' => $datas,
							'meta' => $metas
						)
					)
				)
			);
		}
		return $response;
	}

	protected function makeResponseError($form, $data) {
		$name = $data->getName();
		if (isset($form[$name])) {
			return array(
				'status' => "" . Response::HTTP_BAD_REQUEST,
				'title' => $this->get('translator')->trans("Invalid parameter"),
				'detail' => implode("\n", $data->getErrorMessages()),
				'source' => array(
					'parameter' => $name
				)
			);
		} else {
			return array(
				'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
				'title' => $this->get('translator')->trans("Error on data"),
				'detail' => implode("\n", $data->getErrorMessages()),
				'source' => array(
					'pointer' => "/data/attribute/" . $name
				)
			);
		}
	}
}

?>
