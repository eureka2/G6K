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

namespace App\G6K\Manager;

use Symfony\Component\BrowserKit\AbstractBrowser as BaseClient;
use Symfony\Component\BrowserKit\Response;

/**
 *
 * This class provides access to a local or remote http server with a URL as a browser does
 *
 * @copyright Jacques Archimède
 *
 */
class DOMClient extends BaseClient {

	/**
	 * @var array      $httpserver The server parameters (equivalent of $_SERVER)
	 *
	 * @access  private
	 *
	 */
	private $httpserver = array(
		'HTTP_HOST' => "localhost", 
		"HTTP_PORT" => 80,
		"HTTP_ACCEPT" => array(
			"text/xml",
			"application/xml",
			"application/xhtml+xml",
			"application/json",
			"text/javascript",
			"text/html",
			"text/plain",
			"image/png",
			"image/jpeg",
			"image/gif",
			"*/*;q=0.01"
		),
		"HTTP_ACCEPT_ENCODING" => array(
			"gzip", "deflate", "br"
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

	/**
	 * @var array      $parameters The request parameters
	 *
	 * @access  private
	 *
	 */
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

	/**
	 * Constructor of class DOMClient
	 *
	 * @access  public
	 * @param   array $server (default: array() The server parameters
	 * @return  void
	 *
	 */
	public function __construct($server = array()) {
		parent::__construct(array_merge($this->httpserver, $server));
	}

	/**
	 * Returns an instance of this class as a client to access a local or remote server.
	 *
	 * @access  public
	 * @static 
	 * @param   array $server (default: array() The server parameters
	 * @return  \App\G6K\Manager\DOMClient The instance of this class
	 *
	 */
	public static function createClient($server = array()) {
		return new DOMClient($server);
	}

	/**
	 * Calls a URI and returns a Crawler object to navigate in a list of \DOMNode objects.
	 *
	 * @access  public
	 * @param   string $method The HTTP request method (GET or POST)
	 * @param   string $uri The URI to fetch
	 * @param   array $parameters (default: array()) The Request parameters
	 * @param   array $files (default: array()) An array of uploaded files
	 * @param   array $server (default: array()) An array of server parameters
	 * @param   string|null $content (default: null) The raw body data
	 * @param   bool $changeHistory (default: true) Whether to update the history or not (only used internally for back(), forward(), and reload())
	 * @return  \Symfony\Component\DomCrawler\Crawler|string The Crawler object or the Response content
	 *
	 */
	public function request(string $method, string $uri, array $parameters = array(), array $files = array(), array $server = array(), string $content = null, bool $changeHistory = true) {
		$parameters = array_merge($this->parameters, $parameters);
		$crawler = parent::request($method, $uri, $parameters, $files, $server, $content, $changeHistory);
		if ($crawler->getNode(0) === null) {
			return $this->response->getContent();
		} else {
			return $crawler;
		}
	}

	/**
	 * Calls a URI with the GET request method and returns a Crawler object to navigate in a list of \DOMNode objects.
	 *
	 * @access  public
	 * @param   string $uri The URI to fetch
	 * @param   array $headers (default: array() The headers of the request
	 * @return  \Symfony\Component\DomCrawler\Crawler|string The Crawler object or the Response content
	 *
	 */
	public function get($uri, $headers = array()) {
		return $this->request("GET", $uri, array(), array(), $headers);
	}

	/**
	 * Calls a URI with the POST request method and returns a Crawler object to navigate in a list of \DOMNode objects.
	 *
	 * @access  public
	 * @param   string $uri The URI to fetch
	 * @param   array $headers The headers of the request
	 * @param   array $data The data to post
	 * @return  \Symfony\Component\DomCrawler\Crawler|string The Crawler object or the Response content
	 *
	 */
	public function post($uri, $headers = array(), $data = array()) {
		return $this->request("POST", $uri, array(), array(), $headers, http_build_query($data));
	}

	/**
	 * Executes the request
	 *
	 * @access  protected
	 * @param   object $request The request instance
	 * @return  \Symfony\Component\BrowserKit\Response The response of the server
	 *
	 */
	protected function doRequest($request) {
		$urlParts = parse_url($request->getUri());
		$scheme = $urlParts['scheme'];
		$path = isset($urlParts['path']) ? $urlParts['path'] : '';
		$query = isset($urlParts['query']) ? $urlParts['query'] : '';
		if ($urlParts['host'] == getenv('HTTP_HOST') && 
			$query == '' &&
			file_exists(getenv('DOCUMENT_ROOT') . $path)) {
			return $this->doLocalRequest($request, $path);
		} else {
			return $this->doRemoteRequest($request, $scheme);
		}
	}

	/**
	 * Executes the request to the remote server
	 *
	 * @access  private
	 * @param   object $request The request instance
	 * @param   string $scheme The scheme (http or https) of the request
	 * @return  \Symfony\Component\BrowserKit\Response The response of the server
	 *
	 */
	private function doRemoteRequest($request, $scheme) {
		$server = $request->getServer();
		$proxy = $scheme == 'https' ? $server['HTTPS_PROXY']['proxy'] : $server['HTTP_PROXY']['proxy'];
		$content = $request->getContent();
		$contentLength = $content === null ? 0 : strlen($content);
		if ($proxy) {
			$ctxConfig = [
				'http' => [
					'method' => $request->getMethod(),
					'header'  => $this->makeRequestHeader($request, $contentLength),
					'proxy' => 'tcp://' . $proxy ,
					'request_fulluri' => true
				]
			];
		} else {
			$ctxConfig = [
				'http' => [
					'method' => $request->getMethod(),
					'header'  => $this->makeRequestHeader($request, $contentLength)
				]
			];
		}
		if ($contentLength > 0) {
			$ctxConfig['http']['content'] = $content;
		}
		if ( $scheme == 'https') {
			$sniServer = parse_url($request->getUri(), PHP_URL_HOST);
			$ctxConfig['ssl'] = array( 
				'SNI_enabled' => true,
				'SNI_server_name' => $sniServer
			);
		}
		stream_context_set_default($ctxConfig);
		$headers = array();
		$status = '500';
		$content = "";
		$responseHeaders = get_headers($request->getUri());
		if (isset($responseHeaders)) {
			$status = array_shift($responseHeaders);
			if (preg_match("/^HTTP\/1\.[01] (\d+)/", $status, $m)) {
				$status = $m[1];
			} else {
				$status = '500';
			}
			foreach($responseHeaders as $h) {
				if (preg_match("/^([^\:]+):\s*(.+)$/", $h, $m)) {
					$headers[strtolower(trim($m[1]))] = trim($m[2]);
				}
			}
		}
		if ($status == '200') {
			$context = stream_context_create($ctxConfig);
			$content = file_get_contents($request->getUri(), false, $context);
			if (isset($headers['transfer-encoding']) && $headers['transfer-encoding'] == 'chunked') {
				$content = $this->decodeChunked($content);
			}
			if (isset($headers['content-encoding']) && $headers['content-encoding'] == 'gzip') {
				$content = substr($content, 10); // See http://www.php.net/manual/en/function.gzencode.php
				$content = gzinflate($content);
			}
		}
		return new Response($content, (int)$status, $headers);
	}

	/**
	 * Executes the request to the local server
	 *
	 * @access  private
	 * @param   object $request The request instance
	 * @param   string $path The path of the uri resource relatively to the DOCUMENT_ROOT
	 * @return  \Symfony\Component\BrowserKit\Response The response of the server
	 *
	 */
	private function doLocalRequest($request, $path) {
		try {
			$file = getenv('DOCUMENT_ROOT') . $path;
			$content = file_get_contents($file);
			$headers = array(
				'Date' => gmdate('D, d M Y H:i:s', time()).' GMT',
				'Content-Type' => mime_content_type($file),
				'Connection' => 'close',
				'Access-Control-Allow-Origin' => '*',
				'Cache-Control' => 'max-age=86400'
			);
			return new Response($content, 200, $headers);
		} catch (\Exception $e) {
			return new Response($e->getMessage(), 500, array());
		}
	}

	/**
	 * Decodes a chunked content
	 *
	 * @access  private
	 * @param   string $chunked The chunked content
	 * @return  string The decoded content
	 *
	 */
	private function decodeChunked($chunked) {
		for ($decoded = ''; !empty($chunked); $chunked = trim($chunked)) {
			$pos = strpos($chunked, "\r\n");
			$len = hexdec(substr($chunked, 0, $pos));
			$decoded.= substr($chunked, $pos + 2, $len);
			$chunked = substr($chunked, $pos + 2 + $len);
		}
		return $decoded;
	}

	private function makeRequestHeader($request, $contentLength = 0) {
		$server = $request->getServer();
		$protocol = getenv('HTTPS') !== null && getenv('HTTPS') != '' ? 'https' : 'http';
		$origin = $protocol.'://'. getenv('HTTP_HOST');
		$referer = $origin . getenv('REQUEST_URI');
		$header = [];
		$header[] = 'Origin: ' . $origin;
		$header[] = 'Referer: ' . $referer;
		$header[] = "Cache-Control: no-cache";
		$header[] = 'Host: '. parse_url($request->getUri(), PHP_URL_HOST);
		foreach ($server as $key => $value) {
			if (preg_match("/^HTTP_(.*)$/", $key, $match)) {
				if (is_array($value)) {
					$value = implode(",", $value);
				}
				if (!in_array($match[1], ['HOST', 'PORT','PROXY']) && $value != '') {
					$parts = array_map(function($part) {
						return ucfirst(strtolower($part));
					}, explode("_", $match[1]));
					$name = implode("-", $parts);
					$header[] = $name . ": " . $value;
				}
			}
		}
		if ($contentLength > 0) {
			$header[] = 'Content-Type: application/x-www-form-urlencoded';
			$header[] = 'Content-Length: ' . $contentLength;
		}
		return $header;
	}

	/**
	 * Makes a socket adress for a remote server
	 *
	 * @access  public
	 * @param   array $server The server parameters
	 * @return  string The socket adress
	 *
	 */
	public function makeRemote($server) {
		$host = $server['HTTP_HOST'];
		if (!preg_match("/:\d+$/", $host)) {
			$port = $server['HTTPS'] ? "443" : "80";
			$host = $host . ":" . $port;
		}
		$transport = $server['HTTPS'] ? "ssl" : "tcp";
		return $transport . '://' . $host;
	}

	/**
	 * Returns the path part of an uri.
	 *
	 * @access  public
	 * @param   string $uri The uri
	 * @return  string The path part of the uri
	 *
	 */
	public function getPath($uri) {
		$path = parse_url($uri, PHP_URL_PATH);
		$query = parse_url($uri, PHP_URL_QUERY);
		if ($query !== null) {
			$path .= '?' . $query;
		}
		return $path;
	}

	/**
	 * Encodes data to be usable in an url or a html form.
	 *
	 * @access  public
	 * @param   array|string $data The data to be encoded
	 * @return  string The encoded data
	 *
	 */
	public function encodeData($data) {
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

	/**
	 * Generates a random cryptographic nonce
	 *
	 * @access  public
	 * @param   int $bits (default: 256) The number of bits of the nonce
	 * @return  string The cryptographic nonce
	 *
	 */
	public function randomNonce($bits = 256) {
		$bytes = ceil($bits / 8);
		$return = '';
		for ($i = 0; $i < $bytes; $i++) {
			$return .= chr(mt_rand(0, 255));
		}
		return hash('sha512', $return);
	}
}
?>
