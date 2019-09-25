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

namespace App\G6K\Services;

use App\G6K\Model\Simulator;

use Symfony\Component\Process\Process;
use Symfony\Component\Finder\Finder;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Lock\Factory;
use Symfony\Component\Lock\Store\SemaphoreStore;
use Symfony\Component\Lock\Store\FlockStore;

/**
 * This class implements a service that performs the deployment of files from a new simulator or modified simulator to all front-end servers described in the entry 'deployment of parameters.yml.
 *
 * @author Jacques Archimède
 * @author Yann Toqué
 */
class Deployer {

	/**
	 * @var \Symfony\Component\HttpKernel\KernelInterface	  $kernel The Symfony kernel interface
	 *
	 * @access  private
	 *
	 */
	private $kernel;

	/**
	 * @var \Symfony\Contracts\Translation\TranslatorInterface	  $translator The translator interface
	 *
	 * @access  private
	 *
	 */
	private $translator;

	/**
	 * @var \Symfony\Component\Lock\Lock	$lock  A lock to prevent multiple deployments at a time.
	 *
	 * @access  private
	 *
	 */
	private $lock;

	/**
	 * @var array  $deployed The already deployed datasources
	 *
	 * @access  private
	 *
	 */
	private $deployed = array();

	/**
	 * @var array  $output The output of the processes of this service
	 *
	 * @access  private
	 *
	 */
	private $output = array();

	/**
	 * @var array  $output The list of imported CSS file
	 *
	 * @access  private
	 *
	 */
	private $importedCSS = array();

	/**
	 * Constructor of class Deployer
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpKernel\KernelInterface $kernel The Symfony kernel interface
	 * @param   \Symfony\Contracts\Translation\TranslatorInterface $translator The translator interface
	 * @return  void
	 *
	 */
	public function __construct(KernelInterface $kernel, TranslatorInterface $translator) {
		$this->kernel = $kernel;
		$this->translator = $translator;
	}

	/**
	 * Realizes the deployment
	 *
	 * @access  private
	 * @param   string $localRootDir 
	 * @param   string $localFile 
	 * @param   string $remoteFile 
	 * @param   string $command
	 * @return  void
	 *
	 */
	private function doDeploy($localRootDir, $localFile, $remoteFile, $command){
		if (preg_match("/^rsync/", $command)) {
			$localRootDir = $this->unixify($localRootDir);
		}
		$cmd = str_replace(array('{local.rootdir}', '{local.file}', '{remote.file}', '{remote.dir}'), array($localRootDir, $localFile, $remoteFile, dirname($remoteFile)), $command);
		$process = new Process($cmd);
		$process->run();
		if (!$process->isSuccessful()) {
			$errorOutput = $process->getErrorOutput();
			if ($errorOutput != '') {
				$this->output[] = '<pre>' .$cmd . '</pre><span class="alert-danger">' . $this->translator->trans('Error returned by the command:') . ' ' . $errorOutput . '</span>';
			}
		} else {
			$this->output[] = '<pre>' . $cmd . '</pre><span class="alert-success">' . $this->translator->trans('Command completed successfully') . '</span>';
		}
		$this->output[] = '&nbsp;';
	}


	/**
	 * Transforms a Windows path in a Unix path for a 'rsync' command
	 *
	 * @access  private
	 * @param   string $rootDir The transformed path
	 * @return  string
	 *
	 */
	private function unixify($rootDir) {
		$os = php_uname('s');
		if (preg_match("/^win/i", $os)) {
			// replace drive letter followed by ':' (ex : C:) 
			// by slash following by the drive letter (ex : /C) 
			$rootDir = preg_replace("/^([a-z]):/i", "/$1", $rootDir);
			$rootDir = preg_replace("/\\\/", "/", $rootDir);
		}
		return $rootDir;
	}

