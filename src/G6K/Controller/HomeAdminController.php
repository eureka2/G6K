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

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Finder\Finder;

use App\G6K\Manager\ControllersTrait;

/**
 *
 * The HomeAdminController class is the controller that display the administration interface homepage.
 *
 * @author Jacques Archimède
 *
 */
class HomeAdminController extends BaseAdminController {

	use ControllersTrait;

	/**
	 * @var \SimpleXMLElement $datasources content of Datasources.xml
	 *
	 * @access  private
	 *
	 */
	private $datasources = null;

	/**
	 * Entry point of the root path /admin
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response The administration interface homepage in a Response object
	 *
	 */
	public function index(Request $request)
	{
		$this->initialize();
		return $this->runIndex($request);
	}

	/**
	 * Prepare the administration interface homepage and renders it.
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response The administration interface homepage in a Response object
	 *
	 */
	protected function runIndex(Request $request)
	{
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		try {
			$this->datasources = new \SimpleXMLElement($this->databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
			$datasourcesCount = $this->datasources->DataSource->count();
		} catch (\Exception $e) {
			$datasourcesCount = 0;
		}

		$users = $this->userManager->findUsers();

		$finder = new Finder();
		$finder->depth('== 0')->files()->name('*.xml')->in($this->simulatorsDir);
		$simulatorsCount = $finder->count();

		$finder = new Finder();
		$finder->depth('== 0')->ignoreVCS(true)->exclude(array('admin', 'base', 'bundles', 'Theme'))->directories()->in($this->viewsDir);
		$viewsCount = $finder->count();

 		$hiddens = array();
		$hiddens['script'] = $script;
		$ua = new \Detection\MobileDetect();
		try {
			return $this->render(
				'admin/pages/index.html.twig',
				array(
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'home',
					'datasourcesCount' => $datasourcesCount,
					'usersCount' => count($users),
					'simulatorsCount' => $simulatorsCount,
					'viewsCount' => $viewsCount,
					'hiddens' => $hiddens,
					'script' => $script,
					'simulator' => null,
					'view' => null
				)
		);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->translator->trans("This template does not exist"));
		}
	}
}

?>
