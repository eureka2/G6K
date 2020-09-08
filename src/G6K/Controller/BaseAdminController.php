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

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\HttpKernel\KernelInterface;
use App\Security\UserManagerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use App\G6K\Services\FileUploader;
use App\G6K\Services\Deployer;

use Symfony\Component\HttpFoundation\Response;

/**
 *
 * Base class for all the admin module controllers
 *
 * @author Jacques Archimède
 *
 */
class BaseAdminController extends AbstractController {

	protected $projectDir;
	protected $translator;
	protected $kernel;
	protected $userManager;
	protected $authorizationChecker;
	protected $fileUploader;
	protected $deployer;

	/**
	 * @var string      $databasesDir Databases directory
	 *
	 * @access  public
	 *
	 */
	public $databasesDir;

	/**
	 * @var string      $simulatorsDir Simulators directory
	 *
	 * @access  public
	 *
	 */
	public $simulatorsDir;

	/**
	 * @var string      $publicDir public directory
	 *
	 * @access  public
	 *
	 */
	public $publicDir;

	/**
	 * @var string      $viewsDir Templates directory
	 *
	 * @access  public
	 *
	 */
	public $viewsDir;

	public function __construct(TranslatorInterface $translator, KernelInterface $kernel, AuthorizationCheckerInterface $authorizationChecker, UserManagerInterface $userManager, FileUploader $fileUploader, Deployer $deployer, $projectDir) {
		$this->projectDir = $projectDir;
		$this->userManager = $userManager;
		$this->kernel = $kernel;
		$this->authorizationChecker = $authorizationChecker;
		$this->translator = $translator;
		$this->fileUploader = $fileUploader;
		$this->deployer = $deployer;
	}

	/**
	 * Returns a JSON response formed with the data of a form and an error message.
	 *
	 * @access  protected
	 * @param   array $form The form fields
	 * @param   string $error The error message
	 * @return  \Symfony\Component\HttpFoundation\Response <description of the return value>
	 *
	 */
	protected function errorResponse($form, $error)	{
		$form['error'] = $error;
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;
	}

	/**
	 * Zip file creation function.
	 * Makes zip files. Derivated from PhpMyAdmin package
	 * The $contents parameter is an array of associative array where keys are :
	 * - name: name of the zip
	 * - modtime: modification time
	 * - data: data to compress
	 *
	 * @access  protected
	 * @param   array $contents The array of contents to be compressed
	 * @see     Official ZIP file format: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
	 */
	protected function zip($contents) {
		$datasec = array();
		$ctrl_dir = array();
		$eof_ctrl_dir = "\x50\x4b\x05\x06\x00\x00\x00\x00";
		$old_offset = 0;
		foreach($contents as $content) {
			$data = $content['data'];
			$modtime = isset($content['modtime']) ? $content['modtime'] : time();
			$name = str_replace('\\', '/', $content['name']);
			$hexdtime = pack('V', $this->unix2DosTime($modtime));
			$fr = "\x50\x4b\x03\x04";
			$fr .= "\x14\x00"; // ver needed to extract
			$fr .= "\x00\x00"; // gen purpose bit flag
			$fr .= "\x08\x00"; // compression method
			$fr .= $hexdtime; // last mod time and date
			// "local file header" segment
			$unc_len = strlen($data);
			$crc     = crc32($data);
			$zdata   = gzcompress($data);
			$zdata   = substr(substr($zdata, 0, strlen($zdata) - 4), 2); // fix crc bug
			$c_len   = strlen($zdata);
			$fr .= pack('V', $crc); // crc32
			$fr .= pack('V', $c_len); // compressed filesize
			$fr .= pack('V', $unc_len); // uncompressed filesize
			$fr .= pack('v', strlen($name)); // length of filename
			$fr .= pack('v', 0); // extra field length
			$fr .= $name;
			// "file data" segment
			$fr .= $zdata;
			// echo this entry on the fly, ...
			$datasec[] = $fr;
			// now add to central directory record
			$cdrec = "\x50\x4b\x01\x02";
			$cdrec .= "\x00\x00"; // version made by
			$cdrec .= "\x14\x00"; // version needed to extract
			$cdrec .= "\x00\x00"; // gen purpose bit flag
			$cdrec .= "\x08\x00"; // compression method
			$cdrec .= $hexdtime; // last mod time & date
			$cdrec .= pack('V', $crc); // crc32
			$cdrec .= pack('V', $c_len); // compressed filesize
			$cdrec .= pack('V', $unc_len); // uncompressed filesize
			$cdrec .= pack('v', strlen($name)); // length of filename
			$cdrec .= pack('v', 0); // extra field length
			$cdrec .= pack('v', 0); // file comment length
			$cdrec .= pack('v', 0); // disk number start
			$cdrec .= pack('v', 0); // internal file attributes
			$cdrec .= pack('V', 32); // external file attributes
			// - 'archive' bit set
			$cdrec .= pack('V', $old_offset); // relative offset of local header
			$old_offset += strlen($fr);
			$cdrec .= $name;
			// optional extra field, file comment goes here
			// save to central directory
			$ctrl_dir[] = $cdrec;
		}
		$ctrldir = implode('', $ctrl_dir);
		$header  = $ctrldir .
			$eof_ctrl_dir .
			pack('v', sizeof($ctrl_dir)) . //total #of entries "on this disk"
			pack('v', sizeof($ctrl_dir)) . //total #of entries overall
			pack('V', strlen($ctrldir)) . //size of central dir
			pack('V', $old_offset) . //offset to start of central dir
			"\x00\x00"; //.zip file comment length
		// Return entire ZIP archive as string
		return implode('', $datasec) . $header;
	}

	/**
	 * Converts unix time to MS DOS time
	 *
	 * @access  protected
	 * @param   int $unixtime (default: 0) The unix time
	 * @return  int The MS DOS time
	 *
	 */
	protected function unix2DosTime($unixtime = 0) {
		$timearray = ($unixtime == 0) ? getdate() : getdate($unixtime);
		if ($timearray['year'] < 1980) {
			$timearray['year']    = 1980;
			$timearray['mon']     = 1;
			$timearray['mday']    = 1;
			$timearray['hours']   = 0;
			$timearray['minutes'] = 0;
			$timearray['seconds'] = 0;
		}
		return (($timearray['year'] - 1980) << 25)
			| ($timearray['mon'] << 21)
			| ($timearray['mday'] << 16)
			| ($timearray['hours'] << 11)
			| ($timearray['minutes'] << 5)
			| ($timearray['seconds'] >> 1);
	}

}

?>
