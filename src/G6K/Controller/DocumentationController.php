<?php

/*
The MIT License (MIT)

Copyright (c) 2017-2018 Jacques Archimède

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

use App\G6K\Manager\ControllersTrait;

/**
 *
 *  The DocumentationController class is the controller that manages the display of documentation pages.
 *
 * @author Jacques Archimède
 *
 */
class DocumentationController extends BaseAdminController {

	use ControllersTrait;

	/**
	 * Entry point for the route path /admin/doc/{document}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $document (default: null) The document name
	 * @return  \Symfony\Component\HttpFoundation\Response The rendered document
	 *
	 */
	public function index(Request $request, $document = null)
	{
		$this->initialize();
		return $this->runIndex($request, $document);
	}

	/**
	 * Processes the index action
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $document (default: null) The document name
	 * @return  \Symfony\Component\HttpFoundation\Response The rendered document
	 *
	 */
	protected function runIndex(Request $request, $document) {
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;

		if (! $this->authorizationChecker->isGranted('IS_AUTHENTICATED_FULLY')) {
			throw $this->createAccessDeniedException ($this->translator->trans("Access Denied!"));
		}

		$hiddens = array();
		$hiddens['script'] = $script;
		$ua = new \Detection\MobileDetect();
		try {
			return $this->render(
				'admin/pages/documentation.html.twig',
				array(
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'documentation',
					'document' => $document,
					'hiddens' => $hiddens
				)
		);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->translator->trans("This template does not exist"));
		}
	}
}

?>