	/**
	 * Loads the list of already deployed data sources
	 *
	 * @access  private
	 * @param   string $deployedFile The name of the file containing this list.
	 * @return  void
	 *
	 */
	private function loadDeployed($deployedFile) {
		$this->deployed = array();
		$fs = new Filesystem();
		if ($fs->exists($deployedFile)) {
			$contents = explode("\n", file_get_contents($deployedFile), 3);
			foreach($contents as $content) {
				$deployed = explode("\t", $content, 3);
				if (array_key_exists($deployed[0] , $this->deployed)) {
					$this->deployed[$deployed[0]][] = array(
						$deployed[1] => $deployed[2]
					);
				} else {
					$this->deployed[$deployed[0]] = array(
						array(
							$deployed[1] => $deployed[2]
						)
					);
				}
			}
		}
	}

	/**
	 * Adds a datasource to the list of deployed data sources
	 *
	 * @access  private
	 * @param   string $datasource The name of the deployed datasource
	 * @param   string $server The virtual name of the server on which the datasource is deployed 
	 * @return  void
	 *
	 */
	private function addDeployedDatasource($datasource, $server) {
		if (isset($this->deployed[$datasource])) {
			$found = false;
			foreach($this->deployed[$datasource] as $deployed) {
				if (array_key_exists($server, $deployed)) {
					$found = true;
					break;
				}
			}
			if (! $found) {
				$this->deployed[$datasource][] = array(
					$server => date("Y-m-d H:i:s")
				);
			}
		} else {
			$this->deployed[$datasource] = array(
				array(
					$server => date("Y-m-d H:i:s")
				)
			);
		}
	}

	/**
	 * Saves the list of deployed data sources
	 *
	 * @access  private
	 * @param   string $deployedFile The name of the file containing this list.
	 * @return  void
	 *
	 */
	private function saveDeployed($deployedFile) {
		$fs = new Filesystem();
		$contents = array();
		foreach($this->deployed as $datasource => $deployment) {
			foreach($deployment as $deployed) {
				foreach($deployed as $server => $date) {
					$contents[] = $datasource . "\t" . $server . "\t" . $date;
				}
			}
		}
		$fs->dumpFile($deployedFile, implode("\n", $contents));
	}

	/**
	 * Saves DataSources.xml for a server
	 *
	 * @access  private
	 * @param   string $server The name of the file containing this list.
	 * @param   string $databasesDir The databases directory.
	 * @return  void
	 *
	 */
	private function saveDataSources($server, $databasesDir) {
		$localDatasources = new \SimpleXMLElement($databasesDir."/DataSources.xml", LIBXML_NOWARNING, true);
		$localDom = dom_import_simplexml($localDatasources)->ownerDocument;
		$localxpath = new \DOMXPath($localDom);
		$deployedDatasources = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><DataSources xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="../../doc/DataSources.xsd"></DataSources>', LIBXML_NOWARNING);
		$deployedDom = dom_import_simplexml($deployedDatasources)->ownerDocument;
		$deployedDatasources = $this->getDOMElementItem($deployedDom->getElementsByTagName("DataSources"), 0);
		$databases = array();
		$dsnum = 0;
		foreach($this->deployed as $datasource => $deployment) {
			$found = false;
			foreach($deployment as $deployed) {
				if (array_key_exists($server, $deployed)) {
					$found = true;
					break;
				}
			}
			if ($found) {
				$localDatasource = $this->getDOMElementItem($localxpath->query("//DataSource[@name='".$datasource."']"), 0);
				$deployedDatasource = $deployedDom->importNode($localDatasource, true);
				$deployedDatasource->setAttribute('id', ++$dsnum);
				if ($localDatasource->hasAttribute('database')) {
					$databases[] = $localDatasource->getAttribute('database');
					$deployedDatasource->setAttribute('database', count($databases));
				}
				$deployedDatasources->appendChild($deployedDatasource);
			}
		}
		$deployedDatabases = $deployedDatasources->appendChild($deployedDom->createElement('Databases'));
		foreach ($databases as $id => $database) {
			$localDatabase = $this->getDOMElementItem($localxpath->query("//Databases/Database[@id='".$database."']"), 0);
			$deployedDatabase = $deployedDom->importNode($localDatabase, true);
			$deployedDatabase->setAttribute('id', $id + 1);
			$deployedDatabases->appendChild($deployedDatabase);
		}
		$deployedDom->preserveWhiteSpace  = false;
		$deployedDom->formatOutput = true;
		$formatted = preg_replace_callback('/^( +)</m', function($a) { 
			return str_repeat("\t", intval(strlen($a[1]) / 2)).'<'; 
		}, $deployedDom->saveXML(null, LIBXML_NOEMPTYTAG));
		$fs = new Filesystem();
		if ($fs->exists($databasesDir."/deployment/".$server)) {
			$fs->mkdir($databasesDir."/deployment/".$server);
		}
		$fs->dumpFile($databasesDir."/deployment/".$server."/DataSources.xml", $formatted);
	}

