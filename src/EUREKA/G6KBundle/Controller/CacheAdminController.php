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

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use EUREKA\G6KBundle\Manager\ControllersHelper;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

/**
 *
 * The UsersAdminController class is the controller that handles all actions of the symfony cache management interface.
 *
 * These actions are:
 *
 * - Display cache management interface
 * - cleaning the production environment cache
 * - cleaning the admin environment cache
 * - cleaning the development environment cache
 * - cleaning the test environment cache
 *
 * @author Jacques Archimède
 *
 */
class CacheAdminController extends BaseAdminController {

	/**
	 * @var array      $log Cache cleaning log
	 *
	 * @access  private
	 *
	 */
	private $log = array();

	/**
	 * Entry point for the route paths begining by /admin/cache/clear
	 *
	 * These route paths are :
	 *
	 * - /admin/cache/clear
	 * - /admin/cache/clear/{env}
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $env (default: 'prod') The environment to clear (prod, test, dev, admin)
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	public function clearAction(Request $request, $env = 'prod')
	{
		$this->helper = new ControllersHelper($this, $this->container);
		return $this->runClear($request, $env);
	}

	/**
	 * Processes the clear action
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @param   string $env (default: 'prod') The environment to clear (prod, test, dev, admin)
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	protected function runClear(Request $request, $env)
	{
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		
		if (! $this->get('security.context')->isGranted('ROLE_ADMIN')) {
			throw $this->createAccessDeniedException ($this->get('translator')->trans("Access Denied!"));
		}
		$cache_dir = dirname($this->get('kernel')->getCacheDir());
		$this->log[] = "<b>" . $this->get('translator')->trans("cache directory : %cachedir%", array('%cachedir%' => $cache_dir)) . "</b>";

		if (is_dir($cache_dir)) {
			if (basename($cache_dir) == "cache") {
				$this->log[] =  "<br/><br/><b>" . $this->get('translator')->trans("clearing cache") . " :</b>";
				$this->cc($cache_dir, $env);
				$this->log[] =  "<br/><br/><b>" . $this->get('translator')->trans("done !") . "</b>";
			} else {
				$this->log[] = "<br/> " . $this->get('translator')->trans("Error : %cachedir% is not a named cache", array('%cachedir%' => $cache_dir));
			}
		} else {
			$this->log[] = "<br/> " . $this->get('translator')->trans("Error : %cachedir% is not a directory", array('%cachedir%' => $cache_dir));
		}

 		$hiddens = array();
		$hiddens['script'] = $script;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:admin/pages:cache-clear.html.twig',
				array(
					'ua' => $silex["mobile_detect"],
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'caches',
					'log' => $this->log,
					'hiddens' => $hiddens
				)
		);
		} catch (\Exception $e) {
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}

	/**
	 * Recursively removes a directory and its subdirectories
	 *
	 * @access  private
	 * @param   string $dir Directory to remove
	 * @param   int $level Level of this directory
	 * @return  void
	 *
	 */
	private function rrmdir($dir, $level) {
		if (is_dir($dir)) {
			$objects = scandir($dir);
			foreach ($objects as $object) {
				if ($object != "." && $object != "..") {
					$o = $dir . "/" . $object;
					if (filetype($o) == "dir") {
						$this->rrmdir($dir."/".$object, $level+1);
					}
					else {
						$this->log[] =  "<br/>" . $o;
						unlink($o);
					}
				}
			}
	
			reset($objects);
			if ($level > 0) rmdir($dir);
		}
	}

	/**
	 * Realizes the cleaning of the cache
	 *
	 * @access  private
	 * @param   string $cache_dir The Symfony cache directory
	 * @param   string $name name of the environment (prod, admin, test or dev)
	 * @return  void
	 *
	 */
	private function cc($cache_dir, $name) {
		$d = $cache_dir . '/' . $name;
		if (is_dir($d)) {
			$this->log[] =  "<br/><br/><b>" . $this->get('translator')->trans("clearing %cache%", array('%cache%' => $name)) . " :</b>";
			$this->rrmdir($d, 0);
		}
	}
	
}

?>
