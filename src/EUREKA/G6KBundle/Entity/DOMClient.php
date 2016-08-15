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
			'proxy' => "192.168.50.12:8080", // e.g   "192.168.50.13:8080",
			'authorization' => "AJ0807AA:ChkuChku5"
		),
		'HTTPS_PROXY' => array(
			'proxy' => "192.168.50.12:8080", // e.g  "192.168.50.12:8080",
			'authorization' => "AJ0807AA:ChkuChku5"
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
 
	public function get($uri) {
		return $this->request("GET", $uri);
	}

	public function post($uri, $data) {
		return $this->request("POST", $uri, array(), array(), array(), $data);
	}

	protected function doRequest($request) {
		$server = $request->getServer();
		$host = $server['HTTP_HOST'];
		$path = $this->getPath($request->getUri());
		$method = $request->getMethod();
		$data = $request->getContent();
		$parameters = $request->getParameters();
		$auth = $parameters['auth'];
		$remote = $this->makeRemote($server);

		$headers = array();
		$proxy = $server['HTTPS'] ? $server['HTTPS_PROXY']['proxy'] : $server['HTTP_PROXY']['proxy'];
		if ($proxy) {
			$headers[] = $method  . " " . $request->getUri() . " HTTP/1.1";
			$headers[] = "Host: $proxy";
		} else {
			$headers[] = "$method $path HTTP/1.1";
			$headers[] = "Host: $host";
		}
		if ($server['HTTP_USER_AGENT']) {
			$headers[] = "User-Agent: {$server['HTTP_USER_AGENT']}";
		}
		if ($server['HTTP_ACCEPT']) {
			$headers[] = "Accept: " . implode(",", $server['HTTP_ACCEPT']);
		}
		if ($server['HTTP_ACCEPT_ENCODING']) {
			$headers[] = "Accept-encoding: " . implode(",", $server['HTTP_ACCEPT_ENCODING']);
		}
		if ($proxy) {
			$pauth = $server['HTTPS'] ? $server['HTTPS_PROXY']['authorization'] : $server['HTTP_PROXY']['authorization'];
			if ($pauth) {
				$headers[] = "Proxy-Authorization: Basic " . base64_encode($pauth);
			}
			$headers[] = "Proxy-Connection: keep-alive";
		}
		if ($auth['type'] == 'basic' && !empty($auth['username'])) {
			$headers[] = "Authorization: Basic " . base64_encode($auth['username'].':'.$auth['password']);
		} elseif ($auth['type'] == 'digest' && !empty($auth['username'])) {
			$req = 'Authorization: Digest ';
			foreach ($auth as $k => $v) {
				if (empty($k) || empty($v)) continue;
				if ($k == 'password') continue;
				$req .= $k.'="'.$v.'", ';
			}
			$headers[] = $req;
		}
		if ($method == "POST" && $data !== null) {
			$data = $this->encode($data);
			$headers[] = 'Content-Type: application/x-www-form-urlencoded';
			$headers[] = 'Content-length: '. strlen($data);
			$headers[] = "Connection: close";
		}
		$context = stream_context_create();
		if ($proxy) {
			stream_context_set_option($context, 'http', 'proxy', "tcp://" . $proxy);
			$pauth = $server['HTTPS'] ? $server['HTTPS_PROXY']['authorization'] : $server['HTTP_PROXY']['authorization'];
			if ($pauth) {
				$pauth = base64_encode($pauth);
				stream_context_set_option($context, 'http', 'header', array("Proxy-Authorization: Basic $pauth"));
			}
			stream_context_set_option($context, 'http', 'request_fulluri', true);
		}
		if ($server['HTTPS']) {
			stream_context_set_option($context, 'ssl', 'verify_host', true);
			if (!empty($parameters['cert'])) {
				stream_context_set_option($context, 'ssl', 'cafile', $parameters['cert']);
				stream_context_set_option($context, 'ssl', 'verify_peer', true);
			} else {
				stream_context_set_option($context, 'ssl', 'allow_self_signed', true);
			}
		}
		$fp = stream_socket_client($remote, $err, $errstr, 30, STREAM_CLIENT_CONNECT, $context);
		if (!$fp) {
			throw new \RuntimeException(sprintf('Request error : %s ==> %s', $err, $errstr));
		}
		stream_set_timeout($fp, $parameters['timeout']);
		fputs($fp, implode("\r\n", $headers));
		fputs($fp, "\r\n\r\n");
		if ($method == "POST" && $data !== null) {
			fputs($fp, $data);
		}

		$headers = array();
		$content = "";
		$status = 200;
		$inHeaders = true;
		$atStart = true;
		while(!feof($fp)) { 
			$line = fgets($fp, 4096);
			if ($atStart) {
				// Deal with first line of returned data
				$atStart = false;
				if (!preg_match('/HTTP\/(\\d\\.\\d)\\s*(\\d+)\\s*(.*)/', $line, $m)) {
					throw new \RuntimeException(sprintf('Status code line invalid : %s', htmlentities($line)));
				}
				$status = $m[2];
				$status_string = $m[3];
			} else if ($inHeaders) {
				if (trim($line) == '') {
					$inHeaders = false;
					if ($parameters['headers']) { // headers only
						break; // Skip the rest of the input
					}
				} else if (preg_match('/([^:]+):\\s*(.*)/', $line, $m)) {
					$key = strtolower(trim($m[1]));
					$val = trim($m[2]);
					// Deal with the possibility of multiple headers of same name
					if (isset($headers[$key])) {
						if (is_array($headers[$key])) {
							$headers[$key][] = $val;
						} else {
							$headers[$key] = array($headers[$key], $val);
						}
					} else {
						$headers[$key] = $val;
					}
				}
			} else {
				// We're not in the headers, so append the line to the contents
				$content .= $line;
			}
		}
		fclose($fp);
		if ($auth['type'] != 'nodigest' && !empty($auth['username']) && $auth['type'] != 'digest' && $status == 401) {
			$authenticate = $headers['www-authenticate'];
			if (!empty($authenticate) && preg_match("/Digest (.*)$/Us", $authenticate, $matches)) {
				foreach (split(",", $matches[1]) as $i) {
					$ii=split("=", trim($i),2);
					if (!empty($ii[1]) && !empty($ii[0])) {
						$auth[$ii[0]] = preg_replace("/^\"/",'', preg_replace("/\"$/",'', $ii[1]));
					}
				}
				$auth['type'] = 'digest';
				$auth['uri'] = 'https://'.$host.$path;
				$auth['cnonce'] = $this->randomNonce();
				$auth['nc'] = 1;
				$a1 = md5($auth['username'].':'.$auth['realm'].':'.$auth['password']);
				$a2 = md5('POST'.':'.$auth['uri']);
				$auth['response']=md5($a1.':'.$auth['nonce'].':'.$auth['nc'].':'.$auth['cnonce'].':'.$auth['qop'].':'.$a2);
				$parameters['auth'] = $auth;
				$newRequest = new Request($request->getUri(), 
					$method, 
					$parameters, 
					$request->getFiles(), 
					$request->getCookies(), 
					$request->getServer(), 
					$request->getContent()
				);
				return $this->doRequest(newRequest);
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