	/**
	 * Retuns the DOMElement at position $index of the DOMNodeList
	 *
	 * @access  private
	 * @param   \DOMNodeList $nodes The DOMNodeList
	 * @param   int $index The position in the DOMNodeList
	 * @return  \DOMElement|null The DOMElement.
	 *
	 */
	private function getDOMElementItem(\DOMNodeList $nodes, $index) {
		$node = $nodes->item($index);
		if ($node && $node->nodeType === XML_ELEMENT_NODE) {
			return $node;
		}
		return null;
	}

	/**
	 * Retrieves imported css in a css file.
	 *
	 * @access  private
	 * @param   string $cssFileName The name of the css file.
	 * @return  array  The imported css file names.
	 *
	 */
	private function getImportedCSS($cssFileName) {
		$imported = array();
		$css = file_get_contents($cssFileName);
		if (preg_match_all("|@import\s+'([^']+)'|", $css, $matches) > 0) {
			$imported = array_merge($imported, $matches[1]);
		} elseif (preg_match_all('|@import\s+"([^"]+)"|', $css, $matches) > 0) {
			$imported = array_merge($imported, $matches[1]);
		} elseif (preg_match_all("|@import\s+url\(([^\)]+)\)|", $css, $matches) > 0) {
			$imported = array_merge($imported, array_filter($matches[1], function ($i) { return !preg_match("|https?:|", $i); }));
		}
		return $imported ;
	}

