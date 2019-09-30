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

use App\G6K\Model\DataGroup;
use App\G6K\Model\Data;
use App\G6K\Model\Step;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\Yaml\Yaml;

use acroforms\AcroForm;
use acroforms\Utils\StringToolBox;

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
	public function calcul(Request $request, $simu, $view = null)
	{
		$this->initialize();
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
	public function tryIt(Request $request, $simu, $view = null)
	{
		$this->initialize();
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
	public function fields(Request $request, $simu)
	{
		$this->initialize();
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
	public function fieldsTryIt(Request $request, $simu)
	{
		$this->initialize();
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
	public function source(Request $request, $simu)
	{
		$this->initialize();
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
	public function sourceTryIt(Request $request, $simu)
	{
		$this->initialize();
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
		if ( ! $this->error && ($step->getOutput() == 'inlineFilledPDF' || $step->getOutput() == 'downloadableFilledPDF')) {
			return $this->filledPdfOutput($request, $step, $datas);
		}
		return $this->htmlOutput($request, $step, $datas, $view);
	}

	/**
	 * function htmlOutput
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \App\G6K\Model\Step &$step <parameter description>
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
		$ua = new \Detection\MobileDetect();
		$availWidgets = $this->getParameter('widgets');
		$widgets = array();
		foreach ($this->simuWidgets as $widget) {
			if (isset($availWidgets[$widget]) && ! isset($widgets[$widget])) {
				$this->widgetDeps($widget, $widgets, $availWidgets);
				$widgets[$widget] = $availWidgets[$widget];
			}
		}
		$availFunctions = $this->getParameter('functions');
		$functions = array();
		foreach ($this->simuFunctions as $function) {
			if (isset($availFunctions[$function]) && ! isset($functions[$function])) {
				$this->functionDeps($function, $functions, $availFunctions);
				$functions[$function] = $availFunctions[$function];
			}
		}
		if ($this->hasParameter('recaptcha')) {
			$hiddens['recaptcha'] = $this->getParameter('recaptcha')['site_key'];
		}
		try {
			$response =  $this->render(
				$view.'/'.str_replace(':', '/', $step->getTemplate()),
				array(
					'view' => $view,
					'script' => $this->script,
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $this->path,
					'log' => $this->log,
					'step' => $step,
					'data' => $datas,
					'hiddens' => $hiddens,
					'widgets' => $widgets,
					'functions' => $functions
				)
			);
			foreach($this->memo as $name => $value) {
				$response->headers->setCookie(new Cookie($name, $value, time() + (86400 * 365), $request->getBasePath(), null, false, false));
			}
			return $response;
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->translator->trans("This template does not exist"));
		}
	}

	/**
	 * function pdfOutput
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \App\G6K\Model\Step $step <parameter description>
	 * @param   array $datas <parameter description>
	 * @param   string $view (default: "Default") The view name
	 * @return  bool Always false
	 *
	 */
	protected function pdfOutput(Request $request, $step, $datas, $view = "Default")
	{
		$ua = new \Detection\MobileDetect();
		$page = $this->render(
			$view.'/'.str_replace(':', '/', $step->getTemplate()),
			array(
				'view' => $view,
				'ua' => $ua,
				'browserengine' => $this->getBrowserEngine($request),
				'path' => $request->getScheme().'://'.$request->getHttpHost(),
				'log' => $this->log,
				'step' => $step,
				'data' => $datas
			)
		);

		$mpdf = new \Mpdf\Mpdf();
		$mpdf->autoLangToFont  = true;
		$mpdf->PDFA = true;
		$mpdf->PDFAauto = true;
		$mpdf->ignore_invalid_utf8 = true;
		$mpdf->Bookmark($this->translator->trans("Beginning of the document")); 
		$mpdf->SetDisplayMode('fullwidth');
		if ($step->hasPdfFooter()) {
			$footer = '<table class="pdf-footer"><tr><td>';
			$footer .= $this->translator->trans("Simulation performed on %host% on %date%", array('%host%' => $request->getHttpHost(), '%date%' => '{DATE j-m-Y}'));
			$footer .= '</td><td>';
			$footer .= $this->translator->trans("Page %pageno% of %numberofpages%", array('%pageno%' => '{PAGENO}', '%numberofpages%' => '{nbpg}'));
			$footer .= '</td></tr></table>';
			$mpdf->SetHTMLFooter ( $footer, 'BLANK', true);
		}
		$mpdf->WriteHTML($page);

		$mpdf->Output($this->simu->getName().".pdf", $step->getOutput() == 'inlinePDF' ? 'I' : 'D'); // I = inline, D = download
		return false;
	}

	/**
	 * function filledPdfOutput
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \App\G6K\Model\Step $step <parameter description>
	 * @param   array $datas <parameter description>
	 * @return  bool Always false
	 *
	 */
	protected function filledPdfOutput(Request $request, $step, $datas)
	{
		$template = $step->getTemplate();
		$info = pathinfo($template, PATHINFO_FILENAME) . ".info";
		$pdf = new AcroForm(
			$this->pdfFormsDir.'/'.$template,
			[
				'pdftk' =>	$this->hasParameter('acroforms')
							? $this->getParameter('acroforms')['pdftk']
							: 'pdftk'
			]
		);
		$mapping = [];
		if (file_exists($this->pdfFormsDir.'/'.$info)) {
			$pdfinfo = Yaml::parseFile($this->pdfFormsDir.'/'.$info);
			$mapping = array_flip($pdfinfo['descriptors']['mapping']);
		}
		$formdata = [];
		foreach($datas as $dataname => $value) {
			$name = isset($mapping[$dataname]) ? StringToolBox::normalizeFieldName($mapping[$dataname]) : $dataname;
			$formdata[$name] = $value;
			if (!preg_match("/_\d+_$/", $name)) {
				$formdata[$name."_0_"] = $value;
				if (!preg_match("/^Page/", $name)) {
					$formdata["Page1_0__".$name."_0_"] = $value;
				}
			} elseif (!preg_match("/^Page/", $name)) {
				$formdata["Page1_0__".$name] = $value;
			}
		}
		$textFields = $pdf->getTextFields();
		$buttonFields = $pdf->getButtonFields();
		$fields = [
			'text' => array_filter($formdata, function ($name) use ($textFields) {
				return in_array($name, $textFields);
			}, ARRAY_FILTER_USE_KEY),
			'button' => array_filter($formdata, function ($name) use ($buttonFields) {
				return in_array($name, $buttonFields);
			}, ARRAY_FILTER_USE_KEY)
		];
		$pdf->load($fields);
		$pdf->merge(true); // true for flatten (need pdftk), false if not (this is the default)
		$destination = $step->getOutput() == 'inlineFilledPDF' ? 'I' : 'D';
		$pdf->output($destination, basename($step->getTemplate()));
		return false;
	}

}

?>
