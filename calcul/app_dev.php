<?php

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Debug\Debug;

$loader = require_once __DIR__.'/../app/bootstrap.php.cache';
Debug::enable();

require_once __DIR__.'/../app/AppKernel.php';

$request = Request::createFromGlobals();

$clientIp = $request->getClientIp();
$authorizedHosts = ['127.0.0.1', 'fe80::1', '::1', 'localhost', 'yourIpAddress'];
if (! (in_array($clientIp, $authorizedHosts) || php_sapi_name() === 'cli-server')) {
	$response = new Response(
		"Forbidden",
		Response::HTTP_FORBIDDEN,
		array('content-type' => 'text/html')
	);
	$response->send();
	exit();
}

$kernel = new AppKernel('dev', true);
$kernel->loadClassCache();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
