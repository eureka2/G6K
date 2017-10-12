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
	 * @var \Symfony\Component\HttpKernel\Kernel      $kernel The Symfony kernel
	 *
	 * @access  private
	 *
	 */
	private $kernel;

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
		$process = new Process($cmd);
		$process->run();
		if (!$process->isSuccessful()) {
			throw new ProcessFailedException($process);
		} 
	}

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
	 * @access  public
	 * @param   string $simu The name of the simulator to deploy
	 * @return  void
	 *
	 */
	public function deploy($simu){
		$deployment = $this->kernel->getContainer()->getParameter('deployment');
		$resourcesDir = $this->kernel->locateResource('@EUREKAG6KBundle/Resources');
		$localRootDir = dirname($this->kernel->getRootDir());
		$finder = new Finder();
		$finder->name($simu.'.css')->in($resourcesDir . '/public')->exclude('admin')->exclude('base');
		foreach ($deployment as $server => $command) {
			$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/data/databases/'.$simu.'.db', $command);
			$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/data/simulators/'.$simu.'.xml', $command);
			$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/data/databases/DataSources.xml', $command);
			foreach ($finder as $file) {
				$pathname = str_replace('\\', '/', $file->getRelativePathname());
				$this->doDeploy($localRootDir, 'src/EUREKA/G6KBundle/Resources/public/'.$pathname, $command);  
			}
		}
	}
}

?>
