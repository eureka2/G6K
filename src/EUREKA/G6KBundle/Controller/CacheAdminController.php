<?php

namespace EUREKA\G6KBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class CacheAdminController extends BaseAdminController {
	
	private $log = array();

	public function clearAction(Request $request, $env = 'prod')
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		
		if (! $this->get('security.context')->isGranted('ROLE_ADMIN')) {
			throw $this->AccessDeniedException ($this->get('translator')->trans("Access Denied!"));
		}
		$cache_dir = dirname($this->get('kernel')->getCacheDir());
		$this->log[] = "<b>cache_dir : $cache_dir</b>";

		if (is_dir($cache_dir)) {
			if (basename($cache_dir) == "cache") {
				$this->log[] =  "<br/><br/><b>clearing cache :</b>";
				$this->cc($cache_dir, $env);
				$this->log[] =  "<br/><br/><b>done !</b>";
			} else {
				$this->log[] = "<br/> Error : cache_dir not named cache ?";
			}
		} else {
			$this->log[] = "<br/> Error : cache_dir is not a dir";
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


	private function cc($cache_dir, $name) {
		$d = $cache_dir . '/' . $name;
		if (is_dir($d)) {
			$this->log[] =  "<br/><br/><b>clearing " . $name . ' :</b>';
			$this->rrmdir($d, 0);
		}
	}
	
}
