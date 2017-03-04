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

/* Usage :
 * use EUREKA\G6KBundle\Entity\DOMClient as Client;
 *
 * $client = Client::createClient();
 * $crawler = $client->request('GET', $uri);
 * $result = $crawler->getNode(0)->ownerDocument->saveXML();
 */
 
namespace EUREKA\G6KBundle\Entity;

use Symfony\Component\BrowserKit\Client as BaseClient;
use Symfony\Component\BrowserKit\Request;
use Symfony\Component\BrowserKit\Response;

class DOMClient extends BaseClient {

	private $httpserver = array(
		'HTTP_HOST' => "localhost", 
		"HTTP_PORT" => 80,
		"HTTP_ACCEPT" => array(
			"text/xml",
			"application/xml",
			"application/xhtml+xml",
			"text/html",
			"text/plain",
			"image/png",
			"image/jpeg",
			"image/gif",
			"*/*"
		),
		"HTTP_ACCEPT_ENCODING" => array(
			"gzip"
		),
		'HTTP_PROXY' => array(
			'proxy' => "", // e.g   "192.168.50.12:8080",
			'authorization' => "USER:PASSWORD"
		),
		'HTTPS_PROXY' => array(
			'proxy' => "", // e.g  "192.168.50.12:8080",
			'authorization' => "USER:PASSWORD"
		),
	);

	private $parameters = array(
		'headers' => false, // headers only
		'cert' => "", 
		'auth' => array(
			'username' => "",
			'password' => "", 
			'type' => "basic"
		),
		'timeout' => 20
	);

	public function __construct($server = array()) {
		parent::__construct(array_merge($this->httpserver, $server));
	}

	public static function createClient($server = array()) {
		return new DOMClient($server);
	}

	public function request($method, $uri, array $parameters = array(), array $files = array(), array $server = array(), $content = null, $changeHistory = true) {
		$parameters = array_merge($this->parameters, $parameters);
		$crawler = parent::request($method, $uri, $parameters, $files, $server, $content, $changeHistory);
		if ($crawler->getNode(0) === null) {
			return $this->response->getContent();
		} else {
			return $crawler;
		}
	}
 
	public function get($uri, $headers = array()) {
		return $this->request("GET", $uri, array(), array(), $headers);
	}

	public function post($uri, $headers, $data) {
		return $this->request("POST", $uri, array(), array(), $headers, $data);
	}

	protected function doRequest($request) {
		$server = $request->getServer();
		$scheme = parse_url($request->getUri(), PHP_URL_SCHEME);
		$proxy = $scheme == 'https' ? $server['HTTPS_PROXY']['proxy'] : $server['HTTP_PROXY']['proxy'];
		if ($proxy) {
			$ctxConfig = array(
				'http' => array(
					'method' => $request->getMethod(),
					'header'  => 'Content-type: application/x-www-form-urlencoded'."\r\n",
					'content' => $request->getContent(),
					'proxy' => 'tcp://' . $proxy ,
					'request_fulluri' => true
				)
			);
		} else {
			$ctxConfig = array(
				'http' => array(
					'method' => $request->getMethod(),
					'header'  => 'Content-type: application/x-www-form-urlencoded'."\r\n",
					'content' => $request->getContent(),
					'request_fulluri' => true
				)
			);
		}
		if ( $scheme == 'https') {
			$sniServer = parse_url($request->getUri(), PHP_URL_HOST);
			$ctxConfig['ssl'] = array( 
				'SNI_enabled' => true,
				'SNI_server_name' => $sniServer
			);
		}
		$context = stream_context_create($ctxConfig);
		$content = @file_get_contents($request->getUri(), false, $context);
		$headers = array();
		$status = '500';
		if (isset($http_response_header)) {
			$responseHeaders = $http_response_header;
			$status = array_shift($responseHeaders);
			if (preg_match("/^HTTP\/1\.[01] (\d+)/", $status, $m)) {
				$status = $m[1];
			} else {
				$status = '500';
			}
			foreach($responseHeaders as $h) {
				if (preg_match("/^([^\:]+):\s*(.+)$/", $h, $m)) {
					$headers[trim($m[1])] = trim($m[2]);
				}
			}
		}
		if (isset($headers['transfer-encoding']) && $headers['transfer-encoding'] == 'chunked') {
			$content = $this->decodeChunked($content);
		}
		if (isset($headers['content-encoding']) && $headers['content-encoding'] == 'gzip') {
			$content = substr($content, 10); // See http://www.php.net/manual/en/function.gzencode.php
			$content = gzinflate($content);
		}
		return new Response($content, $status, $headers);
	}

	private function decodeChunked($chunked) {
		for ($decoded = ''; !empty($chunked); $chunked = trim($chunked)) {
			$pos = strpos($chunked, "\r\n");
			$len = hexdec(substr($chunked, 0, $pos));
			$decoded.= substr($chunked, $pos + 2, $len);
			$chunked = substr($chunked, $pos + 2 + $len);
		}
		return $decoded;
	}

	private function makeRemote($server) {
		$host = $server['HTTP_HOST'];
		if (!preg_match("/:\d+$/", $host)) {
			$port = $server['HTTPS'] ? "443" : "80";
			$host = $host . ":" . $port;
		}
		$transport = $server['HTTPS'] ? "ssl" : "tcp";
		return $transport . '://' . $host;
	}

	private function getPath($uri) {
		$path = parse_url($uri, PHP_URL_PATH);
		$query = parse_url($uri, PHP_URL_QUERY);
		if ($query !== null) {
			$path .= '?' . $query;
		}
		return $path;
	}

	private function encodeData($data) {
		if (is_array($data))  {
			$encoded = "";
			foreach ($data as $key => $val) {
				if (is_array($val)) {
					foreach ($val as $val2) {
						$encoded .= urlencode($key).'='.urlencode($val2).'&';
					}
				} else {
					$encoded .= urlencode($key).'='.urlencode($val).'&';
				}
			}
			return substr($encoded, 0, -1);
		} else {
			return urlencode($data);
		}
	}

	private function randomNonce($bits = 256) {
		$bytes = ceil($bits / 8);
		$return = '';
		for ($i = 0; $i < $bytes; $i++) {
			$return .= chr(mt_rand(0, 255));
		}
		return hash('sha512', $return);
	}
}
?>