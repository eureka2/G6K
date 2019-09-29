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

use App\G6K\Manager\ControllersTrait;

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

	use ControllersTrait;

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
	 * @param   string $env (default: 'prod') The environment to clear (prod, test)
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	public function clear(Request $request, $env = 'prod')
	{
		$this->initialize();
		return $this->runClear($request, $env);
	}

	/**
	 * Entry point for the route paths begining by /admin/cache/warmup
	 *
	 * These route paths are :
	 *
	 * - /admin/cache/warmup
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	public function warmup(Request $request)
	{
		$this->initialize();
		return $this->runWarmup($request);
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
		$translator = $this->translator;
		if (! $this->authorizationChecker->isGranted('ROLE_ADMIN')) {
			throw $this->createAccessDeniedException ($translator->trans("Access Denied!"));
		}
		$cache_dir = dirname($this->getKernel()->getCacheDir());
		$this->log[] = "<b>" . $translator->trans("cache directory : %cachedir%", array('%cachedir%' => $cache_dir)) . "</b>";
		if ($this->getEnvironment() == $env) {
			$this->log[] =  "<br/><br/><b>" . $translator->trans("clearing cache") . " :</b>";
			$ok = $this->runConsoleCommand(array(
				'command' => 'cache:clear',
				'--no-warmup' => true,
				'--env' => $env
			), $this->log);
			if ($ok) {
				$this->log[] =  "<br/><br/><b>" . $translator->trans("done !") . "</b>";
			} else {
				$this->log[] =  "<br/><br/><b>" . $translator->trans("not done !") . "</b>";
			}
		} else {
			if (is_dir($cache_dir)) {
				if (basename($cache_dir) == "cache") {
					$this->log[] =  "<br/><br/><b>" . $translator->trans("clearing cache") . " :</b>";
					$this->cc($cache_dir, $env);
					$this->log[] =  "<br/><br/><b>" . $translator->trans("done !") . "</b>";
				} else {
					$this->log[] = "<br/> " . $translator->trans("Error : %cachedir% is not a named cache", array('%cachedir%' => $cache_dir));
				}
			} else {
				$this->log[] = "<br/> " . $translator->trans("Error : %cachedir% is not a directory", array('%cachedir%' => $cache_dir));
			}
		}
		return $this->doRender($request);
	}

	/**
	 * Processes the warm up action
	 *
	 * @access  protected
	 * @param   \Symfony\Component\HttpFoundation\Request $request The request
	 * @return  \Symfony\Component\HttpFoundation\Response The response object
	 *
	 */
	protected function runWarmup(Request $request)
	{
		$translator = $this->translator;
		if (! $this->authorizationChecker->isGranted('ROLE_ADMIN')) {
			throw $this->createAccessDeniedException ($translator->trans("Access Denied!"));
		}
		$cache_dir = dirname($this->getKernel()->getCacheDir());
		$this->log[] = "<b>" . $translator->trans("cache directory : %cachedir%", array('%cachedir%' => $cache_dir)) . "</b>";
		$this->log[] =  "<br/><br/><b>" . $translator->trans("warming cache") . " :</b>";
		$ok = $this->runConsoleCommand(array(
			'command' => 'cache:warmup'
		), $this->log);
		if ($ok) {
			$this->log[] =  "<br/><br/><b>" . $translator->trans("done !") . "</b>";
		} else {
			$this->log[] =  "<br/><br/><b>" . $translator->trans("not done !") . "</b>";
		}
		return $this->doRender($request);
	}

	private function doRender(Request $request)
	{
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
 		$hiddens = array();
		$hiddens['script'] = $script;
		$ua = new \Detection\MobileDetect();
		try {
			return $this->render(
				'admin/pages/cache-clear.html.twig',
				array(
					'ua' => $ua,
					'browserengine' => $this->getBrowserEngine($request),
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'caches',
					'log' => $this->log,
					'script' => $script,
					'simulator' => null,
					'file' => null,
					'view' => 'admin',
					'hiddens' => $hiddens
				)
			);
		} catch (\Exception $e) {
			throw $e;
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
			$this->log[] =  "<br/><br/><b>" . $this->translator->trans("clearing %cache%", array('%cache%' => $name)) . " :</b>";
			$this->rrmdir($d, 0);
		}
	}
	
}

?>
