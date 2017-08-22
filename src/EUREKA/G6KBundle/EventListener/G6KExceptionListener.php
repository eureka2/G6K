<?php

namespace EUREKA\G6KBundle\EventListener;

use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\HttpFoundation\Request;

class G6KExceptionListener
{
	protected $kernel;

	public function __construct(Kernel $kernel) {
		$this->kernel = $kernel;
	}

	public function onKernelException(GetResponseForExceptionEvent $event) {
		$request = $event->getRequest();
		$exception = $event->getException();
		$route = $request->get("_route");
		if ($route == 'eureka_g6k_api') {
			$response = $this->jsonResponse($request, $exception);
		} elseif (preg_match("/^eureka_g6k_admin/", $route)) {
			$response = $this->htmlAdminResponse($request, $exception);
		} else {
			$response = $this->htmlResponse($request, $exception);
		}
		$event->setResponse($response);
	}

	protected function htmlResponse(Request $request, \Exception $exception) {
		$domainview = $this->kernel->getContainer()->getParameter('domainview');
		$viewsDir = $this->kernel->locateResource('@EUREKAG6KBundle/Resources/views');
		$domain = $request->getHost();
		$view = $request->get("view", "");
		if ($view == "") {
			foreach ($domainview as $d => $v) {
				if (preg_match("/".$d."$/", $domain)) {
					$view = $v;
					break;
				}
			}
			if ($view == "") {
				$view = "Default";
			}
		}
		$fsloader = new FileSystemLoader(
			array(
				$viewsDir . '/' . $view . '/layout',
				$viewsDir
			)
		);
		$aloader = new \Twig_Loader_Array(array(
			'error.html.twig' => '{% extends "pagelayout.html.twig" %}{% block content %}<div class="alert alert-danger has-error"><span class="help-block">Error : {{ message }} with code : {{ code }}</span></div>{% endblock %}',
		));
		// use https://github.com/shapecode/twig-string-loader-bundle instead
		$loader = new \Twig_Loader_Chain(array($fsloader, $aloader));
		$twig = new \Twig_Environment($loader);
		$twig->addFunction(new \Twig_SimpleFunction('asset', function ($asset) use ($request) {
			return sprintf($request->getBaseUrl().'/%s', ltrim($asset, '/'));
		}));
		$twig->registerUndefinedFunctionCallback(function ($name) {
			if (function_exists($name)) {
				return new \Twig_Function_Function($name);
			}
			switch ($name) {
				case 'is_granted':
					return new \Twig_SimpleFunction($name, function($arg) {
						return true;
					});
				case 'path':
					return new \Twig_SimpleFunction($name, function($arg) {
						error_log("path fonction args: " . $arg);
						return null;
					});
				default:
					return new \Twig_SimpleFunction($name, function($arg) {
						error_log(" fonction args: " . $arg);
						return null;
					});
			}
		});
		$twig->registerUndefinedFilterCallback(function ($name) use ($request) {
			if (function_exists($name)) {
				return new \Twig_Filter_Function($name);
			}
			switch ($name) {
				case 'trans':
					return new \Twig_Filter_Function(function ($arg) use ($request) {
						return $arg;
					});
				case 'jscode':
					return new \Twig_Filter_Function(function ($arg) {
						return $arg;
					});
				default:
					return new \Twig_Filter_Function(function ($arg) {
						return null;
					});
			}
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

	protected function htmlAdminResponse(Request $request, \Exception $exception) {
		$twig = $this->kernel->getContainer()->get('templating');
		$response = new Response();
		$response->setContent(
			$twig->render(
				'EUREKAG6KBundle:admin/pages:exception.html.twig',
				array(
					'message' => $this->trace($exception),
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

	protected function trace(\Exception $e, $seen = null) {
		$starter = $seen ? 'Caused by: ' : '';
		$result = array();
		if (!$seen) $seen = array();
		$trace  = $e->getTrace();
		$prev   = $e->getPrevious();
		$result[] = sprintf('%s%s: %s', $starter, get_class($e), $e->getMessage());
		$file = $e->getFile();
		$line = $e->getLine();
		while (true) {
			$current = "$file:$line";
			if (is_array($seen) && in_array($current, $seen)) {
				$result[] = sprintf(' ... %d more', count($trace)+1);
				break;
			}
			$result[] = sprintf(' at %s%s%s(%s%s%s)',
				count($trace) && array_key_exists('class', $trace[0]) ? str_replace('\\', '.', $trace[0]['class']) : '',
				count($trace) && array_key_exists('class', $trace[0]) && array_key_exists('function', $trace[0]) ? '.' : '',
				count($trace) && array_key_exists('function', $trace[0]) ? str_replace('\\', '.', $trace[0]['function']) : '(main)',
				$line === null ? $file : basename($file),
				$line === null ? '' : ':',
				$line === null ? '' : $line);
			if (is_array($seen))
				$seen[] = "$file:$line";
			if (!count($trace))
				break;
			$file = array_key_exists('file', $trace[0]) ? $trace[0]['file'] : 'Unknown Source';
			$line = array_key_exists('file', $trace[0]) && array_key_exists('line', $trace[0]) && $trace[0]['line'] ? $trace[0]['line'] : null;
			array_shift($trace);
		}
		$result = join("<br>", $result);
		if ($prev)
			$result  .= "<br>" . $this->trace($prev, $seen);
		return $result;
}
}

?>
