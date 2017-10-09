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

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

/**
 *
 * The actions of the DefaultController class are used to run the simulation engine for a particular simulator.
 *
 * @author Jacques Archimède
 *
 */
class DefaultController extends BaseController {

	/**
	 * Entry point for the route paths begining by /{simu} excepted /admin
	 *
	 * These route paths are :
	 *
	 * - /{simu}
	 * - /{simu}/{view}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @param   string $view (default: null) The view name
	 * @return  \Symfony\Component\HttpFoundation\Response|false
	 *
	 */
	public function calculAction(Request $request, $simu, $view = null)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runCalcul($request, $simu, $view);
	}

	/**
	 * Entry point for the route path : /{simu}/{view}/tryIt
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @param   string $view (default: null) The view name
	 * @return  \Symfony\Component\HttpFoundation\Response|false
	 *
	 */
	public function tryItAction(Request $request, $simu, $view = null)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runCalcul($request, $simu, $view, true);
	}

	/**
	 * Entry point for the route path : /{simu}/Default/fields
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	public function fieldsAction(Request $request, $simu)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runFields($request, $simu);
	}

	/**
	 * Entry point for the route path : /{simu}/tryIt/Default/fields
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	public function fieldsTryItAction(Request $request, $simu)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runFields($request, $simu, true);
	}

	/**
	 * Entry point for the route path : /{simu}/Default/source
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	public function sourceAction(Request $request, $simu)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runSource($request, $simu);
	}

	/**
	 * Entry point for the route path : /{simu}/tryIt/Default/source
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @return  \Symfony\Component\HttpFoundation\Response
	 *
	 */
	public function sourceTryItAction(Request $request, $simu)
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runSource($request, $simu, true);
	}

	/**
	 * function runCalcul
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $simu The simulator name
	 * @param   string $view The view name
	 * @param   bool $test (default: false) true if it is a test from the administration module, false otherwise 
	 * @return  \Symfony\Component\HttpFoundation\Response|false
	 *
	 */
	protected function runCalcul(Request $request, $simu, $view, $test = false)
	{
		$form = $request->request->all();
		$step = $this->runStep($request, $form, $simu, $view, $test);
		if (! $step instanceof Step) {
			return $step;
		}
		
		$datas = array();
		foreach ($this->simu->getDatas() as $data) {
			if ($data instanceof DataGroup) {
				foreach ($data->getDatas() as $gdata) {
					$datas[$gdata->getName()] = $gdata->getValue();
					if ($this->simu->hasMemo() && $gdata->isMemorize()) {
						$this->memo[$gdata->getName()] = $gdata->getValue();
					}
				}
			} elseif ($data instanceof Data) {
				$datas[$data->getName()] = $data->getValue();
				if ($this->simu->hasMemo() && $data->isMemorize()) {
					$this->memo[$data->getName()] = $data->getValue();
				}
			}
		}
		if ( ! $this->error && ($step->getOutput() == 'inlinePDF' || $step->getOutput() == 'downloadablePDF')) {
			return $this->pdfOutput($request, $step, $datas, $view);
		}
		return $this->htmlOutput($request, $step, $datas, $view);
	}

	/**
	 * function htmlOutput
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \EUREKA\G6KBundle\Entity\Step &$step <parameter description>
	 * @param   array &$datas <parameter description>
	 * @param   string $view The view name
	 * @return \Symfony\Component\HttpFoundation\Response
	 *
	 */
	protected function htmlOutput(Request $request, &$step, &$datas, $view)
	{
 		$hiddens = array();
		$hiddens['step'] = $step->getId();
		$hiddens['sequence'] = implode('|', $this->sequence);
		$hiddens['script'] = $this->script;
		$hiddens['view'] = $view;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		$availWidgets = $this->container->getParameter('widgets');
		$widgets = array();
		foreach ($this->simuWidgets as $widget) {
			if (isset($availWidgets[$widget]) && ! isset($widgets[$widget])) {
				$this->widgetDeps($widget, $widgets, $availWidgets);
				$widgets[$widget] = $availWidgets[$widget];
			}
		}
		try {
			$response =  $this->render(
				'EUREKAG6KBundle:'.$view.'/'.$step->getTemplate(),
				array(
					'view' => $view,
					'script' => $this->script,
					'ua' => $silex["mobile_detect"],
					'path' => $this->path,
					'log' => $this->log,
					'step' => $step,
					'data' => $datas,
					'hiddens' => $hiddens,
					'widgets' => $widgets
				)
			);
			foreach($this->memo as $name => $value) {
				$response->headers->setCookie(new Cookie($name, $value, time() + (86400 * 365), $request->getBasePath(), null, false, false));
			}
			return $response;
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	/**
	 * function pdfOutput
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \EUREKA\G6KBundle\Entity\Step $step <parameter description>
	 * @param   array $datas <parameter description>
	 * @param   string $view (default: "Default") The view name
	 * @return  bool Always false
	 *
	 */
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

}

?>
