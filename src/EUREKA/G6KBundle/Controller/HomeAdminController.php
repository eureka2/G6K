<?php

namespace EUREKA\G6KBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class HomeAdminController extends BaseAdminController {
	
	private $log = array();
	private $datasources = array();

	public function indexAction(Request $request)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		
		$db_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/databases";
		$this->datasources = new \SimpleXMLElement($db_dir."/DataSources.xml", LIBXML_NOWARNING, true);
		
		$userManager = $this->get('fos_user.user_manager');
		$users = $userManager->findUsers();

		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$simus = array_filter(scandir($simu_dir), function ($simu) { return preg_match("/.xml$/", $simu); } );

 		$hiddens = array();		
		$hiddens['script'] = $script;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:admin/pages:index.html.twig',
				array(
					'ua' => $silex["mobile_detect"],
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'home',
					'datasourcesCount' => $this->datasources->DataSource->count(),
					'usersCount' => count($users),
					'simulatorsCount' => count($simus),
					'hiddens' => $hiddens
				)
		);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}
}
