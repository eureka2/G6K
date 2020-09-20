<?php declare(strict_types=1);

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
use App\Security\Util\AccessControlInterface;

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
	 * @param   \App\Security\Util\AccessControlInterface $accessControl
	 * @return  \Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	public function index(Request $request, AccessControlInterface $accessControl)
	{
		$this->initialize();
		return $this->runIndex($request, $accessControl);
	}

	/**
	 * Dispatches the index action to the appropriate processing.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   \App\Security\Util\AccessControlInterface $accessControl
	 * @return  \Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	protected function runIndex(Request $request, AccessControlInterface $accessControl)
	{
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		$simus = array_filter(scandir($this->simulatorsDir), function ($simu) { return preg_match("/.xml$/", $simu); } );

		$simulators = array();
		foreach($simus as $simu) {
			$s = new \SimpleXMLElement($this->simulatorsDir."/".$simu, LIBXML_NOWARNING, true);
			if ($accessControl->isPathAuthorized("/" . $s['name'])) {
				$file = preg_replace("/.xml$/", "", $simu);
				$simulators[] = array(
					'file' => $file, 
					'name' => $s['name'], 
					'label' => $s['label'], 
					'description' => $s->Description
				);
			}
		}
		$ua = new \Detection\MobileDetect();
		try {
			return $this->render(
				'index/pages/index.html.twig',
				array(
					'script' => $script,
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'step' => null,
					'nav' => 'home',
					'simulators' => $simulators,
					'widgets' => array(),
					'functions' => array()
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->translator->trans("This template does not exist"));
		}
	}

}

?>
