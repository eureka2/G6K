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

class BaseAdminController extends Controller {

	public $helper;

	protected function errorResponse($form, $error)	{
		$form['error'] = $error;
		$response = new Response();
		$response->setContent(json_encode($form));
		$response->headers->set('Content-Type', 'application/json');
		return $response;	
	}

	protected function parseDate($format, $dateStr) {
		if (empty($dateStr)) {
			return null;
		}
		$date = \DateTime::createFromFormat($format, $dateStr);
		$errors = \DateTime::getLastErrors();
		if ($errors['error_count'] > 0) {
			throw new \Exception("Error on date '$dateStr', expected format '$format' : " . implode(" ", $errors['errors']));
		}
		return $date;
	}

/**
 * Zip file creation function.
 * Makes zip files. Derivated from PhpMyAdmin package
 *
 * @access  protected
 * @see     Official ZIP file format: https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
 */
	protected function zip($contents) {
		$datasec = array();
		$ctrl_dir = array();
		$eof_ctrl_dir = "\x50\x4b\x05\x06\x00\x00\x00\x00";
		$old_offset = 0;
		foreach($contents as $content) {
			$name = $content['name'];
			$data = $content['data'];
			$modtime = isset($content['modtime']) ? $content['modtime'] : time();
			$name = str_replace('\\', '/', $name);
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
		$data = implode('', $datasec);
		return $data . $header;
	}

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
