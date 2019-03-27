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

use App\G6K\Manager\ControllersTrait;

use Symfony\Component\HttpFoundation\Request;

/**
 *
 * The IndexController class is the controller that give of online simulators.
 *
 * @author Jacques Archimède
 *
 */
class IndexController extends BaseController {

	use ControllersTrait;

	/**
	 * Entry point for the route path /
	 * 
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	public function indexAction(Request $request)
	{
		$this->initialize();
		return $this->runIndex($request);
	}

	/**
	 * Dispatches the index action to the appropriate processing.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	protected function runIndex(Request $request)
	{
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		$simus = array_filter(scandir($this->simulatorsDir), function ($simu) { return preg_match("/.xml$/", $simu); } );

		$simulators = array();
		foreach($simus as $simu) {
			$s = new \SimpleXMLElement($this->simulatorsDir."/".$simu, LIBXML_NOWARNING, true);
			$file = preg_replace("/.xml$/", "", $simu);
			$simulators[] = array(
				'file' => $file, 
				'name' => $s['name'], 
				'label' => $s['label'], 
				'description' => $s->Description
			);
		}
		$ua = new \Detection\MobileDetect();
		$widgets = $this->getWidgets();
		$functions = $this->getFunctions();
		try {
			return $this->render(
				'base/pages/index.html.twig',
				array(
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'simulators' => $simulators,
					'simulator' => null,
					'dataset' => array(),
					'steps' => array(),
					'actions' => array(),
					'rules' => array(),
					'datasources' => array(),
					'script' => $script,
					'views' => array(),
					'view' => null,
					'widgets' => $widgets,
					'functions' => $functions
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

}

?>
