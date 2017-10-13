<?php

/*
The MIT License (MIT)

Copyright (c) 2017 Jacques Archimède

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

namespace EUREKA\G6KBundle\Services;

use Symfony\Component\Process\Process;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Finder\Finder;

/**
 * This class implements a service that performs the deployment of files from a new simulator or modified simulator to all front-end servers described in the entry 'deployment of parameters.yml.
 *
 * @author Jacques Archimède
 * @author Yann Toqué
 */
class Deployer {

	/**
	 * @var \Symfony\Component\HttpKernel\Kernel	  $kernel The Symfony kernel
	 *
	 * @access  private
	 *
	 */
	private $kernel;

	/**
	 * @var array  $output The output of the processes of this service
	 *
	 * @access  private
	 *
	 */
	private $output = array();

	/**
	 * Constructor of class Deployer
	 *
	 * @access  public
	 * @param   \Symfony\Component\HttpKernel\Kernel $kernel The Symfony kernel
	 * @return  void
	 *
	 */
	public function __construct($kernel) {
		$this->kernel = $kernel;  
	}

	/**
	 * Realizes the deployment
	 *
	 * @access  public
	 * @param   string $localRootDir 
	 * @param   string $file 
	 * @param   string $command
	 * @return  void
	 *
	 */
	private function doDeploy($localRootDir, $file, $command){
		if (preg_match("/^rsync/", $command)) {
			$localRootDir = $this->unixify($localRootDir);
		}
		$cmd = str_replace(array('{local.rootdir}', '{file}', '{dir}'), array($localRootDir, $file, dirname($file)), $command);
		$this->output[] = $cmd;
		$process = new Process($cmd);
		$process->run();
		$errorOutput = $process->getErrorOutput();
		if ($errorOutput != '') {
			$this->output[] = 'Error : ' . $errorOutput;
		}
		if (!$process->isSuccessful()) {
			throw new ProcessFailedException($process);
		} 
	}


	/**
	 * Transforms a Windows path in a Unix path for a 'rsync' command
	 *
	 * @access  public
	 * @param   string $localRootDir The transformed path
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
	 * - {file}
	 *
	 * and can contains the placeholder variable : {dir}
	 *
	 * {local.rootdir} is the directory where this instance of G6K is installed
	 *
	 * {file} is the path relative to {local.rootdir} and the file name of a file to be deployed
	 *
	 * {dir} is the path relative to {local.rootdir} (without the file name) of a file to be deployed
	 *
	 * Some examples :
	 * 
	 * - front1: rsync -utlgo {local.rootdir}/{file} foo@bar:/var/www/html/simulator/{dir}/
	 * - front2: rcp {local.rootdir}/{file} foo@bar:/var/www/html/simulator/{dir}/
	 * - localhost: cp -f {local.rootdir}/{file} /var/www/html/simulator/{dir}/
	 *
	 * @access  public
	 * @param   \EUREKA\G6KBundle\Entity\Simulator $simu The simulator to deploy
	 * @return  array The result of the deployment
	 *
	 */
	public function deploy($simu){
		$deployment = $this->kernel->getContainer()->getParameter('deployment');
		$resourcesDir = $this->kernel->locateResource('@EUREKAG6KBundle/Resources');
		$localRootDir = dirname($this->kernel->getRootDir());
		$finder = new Finder();
		$finder->name($simu->getName().'.css')->in($resourcesDir . '/public')->exclude('admin')->exclude('base');
		foreach ($deployment as $server => $command){
			foreach($simu->getSources() as $source){
				$datasourceName = $source->getDataSource();
				$datasource = $simu->getDatasourceByName($datasourceName);
				$type = $datasource->getType();
				if($type == "internal"){
					$databaseId = $datasource->getDatabase();
					$database = $simu->getDatabaseById($databaseId);
					if($database->getType() == "sqlite"){
						$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/data/databases/'.$database->getName(), $command);
					}
				}
			}
			$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/data/simulators/'.$simu->getName().'.xml', $command);
			$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/data/databases/DataSources.xml', $command);
			foreach ($finder as $file) {
				$pathname = str_replace('\\', '/', $file->getRelativePathname());
				$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/public/'.$pathname, $command);  
			}
		}
		return $this->output;
	}
}

?>