	/**
	 * Entry point of the service
	 *
	 * Reads the 'deployment' parameter from the parameters.yml file and starts the deployment on all the servers listed under this parameter?
	 * 
	 * The 'deployment' parameter contains one child parameter by server with the following syntax:
	 *
	 * <server name or alias>: <deployment command>
	 * 
	 * The deployment command must contain the placeholder variables:
	 *
	 * - {local.rootdir}
	 * - {local.file}
	 * - {remote.dir} or {remote.file}
	 *
	 * {local.rootdir} is the directory where this instance of G6K is installed
	 *
	 * {local.file} is the path relative to {local.rootdir} and the file name of a file to be deployed
	 *
	 * {remote.dir} is the path (without the file name) relative to the install directory of G6K in remote server of a file to be deployed
	 *
	 * {remote.file} is the path relative to the install directory of G6K in remote server of a file to be deployed
	 *
	 * Some examples :
	 * 
	 * - front1: rsync -utlgo {local.rootdir}/{local.file} foo@bar:/var/www/html/simulator/{remote.file}
	 * - front2: rcp {local.rootdir}/{local.file} foo@bar:/var/www/html/simulator/{remote.dir}/
	 * - localhost: cp -f {local.rootdir}/{local.file} /var/www/html/simulator/{remote.dir}/
	 *
	 * @access  public
	 * @param   \App\G6K\Model\Simulator $simu The simulator to deploy
	 * @return  array The result of the deployment
	 *
	 */
	public function deploy(Simulator $simu){
		$this->output = array();
		$this->importedCSS = array();
		try {
			$store = new SemaphoreStore();
		} catch (\Exception $ex) {
			$store = new FlockStore(sys_get_temp_dir());
		}
		$factory = new Factory($store);
		$this->lock = $factory->createLock('g6k.deployment.lock');
		if (!$this->lock->acquire()) {
			$this->output[] = $this->translator->trans('A deployment is in progress');
			$this->output[] = '&nbsp;';
			$this->output[] = $this->translator->trans('Please, try later ...');
			return $this->output;
		}
		$deployment = $this->kernel->getContainer()->getParameter('deployment');
		$databasesDir = $this->kernel->getProjectDir().'/var/data/databases';
		$localRootDir = dirname($this->kernel->getRootDir());
		$publicDir = $this->kernel->getContainer()->getParameter('public_dir') ?? 'public';
		$this->loadDeployed($databasesDir . "/deployment/deployed-datasources.txt");
		$finder = new Finder();
		$finder->name($simu->getName().'.css')->in($this->kernel->getProjectDir() . '/' . $publicDir)->exclude('admin')->exclude('base')->exclude('bundles');
		foreach ($deployment as $server => $command){
			$this->output[] = '<h4>' . $this->translator->trans('Deployment on the server « %server% »', array( '%server%' => $server)) . '</h4>';
			$internalDB = array();
			$usingDatasource = false;
			foreach($simu->getSources() as $source){
				$datasourceName = $source->getDataSource();
				$datasource = $simu->getDatasourceByName($datasourceName);
				$type = $datasource->getType();
				if($type == "internal"){
					$databaseId = $datasource->getDatabase();
					$database = $simu->getDatabaseById($databaseId);
					if($database->getType() == "sqlite"){
						$internalDB[] = $database->getName();
					}
				}
				$this->addDeployedDatasource($datasourceName, $server);
				$usingDatasource = true;
			}
			foreach(array_unique($internalDB) as $db) {
				$this->output[] = '<h5>' . $this->translator->trans('Copy the file « %file% » with the command:', array( '%file%' => $db)) . '</h5>';
				$localFile = $remoteFile = 'var/data/databases/'.$db;
				$this->doDeploy($localRootDir, $localFile, $remoteFile, $command);
			}
			$this->output[] = '<h5>' . $this->translator->trans('Copy the file « %file% » with the command:', array( '%file%' => $simu->getName().'.xml')) . '</h5>';
			$localFile = $remoteFile = 'var/data/simulators/'.$simu->getName().'.xml';
			$this->doDeploy($localRootDir, $localFile, $remoteFile, $command);
			if ($usingDatasource) {
				$this->saveDataSources($server, $databasesDir);
				$this->output[] = '<h5>' . $this->translator->trans('Copy the file « %file% » with the command:', array( '%file%' => 'DataSources.xml')) . '</h5>';
				$localFile = 'var/data/databases/deployment/'.$server.'/DataSources.xml';
				$remoteFile = 'var/data/databases/DataSources.xml';
				$this->doDeploy($localRootDir, $localFile, $remoteFile, $command);
			}
			foreach ($finder as $file) {
				$pathname = str_replace('\\', '/', $file->getRelativePathname());
				$relativePath = str_replace('\\', '/', $file->getRelativePath());
				$cssFiles = $this->getImportedCSS($file->getRealPath());
				foreach($cssFiles as $cssFile) {
					if (! in_array($relativePath.'/'.$cssFile, $this->importedCSS)) {
						$this->output[] = '<h5>' . $this->translator->trans('Copy the file « %file% » with the command:', array( '%file%' => $relativePath.'/'.$cssFile)) . '</h5>';
						$localFile = $remoteFile = $publicDir.'/'.$relativePath.'/'.$cssFile;
						$this->doDeploy($localRootDir, $localFile, $remoteFile, $command);
						$this->importedCSS[] = $relativePath.'/'.$cssFile;
					}
				}
				$this->output[] = '<h5>' . $this->translator->trans('Copy the file « %file% » with the command:', array( '%file%' => $pathname)) . '</h5>';
				$localFile = $remoteFile = $publicDir.'/'.$pathname;
				$this->doDeploy($localRootDir, $localFile, $remoteFile, $command);  
			}
		}
		$this->saveDeployed($databasesDir . "/deployment/deployed-datasources.txt");
		$this->lock->release();
		return $this->output;
	}
}

?>
