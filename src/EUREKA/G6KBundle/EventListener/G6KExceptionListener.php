<?php

namespace EUREKA\G6KBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\HttpFoundation\Request;

class G6KExceptionListener
{
	protected $domainview;
	protected $viewsDir;

	public function __construct(Kernel $kernel) {
		$this->domainview = $kernel->getContainer()->getParameter('domainview');
		$this->viewsDir = $kernel->locateResource('@EUREKAG6KBundle/Resources/views');
	}

	public function onKernelException(GetResponseForExceptionEvent $event) {
		$request = $event->getRequest();
		$exception = $event->getException();
		$route = $request->get("_route");
		if ($route == 'eureka_g6k_api') {
			$response = $this->jsonResponse($request, $exception);
		} elseif (preg_match("/^eureka_g6k_admin/", $route)) {
			$response = $this->htmlResponse($request, $exception, true);
		} else {
			$response = $this->htmlResponse($request, $exception);
		}
		$event->setResponse($response);
	}

	protected function htmlResponse(Request $request, \Exception $exception, $admin = false) {
		if ($admin) {
			$view = 'admin';
		} else {
			$domain = $request->getHost();
			$view = $request->get("view", "");
			if ($view == "") {
				foreach ($this->domainview as $d => $v) {
					if (preg_match("/".$d."$/", $domain)) {
						$view = $v;
						break;
					}
				}
				if ($view == "") {
					$view = "Default";
				}
			}
		}
		$fsloader = new FileSystemLoader(
			array(
				$this->viewsDir . '/' . $view . '/layout',
				$this->viewsDir
			)
		);
		$aloader = new \Twig_Loader_Array(array(
			'error.html.twig' => '{% extends "pagelayout.html.twig" %}{% block content %}Error : {{ message }} with code : {{ code }}{% endblock %}',
		));
		$loader = new \Twig_Loader_Chain(array($fsloader, $aloader));
		$twig = new \Twig_Environment($loader);
		$twig->addFunction(new \Twig_SimpleFunction('asset', function ($asset) use ($request) {
			return sprintf($request->getBaseUrl().'/%s', ltrim($asset, '/'));
		}));
		$twig->registerUndefinedFunctionCallback(function ($name) {
			return new \Twig_SimpleFunction($name, function() {
				return null;
			});
		});
		$twig->registerUndefinedFilterCallback(function ($name) {
			if (function_exists($name)) {
				return new \Twig_Filter_Function($name);
			}
			return new \Twig_Filter_Function(function () {
				return null;
			});
		});
		$response = new Response();
		$response->setContent(
			$twig->render(
				'error.html.twig', 
				array(
					'message' => $exception->getMessage(),
					'code' => $exception->getCode()
				)
			)
		);

		if ($exception instanceof HttpExceptionInterface) {
			$response->setStatusCode($exception->getStatusCode());
			$response->headers->replace($exception->getHeaders());
		} else {
			$response->setStatusCode(Response::HTTP_INTERNAL_SERVER_ERROR);
		}
		return $response;
	}

	protected function jsonResponse(Request $request, \Exception $exception) {
		$simu = $request->get("simu", "");
		$errors = array();
		$errors[] = array(
			'status' => "" . Response::HTTP_UNPROCESSABLE_ENTITY,
			'title' => "Unprocessable entity",
			'detail' => $exception->getMessage(),
			'source' => array(
				'pointer' => "/data/" . $simu
			)
		);
		$self = $request->getSchemeAndHttpHost() . $request->getBasePath() . $request->getPathInfo() . '?' . $request->getQueryString();
		$response = new Response();
		$response->headers->set('Content-Type', 'application/json');
		$response->setContent(
			json_encode(array(
					'links' => array(
						'self' => $self,
					),
					'errors' => $errors
				)
			)
		);
		$response->setStatusCode(Response::HTTP_UNPROCESSABLE_ENTITY);
		return $response;
	}
}

?>
