<?php

namespace EUREKA\G6KBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use EUREKA\G6KBundle\Entity\Simulator;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

use EUREKA\G6KBundle\Entity\Database;

use Silex\Application;
use Binfo\Silex\MobileDetectServiceProvider;

class SimulatorsAdminController extends BaseAdminController {
	
	private $log = array();
	private $datasources = array();

	public function indexAction(Request $request, $simulator = null)
	{
		$form = $request->request->all();
		$no_js = $request->query->get('no-js') || 0;
		$script = $no_js == 1 ? 0 : 1;
		
		$simu_dir = $this->get('kernel')-> getBundle('EUREKAG6KBundle', true)->getPath()."/Resources/data/simulators";
		$simus = array_filter(scandir($simu_dir), function ($simu) { return preg_match("/.xml$/", $simu); } );
		
		
		$simulators = array();
		$currentSim = null;
		foreach($simus as $simu) {
			$s = new \SimpleXMLElement($simu_dir."/".$simu, LIBXML_NOWARNING, true);
			$file = preg_replace("/.xml$/", "", $simu);
			$simulators[] = array(
				'file' => $file, 
				'name' => $s['name'], 
				'label' => $s['label'], 
				'description' => $s->Description
			);
			if ($simulator !== null && $file == $simulator) {
				$currentSim = new Simulator($this);
				try {
					$currentSim->load($simu_dir."/".$simu);
				} catch (\Exception $e) {
					$currentSim = null;
				}
			}
		}
		
		$hiddens = array();		
		$hiddens['script'] = $script;
		$silex = new Application();
		$silex->register(new MobileDetectServiceProvider());
		try {
			return $this->render(
				'EUREKAG6KBundle:admin/pages:simulators.html.twig',
				array(
					'ua' => $silex["mobile_detect"],
					'path' => $request->getScheme().'://'.$request->getHttpHost(),
					'nav' => 'simulators',
					'simulators' => $simulators,
					'simulator' => $currentSim,
					'hiddens' => $hiddens
				)
			);
		} catch (\Exception $e) {
			echo $e->getMessage();
			throw $this->createNotFoundException($this->get('translator')->trans("This template does not exist"));
		}
	}
	
}
